import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Entity } from '../models/entity.model';
import { AlertifyService } from './alertify.service';
import { Util } from '../errors/helpers/util';

@Injectable({
    providedIn: 'root'
})
export class EntityService {
    private searchingSubject = new BehaviorSubject<boolean>(false);
    public searching$ = this.searchingSubject.asObservable();

    private entitiesCountSubject = new BehaviorSubject<number>(0);
    public entitiesCount$ = this.entitiesCountSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private alertifyService: AlertifyService,
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
        return this.apiService.putWithProg('/entities/new', fd);
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
        return this.apiService.putWithProg(`/entities/${entityId}/edit`, fd);
    }

    findEntityById(entityId: string): Observable<Entity> {
        return this.apiService.get(`/entities/${entityId}`)
            .pipe(
                map((res) => {
                    if (!res.success) {
                        this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while searching entity');
                        return of(null);
                    }
                    return res.data ? res.data : of(false);
                })
            );
    }
    approveEntity(entityId: string): Observable<Entity> {
        return this.apiService.post(`/entities/${entityId}/approved`, {})
            .pipe(
                map((res) => {
                    if (!res.success) {
                        this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while processing your request');
                        return of(null);
                    }
                    return res.data ? res.data : of(false);
                })
            );
    }
    search(Obj: Object) {
        const keywords: Observable<string> = Obj['keyword'],
            sortField = Obj['sortField'],
            sortDirection = Obj['sortDirection'],
            pageNum = Obj['pageNum'],
            pageSize = Obj['pageSize'];
        return keywords.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(keyword => {
                if (!keyword) {
                    console.log('keyword is empty');
                    return of([]);
                }
                return this.findEntities(
                    { name: keyword },
                    sortDirection,
                    sortField,
                    pageNum,
                    pageSize
                );
            })
        );
    }

    findEntities(
        filter: object = {}, sortDirection = 'asc', sortField = 'createdAt',
        pageNumber = 0, pageSize = 10
    ): Observable<{data: Entity[], count: number, pending: number}> {
        this.searchingSubject.next(true);
        return this.apiService.get(
            '/entities',
            new HttpParams()
                .set('filter', JSON.stringify(filter))
                .set('sortDirection', sortDirection)
                .set('sortField', sortField)
                .set('pageNumber', pageNumber.toString())
                .set('pageSize', pageSize.toString())
        ).pipe(
            map((res) => {
                this.searchingSubject.next(false);
                const data = <Entity[]> res['data'] || [];
                const count = <number> res['count'] || 0;
                const pending = <number> res['pending'] || 0;
                if (!res.success) {
                    this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while searching entities');
                }
                this.entitiesCountSubject.next(count);
                return {data, count, pending};
            })
        );
    }

    findReviews(
        entityId: string,
        filter: string | object = '',
        sortDirection = 'desc',
        sortField = 'rating',
        pageNumber: number = 1,
        pageSize: number = 10
    ): Observable<Object> {
        return this.apiService.get(
            `/entities/${entityId}/reviews`,
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
                return res;
            }),
            catchError(err => {
                this.alertifyService.error(this.errorUtil.getError(err) || 'Something went wrong while searching entities');
                return of(null);
            })
        );
    }
    getEntities(field: string, pageNumber: string = '0', pageSize: string = '10'): Observable<Entity[]> {
        return this.apiService.get(`/home/entities`,
            new HttpParams()
            .set('field', field)
            .set('pageSize', pageSize)
            .set('pageNumber', pageNumber)
        ).pipe(
            map(res => {
                if (!res.success) {
                    this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while retrieving Entities');
                    return of([]);
                }
                return res.data;
            }),
            catchError(err => {
                this.alertifyService.error(this.errorUtil.getError(err) || 'Something went wrong while retrieving Entities');
                return of([]);
            })
        );
    }
    delete(entityId: string): Observable<Object> {
        return this.apiService.delete(`/entities/${entityId}`)
            .pipe(
                map(res => {
                    if (!res.success) {
                        return of(null);
                    }
                    return res.data;
                }),
                catchError(err => {
                    this.alertifyService.error(this.errorUtil.getError(err) || 'Failed to delete record');
                    return of(null);
                })
            );
    }
}
