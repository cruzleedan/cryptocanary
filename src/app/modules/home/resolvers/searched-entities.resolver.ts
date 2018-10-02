import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { Entity } from '../../../core/models/entity.model';
import { EntityService } from '../../../core';

@Injectable({
  providedIn: 'root'
})
export class SearchedEntitiesResolver implements Resolve<{ data: Entity[], count: number, pending: number }> {
  searchKeyword$ = new Subject<string>();
  constructor(private entityService: EntityService) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ data: Entity[], count: number, pending: number }> {
    const keyword = route.queryParams['find'];
    console.log('KEYWORD IS ', keyword);
    this.searchKeyword$.next(keyword);
    return this.entityService.findEntities(
      {
        filter: { name: keyword },
        sortDirection: 'asc',
        sortField: 'entity_name',
        pageNumber: 0,
        pageSize: 10
      }
    );
  }

}

