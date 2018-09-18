import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { EntityService } from '../services';
import { Review } from '../models/review.model';
import { Util } from '../errors/helpers/util';

export class ReviewsDataSource implements DataSource<Review> {
  private reviewsSubject = new BehaviorSubject<Review[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string>('');

  public errorSubject$ = this.errorSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private entityService: EntityService,
    private errorUtil: Util
  ) { }

  connect(collectionViewer: CollectionViewer): Observable<Review[]> {
    console.log('Connecting data source');
    return this.reviewsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.reviewsSubject.complete();
    this.loadingSubject.complete();
  }

  loadReviews(entityId: string,
    filter: string,
    sortDirection: string,
    sortField: string,
    pageIndex: number,
    pageSize: number) {
    this.loadingSubject.next(true);
    this.entityService.findReviews({
      entityId,
      filter,
      sortDirection,
      sortField,
      pageNumber: pageIndex,
      pageSize
    })
      .pipe(
        catchError((err) => {
          this.errorSubject.next(this.errorUtil.getError(err));
          return of([]);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(resp => {
        if (resp['success']) {
          this.reviewsSubject.next(resp['data']);
        } else if (resp['error']) {
          this.errorSubject.next(this.errorUtil.getError(resp));
        }
      });
  }
}
