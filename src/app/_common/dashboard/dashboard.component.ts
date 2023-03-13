import { Component, OnInit } from '@angular/core';
import { UserService } from "../_services";
import { AuthGuard } from "../_guards";


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userAccess: object;

  constructor(
    private userService: UserService,
    public guard: AuthGuard,

  ) {}

  ngOnInit() {
  	// this.userService.getMe().subscribe( data => {
    //   this.userAccess = data;
    // }, err => {});;
    console.log('asd');
  }

}
