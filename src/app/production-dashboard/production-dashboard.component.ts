import { Component, OnInit, ViewChild} from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { ProductsService } from "../_services"
import {map, tap} from "rxjs/operators";
import { ViewEncapsulation } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { MiscService } from '../_services';
import { Observable } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, UntypedFormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {  } from '@angular/forms';
import * as moment from 'moment';
import { Moment } from 'moment';
import { AuthenticationService } from "../_services";
import {ConfirmModalComponent, ModalConfig} from '../_common/confirm-modal';
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE, OwlDateTimeComponent, OwlDateTimeFormats } from 'ng-pick-datetime';
@Component({
  selector: 'app-production-dashboard',
  templateUrl: './production-dashboard.component.html',
  styleUrls: ['./production-dashboard.component.css'],  
  encapsulation: ViewEncapsulation.None
})


export class ProductionDashboardComponent implements OnInit {

  tableDropdownSettings = {};
  dropdownListB = {};
  addFilterColumns = {};
  filterForm:UntypedFormGroup;
  profileForm:UntypedFormGroup;
  productSearchForm:UntypedFormGroup;
  productsLocaleForm:UntypedFormGroup;
  editing = {};
  rows:any = [];
  products: object;
  temp = [];
  ColumnMode = ColumnMode;
  suppliers = {};
  content_ratings = {};
  product_types = {};
  updates = [];
  production_users = {};
  price_tiers = {};
  columns = [];
  dropdownSettings = {};  
  dropdownMultipleSettings = {};  
  productCategories = {};
  productLines = {};
  localesProducts = {};
  categories_list = {};
  locales = {};
  product_lines_list = {};
  release_categories = {};
  default_production_user = [];
  language_list = {};
  workflow_list= {};
  priorities = {};
  allColumns = [];
  userProfiles = {};
  selectedProfile = 1;
  searchOnColumn;
  search_group = [1];
  search_date_from = [new UntypedFormControl(moment())];
  search_date_to = [new UntypedFormControl(moment())];
  search_input = [{
    'value': '',
    'type': 'name',
  }];
  default_text = '--';

  currentUser = this.authenticationService.currentUserValue;   
  is_admin:boolean = (this.currentUser.short_codes.includes('is_admin')) ? true : false;
  loadingIndicator = true;
  reorderable = true;
  dirty_profile_index = null;
  loading = false;

  assigned_to_filter = [];
  publishers_filter= [];
  library_content_filter = [];
  product_type_filter = [];
  language_filters = [];
  categories_filters = [];
  priorities_filter = [];
  workflow_filters = [];
  tableColumns = [];
  dashboardProfiles = [];
  release_categories_filters = [];
  price_tier_filters = [];
  selectedColumns = [];
  filters_filters = [];
  locales_list = []
  profile_active = {
    id: null,
    name: '',
  };
  profile_columns = [];
  profile_delete = {
    id: null,
    name: null,
  };
  profile_update = {
    id: null,
    value: null,
  };  
  allowMore = true;
  fullSearchFilters = [
    {'value' : 'name', 'desc' : 'Name/Title'},
    {'value' : 'description', 'desc' : 'Description'},
    {'value' : 'product_publisher_identifier', 'desc' : 'Publisher Identifier'},
    {'value' : 'artists', 'desc' : 'Artist'},
    {'value' : 'writers', 'desc' : 'Writer'},
    // {'value' : 'date', 'desc' : 'Date'},
  ];
  limitFilter = [20, 50, 100];
  limit_active = this.limitFilter[0];
  page_thumbnail = [];
  page_thumbnail_active = '';
  table_limit = 20;
  is_dirty = false;
  page_thumbnail_loaded = false;
  search_type = 1;
  search_type_fade = false;
  hard_limit = 2000;
  show_user_filter = false;
  filter_disabled = false;
  prev_filters = [];
  defaultImage = '../assets/img/blank.png';

  // modal for deleting Profile
  @ViewChild('modalDelete')  modalDelete: ConfirmModalComponent;
  
  modalDeleteConfig: ModalConfig = {
    modalTitle: 'Delete Profile',
    onDismiss: () => {
      if(this.profile_delete.id) {        
        this.misc.deleteDashboardProfile(this.profile_delete.id)
        .subscribe(
            data => {                                                           
              this.dashboardProfiles.splice(this.dirty_profile_index, 1);              
              this.dirty_profile_index = null;
              this.toastr.success('Successfully Deleted Dashboard Profile.', 'Notification');
        });
      }
      return true;
    },
    dismissButtonLabel: 'Delete',
    onClose: () => {
      return false;
    },
    closeButtonLabel: 'Cancel',
    backdropStatic: true,
  }

  // modal for deleting Profile
  @ViewChild('modalUpdate')  modalUpdate: ConfirmModalComponent;
  
  modalUpdateConfig: ModalConfig = {
    modalTitle: '',
    onDismiss: () => {
      return true;
    },
    dismissButtonLabel: 'Close',
    hideCloseButton: true,
    backdropStatic: true,
  }

