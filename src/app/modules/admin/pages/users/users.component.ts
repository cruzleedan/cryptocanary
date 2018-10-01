import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { SelectionModel } from '@angular/cdk/collections';
import { UsersDataSource, UserService, AlertifyService } from '../../../../core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatPaginator, MatSort, MatSlideToggle, MatTable } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { Params } from '@fortawesome/fontawesome-svg-core';
import { MsgDialogComponent } from '../../../../shared/dialog/msg-dialog.component';
import { GlobalService } from '../../../../core/services/global.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit {
  baseUrl = environment.baseUrl;
  masks = [];
  loading: boolean;
  showNavListCode;
  displayedColumns = ['select', 'avatar', 'username', 'firstname', 'lastname', 'email', 'blockFlag', 'action'];
  selection = new SelectionModel<string>(true, []);
  dataSource: UsersDataSource;
  searchFormControl = new FormControl();
  // allfeatures = TABLE_HELPERS;
  constructor(
    private userService: UserService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog,
    private globalService: GlobalService
  ) {
    this.globalService.loadingRequests$.subscribe(requests => {
      this.loading = !!(requests['findUsers']) || !!(requests['search']) || !!(requests['loadUsers']) || !!(requests['deleteUser']);
      if (this.masks.length) {
        this.masks.forEach(mask => {
          mask.style.zIndex = !!(requests['deleteUser']) ? 10 : -1;
        });
      }
    });
  }
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;
  @ViewChild(MatTable) table: MatTable<any>;

  ngOnInit() {
    this.dataSource = new UsersDataSource(this.userService, this.globalService);
    this.loadUsers();
    this.sort.sortChange.subscribe(sort => {
      this.loadUsers();
    });
    this.searchFormControl.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.loadUsers();
        })
      )
      .subscribe(
        (params: Params) => {
          console.log('datasource ', this.dataSource);
        }
      );
    // observableFromEvent(this.filter.nativeElement, 'keyup').pipe(
    //     debounceTime(150),
    //     distinctUntilChanged(), )
    //     .subscribe(() => {
    //         if (!this.dataSource) { return; }
    //         this.dataSource.filter = this.filter.nativeElement.value;
    //     });
  }
  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.loadUsers())
      )
      .subscribe();
  }
  loadUsers() {
    const filter = this.filter.nativeElement.value || '';
    const fields = ['username'];
    this.dataSource.loadUsers(
      {
        filter,
        filterFields: fields,
        sortDirection: this.sort.direction,
        sortField: this.sort.active,
        pageNumber: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize
      }
    );
  }
  isAllSelected(): boolean {
    if (!this.dataSource) { return false; }

    if (this.selection.isEmpty()) { return false; }

    if (this.filter.nativeElement.value) {
      return this.selection.selected.length === this.dataSource.renderedData.length;
    } else {
      return this.selection.selected.length === this.dataSource.renderedData.length;
    }
  }

  masterToggle() {
    if (!this.dataSource) { return; }

    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.renderedData.forEach(data => {
        console.log('select ', data.id);

        this.selection.select(data.id);
      });
      console.log('selection', this.selection);

    }
  }
  onBlockToggle(slide: MatSlideToggle) {
    console.log('toggle', slide);
    this.userService.blockUserToggle(slide['source']['id'], slide.checked)
      .subscribe(user => {
        if (!user) {
          this.alertifyService.error('Failed to block user');
        } else if (user && user.blockFlag === slide.checked) {
          this.alertifyService.success(`Successfully ${slide.checked ? 'blocked!' : 'unblocked!'}`);
        }
      });
  }
  deleteUser(id: string, index: number) {
    this.masks = this.table['_elementRef'].nativeElement.querySelectorAll(`.delete-row-mask[data-row='${index}']`);
    const dialogRef = this.dialog.open(MsgDialogComponent, {
      data: {
        type: 'confirm',
        msg: `Are you sure, you want to delete user?`
      },
      width: '500px',
      hasBackdrop: true,
      panelClass: ''
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp && resp.proceed) {
        this.userService.deleteUser(id).subscribe(res => {
          if (res['success']) {
            this.loadUsers();
            this.alertifyService.success(`Successfully deleted`);
          }
        });
      }
    });
  }
}
