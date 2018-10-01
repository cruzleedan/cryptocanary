import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { MsgDialogComponent } from '../dialog/msg-dialog.component';
import { AlertifyService, ReviewService, UserService, User } from '../../core';
import { MatDialog } from '@angular/material';
import { Review } from '../../core/models/review.model';
import { UpdateReviewDialogComponent } from '../update-review-dialog/update-review-dialog.component';

@Component({
  selector: 'app-review-action-buttons',
  templateUrl: './review-action-buttons.component.html',
  styleUrls: ['./review-action-buttons.component.scss']
})
export class ReviewActionButtonsComponent implements OnInit {
  @Input() review: Review;
  @Output() afterDelete: EventEmitter<any> = new EventEmitter();
  @Output() afterUpdate: EventEmitter<any> = new EventEmitter();
  isAdmin: boolean;
  currentUser: User;
  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private reviewService: ReviewService,
    private alertifyService: AlertifyService
  ) {
    this.userService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit() {
    console.log('REVIEW ACTION ', this.review);
  }
  delete() {
    const dialogRef = this.dialog.open(MsgDialogComponent, {
      data: {
        type: 'confirm',
        msg: `Are you sure, you want to delete your review
        ${this.review.Entity && this.review.Entity.name ? ' for ' + this.review.Entity.name : ''}?`
      },
      width: '500px',
      hasBackdrop: true,
      panelClass: ''
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp && resp.proceed) {

        this.reviewService.deleteReview(this.review.id)
          .subscribe(del => {
            if (del) {
              this.alertifyService.success('Successfully deleted');
              this.afterDelete.emit(del);
            }
          });
      }
    });

  }
  openEditReviewDialog(): void {
    const dialogRef = this.dialog.open(UpdateReviewDialogComponent, {
      width: '600px',
      data: {
        entityId: this.review.entityId,
        review: this.review
      },
      panelClass: 'no-margin-dialog'
    });

    dialogRef.afterClosed().subscribe(resp => {
      console.log('The dialog was closed result is ', resp);
      if (resp && typeof resp === 'object') {
        this.afterUpdate.emit(resp);
      }
    });
  }
}
