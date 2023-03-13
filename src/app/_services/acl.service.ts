import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AclService {
	apiUrl = environment.apiEndpoint;

	constructor(private http: HttpClient) { }
	
	/** get all groups in db */
	getAllGroups() {
		return this.http.get<any>(`${this.apiUrl}/acl-groups`);
	}
	
	/** get group information by id */
	getGroupById(groupId: number =0) {
		return this.http.get<any>(`${this.apiUrl}/acl-groups/${groupId}`);
	}

	/** update group info */
	updateGroup(groupId: number =0, data) {
		return this.http.put<any>(`${this.apiUrl}/acl-groups/${groupId}`, data)
        .pipe(map(res => {
          return res;
    	}));

	}

	activateGroup(groupId: number =0, data) {
		let active = data.active == 1 ? 'on' : 'off';
		return this.http.put<any>(`${this.apiUrl}/acl-groups/${groupId}/${active}`, data)
        .pipe(map(res => {
          return res;
    	}));
	}

	/** this will create group */
	createGroup(data) {
		return this.http.post<any>(`${this.apiUrl}/acl-groups`, data)
        .pipe(map(res => {
          return res;
    	}));
	}

	/** get all roles in db */
	getAllRoles() {
		return this.http.get<any>(`${this.apiUrl}/acl-roles`);
	}

	/** get user available to be added role */
	getUserRoles(userId: number =0, roleId: number =0) {
		return this.http.get<any>(`${this.apiUrl}//${userId}?group=${roleId}`);
	}	

	/** get all active roles only */
	getAllActiveRoles() {
		return this.http.get<any>(`${this.apiUrl}/acl-roles?active=1`);
	}

	/** get role information by id */
	getRoleById(roleId: number =0) {
		return this.http.get<any>(`${this.apiUrl}/acl-roles/${roleId}`);
	}

	/** get all routes in db */
	getAllRoutes() {
		return this.http.get<any>(`${this.apiUrl}/acl-routes`);
	}

	/** create new role */
	createRole(data) {
		return this.http.post<any>(`${this.apiUrl}/acl-roles`, data)
        .pipe(map(res => {
          return res;
    	}));
	}

	/** Update role */
	updateRole(roleId: number =0, data) {
		return this.http.put<any>(`${this.apiUrl}/acl-roles/${roleId}`, data)
        .pipe(map(res => {
          return res;
    	}));
	}

	activateRole(roleId: number =0, data) {
		let active = data.active == 1 ? 'on' : 'off';
		return this.http.put<any>(`${this.apiUrl}/acl-roles/${roleId}/${active}`, data)
        .pipe(map(res => {
          return res;
    	}));
	}
}
