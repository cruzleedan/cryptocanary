import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { UserService } from '../../../core';
import { Review } from '../../../core/models/review.model';

@Injectable({
  providedIn: 'root'
})
export class UserEntityReviewResolver implements Resolve<Review[]> {

  constructor(private userService: UserService) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Review[]> {
    console.log('UserEntityReviewResolver resolver', route.params['entityId']);
    return this.userService.findUserReviews({
        filter: {entityId: route.params['entityId']},
        sortDirection: 'desc',
        sortField: 'createdAt',
        pageNumber: 0,
        pageSize: 10
      });
  }

}

