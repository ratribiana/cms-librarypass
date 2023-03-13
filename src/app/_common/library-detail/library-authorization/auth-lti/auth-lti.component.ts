import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LibraryService } from "../../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-auth-lti',
  templateUrl: './auth-lti.component.html',
  styleUrls: ['./auth-lti.component.css']
})
export class AuthLtiComponent implements OnInit {

  @Input() library_auth_methods;
  @Input() auth_id;
  @Input() library_id;
  @Input() library_name;

  loading = false;
  updateLibraryAuthMethodForm: UntypedFormGroup;
  submitted = false;
  auth_is_active = false;
  form_loaded = false;
  auth_default_labels: object = {'username' : 'Username or Institution ID', 'password' : 'Password or PIN'};

  constructor(
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit() {
    this.initLibraryAuthMethodForm();
    this.getAuthMethodData();

    this.auth_is_active = typeof this.library_auth_methods[this.auth_id] != 'undefined';
    this.updateLibraryAuthMethodForm.get('active').valueChanges.subscribe(val => {
      this.auth_is_active = val;
      if (val) {
        this.updateLibraryAuthMethodForm.get('consumer_key').enable();
        this.updateLibraryAuthMethodForm.get('shared_secret').enable();
      }
      else {
        this.updateLibraryAuthMethodForm.get('consumer_key').disable();
        this.updateLibraryAuthMethodForm.get('shared_secret').disable();
      }

    });
  }

  initLibraryAuthMethodForm() {
    this.updateLibraryAuthMethodForm = this.formBuilder.group({
      active: [0],
      authSettings: this.formBuilder.group({
        username_placeholder: [''],
        password_placeholder: [''],
      }),      
      consumer_key: ['', Validators.required],
      shared_secret: ['', Validators.required],
    });
  }

  setLibraryForm(lib) {    
    this.updateLibraryAuthMethodForm.setValue({
      active: Number(lib['auth_is_active']),
      authSettings : {
        username_placeholder: (typeof lib['username_placeholder'] != 'undefined' && lib['username_placeholder'] != '') 
          ? lib['username_placeholder'] : this.auth_default_labels['username'],
        password_placeholder: (typeof lib['password_placeholder'] != 'undefined' && lib['password_placeholder'] != '') 
          ? lib['password_placeholder'] : this.auth_default_labels['password'],
      },      
      consumer_key: typeof lib['consumer_key'] != 'undefined' ? lib['consumer_key'] : '',
      shared_secret: typeof lib['shared_secret'] != 'undefined' ? lib['shared_secret'] : '',
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
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
        },
        err => {
          this.loading = false;
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
        });

  }

  generateConsumerKey(e){
    let isChecked = e.target.checked;
    let consumer_key = isChecked ? (this.library_name.toLowerCase()).replace(/\s/g, '') : '';
    this.updateLibraryAuthMethodForm.get('consumer_key').setValue(consumer_key);
  }

  generateSharedSecret(e){
    let isChecked = e.target.checked;
    let consumer_key = isChecked ? Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 20) : '';
    this.updateLibraryAuthMethodForm.get('shared_secret').setValue(consumer_key);
  }

}