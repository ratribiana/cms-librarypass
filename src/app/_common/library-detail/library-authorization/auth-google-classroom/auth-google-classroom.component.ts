import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LibraryService } from "../../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-auth-google-classroom',
  templateUrl: './auth-google-classroom.component.html',
  styleUrls: ['./auth-google-classroom.component.css']
})
export class AuthGoogleClassroomComponent implements OnInit {
  
  @Input() library_id;
  @Input() auth_id;

  loading = false;
  updateLibraryAuthMethodForm: UntypedFormGroup;
  submitted = false;
  auth_is_active = false;
  form_loaded = false;

  constructor(
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit() {        
    this.initLibraryAuthMethodForm();
    this.getAuthMethodData();
    
    // this.auth_is_active = typeof this.library_auth_methods[this.auth_id] != 'undefined';
    // this.updateLibraryAuthMethodForm.get('active').valueChanges.subscribe(val => {
    //   this.auth_is_active = val;
    // });
  }

  initLibraryAuthMethodForm() {
    this.updateLibraryAuthMethodForm = this.formBuilder.group({
      active: [0],
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
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
        },
        err => {
          this.loading = false;
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
        });

  }

}
