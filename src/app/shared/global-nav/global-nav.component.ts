import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../core';

@Component({
  selector: 'app-global-nav',
  templateUrl: './global-nav.component.html',
  styleUrls: ['./global-nav.component.scss']
})
export class GlobalNavComponent implements OnInit {
  isAdmin: boolean;
  constructor(
    private userService: UserService
  ) {
    this.userService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  ngOnInit() {
  }

}
