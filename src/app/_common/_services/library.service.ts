import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  // define our class properties. apiUrl is what we need
  apiUrl = environment.apiEndpoint;

  // inject the HttpClient as http so we can use it in this class
  constructor(private http: HttpClient) { }

  // return what comes back from this http call
  getLibraries(page: number = 1, filter: string = '', limit: number = 12) {
    filter = encodeURIComponent(filter);
    return this.http.get<any>(`${this.apiUrl}/libraries?page=${page}&search=${filter}&limit=${limit}`);
  }

  getChildLibraries(library_id: number, page: number = 1, filter: string = '', limit: number = 12) {
    filter = encodeURIComponent(filter);
    return this.http.get<any>(`${this.apiUrl}/libraries/${library_id}/children?page=${page}&search=${filter}&limit=${limit}`);
  }

  verifyLibraryId(library_id: number) {
    return this.http.get<any>(`${this.apiUrl}/verify-library/${library_id}`);
  }

  getLibrary(library_id: number) {
    return this.http.get<any>(`${this.apiUrl}/libraries/${library_id}`);
  }

  setLibraryStatus(lib_id: number, is_active: number) {
    return this.http
      .put<any>(`${this.apiUrl}/libraries/${lib_id}/status`, { is_active })

  }

  getLibraryNodes(library_id, show_root_node = 1){
    return this.http.get<any>(`${this.apiUrl}/libraries-nodes?library_id=${library_id}&show_root_node=${show_root_node}`);
  }
  
  getLibrariesList(parent_id:number = 0, parent_library:number = 0, child_library:number = 0 ) {

    return this.http.get<any>(`${this.apiUrl}/libraries-list?parent_id=${parent_id}&parent_library=${parent_library}&child_library=${child_library}`);
  }

  getAllLibraries() {
    return this.http.get<any>(`${this.apiUrl}/libraries-by-id`);
  }

  deleteLibrary(lib_id: number, lib_name: string) {
    return this.http
      .put<any>(`${this.apiUrl}/libraries/${lib_id}/hash`, { lib_name });
  }

  addLibrary(formdata) {
    return this.http
      .post<any>(`${this.apiUrl}/libraries`, formdata)
      .pipe(map(res => {
        return res;
      }));
  }

  updateLibrary(lib_id, data) {
    return this.http
      .put<any>(`${this.apiUrl}/libraries/${lib_id}`, { data })
      .pipe(map(res => {
        return res;
      }));
  }

  updateLibraryBalances(data) {
    return this.http
      .post<any>(`${this.apiUrl}/library-balance`, data)
      .pipe(map(res => {
        return res;
      }));
  }

  getLibraryAuthDomain(lib_id: number, page: number = 1, filter: string = '', limit: number = 5) {
    filter = encodeURIComponent(filter);
    return this.http.get<any>(`${this.apiUrl}/libraries/${lib_id}/google-domains?page=${page}&search=${filter}&limit=${limit}`);
  }

  deleteLibraryAuthDomain(lib_id: number, domain_id: number, ) {
    return this.http.delete<any>(`${this.apiUrl}/libraries/${lib_id}/google-domains/${domain_id}`);
  }  

  getLibraryCleverDistrict(lib_id: number, page: number = 1, filter: string = '', limit: number = 5)
  {
    filter = encodeURIComponent(filter);
    return this.http.get<any>(`${this.apiUrl}/libraries/${lib_id}/clever-districts?page=${page}&search=${filter}&limit=${limit}`);
  }

  deleteLibraryCleverDistrict(lib_id: number, id: number, ) {
    return this.http.delete<any>(`${this.apiUrl}/libraries/${lib_id}/clever-district/${id}`);
  }

  getLibraryAuthClasslinkTenants(lib_id: number, page: number = 1, filter: string = '', limit: number = 5) {
    filter = encodeURIComponent(filter);
    return this.http.get<any>(`${this.apiUrl}/libraries/${lib_id}/classlink-tenants?page=${page}&search=${filter}&limit=${limit}`);
  }

  deleteLibraryAuthClasslinkTenant(lib_id: number, id: number, ) {
    return this.http.delete<any>(`${this.apiUrl}/libraries/${lib_id}/classlink-tenant/${id}`);
  }

  getLibraryAuthReferrer(lib_id: number, page: number = 1, filter: string = '', limit: number = 5) {
    filter = encodeURIComponent(filter);
    return this.http.get<any>(`${this.apiUrl}/libraries/${lib_id}/referrer-login?page=${page}&search=${filter}&limit=${limit}`);
  }

  getLibraryAuthPrefix(lib_id: number, page: number = 1, filter: string = '', limit: number = 5) {
    filter = encodeURIComponent(filter);
    return this.http.get<any>(`${this.apiUrl}/libraries/${lib_id}/prefix-login?page=${page}&search=${filter}&limit=${limit}`);
  }

  deleteLibraryAuthReferrer(lib_id: number, referrer_id: number, ) {
    return this.http.delete<any>(`${this.apiUrl}/libraries/${lib_id}/referrer-login/${referrer_id}`);
  }

  deleteLibraryAuthPrefix(lib_id: number, referrer_id: number, ) {
    return this.http.delete<any>(`${this.apiUrl}/libraries/${lib_id}/prefix-login/${referrer_id}`);
  }

  getLibraryAuthIP(lib_id: number, page: number = 1, filter: string = '', limit: number = 5) {
    filter = encodeURIComponent(filter);
    return this.http.get<any>(`${this.apiUrl}/libraries/${lib_id}/auth-ips?page=${page}&search=${filter}&limit=${limit}`);
  }

  getLibraryAuthSipV2(lib_id: number) {    
    return this.http.get<any>(`${this.apiUrl}/libraries/${lib_id}/sip2-rules`);
  }

  deleteLibraryAuthSip2(lib_id: number, sip2_rule_id: number, ) {
    return this.http.delete<any>(`${this.apiUrl}/libraries/${lib_id}/sip2-rule/${sip2_rule_id}`);
  }

  getLibraryMS365Domain(lib_id: number, page: number = 1, filter: string = '', limit: number = 5) {
    filter = encodeURIComponent(filter);
    return this.http.get<any>(`${this.apiUrl}/libraries/${lib_id}/ms365-domains?page=${page}&search=${filter}&limit=${limit}`);
  }

  deleteLibraryMS365Domain(lib_id: number, domain_id: number, ) {
    return this.http.delete<any>(`${this.apiUrl}/libraries/${lib_id}/ms365-domains/${domain_id}`);
  }

  getLibraryOpenAthensScope(lib_id: number, page: number = 1, filter: string = '', limit: number = 5) {
    filter = encodeURIComponent(filter);
    return this.http.get<any>(`${this.apiUrl}/libraries/${lib_id}/openathens-scopes?page=${page}&search=${filter}&limit=${limit}`);
  }

  deleteLibraryOpenAthensScope(lib_id: number, scope_id: number, ) {
    return this.http.delete<any>(`${this.apiUrl}/libraries/${lib_id}/openathens-scopes/${scope_id}`);
  }

  getLibraryProducts(lib_id: number, page: number = 1, filter: string = '', limit: number = 5,age:number = 0, categories:number = 0, 
    publishers:number = 0, types:number = 0, languages:number=0, availability:string='', date_range:string='', disabled:number = 0, sort: string='') {
    //let url = ;
    return this.http.get<any>(`${this.apiUrl}/libraries/${lib_id}/products?page=${page}&search=${filter}&limit=${limit}&age=${age}&categories=${categories}&publishers=${publishers}&types=${types}&languages=${languages}&availability=${availability}&date_range=${date_range}&status=${disabled}&sort=${sort}`);
  }

  getAllAvailableProducts( page: number = 1, filter: string = '', limit: number = 5,age:number = 0, categories:number = 0, 
    publishers:number = 0, types:number = 0, disabled:number = 0) {
    return this.http.get<any>(`${this.apiUrl}/products?page=${page}&search=${filter}&limit=${limit}&age=${age}&categories=${categories}&publishers=${publishers}&types=${types}&disabled=${disabled}&all=true`);
  }  

  getLibraryAfFields(lib_id: number) {
    return this.http.get<any>(`${this.apiUrl}/libraries/${lib_id}/af-fields`);
  }

  getLibraryCurrentBalance(lib_id: number) {
    return this.http.get<any>(`${this.apiUrl}/libraries/${lib_id}/current_balance`);
  }

  deleteLibraryAuthIP(lib_id: number, ip_id: number, ) {
    return this.http.delete<any>(`${this.apiUrl}/libraries/${lib_id}/auth-ips/${ip_id}`);
  }

  deleteLibraryAllAuthIP(lib_id: number) {
    return this.http.delete<any>(`${this.apiUrl}/libraries/${lib_id}/auth-ips`);
  }

  getAuthMethods() {
    return this.http.get<any>(`${this.apiUrl}/libraries-auth-methods`);
  }

  getSiteStyles() {
    return this.http.get<any>(`${this.apiUrl}/site-styles`);
  }

  getServices() {
    return this.http.get<any>(`${this.apiUrl}/services`);
  }

  getBillingTypes() {
    return this.http.get<any>(`${this.apiUrl}/billing-types`);
  }

  getPaymentMethods() {
    return this.http.get<any>(`${this.apiUrl}/payment-methods`);
  }

  getLoginRedirectUrls() {
    return this.http.get<any>(`${this.apiUrl}/login-redirect-urls`);
  }

  getBalanceTypes() {
    return this.http.get<any>(`${this.apiUrl}/library-balance-types`);
  }

  getPriceTiers() {
    return this.http.get<any>(`${this.apiUrl}/libraries-price-tiers`);
  }

  getContentRatings() {
    return this.http.get<any>(`${this.apiUrl}/libraries-content-ratings`);
  }

  getLibraryServices(library_id: number) {
    return this.http.get<any>(`${this.apiUrl}/libraries/${library_id}/services`);
  }

  getLibraryPriceTiers(library_id: number) {
    return this.http.get<any>(`${this.apiUrl}/libraries/${library_id}/price-tiers`);
  }

  getLibraryServicePriceTiers(library_id: number, service_id: number) {
    return this.http.get<any>(`${this.apiUrl}/libraries/${library_id}/services/${service_id}/price-tiers`);
  }

  getLibraryServiceContentRatings(library_id: number, service_id: number) {
    return this.http.get<any>(`${this.apiUrl}/libraries/${library_id}/services/${service_id}/content-ratings`);
  }

  getLibraryContentRatings(library_id: number) {
    return this.http.get<any>(`${this.apiUrl}/libraries/${library_id}/content-ratings`);
  }

  getLibraryServiceData(library_id: number, service_id: number) {
    return this.http.get<any>(`${this.apiUrl}/libraries/${library_id}/services/${service_id}/data`);
  }

  getLibraryAuthMethods(library_id: number) {
    return this.http.get<any>(`${this.apiUrl}/libraries/${library_id}/auth-methods`);
  }

  updateLibraryServices(lib_id, data) {
    return this.http
      .put<any>(`${this.apiUrl}/libraries/${lib_id}/services`, { services: data })
      .pipe(map(res => {
        return res;
      }));
  }

  updateLibraryServiceData(lib_id: number, service_id: number, data) {
    return this.http
      .put<any>(`${this.apiUrl}/libraries/${lib_id}/services/${service_id}/data`, data)
      .pipe(map(res => {
        return res;
      }));
  }

  updateLibraryPriceTiers(lib_id, data) {
    return this.http
      .put<any>(`${this.apiUrl}/libraries/${lib_id}/price-tiers`, { price_tiers: data })
      .pipe(map(res => {
        return res;
      }));
  }

  updateLibraryServiceContentRatings(lib_id, service_id, data) {
    return this.http
      .put<any>(`${this.apiUrl}/libraries/${lib_id}/services/${service_id}/content-ratings`, { content_ratings: data })
      .pipe(map(res => {
        return res;
      }));
  }

  updateLibraryServicePriceTiers(lib_id, service_id, data) {
    return this.http
      .put<any>(`${this.apiUrl}/libraries/${lib_id}/services/${service_id}/price-tiers`, { price_tiers: data })
      .pipe(map(res => {
        return res;
      }));
  }

  updateLibrarytContentRatings(lib_id, data) {
    return this.http
      .put<any>(`${this.apiUrl}/libraries/${lib_id}/content-ratings`, { content_ratings: data })
      .pipe(map(res => {
        return res;
      }));
  }

  updateLibraryAuthMethod(lib_id, auth_id, data) {
    return this.http
      .put<any>(`${this.apiUrl}/libraries/${lib_id}/auth-methods/${auth_id}`, { auth_method: data })
      .pipe(map(res => {
        return res;
      }));
  }

  getLibAuthData(lib_id, auth_id) {
    return this.http.get<any>(`${this.apiUrl}/libraries/${lib_id}/auth-methods/${auth_id}`);
  }

  createSip2ValidationRule(lib_id, data) {
    return this.http
      .post<any>(`${this.apiUrl}/libraries/${lib_id}/sip2-rules`, data)
      .pipe(map(res => {
        return res;
      }));
  }

}
