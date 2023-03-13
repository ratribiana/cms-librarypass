import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LibraryService } from "../_services/library.service"
import { ProductsService } from "../_services/products.service"
import { UserMaintenanceService } from "../_services/user-maintenance.service";
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthenticationService } from "../_services";
import { HttpErrorResponse } from "@angular/common/http";
import {map, tap} from "rxjs/operators";
import { ToastrService } from 'ngx-toastr';
import { AuthGuard } from "../_guards";
import {NgbdSortableHeader, SortEvent} from '../_helpers/sortable.directive';

@Component({
  selector: 'app-content-filtering',
  templateUrl: './content-filtering.component.html',
  styleUrls: ['./content-filtering.component.css']
})
export class ContentFilteringComponent implements OnInit {
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  
  filterForm:FormGroup;
  apiUrl = environment.apiEndpoint;
  loading = false;
  dataLoaded = true;        
  currentUser = this.authenticationService.currentUserValue;
  library_id = this.currentUser.library_id;
  logged_library = this.currentUser.library_id;
  library_dns = this.currentUser.library_dns;
  filter_disabled = true;
  sort:string = ''  
  
  selected_age:number = 0;
  selected_categories:number = 0;
  selected_publishers:number = 0;
  selected_types:number = 0;      
  selected_status:number = 0;      
  selected_language:number = 0;      
  selected_img:string = '';
  selected_availability:string = '';
  isCustomRange: boolean = false;
  date_range: string = '';  

  products: object;
  library_content_ratings = [];  
  languages = [];
  categories = [];
  // productTypes = [];
  publishers = [];   
  libraries = [];
  dropdownSettings = {};    
  status_list = []; 
  availability_filter = []; 
  html;

  total: number = 0;
  page: number = 1;
  limit: number = 25;  
  filter: string = '';  
  is_admin = (this.currentUser.short_codes.includes('is_admin'));
  is_parent = false;
  institution_node: any;    
  show_root_library = !this.is_admin ? 1 : 0;
  
  parent_institutions = [];        
  library_ids = [];
  selectedItems = [];
  curation_disabled = false;

  
  constructor(    
    private userService: UserMaintenanceService,
    private libraryService: LibraryService, 
    private productsService: ProductsService, 
    private formBuilder: FormBuilder,    
    private authenticationService: AuthenticationService,
    private toastr: ToastrService,
    private router : Router,
    public guard: AuthGuard
  ) { }

  ngOnInit() {       
    
    this.initLibraryForm();  

    this.dropdownSettings= {     
        closeDropDownOnSelection: true,        
        singleSelection: true,   
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'Unselect All',      
        allowSearchFilter: true,
        defaultOpen: false
    };   

    this.html = '<span><i>Tooltip</i> <u>with</u> <b>HTML</b></span>';

    // lets make sure it get the value from authentciation service
    this.currentUser = this.authenticationService.currentUserValue;    
    this.library_dns = this.currentUser.library_dns;
        
    if(this.is_admin){                 
      this.library_id = 0;      
      this.getParentInstitutions();            
    }
    else{
      this.check_user_curate(this.currentUser.library_id);            
      this.getInstitutionNode(
        {
          'id' : this.currentUser.library_id,
          'name' : this.currentUser.library_name,
          'lineage' : '1.1'
        }
      );         
             
    }        


    this.availability_filter = [
      { id: 'date_before', name: 'Release Date Before' },
      { id: 'date_after', name: 'Release Date After' },
      { id: 'just_released', name: 'Just Released in the last 14 days' }    
    ];   
  
  }
  
