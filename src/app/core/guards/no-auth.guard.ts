import { Injectable, NgZone } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '..';
import { map, take, last, mergeMap, switchMap, distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
    constructor(
        private userService: UserService,
        private router: Router,
        private zone: NgZone,
    ) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        console.log('no auth guard', this.userService.isAuthenticated);

        return this.userService.isUserNotAuthenticated();
    }
}
