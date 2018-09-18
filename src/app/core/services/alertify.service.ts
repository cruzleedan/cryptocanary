import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MsgDialogComponent } from '../../shared/dialog/msg-dialog.component';
declare const alertify: any;

@Injectable({
  providedIn: 'root'
})
export class AlertifyService {

  constructor(
  ) { }

  confirm(message: string, okCallback: () => any) {
    alertify.confirm(message, (e) => {
      if (e) {
        okCallback();
      } else {
        // Do nothing
      }
    });
  }

  success(message: string) {
    alertify.success(message);
  }

  error(error: any) {
    let message;
    if (typeof error === 'object') {
      if (error.hasOwnProperty('status')) {
        switch (error.status) {
          case 401:
            // show login form popup
            break;
        }
      } else if (error.hasOwnProperty('error') && typeof error.error === 'string') {
        message = error.error;
      }
    } else if (typeof error === 'string') {
      message = error;
    }

    if (message) {
      alertify.error(message);
    }
  }

  warning(message: string) {
    alertify.warning(message);
  }

  message(message: string) {
    alertify.message(message);
  }
}
