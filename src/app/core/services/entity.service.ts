import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap, shareReplay, finalize } from 'rxjs/operators';
import { Entity } from '../models/entity.model';
import { AlertifyService } from './alertify.service';
import { Util } from '../errors/helpers/util';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private searchingSubject = new BehaviorSubject<boolean>(false);
  public searching$ = this.searchingSubject.asObservable();

  private entitiesCountSubject = new BehaviorSubject<number>(0);
  public entitiesCount$ = this.entitiesCountSubject.asObservable();

  private searchedEntities = new BehaviorSubject<Entity[]>([]);
  public searchedEntities$ = this.searchedEntities.asObservable();

  private searchedKeyword = new BehaviorSubject<string>('');
  public searchedKeyword$ = this.searchedKeyword.asObservable();

  constructor(
    private apiService: ApiService,
    private alertifyService: AlertifyService,
    private globalService: GlobalService,
    private errorUtil: Util
  ) { }
  addNewEntity(
    body: Object = {},
    image?: File
  ) {
    const fd = new FormData();
    if (image) {
      fd.append('image', image, image.name);
    }
    for (const key of Object.keys(body)) {
      const b = typeof body[key] === 'object' ? JSON.stringify(body[key]) : body[key];
      fd.append(key, b);
    }
    this.globalService.setLoadingRequests('addNewEntity', true);
    return this.apiService.putWithProg('/entities/new', fd, false, () => {
      this.globalService.setLoadingRequests('addNewEntity', false);
    });
  }

  editEntity(
    entityId: string,
    body: Object = {},
    image?: File
  ) {
    const fd = new FormData();
    if (image) {
      fd.append('image', image, image.name);
    }
    for (const key of Object.keys(body)) {
      const b = typeof body[key] === 'object' ? JSON.stringify(body[key]) : body[key];
      fd.append(key, b);
    }
    this.globalService.setLoadingRequests('editEntity', true);
    return this.apiService.putWithProg(`/entities/${entityId}/edit`, fd, false, () => {
      this.globalService.setLoadingRequests('editEntity', false);
    });
  }

  findEntityById(entityId: string): Observable<Entity> {
    this.globalService.setLoadingRequests('findEntityById', true);
    return this.apiService.get(`/entities/${entityId}`)
      .pipe(
        map((res) => {
          if (!res.success) {
            this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while searching entity');
            return of(null);
          }
          return res.data ? res.data : of(false);
        }),
        finalize(() => {
          this.globalService.setLoadingRequests('findEntityById', false);
        })
      );
  }
  approveEntity(entityId: string): Observable<Entity> {
    this.globalService.setLoadingRequests('approveEntity', true);
    return this.apiService.post(`/entities/${entityId}/approved`, {})
      .pipe(
        map((res) => {
          if (!res.success) {
            this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while processing your request');
            return of(null);
          }
          return res.data ? res.data : of(false);
        }),
        finalize(() => {
          this.globalService.setLoadingRequests('approveEntity', false);
        })
      );
  }
  search(Obj: Object) {
    const keywords: Observable<string> = Obj['keyword'],
      sortField = Obj['sortField'],
      sortDirection = Obj['sortDirection'],
      pageNumber = Obj['pageNum'],
      pageSize = Obj['pageSize'];
    this.globalService.setLoadingRequests('search', true);
    return keywords.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(keyword => {
        if (!keyword) {
          console.log('keyword is empty');
          return of([]);
        }
        this.searchedKeyword.next(keyword);
        return this.findEntities(
          {
            filter: { name: keyword },
            sortDirection,
            sortField,
            pageNumber,
            pageSize
          }
        );
      }),
      finalize(() => {
        this.globalService.setLoadingRequests('search', false);
      })
    );
  }

  findEntities(params: {
    filter: object,
    sortDirection: string,
    sortField: string,
    pageNumber?: number,
    pageSize?: number
  }): Observable<{ data: Entity[], count: number, pending: number }> {
    const defaults = {
      filter: {},
      sortDirection: 'asc',
      sortField: 'createdAt',
      pageNumber: 0,
      pageSize: 10
    };
    Object.keys(defaults).forEach(key => {
      params[key] = params[key] || defaults[key];
    });

    this.globalService.setLoadingRequests('findEntities', true);
    return this.apiService.get(
      '/entities',
      new HttpParams()
        .set('filter', JSON.stringify(params.filter))
        .set('sortDirection', params.sortDirection)
        .set('sortField', params.sortField)
        .set('pageNumber', typeof params.pageSize === 'number' ? params.pageNumber.toString() : '')
        .set('pageSize', typeof params.pageNumber === 'number' ? params.pageSize.toString() : '')
    ).pipe(
      map((res) => {
        this.searchingSubject.next(false);
        const data = <Entity[]>res['data'] || [];
        const count = <number>res['count'] || 0;
        const pending = <number>res['pending'] || 0;
        if (!res.success) {
          this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while searching entities');
        }
        this.entitiesCountSubject.next(count);
        this.searchedEntities.next(data);
        return { data, count, pending };
      }),
      finalize(() => {
        this.globalService.setLoadingRequests('findEntities', false);
      })
    );
  }

  findReviews(params: {
    entityId: string,
    filter: string | object,
    sortDirection,
    sortField,
    pageNumber: number,
    pageSize: number
  }): Observable<Object> {
    const defaults = {
      filter: '',
      sortDirection: 'desc',
      sortField: 'rating',
      pageNumber: 0,
      pageSize: 10
    };
    Object.keys(defaults).forEach(key => {
      params[key] = params[key] || defaults[key];
    });

    console.log('find reviews', params);
    return this.apiService.get(
      `/entities/${params.entityId}/reviews`,
      new HttpParams()
        .set('filter', typeof params.filter === 'string' ? params.filter : JSON.stringify(params.filter))
        .set('sortDirection', params.sortDirection)
        .set('sortField', params.sortField)
        .set('pageNumber', typeof params.pageSize === 'number' ? params.pageNumber.toString() : '')
        .set('pageSize', typeof params.pageNumber === 'number' ? params.pageSize.toString() : ''),
      true
    ).pipe(
      map((res) => {
        if (!res.success) {
          this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while searching reviews');
          return of(null);
        }
        return res;
      }),
      shareReplay()
    );
  }
  getEntities(params: {
    field: Object,
    filter?: Object,
    pageNumber: number,
    pageSize: number
  }): Observable<Entity[]> {
    const defaults = {
      field: [],
      filter: {},
      pageNumber: 0, // default pageNumber
      pageSize: 10 // default pageSize
    };
    Object.keys(defaults).forEach(key => {
      params[key] = params[key] || defaults[key];
    });

    params.filter = typeof params.filter === 'object' ? params.filter : {approved: true};
    params.field = typeof params.field === 'object' ? params.field : [['createdAt', 'desc']];
    this.globalService.setLoadingRequests('getEntities', true);
    return this.apiService.get(`/home/entities`,
      new HttpParams()
        .set('field', JSON.stringify(params.field))
        .set('filter', JSON.stringify(params.filter))
        .set('pageSize', typeof params.pageSize === 'number' ? params.pageSize.toString() : '')
        .set('pageNumber', typeof params.pageNumber === 'number' ? params.pageNumber.toString() : '')
    ).pipe(
      map(res => {
        if (!res.success) {
          this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while retrieving Entities');
          return of([]);
        }
        return res;
      }),
      shareReplay(),
      finalize(() => {
        this.globalService.setLoadingRequests('getEntities', false);
      })
    );
  }
  deleteEntity(entityId: string): Observable<Object> {
    this.globalService.setLoadingRequests('deleteEntity', true);
    return this.apiService.delete(`/entities/${entityId}`)
      .pipe(
        map(res => {
          if (!res.success) {
            return of(null);
          }
          return res.data;
        }),
        finalize(() => {
          this.globalService.setLoadingRequests('deleteEntity', false);
        })
      );
  }
}