  // modal for deleting Profile
  @ViewChild('modalBuild')  modalBuild: ConfirmModalComponent;
  
  modalBuildConfig: ModalConfig = {
    modalTitle: 'Build',
    onDismiss: () => {
      return true;
    },
    dismissButtonLabel: 'Yes',
    onClose: () => {
      return false;
    },
    closeButtonLabel: 'No',
    backdropStatic: true,
  }

  // modal for deleting Profile
  @ViewChild('modalUnsaved')  modalUnsaved: ConfirmModalComponent;
  
  modalUnsavedConfig: ModalConfig = {
    modalTitle: 'Dashboard',
    onDismiss: () => {
      return true;
    },
    dismissButtonLabel: 'Yes',
    onClose: () => {
      return false;
    },
    closeButtonLabel: 'No',
    backdropStatic: true,
  }

  // modal for unsaved filter
  @ViewChild('modalUnsavedFilter')  modalUnsavedFilter: ConfirmModalComponent;
  
  modalUnsavedFilterConfig: ModalConfig = {
    modalTitle: 'Warning',
    onDismiss: () => {
      return true;
    },
    dismissButtonLabel: 'Yes',
    onClose: () => {
      return false;
    },
    closeButtonLabel: 'No',
    backdropStatic: true,
  }

    // modal for deleting Profile
    @ViewChild('localesModal')  localesModal: ConfirmModalComponent;
  
    modalLocalesConfig: ModalConfig = {
      modalTitle: '',
      onDismiss: () => {
        return true;
      },
      dismissButtonLabel: 'Close',
      hideCloseButton: true,
      backdropStatic: true,
    }
  
  // @ViewChild(DatatableComponent) table: DatatableComponent;
  constructor(
    private productService: ProductsService,    
    private misc: MiscService,
    private formBuilder: UntypedFormBuilder,
    private toastr: ToastrService,
    private authenticationService: AuthenticationService,
    ) {                  
      this.allColumns = [                  
        { name: 'Cover', type: 'image', prop: 'product_image_url', select_options: '', editable: false},    
        { name: 'Build', type: 'button', prop: 'completed', select_options: '', editable: false},    
        { name: 'Edit', type: 'link', prop: 'product_id', select_options: '', editable: false},            
        { name: 'Bundle Name', type: 'text', prop: 'comic_bundle_name', select_options: '', editable: false},            
        { name: 'Categories', type: 'multi', prop: 'categories', select_options: '', editable: true},     
        { name: 'Product Lines', type: 'multi', prop: 'product_lines', select_options: '', editable: true},     
        { name: 'Price Tiers', type: 'select', prop: 'library_price_tier_id', select_options: 'price_tiers', editable: true},
        { name: 'Name', type: 'text', prop: 'name', select_options: '', editable: true},     
        { name: 'Number', type: 'number', prop: 'number', select_options: '', editable: true},     
        { name: 'Manga Orientation', type: 'boolean', prop: 'manga_orientation', select_options: 'boolean', editable: true},     
        { name: 'Legal', type: 'text', prop: 'legal', select_options: '', editable: true},     
        { name: 'Description', type: 'textarea', prop: 'description', select_options: '', editable: true},       
        { name: 'Available Date', type: 'datetime', prop: 'available_date', select_options: 'date', editable: true},       
        { name: 'Type', type: 'select', prop: 'product_type_id', select_options: 'product_types', editable: true},     
        { name: 'Age Rating', type: 'select', prop: 'library_content_rating_id', select_options: 'content_ratings', editable: true},     
        { name: 'Publisher', type: 'select', prop: 'supplier_id', select_options: 'suppliers', editable: true},     
        { name: 'Imprint', type: 'select', prop: 'imprint', select_options: 'suppliers', editable: true},     
        { name: 'Publisher Identifier', type: 'text', prop: 'product_publisher_identifier', select_options: '', editable: true},
        { name: 'Artists', type: 'textarea', prop: 'artists', select_options: '', editable: true},     
        { name: 'Writers', type: 'textarea', prop: 'writers', select_options: '', editable: true},
        { name: 'Language', type: 'select', prop: 'language_id', select_options: 'language_list', editable: true},
        { name: 'Priority', type: 'select', prop: 'priority_id', select_options: 'priorities', editable: true},
        { name: 'Release Category', type: 'select', prop: 'release_cat_id', select_options: 'release_categories', editable: true},
        { name: 'Library Active', type: 'boolean', prop: 'library_active', select_options: 'boolean', editable: true},
        { name: 'Locales', type: 'text', prop: 'locales_restriction_mode', select_options: 'locales_restriction_mode', editable: true},            
        { name: 'View Pages', type: 'button', prop: 'view_pages', select_options: '', editable: false},
      ];  
        
        
      if(this.is_admin) {
        // this.selectedColumns = ['Assigned', ...this.selectedColumns];
        this.allColumns = [{ name: 'Assigned', type: 'select', prop: 'workflow_user_id', select_options: 'production_users', editable: true}, ... this.allColumns]
      }

      this.getDashboardProfiles();      
      this.getData([], this.currentUser.id);  

      window.addEventListener("beforeunload", (event) => {
        event.preventDefault();
        event.returnValue = "Unsaved modifications";
        return event;
    });
   
  }
  
