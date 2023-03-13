import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LibraryService } from "../../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';;
import { map, tap } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'app-auth-google-oauth',
  templateUrl: './auth-google-oauth.component.html',
  styleUrls: ['./auth-google-oauth.component.css']
})

export class AuthGoogleOauthComponent implements OnInit {

  @Input() library_auth_methods;
  @Input() library_id;
  @Input() auth_id;

  loading = false;
  updateLibraryAuthMethodForm: FormGroup;
  submitted = false;
  auth_is_active = false;
  form_loaded = false;
  domains;
  total: number;
  page: number = 1;
  limit: number = 5;
  filter: string = '';
  auth_default_labels: object = {'username' : 'Username or Institution ID', 'password' : 'Password or PIN'};

  constructor(
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.initLibraryAuthMethodForm();
    this.getDomainsList(this.page, this.filter);
    this.getAuthMethodData();

    this.auth_is_active = typeof this.library_auth_methods[this.auth_id] != 'undefined';
    this.updateLibraryAuthMethodForm.get('active').valueChanges.subscribe(val => {
      this.auth_is_active = val;
    });
  }

  initLibraryAuthMethodForm() {
    this.updateLibraryAuthMethodForm = this.formBuilder.group({
      active: [typeof this.library_auth_methods[this.auth_id] != 'undefined'],
      domain: [''],
      authSettings: this.formBuilder.group({
        username_placeholder: [''],
        password_placeholder: [''],
      }),      
    });    
  }

  setLibraryForm(lib) {    
    this.updateLibraryAuthMethodForm.setValue({
      active: Number(lib['auth_is_active']),
      domain: '',
      authSettings : {                
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
          this.loading = false;
          this.updateLibraryAuthMethodForm.get('domain').reset();
          this.getDomainsList(this.page, this.filter);
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
        },
        err => {
          this.loading = false;
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
        });

  }


  getDomainsList(page: number, filter: string = '') {
    this.domains = this.libraryService.getLibraryAuthDomain(this.library_id, page, filter, this.limit)
      .pipe(tap(res => {
        this.total = res.total;
        this.page = page;
      }), map(res => res.items));
  }


  deleteAuthDomain(e, auth_domain_id: number, auth_domain_name: string) {
    let row = e.target.parentNode.parentNode;

    let r = confirm(`Delete ${auth_domain_name}?`);

    if (r == true) {
      this.libraryService.deleteLibraryAuthDomain(this.library_id, auth_domain_id)
        .subscribe(
          data => {
            this._flashMessagesService.show('Successfully Deleted Domain.', { cssClass: 'alert-success', timeout: 5000 });
            row.remove();
            this.getDomainsList(this.page, this.filter);            
          },
          (error: HttpErrorResponse) => {
            console.log(error.message);
          });
    }
  }

}
