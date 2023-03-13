import { Component, OnInit } from '@angular/core';
import {UserMaintenanceService} from "../_services/user-maintenance.service";
import {map, tap} from "rxjs/operators";
import { ToastrService } from 'ngx-toastr';
import {HttpErrorResponse} from "@angular/common/http";
import {AuthenticationService} from "../_services";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-cms-user',
  templateUrl: './cms-user.component.html',
  styleUrls: ['./cms-user.component.css']
})
export class CmsUserComponent implements OnInit {

  apiUrl = environment.apiEndpoint;
  cms_user_roles: object;
  loading = false;
  dataLoaded = false;
  submitted = false;
  users: object;
  libraries: object;
  total: number;
  page: number = 1;
  limit: number = 25;
  allow_add_user: boolean = false;
  filter: string = '';
  currentUser = this.authenticationService.currentUserValue;
  is_admin = (this.currentUser.short_codes.includes('is_admin'));
  library_id = this.currentUser.library_id;  
  role_filter = 0;

  constructor(      
      private userService: UserMaintenanceService,
      private toastr: ToastrService,
      private authenticationService: AuthenticationService,      
  ) { }

  ngOnInit() {
    var self = this;
    this.loading = false;
    
    this.getLibraryList();    
    this.getUserRoles();
    this.getUserList(this.page, this.filter);
  }

  getLibraryList(){
    this.userService.getLibraries()
        .subscribe(res => {
          this.libraries = res.items;
        });
  }

  getUserList(page: number, filter: string='') {

    this.users = this.userService.getCmsUsers(page, filter, this.limit, this.role_filter)
        .pipe(tap (res => {
          this.total = res.total;
          this.page = page;
          this.dataLoaded = true;
        }), map( res => res.items ) );

  }

  deleteUser(e, userid: string) {
    let row = e.target.parentNode.parentNode;

    let r = confirm("Delete User?");
    if (r == true) {
      this.userService.deleteCmsUser(userid)
          .subscribe(
              data => {                
                this.toastr.success('Successfully Deleted User.', 'Notification');
                row.remove();
                this.getUserList(this.page, this.filter);                
              },
              (error: HttpErrorResponse) => {
                console.log(error.message);
              });
    }
  } 

  filterRoles(group_id) {
    this.role_filter = group_id
    this.getUserList(this.page, this.filter);
  }
  
  getUserRoles() {
    this.userService.getUserRoles()
      .subscribe(res => {
        this.cms_user_roles = res;
      });
  }

  filterbyUsername(e){
    this.filter = e.target.value;
    this.getUserList(this.page, this.filter);
  }

}