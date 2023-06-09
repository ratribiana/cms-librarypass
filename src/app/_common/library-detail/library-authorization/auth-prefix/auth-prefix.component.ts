import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LibraryService } from "../../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';;
import { map, tap } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'app-auth-prefix',
  templateUrl: './auth-prefix.component.html',
  styleUrls: ['./auth-prefix.component.css']
})
export class AuthPrefixComponent implements OnInit {

  @Input() library_auth_methods;
  @Input() library_id;
  @Input() auth_id;

  loading = false;
  updateLibraryAuthMethodForm: UntypedFormGroup;
  submitted = false;
  auth_is_active = false;
  form_loaded = false;
  table_loaded = true;
  prefix_codes;
  total: number;
  page: number = 1;
  limit: number = 5;
  filter: string = '';
  password_not_required: number;
  auth_default_labels: object = {'username' : 'Username or Library ID', 'password' : 'Password or PIN'};

  constructor(
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit() {
    this.initLibraryAuthMethodForm();
    this.getPrefixCodeList(this.page, this.filter);
    this.getAuthMethodData();

    this.auth_is_active = typeof this.library_auth_methods[this.auth_id] != 'undefined';
    this.updateLibraryAuthMethodForm.get('active').valueChanges.subscribe(val => {
      this.auth_is_active = val;
    });

    this.updateLibraryAuthMethodForm.get('authSettings.no_password_required').valueChanges.subscribe(val => {
      this.password_not_required = val;
    });
  }

  initLibraryAuthMethodForm() {
    this.updateLibraryAuthMethodForm = this.formBuilder.group({
      active: [typeof this.library_auth_methods[this.auth_id] != 'undefined'],
      card_prefix: [''],
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
      card_prefix: '',
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
          this.updateLibraryAuthMethodForm.get('card_prefix').reset();
          this.getPrefixCodeList(this.page, this.filter);
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
        },
        err => {
          this.loading = false;
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
        });

  }


  getPrefixCodeList(page: number, filter: string = '') {
    this.table_loaded = false;
    this.prefix_codes = this.libraryService.getLibraryAuthPrefix(this.library_id, page, filter, this.limit)
      .pipe(tap(res => {
        this.total = res.total;
        this.page = page;
        this.table_loaded = true;
      }), map(res => res.items));
  }


  deleteAuthPrefix(e, prefix_id: number, code: string) {
    let row = e.target.parentNode.parentNode;

    let r = confirm(`Delete ${code}?`);

    if (r == true) {
      this.libraryService.deleteLibraryAuthPrefix(this.library_id, prefix_id)
        .subscribe(
          data => {
            this._flashMessagesService.show('Successfully Deleted Code.', { cssClass: 'alert-success', timeout: 5000 });
            row.remove();
            this.getPrefixCodeList(this.page, this.filter);            
          },
          (error: HttpErrorResponse) => {
            console.log(error.message);
          });
    }
  }

}