  async canDeactivate(){
    if (this.updates.length > 0) {
      var result = await this.modalUnsaved.open();
      return result;
      // return window.confirm('There are unsaved changes. Are you sure you want continue?');              
    }
    return true;
  }   

  ngOnInit() {            
    this.initData();           
    this.initFilterForm();         
    this.addMoreSearch();
  }

  updateValue(event, cell, rowIndex, cell_value = '') {   
    var value = event == null ? cell_value : event.target.value;     

    this.editing[rowIndex + '-' + cell] = 0;    
    this.rows[rowIndex]['updated'] = 1;
    this.rows[rowIndex]['updated_cells'] = this.rows[rowIndex]['updated_cells'] + ',' + cell;    
    this.rows[rowIndex][cell] = value;
    this.rows = [...this.rows];    
    this.is_dirty = true;

    this.updates.push({
      'product_id' : this.rows[rowIndex]['product_id'],
      'field' : cell,
      'value' : value,
      'rowIndex': rowIndex
    });

    // console.log(this.rows[rowIndex]);
    console.log(this.updates);
        
  }

  get f() { return this.filterForm.controls; }

  async getData(filter_values = [], user_id = 0) {         
    let result = await this.getProductsList(filter_values, user_id, this.hard_limit); 
    this.rows = result['products'];    
    this.temp = this.rows;    
    if(result['total'] > this.hard_limit){
      this.toastr.warning('More Products available that are not Loaded, Please update Filters to load these products.', 'Notification');
    }
  }

  async initData() {
    let temp_column_arr = [];

    this.userProfiles = await this.getDashboardProfiles();
    this.categories_list = await this.getCategories();   
    this.product_lines_list = await this.getProductLines();   
    this.suppliers =  await this.getPublisherList();    
    this.product_types = await this.getProductTypes();
    this.content_ratings = await this.getContentRatings();
    this.production_users = await this.getProductionUsers();    
    this.language_list = await this.getLanguagesList();
    this.workflow_list = await this.getWorkflowList();
    this.priorities = await this.getPriorities();    
    this.price_tiers = await this.getLibrayPriceTier();
    this.release_categories = await this.getReleaseCategories();
    this.locales = await this.getLocales();

    this.dashboardProfiles = Object.keys(this.userProfiles).map(key => (
      {id: key, name: this.userProfiles[key]['cms_prod_dashboard_name'], 
        is_current: this.userProfiles[key]['is_current'], dashboard_columns: this.userProfiles[key]['dashboard_columns'] }
    )); 

    if(this.dashboardProfiles.length == 0){
      
      let profile_name = 'Profile 1';      
      let temp_columns = [];

      this.allColumns.forEach(item => {            
        temp_columns.push(item.name);        
      });

      this.toastr.warning('Creating your Profile now.', 'Notification');
      this.saveDashboardProfile(profile_name, temp_columns, 1);            
    }

    this.publishers_filter = Object.keys(this.suppliers).map(key => ({id: key, name: this.suppliers[key]}));        
    this.library_content_filter = Object.keys(this.content_ratings).map(key => ({id: key, name: this.content_ratings[key]}));    
    this.product_type_filter = Object.keys(this.product_types).map(key => ({id: key, name: this.product_types[key]})); 
    this.assigned_to_filter = Object.keys(this.production_users).map(key => ({id: key, name: this.production_users[key]}));     
    this.language_filters = Object.keys(this.language_list).map(key => ({id: key, name: this.language_list[key]})); 
    this.workflow_filters = Object.keys(this.workflow_list).map(key => ({id: this.workflow_list[key]['id'], name: this.workflow_list[key]['name']})); 
    this.categories_filters = Object.keys(this.categories_list).map(key => ({id: this.categories_list[key]['id'], name: this.categories_list[key]['name']}));     
    this.priorities_filter = Object.keys(this.priorities).map(key => ({id: key, name: this.priorities[key]}));     
    this.price_tier_filters = Object.keys(this.price_tiers).map(key => ({id: key, name: this.price_tiers[key]}));     
    this.release_categories_filters = Object.keys(this.release_categories).map(key => ({id: key, name: this.release_categories[key]}));     
    this.locales_list = Object.keys(this.locales).map(key => ({id: this.locales[key]['id'], name: this.locales[key]['name']}));     
    this.tableColumns = this.allColumns;     


    this.sortOptions(this.assigned_to_filter);
    this.sortOptions(this.product_type_filter);
    this.sortOptions(this.library_content_filter);
    this.sortOptions(this.publishers_filter);
    this.sortOptions(this.language_filters);
    this.sortOptions(this.priorities_filter);
    
    Object.keys(this.dashboardProfiles).forEach(key => {
      if(this.dashboardProfiles[key].is_current == 1){
        this.profile_active = {
          id: this.dashboardProfiles[key].id,
          name: this.dashboardProfiles[key].name
        };
        this.changeDashboardProfile(key);
        return false;
      }
    })


    if(this.is_admin){
      this.filterForm.get('workflow_user_id').setValue([{id: this.currentUser.id, name: this.currentUser.username}]);    
      this.default_production_user = [{id: this.currentUser.id, name: this.currentUser.username}];
      this.prev_filters = this.filterForm.value;           
    }    

    this.allColumns.forEach(item => {    
      if(this.selectedColumns.includes(item.name)){
        temp_column_arr.push(item);
      }
      else if(item.name == 'View Pages') { //temporary
        temp_column_arr.push(item);
      }
    });
    this.columns = temp_column_arr; 

    /*
    var set_filter_value = [];
    const selff = this;
    this.filters_filters.map(function(value, index) {
      if(selff.filters_list[value.id].visible) {
        set_filter_value.push(value);
      }
    });
    this.default_filters = Object.keys(set_filter_value).map(key => ({id: set_filter_value[key]['id'], name: set_filter_value[key]['name']}));   
    */

    this.addFilterColumns = {      
      enableCheckAll:true,
      idField: 'name',
      textField: 'name',      
      allowSearchFilter: true            
    }; 

    this.tableDropdownSettings = {      
      enableCheckAll:false,
      idField: 'id',
      textField: 'name',      
      allowSearchFilter: true,
      defaultOpen: true
    }; 
    
    this.dropdownSettings= {      
      singleSelection: true,
      closeDropDownOnSelection: true,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',      
      allowSearchFilter: true
    };
  }

