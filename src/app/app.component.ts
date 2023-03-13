import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from './_services';
import { User } from './_models';
import { AuthGuard } from "./_guards";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'comics-plus-cms';
  currentUser: User;
  
  constructor(
      private router: Router,
      private authenticationService: AuthenticationService,
      public guard: AuthGuard
  ) {
      this.authenticationService.currentUser.subscribe(x => this.currentUser = x);          
  }

  ngOnInit() {
}

  logout() {            
      this.authenticationService.logout();
      this.router.navigate(['/login']);      
  }
}
