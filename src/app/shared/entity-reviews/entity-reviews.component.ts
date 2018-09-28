import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';
import { EntityService, ReviewService, UserService } from '../../core';
import { Review } from '../../core/models/review.model';
import { AuthService } from '../../core/services/auth.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-entity-reviews',
  templateUrl: './entity-reviews.component.html',
  styleUrls: ['./entity-reviews.component.scss']
})
export class EntityReviewsComponent implements OnInit, OnDestroy {
  baseUrl = environment.baseUrl;
  @Input() entityId$;
  @Output() addUserReview: EventEmitter<Review> = new EventEmitter();
  @Output() updateUserReview: EventEmitter<Review> = new EventEmitter();
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
        this.entityReviews = [];
        this.entityTotalReviews = 0;
        this.pageNumber = 0;
        this.loadReviews();
      });
  }
  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
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
  editReview(review: Review) {
    if (this.isAdmin) {
      this.updateUserReview.emit(review);
    } else  {
      this.addUserReview.emit(review);
    }
  }
}
