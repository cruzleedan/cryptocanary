import { Component } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Breadcrumb } from '../../core';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';

@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent {

    breadcrumbs: Breadcrumb[] = [];

    constructor(private router: Router, private breadcrumbProvider: BreadcrumbService) {
        this.router.events.subscribe(e => {
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

}
