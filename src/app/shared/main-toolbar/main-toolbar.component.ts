import { Component, OnInit, Input } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { User, UserService } from '../../core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main-toolbar',
  templateUrl: './main-toolbar.component.html',
  styleUrls: ['./main-toolbar.component.scss']
})
export class MainToolbarComponent implements OnInit {
  baseUrl = environment.baseUrl;
  @Input() sidenav: MatSidenav;

  toolbarHelpers = {
    notifications: [
      // {
      //     id: 'id',
      //     title: 'Mail 5',
      //     lastTime: '23 Minutes ago',
      //     state: 'state'
      // }
    ],
    currentUser: {
      photoURL: 'assets/images/avatars/hari.jpg',
      currentUserName: 'Dan Cruz'
    }
  };
  user: User;
  isAuthenticated: boolean;
  constructor(
    private userService: UserService
  ) {
    this.userService.isAuthenticated
      .subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
      });
      this.userService.currentUser
      .subscribe(user => {
          this.user = user;
          this.toolbarHelpers.currentUser.currentUserName = this.user.username;
          this.toolbarHelpers.currentUser.photoURL = this.user.avatar ?
              `${this.baseUrl}/avatar/${this.user.id}/${this.user.avatar}` : '';
      });
  }

  ngOnInit() {
  }

}
