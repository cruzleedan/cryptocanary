import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  scamProjects = [{
    name: 'Lite Coin (LTC)',
    rating: '-10',
    desc: 'Velit reprehenderit reprehenderit fugiat non aliquip qui.',
    User: {name: 'John Doe'},
    createdAt: '9/11/2018'
  }];
  recentProjects = [{
    name: 'Lite Coin (LTC)',
    rating: '-10',
    desc: 'Velit reprehenderit reprehenderit fugiat non aliquip qui.',
    User: {name: 'John Doe'},
    createdAt: '9/11/2018'
  }];
  constructor() { }

  ngOnInit() {
  }

}
