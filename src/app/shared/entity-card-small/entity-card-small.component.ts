import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-entity-card-small',
  templateUrl: './entity-card-small.component.html',
  styleUrls: ['./entity-card-small.component.scss']
})
export class EntityCardSmallComponent implements OnInit {
  @Input() class;
  @Input() data: any[];
  constructor() { }

  ngOnInit() {
  }

}
