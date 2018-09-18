import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GlobalService } from '../../../core/services/global.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
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
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    this.returnUrl = decodeURIComponent(this.returnUrl);
  }
  signInWithFB(): void {
    this.userService.signInWithFB((data) => {
      if (data.success) {
        console.log('will redirect to ', [this.returnUrl]);
        this.router.navigate([this.returnUrl]);
      }
    });
  }

}
