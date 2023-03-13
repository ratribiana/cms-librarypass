import { Component, Input, OnInit } from '@angular/core';
import { environment } from "../../../environments/environment";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from "../../_services";
import { LibraryService } from "../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-library-create',
  templateUrl: './library-create.component.html',
  styleUrls: ['./library-create.component.css']
})
export class LibraryCreateComponent implements OnInit {

  apiUrl = environment.apiEndpoint;
  createLibraryForm: UntypedFormGroup;
  loading = false;
  submitted = false;
  currentUser = this.authenticationService.currentUserValue;
  redirect_urls = [];
  library_types = [
    { id: 1, name: 'Test Library' },
    { id: 2, name: 'Trial Library' }
    ];
  dropdownSettings = {};

  constructor(
    private libraryService: LibraryService,
    private authenticationService: AuthenticationService,
    private _flashMessagesService: FlashMessagesService,
    private formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit() {
    this.getLoginRedirectUrls();
    this.initLibraryForm();
    let $this = this;
    this.loadLibraryList();

    $('.libraries-parent-id').on('select2:select', function (e) {
      var data = e['params']['data'];
      $("#libraries_parent_id").val(data.id);
    });

    $('.libraries-parent-id').on('select2:unselect', function (e) {
      $("#libraries_parent_id").val('');
    });

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 4,
      allowSearchFilter: false
  };
  }

  initLibraryForm() {
    this.createLibraryForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      address_2: [''],
      nickname: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      phone: ['', Validators.required],
      website: [''],
      parent_id: [''],
      active: [0],      
      test_library: [0],
      trial_library: [0],
      login_redirect: ['1'],
      show_patron_info: [0],
      social_sharing: ['1'],
      show_at_login: [1]
    });
  }

  loadLibraryList() {
    var apiURL = `${this.apiUrl}/libraries-list`;
    var auth_token = `${this.currentUser.token}`;

    $('.libraries-parent-id').select2({
      width: '100%',
      ajax: {
        url: apiURL,
        dataType: 'json',
        delay: 150,
        headers: { "Authorization": `Bearer ` + auth_token },
        data: function (params: any) {
          return {
            q: params.term
          };
        },
        processResults: function (data: any, params: any) {
          return {
            results:
              data.items.map(function (item) {
                return {
                  id: item.id,
                  text: item.name
                };
              }
              )
          };
        },
        cache: true
      },
      placeholder: 'Search for Institutions',
      allowClear: true,
      minimumInputLength: 2
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.createLibraryForm.controls; }

  createLibrary(e) {
    this.submitted = true;
    e.preventDefault();
    // stop here if form is invalid

    var form_data = this.createLibraryForm.value;
    form_data['parent_id'] = $("#libraries_parent_id").val();
    // form_data.type = (form_data.type).length > 0 ? JSON.stringify(form_data.type) : null;

    if (this.createLibraryForm.invalid) {
      return;
    }

    this.loading = true;

    this.libraryService.addLibrary(form_data)
      .subscribe(
        lib_id => {
          this.loading = false;
          this._flashMessagesService.show('Library Created.', { cssClass: 'alert-success', timeout: 5000 });

          window.location.href = "/libraries/" + lib_id;
        },
        err => {          
          this.loading = false;
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
        });

  }

  getLoginRedirectUrls() {
    this.libraryService.getLoginRedirectUrls()
      .subscribe(res => {        
        this.redirect_urls = res;
      });
  }
}