  initFilterForm() {    

    this.productsLocaleForm = this.formBuilder.group({    
      selected_locales: [],
      mode: 0
    });

    this.profileForm = this.formBuilder.group({    
      profile_fields: [],
      profile_name: '',
      profile_id: null,
    });


    this.filterForm = this.formBuilder.group({      
      publishers: [],
      content_ratings: [],
      productTypes: [],
      assignedUser: [],
      workflow_user_id: [],
      categories: [],
      languages: [],
      filters: [],
      workflowStatus: [],
    });

    this.productSearchForm = this.formBuilder.group({           
      query_fields: new UntypedFormArray([]),
    });
  }
  
  get ps() { return this.productSearchForm.controls; }
  get queryField() { return this.ps.query_fields as UntypedFormArray; }
  addMoreSearch() {
    let search_fields = this.productSearchForm.value.query_fields;    
    // let unavailable_fields = search_fields.map(d => d.type);

    if(search_fields.length == this.fullSearchFilters.length - 1){
      this.allowMore = false;
    }
    
    this.queryField.push(this.formBuilder.group({
      'query': '',
      'type': '',
    }));
  }
  removeSearch(key) {
    this.queryField.removeAt(key);
    this.allowMore = true;
  }

  sortOptions(obj){
    obj.sort((a, b) => {

      if(typeof a.name == 'undefined' || typeof b.name == 'undefined'){
        return 0;
      }

      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

        if (fa < fb) {
            return -1;
        }
        if (fa > fb) {
            return 1;
        }
        return 0;
    });
  }

  search() {
    let search_fields = this.productSearchForm.value.query_fields;
    this.updateFilter('', search_fields);
  }

  async updateFilter(form_name, filter_obj = []) {    
    let filter_values = this.filterForm.value;              
    this.show_user_filter = filter_values.workflow_user_id.length == 0;

    if(!this.is_dirty){
      this.prev_filters = filter_values;
    }
    
    if(this.search_type == 2){
      this.applyTableSearch(filter_obj, filter_values);
    }        
    else{
      let user_id = !this.is_admin ? this.currentUser.id : 0;    
      if(this.is_dirty){
        var isSaved = await this.modalUnsavedFilter.open();
        if (isSaved) {               
          this.is_dirty = false;
          this.getData(filter_values, user_id);
        } else {          
          let reset_value = (typeof this.prev_filters[form_name] == 'undefined' || this.prev_filters[form_name] == null) ? [] : [this.prev_filters[form_name][0]];          
          this.filterForm.get(form_name).setValue(reset_value);
        }
      }
      else{
        this.getData(filter_values, user_id);
      }          
    }
  }

