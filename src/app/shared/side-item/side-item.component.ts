import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-side-item',
  templateUrl: './side-item.component.html',
  styleUrls: ['./side-item.component.scss']
})
export class SideItemComponent implements OnInit {
  @Input() class;
  @Input() title;
  @Input() subtitle;
  @Input() data: any[];
  constructor() { }

  ngOnInit() {
  }

}
