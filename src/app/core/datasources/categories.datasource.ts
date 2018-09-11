import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, of , Observable } from 'rxjs';
import { catchError, finalize, share } from 'rxjs/operators';
import { UserService, CategoryService } from '../services';
import { User, Category } from '../models';

export class CategoriesDataSource implements DataSource < Category > {
    private categoriesSubject = new BehaviorSubject < Category[] > ([]);
    private loadingSubject = new BehaviorSubject < boolean > (false);

    public loading$ = this.loadingSubject.asObservable();
    public renderedData = [];
    constructor(private categoryService: CategoryService) {
    }

    connect(collectionViewer: CollectionViewer): Observable < Category[] > {
        console.log('Connecting data source');
        return this.categoriesSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.categoriesSubject.complete();
        this.loadingSubject.complete();
    }

    loadCategories(
        filter: object,
        sortDirection?: string,
        sortField?: string,
        pageIndex?: number,
        pageSize?: number
    ) {
        this.loadingSubject.next(true);
        this.categoryService.findCategories(
                filter,
                sortDirection,
                sortField,
                pageIndex,
                pageSize
            )
            .pipe(
                share(),
                catchError(() => of ([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(categories => {
                this.categoriesSubject.next(categories);
                this.renderedData = categories;
            });
    }
}
