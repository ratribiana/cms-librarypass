import { Component, Input, OnInit } from '@angular/core';
import { environment } from "../../../environments/environment";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from "../../_services";
import { LibraryService } from "../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';
import { AnnounceService } from "../../_services/announce.service"

@Component({
  selector: 'app-library-profile',
  templateUrl: './library-profile.component.html',
  styleUrls: ['./library-profile.component.css']
})
export class LibraryProfileComponent implements OnInit {

  @Input() library_id;
  @Input() LibData;

  apiUrl = environment.apiEndpoint;
  updateLibraryForm: FormGroup;
  loading = false;
  submitted = false;
  currentUser = this.authenticationService.currentUserValue;
  lib_dns: string = '';
  is_child_library = false;
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
    private formBuilder: FormBuilder,
    private announceService: AnnounceService,
  ) { }

  ngOnInit() {
    this.getLoginRedirectUrls();
    this.initLibraryForm();
    let $this = this;

    this.setLibraryForm(this.LibData);
    this.loadLibraryList();

    $('.libraries-parent-id').on('select2:select', function (e) {
      var data = e['params']['data'];
      $("#libraries_parent_id").val(data.id);
      $this.is_child_library = true;
    });

    $('.libraries-parent-id').on('select2:unselect', function (e) {
      $this.is_child_library = false;
      $("#libraries_parent_id").val('');
    });
  
    // this.dropdownSettings = {
    //     singleSelection: false,
    //     idField: 'id',
    //     textField: 'name',
    //     selectAllText: 'Select All',
    //     unSelectAllText: 'UnSelect All',
    //     itemsShowLimit: 4,
    //     allowSearchFilter: false
    // };
  }


  updateParentStatus(lib) {
    this.announceService.setParentBilling(lib['parent_billing']);
    this.announceService.setParentServices(lib['parent_services']);
    this.announceService.setParentAuth(lib['parent_authentication']);
  }

  initLibraryForm() {
    this.updateLibraryForm = this.formBuilder.group({
      name: ['', Validators.required],
      address_2: [''],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      nickname: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      phone: ['', Validators.required],
      website: [''],
      parent_id: [''],
      login_redirect: ['1'],      
      test_library: [0],
      show_patron_info: [1],
      social_sharing: [1],      
      // show_read_progress:[0],
      trial_library: [0],
      active: [0],
      parent_billing: [0],
      parent_services: [0],
      parent_authentication: [0],
      parent_collection: [0],
      show_at_login: [0]
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
      placeholder: 'Search for Parent Institution',
      allowClear: true,
      minimumInputLength: 2
    });
  }

  setLibraryForm(lib) {
    if (lib['parent_name']) {
      this.is_child_library = true;
      $('.libraries-parent-id').append(new Option(lib['parent_name'], lib['parent_id']));
    }
    else {
      $('.libraries-parent-id').append(new Option('Search for Institutions', '0'));
    }

    // let library_type = (lib.type != null) ? JSON.parse(lib.type) : {};
    this.lib_dns = lib['nickname'];
    this.updateParentStatus(lib);

    this.updateLibraryForm.setValue({
      name: lib['name'],
      nickname: lib['nickname'],
      email: lib['payment_email'],
      address: lib['address1'],
      address_2: lib['address2'],
      city: lib['city'],
      state: lib['state'],
      zip: lib['zip'],
      phone: lib['phone'],
      website: lib['website'],
      parent_id: lib['parent_id'],
      login_redirect: lib['login_redirect'].toString(),      
      test_library: Number(lib['test_library']),
      trial_library: Number(lib['trial_library']),
      show_patron_info: Number(lib['show_patron_info']),
      social_sharing: Number(lib['social_sharing']),      
      // show_read_progress:Number(lib['show_read_progress']),
      active: Number(lib['active']),
      parent_billing: Number(lib['parent_billing']),
      parent_services: Number(lib['parent_services']),
      parent_authentication: Number(lib['parent_authentication']),
      parent_collection: Number(lib['parent_collection']),
      show_at_login: Number(lib['show_at_login']),
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.updateLibraryForm.controls; }

  updateLibrary(e) {
    this.submitted = true;
    e.preventDefault();
    // stop here if form is invalid

    if (this.updateLibraryForm.invalid) {
      return;
    }

    this.loading = true;
    var form_data = this.updateLibraryForm.value;

    // form_data.type = (form_data.type).length > 0 ? JSON.stringify(form_data.type) : null;
    // this.LibData['parent_billing'] = form_data['parent_billing'];
    form_data['parent_id'] = $("#libraries_parent_id").val();

    this.updateParentStatus(form_data);

    this.libraryService.updateLibrary(this.library_id, form_data)
      .subscribe(
        data => {
          if (form_data.nickname) {
            this.lib_dns = form_data.nickname;
          }          
          this.loading = false;
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
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
