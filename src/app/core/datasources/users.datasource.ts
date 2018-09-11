import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, of , Observable } from 'rxjs';
import { catchError, finalize, share } from 'rxjs/operators';
import { Entity } from '../models/entity.model';
import { UserService } from '../services';
import { User } from '../models';

export class UsersDataSource implements DataSource < User > {
    private usersSubject = new BehaviorSubject < User[] > ([]);
    private loadingSubject = new BehaviorSubject < boolean > (false);

    public loading$ = this.loadingSubject.asObservable();
    public count;
    public renderedData = [];
    constructor(private userService: UserService) {}

    connect(collectionViewer: CollectionViewer): Observable < User[] > {
        console.log('Connecting data source');
        return this.usersSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.usersSubject.complete();
        this.loadingSubject.complete();
    }

    loadUsers(
        filter: string,
        filterFields: object,
        sortDirection?: string,
        sortField?: string,
        pageIndex?: number,
        pageSize?: number
    ) {
        console.log('finding users...');
        this.loadingSubject.next(true);
        this.userService.findUsers(
                filter,
                filterFields,
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
            .subscribe(users => {
                console.log('users', users);

                this.count = users.pop(); // remove last item since it's not an entity rather is just a workaround to get filter length
                this.usersSubject.next(users);
                this.renderedData = users;
            });
    }
}
