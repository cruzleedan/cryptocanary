import { Injectable, ErrorHandler } from '@angular/core';
import { BehaviorSubject, of, Observable, Subject } from 'rxjs';
import { User } from '../models/user.model';
import { distinctUntilChanged, map, catchError, reduce, debounceTime, switchMap, mergeMap, finalize } from 'rxjs/operators';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { AlertifyService } from './alertify.service';
import { Review } from '../models/review.model';
import { HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Util } from '../errors/helpers/util';
import { Entity } from '../models/entity.model';
import { Router, ActivatedRoute } from '@angular/router';

import {
  FacebookLoginProvider, AuthService,
  // GoogleLoginProvider,
  // LinkedInLoginProvider
} from 'angularx-social-login';
import { flatten } from '@angular/core/src/render3/util';
import { GlobalService } from './global.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser$ = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private isAdminSubject = new BehaviorSubject<boolean>(false);
  public isAdmin$ = this.isAdminSubject.asObservable();

  private usersCountSubject = new BehaviorSubject<number>(0);
  public usersCount$ = this.usersCountSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private jwtService: JwtService,
    private alertifyService: AlertifyService,
    private errorUtil: Util,
    private router: Router,
    private socialAuthService: AuthService,
    private globalService: GlobalService,
    private errorHandler: ErrorHandler,
  ) {

  }
  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  populate() {
    console.log('populate called');
    this.globalService.setLoadingRequests('populate', true);
    // If JWT detected, attempt to get & store user's info
    if (this.jwtService.getToken()) {
      this.apiService.get('/user')
        .pipe(
          map(resp => resp),
          catchError(err => {
            console.log('purge auth due to an err', err);
            this.purgeAuth();
            this.alertifyService.error(this.errorUtil.getError(err) || 'Failed to get account details');
            return of([]);
          }),
          finalize(() => {
            this.globalService.setLoadingRequests('populate', false);
          })
        )
        .subscribe(
          data => {
            if (data.success) {
              this.isAuthenticatedSubject.next(true);
              this.currentUserSubject.next(data.user);
              const roles = this.getUserRoles(data.user);
              this.isAdminSubject.next(roles.includes('admin'));
            } else {
              console.log('Purge user data since data.length is 0');
              this.purgeAuth();
            }
          },
          err => {
            this.globalService.setLoadingRequests('populate', false);
            console.log('Purge user data due to some error', err);
            this.purgeAuth();
          }
        );
    } else {
      this.globalService.setLoadingRequests('populate', false);
      console.log('Purge user data since it does not have a token. token is: ', this.jwtService.getToken());
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }
  isUserAuthenticated(route?, state?) {
    if (this.isAuthenticatedSubject.getValue()) {
      return true;
    } else {
      return (async () => {
        return <boolean>await this.apiService.get('/user')
          .pipe(
            map(resp => {
              console.log('Resp', resp);
              const isAuthenticated = !!(resp.success && resp.user);
              this.isAuthenticatedSubject.next(isAuthenticated);
              return isAuthenticated;
            }),
            catchError(err => {
              let returnUrl = '';
              if (state) {
                returnUrl = state.url;
              }
              this.router.navigate(['/auth/login'], { queryParams: { returnUrl } });
              return of(false);
            })
          )
          .toPromise();
      })();
    }
  }
  isUserNotAuthenticated(route?, state?) {
    if (this.isAuthenticatedSubject.getValue()) {
      this.router.navigate(['/home']);
      return false;
    } else {
      return (async () => {
        return <boolean>await this.apiService.get('/user')
          .pipe(
            map(resp => {
              console.log('Resp', resp);
              const isAuthenticated = !!(resp.success && resp.user);
              this.isAuthenticatedSubject.next(isAuthenticated);
              this.router.navigate(['/home']);
              return !isAuthenticated;
            }),
            catchError(err => {
              return of(true);
            })
          )
          .toPromise();
      })();
    }
  }
  isUserAdmin() {
    if (this.isAdminSubject.getValue()) {
      return true;
    } else {
      return (async () => {
        return <boolean>await this.apiService.get('/user')
          .pipe(
            map(resp => {
              try {
                console.log('Resp', resp);
                const roles = this.getUserRoles(resp.user);
                const rolesHasAdmin = roles.includes('admin');
                this.isAdminSubject.next(rolesHasAdmin);
                if (!rolesHasAdmin) {
                  this.router.navigate(['/home']);
                }
                return rolesHasAdmin;
              } catch (e) {
                this.router.navigate(['/home']);
                return false;
              }
            }),
            catchError(err => {
              if (err.status && err.status === 401) {
                this.router.navigate(['/auth/login']);
              }
              return of(false);
            })
          )
          .toPromise();
      })();
    }
  }
  setAuth(user: User) {
    console.log('setAuth is called', user);

    // Save JWT sent from server in localstorage
    this.jwtService.saveToken(user.token);
    // Set current user data into observable
    this.currentUserSubject.next(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
    // check if user has admin role
    const roles = this.getUserRoles(user);
    console.log('setAuth check user if admin', roles);

    this.isAdminSubject.next(roles.includes('admin'));
  }
  getUserRoles(user) {
    let roles = [];
    if (user && user.roles && typeof user.roles === 'string') {
      try {
        roles = JSON.parse(user.roles);
      } catch (e) {

      }
    } else if (user && user.roles && user.roles instanceof Array) {
      roles = user.roles;
    }
    return roles;
  }
  purgeAuth() {
    console.log('purgeAuth initiated');
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    // Set current user to an empty object
    this.currentUserSubject.next({} as User);
    // Set auth status to false
    this.isAuthenticatedSubject.next(false);
    this.isAdminSubject.next(false);
    console.log('purgeAuth completed');
  }

  attemptAuth(type, credentials): Observable<Object> {
    this.globalService.setLoadingRequests('attemptAuth', true);
    console.log('attemptAuth called', type);
    const route = (type === 'login') ? '/login' : '';
    return this.apiService.post('/users' + route, credentials, null, true)
      .pipe(
        map(
          resp => {
            if (!resp.success) {
              const error = this.errorUtil.getError(resp, { getValidationErrors: true });
              if (typeof error === 'object') { return of(error); }
              console.log('ERROR!', error);

              this.alertifyService.error(error || 'Authentication Failed.');
              return resp;
            }
            if (resp.success && resp.token) {
              resp.user.token = resp.token;
              this.setAuth(resp.user);
            }
            return resp;
          }
        ),
        finalize(() => {
          this.globalService.setLoadingRequests('attemptAuth', false);
        })
      );
  }

  getCurrentUser(): User {
    console.log('getCurrentUser is called', this.currentUserSubject.value);
    return this.currentUserSubject.value;
  }
  requestPasswordReset(username: string): Observable<{ success: boolean }> {
    this.globalService.setLoadingRequests('requestPasswordReset', true);
    return this.apiService
      .post('/user/forgot-password', { username })
      .pipe(
        map(resp => {
          if (!resp.success) {
            this.alertifyService.error(this.errorUtil.getError(resp) || 'Failed to request password reset.');
            return of({ success: false });
          }
          return resp;
        }),
        finalize(() => {
          this.globalService.setLoadingRequests('requestPasswordReset', false);
        })
      );
  }
  forgotPasswordReset(
    newPassword: string,
    token: string
  ): Observable<{ success: true }> {
    this.globalService.setLoadingRequests('forgotPasswordReset', true);
    return this.apiService
      .put('/user/forgot-password-reset', {
        newPassword,
        token
      }, null, true)
      .pipe(
        map(resp => {
          if (!resp.success) {
            this.alertifyService.error(this.errorUtil.getError(resp) || 'Failed to reset password.');
            return of(null);
          }
          return resp;
        }),
        finalize(() => {
          this.globalService.setLoadingRequests('forgotPasswordReset', false);
        })
      );
  }
  passwordReset(
    password: string,
    newPassword: string
  ): Observable<{ success: true }> {
    return this.apiService
      .put('/user/password-reset', {
        password,
        newPassword
      }, null, true)
      .pipe(
        map(resp => {
          if (!resp.success) {
            this.alertifyService.error(this.errorUtil.getError(resp) || 'Failed to reset password.');
            return of(null);
          }
          return resp;
        }),
        catchError(err => {
          const error = this.errorUtil.getError(err, { getValidationErrors: true });
          if (typeof error === 'object') { return of(error); }
          this.alertifyService.error(error || 'Failed to reset password.');
          return of(null);
        })
      );
  }
  create(
    image?: File,
    body: Object = {}
  ) {
    const fd = new FormData();
    if (image) {
      fd.append('avatar', image, image.name);
    }
    for (const key of Object.keys(body)) {
      const b = typeof body[key] === 'object' ? JSON.stringify(body[key]) : body[key];
      fd.append(key, b);
    }
    this.globalService.setLoadingRequests('create', true);
    return this.apiService.putWithProg(`/users/new`, fd, false, () => {
      this.globalService.setLoadingRequests('create', false);
    });
  }
  // Update the user on the server (email, pass, etc)
  update(user): Observable<User> {
    return this.apiService
      .put('/user', { user })
      .pipe(
        map(data => {
          if (!data.success) {
            this.alertifyService.error(this.errorUtil.getError(data) || 'Failed to update user info');
            return of(null);
          }
          // Update the currentUser observable
          this.currentUserSubject.next(data.user);
          return data.user;
        }),
        catchError(err => {
          const error = this.errorUtil.getError(err, { getValidationErrors: true });
          if (typeof error === 'object') { return of(error); }
          this.alertifyService.error(error || 'Failed to update user info.');
          return of(null);
        })
      );
  }
  updateProfile(
    image?: File,
    body: Object = {},
    userId?: string
  ) {
    const fd = new FormData();
    if (image) {
      fd.append('avatar', image, image.name);
    }
    for (const key of Object.keys(body)) {
      const b = typeof body[key] === 'object' ? JSON.stringify(body[key]) : body[key];
      fd.append(key, b);
    }
    this.globalService.setLoadingRequests('updateProfile', true);
    if (userId) {
      return this.apiService.putWithProg(`/user/${userId}/profile`, fd, false, () => {
        this.globalService.setLoadingRequests('updateProfile', false);
      });
    } else {
      return this.apiService.putWithProg('/user/profile', fd, false, () => {
        this.globalService.setLoadingRequests('updateProfile', false);
      });
    }
  }

  fbAuth(access_token): Observable<any> {
    this.globalService.setLoadingRequests('attemptAuth', true);
    console.log('authenticate user ', access_token);
    return this.apiService.post(
      '/users/facebook/token',
      { 'access_token': access_token }
    ).pipe(
      map((data) => {
        if (!data.success && this.errorUtil.getError(data) === 'Account deactivated') {
          return data;
        } else if (!data.success) {
          this.alertifyService.error(this.errorUtil.getError(data) || 'Login failed.');
          return of(null);
        }
        data.user.token = data.token;
        this.setAuth(data.user);
        return data;
      }),
      finalize(() => {
        this.globalService.setLoadingRequests('attemptAuth', false);
      })
    );
  }

  signInWithFB(cb): void {
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then(
      (userData) => {
        // this will return user data from facebook. What you need is a user token which you will send it to the server
        this.fbAuth(userData.authToken).subscribe(data => {
          cb(data);
        });
      }
    );
  }

  // signInWithGoogle(): void {
  //   this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  // }

  // signInWithLinkedIn(): void {
  //   this.socialAuthService.signIn(LinkedInLoginProvider.PROVIDER_ID);
  // }

  signOut(): void {
    this.socialAuthService.signOut();
  }

  isAdminOrEntityOwner(id: string): Observable<boolean> {
    this.globalService.setLoadingRequests('isAdminOrEntityOwner', true);
    if (this.isAdminSubject) {
      this.globalService.setLoadingRequests('isAdminOrEntityOwner', false);
      return of(true);
    }
    return this.apiService.get(`/user/entity/${id}/owner`)
      .pipe(
        map(
          resp => {
            if (!resp.success) {
              return of(false);
            } else if (resp.success) {
              return resp.data;
            }
          }
        ),
        finalize(() => {
          this.globalService.setLoadingRequests('isAdminOrEntityOwner', false);
        })
      );
  }
  findUserEntities(params: {
    filter: string,
    sortDirection: string,
    sortField: string,
    pageNumber: number,
    pageSize: number,
    userId?: string
  }
  ): Observable<Entity[]> {
    console.log('findUserEntities');
    const defaults = {
      filter: '',
      sortDirection: 'desc',
      sortField: 'rating',
      pageNumber: 0,
      pageSize: 10
    };
    Object.keys(defaults).forEach(key => {
      params[key] = params[key] || defaults[key];
    });
    params.userId = params.userId || '';
    this.globalService.setLoadingRequests('findUserEntities', true);
    return this.apiService.get(
      `/user/entities`,
      new HttpParams()
        .set('filter', params.filter)
        .set('sortDirection', params.sortDirection)
        .set('sortField', params.sortField)
        .set('pageNumber', params.pageNumber.toString())
        .set('pageSize', params.pageSize.toString())
        .set('userId', params.userId)
    ).pipe(
      map((res) => {
        if (!res.success) {
          this.alertifyService.error(this.errorUtil.getError(res) || 'Failed to load user entities.');
          return of([]);
        }
        return res['data'];
      }),
      catchError(err => {
        const error = this.errorUtil.getError(err, { getValidationErrors: true });
        if (typeof error === 'object') { return of(error); }
        this.alertifyService.error(error || 'Failed to load user entities.');
        return of([]);
      }),
      finalize(() => {
        this.globalService.setLoadingRequests('findUserEntities', false);
      })
    );
  }
  findUserReviews(params: {
    filter: string | object,
    sortDirection: string,
    sortField: string,
    pageNumber: number,
    pageSize: number,
    userId?: string
  }
  ): Observable<Review[]> {
    const defaults = {
      filter: '',
      sortDirection: 'desc',
      sortField: 'rating',
      pageNumber: 0,
      pageSize: 10
    };
    Object.keys(defaults).forEach(key => {
      params[key] = params[key] || defaults[key];
    });
    params.userId = params.userId || '';
    this.globalService.setLoadingRequests('findUserReviews', true);
    return this.apiService.get(
      `/user/reviews`,
      new HttpParams()
        .set('filter', typeof params.filter === 'object' ? JSON.stringify(params.filter) : params.filter)
        .set('sortDirection', params.sortDirection)
        .set('sortField', params.sortField)
        .set('pageNumber', params.pageNumber.toString())
        .set('pageSize', params.pageSize.toString())
        .set('userId', params.userId)
    ).pipe(
      map((res) => {
        if (!res.success) {
          this.alertifyService.error(this.errorUtil.getError(res) || 'Failed to load user reviews.');
          return of([]);
        }
        const user = this.getCurrentUser() || <User>{};
        user['foundReviews'] = res['data'];
        console.log('findUserReviews data', res['data']);
        this.currentUserSubject.next(<User>{});
        this.currentUserSubject.next(user);
        return res['data'];
      }),
      catchError(error => {
        console.log('findUserReviews Error!!! ', error);
        if (error instanceof HttpErrorResponse || error['error'] instanceof HttpErrorResponse) {
          if (error['error'] instanceof HttpErrorResponse) {
            error = error['error'];
          }
          if (error.status === 401) {
            return of(null);
          }
        }
        this.errorHandler.handleError(error);
      }),
      finalize(() => {
        this.globalService.setLoadingRequests('findUserReviews', false);
      })
    );
  }
  findUserActivity(params: {
    filter: string,
    sortDirection: string,
    sortField: string,
    pageNumber: number,
    pageSize: number,
    userId?: string
  }
  ): Observable<any[]> {
    const defaults = {
      filter: '',
      sortDirection: 'desc',
      sortField: 'createdAt',
      pageNumber: 0,
      pageSize: 10
    };
    Object.keys(defaults).forEach(key => {
      params[key] = params[key] || defaults[key];
    });

    this.globalService.setLoadingRequests('findUserActivity', true);
    const route = `/user/${params.userId ? params.userId + '/' : ''}activity`;
    console.log('FIND ACTIVITY ROUTE', route);
    return this.apiService.get(
      route,
      new HttpParams()
        .set('filter', params.filter)
        .set('sortDirection', params.sortDirection)
        .set('sortField', params.sortField)
        .set('pageNumber', params.pageNumber.toString())
        .set('pageSize', params.pageSize.toString())
    ).pipe(
      map((res) => {
        if (!res.success) {
          this.alertifyService.error(this.errorUtil.getError(res) || 'Failed to load user activity.');
          return of(null);
        }
        return res;
      }),
      finalize(() => {
        this.globalService.setLoadingRequests('findUserActivity', false);
      })
    );
  }
  blockUserToggle(userId: string, block: boolean): Observable<User> {
    this.globalService.setLoadingRequests('blockUserToggle', true);
    return this.apiService.put(
      `/user/${userId}/block`,
      {
        block
      }
    )
      .pipe(
        map((res) => {
          if (!res.success) {
            this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while blocking user');
            return of(null);
          }
          return res.user;
        }),
        catchError(err => {
          const error = this.errorUtil.getError(err, { getValidationErrors: true });
          if (typeof error === 'object') { return of(error); }
          this.alertifyService.error(error || 'Something went wrong while blocking user');
          return of(null);
        }),
        finalize(() => {
          this.globalService.setLoadingRequests('blockUserToggle', false);
        })
      );
  }
  findUserById(userId: string): Observable<User> {
    this.globalService.setLoadingRequests('findUserById', true);
    return this.apiService.get(`/users/${userId}`)
      .pipe(
        map((res) => {
          if (!res.success) {
            this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while retrieving user info');
            return of(null);
          }
          return res.data;
        }),
        finalize(() => {
          this.globalService.setLoadingRequests('findUserById', false);
        })
      );
  }
  deleteEntity(entityId: string): Observable<boolean> {
    this.globalService.setLoadingRequests('deleteEntity', true);
    return this.apiService.delete(`/user/entity/${entityId}`, true)
      .pipe(
        map(resp => {
          if (!resp.success) {
            this.alertifyService.error(this.errorUtil.getError(resp) || 'Failed to delete entity.');
            return of(null);
          }
          return resp;
        }),
        mergeMap(resp => {
          this.populate();
          return of(resp);
        }),
        catchError(err => {
          const error = this.errorUtil.getError(err, { getValidationErrors: true });
          if (typeof error === 'object') { return of(error); }
          this.alertifyService.error(error || 'Failed to delete entity.');
          return of(null);
        }),
        finalize(() => {
          this.globalService.setLoadingRequests('deleteEntity', false);
        })
      );
  }
  deleteReview(entityId: string): Observable<boolean> {
    this.globalService.setLoadingRequests('deleteReview', true);
    return this.apiService.delete(`/user/review/${entityId}`, true)
      .pipe(
        map(resp => {
          if (!resp.success) {
            this.alertifyService.error(this.errorUtil.getError(resp) || 'Failed to delete review.');
            return of(null);
          }
          return resp;
        }),
        mergeMap(resp => {
          this.populate();
          return of(resp);
        }),
        catchError(err => {
          const error = this.errorUtil.getError(err, { getValidationErrors: true });
          if (typeof error === 'object') { return of(error); }
          this.alertifyService.error(error || 'Failed to delete review.');
          return of(null);
        }),
        finalize(() => {
          this.globalService.setLoadingRequests('deleteReview', false);
        })
      );
  }
  restoreAccount(userId: string) {
    this.globalService.setLoadingRequests('restoreAccount', true);
    return this.apiService.put(`/user/${userId}/restore`)
    .pipe(
      map(resp => {
        if (!resp.success) {
          this.alertifyService.error(this.errorUtil.getError(resp) || 'Failed to restore account');
        } else if (resp.success && resp.user) {
          resp.user.token = resp.token;
          this.setAuth(resp.user);
        }
        return resp;
      }),
      finalize(() => {
        this.globalService.setLoadingRequests('restoreAccount', false);
      })
    );
  }
  deleteAccount(): Observable<any> {
    this.globalService.setLoadingRequests('deleteAccount', true);
    return this.apiService.delete(`/user`)
      .pipe(
        map(resp => {
          if (!resp.success) {
            this.alertifyService.error(this.errorUtil.getError(resp) || 'Failed to delete your account.');
            return of(null);
          }
          return resp;
        }),
        finalize(() => {
          this.globalService.setLoadingRequests('deleteAccount', false);
        })
      );
  }
  deleteUser(userId: string): Observable<boolean> {
    this.globalService.setLoadingRequests('deleteUser', true);
    return this.apiService.delete(`/user/${userId}`)
      .pipe(
        map(resp => {
          if (!resp.success) {
            this.alertifyService.error(this.errorUtil.getError(resp) || 'Failed to delete user.');
            return of(null);
          }
          return resp;
        }),
        finalize(() => {
          this.globalService.setLoadingRequests('deleteUser', false);
        })
      );
  }
  search(Obj: Object) {
    const keywords: Observable<string> = Obj['keyword'],
      sortField = Obj['sortField'],
      sortDirection = Obj['sortDirection'],
      pageNumber = Obj['pageNum'],
      pageSize = Obj['pageSize'];
    this.globalService.setLoadingRequests('search', true);
    return keywords.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(keyword => {
        if (!keyword) {
          console.log('keyword is empty');
          return of([]);
        }
        return this.findUsers(
          {
            filter: keyword,
            sortDirection,
            sortField,
            pageNumber,
            pageSize
          }
        );
      })
    );
  }

  findUsers(params: {
    filter: string,
    filterFields?: object,
    sortDirection: string,
    sortField: string,
    pageNumber: number,
    pageSize: number
  }): Observable<User[]> {
    const defaults = {
      filter: '',
      filterFields: [],
      sortDirection: 'asc',
      sortField: 'username',
      pageNumber: 0,
      pageSize: 10
    };
    Object.keys(defaults).forEach(key => {
      params[key] = params[key] || defaults[key];
    });
    this.globalService.setLoadingRequests('findUsers', true);
    return this.apiService.get(
      '/users',
      new HttpParams()
        .set('filter', params.filter)
        .set('filterFields', JSON.stringify(params.filterFields))
        .set('sortDirection', params.sortDirection)
        .set('sortField', params.sortField)
        .set('pageNumber', params.pageNumber ? params.pageNumber.toString() : '')
        .set('pageSize', params.pageSize ? params.pageSize.toString() : '')
    ).pipe(
      map((res) => {
        if (!res.success) {
          this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while searching users');
          return of([]);
        }
        res['data'].push(res['count']); // used to display filter count on the table
        this.usersCountSubject.next(res['count']);
        return res['data'];
      }),
      catchError(err => {
        this.alertifyService.error(this.errorUtil.getError(err) || 'Something went wrong while searching users');
        return of([]);
      }),
      finalize(() => {
        this.globalService.setLoadingRequests('search', false);
        this.globalService.setLoadingRequests('findUsers', false);
      })
    );
  }
  checkUsernameNotTaken(username: string): Observable<boolean> {
    this.globalService.setLoadingRequests('checkUsernameNotTaken', true);
    if (!username) {
      this.globalService.setLoadingRequests('checkUsernameNotTaken', false);
      return of(false);
    }
    return this.apiService.get(`/users/checkusername`, new HttpParams().set('username', username))
      .pipe(
        map(res => {
          if (!res.success) {
            this.alertifyService.error(this.errorUtil.getError(res) || 'Failed to check username');
            return of(null);
          }
          return res.data;
        }),
        catchError(err => {
          this.alertifyService.error(this.errorUtil.getError(err) || 'Failed to check username');
          return of(null);
        }),
        finalize(() => {
          this.globalService.setLoadingRequests('checkUsernameNotTaken', false);
        })
      );
  }
}
