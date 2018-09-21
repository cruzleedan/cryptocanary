import { Component, OnInit } from '@angular/core';
import { UserService } from './core';
import { NotificationService } from './core/errors/services/notification/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'cryptocanary';
  notification: string;
  showNotification: boolean;
  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {

  }
  ngOnInit() {
    this.userService.populate();
    this.notificationService
      .notification$
      .subscribe(message => {
        this.notification = message;
        this.showNotification = true;
      });
  }
}
