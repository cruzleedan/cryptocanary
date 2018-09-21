import { Component, Input, OnDestroy } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Breadcrumb } from '../../core';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnDestroy {
  @Input() size: string;
  breadcrumbs: Breadcrumb[] = [];
  // @Input() currentPage$: BehaviorSubject<Breadcrumb> = new BehaviorSubject<Breadcrumb>({
  //   label: '',
  //   href: ''
  // });

  @Input() currentPage: Breadcrumb;
  @Input() currentPages: Breadcrumb[];
  destroySubject$: Subject<void> = new Subject();
  constructor(private router: Router, private breadcrumbProvider: BreadcrumbService) {

    this.router.events
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(e => {
        if (e instanceof ActivationEnd) {
          if (e.snapshot.data.breadcrumbs) {
            this.breadcrumbs = Object.assign([], e.snapshot.data.breadcrumbs);
          } else {
            if (this.breadcrumbs.length <= 0 && e.snapshot.data.defaultBreadcrumbs) {
              this.breadcrumbs = Object.assign([], e.snapshot.data.defaultBreadcrumbs);
            }
          }
        }
      });

    this.breadcrumbProvider._addItem.subscribe(breadcrumb => this.breadcrumbs.push(breadcrumb));
  }
  ngOnDestroy(): void {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
}
