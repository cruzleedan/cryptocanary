import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntityService } from '../../../../core';
import { Entity } from '../../../../core/models/entity.model';
import { ActivatedRoute } from '@angular/router';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialog } from '@angular/material';
import { AddReviewDialogComponent } from '../../../../shared/add-review-dialog/add-review-dialog.component';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.scss']
})
export class EntityComponent implements OnInit, OnDestroy {
  baseUrl = environment.baseUrl;

  entity: Entity;
  entityDesc: SafeHtml;
  private entityIdSubject = new BehaviorSubject<string>('');
  public entityId$ = this.entityIdSubject.asObservable();
  destroySubject$: Subject<void> = new Subject();
  constructor(
    private entityService: EntityService,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private dialog: MatDialog
  ) {
    this.entityIdSubject.next(this.route.snapshot.params['entityId']);
    console.log(this.route.snapshot);
    this.entity = this.entity || <Entity>{};
    this.getEntity();
  }

  ngOnInit() {
    this.route.params
      .subscribe(params => {
        console.log('params', params);
        this.entityIdSubject.next(params.entityId);
        this.getEntity();
      });
  }
  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
  getEntity() {
    this.entityService.findEntityById(this.entityIdSubject.getValue())
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroySubject$)
        )
      .subscribe(entity => {
        console.log('entity', entity);
        this.entity = entity;
        this.formatFields();
      });
  }
  formatFields() {
    this.entityDesc = this.domSanitizer.bypassSecurityTrustHtml(this.entity.desc || '');
    this.entity.links = this.entity.links instanceof Array ? this.entity.links : [];
  }
  openAddReviewDialog(): void {
    const dialogRef = this.dialog.open(AddReviewDialogComponent, {
      width: '600px',
      data: {type: 'new'},
      panelClass: 'no-margin-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed result is ', result);
    });
  }
}
