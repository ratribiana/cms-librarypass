import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LibraryService } from "../../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';;
import { map, tap } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";
import { ValidateRange } from "../../../_validators/range.validator";
import {MiscService} from "../../../_services/misc.service";

@Component({
  selector: 'app-auth-sip2v2',
  templateUrl: './auth-sip2v2.component.html',
  styleUrls: ['./auth-sip2v2.component.css']
})
export class AuthSip2v2Component implements OnInit {

  @Input() library_auth_methods;
  @Input() library_id;
  @Input() auth_id;

  loading = false;
  rule_loading = false;
  updateLibraryAuthMethodForm: UntypedFormGroup;
  validationRulesForm: UntypedFormGroup;
  submitted = false;
  rule_submitted = false;
  auth_is_active = false;
  form_loaded = false;
  table_loaded = true;
  auth_default_labels: object = {'username' : 'Username or Institution ID', 'password' : 'Password or PIN'};
  sip2_fields = [];
  operators = ['beginsWith', 'equals', 'greaterThan', 'greaterThanOrEqual', 'isNotExpired', 'lessThan', 'lessThanOrEqual', 'List', 'minimumAge', 'positionInOrder'];
  library_sip2_rules;
  library_login_required = 0;
  sip2_test_url = 'https://login.librarypass.com/sip2_validator/?';

  constructor(
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private formBuilder: UntypedFormBuilder,
    private misc: MiscService,
  ) { }

  ngOnInit() {
    this.initLibraryAuthMethodForm();
    this.getLibrarySip2Rules();
    this.getAuthMethodData();

    this.auth_is_active = typeof this.library_auth_methods[this.auth_id] != 'undefined';
    this.updateLibraryAuthMethodForm.get('active').valueChanges.subscribe(val => {
      this.auth_is_active = val;
    });

    this.misc.getSip2Fields().subscribe(data => {      
      this.sip2_fields = data;       
    });

    this.updateLibraryAuthMethodForm.get('requires_login').valueChanges.subscribe(val => {
      this.library_login_required = val;
      if (val) {
        this.updateLibraryAuthMethodForm.get('sip_login').enable();
        this.updateLibraryAuthMethodForm.get('sip_password').enable();
      }
      else {
        this.updateLibraryAuthMethodForm.get('sip_login').disable();
        this.updateLibraryAuthMethodForm.get('sip_password').disable();
      }

    });
  }

  initLibraryAuthMethodForm() {
    this.updateLibraryAuthMethodForm = this.formBuilder.group({
      active: [typeof this.library_auth_methods[this.auth_id] != 'undefined'],
      requires_login: [''],
      sip_login: [''],
      sip_password: [''],
      sip_host: ['', Validators.required],
      sip_port: ['', Validators.required],
      ao_field: [''],
      cp_field: [''],
      use_ssl: [''],
      use_pin_field: ['0'],
      authSettings: this.formBuilder.group({
        username_placeholder: [''],
        password_placeholder: [''],
      })      
    });    

    this.validationRulesForm = this.formBuilder.group({
      field_id: ['', Validators.required],
      operator: ['', Validators.required],
      field_value: ['', Validators.required],
      allow: [''],
      required: [''],
      case_sensitive: [''],  
    });   
  }

