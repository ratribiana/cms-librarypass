import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, Validators } from '@angular/forms';
import { LibraryService } from "../../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';;

@Component({
  selector: 'app-auth-sip2',
  templateUrl: './auth-sip2.component.html',
  styleUrls: ['./auth-sip2.component.css']
})
export class AuthSip2Component implements OnInit {

  @Input() library_auth_methods;
  @Input() library_id;
  @Input() auth_id;

  loading = false;
  updateLibraryAuthMethodForm: UntypedFormGroup;
  submitted = false;
  auth_is_active = false;
  form_loaded = false;
  library_login_required = 0;
  validation_type_val = '1';
  auth_default_labels: object = {'username' : 'Username or Institution ID', 'password' : 'Password or PIN'};
  sip2_test_url = 'https://login.librarypass.com/sip2_validator/?';

  constructor(
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit() {
    this.initLibraryAuthMethodForm();
    this.setLibraryAuthData();

    this.auth_is_active = typeof this.library_auth_methods[this.auth_id] != 'undefined';

    this.updateLibraryAuthMethodForm.get('active').valueChanges.subscribe(val => {
      
      this.auth_is_active = val;
      if (val) {
        this.updateLibraryAuthMethodForm.get('requires_login').enable();        
        this.updateLibraryAuthMethodForm.get('sip_host').enable();
        this.updateLibraryAuthMethodForm.get('sip_port').enable();
        this.updateLibraryAuthMethodForm.get('ao_field').enable();
        this.updateLibraryAuthMethodForm.get('cp_field').enable();
        this.updateLibraryAuthMethodForm.get('ao_23_field').enable();
        this.updateLibraryAuthMethodForm.get('aq_field').enable();
        this.updateLibraryAuthMethodForm.get('ao_99_field').enable();        
        this.updateLibraryAuthMethodForm.get('cq_23_field').enable();
        this.updateLibraryAuthMethodForm.get('cq_63_field').enable();      
        this.updateLibraryAuthMethodForm.get('pa_63_field').enable();              
        this.updateLibraryAuthMethodForm.get('minimum_age').enable();                
        this.updateLibraryAuthMethodForm.get('validate_patron').enable();
        this.updateLibraryAuthMethodForm.get('use_ssl').enable();
        this.updateLibraryAuthMethodForm.get('use_pin_field').enable();        
        this.updateLibraryAuthMethodForm.get('validation_type').enable();        
        this.updateLibraryAuthMethodForm.get('af_field').enable()

        if(this.updateLibraryAuthMethodForm.get('validation_type').value == 1){
          this.updateLibraryAuthMethodForm.get('bv_field').enable();
        }

        if(this.updateLibraryAuthMethodForm.get('requires_login').value){
          this.updateLibraryAuthMethodForm.get('sip_login').enable();
          this.updateLibraryAuthMethodForm.get('sip_password').enable();
        }
      }
      else {
        this.updateLibraryAuthMethodForm.get('requires_login').disable();
        this.updateLibraryAuthMethodForm.get('sip_login').disable();
        this.updateLibraryAuthMethodForm.get('sip_password').disable();
        this.updateLibraryAuthMethodForm.get('sip_host').disable();
        this.updateLibraryAuthMethodForm.get('sip_port').disable();
        this.updateLibraryAuthMethodForm.get('ao_field').disable();
        this.updateLibraryAuthMethodForm.get('cp_field').disable();
        this.updateLibraryAuthMethodForm.get('ao_23_field').disable();
        this.updateLibraryAuthMethodForm.get('aq_field').disable();
        this.updateLibraryAuthMethodForm.get('ao_99_field').disable();        
        this.updateLibraryAuthMethodForm.get('cq_23_field').disable();
        this.updateLibraryAuthMethodForm.get('cq_63_field').disable();
        this.updateLibraryAuthMethodForm.get('pa_63_field').disable();        
        this.updateLibraryAuthMethodForm.get('minimum_age').disable();
        this.updateLibraryAuthMethodForm.get('validate_patron').disable();
        this.updateLibraryAuthMethodForm.get('use_ssl').disable();
        this.updateLibraryAuthMethodForm.get('use_pin_field').disable();        
        this.updateLibraryAuthMethodForm.get('validation_type').disable();
        this.updateLibraryAuthMethodForm.get('bv_field').disable();
        this.updateLibraryAuthMethodForm.get('af_field').disable();
      }
    });


    this.updateLibraryAuthMethodForm.get('validation_type').valueChanges.subscribe(val => {
      this.validation_type_val = val;      
      
      if (val == 1) {
        this.updateLibraryAuthMethodForm.get('bv_field').enable();
      }
      else {              
        this.updateLibraryAuthMethodForm.get('bv_field').disable();
      }

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
      active: [0],
      requires_login: [''],
      sip_login: [''],
      sip_password: [''],
      sip_host: ['', Validators.required],
      sip_port: ['', Validators.required],
      ao_field: [''],
      cp_field: [''],
      ao_23_field: [''],
      aq_field: [''],
      ao_99_field: [''],
      cq_23_field: [''],
      cq_63_field: [''],
      pa_63_field: [''],
      minimum_age: ['', Validators.max(99) ],
      use_ssl: [''],
      use_pin_field: [''],
      validate_patron: [''],
      validation_type: ['1'],
      bv_field: ['', Validators.required],
      af_field: new UntypedFormArray([]),
      patron_status: new UntypedFormArray([]),
      authSettings: this.formBuilder.group({
        username_placeholder: [''],
        password_placeholder: [''],
      }),    
    });
  }

  setLibraryForm(lib, af_fields) {
    let $this = this;
    this.library_login_required = typeof lib['requires_login'] != 'undefined' ? Number(lib['requires_login']) : 0,
    this.validation_type_val = typeof lib['validation_type'] != 'undefined' ? lib['validation_type'] : '1';

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
      ao_23_field: typeof lib['23_ao_field'] != 'undefined' ? lib['23_ao_field'] : '',      
      aq_field: typeof lib['aq_field'] != 'undefined' ? lib['aq_field'] : '', 
      ao_99_field: typeof lib['99_ao_field'] != 'undefined' ? lib['99_ao_field'] : '', 
      cq_23_field: typeof lib['23_cq_field'] != 'undefined' ? lib['23_cq_field'] : '',
      cq_63_field: typeof lib['63_cq_field'] != 'undefined' ? lib['63_cq_field'] : '',
      pa_63_field: typeof lib['63_pa_field'] != 'undefined' ? lib['63_pa_field'] : '',      
      minimum_age: typeof lib['minimum_age'] != 'undefined' ? lib['minimum_age'] : '',
      use_ssl: typeof lib['use_ssl'] != 'undefined' ? Number(lib['use_ssl']) : 0,
      use_pin_field: typeof lib['use_pin_field'] != 'undefined' ? Number(lib['use_pin_field']) : 0,      
      validate_patron: typeof lib['validate_patron'] != 'undefined' ? Number(lib['validate_patron']) : 0,
      validation_type: this.validation_type_val,
      bv_field: typeof lib['bv_field'] != 'undefined' ? lib['bv_field'] : '',
      af_field: [],
      patron_status: [],
      authSettings : {
        username_placeholder: (typeof lib['username_placeholder'] != 'undefined' && lib['username_placeholder'] != '') 
          ? lib['username_placeholder'] : this.auth_default_labels['username'],
        password_placeholder: (typeof lib['password_placeholder'] != 'undefined' && lib['password_placeholder'] != '') 
          ? lib['password_placeholder'] : this.auth_default_labels['password'],
      },    
    });