  applyTableSearch(filter_obj, filter_values){
    let temp = this.temp;

    if(filter_obj.length > 0){
      filter_obj.forEach( filter_val => {
      
      if(filter_val.query.length > 0){            

      let val = filter_val.query.toLowerCase();
        switch(filter_val.type) {
          case 'description':          
              temp = temp.filter(function (d) {
                return d.description.toLowerCase().indexOf(val) !== -1 || !val;
              });
            break;
          case 'product_publisher_identifier':          
            temp = temp.filter(function (d) {
              return d.product_publisher_identifier.toLowerCase().indexOf(val) !== -1 || !val;
            });
            break;
          case 'artists':          
            temp = temp.filter(function (d) {
              return d.artists.toLowerCase().indexOf(val) !== -1 || !val;
            });
            break;
          case 'writers':          
            temp = temp.filter(function (d) {
              return d.writers.toLowerCase().indexOf(val) !== -1 || !val;
            });
            break;  
          default:
            temp = temp.filter(function (d) {
              return d.name.toLowerCase().indexOf(val) !== -1 || !val;
            });
            break;
        } 
      }
      });
      
    }

    if(filter_values.categories != null && filter_values.categories.length > 0){      
      const val = filter_values.categories[0].name;
      // filter our data      
      temp = temp.filter(function (d) {       
        if(d.categories != null){          
          return d.categories.indexOf(val) != -1 || !val;
        }        
      });
    }

    if(filter_values.publishers != null && filter_values.publishers.length > 0){
      temp = temp.filter(function (d) {
        return d.supplier_id == filter_values.publishers[0].id;
      });
    }

    if(filter_values.content_ratings != null && filter_values.content_ratings.length > 0){      
      temp = temp.filter(function (d) {
        return d.library_content_rating_id == filter_values.content_ratings[0].id;
      });
    }

    if(filter_values.productTypes != null && filter_values.productTypes.length > 0){
      temp = temp.filter(function (d) {
        return d.product_type_id == filter_values.productTypes[0].id;
      });
    }

    if(this.is_admin && filter_values.assignedUser != null && filter_values.assignedUser.length > 0){
      temp = temp.filter(function (d) {
        return d.workflow_user_id == filter_values.assignedUser[0].id;
      });
    }

    if(filter_values.languages != null && filter_values.languages.length > 0){
      temp = temp.filter(function (d) {
        return d.language_id == filter_values.languages[0].id;
      });
    }

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    // this.table.offset = 0;
  }

  openProfileForm(event) {        
    (<any>$('#profileAccordion')).collapse('show');    
  }

  closeProfileForm(event) {
    this.profileForm.reset();        
    (<any>$('#profileAccordion')).collapse('hide');      
  }

  toggleFilters(event, type) {
    const selff = this;
    let class1, class2;
    let isExpanded = (<any>$('#filterAccordion')).hasClass("show");

    (<any>$('.btn-filter-by')).removeClass('btn-filter-active');
    
    if(this.search_type == type && isExpanded) {
      (<any>$('#filterAccordion')).collapse('hide');
    }
    else {
      (<any>$('#filterAccordion')).collapse('show');
      (<any>$(event.target)).addClass('btn-filter-active');
    }

    if(type == 2){
      this.dropdownSettings= {      
        singleSelection: false,
        closeDropDownOnSelection: true,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'Unselect All',      
        allowSearchFilter: true
      };

      class1 = '.search-type-2';
      class2 = '.search-type-1';
    }
    else{
      this.dropdownSettings= {      
        singleSelection: true,
        closeDropDownOnSelection: true,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'Unselect All',      
        allowSearchFilter: true
      };

      class1 = '.search-type-1';
      class2 = '.search-type-2';
    }

    this.search_type = type;
    
    if(isExpanded) {
      this.search_type_fade = true;
    }
    
    (<any>$(class1)).slideDown();
    (<any>$(class2)).slideUp(function() {
     selff.search_type_fade = false;
    });
  }

  editProfile(event, profile, index) {            
    let dashboard_columns = JSON.parse(profile.dashboard_columns);        
    if(typeof dashboard_columns == 'string'){
      dashboard_columns = JSON.parse(dashboard_columns);  
    }

    this.profile_columns = dashboard_columns;
    this.profileForm.get('profile_name').setValue(profile.name);
    this.profileForm.get('profile_id').setValue(profile.id);     
    this.dirty_profile_index = index;       
    this.openProfileForm(event);
  }

  deleteProfile(id, name, index) {
    if(id == this.selectedProfile){
      alert('Cannot delete Active Profile.');
      return false;
    }
    this.profile_delete.id = id;
    this.profile_delete.name = name;
    this.dirty_profile_index = index;
    this.modalDelete.open();
  }

  // chosenYearHandler( normalizedYear: Moment ) {
  //     const ctrlValue = this.search_date.value;
  //     ctrlValue.year(normalizedYear.year());
  //     this.search_date.setValue(ctrlValue);
  // }

  // chosenMonthHandler( normalizedMonth: Moment, datepicker: OwlDateTimeComponent<Moment> ) {
  //     const ctrlValue = this.search_date.value;
  //     ctrlValue.month(normalizedMonth.month());
  //     this.search_date.setValue(ctrlValue);
  //     datepicker.close();      
  // }

  getProductsList(filter_values, user_id = 0, limit) {    
      return new Promise(resolve => {
        this.productService.getproductDashboard(filter_values, user_id, limit)
          .subscribe(res => {                
            resolve(res);
              this.loadingIndicator = false;     
          });
      });      
  } 

