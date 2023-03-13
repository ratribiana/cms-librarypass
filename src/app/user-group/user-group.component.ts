import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from '@angular/router';
import {map, tap} from "rxjs/operators";
import { AclService } from "../_services/acl.service";
import { AuthenticationService } from "../_services";

@Component({
  selector: 'app-user-group',
  templateUrl: './user-group.component.html',
  styleUrls: ['./user-group.component.css']
})
export class UserGroupComponent implements OnInit {
	aclGroups: object;
	aclRoles: object;
	dataLoaded = false;
	selectedRole: object;
	selectedGroup: object;
	isUserRolePage= false;

	constructor(
		 private aclService: AclService,
		 private router : Router
		) { }

	/** initialize vars */
	ngOnInit() {
		let curUrl = this.router.url;
		this.isUserRolePage = curUrl.toLowerCase() == '/user-roles' ;

		// lets get all listings
		this.getAllGroups();
		this.getAllRoles();
	}

	/** get all groups */
	getAllGroups() {
	    this.aclService.getAllGroups().subscribe(res => {
	       this.aclGroups  = res.items;
	      });
	}

	/** get all roles */
	getAllRoles() {
	  this.aclService.getAllRoles().subscribe(res => {
       this.aclRoles  = res.items;
      });
	}

	/** lets redirect to edit id */
	editRoles(e, roleId) {
		e.preventDefault();
		this.router.navigate([`/user-roles/roles/${roleId}`], { skipLocationChange: true });

	}

	/** lets rediret to edit group */
	editGroups(e, groupId) {
		e.preventDefault();
		this.router.navigate([`/user-group/groups/${groupId}`], { skipLocationChange: true });
	}

	/** on click active roles */
	onActiveRoles(e, roleId) {
		 let isChecked = e.currentTarget.checked ? 1 : 0;
		// lets get the whole object
		 for (let [key, value] of Object.entries(this.aclRoles)) {
		 	if (value.id == roleId) {

	  	 		this.aclRoles[key].active = isChecked;
	  	 		this.selectedRole = this.aclRoles[key];
	  	 		break;
	  	 	}
		 }
		this.aclService.activateRole(roleId, this.selectedRole)
		  	.subscribe(data => {}, err => {});;
	}

	/** on click active group */
	onActiveGroup(e, groupId) {
		let isChecked = e.currentTarget.checked ? 1 : 0;

		// lets get the whole object
		 for (let [key, value] of Object.entries(this.aclGroups)) {
		 	if (value.id == groupId) {

	  	 		this.aclGroups[key].active = isChecked;
	  	 		this.selectedGroup = this.aclGroups[key];
	  	 		break;
	  	 	}
		 }
		this.aclService.activateGroup(groupId, this.selectedGroup)
		  	.subscribe( data => {}, err => {});;
	}

}
