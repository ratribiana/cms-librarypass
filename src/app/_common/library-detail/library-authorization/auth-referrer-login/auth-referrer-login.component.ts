import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { LibraryService } from "../../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';;
import { map, tap } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'app-auth-referrer-login',
  templateUrl: './auth-referrer-login.component.html',
  styleUrls: ['./auth-referrer-login.component.css']
})
export class AuthReferrerLoginComponent implements OnInit {

  @Input() library_auth_methods;
  @Input() library_id;
  @Input() auth_id;

  loading = false;
  updateLibraryAuthMethodForm: FormGroup;
  submitted = false;
  auth_is_active = false;
  form_loaded = false;
  table_loaded = true;
  referrer_urls;
  total: number;
  page: number = 1;
  limit: number = 5;
  filter: string = '';
  auth_default_labels: object = {'username' : 'Username or Library ID', 'password' : 'Password or PIN'};
  // default_paassword: string = 'D3ffau1tPWd';

  constructor(
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.initLibraryAuthMethodForm();
    this.getReferrerUrlList(this.page, this.filter);

    this.setLibraryAuthData();
    this.auth_is_active = typeof this.library_auth_methods[this.auth_id] != 'undefined';
    this.updateLibraryAuthMethodForm.get('active').valueChanges.subscribe(val => {
      this.auth_is_active = val;
    });
  }

  initLibraryAuthMethodForm() {
    this.updateLibraryAuthMethodForm = this.formBuilder.group({
      active: [0],      
      referrer_url: [''],
      authSettings: this.formBuilder.group({
        no_login_required: [0],
        username_placeholder: [''],
        password_placeholder: [''],
      }),
      singleUserAuth: this.formBuilder.group({
        username: [''],
        password: [''],
        user_id: [''],
      }),
   
    });         
  }

  setLibraryAuthMethodForm(auth_data) {
    
    let username = null != auth_data.single_user_account['name'] ? auth_data.single_user_account['name'] : '';
    let user_id = null != auth_data.single_user_account['id'] ? auth_data.single_user_account['id'] : '';
    
    this.updateLibraryAuthMethodForm.setValue({
      active: Number(auth_data['auth_is_active']),
      referrer_url: '',
      authSettings : {
        no_login_required: Number(auth_data.no_login_required),        
        username_placeholder: (typeof auth_data['username_placeholder'] != 'undefined' && auth_data['username_placeholder'] != '') 
          ? auth_data['username_placeholder'] : this.auth_default_labels['username'],
        password_placeholder: (typeof auth_data['password_placeholder'] != 'undefined' && auth_data['password_placeholder'] != '') 
          ? auth_data['password_placeholder'] : this.auth_default_labels['password'],
      },
      singleUserAuth: {      
        username: username,
        user_id: user_id,
        password: ''
      },      
    });
  
    this.form_loaded = true;
  }

  async setLibraryAuthData() {
    let lib_auth_data = await this.getAuthMethodData();
    this.setLibraryAuthMethodForm(lib_auth_data);        
  }  

  get f() { return this.updateLibraryAuthMethodForm.controls; }

  updateLibraryAuthMethod(e) {

    this.submitted = true;
    e.preventDefault();
    // stop here if form is invalid

    if (this.updateLibraryAuthMethodForm.invalid) {
      return;
    }
 
    var form_data = this.updateLibraryAuthMethodForm.value;    

    if(form_data.authSettings.no_login_required == true && form_data.singleUserAuth.username.length == 0){
      this.f.singleUserAuth['controls']['username']['errors'] = true;
      return;
    }    
    
    if(form_data.singleUserAuth.user_id == ''){
      if(form_data.singleUserAuth.username == ''){
         form_data.singleUserAuth = {};
      }
     //  else{
     //     form_data.singleUserAuth.password = this.default_paassword;
     //  }
   }

    this.loading = true;

    this.libraryService.updateLibraryAuthMethod(this.library_id, this.auth_id, form_data)
      .subscribe(
        data => {
          this.loading = false;
          this.updateLibraryAuthMethodForm.get('referrer_url').reset();
          this.getReferrerUrlList(this.page, this.filter);
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
        },
        err => {          
          this.loading = false;
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
        });

  }

  getAuthMethodData() {
    return new Promise(resolve => {
      this.libraryService.getLibAuthData(this.library_id, this.auth_id)
        .subscribe(res => {
          resolve(res);
        });
    });
  }


  getReferrerUrlList(page: number, filter: string = '') {  
    this.referrer_urls = this.libraryService.getLibraryAuthReferrer(this.library_id, page, filter, this.limit)
      .pipe(tap(res => {
        this.total = res.total;
        this.page = page;        
      }), map(res => res.items));
  }


  deleteAuthReferrer(e, referrer_url_id: number, referrer_url: string) {
    let row = e.target.parentNode.parentNode;

    let r = confirm(`Delete ${referrer_url}?`);

    if (r == true) {
      this.libraryService.deleteLibraryAuthReferrer(this.library_id, referrer_url_id)
        .subscribe(
          data => {
            this._flashMessagesService.show('Successfully Deleted URL.', { cssClass: 'alert-success', timeout: 5000 });
            row.remove();
            this.getReferrerUrlList(this.page, this.filter);            
          },
          (error: HttpErrorResponse) => {
            console.log(error.message);
          });
    }
  }

}