  getLanguagesList(){
    return new Promise(resolve => {
      this.misc.getLanguagesList(1)
        .subscribe(res => {                 
          resolve(res);
        });
    });  
  }

  getWorkflowList(){
    return new Promise(resolve => {
      this.misc.getWorkflowList()
        .subscribe(res => {                 
          resolve(res);
        });
    });  
  }

  

  getPriorities(){
    return new Promise(resolve => {
      this.misc.getPriorities()
        .subscribe(res => {                 
          resolve(res);
        });
    });  
  }

  getPublisherList(){
    return new Promise(resolve => {
      this.misc.getSuppliers(1, 1)    
        .subscribe(res => {                 
          resolve(res);
        });
    }); 
  }  

  getLibrayPriceTier(){
    return new Promise(resolve => {
      this.misc.getPriceTiers(1)    
        .subscribe(res => {                 
          resolve(res);
        });
    }); 
  } 

  getReleaseCategories(){
    return new Promise(resolve => {
      this.misc.getReleaseCategories()    
        .subscribe(res => {                 
          resolve(res);
        });
    }); 
  } 

  getContentRatings() {  
    return new Promise(resolve => {
      this.misc.getContentRatings(1)
        .subscribe(res => {                 
          resolve(res);
        });
    });  
  }

  getProductTypes() { 
    return new Promise(resolve => {
      this.misc.getProductTypes(1)
        .subscribe(res => {                 
          resolve(res);
        });
    });   
  }

  getProductionUsers(){
    return new Promise(resolve => {
      this.misc.getProductionUsers()
        .subscribe(res => {                 
          resolve(res);
        });
    });       
  }

  getCategories(){
    return new Promise(resolve => {
      this.misc.getCategories()
        .subscribe(res => {                    
          resolve(res);
        });
    });  
  }

  getProductLines(){
    return new Promise(resolve => {
      this.misc.getProductLines()
        .subscribe(res => {                
          resolve(res);
        });
    });  
  }

  getLocales(){
    return new Promise(resolve => {
      this.misc.getLocales()
        .subscribe(res => {                                
          resolve(res);
        });
    });  
  }

  getDashboardProfiles(){  
    return new Promise(resolve => {
      this.misc.getUserDashboardProfiles(this.currentUser.id)
        .subscribe(res => {                 
          resolve(res);
        });
    });  
  }

  getCellClass({ row, column, value }): any {
    if(row.updated === 1 && row.updated_cells.includes(column.prop ) ){
      return 'updated';
    }
  }

  getDefaultClass(){
    return 'non-editable';
  }

  batchsaveProduct(){
    if(this.updates.length == 0){
      return false;
    }


    console.log(this.updates);
    this.productService.batchupdateProducts(this.updates)
    .subscribe(res => {    
      this.updates.forEach(item => {
        this.rows[item.rowIndex]['updated'] = 0;
        this.rows[item.rowIndex]['updated_cells'] = '';
      });    
      
      this.updates = [];
      this.toastr.success('Successfully Updated Products', 'Notification');
    });    
  }

  toggle(col) {
    const isChecked = this.isChecked(col);
   
    if (isChecked) {      
      this.selectedColumns = this.selectedColumns.filter(name => {
        return name !== col.name;
      });            
    } else {
      this.selectedColumns = [...this.selectedColumns, col.name];   
    }  

    this.setSelectedColumns();
  }

  isChecked(col) {
    if(typeof this.selectedColumns == 'undefined'){
      return false;
    }
    
    return (
      this.selectedColumns.find(name => {
        return name === col.name;
      }) !== undefined
    );
  }

  getSelectOptions(type){
    switch(type){
      case 'production_users':
        return this.assigned_to_filter;              
      case 'product_types':
        return this.product_type_filter;              
      case 'content_ratings':
        return this.library_content_filter;            
      case 'suppliers':
        return this.publishers_filter;              
      case 'language_list':
        return this.language_filters;            
      case 'priorities':
        return this.priorities_filter;                     
      case 'price_tiers':
        return this.price_tier_filters;     
      case 'release_categories':   
        return this.release_categories_filters;       
    }    
  }

