import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService, User } from '../../core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Entity } from '../../core/models/entity.model';
import { GlobalService } from '../../core/services/global.service';

@Component({
  selector: 'app-entity-card-overview',
  templateUrl: './entity-card-overview.component.html',
  styleUrls: ['./entity-card-overview.component.scss']
})
export class EntityCardOverviewComponent implements OnInit {
  baseUrl = environment.baseUrl;
  isAdmin: boolean;
  isAuthenticated: boolean;
  @Input() data: any[];
  constructor(
    private router: Router,
    private userService: UserService,
    private globalService: GlobalService
  ) {
    this.userService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
    });
    this.userService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  ngOnInit() {
  }
  afterEntityDelete(entity: Entity) {
    if (entity && entity.id) {
      this.data = this.data.filter(item => {
        return item.id !== entity.id;
      });
    }
  }
  afterEntityApprove(entity: Entity) {
    if (entity.approved) {
      this.data = this.data.filter(item => {
        return item.id !== entity.id;
      });
    }
  }
}
