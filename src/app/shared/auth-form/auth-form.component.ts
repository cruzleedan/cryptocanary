import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, Errors } from '../../core';
import { ShowOnDirtyErrorStateMatcher, MatDialog } from '@angular/material';
import { MsgDialogComponent } from '../dialog/msg-dialog.component';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-auth-form',
    templateUrl: './auth-form.component.html',
    styleUrls: ['./auth-form.component.scss']
})
export class AuthFormComponent implements OnInit {
    @Input() authType: String;
    @Output() attemptAuth = new EventEmitter();
    loading: boolean;
    isLogin: Boolean;
    isRegister: Boolean;
    title: String = '';
    errors = { error: '' };
    isSubmitting = false;
    authForm: FormGroup;
    matcher = new ShowOnDirtyErrorStateMatcher();
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private fb: FormBuilder,
        private dialog: MatDialog
    ) {
        // use FormBuilder to create a form group
        this.authForm = new FormGroup({
            'username': new FormControl('', [
                Validators.required
            ]),
            'password': new FormControl('', [
                Validators.required
            ])
        });
    }

    ngOnInit() {
        // add form control for email if this is the register page
        if (this.authType === 'register') {
            this.signUp();
        } else if (this.authType === 'login') {
            this.signIn();
        }
    }

    submitForm() {
        this.isSubmitting = true;
        this.errors = { error: '' };

        const credentials = this.authForm.value;
        this.loading = true;
        this.userService
            .attemptAuth(this.authType, credentials)
            .pipe(
                finalize(() => {
                    this.loading = false;
                }),
                catchError(err => {

                    console.log('attempt auth error', err);

                    this.attemptAuth.emit(false);
                    if (typeof err.error === 'object' && typeof err.error.error === 'object') {
                        Object.keys(err.error).forEach(field => {
                            console.log(this.authForm.get(field).value);
                            this.authForm.get(field).setErrors({ 'server': err.error[field] });
                        });
                    } else {
                        let error = '';
                        if (err.error && typeof err.error === 'string') {
                            error = err.error;
                        } else if (err.error && typeof err.error.error === 'string') {
                            error = err.error.error;
                        }
                        console.log('error', error);

                        const register = error.toLowerCase() === 'not registered';
                        const dialogRef = this.dialog.open(MsgDialogComponent, {
                            data: {
                                msg: error,
                                type: 'error',
                                title: 'Error',
                                isRegister: register
                            },
                            width: '300px',
                            hasBackdrop: true,
                            panelClass: 'error'
                        });

                        this.isSubmitting = false;
                    }
                    return of([]);
                })
            )
            .subscribe(
                data => {
                    if (data['success']) {
                        this.attemptAuth.emit({ data });
                    } else {
                        this.attemptAuth.emit(false);
                    }
                }
            );
    }
    fbLogin() {
        this.userService.fbLogin()
            .then((cred) => {
                console.log('fblogin ', cred);
                this.userService.fbAuth(cred).subscribe((resp) => {
                    if (resp.success) {
                        this.attemptAuth.emit(true);
                    } else {
                        this.attemptAuth.emit(false);
                    }
                });
            }).catch((err) => {
                this.attemptAuth.emit(false);
                const dialogRef = this.dialog.open(MsgDialogComponent, {
                    data: {
                        msg: 'Something went wrong while communicating to the server',
                        type: 'error',
                        title: 'Error',
                        details: err,
                    },
                    width: '300px',
                    hasBackdrop: true,
                    panelClass: 'error'
                });
            });
    }
    signIn() {
        this.isLogin = true;
        this.isRegister = false;
        this.title = 'Login';

        if (this.authForm.contains('email')) {
            this.authForm.removeControl('email');
        }
        this.authType = 'login';
    }
    signUp() {
        this.isLogin = false;
        this.isRegister = true;
        this.title = 'Register';

        if (!this.authForm.contains('email')) {
            this.authForm.addControl('email', new FormControl('', [
                Validators.required,
                Validators.email,
            ]));
        }
        this.authType = 'register';
    }
}
