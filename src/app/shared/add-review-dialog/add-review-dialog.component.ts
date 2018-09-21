import { Component, OnInit, Inject, OnDestroy, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ReviewService, UserService } from '../../core';
import { Entity } from '../../core/models/entity.model';
import { Review } from '../../core/models/review.model';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { GlobalService } from '../../core/services/global.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-add-review-dialog',
  templateUrl: './add-review-dialog.component.html',
  styleUrls: ['./add-review-dialog.component.scss']
})
export class AddReviewDialogComponent implements OnInit, OnDestroy {
  loading: boolean;
  reviewForm: FormGroup;
  entityId: string;
  entityName: string;
  matcher;
  review: Review;
  entity: Entity;
  userReview: Review[];
  destroySubject$: Subject<void> = new Subject();
  constructor(
    private reviewService: ReviewService,
    private userService: UserService,
    private authService: AuthService,
    private route: Router,
    private globalService: GlobalService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.entityId = data.entityId;
    const currentUser = this.userService.getCurrentUser();
    if (!(typeof currentUser === 'object' && Object.keys(currentUser).length)) {
      this.authService.showAuthFormPopup((resp) => {
        console.log('Will reload entity', resp);
        this.route.navigate([`/entity/${this.entityId}`]);
      });
      this.dialogRef.close();
    }
    this.userService.currentUser$.subscribe(user => {
      this.userReview = user['foundReviews'] || [];
    });
    console.log('ENTITY ID', this.entityId);
    this.reviewForm = this.fb.group({
      rating: new FormControl('', [
        Validators.required,
        Validators.min(1)
      ]),
      review: new FormControl('', [
        Validators.required
      ]),
      title: new FormControl('My Review')
    });
    if (this.userReview && this.userReview.length) {
      this.reviewForm.patchValue(this.userReview ? this.userReview[0] : {});
    }
    this.globalService.loadingRequests$.subscribe(requests => {
      this.loading = !!(requests['addReview']);
    });
  }
  ngOnInit() {
  }
  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
  submitReview() {
    console.log('SubmitReview');
    this.reviewService
      .addReview(this.entityId, this.reviewForm.value)
      .pipe(
        takeUntil(this.destroySubject$),
        mergeMap(resp => {
          this.userService.populate();
          return of(resp);
        })
      )
      .subscribe((resp) => {
        console.log('response', resp);
        if (resp) {
          this.dialogRef.close(resp);
        }
      });
  }
}
