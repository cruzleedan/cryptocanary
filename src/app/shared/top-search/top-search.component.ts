import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { EntityService, CategoryService } from '../../core';
import { Subject } from 'rxjs';
import { Entity } from '../../core/models/entity.model';
import { takeUntil } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material';

@Component({
  selector: 'app-top-search',
  templateUrl: './top-search.component.html',
  styleUrls: ['./top-search.component.scss']
})
export class TopSearchComponent implements OnInit, OnDestroy {
  searchCtrl = new FormControl();
  options = [];
  filteredOptions: Entity[] = [];
  searchKeyword$ = new Subject<string>();
  destroySubject$: Subject<void> = new Subject();
  constructor(
    private router: Router,
    private entityService: EntityService,
    private categoryService: CategoryService
  ) {
    this.entityService.search({
      keyword: this.searchKeyword$,
      sortField: 'entity_name',
      sortDirection: 'asc',
      pageNum: 0,
      pageSize: 5
    })
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        res => {
          this.filteredOptions = res['data'];
        }
      );
  }

  ngOnInit() {
  }
  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
  search(event: MatAutocompleteSelectedEvent) {
    const entityId: number = event.option.value ? event.option.value['entity_id'] : '';
    if (entityId) {
      this.router.navigateByUrl('/entity/' + entityId);
    }
  }
  clearSearch() {
    this.searchCtrl.setValue('');
    this.searchKeyword$.next('');
  }
  searchDisplayFn(value: any) {
    return value && value.hasOwnProperty('entity_name') ? value['entity_name'] : '';
  }
  findKeyword() {
    console.log('find keyword');
    // this.router.navigate(['/category'], {
    //   queryParams: { 'find': this.searchCtrl.value }
    // });
  }
}
