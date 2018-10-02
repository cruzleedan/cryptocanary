import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { UserService, User, AlertifyService, EntityService } from '../../core';
import { Entity } from '../../core/models/entity.model';
import { MatDialog, MatSlideToggleChange } from '@angular/material';
import { MsgDialogComponent } from '../dialog/msg-dialog.component';
import { GlobalService } from '../../core/services/global.service';

@Component({
  selector: 'app-entity-action-buttons',
  templateUrl: './entity-action-buttons.component.html',
  styleUrls: ['./entity-action-buttons.component.scss']
})
export class EntityActionButtonsComponent implements OnInit {
  @Input() entity: Entity;
  @Input() menu?: boolean;
  @Output() afterDelete: EventEmitter<any> = new EventEmitter();
  @Output() afterApprove: EventEmitter<any> = new EventEmitter();
  isAdmin: boolean;
  loading: boolean;
  currentUser: User;
  @ViewChild('mask', {read: ElementRef}) mask: ElementRef;
  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private entityService: EntityService,
    private alertifyService: AlertifyService,
    private globalService: GlobalService
  ) {
    this.userService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
    console.log('ENTITY IS ', this.entity);
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.globalService.loadingRequests$.subscribe(requests => {
      this.loading = !!(requests['deleteEntity']) || !!(requests['approveEntity']);
      if (!this.loading) {
        try {
          this.mask.nativeElement.style.zIndex = -1;
        } catch (e) {}
      }
    });
  }

  ngOnInit() { }

  delete() {
    const dialogRef = this.dialog.open(MsgDialogComponent, {
      data: {
        type: 'confirm',
        msg: `Are you sure, you want to delete ${this.entity.name}?`
      },
      width: '500px',
      hasBackdrop: true,
      panelClass: ''
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp && resp.proceed) {

        this.entityService.deleteEntity(this.entity.id)
          .subscribe(del => {
            if (del) {
              this.alertifyService.success('Successfully deleted');
              this.afterDelete.emit(del);
            }
          });
          this.mask.nativeElement.style.zIndex = this.loading ? 100 : -1;
      }
    });

  }
  approveChange(toggle: MatSlideToggleChange) {
    console.log('toggle value', toggle.checked);
    if (toggle.checked) {
      this.approveEntity();
    }
  }
  approveClicked() {
    this.entity.approved = !this.entity.approved;
    if (this.entity.approved) {
      this.approveEntity();
    }
  }
  approveEntity() {
    this.entityService.approveEntity(this.entity.id)
      .subscribe(resp => {
        if (resp && resp.approved) {
          this.afterApprove.emit(resp);
          this.alertifyService.success(`${this.entity.name} has been approved`);
        } else {
          this.entity.approved = !this.entity.approved;
        }
      });
      this.mask.nativeElement.style.zIndex = this.loading ? 100 : -1;
  }
}
