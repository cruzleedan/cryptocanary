import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EntityService, Breadcrumb, UserService } from '../../../../core';
import { Entity } from '../../../../core/models/entity.model';
import { ActivatedRoute } from '@angular/router';
import { takeUntil, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialog } from '@angular/material';
import { AddReviewDialogComponent } from '../../../../shared/add-review-dialog/add-review-dialog.component';
import { EntityReviewsComponent } from '../../../../shared/entity-reviews/entity-reviews.component';
import { Review } from '../../../../core/models/review.model';
import { GlobalService } from '../../../../core/services/global.service';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.scss']
})
export class EntityComponent implements OnInit, OnDestroy {
  baseUrl = environment.baseUrl;

  currentPage: Breadcrumb;

  entity: Entity;
  entityDesc: SafeHtml;
  // userReview$: Subject<Review[]> = new Subject();
  loading: boolean;
  private entityIdSubject = new BehaviorSubject<string>('');
  public entityId$ = this.entityIdSubject.asObservable();
  destroySubject$: Subject<void> = new Subject();

  @ViewChild(EntityReviewsComponent) entityReviews: EntityReviewsComponent;
  constructor(
    private entityService: EntityService,
    private userService: UserService,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private dialog: MatDialog,
    private globalService: GlobalService
  ) {
    this.entityIdSubject.next(this.route.snapshot.params['entityId']);
    console.log(this.route.snapshot);
    this.entity = this.entity || <Entity>{};
    this.globalService.loadingRequests$.subscribe(requests => {
      this.loading = !!(requests['addReview']) || !!(requests['findEntityById']);
    });
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
        takeUntil(this.destroySubject$),
        shareReplay()
      )
      .subscribe(entity => {
        console.log('entity', entity);
        this.entity = entity;
        this.formatFields();
        this.currentPage = {
          label: entity.name,
          href: ''
        };
      });
  }
  formatFields() {
    this.entityDesc = this.domSanitizer.bypassSecurityTrustHtml(this.entity.desc || '');
    this.entity.links = this.entity.links instanceof Array ? this.entity.links : [];
  }
  openAddReviewDialog(entityId: string): void {
    const dialogRef = this.dialog.open(AddReviewDialogComponent, {
      width: '600px',
      data: {
        entityId: this.entity.id
      },
      panelClass: 'no-margin-dialog'
    });

    dialogRef.afterClosed().subscribe(resp => {
      console.log('The dialog was closed result is ', resp);
      if (resp && typeof resp === 'object') {

        this.entityReviews.pageNumber = 0;
        this.entityReviews.entityReviews = [];
        this.entityReviews.loadReviews();
      }
    });
  }
}
