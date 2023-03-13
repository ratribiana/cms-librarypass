import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { LibraryService } from "../../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-auth-saml',
  templateUrl: './auth-saml.component.html',
  styleUrls: ['./auth-saml.component.css']
})
export class AuthSamlComponent implements OnInit {

  @Input() library_auth_methods;
  @Input() auth_id;
  @Input() library_id;


  loading = false;
  updateLibraryAuthMethodForm: FormGroup;
  submitted = false;
  auth_is_active = false;
  form_loaded = false;
  is_parent = false;
  is_parent_pass_through = 0;
  auth_default_labels: object = {'username' : 'Username or Institution ID', 'password' : 'Password or PIN'};

  constructor(
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.initLibraryAuthMethodForm();
    this.getAuthMethodData();    

    this.auth_is_active = typeof this.library_auth_methods[this.auth_id] != 'undefined';
    this.updateLibraryAuthMethodForm.get('active').valueChanges.subscribe(val => {
      this.auth_is_active = val;
      if (val) {
        this.updateLibraryAuthMethodForm.get('idp_entity_id').enable();
        this.updateLibraryAuthMethodForm.get('idp_sso').enable();
        this.updateLibraryAuthMethodForm.get('idp_slo').enable();
        this.updateLibraryAuthMethodForm.get('idp_x509cert').enable();
      }
      else {
        this.updateLibraryAuthMethodForm.get('idp_entity_id').disable();
        this.updateLibraryAuthMethodForm.get('idp_sso').disable();
        this.updateLibraryAuthMethodForm.get('idp_slo').disable();
        this.updateLibraryAuthMethodForm.get('idp_x509cert').disable();
      }

    });        

    this.updateLibraryAuthMethodForm.get('parent_pass_through').valueChanges.subscribe(val => {
      this.is_parent_pass_through = val;

      if (val) {       
        this.updateLibraryAuthMethodForm.get('attribute_field').enable();
        this.updateLibraryAuthMethodForm.get('attribute_value').enable();
      }
      else{        
        this.updateLibraryAuthMethodForm.get('attribute_field').disable();
        this.updateLibraryAuthMethodForm.get('attribute_value').disable();
      }
    });
  }

  initLibraryAuthMethodForm() {
    this.updateLibraryAuthMethodForm = this.formBuilder.group({
      active: [0],
      idp_entity_id: ['', Validators.required],
      idp_sso: ['', Validators.required],
      idp_slo: ['', Validators.required],
      idp_x509cert: ['', Validators.required],
      parent_pass_through: [0],
      attribute_field: [''],
      attribute_value: new FormArray([]),
      authSettings: this.formBuilder.group({
        username_placeholder: [''],
        password_placeholder: [''],
      }),      
    });
  }

  async setLibraryForm(lib) {
    let $this = this;
    this.is_parent_pass_through = Number(lib['parent_pass_through']);
    let child_libraries : any = await this.getChildLibraryList();    
    this.is_parent = Object.keys(child_libraries).length > 0 ? true : false;

    if(!this.is_parent){      
      this.updateLibraryAuthMethodForm.get('attribute_field').disable();
      this.updateLibraryAuthMethodForm.get('attribute_value').disable();
    }

    this.updateLibraryAuthMethodForm.setValue({
      active: Number(lib['auth_is_active']),
      idp_entity_id: typeof lib['idp_entity_id'] != 'undefined' ? lib['idp_entity_id'] : '',
      idp_sso: typeof lib['idp_sso'] != 'undefined' ? lib['idp_sso'] : '',
      idp_slo: typeof lib['idp_slo'] != 'undefined' ? lib['idp_slo'] : '',
      idp_x509cert: typeof lib['idp_x509cert'] != 'undefined' ? lib['idp_x509cert'] : '',
      parent_pass_through: Number(lib['parent_pass_through']),
      attribute_field : typeof lib['attribute_field'] != 'undefined' ? lib['attribute_field'] : '',
      attribute_value : [], 
      authSettings : {
        username_placeholder: (typeof lib['username_placeholder'] != 'undefined' && lib['username_placeholder'] != '') 
          ? lib['username_placeholder'] : this.auth_default_labels['username'],
        password_placeholder: (typeof lib['password_placeholder'] != 'undefined' && lib['password_placeholder'] != '') 
          ? lib['password_placeholder'] : this.auth_default_labels['password'],
      }, 
    });

    if(this.is_parent ){
        let library_attributes = (typeof lib['attribute_value'] != 'undefined' && lib['attribute_value'].length > 2) ? JSON.parse(lib['attribute_value']) : [];
        let attr_search : any = [];
        let attr_value = '';

        $.each(child_libraries, function (index, val) {            
          attr_search = library_attributes.find(e => e.lib_id == val.id);          
          attr_value = attr_search == undefined ? '' : attr_search.lib_attr;
          $this.addLibrary_attributes(val.name, val.id, attr_value);
        });
    }

    this.form_loaded = true;

  }

  getAuthMethodData() {
    this.libraryService.getLibAuthData(this.library_id, this.auth_id)
      .subscribe(res => {
        this.setLibraryForm(res);
      });      
  }

  addLibrary_attributes(lib_name, lib_id, lib_attr) {    
    this.lib_att.push(this.formBuilder.group({
      lib_name: [lib_name],
      lib_id:  [lib_id],
      lib_attr: [lib_attr]  
    }));
  }


  getChildLibraryList() {
    return new Promise(resolve => {
      this.libraryService.getChildLibraries(this.library_id, 1, '', 100)
      .subscribe(res => {
        resolve(res.items);
      });     
    })
    
  }

  get f() { return this.updateLibraryAuthMethodForm.controls; }
  get lib_att() { return this.f.attribute_value as FormArray; }

  updateLibraryAuthMethod(e) {

    this.submitted = true;
    e.preventDefault();
    // stop here if form is invalid

    if (this.updateLibraryAuthMethodForm.invalid) {
      return;
    }

    this.loading = true;
    var form_data = this.updateLibraryAuthMethodForm.value;
    
    if(!form_data.parent_pass_through){      
      delete form_data.attribute_value;
      delete form_data.attribute_field;    
    }
        
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
