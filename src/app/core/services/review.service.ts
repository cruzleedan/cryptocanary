import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Review } from '../models/review.model';
import { AlertifyService } from './alertify.service';
import { Util } from '../errors/helpers/util';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private reviewsCountSubject = new BehaviorSubject<number>(0);
    public reviewsCount$ = this.reviewsCountSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private alertifyService: AlertifyService,
        private errorUtil: Util
    ) { }
    findReviewById(reviewId: string): Observable<Review> {
        return this.apiService.get(`/reviews/${reviewId}`)
            .pipe(
                map((res) => {
                    if (!res.success) {
                        this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while searching review');
                        return of(null);
                    }
                    return res.data ? res.data : of(null);
                })
            );
    }
    hasUserReviewedEntity(entityId: string): Observable<Review> {
        return this.apiService.get(`/user/review/${ entityId }`)
            .pipe(
                map(res => {
                    console.log('HAS USER REVIED ENTITY', res);

                    if (!res['success']) {
                        // this.alertifyService.error(this.errorUtil.getError(res) || 'Failed to check if user reviewed Entity');
                        return of(null);
                    }
                    return res['data'];
                })
            );
    }
    addReview(
        entityId: string,
        newEntity: Object = {}
    ) {
        return this.apiService.put(`/entities/${ entityId }/reviews/new`, newEntity )
            .pipe(
                map(res => {
                    if (!res['success']) {
                        this.alertifyService.error(this.errorUtil.getError(res) || 'Failed to add Review');
                        return of(null);
                    }
                    return res['data'];
                }),
                catchError(err => {
                    this.alertifyService.error(this.errorUtil.getError(err) || 'Failed to add Review');
                    return of(null);
                })
            );
    }
    voteReview(
        reviewId: number,
        voteType: boolean
    ) {
        return this.apiService.put(`/entities/reviews/${ reviewId }/vote`, {voteType}, null, true)
            .pipe(
                map(res => {
                    if (!res['success']) {
                        const err = this.errorUtil.getError(res) || 'Something went wrong while saving your vote.';
                        this.alertifyService.error(err);
                        return {error: err};
                    }
                    return res['data'];
                })
            );
    }
    findReviews(
        filter: string | object = '',
        sortDirection = 'desc',
        sortField = 'rating',
        pageNumber: number = 1,
        pageSize: number = 10
    ): Observable<Object> {
        return this.apiService.get(
            `/reviews`,
            new HttpParams()
                .set('filter', typeof filter === 'string' ? filter : JSON.stringify(filter))
                .set('sortDirection', sortDirection)
                .set('sortField', sortField)
                .set('pageNumber', pageNumber.toString())
                .set('pageSize', pageSize.toString()),
            true
        ).pipe(
            map((res) => {
                if (!res.success) {
                    this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while searching reviews');
                    return of(null);
                }
                res['data'].push(res['count']);
                this.reviewsCountSubject.next(res['count']);
                return res['data'];
            })
        );
    }
}
