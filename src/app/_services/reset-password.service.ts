import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {

  apiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) { }

    forgot_password(username: string){

      return this.http.post<any>(`${this.apiUrl}/forgot-password`, {username})
          .pipe(map(res => {
              return res;
          }));
    }


    reset_password(password:string, username: string, expire_time: string, hash: string,){

        return this.http.post<any>(`${this.apiUrl}/reset-password`, {password, username, expire_time, hash})
            .pipe(map(res => {
                return res;
            }));
    }

    reset_admin_password(password:string, username: string){

      return this.http.post<any>(`${this.apiUrl}/reset-admin-password`, {password, username})
          .pipe(map(res => {
              return res;
          }));
  }
}
