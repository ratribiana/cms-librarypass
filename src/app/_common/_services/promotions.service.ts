import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class PromotionsService {

      // define our class properties. apiUrl is what we need
      apiUrl = environment.apiEndpoint;

      // inject the HttpClient as http so we can use it in this class
      constructor(private http: HttpClient) {}
    
      getPromotionsList(lib_id: number, type: string) {
        return this.http.get<any>(`${this.apiUrl}/libraries/${lib_id}/promotions?type=${type}`);
      }

      getPromotionProducts(promotion_id: number) {
        return this.http.get<any>(`${this.apiUrl}/promotions/${promotion_id}/products`);
      }

      getPromotion(promotion_id: number) {
        return this.http.get<any>(`${this.apiUrl}/promotions/${promotion_id}`);
      }

      updatePromotionSort(data) {
        return this.http
          .put<any>(`${this.apiUrl}/promotions/sort`, { data })
          .pipe(map(res => {
            return res;
          }));
      }

      updatePromotions(promotion_id: number, data) {
        return this.http
          .post<any>(`${this.apiUrl}/promotions/${promotion_id}`, data )
          .pipe(map(res => {
            return res;
          }));
      }

      updatePromotionProductsSort(data) {
        return this.http
          .put<any>(`${this.apiUrl}/promotions/products/sort`, { data })
          .pipe(map(res => {
            return res;
          }));
      }
      
      addPromotions(formdata) {
        return this.http
          .post<any>(`${this.apiUrl}/promotions`, formdata)
          .pipe(map(res => {
            return res;
          }));
      }

      deleteSelectedPromotions(data) {
        return this.http
          .put<any>(`${this.apiUrl}/promotions/delete/multiple`, { data })
          .pipe(map(res => {
            return res;
          }));
      }

      deleteSelectedProducts(data) {
        return this.http
          .put<any>(`${this.apiUrl}/promotions/products/delete`, { data })
          .pipe(map(res => {
            return res;
          }));
      }      

      deletePromotion(id){
        return this.http.delete<any>(`${this.apiUrl}/promotions/${id}`, {});
      }

      deletePromotionProduct(id){
        return this.http.delete<any>(`${this.apiUrl}/promotions/product/${id}`, {});
      }

      deleteProductByPromotion(promotion_id, product_id){
        return this.http.delete<any>(`${this.apiUrl}/promotions/${promotion_id}/product/${product_id}`, {});
      }      

      setPromotionStatus(id:string, is_active: number){    
        return this.http.put<any>(`${this.apiUrl}/promotions/${id}/status`, {is_active})              
      }

      addPromotionProducts(promotion_id: number, post) {
        return this.http
          .post<any>(`${this.apiUrl}/promotions/${promotion_id}/products`, post)
          .pipe(map(res => {
            return res;
          }));
      }

}
