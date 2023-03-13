import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LibraryService } from "../_services/library.service"
import { ProductsService } from "../_services/products.service"
import { FormBuilder, FormGroup } from '@angular/forms';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthenticationService } from "../_services";
import { HttpErrorResponse } from "@angular/common/http";
import {map, tap} from "rxjs/operators";
import {TooltipPosition} from '@angular/material/tooltip';
import { AuthGuard } from "../_guards";


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  filterForm:FormGroup;
  apiUrl = environment.apiEndpoint;
  loading = false;
  dataLoaded = false;        
  currentUser = this.authenticationService.currentUserValue;
  library_id = this.currentUser.library_id;
  library_dns = this.currentUser.library_dns;
  logged_library = this.currentUser.library_id;
  updates_disabled = 0;
  filter_disabled = true;
  
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
    private productsService: ProductsService, 
    private formBuilder: FormBuilder,
    private _flashMessagesService: FlashMessagesService,
    private authenticationService: AuthenticationService,
    private router : Router,
    public guard: AuthGuard
  ) { }

  ngOnInit() {           
    // lets make sure it get the value from authentciation service
    this.currentUser = this.authenticationService.currentUserValue;
    this.library_id = this.currentUser.library_id;
    this.library_dns = this.currentUser.library_dns;

    this.initFilterForm();  

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
    
    if(this.library_id == null){      
      this.libraryService.getLibrary(this.library_id)
      .subscribe(res => {          
        this.library_dns = res.nickname;
        this.updates_disabled = res.parent_collection;          
      }); 
    }    
  }
  

  initFilterForm() {    
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

  getLibraryList(){
    this.libraryService.getLibrariesList()
    .subscribe(res => {
      this.libraries = res.items;
      this.dataLoaded = true;
    });
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

  onStatusSelect(item: any){            
    this.selected_status = item.id;    
    this.getProductsList(1);
  }

  onStatusDeSelect(item: any){        
    this.selected_status = 0;   
    this.getProductsList(1);
  }

  onLibrarySelect(item: any){                
    this.library_id = parseInt(item.id);    

    this.libraryService.getLibrary(this.library_id)
        .subscribe(res => {          
          this.library_dns = res.nickname;
          this.updates_disabled = res.parent_collection;          
        });

    this.getProductsList(1);
  }

  onLibraryDeSelect(item: any){        
    this.library_id = null;   
    this.library_dns = null;
    this.updates_disabled = 0;
    this.getProductsList(1);
  }

  openBookTab(e, bundlename){
    e.preventDefault();
    window.open('https://' + this.library_dns + '.librarypass.com/product/' + bundlename, '_blank');
  }

  showComicImage(e, filename){          
    this.selected_img = filename.replace("/small/", "/large/");
    // setTimeout(() => { $("#comicCover").modal('show'); }, 400);
  }

  filterbyProductName(e){
    this.filter = e.target.value;    
    this.getProductsList(this.page);
  }

  getProductsList(page: number) {    
    this.dataLoaded = false;
    this.page = page;


    this.products = this.libraryService.getAllAvailableProducts( page, this.filter, this.limit, this.selected_age, 
      this.selected_categories, this.selected_publishers, this.selected_types, this.selected_status)
      .pipe(tap (res => {        
        this.library_content_ratings = res.filters.ages;
        this.publishers = res.filters.publishers;
        this.productTypes = res.filters.product_types;
        this.categories = res.filters.categories;
        this.total = res.total;
        this.dataLoaded = true;
        this.filter_disabled = false;        
      }), map( res => res.products ) );        

    $('html, body').animate({
        scrollTop: $("#displayBookList").offset().top
    }, 1000);

    this.status_list = [
      { id: 0, name: 'All' },
      { id: 1, name: 'Disabled' }    
    ];   
  } 

  disableSelectedbooks(e, product_id) {
    let is_checked = e.currentTarget.checked ? 1 : 0;

    this.productsService.setLibraryProductDisabled(this.library_id, product_id, is_checked, this.logged_library)
      .subscribe(
        data => {
          this._flashMessagesService.show('Successfully updated product list.', { cssClass: 'alert-success', timeout: 5000 });
        },
        (error: HttpErrorResponse) => {
          console.log(error.message);
        });
  }


  editProduct(e, productId) {
    e.preventDefault();
    this.router.navigate([`/products/edit/${productId}`], { skipLocationChange: true });
  }

  createNewProduct() {
    this.router.navigate([`/products/create`], { skipLocationChange: true });

  }

}
