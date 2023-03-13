import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LibraryService } from "../../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';;
import { map, tap } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";
import { ValidateRange } from "../../../_validators/range.validator";


@Component({
  selector: 'app-auth-ip-auth',
  templateUrl: './auth-ip-auth.component.html',
  styleUrls: ['./auth-ip-auth.component.css']
})
export class AuthIpAuthComponent implements OnInit {

  @Input() library_auth_methods;
  @Input() library_id;
  @Input() auth_id;

  loading = false;
  updateLibraryAuthMethodForm: UntypedFormGroup;
  submitted = false;
  auth_is_active = false;
  form_loaded = false;
  table_loaded = true;
  ips;
  total: number;
  page: number = 1;
  limit: number = 5;
  filter: string = '';
  auth_default_labels: object = {'username' : 'Username or Library ID', 'password' : 'Password or PIN'};

  constructor(
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit() {
    this.initLibraryAuthMethodForm();
    this.getIPsList(this.page, this.filter);
    this.getAuthMethodData();

    this.auth_is_active = typeof this.library_auth_methods[this.auth_id] != 'undefined';
    this.updateLibraryAuthMethodForm.get('active').valueChanges.subscribe(val => {
      this.auth_is_active = val;

      // allow_signup_page defaults to true if auth method is enabled
      // when clicked, 'active' checkbox returns boolean, while server returns int
      if (typeof val == "boolean") 
      {
        this.updateLibraryAuthMethodForm.get('authSettings.allow_signup_page').setValue(val);
      }
    });
  }

  initLibraryAuthMethodForm() {
    this.updateLibraryAuthMethodForm = this.formBuilder.group({
      active: [typeof this.library_auth_methods[this.auth_id] != 'undefined'],
      ip: [''],
      from_ip_address: [''],
      authSettings: this.formBuilder.group({
        allow_signup_page: [1],
        username_placeholder: [''],
        password_placeholder: [''],
      }),
      to_ip_address: ['', [Validators.max(255), Validators.min(1)]]
    }, { validator: ValidateRange('from_ip_address', 'to_ip_address') });    
  }

  setLibraryForm(lib) {    
    this.updateLibraryAuthMethodForm.setValue({
      active: Number(lib['auth_is_active']),
      ip: '',
      from_ip_address: '',
      to_ip_address: '',
      authSettings : { 
        allow_signup_page: Number(lib.allow_signup_page),       
        username_placeholder: (typeof lib['username_placeholder'] != 'undefined' && lib['username_placeholder'] != '') 
          ? lib['username_placeholder'] : this.auth_default_labels['username'],
        password_placeholder: (typeof lib['password_placeholder'] != 'undefined' && lib['password_placeholder'] != '') 
          ? lib['password_placeholder'] : this.auth_default_labels['password'],
      }
    });
    this.form_loaded = true;
  }

  getAuthMethodData() {
    this.libraryService.getLibAuthData(this.library_id, this.auth_id)
      .subscribe(res => {        
        this.setLibraryForm(res);        
      });
  }

  get f() { return this.updateLibraryAuthMethodForm.controls; }

  updateLibraryAuthMethod(e) {

    this.submitted = true;
    e.preventDefault();
    // stop here if form is invalid

    if (this.updateLibraryAuthMethodForm.invalid) {
      return;
    }

    this.loading = true;
    var form_data = this.updateLibraryAuthMethodForm.value;

    this.libraryService.updateLibraryAuthMethod(this.library_id, this.auth_id, form_data)
      .subscribe(
        data => {          
          this.getIPsList(this.page, this.filter);
          
          this.updateLibraryAuthMethodForm.get('ip').reset();
          this.updateLibraryAuthMethodForm.get('from_ip_address').reset();
          this.updateLibraryAuthMethodForm.get('to_ip_address').reset();
          
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
          this.loading = false;
        },
        err => {          
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
          this.loading = false;
        });

  }


  getIPsList(page: number, filter: string = '') {
    this.table_loaded = false;
    this.ips = this.libraryService.getLibraryAuthIP(this.library_id, page, filter, this.limit)
      .pipe(tap(res => {
        this.total = res.total;
        this.page = page;
        this.table_loaded = true;  
      }), map(res => res.items));      
  }


  deleteAllAuthIP() {
  
    let r = confirm(`Delete All IP Entries?`);

    if (r == true) {
      this.libraryService.deleteLibraryAllAuthIP(this.library_id)
        .subscribe(
          data => {
            this._flashMessagesService.show('Successfully Deleted ALL IP Entries.', { cssClass: 'alert-success', timeout: 5000 });                        
            this.getIPsList(this.page, this.filter);            
          },
          (error: HttpErrorResponse) => {
            console.log(error.message);
          });
    }
  }

  filterbyIPAddress(e){
    this.filter = e.target.value;
    this.getIPsList(this.page, this.filter);            
  }

  deleteAuthIP(e, auth_ip_id: number, auth_ip_name: string) {
    let row = e.target.parentNode.parentNode;

    let r = confirm(`Delete ${auth_ip_name}?`);

    if (r == true) {
      this.libraryService.deleteLibraryAuthIP(this.library_id, auth_ip_id)
        .subscribe(
          data => {
            this._flashMessagesService.show('Successfully Deleted IP.', { cssClass: 'alert-success', timeout: 5000 });
            row.remove();
            this.getIPsList(this.page, this.filter);            
          },
          (error: HttpErrorResponse) => {
            console.log(error.message);
          });
    }
  }

}
