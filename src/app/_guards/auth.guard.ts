import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import * as _ from 'lodash';
import {AuthenticationService} from "../_services";
import {AclGuard} from './acl.guard';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private auth: AuthenticationService,
    ) { }

    setRole(user){        
        return user.role;
    }

    /** checks if user has access in general */
    hasAccesAsGroup(userGroup, allowedGroup){  
        // lets allow access if user group is 1 which means super admin
        if (userGroup == 1) {
            return true;
        }

        // if not specified in router meaning for public access
        if (allowedGroup == undefined || 
            allowedGroup.length ===0 ||
            allowedGroup.includes("all")
            ) {
            return true;
        }

        let grp = String(userGroup);
        return allowedGroup.includes(grp);
    }

    /** will trigger in all request if specified */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = this.auth.currentUserValue;

        if (currentUser) {
            if (this.auth.isTokenExpired(currentUser.token)) {        
                this.auth.logout();        
                this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                return false;
            }

            let role = this.setRole(currentUser);
            let accessResult = false;
            // the console log below will be useful for role settings
            console.log('Angular Route: ' + state.url)

            // if (state.url == '/') {
            //     this.router.navigate(['/dashboard'] );
            //     return true;
            // }

            if (state.url == '/' || state.url == '/dashboard') { //bypass dashboard                
                if(currentUser.group_id == '8'){
                    this.router.navigate(['/production-dashboard'] );
                    return true;
                }
                if(currentUser.group_id == '5'){
                    this.router.navigate(['/publisher'] );
                    return true;
                }
                
                this.router.navigate(['/librarian'] );
                return true;
            }

            if (!this.hasAccessToUrl(state.url)) {
                this.router.navigate(['/unauthorize'] );
            }
            return true;

            /**
             * Commented due to old code using hard coded values in routes
             * to determine access on page
             ================================
            if(!this.hasAccesAsGroup(currentUser.group_id, route.data.userGroups)){
                // lets get the default page
                let defaultPage = this.getDefaultPage(currentUser);
                if (defaultPage != route.routeConfig.path) {
                    this.router.navigate([defaultPage] );
                } else {
                    // lets redirect to login for now since no access
                    this.router.navigate(['/login'] );
                }
            } */            
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }

    /** Lets check if user has access to url */
    hasAccessToUrl(url) {
        if (url.toLowerCase() == '/dashboard') {
            return true;
        }

        let hasAccess = false;
        let currentUrl = url.toLowerCase();
        let alloweUrls = this.auth.currentUserValue.url_route;

        alloweUrls.forEach(permitUrl => {
            if (permitUrl){
                if(currentUrl.substring(0, permitUrl.length) == permitUrl.toLowerCase()) {
                    hasAccess = true;
                }
            }
        })
        return hasAccess;
    }


    /** verify access by role this function is used for menu visibility*/
    hasAccessByRole(roleId, userRoleId) {
        // lets by pass if you are super admin wiht id 1
        /**
        if (this.auth.currentUserValue.group_id == "1") {
            return true;
        }
         */

        let role = String(roleId);
        return userRoleId.includes(role);
    }

    /** verify acces using short code */
    hasAccessByCode(shortCode) {        
        let userAccessCode = this.auth.currentUserValue.short_codes;        
        let code = String(shortCode);
        return userAccessCode.includes(code);
    }

    /** default pages */
     getDefaultPage(user) {
        switch(user.group_id) {
            case '6' : // for Product group
                return '/dashboard';
            break;

            default :
                return '/librarian'
        }
    }
}
