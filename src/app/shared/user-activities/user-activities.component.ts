import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { MatDialog } from '@angular/material';
import { AddReviewDialogComponent } from '../add-review-dialog/add-review-dialog.component';
import { Review } from '../../core/models/review.model';
import { Router } from '@angular/router';
@Component({
  selector: 'app-user-activities',
  templateUrl: './user-activities.component.html',
  styleUrls: ['./user-activities.component.scss']
})
export class UserActivitiesComponent implements OnInit, OnDestroy {
  searchControl: FormControl;
  pageSize: number;
  pageNumber: number;
  userId: string;
  userActivities = {};
  dates = [];
  format = 'YYYY-MM-DD';
  destroySubject$: Subject<void> = new Subject();
  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.searchControl = new FormControl('');
    this.pageNumber = 0;
    this.pageSize = 10;
  }

  ngOnInit() {
    this.loadUserActivity();
  }
  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
  loadUserActivity(
    sort: string = 'desc',
    sortField: string = 'createdAt'
  ) {
    this.userService.findUserActivity(
      {
        filter: this.searchControl.value,
        sortDirection: sort,
        sortField,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        userId: this.userId
      })
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(resp => {
        if (resp) {
          let createdAt;
          resp['entities']['data'].forEach(entity => {
            entity.activityType = 'entity';
            createdAt = entity.createdAt;
            createdAt = moment(createdAt, this.format).format(this.format);
            if (this.userActivities[createdAt] instanceof Array) {
              this.userActivities[createdAt].push(entity);
            } else {
              this.userActivities[createdAt] = [entity];
            }
            this.addDates(createdAt);
          });
          resp['reviews']['data'].forEach(review => {
            review.activityType = 'review';
            createdAt = review.createdAt;
            createdAt = moment(createdAt, this.format).format(this.format);
            if (this.userActivities[createdAt] instanceof Array) {
              this.userActivities[createdAt].push(review);
            } else {
              this.userActivities[createdAt] = [review];
            }
            this.addDates(createdAt);
          });
          this.momentDates();
          console.log('USER ACTIVITY', this.userActivities);
          console.log('dates', this.dates);
        }
      });
  }
  addDates(createdAt) {
    if (!this.dates.includes(createdAt)) {
      this.dates.push(createdAt);
    }
  }
  momentDates() {
    this.dates = this.dates.map(d => new Date(d)).sort((a: any, b: any) => b - a).map(date => {
      return {
        date: moment(date, this.format).format(this.format),
        moment: moment(date, this.format).fromNow()
      };
    });
  }
  editTask(task) {
    if (task.activityType === 'review') {
      this.openAddReviewDialog(task);
    } else if (task.activityType === 'entity') {
      this.router.navigate([`/entity/${task.id}/edit`]);
    }
  }
  openAddReviewDialog(userReview: Review): void {
    console.log('open reiview dialog with ', userReview);
    const dialogRef = this.dialog.open(AddReviewDialogComponent, {
      width: '600px',
      data: {
        userReview: [userReview], entityId: userReview.Entity.id
      },
      panelClass: 'no-margin-dialog'
    });

    dialogRef.afterClosed().subscribe(resp => {
      console.log('The dialog was closed result is ', resp);
      if (resp && typeof resp === 'object') {
        this.userActivities = {};
        this.dates = [];
        this.loadUserActivity();
      }
    });
  }
}
