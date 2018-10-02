import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { EntityService } from '../../../../core';
import { MatExpansionPanel, MatPaginator } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-search-entity',
  templateUrl: './search-entity.component.html',
  styleUrls: ['./search-entity.component.scss']
})
export class SearchEntityComponent implements OnInit, AfterViewInit, OnDestroy {
  filterForm: FormGroup;
  ratingModel = null;
  isFilterPanelHidden: boolean;
  selectedRatingRange: string;
  entities = [];
  searchedKeyword: string;
  destroySubject$: Subject<void> = new Subject();
  entitiesCount: number;

  length: number;
  pageSize: number;
  pageIndex: number;
  pageSizeOptions: any;
  @ViewChild(MatExpansionPanel) filterPanel: MatExpansionPanel;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    private entityService: EntityService,
  ) {
    this.pageSize = 10;
    this.pageIndex = 0;
    this.pageSizeOptions = [10, 25, 50, 100];

    this.isFilterPanelHidden = true;
    this.filterForm = new FormGroup({
      rating: new FormControl('', [Validators.max(100), Validators.min(0)]),
      publisher: new FormControl('')
    });
    this.entityService.searchedKeyword$.subscribe(keyword => {
      this.searchedKeyword = keyword;
    });
    this.entityService.entitiesCount$.subscribe(count => {
      this.entitiesCount = count;
      this.length = count;
    });
  }

  ngOnInit() {
    this.entityService.searchedEntities$.subscribe(entities => {
      this.entities = entities;
    });
  }
  ngAfterViewInit() {

    this.paginator.page
      .pipe(
        tap(() => {
          this.applyFilters();
        }),
        takeUntil(this.destroySubject$)
      )
      .subscribe();
  }
  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
  afterFilterPanelClosed() {
    setTimeout(() => {
      this.isFilterPanelHidden = true;
    }, 100);
  }
  toggleFilterPanel() {
    if (this.isFilterPanelHidden) {
      this.isFilterPanelHidden = false;
      this.filterPanel.open();
    } else {
      this.filterPanel.close();
    }
  }
  formatLabel(value: number | null) {
    return value + '%';
  }
  findEntities(filters) {
    this.entityService.findEntities({
      filter: filters,
      sortDirection: 'desc',
      sortField: 'createdAt',
      pageNumber: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize
    })
      .pipe(
        takeUntil(this.destroySubject$)
      )
      .subscribe();
  }
  applyFilters() {
    this.filterForm.get('rating').setValue(this.ratingModel);
    const formValues = this.filterForm.value;
    const filters = Object.assign({ name: this.searchedKeyword }, formValues);

    this.findEntities(filters);
  }
  resetFilters() {
    this.filterForm.reset();
    this.ratingModel = null;
  }
}
