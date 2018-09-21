import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { EntityService } from '../../../../core';

@Component({
  selector: 'app-search-entity',
  templateUrl: './search-entity.component.html',
  styleUrls: ['./search-entity.component.scss']
})
export class SearchEntityComponent implements OnInit, OnDestroy {

  entities = [];
  destroySubject$: Subject<void> = new Subject();
  constructor(
    private entityService: EntityService,
  ) {

  }

  ngOnInit() {
    this.entityService.searchedEntities$.subscribe(entities => {
      this.entities = entities;
    });
  }
  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
}
