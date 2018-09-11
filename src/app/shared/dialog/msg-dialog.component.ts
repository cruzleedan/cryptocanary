import { Component, Inject, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from '../../core';

@Component({
    selector: 'app-msg-dialog',
    templateUrl: './msg-dialog.component.html',
    styleUrls: ['./msg-dialog.component.scss']
})
export class MsgDialogComponent implements OnInit {
    title: string;
    confirmBtnTxt: string;
    cancelBtnTxt: string;
    msg: string;
    type: string;
    details: string;
    isAuth = false;
    constructor(
        private userService: UserService,
        private ref: ChangeDetectorRef,
        public dialogRef: MatDialogRef<MsgDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data
    ) {
        if (this.data.type && this.data.type === 'error') {
            const charCount = 100;
            this.msg = this.data.msg || 'Something went wrong!';
            this.msg = this.msg.substr(0, charCount);
            this.title = this.data.title;
            const msgCont: string = this.data.msg.substr(charCount) || '';
            this.details = this.data.details !== this.msg ? msgCont + this.data.details : msgCont;
        }

    }
    ngOnInit() {
        console.log('DIALOG ONINIT');

    }
    close() {
        this.dialogRef.close();
    }
    attemptAuth(event) {
        this.userService.isAuthenticated.subscribe(auth => {
            if (auth) {
                this.dialogRef.close(event);
            }
        });
    }
    onConfirm() {
        this.dialogRef.close({ proceed: true });
    }
}