  getSelectValue(type, value){
    if(type == 'boolean'){
      return value == 1 ? 'yes' : 'no';
    }
    if(value == null || value == 0 || value.length < 1){
      return this.default_text;
    }
    switch(type){
      case 'locales_restriction_mode':           
        if(typeof value != 'string'){
          let mode = 'Allow All';
          if(value == 1){
            mode = 'Allowed Locales';
          }
          if(value == 2){
            mode = 'Denied Locales';
          }
          return mode; 
        }
        return value;
      case 'production_users':              
        return typeof this.production_users[value] == 'undefined' ? this.default_text : this.production_users[value]; 
      case 'product_types':
        return typeof this.product_types[value] == 'undefined' ? this.default_text : this.product_types[value];      
      case 'content_ratings':
        return typeof this.content_ratings[value] == 'undefined' ? this.default_text : this.content_ratings[value];      
      case 'suppliers':
        return typeof this.suppliers[value] == 'undefined' ? this.default_text : this.suppliers[value];      
      case 'language_list':
        return typeof this.language_list[value] == 'undefined' ? this.default_text : this.language_list[value];
      case 'priorities':
        return typeof this.priorities[value] == 'undefined' ? this.default_text : this.priorities[value];
      case 'price_tiers':
        return typeof this.price_tiers[value] == 'undefined' ? this.default_text : this.price_tiers[value];   
      case 'release_categories':   
        return typeof this.release_categories[value] == 'undefined' ? this.default_text : this.release_categories[value];
      case 'date':
         let date_val = new Date(value);         
        return moment(date_val).format('MM/DD/YYYY HH:mm'); ;
      default:
        if(value.length > 60){
          return value.slice(0, 60) + ' ...';
        }
        return value;
    }   
  }

  tableDropdownClose(rowIndex, prop){    
    let value = [];
    let selected_values_name = [];
    this.editing[rowIndex + '-' + prop] = 0;   

    switch(prop){
      case 'categories':        
        value = this.productCategories[rowIndex];
        selected_values_name = value;
        break;
      case 'product_lines':
        value = this.productLines[rowIndex];
        selected_values_name = value;
        break;
      case 'locales_restriction_mode':        
        let productsLocales = this.productsLocaleForm.value;                                
        value = productsLocales;
        selected_values_name = productsLocales.selected_locales;
        this.localesProducts[rowIndex] = productsLocales;

        this.rows[rowIndex]['updated'] = 1;
        this.rows[rowIndex]['updated_cells'] = this.rows[rowIndex]['updated_cells'] + ',' + prop;    
      break;  
    }    
    
    if(typeof selected_values_name != 'undefined'){      
      selected_values_name = selected_values_name.map(function(val){
        return val.name;
      });    
      // this.productCategories[rowIndex] = [];
      this.rows[rowIndex][prop] = selected_values_name.join(" , ");
    }
    else{
      this.rows[rowIndex][prop] = this.default_text;
    }
             
    this.is_dirty = true;
    this.updates.push({
      'product_id' : this.rows[rowIndex]['product_id'],
      'field' : prop,
      'value' : value,
      'rowIndex': rowIndex
    });    

    // console.log(this.updates);
  }

  multiselectUpdated(items: any, rowIndex, prop){    
    this.rows[rowIndex]['updated'] = 1;
    this.rows[rowIndex]['updated_cells'] = this.rows[rowIndex]['updated_cells'] + ',' + prop;    
  }

  dateTimeFormat(val){
    val = new Date(val);
    return moment(val).format('YYYY-MM-DDTHH:mm'); 
  }

  saveProfile(){
    let profile_values = this.profileForm.value;           

    if(profile_values.profile_id == null){
      this.saveDashboardProfile(profile_values.profile_name, profile_values.profile_fields);      
      this.dashboardProfiles.push(
        { name : profile_values.profile_name, dashboard_columns : JSON.stringify(profile_values.profile_fields), is_current : 0}
      );
    }
    else{
      this.updateDashboardProfile(profile_values.profile_id, profile_values.profile_name, profile_values.profile_fields);
      
      if(profile_values.profile_id == this.selectedProfile){
        this.selectedColumns = profile_values.profile_fields;          
        this.setSelectedColumns();
      }     
      else{                
        this.dashboardProfiles[this.dirty_profile_index].name = profile_values.profile_name;
        this.dashboardProfiles[this.dirty_profile_index].dashboard_columns = JSON.stringify(profile_values.profile_fields);
        this.dirty_profile_index = null;
      } 
    }      
  }

  updateDashboardProfile(profile_id, profile_name, profile_fields, is_current = null){
    this.misc.updateDashboardProfile(profile_id, 
      {'profile_fields' : profile_fields, 'profile_name' : profile_name, 'is_current' : is_current}
    )
      .subscribe( data => {      
        this.toastr.success('Successfully Updated Profile', 'Notification');           
        this.closeProfileForm(null);
        this.profileForm.reset();                           
    });
  }

  saveDashboardProfile(profile_name, profile_fields, reload = 0){
    this.misc.createDashboardProfile(this.currentUser.id, 
      {'profile_fields' : profile_fields, 'profile_name' : profile_name}
    )
      .subscribe( data => {            
        this.toastr.success('Successfully Created Profile', 'Notification');        
        if(reload == 1){
          location.reload();
        }
        this.closeProfileForm(null);
        this.profileForm.reset();                
    });
  }

  changeDashboardProfile(index, saveAsCurrent = false){          
    this.selectedProfile = this.dashboardProfiles[index].id;
    this.selectedColumns = JSON.parse(this.dashboardProfiles[index].dashboard_columns);    
    this.profile_active = {
      id: this.dashboardProfiles[index].id,
      name: this.dashboardProfiles[index].name
    };
    
    if(saveAsCurrent){
      this.updateDashboardProfile(this.selectedProfile, null, null, 1); 
    }
    
    this.setSelectedColumns();
  }