  setLibraryForm(lib) {  
    
    this.library_login_required = typeof lib['requires_login'] != 'undefined' ? Number(lib['requires_login']) : 0,

    this.sip2_test_url += 'location=' + (typeof lib['cp_field'] != 'undefined' ? lib['cp_field'] : '');
    this.sip2_test_url += '&tls=' + (typeof lib['use_ssl'] != 'undefined' ? Number(lib['use_ssl']) : 0);
    this.sip2_test_url += '&hostname=' + ((typeof lib['sip_host'] != 'undefined' && lib['sip_host'] != null) ? lib['sip_host'] : '');
    this.sip2_test_url += '&port=' + ((typeof lib['sip_port'] != 'undefined' && lib['sip_port'] != null) ? lib['sip_port'] : '');
    this.sip2_test_url += '&siplogin=' + ((typeof lib['sip_login'] != 'undefined' && lib['sip_login'] != null) ? lib['sip_login'] : '');
    this.sip2_test_url += '&sippassword=' + ((typeof lib['sip_password'] != 'undefined' && lib['sip_password'] != null) ? lib['sip_password'] : '');
    this.sip2_test_url += '&patronlogin=';
    this.sip2_test_url += '&patronpassword=';

    this.updateLibraryAuthMethodForm.setValue({
      active: Number(lib['auth_is_active']),
      requires_login: this.library_login_required,
      sip_login: typeof lib['sip_login'] != 'undefined' ? lib['sip_login'] : '',
      sip_password: typeof lib['sip_password'] != 'undefined' ? lib['sip_password'] : '',
      sip_host: typeof lib['sip_host'] != 'undefined' ? lib['sip_host'] : '',
      sip_port: typeof lib['sip_port'] != 'undefined' ? lib['sip_port'] : '',
      ao_field: typeof lib['ao_field'] != 'undefined' ? lib['ao_field'] : '',
      cp_field: typeof lib['cp_field'] != 'undefined' ? lib['cp_field'] : '',
      use_ssl: typeof lib['use_ssl'] != 'undefined' ? Number(lib['use_ssl']) : 0,
      use_pin_field: typeof lib['use_pin_field'] != 'undefined' ? lib['use_pin_field'] : '0',  
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
  get r() { return this.validationRulesForm.controls; }

  addValidationRule(e){

    this.rule_submitted = true;
    e.preventDefault();
    // stop here if form is invalid

    if (this.validationRulesForm.invalid) {
      return;
    }

    this.rule_loading = true;
    var form_data = this.validationRulesForm.value;    

    this.libraryService.createSip2ValidationRule(this.library_id, form_data)
      .subscribe(
        data => {          
          this.getLibrarySip2Rules();
          this.rule_submitted = false;
          this.validationRulesForm.get('field_value').enable();
          this.validationRulesForm.get('field_id').reset();
          this.validationRulesForm.get('operator').reset();
          this.validationRulesForm.get('field_value').reset();
          this.validationRulesForm.get('allow').reset();
          this.validationRulesForm.get('required').reset();
          this.validationRulesForm.get('case_sensitive').reset();          
          
          this._flashMessagesService.show('Validation Rule Created.', { cssClass: 'alert-success', timeout: 5000 });
          this.rule_loading = false;
        },
        err => {          
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
          this.rule_loading = false;
        });

  }

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
          this.submitted = false;
          
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
          this.loading = false;
        },
        err => {          
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
          this.loading = false;
        });

  }

  getLibrarySip2Rules() {
    this.table_loaded = false;

    this.library_sip2_rules = this.libraryService.getLibraryAuthSipV2(this.library_id)
      .subscribe(data => {      
        this.library_sip2_rules = data;       
        this.table_loaded = true;    
      });    
  }

  deleteSipRule(e, sip2_rule_id: number) {
    let row = e.target.parentNode.parentNode;

    let r = confirm(`Delete SIP2 rule?`);
    if (r == true) {
      this.libraryService.deleteLibraryAuthSip2(this.library_id, sip2_rule_id)
        .subscribe(
          data => {
            this._flashMessagesService.show('Successfully Deleted SIP2 rule.', { cssClass: 'alert-success', timeout: 5000 });
            row.remove();            
          },
          (error: HttpErrorResponse) => {
            console.log(error.message);
          });
    }
  }

  changeOperator(e){
    let value = e.target.value;

    if(value.indexOf("isNotExpired") > -1){
      this.validationRulesForm.get('field_value').disable();    
    }
    else{
      this.validationRulesForm.get('field_value').enable();
    }
  }
}
