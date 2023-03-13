import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})

export class UserMaintenanceService {
  // define our class properties. apiUrl is what we need
  apiUrl = environment.apiEndpoint;

  // inject the HttpClient as http so we can use it in this class
  constructor(private http: HttpClient) {}

  // return what comes back from this http call
  getUsers(ids, page: number = 1, filter: string='', limit: number = 12){    
    filter = encodeURIComponent(filter);
    return this.http.get<any>(`${this.apiUrl}/users?id=${ids}&page=${page}&search=${filter}&limit=${limit}`);
  }

  getCmsUsers(page: number = 1, filter: string='', limit: number = 12, role_id: number = 0){
    filter = encodeURIComponent(filter);
    return this.http.get<any>(`${this.apiUrl}/cms_users?page=${page}&search=${filter}&limit=${limit}&role=${role_id}`);
  }  

  getCmsUser(id:number){    
    return this.http.get<any>(`${this.apiUrl}/cms_users/${id}`);
  }

  addUsers(library_id: number, csv: string, single_user: boolean = false){
    return this.http
        .post<any>(`${this.apiUrl}/users`, {library_id, csv, single_user})
        .pipe(map(res => {
          return res;
    }));  
  }

  createCmsUser(data){
    return this.http
        .post<any>(`${this.apiUrl}/cms_users`, data)
        .pipe(map(res => {
          return res;
    }));  
  }

  updateCmsUser(user_id:string, data){
    return this.http
        .put<any>(`${this.apiUrl}/cms_users/${user_id}`, data)
        .pipe(map(res => {
          return res;
    }));  
  }

  setUserStatus(user_id:string, is_active: number){    
    return this.http
          .put<any>(`${this.apiUrl}/users/${user_id}/status`, {is_active})
          
  }

  setUserPassword(user_id:string, password: string){
    return this.http
          .post<any>(`${this.apiUrl}/users/password`, {user_id, password})
  }

  deleteUser(user_id:string){        
    return this.http
          .delete<any>(`${this.apiUrl}/users/${user_id}/hash`, {});
  }

  deleteCmsUser(user_id:string){
    return this.http
          .delete<any>(`${this.apiUrl}/cms_users/${user_id}`, {});          
  }

  getLibraries(){
    return this.http.get<any>(`${this.apiUrl}/libraries-by-id`);
  }

  check_user_can_upload(library_id: number){
    return this.http.get<any>(`${this.apiUrl}/libraries-can-create-users?library_id=${library_id}`);           
  }

  check_user_can_curate(library_id: number){
    return this.http.get<any>(`${this.apiUrl}/libraries-can-curate?library_id=${library_id}`);           
  }

  getUserRoles(){
    return this.http.get<any>(`${this.apiUrl}/cms_users/roles`);
  }
}
