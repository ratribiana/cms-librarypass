import { Component, OnInit, Input } from '@angular/core';
import {LibraryService} from "../../_services/library.service"
import {CdkDragDrop, CdkDragEnter, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { FlashMessagesService } from 'angular2-flash-messages';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-library-circulation',
  templateUrl: './library-circulation.component.html',
  styleUrls: ['./library-circulation.component.css']
})
export class LibraryCirculationComponent implements OnInit {
    
  @Input() library_id;
  @Input() max_checkouts_per_user;
  library_content_rating: any;
  library_selected_content_rating: any;
  updated_selected_content_rating: any;
  library_price_tiers: any;
  library_selected_price_tiers: any;
  updated_selected_price_tiers: any;
  submitted = false;  
  loading: boolean = false;
  updateLibraryForm: FormGroup;  

  //comics, rpg, manga and storybooks

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);      
    } else {    
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);                             
    }
  }

  updateLibPriceTiers(){
    return new Promise(resolve => {
      this.libraryService.updateLibraryPriceTiers(this.library_id, this.updated_selected_price_tiers)
      .subscribe(
        data => {                           
          resolve(true);
        },
        err =>  {          
          resolve(false);
        });          
    });
  }

  updateLibContentRatings(){
    return new Promise(resolve => {
      this.libraryService.updateLibrarytContentRatings(this.library_id, this.updated_selected_content_rating)
      .subscribe(
        data => {                           
          resolve(true);
        },
        err =>  {          
          resolve(false);
        });          
    });
  }

  updateLibData(form_data){
    return new Promise(resolve => {
      this.libraryService.updateLibrary(this.library_id, form_data)    
      .subscribe(
        data => {                           
          resolve(true);
        },
        err =>  {          
          resolve(false);
        });          
    });
  }

  updateLibrary(e) {
    this.submitted = true;
    e.preventDefault();

    // stop here if form is invalid
    if (this.updateLibraryForm.invalid) {
        return;
    }   

    let form_data = this.updateLibraryForm.value;
    this.savedata(form_data);  
    return;

  }

  async savedata(form_data){

    this.loading = true;

    let updated_lib_data = await this.updateLibData(form_data);
    let updated_price_tiers = await this.updateLibPriceTiers();
    let updated_content_ratings = await this.updateLibContentRatings();

    if(updated_lib_data && updated_price_tiers && updated_content_ratings){
      this.loading = false;            
      this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });                                  
    }
    else{
      this.loading = false;    
      this._flashMessagesService.show('There was an issue updating the Library. Please try again.', { cssClass: 'alert-danger', timeout: 5000 });                          
    }
  }

  updateContentRating(event: CdkDragEnter<string[]>){      
    this.updated_selected_content_rating = event.container.data;    
  }

  updatePriceTiers(event: CdkDragEnter<string[]>){      
    this.updated_selected_price_tiers = event.container.data;    
  }
  
  constructor(
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {  
    this.initLibraryForm();    
    this.setLibraryForm(this.max_checkouts_per_user);  
    this.getlibraryContentRatings();    
    this.getlibraryPriceTiers();    
  }

  // convenience getter for easy access to form fields
  get f() { return this.updateLibraryForm.controls; }

  initLibraryForm(){
    this.updateLibraryForm = this.formBuilder.group({
      max_weekly_books_per_user: ['', Validators.required]
    });
  }

  setLibraryForm(max_checkouts_per_user){    
    this.updateLibraryForm.setValue({
      max_weekly_books_per_user: max_checkouts_per_user
    });
  }

  getContentRatings() {
    return new Promise(resolve => {
      this.libraryService.getContentRatings()
      .subscribe(res => {                
        resolve(res);
      });          
    });
  }

  getPriceTiers() {
    return new Promise(resolve => {
      this.libraryService.getPriceTiers()
      .subscribe(res => {                
        resolve(res);
      });          
    });
  }

  getSelectedContentRatings() {
    return new Promise(resolve => {
      this.libraryService.getLibraryContentRatings(this.library_id)
      .subscribe(res => {
        resolve(res);        
      });        
    });
  }

  async getlibraryContentRatings(){  
    let lib_content_rating = await this.getContentRatings();
    let lib_selected_content_rating = await this.getSelectedContentRatings();
    this.library_content_rating = _.differenceWith(lib_content_rating, lib_selected_content_rating, _.isEqual);
    this.library_selected_content_rating = lib_selected_content_rating;
    this.updated_selected_content_rating = lib_selected_content_rating;   
  }

  getSelectedPriceTiers() {
    return new Promise(resolve => {
      this.libraryService.getLibraryPriceTiers(this.library_id)
      .subscribe(res => {
        resolve(res);        
      });        
    });
  }

  async getlibraryPriceTiers(){  
    let lib_price_tiers = await this.getPriceTiers();
    let lib_selected_price_tiers = await this.getSelectedPriceTiers();
    this.library_price_tiers = _.differenceWith(lib_price_tiers, lib_selected_price_tiers, _.isEqual);
    this.library_selected_price_tiers = lib_selected_price_tiers;
    this.updated_selected_price_tiers = lib_selected_price_tiers;   
  }

}
