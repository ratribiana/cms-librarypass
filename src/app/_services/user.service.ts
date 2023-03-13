import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../environments/environment";
import { map } from "rxjs/operators";



import { User } from '../_models';

@Injectable({ providedIn: 'root' })
export class UserService {
    apiUrl = environment.apiEndpoint;
    
    constructor(private http: HttpClient) { }

    getAll() {
        //return this.http.get<User[]>(`${config.apiUrl}/users`);
        return this.http.get<User[]>(`https://myapi.comicsplus.app/todos`);
    }
    
    /** lets get users in Users table of db libraryIversAuth */
    searchLibraryIversAuthUsers(keyword){
        return this.http.get<any>(`${this.apiUrl}/libraryiversauth/users?search=${keyword}`);
    }

    /** lets query the current user information */
    getMe() {
        return this.http.get<any>(`${this.apiUrl}/me`);
    }


    setIverseUserToCms(data) {
        return this.http
        .put<any>(`${this.apiUrl}/users/connect`, data)
        .pipe(
            map((res) => {
            return res;
            })
        );
    }

    remIverseUserToCms() {
        return this.http
        .put<any>(`${this.apiUrl}/users/disconnect`, {})
        .pipe(
            map((res) => {
            return res;
            })
        );
    }
}