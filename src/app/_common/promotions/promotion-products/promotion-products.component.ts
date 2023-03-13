import { Component, OnInit, Input} from '@angular/core';
import { environment } from '../../../environments/environment';
import { LibraryService } from "../../_services/library.service"
import { ProductsService } from "../../_services/products.service"
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AuthenticationService } from "../../_services";
import {PromotionsService} from "../../_services/promotions.service";
import {ReportService} from "../../_services/report.service";
import {MiscService} from "../../_services/misc.service";
import {map, tap} from "rxjs/operators";

@Component({
  selector: 'app-promotion-products',
  templateUrl: './promotion-products.component.html',
  styleUrls: ['./promotion-products.component.css']
})
export class PromotionProductsComponent implements OnInit {

  @Input() promotion_id;
  // @Output() myEvent = new EventEmitter<string>();

  filterForm:UntypedFormGroup;
  apiUrl = environment.apiEndpoint;
  loading = false;
  dataLoaded = false;        
  currentUser = this.authenticationService.currentUserValue;
  filter_disabled = false;
  
  selected_age:number = 0;
  selected_categories:number = 0;
  selected_publishers:number = 0;
  selected_types:number = 0;      
  selected_status:number = 0;      
  selected_img:string;

  products: object;
  library_content_ratings = [];  
  categories = [];
  productTypes = [];
  publishers = [];   
  libraries = [];
  dropdownSettings = {};  
  status_list = [];
  html;

  total: number = 0;
  page: number = 1;
  limit: number = 25;  
  filter: string = '';  
  is_admin = (this.currentUser.short_codes.includes('is_admin'));
  
  constructor(    
    private libraryService: LibraryService, 
    private promotionsService: PromotionsService,     
    private reportService: ReportService, 
    private productService: ProductsService, 
    private miscService: MiscService,
    private formBuilder: UntypedFormBuilder,            
    private authenticationService: AuthenticationService,    
  ) { }

  ngOnInit() {           
    this.initLibraryForm();  
    this.initFilters();
    this.dropdownSettings= {
        singleSelection: true,
        closeDropDownOnSelection: true,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'Unselect All',      
        allowSearchFilter: true
    };   

    this.getProductsList(1);
    this.html = '<span><i>Tooltip</i> <u>with</u> <b>HTML</b></span>';

    
  }
  
  initLibraryForm() {    
    this.filterForm = this.formBuilder.group({
      content_ratings: [],
      publishers: [],
      productTypes: [],
      categories: [],
      status: [],
      libraries_list: [],
    });
  }

    // convenience getter for easy access to form fields
  get f() { return this.filterForm.controls; }

  filterbyProductName(e){
    this.filter = e.target.value;    
    this.getProductsList(this.page);
  }
  
  initFilters(){
    this.getContentRatings();
    this.getPublishers();
    this.getProductTypes();
    this.getCategories();
  }

  getContentRatings() {
    this.libraryService.getContentRatings().subscribe(
      data => {                        
        this.library_content_ratings = data
    });
  }

  getPublishers() 
  {
    this.reportService.getSuppliersList().subscribe(
      data => {                        
        this.publishers = data.items;
    });
  }

  getProductTypes() {
    this.miscService.getProductTypes().subscribe(
      data => {                     
        this.productTypes = data;
    });
  }

  getCategories() {
    this.miscService.getCategories().subscribe(
      data => {                     
        this.categories = data;
    });
  }  

  getProductsList(page: number) {    
    this.dataLoaded = false;
    this.page = page;

    this.products = this.productService.getProductsbyPromotion( this.promotion_id, page, this.filter, this.limit, this.selected_age, 
      this.selected_categories, this.selected_publishers, this.selected_types, 0)
      .pipe(tap (res => {                                
        this.total = res.total;
        this.dataLoaded = true;              
      }), map( res => res.products ) );        

    $('html, body').animate({
        scrollTop: $("#displayBookList").offset().top
    }, 1000);

  } 

  updateSelectedbooks(e, product_id) {
    let is_checked = e.currentTarget.checked ? 1 : 0;    
            
    if(is_checked){
      this.promotionsService.addPromotionProducts(this.promotion_id, {'products' : {product_id} })
      .subscribe();
    }
    else{
      this.promotionsService.deleteProductByPromotion(this.promotion_id, product_id)
      .subscribe();
    }      
  }

  onContentRatingDeSelect(item: any){
    this.selected_age = 0;    
    this.getProductsList(1);
  }

  onContentRatingSelect(item: any){        
    this.selected_age = item.id;    
    this.getProductsList(1);
  }

  onPublishersDeSelect(item: any){
    this.selected_publishers = 0;    
    this.getProductsList(1);
  }

  onPublishersSelect(item: any){        
    this.selected_publishers = item.id;    
    this.getProductsList(1);
  }

  onProductTypesDeSelect(item: any){
    this.selected_types = 0;    
    this.getProductsList(1);
  }

  onProductTypesSelect(item: any){        
    this.selected_types = item.id;    
    this.getProductsList(1);
  }

  onCategoriesSelect(item: any){
    this.selected_categories = item.id;    
    this.getProductsList(1);
  }

  onCategoriesDeSelect(item: any){
    this.selected_categories = 0;    
    this.getProductsList(1);
  }

}
