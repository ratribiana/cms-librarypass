import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import {map, tap} from "rxjs/operators";
import { AclService } from "../../_services/acl.service";
import { AuthenticationService } from "../../_services";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {
  currentGroupId = null;
  cancelLabel = 'Cancel';
  saveLabel = 'Create';
  pageLabel = 'Create User Group';

   /** declare form inputs */
  groupForm = new UntypedFormGroup({
  		groupName: new UntypedFormControl('', [
	        Validators.required
	      ]),
  		roles: new UntypedFormControl([]),
      active: new UntypedFormControl('')
  	});

  aclRoles: object;

  constructor(
	 private aclService: AclService,
  	 private activatedRoute: ActivatedRoute,
	private toastr:ToastrService
  	) { }

  ngOnInit() {
  	/** get url arguments */
  	this.activatedRoute.params.subscribe(args => {
      this.currentGroupId = args['id']; // (+) converts string 'id' to a number    
    });

  	/** get list of routes */
  	if (this.currentGroupId == null) { 
  		this.getAllRoles();
  	} else {
  		this.pageLabel = 'Update User Group'
  		this.getGroupInformation();
  	}
  }

  getGroupInformation() {
  	this.aclService.getGroupById(this.currentGroupId).subscribe(res => {
        this.aclRoles  = res.roles;
        this.groupForm.setValue({
        	groupName: res.name,
        	roles: res.roles,
          active: res.active
        });
        this.saveLabel = 'Save Changes';
      });
  }
  
  /** this will retrieve all roles */
  getAllRoles() {
  	this.aclService.getAllActiveRoles().subscribe(res => {
       this.aclRoles  = res.items;
      });

  }

  /** event when role allowed */
  onAllowRole(e){
  	let isChecked = e.currentTarget.checked ? 1 : 0;
  	 let roleId = e.currentTarget.getAttribute('data-id');

  	 	// loop and assign values when it find match
	  	 for (let [key, value] of Object.entries(this.aclRoles)) {
	  	 	if (value.id == roleId) {
	  	 		this.aclRoles[key].allow = isChecked;
	  	 		this.groupForm.get('roles').setValue(this.aclRoles);
	  	 		break;
	  	 	}
		}
  }

  /** on submit changes */
  submitGroup() {
  	if (this.currentGroupId > 0) {
  		this.aclService.updateGroup(this.currentGroupId, this.groupForm.value)
		  	.subscribe(
		      data => {
		       this.cancelLabel = 'Back';
		       this.saveLabel = 'Save Changes';
			   this.toastr.success('Changes saved!', 'Success!');

		      },
		      err => {

		      });
  		return;
  	}

  	this.aclService.createGroup(this.groupForm.value)
	  	.subscribe(
	      data => {
	       this.currentGroupId = data.id;
	       this.cancelLabel = 'Back';
	       this.saveLabel = 'Save Changes';
		   this.toastr.success('New group created!', 'Success!');

	      },
	      err => {

	      });
  }

}
