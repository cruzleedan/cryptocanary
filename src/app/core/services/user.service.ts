import { Injectable } from '@angular/core';
import { BehaviorSubject, of, ReplaySubject, Observable, Subject } from 'rxjs';
import { User } from '../models/user.model';
import { distinctUntilChanged, map, catchError, reduce, debounceTime, switchMap, mergeMap, finalize } from 'rxjs/operators';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { environment } from '../../../environments/environment';
import { AlertifyService } from './alertify.service';
import { Review } from '../models/review.model';
import { HttpParams } from '@angular/common/http';
import { Util } from '../errors/helpers/util';
import { Entity } from '../models/entity.model';
import { async } from 'rxjs/internal/scheduler/async';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

declare const FB: any;

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private currentUserSubject = new BehaviorSubject<User>({} as User);
    public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

    private isAuthenticatingSubject = new ReplaySubject<boolean>();
    public isAuthenticating$ = this.isAuthenticatingSubject.asObservable();

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated = this.isAuthenticatedSubject.asObservable();

    private isAdminSubject = new BehaviorSubject<boolean>(false);
    public isAdmin = this.isAdminSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    private searchingSubject = new BehaviorSubject<boolean>(false);
    public searching$ = this.searchingSubject.asObservable();

    private usersCountSubject = new BehaviorSubject<number>(0);
    public usersCount$ = this.usersCountSubject.asObservable();

    private loadingRequestsSubject = new BehaviorSubject<Object>({});
    public loadingRequests$ = this.loadingRequestsSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private jwtService: JwtService,
        private alertifyService: AlertifyService,
        private errorUtil: Util,
        private router: Router
    ) {
        try {
            FB.init(environment.fbConfig);
        } catch (err) {
            this.alertifyService.error('Something went wrong while connecting to Facebook');
        }
    }
    setLoadingRequests(name, status) {
        const req = {};
        req[name] = status;
        this.loadingRequestsSubject.next(Object.assign(this.loadingRequestsSubject.getValue(), req));
    }
    // Verify JWT in localstorage with server & load user's info.
    // This runs once on application startup.
    populate() {
        console.log('populate called');
        this.isAuthenticatingSubject.next(true);
        // If JWT detected, attempt to get & store user's info
        if (this.jwtService.getToken()) {
            this.apiService.get('/user')
                .pipe(
                    map(resp => resp),
                    catchError(err => {
                        this.purgeAuth();
                        this.alertifyService.error(this.errorUtil.getError(err) || 'Failed to get account details');
                        return of([]);
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
                        this.isAuthenticatingSubject.next(false);
                        console.log('Purge user data due to some error', err);
                        this.purgeAuth();
                    }
                );
        } else {
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
                return <boolean> await this.apiService.get('/user')
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
                            this.router.navigate(['/auth/login'], { queryParams: { returnUrl }});
                            return of(false);
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
                return <boolean> await this.apiService.get('/user')
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
    isUserNotAuthenticated() {
        return (async () => {
            return <boolean> await this.apiService.get('/user')
                .pipe(
                    map(resp => {
                        console.log('Resp', resp);
                        return !!!(resp.success && resp.user);
                    }),
                    catchError(err => {
                        if (err.status && err.status === 401) {
                            return of(true);
                        }
                    })
                )
                .toPromise();
        })();
    }
    setAuth(user: User) {
        this.isAuthenticatingSubject.next(false);
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
        this.isAuthenticatingSubject.next(false);
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
        this.setLoadingRequests('attemptAuth', true);
        console.log('attemptAuth called', type);
        this.isAuthenticatingSubject.next(true);
        const route = (type === 'login') ? '/login' : '';
        return this.apiService.post('/users' + route, credentials, null, true)
            .pipe(
                map(
                    resp => {
                        this.isAuthenticatingSubject.next(false);
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
                    this.setLoadingRequests('attemptAuth', false);
                })
            );
    }

    getCurrentUser(): User {
        console.log('getCurrentUser is called', this.currentUserSubject.value);
        return this.currentUserSubject.value;
    }
    requestPasswordReset(username: string): Observable<{ success: boolean }> {
        this.setLoadingRequests('requestPasswordReset', true);
        return this.apiService
            .post('/user/forgot-password', {username})
            .pipe(
                map(resp => {
                    if (!resp.success) {
                        this.alertifyService.error(this.errorUtil.getError(resp) || 'Failed to request password reset.');
                        return of({success: false});
                    }
                    return resp;
                }),
                finalize(() => {
                    this.setLoadingRequests('requestPasswordReset', false);
                })
            );
    }
    forgotPasswordReset(
        newPassword: string,
        token: string
    ): Observable<{ success: true }> {
        this.setLoadingRequests('forgotPasswordReset', true);
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
                    this.setLoadingRequests('forgotPasswordReset', false);
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

    fbAuth(cred): Observable<any> {
        console.log('fbAuth', cred);
        return this.apiService.post(
            '/users/facebook/token',
            { 'access_token': cred.authResponse.accessToken }
        ).pipe(
            map((data) => {
                if (!data.success) {
                    this.alertifyService.error(this.errorUtil.getError(data) || 'Login failed.');
                    return of(null);
                }
                data.user.token = data.token;
                this.setAuth(data.user);
                return data;
            })
        );
    }
    async fbLogin() {
        this.setLoadingRequests('fbLogin', true);
        try {
            return await (() => {
                return new Promise((resolve, reject) => {
                    FB.login(result => {
                        this.setLoadingRequests('fbLogin', false);
                        if (result.authResponse) {
                            resolve(result);
                        } else {
                            reject();
                        }
                    }, { scope: 'public_profile,email' });
                });
            })();
        } catch (e) {
            this.setLoadingRequests('fbLogin', false);
            return e;
        }
    }
    isAdminOrEntityOwner(id: string): Observable<boolean> {
        if (this.isAdminSubject) {
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
                catchError(err => {
                    const error = this.errorUtil.getError(err);
                    this.alertifyService.error(error || 'Failed to check entity ownership.');
                    return of(false);
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
        this.loadingSubject.next(true);
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
                this.loadingSubject.next(false);
                return res['data'];
            }),
            catchError(err => {
                this.loadingSubject.next(false);
                const error = this.errorUtil.getError(err, { getValidationErrors: true });
                if (typeof error === 'object') { return of(error); }
                this.alertifyService.error(error || 'Failed to load user entities.');
                return of([]);
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
        this.loadingSubject.next(true);
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
                this.loadingSubject.next(false);
                return res['data'];
            }),
            catchError(err => {
                this.loadingSubject.next(false);
                const error = this.errorUtil.getError(err, { getValidationErrors: true });
                if (typeof error === 'object') { return of(error); }
                this.alertifyService.error(error || 'Failed to load user reviews.');
                return of([]);
            })
        );
    }
    blockUserToggle(userId: string, block: boolean): Observable<User> {
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
                })
            );
    }
    findUserById(userId: string): Observable<User> {
        return this.apiService.get(`/users/${userId}`)
            .pipe(
                map((res) => {
                    if (!res.success) {
                        this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while retrieving user info');
                        return of(null);
                    }
                    return res.data;
                })
            );
    }
    deleteEntity(entityId: string): Observable<boolean> {
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
                })
            );
    }
    deleteReview(entityId: string): Observable<boolean> {
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
                })
            );
    }
    deleteUser(userId: string): Observable<boolean> {
        return this.apiService.delete(`/user/${userId}`)
            .pipe(
                map(resp => {
                    if (!resp.success) {
                        this.alertifyService.error(this.errorUtil.getError(resp) || 'Failed to delete user.');
                        return of(null);
                    }
                    return resp;
                })
            );
    }
    search(Obj: Object) {
        const keywords: Observable<string> = Obj['keyword'],
            sortField = Obj['sortField'],
            sortDirection = Obj['sortDirection'],
            pageNum = Obj['pageNum'],
            pageSize = Obj['pageSize'];
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
        this.searchingSubject.next(true);
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
                this.searchingSubject.next(false);
                if (!res.success) {
                    this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while searching users');
                    return of([]);
                }
                res['data'].push(res['count']); // used to display filter count on the table
                this.usersCountSubject.next(res['count']);
                return res['data'];
            }),
            catchError(err => {
                this.searchingSubject.next(false);
                this.alertifyService.error(this.errorUtil.getError(err) || 'Something went wrong while searching users');
                return of([]);
            })
        );
    }
    checkUsernameNotTaken(username: string): Observable<boolean> {
        if (!username) { return of(false); }
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
                })
            );
    }
}
