import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, Errors } from '../../core';
import { ShowOnDirtyErrorStateMatcher, MatDialog } from '@angular/material';
import { MsgDialogComponent } from '../dialog/msg-dialog.component';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { GlobalService } from '../../core/services/global.service';

@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss']
})
export class AuthFormComponent implements OnInit {
  @Input() authType: String;
  @Output() attemptAuth = new EventEmitter();
  returnUrl: string;
  loading: boolean;
  constructor(
    private userService: UserService,
    private globalService: GlobalService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.globalService.loadingRequests$.subscribe(requests => {
      console.log('attempt auth', requests['attemptAuth']);

      this.loading = !!(requests['attemptAuth']);
    });
  }
  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
    this.returnUrl = decodeURIComponent(this.returnUrl);
  }
  signInWithFB(): void {
    this.userService.signInWithFB((data) => {
      if (data.success && this.returnUrl) {
        console.log('will redirect to ', [this.returnUrl]);
        this.router.navigate([this.returnUrl]);
      }
      this.attemptAuth.emit(data);
    });
  }
}
