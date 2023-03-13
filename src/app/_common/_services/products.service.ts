import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ProductsService {
  // define our class properties. apiUrl is what we need
  apiUrl = environment.apiEndpoint;

  // inject the HttpClient as http so we can use it in this class
  constructor(private http: HttpClient) {}

  // return what comes back from this http call
  setLibraryProductDisabled(
    library_id: number,
    product_id: string,
    is_hidden: number,
    disabled_by: number = null
  ) {
    return this.http.put<any>(
      `${this.apiUrl}/libraries/${library_id}/products/${product_id}/remove`,
      { "is_hidden" : is_hidden, "disabled_by": disabled_by}
    );
  }

  getProduct(product_id) {
    return this.http.get<any>(`${this.apiUrl}/products/${product_id}`);
  }

  /** get product types */
  getProductTypes() {
    return this.http.get<any>(`${this.apiUrl}/products/types`) ;
  }

  getCustomFields() {
    return this.http.get<any>(`${this.apiUrl}/custom-fields`);
  }

  /** get releaset ypes */
  getReleaseTypes() {
    return this.http.get<any>(`${this.apiUrl}/products/release`);
  }

  /** get all product applications (skus) */
  getApplications() {
    return this.http.get<any>(`${this.apiUrl}/products/applications`);
  }

  /** get all prodcut categories */
  getCategories() {
    return this.http.get<any>(`${this.apiUrl}/products/categories`);
  }

  /** get localization  */
  getLocales() {
    return this.http.get<any>(`${this.apiUrl}/products/locales`);
  }

  getPriceTiers() {
    return this.http.get<any>(`${this.apiUrl}/products/price-tiers`);
  }

  getContentRatings() {
    return this.http.get<any>(`${this.apiUrl}/products/content-ratings`);
  }

  /** lets ge pages */
  getProductPages(product_id, page: number = 1, limit: number = 12, active = '',  img_download = 0) {
    return this.http.get<any>(`${this.apiUrl}/products/${product_id}/pages?page=${page}&limit=${limit}&active=${active}&img_download=${img_download}`);
  }

  /** Get info of single page */
  getProductPage(product_id, page_Id) {
    return this.http.get<any>(`${this.apiUrl}/products/${product_id}/page/${page_Id}`);
  }

  /** this will get worklogs */
  getWorkflowLogs(
    product_id,
    page: number = 1,
    filter: string = "",
    limit: number = 12
  ) {
    filter = encodeURIComponent(filter);
    return this.http.get<any>(
      `${this.apiUrl}/products/${product_id}/workflow-logs?page=${page}&search=${filter}&limit=${limit}`
    );
  }

  /** lets get the product line in database */
  getProductLines() {
    return this.http.get<any>(`${this.apiUrl}/products/groups`);
  }

  /** get all applications of a certain product */
  getProductApplications(product_id) {
    return this.http.get<any>(
      `${this.apiUrl}/products/${product_id}/applications`
    );
  }

  getProductLocales(product_id) {
    return this.http.get<any>(`${this.apiUrl}/products/${product_id}/locales`);
  }

  /** get all applications of a certain product */
  getProductCategories(product_id) {
    return this.http.get<any>(
      `${this.apiUrl}/products/${product_id}/categories`
    );
  }

  /** lets get the productline of a ceratin produt */
  getProductGroups(product_id) {
    return this.http.get<any>(`${this.apiUrl}/products/${product_id}/groups`);
  }

  /** get the custom field valus of a product */
  getProductCustomFields(product_id) {
    return this.http.get<any>(
      `${this.apiUrl}/products/${product_id}/custom-fields`
    );
  }

  /** get credits by product id */
  getProductCredits(product_id) {
    return this.http.get<any>(`${this.apiUrl}/products/${product_id}/credits`);
  }

  /** create entry in product table */
  createProduct(data) {
    return this.http.post<any>(`${this.apiUrl}/products`, data).pipe(
      map((res) => {
        return res;
      })
    );
  }

  /** update product table only */
  updateProduct(product_id: number, data) {
    return this.http
      .put<any>(`${this.apiUrl}/products/${product_id}`, data)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  updateProductPricingAvailability(product_id: number, data) {
    return this.http
      .put<any>(
        `${this.apiUrl}/products/${product_id}/pricing-availability`,
        data
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  updateProductPageOrder(product_id: number, data) {
    return this.http
      .put<any>(`${this.apiUrl}/products/${product_id}/pages/order`, data)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createProductPageRemoteQueue(product_id: number, data) {
    return this.http
      .put<any>(
        `${this.apiUrl}/products/${product_id}/pages/remote-source`,
        data
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getProductPageRemoteQueue(product_id) {
    return this.http.get<any>(
      `${this.apiUrl}/products/${product_id}/pages/remote-source?type=0&progress=<100`
    );
  }
  
  /** quee use for sources tab */
  getProductSourceRemoteQueue(product_id) {
    return this.http.get<any>(
      `${this.apiUrl}/products/${product_id}/pages/remote-source?type=>0&type=<3&progress=<100`
    );
  }
  
  getProductSourceAssets(product_id) {
    return this.http.get<any>(
      `${this.apiUrl}/products/${product_id}/pages/source-asssets`
    );
  }

  deleteProductPage(product_id: number, id: number) {
    return this.http.delete<any>(
      `${this.apiUrl}/products/${product_id}/pages/${id}`,
      {}
    );
  }

  deleteAllProductPage(product_id: number) {
    return this.http.delete<any>(
      `${this.apiUrl}/products/${product_id}/pages`,
      {}
    );
  }

  /** save product applications */
  updateProductApplications(product_id: number, data) {
    return this.http
      .put<any>(`${this.apiUrl}/products/${product_id}/applications`, data)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  /** save products locale */
  updateProductLocales(product_id: number, data) {
    return this.http
      .put<any>(`${this.apiUrl}/products/${product_id}/locales`, data)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  /** save product selected categories */
  updateProductCategories(product_id: number, data) {
    return this.http
      .put<any>(`${this.apiUrl}/products/${product_id}/categories`, data)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  /** update product lines */
  updateProductLines(product_id: number, data) {
    return this.http
      .put<any>(`${this.apiUrl}/products/${product_id}/groups`, data)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  /** update product credits */
  updateProductCredits(product_id: number, data) {
    return this.http
      .put<any>(`${this.apiUrl}/products/${product_id}/credits`, data)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  updateProductImportPrintReady(product_id: number, data) {
    return this.http
      .put<any>(
        `${this.apiUrl}/products/${product_id}/import-print-ready`,
        data
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  updateProductImportIndesign(product_id: number, data) {
    return this.http
      .put<any>(`${this.apiUrl}/products/${product_id}/import-indesign`, data)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  updateProductUploadPrintReady(product_id: number, data) {
    return this.http
      .post<any>(
        `${this.apiUrl}/products/${product_id}/upload-print-ready`,
        data
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  updateProductUploadIndesign(product_id: number, data) {
    return this.http
      .post<any>(`${this.apiUrl}/products/${product_id}/upload-indesign`, data)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  updateProductCustomFields(product_id: number, data) {
    return this.http
      .put<any>(`${this.apiUrl}/products/${product_id}/custom-fields`, data)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  deleteProductCustomFields(product_id: number, id: number) {
    return this.http.delete<any>(
      `${this.apiUrl}/products/${product_id}/custom-fields/${id}`,
      {}
    );
  }

  addProductPage(product_id: number, data) {
    return this.http
      .post<any>(`${this.apiUrl}/products/${product_id}/pages`, data)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

 addProductToBundleQueue(product_id: number) {
    return this.http
      .post<any>(`${this.apiUrl}/products/${product_id}/bundle-queue`, {})
      .pipe(
        map((res) => {
          return res;
        })
      );
  }


  getProductUviewKeyframes(product_id, page_index) {
    return this.http.get<any>(
      `${this.apiUrl}/uview/${product_id}/key-frames/${page_index}`
    );
  }

  createProductUviewKeyframes(product_id, page_index, data) {
      return this.http.post<any>(`${this.apiUrl}/uview/${product_id}/key-frames/${page_index}`, data).pipe(
        map((res) => {
          return res;
        })
      );
  }

  getProductsbyPromotion(promotion: number, page: number = 1, filter: string = '', limit: number = 5,age:number = 0, categories:number = 0, 
    publishers:number = 0, types:number = 0, selected:number = 0) {
      return this.http.get<any>(`${this.apiUrl}/promotions/${promotion}/products?page=${page}&search=${filter}&limit=${limit}&age=${age}&categories=${categories}&publishers=${publishers}&types=${types}&selected=${selected}`);
  }
    
  updateProductUviewKeyframes(product_id, page_index, data) {
    return this.http
      .put<any>(`${this.apiUrl}/uview/${product_id}/key-frames/${page_index}`, data)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  updateProductUviewKeyframesOrder(product_id, page_index, data) {
    return this.http
      .put<any>(`${this.apiUrl}/uview/${product_id}/key-frames-order/${page_index}`, data)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  
  deleteProductUviewKeyframes(product_id, page_index, id) {
      return this.http.delete<any>(
        `${this.apiUrl}/uview/${product_id}/key-frames/${page_index}/${id}`,
        {}
      );
  }

  getProductNotes(product_id) {
    return this.http.get<any>(
      `${this.apiUrl}/products/${product_id}/notes`
    );
  }


 addProductNotes(notesData, product_id: number) {
  return this.http
    .post<any>(`${this.apiUrl}/products/${product_id}/notes`, notesData)
    .pipe(
      map((res) => {
        return res;
      })
    );
    
}

getproductDashboard(filter_values, cms_user_id:number = 0, limit = 2000){  
  let age = 0;
  let categories = 0;
  let publishers = 0;
  let types = 0;  
  let workflowStatus= 0;
  let language = 0;
    
  if(cms_user_id == 0 && filter_values.workflow_user_id != null && filter_values.workflow_user_id.length > 0) {
    cms_user_id = filter_values.workflow_user_id[0].id;    
  }

  if(filter_values.categories != null && filter_values.categories.length > 0) {
    categories = filter_values.categories[0].id;        
  }

  if(filter_values.publishers != null && filter_values.publishers.length > 0) {
    publishers = filter_values.publishers[0].id;        
  }

  if(filter_values.content_ratings != null && filter_values.content_ratings.length > 0) {
    age = filter_values.content_ratings[0].id;        
  }

  if(filter_values.productTypes != null && filter_values.productTypes.length > 0) {
    types = filter_values.productTypes[0].id;        
  }

  if(filter_values.languages != null && filter_values.languages.length > 0) {
    language = filter_values.languages[0].id;        
  }
  
  if(filter_values.workflowStatus != null && filter_values.workflowStatus.length > 0) {
    workflowStatus = filter_values.workflowStatus[0].id;        
  }

  return this.http.get<any>(`${this.apiUrl}/product-dashboard?workflow_user_id=${cms_user_id}&limit=${limit}`
  + `&age=${age}&categories=${categories}&publishers=${publishers}&types=${types}&workflow_status_id=${workflowStatus}&language_id=${language}`);
}

batchupdateProducts(data) {
  return this.http
    .post<any>(`${this.apiUrl}/products/batch_update`, data)
    .pipe(
      map((res) => {
        return res;
      })
    );
    
}

getProductActivePages(product_id) {
  return this.http.get<any>(`${this.apiUrl}/products/${product_id}/pages/active`);
}


}
