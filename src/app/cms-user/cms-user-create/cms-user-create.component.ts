import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserMaintenanceService } from "../../_services/user-maintenance.service"
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from "../../_services";
import { ActivatedRoute, Router } from "@angular/router";
import { AclService } from "../../_services/acl.service";
import { saveAs } from 'file-saver';
import { environment } from "../../../environments/environment";
import { AuthGuard } from 'src/app/_guards';


@Component({
  selector: 'app-cms-user-create',
  templateUrl: './cms-user-create.component.html',
  styleUrls: ['./cms-user-create.component.css']
})
export class CmsUserCreateComponent implements OnInit {

  updateCmsUserForm: FormGroup;
  cms_user_roles: object;
  cms_role = '1';
  loading = false;
  submitted = false;
  loadedForm = false;
  currentUser = this.authenticationService.currentUserValue;
  apiUrl = environment.apiEndpoint;
  cms_user_id = null;
  cms_user_data: object;
  default_password: string;
  private_key_ppk: string;
  cms_user_name: string;
  userRoles: object;
  allowedRoles = [];
  username: any;

  constructor(
    private formBuilder: FormBuilder,
    private userMaintenanceService: UserMaintenanceService,
    private toastr: ToastrService,
    private authenticationService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private router : Router,
    private aclService: AclService,
    public guard: AuthGuard
  ) { }

  ngOnInit() {
    this.default_password = '************';
    this.activatedRoute.params.subscribe(params => {
      this.cms_user_id = params['id']; // (+) converts string 'id' to a number    
    });

    this.getUserGroup();
    this.initCmsUserForm();
    this.loadSupplierList();
    this.loadLibraryList();

    // we only initiate this if not edit mode
    if (this.cms_user_id === undefined) {
        this.getAclUserRoles();
    }

    let CmsUserForm = this.updateCmsUserForm;    

    $('.institution-libraries').on('select2:select', function (e) {
      var data = e['params']['data'];
      CmsUserForm.get('library_id').setValue(data.id);
    });

    $('.institution-libraries').on('select2:unselect', function (e) {
      CmsUserForm.get('library_id').setValue('');
    });

    $('.publisher-suppliers').on('select2:select', function (e) {
      var data = e['params']['data'];
      CmsUserForm.get('supplier_id').setValue(data.id);
    });

    $('.publisher-suppliers').on('select2:unselect', function (e) {
      CmsUserForm.get('supplier_id').setValue('');
    });

    this.updateCmsUserForm.get('cms_role_id').valueChanges.subscribe(val => {
      this.cms_role = val;
      this.getAclUserRoles();

      if (val == '5') {
        this.updateCmsUserForm.get('library_id').disable();
        this.updateCmsUserForm.get('supplier_id').enable();        
        $('#library_id').parent('div').hide();        
        $('#supplier_id').parent('div').show();

        if (this.cms_user_id) {
          // this.updateCmsUserForm.get('ssh_private_key').enable();     
          // this.updateCmsUserForm.get('ssh_public_key').enable();        
          $('div.supplier-fields').show();
        }
      }
      else if (val == '3' || val == '4') {
        this.updateCmsUserForm.get('library_id').enable();
        this.updateCmsUserForm.get('supplier_id').disable();
        // this.updateCmsUserForm.get('ssh_private_key').disable();   
        // this.updateCmsUserForm.get('ssh_public_key').disable();             
        $('div.supplier-fields').hide();
        $('#library_id').parent('div').show();
      }
      else {
        this.updateCmsUserForm.get('library_id').disable();
        this.updateCmsUserForm.get('supplier_id').disable();
        // this.updateCmsUserForm.get('ssh_private_key').disable();
        // this.updateCmsUserForm.get('ssh_public_key').disable();             
        $('div.supplier-fields').hide();
        $('#library_id').parent('div').hide();
      }
    });


    if (this.cms_user_id) {
      this.setCmsUserForm();
    }
  }

  initCmsUserForm() {
    this.updateCmsUserForm = this.formBuilder.group({
      cms_role_id: ['1', Validators.required],
      user_id: [0],
      library_id: ['', Validators.required],
      supplier_id: ['', Validators.required],
      email_address: ['', Validators.required],
      // ssh_private_key: ['', Validators.required],
      // ssh_public_key: ['', Validators.required],
      username: ['', Validators.required],
      password: [''],
      add_roles: ['']
    });

    this.updateCmsUserForm.get('library_id').disable();
    this.updateCmsUserForm.get('supplier_id').disable();
    // this.updateCmsUserForm.get('ssh_private_key').disable();
    // this.updateCmsUserForm.get('ssh_public_key').disable();
        
    if (!this.cms_user_id) {
      this.updateCmsUserForm.get('supplier_id').setValidators([Validators.required]);
      this.loadedForm = true;
    }
  }

