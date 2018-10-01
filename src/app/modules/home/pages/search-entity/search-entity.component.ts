import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { EntityService } from '../../../../core';
import { MatExpansionPanel } from '@angular/material';

@Component({
  selector: 'app-search-entity',
  templateUrl: './search-entity.component.html',
  styleUrls: ['./search-entity.component.scss']
})
export class SearchEntityComponent implements OnInit, OnDestroy {
  isFilterPanelHidden: boolean;
  selectedRatingRange: string;
  entities = [];
  destroySubject$: Subject<void> = new Subject();
  @ViewChild(MatExpansionPanel) filterPanel: MatExpansionPanel;
  constructor(
    private entityService: EntityService,
  ) {
    this.isFilterPanelHidden = true;
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
  afterFilterPanelClosed() {
    setTimeout(() => {
      this.isFilterPanelHidden = true;
    }, 100);
  }
  toggleFilterPanel() {
    if (this.isFilterPanelHidden) {
      this.isFilterPanelHidden = false;
      this.filterPanel.open();
    } else  {
      this.filterPanel.close();
    }
  }
  formatLabel(value: number | null) {
    return value + '%';
  }
}
