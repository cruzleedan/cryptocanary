import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { UserService, User, AlertifyService, EntityService } from '../../core';
import { Entity } from '../../core/models/entity.model';
import { MatDialog, MatSlideToggleChange } from '@angular/material';
import { MsgDialogComponent } from '../dialog/msg-dialog.component';

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
  currentUser: User;
  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private entityService: EntityService,
    private alertifyService: AlertifyService
  ) {
    this.userService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
    console.log('ENTITY IS ', this.entity);
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
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

        this.entityService.delete(this.entity.id)
          .subscribe(del => {
            if (del) {
              this.alertifyService.success('Successfully deleted');
              this.afterDelete.emit(del);
            }
          });
      }
    });

  }
  approveChange(toggle: MatSlideToggleChange) {
    console.log('toggle value', toggle.checked);
    if (toggle.checked) {
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
  }
}