  async setCmsUserForm() {
    let user = await this.getCmsUser();    
    let role_id = user['cms_role_id'];
    
    if(!role_id){
      if(user['library_id']){
        role_id = '3';
      }
      else if(user['supplier_id']){
        role_id = '5';
      }
      else if(user['admin_access'] == 1){
        role_id = '1';
      }
    }    
    
    if(this.cms_user_id && !user){
      window.location.href = "/cms_users";
    }  
          
    this.updateCmsUserForm.setValue({
      user_id: user['id'],
      cms_role_id: role_id,
      library_id: user['library_id'],
      supplier_id: user['supplier_id'],
      email_address: user['email_address'],
      // ssh_private_key: user['ssh_private_key'],
      // ssh_public_key: user['ssh_public_key'],
      username: user['username'], 
      password: this.default_password,
      add_roles: user['add_roles']
    });

    if (role_id == 4 || role_id == 3) {
      $('.institution-libraries').append(new Option(user['library_name'], user['library_id']));
    }

    if (role_id == 5) {
      $('.publisher-suppliers').append(new Option(user['supplier_name'], user['supplier_id']));
      this.private_key_ppk = user['ssh_private_key'];
      this.cms_user_name = user['username'];
    }

    this.loadedForm = true;
  }

  getCmsUser() {
    return new Promise(resolve => {
      this.userMaintenanceService.getCmsUser(this.cms_user_id)
        .subscribe(res => {
          resolve(res);
        });
    });
  }

  getUserGroup() {
    this.userMaintenanceService.getUserRoles()
      .subscribe(res => {
        this.cms_user_roles = res;
      });
  }

  loadSupplierList() {
    $('.publisher-suppliers').select2({
      width: '100%',
      ajax: {

        url: `${this.apiUrl}/suppliers`,
        dataType: 'json',
        delay: 150,
        headers: { "Authorization": `Bearer ${this.currentUser.token}` },
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
      placeholder: 'Search for Publishers',
      allowClear: true,
      minimumInputLength: 2
    });
  }

  loadLibraryList() {
    var apiURL = `${this.apiUrl}/libraries-list`;
    var auth_token = `${this.currentUser.token}`;

    $('.institution-libraries').select2({
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

  updateCmsUser(e) {
    this.submitted = true;
    e.preventDefault();
    // stop here if form is invalid

    if (this.updateCmsUserForm.invalid) {
      return;
    }

    this.loading = true;
    var form_data = this.updateCmsUserForm.value;

    if(form_data.password == this.default_password ){
      form_data.password = '';
    }    

    if (this.cms_user_id) {
      this.userMaintenanceService.updateCmsUser(this.cms_user_id, form_data)

        .subscribe(
          data => {
            this.loading = false;            
            this.toastr.success('CMS User Updated.', 'Notification');
          },
          err => {
            this.loading = false;            
            this.toastr.warning(err, 'Notification');
          });

    }

    else {
      this.userMaintenanceService.createCmsUser(form_data)
        .subscribe(
          user => {
            this.loading = false;            
            this.toastr.success('CMS User Created.', 'Notification');

            $('button.close').click();
            this.router.navigate(['/cms_users/' + user.user_id]);            
          },
          err => {
            this.loading = false;            
            this.toastr.warning(err, 'Notification');
          });

    }
  }

  exportPPK(){    
    this.loading = true;
    let blob = new Blob([this.private_key_ppk], { type: 'text/csv' });
    saveAs(blob, this.cms_user_name + '.ppk');
    this.loading = false;
  }

  // convenience getter for easy access to form fields
  get f() { return this.updateCmsUserForm.controls; }

  /** get usr roles  */
  getAclUserRoles() {
    this.aclService.getUserRoles(Number(this.cms_user_id), Number(this.cms_role)).subscribe(res => {
       this.userRoles  = res.items;
      });
  }
  /** set new role */
  addMoreRoles(e, id) {
    let isChecked = e.currentTarget.checked ? 1 : 0;

    if (isChecked) {
      this.allowedRoles.push(Number(id));

    } else {
      // lets remove id in list
      for (let ndx in this.allowedRoles) {
        if (Number(this.allowedRoles[ndx]) == Number(id)) {
            this.allowedRoles.splice(Number(ndx), 1);
        }
      }
    }
    this.updateCmsUserForm.get('add_roles').setValue(this.allowedRoles);

  }

  onRemoveSpace()
  {
    this.username = this.username.replaceAll(' ', '');
  }
}
