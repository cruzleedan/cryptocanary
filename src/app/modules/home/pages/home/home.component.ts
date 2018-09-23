import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import { EntityService } from '../../../../core';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { GlobalService } from '../../../../core/services/global.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  entities = [];
  loading: boolean;
  destroySubject$: Subject<void> = new Subject();
  constructor(
    private entityService: EntityService,
    private globalService: GlobalService
  ) {
    this.globalService.loadingRequests$
    .subscribe((requests) => {
      this.loading = !!(requests['getEntities']);
    });
  }

  ngOnInit() {
    this.getEntities([['createdAt', 'desc']]); // default will be new projects
  }
  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
  getEntities(field: Object) {
    this.entityService.getEntities({
      field: field,
      pageNumber: '0',
      pageSize: '10'
    })
      .pipe(
        debounceTime(400),
        takeUntil(this.destroySubject$)
      )
      .subscribe(entities => {
        this.entities = entities;
      });
  }
  selectedTabChange(event: MatTabChangeEvent) {
    this.entities = [];
    const tab = event.tab.textLabel;
    if (tab === 'SHADIEST PROJECTS') {
      // sort entities by shadiest to least shady
      this.getEntities([['rating', 'desc']]);
    } else if (tab === 'NEW PROJECTS') {
      // sort entities by latest to oldest
      this.getEntities([['createdAt', 'desc']]);
    }
  }
}
