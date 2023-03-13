import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LibraryService } from "../../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-auth-patron-api',
  templateUrl: './auth-patron-api.component.html',
  styleUrls: ['./auth-patron-api.component.css']
})
export class AuthPatronApiComponent implements OnInit {

  @Input() library_auth_methods;
  @Input() library_id;
  @Input() auth_id;

  loading = false;
  updateLibraryAuthMethodForm: UntypedFormGroup;
  submitted = false;
  auth_is_active = false;
  form_loaded = false;
  password_not_required: number;
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
        this.updateLibraryAuthMethodForm.get('home_code').enable();
        this.updateLibraryAuthMethodForm.get('authSettings').enable();
        this.updateLibraryAuthMethodForm.get('auth_url').enable();
        this.updateLibraryAuthMethodForm.get('patron_type').enable();        
        this.updateLibraryAuthMethodForm.get('other_fields').enable();
      }
      else {
        this.updateLibraryAuthMethodForm.get('home_code').disable();
        this.updateLibraryAuthMethodForm.get('authSettings').disable();
        this.updateLibraryAuthMethodForm.get('auth_url').disable();
        this.updateLibraryAuthMethodForm.get('patron_type').disable();
        this.updateLibraryAuthMethodForm.get('other_fields').disable();
      }

    });

    this.updateLibraryAuthMethodForm.get('authSettings.no_password_required').valueChanges.subscribe(val => {
      this.password_not_required = val;
    });
  }

  initLibraryAuthMethodForm() {
    this.updateLibraryAuthMethodForm = this.formBuilder.group({
      active: [0],      
      home_code: ['', Validators.required],
      auth_url: ['', Validators.required],
      patron_type: [''],
      other_fields: [''],
      authSettings: this.formBuilder.group({
        no_password_required: [0],
        username_placeholder: [''],
        password_placeholder: [''],
      }),
    });
  }

  setLibraryForm(lib) {  
    this.password_not_required = typeof lib['no_password_required'] != 'undefined' ? Number(lib['no_password_required']) : 0;

    this.updateLibraryAuthMethodForm.setValue({
      active: Number(lib['auth_is_active']),
      home_code: typeof lib['home_code'] != 'undefined' ? lib['home_code'] : '',
      auth_url: typeof lib['auth_url'] != 'undefined' ? lib['auth_url'] : '',
      patron_type: typeof lib['patron_type'] != 'undefined' ? lib['patron_type'] : '',
      other_fields: typeof lib['fields'] != 'undefined' ? lib['fields'] : '',
      authSettings : {
        no_password_required: this.password_not_required,
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
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
        },
        err => {
          this.loading = false;
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
        });

  }

}
