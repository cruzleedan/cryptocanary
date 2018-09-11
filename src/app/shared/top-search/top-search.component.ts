import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-top-search',
  templateUrl: './top-search.component.html',
  styleUrls: ['./top-search.component.scss']
})
export class TopSearchComponent implements OnInit {
  searchCtrl = new FormControl();
  options = [];
  constructor() { }

  ngOnInit() {
  }

}
