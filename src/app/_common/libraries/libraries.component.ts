import { Component, OnInit } from '@angular/core';
import {LibraryService} from "../_services/library.service"
import {map, tap} from "rxjs/operators";
import { FlashMessagesService } from 'angular2-flash-messages';
import {HttpErrorResponse} from "@angular/common/http";
import {AuthenticationService} from "../_services";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-libraries',
  templateUrl: './libraries.component.html',
  styleUrls: ['./libraries.component.css']
})
export class LibrariesComponent implements OnInit {

  apiUrl = environment.apiEndpoint;
  loading = false;
  dataLoaded = false;    
  libraries: object;
  all_libraries: object;
  total: number;
  page: number = 1;
  limit: number = 25;  
  filter: string = '';
  currentUser = this.authenticationService.currentUserValue;
  is_admin = (this.currentUser.short_codes.includes('is_admin'));

  constructor(
    private libraryService: LibraryService,    
    private _flashMessagesService: FlashMessagesService,
    private authenticationService: AuthenticationService,
    ) { }

  ngOnInit() {
    var self = this;
    this.loading = false;

    this.getLibraryList(this.page, this.filter);
    this.getAllLibraryList();    
  }
  
  getLibraryList(page: number, filter: string='') {

    this.libraries = this.libraryService.getLibraries(page, filter, this.limit)
        .pipe(tap (res => {
          this.total = res.total;
          this.page = page;
          this.dataLoaded = true;
        }), map( res => res.items ) );        
  }

  getAllLibraryList(){    
    this.libraryService.getAllLibraries()
      .subscribe(res => {
        this.all_libraries = res.items;
      });    
  }


  filterbyLibraryName(e){
    this.filter = e.target.value;    
    this.getLibraryList(this.page, this.filter);
  }


  updateLibraryStatus(e, lib_id: number) {  
    let is_checked = e.currentTarget.checked ? 1 : 0;

    this.libraryService.setLibraryStatus(lib_id, is_checked)      
    .subscribe(
        data => {                            
          this._flashMessagesService.show('Successfully Updated Library Status.', { cssClass: 'alert-success', timeout: 5000 });
        },
        (error: HttpErrorResponse) => {            
          console.log(error.message);              
        });
  }  

  deleteLibrary(e, lib_id: number, lib_name: string) {    
    let row = e.target.parentNode.parentNode;

    let r = confirm(`Delete ${lib_name}?`);
    if (r == true) {
      this.libraryService.deleteLibrary(lib_id, lib_name)      
      .subscribe(
          data => {                  
            this._flashMessagesService.show('Successfully Deleted Library.', { cssClass: 'alert-success', timeout: 5000 });            
            row.remove();
            this.getLibraryList(this.page, this.filter);            
          },
          (error: HttpErrorResponse) => {            
            console.log(error.message);              
          });
    }            
  }
  
}