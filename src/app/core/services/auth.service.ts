import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MsgDialogComponent } from '../../shared/dialog/msg-dialog.component';
import { AlertifyService } from './alertify.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private dialog: MatDialog,
    private alertifyService: AlertifyService,
    private ngZone: NgZone
  ) { }
  showAuthFormPopup(callback?) {
    console.log('showAuthFormPopup');

    this.ngZone.run(() => {
      const dialogRef = this.dialog.open(MsgDialogComponent, {
        data: {
          isAuth: true
        },
        width: '500px',
        hasBackdrop: true,
        panelClass: 'auth-popup-form'
      });
      dialogRef.afterClosed().subscribe(resp => {
        if (callback && typeof callback === 'function') {
          callback(resp);
        } else if (resp && resp.data && resp.data.success) {
          this.alertifyService.success('Successfully logged in');
        }
      });
    });
  }
  showBlockErrPopup() {
    const dialogRef = this.dialog.open(MsgDialogComponent, {
      data: {
        type: 'error-block',
        msg: 'Sorry, your account has been blocked.'
      },
      width: '300px',
      height: '200px',
      hasBackdrop: true,
      panelClass: 'error'
    });
    dialogRef.afterClosed().subscribe(resp => {
      // do something
    });
  }
  showForbiddenErrPopup() {
    const dialogRef = this.dialog.open(MsgDialogComponent, {
      data: {
        type: 'error-forbidden',
        msg: 'Forbidden.'
      },
      width: '300px',
      height: '200px',
      hasBackdrop: true,
      panelClass: 'error'
    });
    dialogRef.afterClosed().subscribe(resp => {
      // do something
    });
  }
}
