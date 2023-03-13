import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class MiscService {

  year : any = moment().format('YYYY');
  month : any = moment().format('MMMM');

  prev_years = [];

  // define our class properties. apiUrl is what we need
  apiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) { }

  generatePreviousYears() {
    let this_year = this.year;
    
    if(this.month == 'January'){
      this_year = this_year - 1;
    }

    if(!this.prev_years.length){
      for (let i = 0; i < 4; i++) {
        this.prev_years.push(this_year - i);
      }
    }

    return this.prev_years;
  }

  generateMonthsList(){
    return moment.months();
  }

  getPreviousMonth(num_value = false){

    if(num_value){
      return moment().subtract(1, 'months').format('M');
    }
    return moment().subtract(1, 'months').format('MMMM');
  }

  getCurrentMonth(num_value = false){
    if(num_value){
      return moment().format('M');
    }
    return this.month;
  }

  getCurrentYear(){
    return this.year;
  }

  getLanguagesList(is_assoc = 0) {
    return this.http.get<any>(`${this.apiUrl}/languages?is_assoc=${is_assoc}`);
  }

  getPriorities() {
    return this.http.get<any>(`${this.apiUrl}/priorities`);
  }

  getCategories() {
    return this.http.get<any>(`${this.apiUrl}/categories`);
  }

  getProductLines() {
    return this.http.get<any>(`${this.apiUrl}/product-lines`);
  }

  getProductTypes(is_assoc = 0) {
    return this.http.get<any>(`${this.apiUrl}/product_types?is_assoc=${is_assoc}`) ;
  }

  getSip2Fields() {
    return this.http.get<any>(`${this.apiUrl}/sip2_fields`);
  }

  getSuppliers(all:number = 0, is_assoc = 0) {
    return this.http.get<any>(`${this.apiUrl}/suppliers?all=${all}&is_assoc=${is_assoc}`) ;
  }

  getProductionUsers(){    
    return this.http.get<any>(`${this.apiUrl}/cms_users?is_production=1`);
  }

  getContentRatings(is_assoc = 0) {
    return this.http.get<any>(`${this.apiUrl}/libraries-content-ratings?is_assoc=${is_assoc}`);
  }

  getUserDashboardProfiles(user_id) {
    return this.http.get<any>(`${this.apiUrl}/cms_users/${user_id}/dashboard-profile`);
  }

  createDashboardProfile(user_id, data) {
		return this.http.post<any>(`${this.apiUrl}/cms_users/${user_id}/dashboard-profile`, data)
        .pipe(map(res => {
          return res;
    	}));
	}

  updateDashboardProfile(profile_id, data) {
		return this.http.put<any>(`${this.apiUrl}/cms_users/dashboard-profile/${profile_id}`, data)
        .pipe(map(res => {
          return res;
    	}));
	}

  deleteDashboardProfile(id){
    return this.http.delete<any>(`${this.apiUrl}/cms_users/dashboard-profile/${id}`, {});
  }

  getPriceTiers(is_assoc = 0) {
    return this.http.get<any>(`${this.apiUrl}/libraries-price-tiers?is_assoc=${is_assoc}`);
  }

  getReleaseCategories() {
    return this.http.get<any>(`${this.apiUrl}/release_categories`);
  }

  getLocales() {
    return this.http.get<any>(`${this.apiUrl}/locales`);
  }

  getWorkflowList() {
    return this.http.get<any>(`${this.apiUrl}/workflow-statuses`);
  }
}
