import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LibraryService } from "../../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-auth-rb-digital',
  templateUrl: './auth-rb-digital.component.html',
  styleUrls: ['./auth-rb-digital.component.css']
})
export class AuthRbDigitalComponent implements OnInit {

  @Input() library_auth_methods;
  @Input() auth_id;
  @Input() library_id;


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
        this.updateLibraryAuthMethodForm.get('nickname').enable();
        this.updateLibraryAuthMethodForm.get('url').enable();
        this.updateLibraryAuthMethodForm.get('token').enable();
      }
      else {
        this.updateLibraryAuthMethodForm.get('nickname').disable()
        this.updateLibraryAuthMethodForm.get('url').disable()
        this.updateLibraryAuthMethodForm.get('token').disable()
      }

    });
  }

  initLibraryAuthMethodForm() {
    this.updateLibraryAuthMethodForm = this.formBuilder.group({
      active: [0],
      nickname: ['', Validators.required],
      authSettings: this.formBuilder.group({        
        username_placeholder: [''],
        password_placeholder: [''],
      }),
      url: ['', Validators.required],
      token: ['', Validators.required],
    });
  }

  setLibraryForm(lib) {
    this.updateLibraryAuthMethodForm.setValue({
      active: Number(lib['auth_is_active']),
      nickname: typeof lib['nickname'] != 'undefined' ? lib['nickname'] : '',
      authSettings : {
        username_placeholder: (typeof lib['username_placeholder'] != 'undefined' && lib['username_placeholder'] != '') 
          ? lib['username_placeholder'] : this.auth_default_labels['username'],
        password_placeholder: (typeof lib['password_placeholder'] != 'undefined' && lib['password_placeholder'] != '') 
          ? lib['password_placeholder'] : this.auth_default_labels['password'],
      },   
      url: typeof lib['url'] != 'undefined' ? lib['url'] : '',
      token: typeof lib['token'] != 'undefined' ? lib['token'] : ''
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
