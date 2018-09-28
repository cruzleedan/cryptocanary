
import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';

import { ErrorsService } from '../errors-service/errors.service';
import { NotificationService } from '../../services/notification/notification.service';
import { AuthService } from '../../../services/auth.service';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import * as StackTrace from 'stacktrace-js';

@Injectable()
export class ErrorsHandler implements ErrorHandler {
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private ngZone: NgZone
  ) { }

  handleError(error: HttpErrorResponse) {
    console.log('My error handler');
    const notificationService = this.injector.get(NotificationService);
    const errorsService = this.injector.get(ErrorsService);
    const router = this.injector.get(Router);

    const location = this.injector.get(LocationStrategy);
    const message = error.message ? error.message : error.toString();
    const url = location instanceof PathLocationStrategy
      ? location.path() : '';
    if (error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error);
      // Client Error Happend
      // Send the error to the server and then
      // redirect the user to the page with all the info
      console.log('Client Error');
      console.log('handleError Error obj', error);

      return errorsService
        .log(error)
        .subscribe(errorWithContextInfo => {
          console.log('errorWithContextInfo', errorWithContextInfo);
          if (!errorWithContextInfo.status || (errorWithContextInfo.status && ![401].includes(errorWithContextInfo.status))) {
            console.log('Client error will redirect to error page', errorWithContextInfo);
            router.navigate(['/error'], { queryParams: errorWithContextInfo });
          } else {
            console.log('will show popup login');

            this.authService.showAuthFormPopup();
          }
        });
    } else if (error instanceof HttpErrorResponse || error['error'] instanceof HttpErrorResponse) {
      if (error['error'] instanceof HttpErrorResponse) {
        error = error['error'];
      }
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,

      console.log('Server error happened ', error);
      if (!navigator.onLine) {
        // No Internet connection
        return notificationService.notify('No Internet Connection');
      } else if (error.status === 401) {
        this.authService.showAuthFormPopup();
      } else if (error.status === 423) {
        // blocked
        this.ngZone.run(() => {
          this.authService.showBlockErrPopup();
        });
      } else if (error.status === 403) {
        // forbidden
        this.ngZone.run(() => {
          this.authService.showForbiddenErrPopup();
        });
      } else {
        // Http Error
        // Send the error to the server
        errorsService.log(error).subscribe();
        // Show notification to the user
        const title = error.error && error.error.error && typeof error.error.error === 'string' ? error.error.error : '';
        notificationService.notify(`${error.status} - ${error.message}`, title);
      }
    } else if (
      error['rejection']
      && error['rejection'].hasOwnProperty('status')
      && error['rejection']['status'] === 401
    ) {
      this.authService.showAuthFormPopup();
    } else {
      console.log('error type', typeof error);
      console.log('prop names ', Object.getOwnPropertyNames(error));
      console.log('prop desc ', Object.getOwnPropertyDescriptors(error));
    }
    // return an observable with a user-facing error message
    // return of(error);
    console.log('will throw an error message');

    return throwError('thrown error message');

  }
}

