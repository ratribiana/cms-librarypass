import { Injectable } from '@angular/core';
import { CanDeactivate, UrlTree, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
}

@Injectable()
export class CanDeactivateGuard  {

  canDeactivate(component: CanComponentDeactivate  ) {
    return component.canDeactivate ? component.canDeactivate() : true;
  }

}