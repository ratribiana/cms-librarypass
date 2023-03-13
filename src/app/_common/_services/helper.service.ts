import { Injectable } from '@angular/core';
import { _ } from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  public without(array, delegate) {
    return _.without(array, delegate);
  }


}
