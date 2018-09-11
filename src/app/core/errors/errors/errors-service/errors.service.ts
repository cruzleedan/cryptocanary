import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, Event, NavigationError } from '@angular/router';

import { Observable, Subject, of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services';


@Injectable()
export class ErrorsService {

  constructor(
    private injector: Injector,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService
  ) {
    // Subscribe to the NavigationError
    this.router
      .events
      .subscribe((event: Event) => {
        if (event.hasOwnProperty('error') && event['error'] instanceof HttpErrorResponse) {

        } else if (event instanceof NavigationError) {
          // Redirect to the ErrorComponent
          this.log(event.error)
            .subscribe((errorWithContext) => {
              if (!errorWithContext.status || (errorWithContext.status && ![401].includes(errorWithContext.status))) {
                console.log('Navigation error will redirect to error page', errorWithContext);
                this.router.navigate(['/error'], { queryParams: errorWithContext });
              } else {
                console.log('will show popup login');
                this.authService.showAuthFormPopup();
              }
            });
        }
      });
  }

  log(error) {
    // Log the error to the console
    console.error(error);
    // Send error to server
    const errorToSend = this.addContextInfo(error);
    return this.apiService.post('/errors', {error: errorToSend});
  }

  addContextInfo(error) {
    // You can include context details here (usually coming from other services: UserService...)
    const name = error.name || null;
    const appId = 'Cryptocaution';
    const user = 'User';
    const time = new Date().getTime();
    const id = `${appId}-${user}-${time}`;
    const location = this.injector.get(LocationStrategy);
    const url = location instanceof PathLocationStrategy ? location.path() : '';
    const status = error.status || null;
    const message = error.message || error.toString();
    const stack = error instanceof HttpErrorResponse ? null : error;

    const errorWithContext = { name, appId, user, time, id, url, status, message, stack };
    return errorWithContext;
  }

}