  setSelectedColumns(){    
    let temp_column_arr = [];
    this.allColumns.forEach(item => {    
      if(this.selectedColumns.includes(item.name)){
        temp_column_arr.push(item);
      }
    });

    this.columns = temp_column_arr;
  }

  updateProfileText(event) {
    this.profile_update.value = event;
  }

  initRowUpdate(rowIndex, prop, name, value){    
    
    if(prop == 'categories' && this.rows[rowIndex]['categories'] != null && typeof this.productCategories[rowIndex] == 'undefined'){                  
      this.productService.getProductCategories(this.rows[rowIndex]['product_id']).subscribe(res => {
        let categories = res.items;
        this.productCategories[rowIndex] = Object.keys(categories).map(key => ({id: categories[key]['category_id'], name: categories[key]['name']}));        
        
        this.editing[rowIndex + '-' + prop] = true;
      });      
    }
    if(prop == 'product_lines' && this.rows[rowIndex]['product_lines'] != null && typeof this.productLines[rowIndex] == 'undefined'){                  
      this.productService.getProductGroups(this.rows[rowIndex]['product_id']).subscribe(res => {
        let productgroups = res.items;
        this.productLines[rowIndex] = Object.keys(productgroups).map(key => ({id: productgroups[key]['group_id'], name: productgroups[key]['name']}));                    
        this.editing[rowIndex + '-' + prop] = true;
      });      
    }
    else if(prop == 'locales_restriction_mode'){   

      this.productsLocaleForm.get('selected_locales').setValue([]); 
      this.productsLocaleForm.get('mode').setValue(0);   

    
      if(typeof this.localesProducts[rowIndex] == 'undefined'){
          this.productService.getProductLocales(this.rows[rowIndex]['product_id']).subscribe(res => {                
            this.localesProducts[rowIndex] = res;
            let productLocales = Object.keys(res.items).map(key => ({id: res.items[key]['locale_id'], name: res.items[key]['name']}));        
            this.productsLocaleForm.get('selected_locales').setValue(productLocales);    
            this.productsLocaleForm.get('mode').setValue((res.mode).toString() );    
            this.localesModal.open(); 
            document.getElementById("force-event").click();                     
        });   
      }   
      else{        
          let res = this.localesProducts[rowIndex];                    
          //let productLocales = Object.keys(res.items).map(key => ({id: res.items[key]['locale_id'], name: res.items[key]['name']}));        
          this.productsLocaleForm.get('selected_locales').setValue(res.selected_locales);    
          this.productsLocaleForm.get('mode').setValue((res.mode).toString() );    
          this.localesModal.open();    
          document.getElementById("force-event").click();    
      }         


      this.modalLocalesConfig.onDismiss = () => {        
        this.tableDropdownClose(rowIndex, prop);
        return true;
      }      
    }
    else if(prop == 'description') {

      this.profile_update.id = rowIndex;
      this.profile_update.value = value;

      this.modalUpdateConfig.modalTitle = name;
      this.modalUpdateConfig.onDismiss = () => {
        this.updateValue(null, prop, rowIndex, this.profile_update.value);
        return true;
      }

      this.modalUpdate.open();
    }
    else{
      this.editing[rowIndex + '-' + prop] = true
    }        
  }

  filterLimit(limit) {    
    this.limit_active = limit;
  }

  filterColumn(column, index){
    this.search_input[index].type = column;

    this.searchOnColumn = column;    
    let query_text = $('.search-input').val();    
  }

  filterInput(value = '', index = 0, source) {
    this.search_input[index].value = value;    
  }

  filterCustomRange(index = 0, dateType = 'date_from') {
    if(dateType == 'date_from') {
      this.search_input[index]['date_from'] = this.search_date_from[index].value;
    }
    else {
      this.search_input[index]['date_to'] = this.search_date_to[index].value;
    }
  }

  changeThumbnailActive(img) {
    this.page_thumbnail_active = img;
    this.page_thumbnail_loaded = false;
  }

  buildProduct(rowIndex){
    this.modalBuildConfig.onDismiss = () => {

      let product_id = this.rows[rowIndex]['product_id']
      this.productService.addProductToBundleQueue(product_id).subscribe(res => {
        this.toastr.success('Product Build Successful', 'Notification');           
      });

      return true;
    }

    this.modalBuild.open();
  }

  openProductPages(rowIndex){
    let product_id = this.rows[rowIndex]['product_id'];
    
    this.productService.getProductActivePages(product_id)
    .subscribe(res => {                    
      this.page_thumbnail = res;
      this.page_thumbnail_loaded = false;

      if(res.length > 0) {
        this.page_thumbnail_active = res[0]['image_url'];
      }
      else {
        this.page_thumbnail_active = '';
      }
    });    
  }

  pageThumbnailLoad() {
    this.page_thumbnail_loaded = true;
  }
}
