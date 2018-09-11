import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {
  items = [{
    name: 'Companies',
    link: 'companies',
    icon: 'domain'
  }, {
    name: 'People',
    link: 'people',
    icon: 'person'
  }, {
    name: 'Investors',
    link: 'investors',
    icon: 'money'
  }, {
    name: 'Funding Rounds',
    link: 'funding-rounds',
    icon: 'attach_money'
  }, {
    name: 'Acquisitions',
    link: 'acquisitions',
    icon: 'merge_type'
  }, {
    name: 'Schools',
    link: 'schools',
    icon: 'school'
  }, {
    name: 'Events',
    link: 'events',
    icon: 'calendar_today'
  }, {
    name: 'Hubs',
    link: 'hubs',
    icon: 'device_hub'
  }];
  constructor() { }

  ngOnInit() {
  }

}
