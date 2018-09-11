import { Injectable, NgZone } from '@angular/core';

import { Observable, BehaviorSubject, of } from 'rxjs';
import { MatDialog } from '@angular/material';
import { MsgDialogComponent } from '../../../../shared/dialog/msg-dialog.component';



@Injectable()
export class NotificationService {

    private _notification: BehaviorSubject<string> = new BehaviorSubject(null);
    readonly notification$: Observable<string> = this._notification.asObservable();
    constructor(
        private dialog: MatDialog,
        private ngZone: NgZone
    ) { }


    notify(message, title?) {
        console.log('Notify ', title, message);

        this._notification.next(message);
        this.ngZone.run(() => {
            this.dialog.open(MsgDialogComponent, {
                data: {
                    msg: title || 'Something went wrong!',
                    details: message,
                    type: 'error',
                    title: 'Oops!'
                },
                width: '300px',
                height: '200px',
                hasBackdrop: true,
                panelClass: 'error'
            });
        });
    }

}
