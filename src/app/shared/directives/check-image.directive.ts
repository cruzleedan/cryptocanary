import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appCheckImage]'
})
export class CheckImageDirective {

  constructor(el: ElementRef) {
    el.nativeElement.onerror = function () {
      console.log('Image does not exist. ');
      el.nativeElement.src = '/assets/images/entities/default.png'; // set default image
    };
  }

}
