import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { MatTabChangeEvent, PageEvent, MatPaginator, MatTab, MatTabGroup } from '@angular/material';
import { EntityService, UserService } from '../../../../core';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, tap } from 'rxjs/operators';
import { GlobalService } from '../../../../core/services/global.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  entities = [];
  loading: boolean;
  isAdmin: boolean;
  destroySubject$: Subject<void> = new Subject();

  length: number;
  pageSize: number;
  pageIndex: number;
  pageSizeOptions: any;

  pendingLength: number;
  newProjectLength: number;
  shadiestProjectLength: number;

  pendingPageSize: number;
  newProjectPageSize: number;
  shadiestProjectPageSize: number;

  pendingPageIndex: number;
  newProjectPageIndex: number;
  shadiestProjectPageIndex: number;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTabGroup) entityTabGroup: MatTabGroup;
  constructor(
    private entityService: EntityService,
    private globalService: GlobalService,
    private userService: UserService
  ) {
    this.pageSize = 10;
    this.pageIndex = 0;
    this.pageSizeOptions = [10, 25, 50, 100];

    this.pendingPageSize = 10;
    this.newProjectPageSize = 10;
    this.shadiestProjectPageSize = 10;

    this.pendingPageIndex = 0;
    this.newProjectPageIndex = 0;
    this.shadiestProjectPageIndex = 0;

    this.globalService.loadingRequests$
      .subscribe((requests) => {
        this.loading = !!(requests['getEntities']);
      });
    this.userService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  ngOnInit() {
    let filter = {};
    if (this.isAdmin) {
      filter = { approved: false }; // default to pending tab if user is admin
    } else {
      filter = { approved: true };
    }
    this.getEntities({
      field: [['createdAt', 'desc']],
      filter
    }, (resp) => {
      this.pendingLength = resp['count'] || 0;
      this.length = this.pendingLength;
    });
  }
  ngAfterViewInit() {

    this.paginator.page
      .pipe(
        tap(() => {
          // this.getPendingEntities();
          const activeTab = this.entityTabGroup.selectedIndex;
          switch (activeTab) {
            case 0:
              this.getPendingEntities();
              break;
            case 1:
              this.getNewEntities();
              break;
            case 2:
              this.getShadiestEntities();
              break;
          }
        }),
        takeUntil(this.destroySubject$)
      )
      .subscribe();
  }
  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
  getEntities(params, cb?: Function) {
    const defaults = {
      field: params.field,
      filter: params.filter,
      pageNumber: 0,
      pageSize: 10
    };
    Object.keys(defaults).forEach(key => {
      params[key] = params[key] || defaults[key];
    });
    this.entityService.getEntities(params)
      .pipe(
        debounceTime(400),
        takeUntil(this.destroySubject$)
      )
      .subscribe(resp => {
        this.entities = resp['data'];
        if (cb && typeof cb === 'function') {
          cb(resp);
        }
      });
  }
  getPendingEntities() {
    this.getEntities({
      field: [['createdAt', 'desc']],
      filter: { approved: false },
      pageNumber: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize
    }, (resp) => {
      this.pendingLength = resp['count'] || 0;
      this.length = this.pendingLength;
      this.pendingPageSize = this.paginator.pageSize;
      this.pendingPageIndex = this.paginator.pageIndex;
    });
  }
  getNewEntities() {
    this.getEntities({
      field: [['createdAt', 'desc']],
      pageNumber: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize
    }, (resp) => {
      this.newProjectLength = resp['count'] || 0;
      this.length = this.newProjectLength;
      this.newProjectPageSize = this.paginator.pageSize;
      this.newProjectPageIndex = this.paginator.pageIndex;
    });
  }
  getShadiestEntities() {
    this.getEntities({
      field: [['rating', 'desc']],
      filter: {reviewsRequired: true},
      pageNumber: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize
    }, (resp) => {
      this.shadiestProjectLength = resp['count'] || 0;
      this.length = this.shadiestProjectLength;
      this.shadiestProjectPageSize = this.paginator.pageSize;
      this.shadiestProjectPageIndex = this.paginator.pageIndex;
    });
  }
  selectedTabChange(event: MatTabChangeEvent) {
    console.log('selected tab changed');
    this.entities = [];
    const tab = event.tab.textLabel;
    if (tab === 'SHADIEST PROJECTS') {
      this.paginator.pageSize = this.shadiestProjectPageSize;
      this.paginator.pageIndex = this.shadiestProjectPageIndex;
      // sort entities by shadiest to least shady
      this.getShadiestEntities();
    } else if (tab === 'NEW PROJECTS') {
      console.log('Initialize page size to ', this.newProjectPageSize);
      console.log('Initialize page index to ', this.newProjectPageIndex);
      this.paginator.pageSize = this.newProjectPageSize;
      this.paginator.pageIndex = this.newProjectPageIndex;
      // sort entities by latest to oldest
      this.getNewEntities();
    } else if (tab === 'PENDING PROJECTS') {
      console.log('Initialize page size to ', this.pendingPageSize);
      console.log('Initialize page index to ', this.pendingPageIndex);
      this.paginator.pageSize = this.pendingPageSize;
      this.paginator.pageIndex = this.pendingPageIndex;
      // get pending entities
      this.getPendingEntities();
    }
  }
}
