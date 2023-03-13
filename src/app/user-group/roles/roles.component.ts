import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import {map, tap} from "rxjs/operators";
import { AclService } from "../../_services/acl.service";
import { AuthenticationService } from "../../_services";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  currentRoleId = null;
  cancelLabel = 'Cancel';
  saveLabel = 'Save';
  pageLabel = 'Register Component';
  security_level = 'soft';

  /** declare form inputs */
  roleForm = new UntypedFormGroup({
  		roleName: new UntypedFormControl('', [
          Validators.required
        ]),
      	shortCode: new UntypedFormControl('', [
          Validators.required
        ]),
		urlRoute: new UntypedFormControl(''),
  		shortDescription: new UntypedFormControl(''),
  		routes: new UntypedFormControl([]),
  		active: new UntypedFormControl(''),
  	});

  aclRoutes: object;

  /** contructor declarations */
  constructor(
  	 private aclService: AclService,
  	 private activatedRoute: ActivatedRoute,
	 private toastr:ToastrService
  	 ) { }

  ngOnInit() {
  	/** get url arguments */
  	this.activatedRoute.params.subscribe(args => {
      this.currentRoleId = args['id']; // (+) converts string 'id' to a number    
    });


  	/** get list of routes */
  	if (this.currentRoleId == null) { 
  		this.getAllRoutes();
  	} else {
  		this.pageLabel = 'Update Component'
  		this.getRoleInformation();
  	}

	this.security_level =  localStorage.getItem('strict');

  }

  /** get role information and set data */
  getRoleInformation() {
  	this.aclService.getRoleById(this.currentRoleId).subscribe(res => {
        this.aclRoutes  = res.routes_info;
        this.roleForm.setValue({
			active: res.active,
			roleName: res.name,
			shortDescription: res.short_description,
			shortCode: res.short_code,
			urlRoute: res.url_route,
			routes: res.routes_info
        });
        this.saveLabel = 'Save Changes';
      });
  }

  /** pull all routes in db */
  getAllRoutes() {
	this.aclService.getAllRoutes().subscribe(res => {
       this.aclRoutes  = res.items;
      });

  }

  /** on click to allow api access */
  onAllowUri(e) {
  	 let isChecked = e.currentTarget.checked ? 1 : 0;
  	 let uriPath = e.currentTarget.getAttribute('data-uri');

  	 	// loop and assign values when it find match
	  	 for (let [key, value] of Object.entries(this.aclRoutes)) {
	  	 	if (value.route == uriPath) {
	  	 		this.aclRoutes[key].allow = isChecked;
	  	 		this.roleForm.get('routes').setValue(this.aclRoutes);
	  	 		break;
	  	 	}
		}
  }

   /** on submit changes */
  submitRole() {
  	if (this.currentRoleId > 0) {
  		this.aclService.updateRole(this.currentRoleId, this.roleForm.value)
		  	.subscribe(
		      data => {
		       this.cancelLabel = 'Back';
		       this.saveLabel = 'Save Changes';
			   this.toastr.success('Changes saved!', 'Success!');
		      },
		      err => {

		      });;
  		return;
  	}

  	this.aclService.createRole(this.roleForm.value)
	  	.subscribe(
	      data => {
	       this.currentRoleId = data.id;
	       this.cancelLabel = 'Back';
	       this.saveLabel = 'Save Changes';
		   this.toastr.success('New role created!', 'Success!');
	      },
	      err => {

	      });;
  }

  /** just to not allow special char */
  disallowSpecialChar(event)
  {   
     var k;  
     k = event.charCode;  
     return(k == 95 ||  (k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || (k >= 48 && k <= 57)); 
  }
}
