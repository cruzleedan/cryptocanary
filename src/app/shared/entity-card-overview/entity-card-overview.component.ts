import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-entity-card-overview',
  templateUrl: './entity-card-overview.component.html',
  styleUrls: ['./entity-card-overview.component.scss']
})
export class EntityCardOverviewComponent implements OnInit {
  baseUrl = environment.baseUrl;
  @Input() data: any[];

  constructor() { }

  ngOnInit() {
  }

}
