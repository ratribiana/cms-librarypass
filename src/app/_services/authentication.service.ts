import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../_models';
import { JwtHelperService } from "@auth0/angular-jwt";
import * as CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    apiUrl = environment.apiEndpoint;
    envSalt = environment.salt;
    jwthelper:any;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(this.unHash(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        this.jwthelper = new JwtHelperService();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }
    

    public isTokenExpired(token: string): boolean {
        //const token = localStorage.getItem('token');
        // Check whether the token is expired and return
        // true or false
        return this.jwthelper.isTokenExpired(token);
    }

    login(username: string, password: string) {
        return this.http.post<any>(`${this.apiUrl}/token`, { username, password }, {
            //withCredentials: true,
            headers:{ 'Authorization':  'Basic ' + btoa(username + ":" + password)}
        })
        //return this.http.post<any>(`${config.apiUrl}/users/authenticate`, { username, password })
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    const hashUser = this.hash(JSON.stringify(user));
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', hashUser);
                    this.currentUserSubject.next(user);
                    let securityLevel =  this.jwthelper.decodeToken(user.token);
                    localStorage.setItem('strict', securityLevel.strict);
                }

                return user;
            }));
    }

    logout() {    
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        localStorage.removeItem('strict');
        this.currentUserSubject.next(null);
    }
    
    public hash(data:string) {
        return CryptoJS.AES.encrypt(data, this.envSalt).toString();
    }

    public unHash(data:string) {
        try {
        const bytes = CryptoJS.AES.decrypt(data, this.envSalt);
        if (bytes.toString()) {
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        }
        return data;
        } catch (e) {}
    }
}