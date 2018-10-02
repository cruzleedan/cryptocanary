import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { UserService, User } from '../../core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { MatDialog } from '@angular/material';
import { AddReviewDialogComponent } from '../add-review-dialog/add-review-dialog.component';
import { Review } from '../../core/models/review.model';
import { Router } from '@angular/router';
import { UpdateReviewDialogComponent } from '../update-review-dialog/update-review-dialog.component';
@Component({
  selector: 'app-user-activities',
  templateUrl: './user-activities.component.html',
  styleUrls: ['./user-activities.component.scss']
})
export class UserActivitiesComponent implements OnInit, OnDestroy {
  currentUserId: string;
  searchControl: FormControl;
  pageSize: number;
  pageNumber: number;
  @Input() user: User;
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
    this.userService.currentUser$.subscribe(user => {
      this.currentUserId = user.id;
    });
  }

  ngOnInit() {
    this.loadUserActivity();
  }
  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
  reset() {
    this.pageNumber = 0;
    this.pageSize = 10;
    this.dates = [];
    this.userActivities = {};
  }
  loadUserActivity(
    sort: string = 'desc',
    sortField: string = 'createdAt'
  ) {
    console.log('LOAD USER ACTIVITY');
    this.userService.findUserActivity(
      {
        filter: this.searchControl.value,
        sortDirection: sort,
        sortField,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        userId: this.user.id
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
  reloadUserActivities() {
    console.log('reload user activities');
    this.reset();
    this.loadUserActivity();
  }
  afterReviewUpdated(event) {
    this.reset();
    this.loadUserActivity();
  }
  afterReviewDeleted(event) {
    this.reset();
    this.loadUserActivity();
  }
  afterEntityDeleted(event) {
    this.reset();
    this.loadUserActivity();
  }
}
