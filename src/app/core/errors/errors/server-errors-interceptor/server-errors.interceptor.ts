import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { ErrorsService } from '../errors-service/errors.service';

@Injectable()
export class ServerErrorsInterceptor implements HttpInterceptor {
    constructor(
        private router: Router,
        private errorsService: ErrorsService,
    ) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // const apiData = next.handle(request)
        // .pipe(
        //   retry(2)
        // );
        // apiData.subscribe({
        //   next(x) { console.log('data: ', x); },
        //   error(err) { console.log('errors already caught... will not run'); }
        // });
        // return apiData;
        console.log('server-errors intercepted request');

        return next.handle(request);
    }
}
