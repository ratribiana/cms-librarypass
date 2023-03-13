 import { Component, OnInit } from '@angular/core';
 import {Router} from "@angular/router";
 import {AuthenticationService} from "../_services";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
      private router: Router, private authenticationService: AuthenticationService,) { }

  ngOnInit() {

    /* 
    commented because it will potentialy cause infinite loop.
    
    var currentUser = this.authenticationService.currentUserValue;
    
    if(currentUser){      
      if(currentUser.role_id == '5'){        
        this.router.navigate(['/publisher'] );   
        return;
      }      
      this.router.navigate(['/librarian'] );      
      return;
    }
    else{
      this.router.navigate(['/login'] );
      return;
    }
    */
  }

}
