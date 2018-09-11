import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, of , Observable } from 'rxjs';
import { catchError, finalize, share } from 'rxjs/operators';
import { Entity } from '../models/entity.model';
import { EntityService } from '../services';

export class EntitiesDataSource implements DataSource < Entity > {
    private entitiesSubject = new BehaviorSubject < Entity[] > ([]);
    private loadingSubject = new BehaviorSubject < boolean > (false);

    public loading$ = this.loadingSubject.asObservable();
    public count;
    public pending;

    constructor(private entityService: EntityService) {}

    connect(collectionViewer: CollectionViewer): Observable < Entity[] > {
        console.log('Connecting data source');
        return this.entitiesSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.entitiesSubject.complete();
        this.loadingSubject.complete();
    }

    loadEntities(
        filter: Object,
        sortDirection: string,
        sortField: string,
        pageIndex: number,
        pageSize: number
    ) {
        console.log('Entities Datasource loadEntities called');

        this.loadingSubject.next(true);
        this.entityService.findEntities(
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
            .subscribe((resp: {data: Entity[], count: number, pending: number}) => {
                this.count = resp.count;
                this.pending = resp.pending;
                this.entitiesSubject.next(resp.data);
            });
    }
}
