import { Component, OnInit, HostListener, Input, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../core';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {
  isOpen = false;

  // currentUser = null;
  Hari;


  @Input() currentUser = null;
  @HostListener('document:click', ['$event', '$event.target'])
  onClick(event: MouseEvent, targetElement: HTMLElement) {
    if (!targetElement) {
      return;
    }

    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.isOpen = false;
    }
  }


  constructor(
    private elementRef: ElementRef,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) { }


  ngOnInit() {
    console.log('route', this.route);

  }
  logout() {
    this.userService.signOut();
    this.userService.purgeAuth();
    this.router.navigate([this.route.snapshot['_routerState']['url']]);
  }
}
