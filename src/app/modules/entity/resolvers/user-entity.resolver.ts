import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../../../core';

@Injectable({
  providedIn: 'root'
})
export class UserEntityResolver implements Resolve<boolean> {

  constructor(private userService: UserService) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log('Entity resolver', route.params['entityId']);
    return this.userService.isAdminOrEntityOwner(route.params['entityId']);
  }

}

