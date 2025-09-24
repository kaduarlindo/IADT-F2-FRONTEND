import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedRoute {

  private _routeResult = new BehaviorSubject<any | null>(null);
  routeResult$ = this._routeResult.asObservable();

  setRouteResult(value: any) {
    this._routeResult.next(value);
  }

  getCurrent() {
    return this._routeResult.getValue();
  }
}
