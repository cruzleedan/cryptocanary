import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../../core/services/global.service';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {
  loading: boolean;
  constructor(
    private globalService: GlobalService
  ) {
    this.globalService.loadingRequests$.subscribe(requests => {
      console.log('attempt auth', requests['attemptAuth']);

      this.loading = !!(requests['attemptAuth']);
    });
  }

  ngOnInit() {
  }

}
