import { Component, OnInit, Input } from '@angular/core';
import { LibraryService } from "../../_services/library.service"
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AnnounceService } from "../../_services/announce.service"
import * as _ from 'lodash';

@Component({
  selector: 'app-library-authorization',
  templateUrl: './library-authorization.component.html',
  styleUrls: ['./library-authorization.component.css'],
})
export class LibraryAuthorizationComponent implements OnInit {

  @Input() library_id;
  @Input() authSecretCode;
  @Input() library_name;

  active_auth_method: object;
  loading = false;
  auth_methods: any;
  authMethodForm: UntypedFormGroup;
  authMethodval: string = '1';
  selected_auth_method;
  library_auth_methods;
  is_parent_auth: boolean = false;

  constructor(
    private libraryService: LibraryService,
    private formBuilder: UntypedFormBuilder,
    private announceService: AnnounceService,
  ) { }

  ngOnInit() {
    this.getlibraryAuthenticationMethods();
    this.announceService.use_parent_auth.subscribe(message => this.is_parent_auth = message);    
    this.initLibraryForm();    
    this.authMethodForm.get('authentication_methods').valueChanges.subscribe(val => {
      this.authMethodval = val;
      this.selected_auth_method = _.find(this.auth_methods, function (o) { return o.id == val; });
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.authMethodForm.controls; }

  async getlibraryAuthenticationMethods(){  
    this.library_auth_methods = await this.getLibAuthMethods();
    this.auth_methods = await this.getAuthMethods();

    this.selected_auth_method = _.find(this.auth_methods, function (o) { return o.id == '1'; });        
  }  
  
  getAuthMethods() {
    return new Promise(resolve => {
      this.libraryService.getAuthMethods()
      .subscribe(res => {                
        resolve(res);
      });          
    });
  }
  
  getLibAuthMethods() {
    return new Promise(resolve => {
      this.libraryService.getLibraryAuthMethods(this.library_id)
      .subscribe(res => {                
        resolve(res);
      });          
    });
  }

  initLibraryForm() {
    this.authMethodForm = this.formBuilder.group({
      authentication_methods: ['1', Validators.required]
    });
  }



  checkAuthActive(id) {        
    if(this.library_auth_methods){
      return id in this.library_auth_methods;
    }    
    return false;
  }
}
