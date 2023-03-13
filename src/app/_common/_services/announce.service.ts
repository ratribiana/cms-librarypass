import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnounceService {

  private parent_billing = new BehaviorSubject(false);
  private parent_service = new BehaviorSubject(false);
  private parent_auth = new BehaviorSubject(false);
  
  use_parent_billing= this.parent_billing.asObservable();
  use_parent_service = this.parent_service.asObservable();
  use_parent_auth = this.parent_auth.asObservable();
  

  constructor() { }

  setParentBilling(msg: any) {
    if(typeof msg == 'string'){
      msg = Boolean(parseInt(msg));
    }

    this.parent_billing.next(msg);
  }

  setParentServices(msg: any) {
    if(typeof msg == 'string'){
      msg = Boolean(parseInt(msg));
    }

    this.parent_service.next(msg);
  }

  setParentAuth(msg: any) {
    if(typeof msg == 'string'){
      msg = Boolean(parseInt(msg));
    }
    
    this.parent_auth.next(msg);
  }

}