    $.each(af_fields, function (index, val) {
      $this.addAfField(val.value);
    });

    if(lib['23_patron_status']){
      let patron_status = JSON.parse(lib['23_patron_status']);
      $.each(patron_status, function (index, val) {
        $this.addPatronStatus(index, val);
      });
    }
    

    this.form_loaded = true;
  }

  async setLibraryAuthData() {
    let lib_auth_methods = await this.getAuthMethodData();
    let af_fields = await this.getLibraryAfFields();

    this.setLibraryForm(lib_auth_methods, af_fields);    
  }

  getLibraryAfFields() {
    return new Promise(resolve => {
      this.libraryService.getLibraryAfFields(this.library_id)
        .subscribe(res => {
          resolve(res);
        });
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

  get f() { return this.updateLibraryAuthMethodForm.controls; }
  get af() { return this.f.af_field as UntypedFormArray; }
  get ps() { return this.f.patron_status as UntypedFormArray; }

  addAfField(val: string = '') {
    this.af.push(this.formBuilder.group({
      name: [val]
    }));
  }

  removeAfField(index) {
    this.af.removeAt(index);
  }

  addPatronStatus(position, status) {
    this.ps.push(this.formBuilder.group({
      p_position: [position],
      p_status: [status]
    }));
  }
  removePatronStatus(index) {
    this.ps.removeAt(index);
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
          this.loading = false;
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
        },
        err => {
          this.loading = false;
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
        });

  }

}
