import { Component, Input, OnInit } from '@angular/core';
import { LibraryService } from "../../../_services/library.service"
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-service-circulation',
  templateUrl: './service-circulation.component.html',
  styleUrls: ['./service-circulation.component.css']
})
export class ServiceCirculationComponent implements OnInit {

  @Input() library_id;
  @Input() service_id;
  @Input() LibData;


  library_content_ratings = [];
  library_selected_content_rating = {};

  library_selected_price_tiers = {};  
  library_price_tiers= [];

  site_styles = {};

  submitted = false;
  loaded: boolean = false;
  updateLibraryForm: UntypedFormGroup;

  myForm:UntypedFormGroup;
  disabled = false;
  ShowFilter = false;
  dropdownSettings = {};

  constructor(
    private libraryService: LibraryService,
    private formBuilder: UntypedFormBuilder    
  ) { }

  ngOnInit() {
    this.getPriceTiers();
    this.getContentRatings();             
    
    this.dropdownSettings= {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'Unselect All',      
        allowSearchFilter: this.ShowFilter
    };    
    
    this.initLibraryForm();

    if(this.service_id){
      this.loadServiceData(this.service_id);
    }    
  }

  getPriceTiers() {    
    this.libraryService.getPriceTiers()
      .subscribe(res => {        
        this.library_price_tiers = res;
      });    
  }

  getContentRatings() {  
    this.libraryService.getContentRatings()
      .subscribe(res => {
        this.library_content_ratings = res;
    });  
  }

  getSelectedPriceTiers(service_id) {
    return new Promise(resolve => {
      this.libraryService.getLibraryServicePriceTiers(this.library_id, service_id)
        .subscribe(res => {
          resolve(res);
        });
    });
  }

  getSelectedContentRatings(service_id) {
    return new Promise(resolve => {
      this.libraryService.getLibraryServiceContentRatings(this.library_id, service_id)
        .subscribe(res => {
          resolve(res);
        });
    });
  }

  initLibraryForm() {    
    this.updateLibraryForm = this.formBuilder.group({
      max_weekly_books_per_user: ['', Validators.required],
      site_template: ['', Validators.required],
      price_tiers: [[]],
      content_ratings: [[]],
      show_read_progress: [0]
    });
  }

  setLibraryForm(data) {
    let max_weekly_books_per_user = data.max_weekly_books_per_user ? data.max_weekly_books_per_user : '';
    let site_template = data.site_style_id ? data.site_style_id : '1';
    let site_styles = Array.isArray(this.site_styles) ? this.site_styles : [];

    // set to dark theme if library site style id not found
    if(site_styles.map((el) => el.id).indexOf(site_template) === -1) {
      site_template = '1';
    }

    this.updateLibraryForm.setValue({
      max_weekly_books_per_user: max_weekly_books_per_user,
      site_template: site_template,
      price_tiers: this.library_selected_price_tiers,
      content_ratings: this.library_selected_content_rating,
      show_read_progress: this.LibData ? Number(this.LibData.show_read_progress) : 0
    });

    this.loaded = true;
  }

  // convenience getter for easy access to form fields
  get f() { return this.updateLibraryForm.controls; }

  async loadServiceData(service_id) {    
    this.loaded = false;
    let lib_data = await this.getlibraryServiceData(service_id);    
    this.library_selected_price_tiers = await this.getSelectedPriceTiers(service_id);
    this.library_selected_content_rating = await this.getSelectedContentRatings(service_id);
    this.site_styles = await this.getSiteStyles();
    
    this.setLibraryForm(lib_data);
  }


  getSiteStyles(){
    return new Promise(resolve => {
      this.libraryService.getSiteStyles()
        .subscribe(res => {
          resolve(res);
        });
    });      
  }

  getlibraryServiceData(service_id) {
    return new Promise(resolve => {
      this.libraryService.getLibraryServiceData(this.library_id, service_id)
        .subscribe(res => {
          resolve(res);
        });
    });    
  }


  updateLibPriceTiers() {
    let updated_selected_price_tiers = this.updateLibraryForm.controls['price_tiers'].value;
    return new Promise(resolve => {
      this.libraryService.updateLibraryServicePriceTiers(this.library_id, this.service_id, updated_selected_price_tiers)
        .subscribe(
          data => {
            resolve(true);
          },
          err => {
            resolve(false);
          });
    });
  }

  updateLibContentRatings() {
    let updated_selected_content_rating = this.updateLibraryForm.controls['content_ratings'].value;
    return new Promise(resolve => {
      this.libraryService.updateLibraryServiceContentRatings(this.library_id, this.service_id, updated_selected_content_rating)
        .subscribe(
          data => {
            resolve(true);
          },
          err => {
            resolve(false);
          });
    });
  }

  updateLibData(){
    let max_weekly_books_per_user = this.updateLibraryForm.controls['max_weekly_books_per_user'].value;
    let site_template = this.updateLibraryForm.controls['site_template'].value;
    let read_progress = Number(this.updateLibraryForm.controls['show_read_progress'].value);

    return new Promise(resolve => {
      this.libraryService.updateLibrary(this.library_id,
        { 'max_weekly_books_per_user': max_weekly_books_per_user, 'site_style_id': site_template, 'show_read_progress' : read_progress  }
      )    
      .subscribe(
        data => {                           
          resolve(true);
        },
        err =>  {          
          resolve(false);
        });          
    });
  }

  // updateServiceData() {
  //   let site_template = this.updateLibraryForm.controls['site_template'].value;

  //   return new Promise(resolve => {
  //     this.libraryService.updateLibraryServiceData(this.library_id, this.service_id, { 'site_template': site_template })
  //       .subscribe(
  //         data => {
  //           resolve(true);
  //         },
  //         err => {
  //           resolve(false);
  //         });
  //   });
  // }

  async savedata() {    
    let updated_service_data = await this.updateLibData();
    // let updated_services_data = await this.updateServiceData();
    let updated_price_tiers = await this.updateLibPriceTiers();
    let updated_content_ratings = await this.updateLibContentRatings();
  }

}
