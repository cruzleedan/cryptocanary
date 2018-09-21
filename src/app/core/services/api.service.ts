import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEventType, HttpResponse, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { JwtService } from './jwt.service';
import { throwError, Observable, Subject, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, map, tap, last, finalize } from 'rxjs/operators';
import { Entity } from '../models/entity.model';
import { AlertifyService } from './alertify.service';
import { AuthService } from './auth.service';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
    private jwtService: JwtService,
    private alertifyService: AlertifyService
  ) { }

  private formatErrors(error: any) {
    console.log('formatErrors', error);
    return of(error);
  }

  get(path: string, params: HttpParams = new HttpParams(), includeError?: boolean): Observable<any> {
    const req = this.http.get(`${environment.baseApiUrl}${path}`, { params });
    if (includeError) {
      console.log('REQUEST WITH ERRORS');
      return req.pipe(catchError(this.formatErrors));
    } else {
      return req;
    }
  }

  put(path: string, body: Object = {}, header?, includeError?: boolean): Observable<any> {
    includeError = includeError ? true : false;
    header = header ? header : { headers: new HttpHeaders().set('Content-Type', 'application/json') };
    const req = this.http.put(
      `${environment.baseApiUrl}${path}`,
      JSON.stringify(body),
      header
    );
    if (includeError) {
      return req.pipe(catchError(this.formatErrors));
    } else {
      return req;
    }
  }

  post(path: string, body, header?, includeError?: boolean): Observable<any> {
    includeError = includeError ? true : false;
    header = header ? header : { headers: new HttpHeaders().set('Content-Type', 'application/json') };
    const req = this.http.post(`${environment.baseApiUrl}${path}`, body, header);
    if (includeError) {
      return req.pipe(catchError(this.formatErrors));
    } else {
      return req;
    }
  }
  putWithProg(path: string, body, includeError?: boolean) {
    if (path === '/entities/new') {
      this.globalService.setLoadingRequests('addNewEntity', true);
    }
    const progress = new Subject<number>();
    const data = new Subject<Object>();
    const req = new HttpRequest('PUT', `${environment.baseApiUrl}${path}`, body, {
      reportProgress: true
    });
    const subscribeFn = (event) => {
      console.log('subscribeFn start');
      switch (event.type) {
        case HttpEventType.Sent:
          console.log('Upload started');
          break;

        case HttpEventType.UploadProgress:
          // Compute and show the % done:
          const percentDone = Math.round(100 * event.loaded / event.total);
          progress.next(percentDone);
          break;

        case HttpEventType.Response:
          // Close the progress-stream if we get an answer form the API
          // The upload is complete
          progress.complete();
          const resp = event && event.ok && event.body ? event.body : {};
          data.next(resp);
          data.complete();
          break;
        case HttpEventType.ResponseHeader:
          if (!event.ok && event.status === 423) { // blocked
            progress.complete();
            data.next({ error: 'blocked' });
            data.complete();
          }
          break;
        default:

      }
    };
    if (includeError) {
      console.log('Put with prog include error');
      this.http.request(req)
        .pipe(
          catchError(error => {
            console.log('Error', error);
            progress.complete();
            data.next({});
            data.complete();
            return of({});
          }),
          finalize(() => {
            this.globalService.setLoadingRequests('addNewEntity', false);
          })
        )
        .subscribe(subscribeFn);
    } else {
      console.log('Put with prog no error');
      this.http.request(req)
        .subscribe(subscribeFn);
    }

    return {
      data: data.asObservable(),
      progress: progress.asObservable()
    };
  }

  delete(path: string, includeError?: boolean): Observable<any> {
    includeError = includeError ? true : false;
    const req = this.http.delete(`${environment.baseApiUrl}${path}`);
    if (includeError) {
      return req.pipe(catchError(this.formatErrors));
    } else {
      return req;
    }
  }
}
