import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AclGuard {

	/**
	 * uri access dpending on user roles
	 * mapping of this ids should 
	 * be taken from api acl_routes 
	 */
    
	accessMatrix(){
        return {             
            'libraries' : "3",
            'libraries/create' : "3",
            'libraries/:id' : "3",  
            'cms_users' : "5",
            'cms_users/create' : "5",
            'cms_users/:id' : "5",            
            'user_maintenance' : "4",
            'librarian' : "1",
            'publisher' : "2",          
            'products' : "6", 
            'dashboard' : "0",
            'promotions' : "10",
            'banners' : "8",
            'drawers' : "9",
            'banners/:id' :"8",
            'drawers/:id' : "9",         
        };
    }

    /**
     * default page after login
     */
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