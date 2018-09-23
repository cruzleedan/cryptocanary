import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appCheckImage]'
})
export class CheckImageDirective {
  defaultImage = '/assets/images/entities/default.png';
  constructor(public el: ElementRef) {
    this.el.nativeElement.style.opacity = 0;
    this.setTransitions();
    el.nativeElement.onload = function () {
      setTimeout(() => {
        el.nativeElement.style.opacity = 1;
      }, 10);
    };

    el.nativeElement.onerror =  () => {
      el.nativeElement.src = this.defaultImage; // set default image
      this.setTransitions();
    };
  }
  setTransitions() {
    this.el.nativeElement.style.transition = 'opacity 1s ease-in';
    this.el.nativeElement.style.WebkitTransition = 'opacity 1s ease-in';
    this.el.nativeElement.style.MozTransition = 'opacity 1s ease-in';
  }

}
