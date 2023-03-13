import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LibraryService } from "../../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-auth-secret-code',
  templateUrl: './auth-secret-code.component.html',
  styleUrls: ['./auth-secret-code.component.css']
})
export class AuthSecretCodeComponent implements OnInit {

  @Input() library_auth_methods;
  @Input() library_id;
  @Input() auth_id;
  @Input() authSecretCode;

  loading = false;
  updateLibraryAuthMethodForm: FormGroup;
  submitted = false;
  auth_is_active = false;
  form_loaded = false;
  auth_default_labels: object = {'username' : 'Username or Institution ID', 'password' : 'Password or PIN'};
  // default_paassword: string = 'D3ffau1tPWd';

  constructor(
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.auth_is_active = typeof this.library_auth_methods[this.auth_id] != 'undefined';
    this.initLibraryAuthMethodForm();
    this.setLibraryAuthData();

    this.updateLibraryAuthMethodForm.get('active').valueChanges.subscribe(val => {
      this.auth_is_active = val;
      if (val) {
        this.updateLibraryAuthMethodForm.get('auth_secret_code').enable();
      }
      else {
        this.updateLibraryAuthMethodForm.get('auth_secret_code').disable();
      }
    });
  }

  initLibraryAuthMethodForm() {
    this.updateLibraryAuthMethodForm = this.formBuilder.group({
      active: [0],
      auth_secret_code: ['', Validators.required],
      authSettings: this.formBuilder.group({
        allow_signup_page: [0],
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

  setLibraryForm(auth_data) {

    let username = null != auth_data.single_user_account['name'] ? auth_data.single_user_account['name'] : '';
    let user_id = null != auth_data.single_user_account['id'] ? auth_data.single_user_account['id'] : '';

    this.updateLibraryAuthMethodForm.setValue({
      active: Number(auth_data['auth_is_active']),
      auth_secret_code: this.authSecretCode,
      authSettings : {
        allow_signup_page: Number(auth_data.allow_signup_page),
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
      //auth_secret_code: typeof lib['shared_secret'] != 'undefined' ? lib['shared_secret'] : ''
    });
    this.form_loaded = true;
  }


  async setLibraryAuthData() {
    let lib_auth_data = await this.getAuthMethodData();
    // console.log(lib_auth_data);
    this.setLibraryForm(lib_auth_data);        
  }  

  getAuthMethodData() {
    return new Promise(resolve => {
      this.libraryService.getLibAuthData(this.library_id, this.auth_id)
        .subscribe(res => {
          resolve(res);
        });
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

    //this.loading = true;
    var form_data = this.updateLibraryAuthMethodForm.value;

    if(form_data.singleUserAuth.user_id == ''){
       if(form_data.singleUserAuth.username == ''){
          form_data.singleUserAuth = {};
       }
    }
      
    this.libraryService.updateLibrary(this.library_id, { 'auth_secret_code': form_data.auth_secret_code }).subscribe();

    this.libraryService.updateLibraryAuthMethod(this.library_id, this.auth_id, form_data)
      .subscribe(
        data => {
          this.loading = false;
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
        },
        err => {
          this.loading = false;
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
        });

  }

}
