import { Component, OnInit, Input} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LibraryService } from "../../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';
import { map, tap } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'app-auth-clever',
  templateUrl: './auth-clever.component.html',
  styleUrls: ['./auth-clever.component.css']
})
export class AuthCleverComponent implements OnInit {

  @Input() library_id;
  @Input() auth_id;

  loading = false;
  updateLibraryAuthMethodForm: UntypedFormGroup;
  submitted = false;
  auth_is_active = false;
  form_loaded = false;
  districts;
  total: number;
  page: number = 1;
  limit: number = 5;
  filter: string = '';

  constructor(
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit() {        
    this.initLibraryAuthMethodForm();
    this.getDistrictList(this.page, this.filter);
    this.getAuthMethodData();

   //this.auth_is_active = typeof this.library_auth_methods[this.auth_id] != 'undefined';
   this.updateLibraryAuthMethodForm.get('active').valueChanges.subscribe(val => {
      this.auth_is_active = val;
    });
  }

  initLibraryAuthMethodForm() {
    this.updateLibraryAuthMethodForm = this.formBuilder.group({
      active: [0],
      district_id: '',
    });
  }

  getAuthMethodData() {
    this.libraryService.getLibAuthData(this.library_id, this.auth_id)
      .subscribe(res => {
        this.setLibraryForm(res);
      });
  }

  setLibraryForm(lib) {
    this.updateLibraryAuthMethodForm.setValue({
      active: Number(lib['auth_is_active']),
      district_id: ''
    });
    this.form_loaded = true;
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
          this.updateLibraryAuthMethodForm.get('district_id').reset();
          this.getDistrictList(this.page, this.filter);
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
        },
        err => {
          this.loading = false;
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
        });

  }


  getDistrictList(page: number, filter: string = '') {
    this.districts = this.libraryService.getLibraryCleverDistrict(this.library_id, page, filter, this.limit)
      .pipe(tap(res => {
        this.total = res.total;
        this.page = page;
      }), map(res => res.items));
  }


  deleteCleverDistrict(e, id: number, district_id: number) {
    let row = e.target.parentNode.parentNode;

    let r = confirm(`Delete ${district_id}?`);

    if (r == true) {
      this.libraryService.deleteLibraryCleverDistrict(this.library_id, id)
        .subscribe(
          data => {
            this._flashMessagesService.show('Successfully Deleted District.', { cssClass: 'alert-success', timeout: 5000 });
            row.remove();
            this.getDistrictList(this.page, this.filter);            
          },
          (error: HttpErrorResponse) => {
            console.log(error.message);
          });
    }
  }

}
