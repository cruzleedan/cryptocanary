import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private loadingRequestsSubject = new BehaviorSubject<Object>({});
  public loadingRequests$ = this.loadingRequestsSubject.asObservable();

  constructor() { }
  setLoadingRequests(name, status) {
    const req = {};
    req[name] = status;
    this.loadingRequestsSubject.next(Object.assign(this.loadingRequestsSubject.getValue(), req));
  }
}
