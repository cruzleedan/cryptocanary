import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EntityService, Breadcrumb, UserService } from '../../../../core';
import { Entity } from '../../../../core/models/entity.model';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialog } from '@angular/material';
import { AddReviewDialogComponent } from '../../../../shared/add-review-dialog/add-review-dialog.component';
import { EntityReviewsComponent } from '../../../../shared/entity-reviews/entity-reviews.component';
import { Review } from '../../../../core/models/review.model';
import { GlobalService } from '../../../../core/services/global.service';
import { UpdateReviewDialogComponent } from '../../../../shared/update-review-dialog/update-review-dialog.component';

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
    private router: Router,
    private domSanitizer: DomSanitizer,
    private dialog: MatDialog,
    private globalService: GlobalService
  ) {
    this.entityIdSubject.next(this.route.snapshot.params['entityId']);
    console.log(this.route.snapshot);
    this.entity = this.entity || <Entity>{};
    this.globalService.loadingRequests$.subscribe(requests => {
      const req = ['deleteEntity', 'approveEntity', 'addReview', 'findEntityById'];
      this.loading = req.some(r => !!(requests[r]));
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
  getUserReviews() {
    this.userService.findUserReviews({
      filter: { entityId: this.entity.id },
      sortDirection: 'desc',
      sortField: 'createdAt',
      pageNumber: 0,
      pageSize: 10
    })
      .pipe(takeUntil(this.destroySubject$))
      .subscribe();
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
  openAddReviewDialog(): void {
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
        this.getUserReviews();
        this.getEntity();
        this.entityReviews.pageNumber = 0;
        this.entityReviews.entityReviews = [];
        this.entityReviews.loadReviews();
      }
    });
  }
  // openEditReviewDialog(review: Review): void {
  //   const dialogRef = this.dialog.open(UpdateReviewDialogComponent, {
  //     width: '600px',
  //     data: {
  //       entityId: this.entity.id,
  //       review: review
  //     },
  //     panelClass: 'no-margin-dialog'
  //   });

  //   dialogRef.afterClosed().subscribe(resp => {
  //     console.log('The dialog was closed result is ', resp);
  //     if (resp && typeof resp === 'object') {
  //       this.getUserReviews();
  //       this.getEntity();
  //       this.entityReviews.pageNumber = 0;
  //       this.entityReviews.entityReviews = [];
  //       this.entityReviews.loadReviews();
  //     }
  //   });
  // }
  afterEntityDeleted() {
    this.router.navigate(['/home']);
  }
}
