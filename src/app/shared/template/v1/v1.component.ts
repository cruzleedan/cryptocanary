import { Component, OnInit, Input } from '@angular/core';
import { ObservableMedia, MediaChange } from '@angular/flex-layout';

@Component({
  selector: 'app-v1',
  templateUrl: './v1.component.html',
  styleUrls: ['./v1.component.scss']
})
export class V1Component implements OnInit {
  @Input() isVisible = true;
  visibility = 'shown';

  sideNavOpened = true;
  matDrawerOpened = false;
  matDrawerShow = true;
  sideNavMode = 'side';
  searchOpen = true;
  constructor(
    private media: ObservableMedia
  ) { }

  ngOnInit() {
    this.media.subscribe((mediaChange: MediaChange) => {
      this.toggleView();
    });
  }
  toggleView() {
    if (this.media.isActive('gt-md')) {
      this.sideNavMode = 'side';
      this.sideNavOpened = true;
      this.matDrawerOpened = false;
      this.matDrawerShow = true;
    } else if (this.media.isActive('gt-xs')) {
      this.sideNavMode = 'side';
      this.sideNavOpened = false;
      this.matDrawerOpened = true;
      this.matDrawerShow = true;
    } else if (this.media.isActive('lt-sm')) {
      this.sideNavMode = 'over';
      this.sideNavOpened = false;
      this.matDrawerOpened = false;
      this.matDrawerShow = false;
      this.searchOpen = false;
    }
    if (this.media.isActive('gt-sm') || this.media.isActive('sm')) {
      this.searchOpen = true;
    }
  }
}
