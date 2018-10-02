import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';
import { EntityService, ReviewService, UserService } from '../../core';
import { Review } from '../../core/models/review.model';
import { AuthService } from '../../core/services/auth.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSelectChange } from '@angular/material';


@Component({
  selector: 'app-entity-reviews',
  templateUrl: './entity-reviews.component.html',
  styleUrls: ['./entity-reviews.component.scss']
})
export class EntityReviewsComponent implements OnInit, OnDestroy {
  baseUrl = environment.baseUrl;
  filter = {};
  @Input() entityId$;
  @Output() addUserReview: EventEmitter<Review> = new EventEmitter();
  @Output() afterDelete: EventEmitter<any> = new EventEmitter();
  @Output() afterUpdate: EventEmitter<any> = new EventEmitter();
  userReview: Review[];
  entityId: string;
  sortDirection: string;
  sortField: string;
  pageNumber: number;
  pageSize: number;
  entityReviews: Review[];
  entityTotalReviews: number;

  isAdmin: boolean;

  destroySubject$: Subject<void> = new Subject();
  constructor(
    private entityService: EntityService,
    private authService: AuthService,
    private reviewService: ReviewService,
    private userService: UserService
  ) {
    this.sortField = 'createdAt';
    this.sortDirection = 'desc';
    this.pageNumber = 0;
    this.pageSize = 10;
    this.entityReviews = [];

    this.userService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.userReview = user['foundReviews'] || [];
      console.log('entity reviews', user);
    });

    this.entityId$
      .subscribe(entityId => {
        this.entityId = entityId;
        this.reset();
        this.loadReviews();
      });
  }
  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
  reset() {
    this.pageNumber = 0;
    this.pageSize = 10;
    this.entityReviews = [];
  }
  loadReviews(
    sort: string = 'desc',
    sortField: string = 'createdAt',
    filter: string | object = ''
  ) {
    console.log('loadReviews', this.entityId);

    this.entityService.findReviews({
      entityId: this.entityId,
      filter: filter,
      sortDirection: this.sortDirection,
      sortField: this.sortField,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    })
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(resp => {
        if (this.entityReviews instanceof Array) {
          this.entityReviews = this.entityReviews.concat(resp['data']);
        } else {
          this.entityReviews = resp['data'];
        }
        this.entityTotalReviews = resp['count'];
        this.pageNumber += 1;
      });
  }
  voteReview(reviewId, type) {
    this.reviewService.voteReview(reviewId, type)
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(data => {
        if (data.error === 'Unauthorized') {
          this.authService.showAuthFormPopup((resp) => {
            if (resp && resp.data && resp.data.success) {
              console.log('User has been authenticated');
              this.voteReview(reviewId, type);
            }
          });
        } else {
          const foundIndex = this.entityReviews.findIndex(rev => rev.id === data.id);
          if (foundIndex > -1) {
            this.entityReviews[foundIndex] = Object.assign(this.entityReviews[foundIndex], data);
          }
        }
      });
  }
  afterReviewUpdated(event) {
    this.reset();
    this.loadReviews();
    this.afterUpdate.emit(event);
  }
  afterReviewDeleted(event) {
    this.reset();
    this.loadReviews();
    this.afterDelete.emit(event);
  }
  sortReviews(event: MatSelectChange) {
    this.reset();
    const field = event.value;
    console.log('Sort Reviews', field);

    this.sortField = field;
    this.loadReviews('desc', field, this.filter);
  }
  sortReviewsDirection() {
    this.reset();
    this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    this.loadReviews(this.sortDirection, this.sortField, this.filter);
  }
}
