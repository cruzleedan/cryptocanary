import { Injectable } from '@angular/core';
import { BehaviorSubject, of, ReplaySubject, Observable, Subject } from 'rxjs';
import { User } from '../models/user.model';
import { distinctUntilChanged, map, catchError, reduce, debounceTime, switchMap, mergeMap, finalize } from 'rxjs/operators';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { AlertifyService } from './alertify.service';
import { Review } from '../models/review.model';
import { HttpParams } from '@angular/common/http';
import { Util } from '../errors/helpers/util';
import { Entity } from '../models/entity.model';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'angularx-social-login';
import {
  FacebookLoginProvider,
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
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  private isAdminSubject = new BehaviorSubject<boolean>(false);
  public isAdmin = this.isAdminSubject.asObservable();

  private usersCountSubject = new BehaviorSubject<number>(0);
  public usersCount$ = this.usersCountSubject.asObservable();

  public socialAuthServiceSubscription;
  constructor(
    private apiService: ApiService,
    private jwtService: JwtService,
    private alertifyService: AlertifyService,
    private errorUtil: Util,
    private router: Router,
    private route: ActivatedRoute,
    private socialAuthService: AuthService,
    private global: GlobalService
  ) {
    this.socialAuthServiceSubscription = this.socialAuthService.authState
      .pipe(
        mergeMap((user) => {
          console.log('FB authenticated', user);
          console.log('is authenticated? ', this.isAuthenticatedSubject.getValue());
          if (user && user != null && !this.isAuthenticatedSubject.getValue()) {
            return this.fbAuth(user.authToken);
          }
          return of();
        })
      )
      .subscribe((data) => {
        if (data.success) {
          let returnUrl = this.route.snapshot.queryParams['returnUrl'];
          if (returnUrl) {
            returnUrl = decodeURIComponent(returnUrl);
            this.router.navigate([returnUrl]);
          }
        }
      });
  }
  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  populate() {
    console.log('populate called');
    this.global.setLoadingRequests('populate', true);
    // If JWT detected, attempt to get & store user's info
    if (this.jwtService.getToken()) {
      this.apiService.get('/user')
        .pipe(
          map(resp => resp),
          catchError(err => {
            this.purgeAuth();
            this.alertifyService.error(this.errorUtil.getError(err) || 'Failed to get account details');
            return of([]);
          }),
          finalize(() => {
            this.global.setLoadingRequests('populate', false);
          })
        )
        .subscribe(
          data => {
            if (data.success) {
              this.isAuthenticatedSubject.next(true);
              this.currentUserSubject.next(data.user);
              const roles = data.user.roles instanceof Array ? data.user.roles : [];
              this.isAdminSubject.next(roles.includes('admin'));
            } else {
              console.log('Purge user data since data.length is 0');
              this.purgeAuth();
            }
          },
          err => {
            this.global.setLoadingRequests('populate', false);
            console.log('Purge user data due to some error', err);
            this.purgeAuth();
          }
        );
    } else {
      this.global.setLoadingRequests('populate', false);
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
      return false;
    } else {
      return (async () => {
        return <boolean>await this.apiService.get('/user')
          .pipe(
            map(resp => {
              console.log('Resp', resp);
              const isAuthenticated = !!(resp.success && resp.user);
              this.isAuthenticatedSubject.next(isAuthenticated);
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
                const roles = resp.user.roles instanceof Array ? resp.user.roles : [];
                this.isAdminSubject.next(roles.includes('admin'));
                return roles.includes('admin');
              } catch (e) {
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
    const roles = user.roles instanceof Array ? user.roles : [];
    console.log('setAuth check user if admin', roles);

    this.isAdminSubject.next(roles.includes('admin'));
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
    this.global.setLoadingRequests('attemptAuth', true);
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
          this.global.setLoadingRequests('attemptAuth', false);
        })
      );
  }

  getCurrentUser(): User {
    console.log('getCurrentUser is called', this.currentUserSubject.value);
    return this.currentUserSubject.value;
  }
  requestPasswordReset(username: string): Observable<{ success: boolean }> {
    this.global.setLoadingRequests('requestPasswordReset', true);
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
          this.global.setLoadingRequests('requestPasswordReset', false);
        })
      );
  }
  forgotPasswordReset(
    newPassword: string,
    token: string
  ): Observable<{ success: true }> {
    this.global.setLoadingRequests('forgotPasswordReset', true);
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
          this.global.setLoadingRequests('forgotPasswordReset', false);
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
    return this.apiService.putWithProg(`/users/new`, fd);
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
    if (userId) {
      return this.apiService.putWithProg(`/user/${userId}/profile`, fd);
    } else {
      return this.apiService.putWithProg('/user/profile', fd);
    }
  }

  fbAuth(access_token): Observable<any> {
    this.global.setLoadingRequests('attemptAuth', true);
    console.log('authenticate user ', access_token);
    return this.apiService.post(
      '/users/facebook/token',
      { 'access_token': access_token }
    ).pipe(
      map((data) => {
        if (!data.success) {
          this.alertifyService.error(this.errorUtil.getError(data) || 'Login failed.');
          return of(null);
        }
        data.user.token = data.token;
        this.setAuth(data.user);
        return data;
      }),
      finalize(() => {
        this.global.setLoadingRequests('attemptAuth', false);
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
    this.socialAuthServiceSubscription.unsubscribe();
  }

  isAdminOrEntityOwner(id: string): Observable<boolean> {
    this.global.setLoadingRequests('isAdminOrEntityOwner', true);
    if (this.isAdminSubject) {
      this.global.setLoadingRequests('isAdminOrEntityOwner', false);
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
          this.global.setLoadingRequests('isAdminOrEntityOwner', false);
        })
      );
  }
  findUserEntities(
    filter = '',
    sortDirection = 'desc',
    sortField = 'rating',
    pageNumber: number = 1,
    pageSize: number = 10,
    userId?: string
  ): Observable<Entity[]> {
    userId = userId || '';
    this.global.setLoadingRequests('findUserEntities', true);
    return this.apiService.get(
      `/user/entities`,
      new HttpParams()
        .set('filter', filter)
        .set('sortDirection', sortDirection)
        .set('sortField', sortField)
        .set('pageNumber', pageNumber.toString())
        .set('pageSize', pageSize.toString())
        .set('userId', userId)
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
        this.global.setLoadingRequests('findUserEntities', false);
      })
    );
  }
  findUserReviews(
    filter = '',
    sortDirection = 'desc',
    sortField = 'rating',
    pageNumber: number = 1,
    pageSize: number = 10,
    userId?: string
  ): Observable<Review[]> {
    userId = userId || '';
    this.global.setLoadingRequests('findUserReviews', true);
    return this.apiService.get(
      `/user/reviews`,
      new HttpParams()
        .set('filter', filter)
        .set('sortDirection', sortDirection)
        .set('sortField', sortField)
        .set('pageNumber', pageNumber.toString())
        .set('pageSize', pageSize.toString())
        .set('userId', userId)
    ).pipe(
      map((res) => {
        if (!res.success) {
          this.alertifyService.error(this.errorUtil.getError(res) || 'Failed to load user reviews.');
          return of([]);
        }
        return res['data'];
      }),
      catchError(err => {
        const error = this.errorUtil.getError(err, { getValidationErrors: true });
        if (typeof error === 'object') { return of(error); }
        this.alertifyService.error(error || 'Failed to load user reviews.');
        return of([]);
      }),
      finalize(() => {
        this.global.setLoadingRequests('findUserReviews', false);
      })
    );
  }
  blockUserToggle(userId: string, block: boolean): Observable<User> {
    this.global.setLoadingRequests('blockUserToggle', true);
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
          this.global.setLoadingRequests('blockUserToggle', false);
        })
      );
  }
  findUserById(userId: string): Observable<User> {
    this.global.setLoadingRequests('findUserById', true);
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
          this.global.setLoadingRequests('findUserById', false);
        })
      );
  }
  deleteEntity(entityId: string): Observable<boolean> {
    this.global.setLoadingRequests('deleteEntity', true);
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
          this.global.setLoadingRequests('deleteEntity', false);
        })
      );
  }
  deleteReview(entityId: string): Observable<boolean> {
    this.global.setLoadingRequests('deleteReview', true);
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
          this.global.setLoadingRequests('deleteReview', false);
        })
      );
  }
  deleteUser(userId: string): Observable<boolean> {
    this.global.setLoadingRequests('deleteUser', true);
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
          this.global.setLoadingRequests('deleteUser', false);
        })
      );
  }
  search(Obj: Object) {
    const keywords: Observable<string> = Obj['keyword'],
      sortField = Obj['sortField'],
      sortDirection = Obj['sortDirection'],
      pageNum = Obj['pageNum'],
      pageSize = Obj['pageSize'];
    this.global.setLoadingRequests('search', true);
    return keywords.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(keyword => {
        if (!keyword) {
          console.log('keyword is empty');
          return of([]);
        }
        return this.findUsers(
          keyword,
          null,
          sortDirection,
          sortField,
          pageNum,
          pageSize
        );
      })
    );
  }

  findUsers(
    filter: string = '', filterFields: object = [], sortDirection = 'asc', sortField = 'username',
    pageNumber = 0, pageSize = 25
  ): Observable<User[]> {
    this.global.setLoadingRequests('findUsers', true);
    return this.apiService.get(
      '/users',
      new HttpParams()
        .set('filter', filter)
        .set('filterFields', JSON.stringify(filterFields))
        .set('sortDirection', sortDirection)
        .set('sortField', sortField)
        .set('pageNumber', pageNumber.toString())
        .set('pageSize', pageSize.toString())
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
        this.global.setLoadingRequests('search', false);
        this.global.setLoadingRequests('findUsers', false);
      })
    );
  }
  checkUsernameNotTaken(username: string): Observable<boolean> {
    this.global.setLoadingRequests('checkUsernameNotTaken', true);
    if (!username) {
      this.global.setLoadingRequests('checkUsernameNotTaken', false);
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
          this.global.setLoadingRequests('checkUsernameNotTaken', false);
        })
      );
  }
}
