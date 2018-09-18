import { Injectable } from '@angular/core';
import { Breadcrumb } from '../models';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {

  _addItem = new Subject<Breadcrumb>();

  constructor(private router: Router) { }

  addItem(label: string, href: string = this.router.url): void {
    this._addItem.next(new Breadcrumb(label, href));
  }
}
