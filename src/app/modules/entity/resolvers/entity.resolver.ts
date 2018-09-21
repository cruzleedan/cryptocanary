import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Entity } from '../../../core/models/entity.model';
import { EntityService } from '../../../core';

@Injectable({
  providedIn: 'root'
})
export class EntityResolver implements Resolve<Entity> {

  constructor(private entityService: EntityService) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Entity> {
    console.log('Entity resolver', route.params['entityId']);
    return this.entityService.findEntityById(route.params['entityId']);
  }

}