  initLibraryForm() {    
    this.filterForm = this.formBuilder.group({
      content_ratings: [],
      publishers: [],
      languages: [],
      // productTypes: [],
      categories: [],
      status: [],
      available_date_filter: [],
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

  openBookTab(e, bundlename){
    e.preventDefault();
    window.open('https://' + this.library_dns + '.librarypass.com/product/' + bundlename, '_blank');
  }

  showComicImage(e, filename){          
    this.selected_img = filename.replace("/small/", "/large/");    
  }

  filterbyProductName(e){
    if(!this.library_id){
      return false;
    }
    this.filter = e.target.value;    
    this.getProductsList(1);
  }


  onSort({column, direction}: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.loading = true;
    this.sort = direction != '' ? column + '.' + direction : '';
    
    this.getProductsList(this.page);
  }


  getProductsList(page: number) {  
    
    this.dataLoaded = false;
    this.page = page;

    if(!this.library_id) {
      this.library_content_ratings = [];
      this.languages = [];
      this.publishers = [];
      // this.productTypes = [];
      this.categories = [];
      this.status_list = [];            
      this.total = 0;
      this.dataLoaded = true;
      this.filter_disabled = true;

      return false;
    }

    this.getLibraryDNS();
      
    this.products = this.libraryService.getLibraryProducts( this.library_id, page, this.filter, this.limit, this.selected_age, 
      this.selected_categories, this.selected_publishers, this.selected_types, this.selected_language, this.selected_availability, 
      this.date_range, this.selected_status, this.sort)
      .pipe(tap (res => {        
        $("body").trigger("click"); 
        this.library_content_ratings = res.filters.ages;
        this.languages = res.filters.languages;
        this.publishers = res.filters.publishers;
        // this.productTypes = res.filters.product_types;
        this.categories = res.filters.categories;
        this.total = res.total;
        this.dataLoaded = true;
        this.filter_disabled = false;                        
      }), map( res => res.products ) );        

    $('html, body').animate({
        scrollTop: $("#displayBookList").offset().top
    }, 1000);
         
    this.status_list = [      
      { id: 1, name: 'Disabled' },
      { id: 2, name: 'Enabled' }    
    ];   
              
  } 

  disableSelectedbooks(e, product_id) {    
    let is_checked = e.currentTarget.checked ? 1 : 0;        
    let action = is_checked ? 'disabled' : 'enabled';
    let text = this.is_parent ? `This title has been ${action} for all member accounts selected` : `This title has been ${action}`;
    const textLock = "Curation is locked for this title. Contact your administrator for more information";

    this.productsService.setLibraryProductDisabled(this.library_id, product_id, is_checked, this.logged_library)
      .subscribe(
        data => {                            
          this.toastr.success(this.curation_disabled?textLock:text, 'Notification');       
        },
        (error: HttpErrorResponse) => {
          console.log(error.message);
        });
  }

  getParentInstitutions(){
    this.libraryService.getLibrariesList(0, 1)
     .subscribe(res => {      
     this.parent_institutions = res.items;      
    });
  }

  getLibraryDNS(){
    this.libraryService.getLibrary(this.library_id)
    .subscribe(res => {          
      this.library_dns = res.nickname;
    });
  }

  getItemStyle(text) {    
    let count = this.getItemLineage(text);
    let space = 0;

    space = (count*15);
    return {left: space+'px', marginRight: space+'px' };
  }

  getItemLineage(lineage) {
    let blocks = lineage.split('.');
    return (blocks.length) - 1;
  }

  get getItems() {
    return this.institution_node.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
  }

  onLockClick(event) {
    event.preventDefault();
    const textLock = "Curation is locked for this title. Contact your administrator for more information";
    const text = "This title is disabled and locked for all member accounts selected";
    this.toastr.warning(this.curation_disabled?textLock:text, 'Notification', {
      disableTimeOut : true
    }); 
  }

  onDropDownClose(event){    
    if(this.selectedItems.length > 0){
      $('.lib-list').parent().find('input').prop('checked', false);
      $('.option-' + this.selectedItems[0].id).parent().find('input').prop('checked', true);
        
      this.pseudoCheckChildren(this.selectedItems[0].id);
    }
    
  }

  pseudoCheckChildren(lib_id){
    let result = this.getChildrenOption(lib_id);              
    if(result.length > 1){                    
      $('.child-list-count').html( ' +' + result.length + ' institution');
      result.forEach(dat => {          
        $('.option-' + dat.id).parent().find('input').prop('checked', true);
      });              
    }        
  }

  filterCustomRange(dateFilter: any){    
    this.date_range = dateFilter.getFullYear() + '-' + String((dateFilter.getMonth() + 1)).padStart(2, '0') + '-' + String(dateFilter.getDate()).padStart(2, '0');      
    this.getProductsList(1);
  }

  onFilterSelect(item: any, type){    
    if( type == 'selected_availability' ){
      this.selected_availability = item.id;
      if(item.id == 'just_released'){
        this.isCustomRange = false;
        this.getProductsList(1);
      }        
      else{
        this.isCustomRange = true;
      }          
      return;
    }
            
    switch(type) {
      case 'institution':        
        this.library_id = item.id;                  
        break;
      case 'selected_age':
        this.selected_age = item.id;    
        break;
      case 'selected_publishers':         
        this.selected_publishers = item.id;    
        break;
      case 'selected_types':
        this.selected_types = item.id;    
        break;
      case 'selected_categories':
        this.selected_categories = item.id;    
        break;
      case 'selected_status':
        this.selected_status = item.id;    
        break;
      case 'selected_language':
        this.selected_language = item.id;    
        break;            
    }

    this.getProductsList(1);
  }


  getChildrenOption(selected_id){
    let __FOUND = this.institution_node.findIndex(function(post, index) {          
      if(post.id == selected_id)
      return true;
    });
  
    let line = this.institution_node[__FOUND]['lineage'];    
    let result = this.institution_node.filter(function(dat, i){
      return (dat.lineage.startsWith(line) && dat.id != selected_id);
    });

    return result;
  }

  onFilterDeSelect(item: any, type){
    switch(type) {
      case 'institution':                
        this.library_id = 0;
        this.selectedItems = [];
        $('.lib-list').parent().find('input').prop('checked', false);        
        break;
      case 'selected_age':
        this.selected_age = 0;
        break;
      case 'selected_publishers':
        this.selected_publishers = 0;
        break;
      case 'selected_types':
        this.selected_types = 0;    
        break;
      case 'selected_categories':
        this.selected_categories = 0;
        break;
      case 'selected_status':
        this.selected_status = 0;
      case 'selected_language':
        this.selected_language = 0;
        break;
      case 'selected_availability':
        this.selected_availability = '';
        this.date_range = '';
        this.isCustomRange = false;
        break;    
    }
    this.getProductsList(1);
  }

  onParentSelect(item){        
    this.getInstitutionNode(item);
  }

  resetParentInstitution(event){    
    event.preventDefault();
    this.is_parent = false;        
    this.selectedItems = [];
    this.institution_node = [];      
    this.library_id = 0;
    this.getProductsList(1);
  }

  async getInstitutionNode(item){  
    this.is_parent = false;
    this.library_id = item.id;      

    let institution_node = await this.getLibraryNodes(this.library_id);
    this.institution_node = institution_node;

    if(this.institution_node.length > 1){
      this.is_parent = true;          
      this.selectedItems = [{
        'id' : item.id,
        'name' : item.name,
        'lineage' : '1.1'
      }];                                

      await this.sleep(1000);
      $("body").trigger("click"); 
    }
    
    this.getProductsList(1);         
    
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getLibraryNodes(library_id) {
    return new Promise(resolve => {
        this.libraryService.getLibraryNodes(library_id)
        .subscribe(res => {                           
          resolve(res);
        });
    });
  }

  check_user_curate(lib_id: number) {
    if (this.is_admin) {
      this.curation_disabled = false;
      return false;
    }
    this.userService.check_user_can_curate(lib_id)
      .subscribe(res => {
        this.curation_disabled = !res;
      });
  }

  sortFunction(a, b) {
    if (a['lineage'].length === b['lineage'].length) {
      return 0;
    }
    else {
      return (a['lineage'].length < b['lineage'].length) ? -1 : 1;
    }
  }
  
}
