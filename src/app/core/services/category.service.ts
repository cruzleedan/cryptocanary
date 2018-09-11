import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Entity } from '../models/entity.model';
import { HttpParams } from '@angular/common/http';
import { Category } from '../models/category.model';
import { CategoryMenu } from '../models/category-menu.model';
import { AlertifyService } from './alertify.service';
import { Util } from '../errors/helpers/util';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private categoriesSubject = new BehaviorSubject < CategoryMenu[] > ([]);
    public categories$ = this.categoriesSubject.asObservable();

    private searchingSubject = new BehaviorSubject<boolean>(false);
    public searching$ = this.searchingSubject.asObservable();

    private categoriesCountSubject = new BehaviorSubject <number> (0);
    public categoriesCount$ = this.categoriesCountSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private alertifyService: AlertifyService,
        private errorUtil: Util
    ) { }

    getCategories(): Observable<CategoryMenu[]> {
        return this.apiService.get('/categories')
            .pipe(
                map((res) => {
                    if (!res['success']) {
                        this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while loading Categories');
                        return of([]);
                    }
                    this.categoriesSubject.next(res['data']);
                    return res['data'];
                }),
                // catchError(err => {
                //     this.alertifyService.error(this.errorUtil.getError(err) || 'Something went wrong while loading Categories');
                //     return of([]);
                // })
            );
    }
    findCategoryById(categoryId: string): Observable<Category> {
        return this.apiService.get(`/categories/${categoryId}`)
            .pipe(
                map((res) => {
                    if (!res['success']) {
                        this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while loading Category');
                        return of(null);
                    }
                    return res['data'];
                }),
                catchError(err => {
                    this.alertifyService.error(this.errorUtil.getError(err) || 'Something went wrong while loading Category');
                    return of(null);
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
                return this.findCategories(
                    { category: keyword },
                    sortDirection,
                    sortField,
                    pageNum,
                    pageSize
                );
            })
        );
    }
    findCategories(
        filter: object = {}, sortDirection = 'asc', sortField = 'category',
        pageNumber = 0, pageSize = 10
    ): Observable<Category[]> {
        this.searchingSubject.next(true);
        return this.apiService.get(
            '/categories/find',
            new HttpParams()
                .set('filter', JSON.stringify(filter))
                .set('sortDirection', sortDirection)
                .set('sortField', sortField)
                .set('pageNumber', pageNumber.toString())
                .set('pageSize', pageSize.toString())
        ).pipe(
            map((res) => {
                this.searchingSubject.next(false);
                if (!res || !res['success']) {
                    this.alertifyService.error(this.errorUtil.getError(res) || 'Something went wrong while finding categories');
                    return of([]);
                }
                const count = res['count'] || 0,
                data = res['data'] || [];
                this.categoriesCountSubject.next(count);
                return res['data'];
            }),
            catchError(err => {
                this.searchingSubject.next(false);
                this.alertifyService.error(this.errorUtil.getError(err) || 'Something went wrong while finding categories');
                return of([]);
            })
        );
    }
    updateCategory(
        categoryId: string,
        image: File,
        body: object
    ) {
        const fd = new FormData();
        if (image) {
            fd.append('avatar', image, image.name);
        }
        for (const key of Object.keys(body)) {
            const b = typeof body[key] === 'object' ? JSON.stringify(body[key]) : body[key];
            fd.append(key, b);
        }
        return this.apiService.putWithProg(`/categories/${categoryId}`, fd);
    }
    checkCategoryNameNotTaken(name: string): Observable<boolean> {
        if (!name) { return of(false); }
        return this.apiService.get(`/categories/checkcategoryname`, new HttpParams().set('categoryName', name))
        .pipe(
            map(res => {
                if (!res.success) {
                    this.alertifyService.error(this.errorUtil.getError(res) || 'Failed to check Category Name');
                    return of(null);
                }
                return res.data;
            }),
            catchError(err => {
                this.alertifyService.error(this.errorUtil.getError(err) || 'Failed to check Category Name');
                return of(null);
            })
        );
    }
}
