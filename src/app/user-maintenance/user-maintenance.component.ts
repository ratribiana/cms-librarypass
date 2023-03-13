import { Component, OnInit } from '@angular/core';
import { UserMaintenanceService } from "../_services/user-maintenance.service";
import { map, tap } from "rxjs/operators";
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from "@angular/common/http";
import { AuthenticationService } from "../_services";
import { environment } from "../../environments/environment";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import {LibraryService} from "../_services/library.service";

@Component({
  selector: 'app-user-maintenance',
  templateUrl: './user-maintenance.component.html',
  styleUrls: ['./user-maintenance.component.css']
})
export class UserMaintenanceComponent implements OnInit {

  apiUrl = environment.apiEndpoint;
  createUserForm: UntypedFormGroup;
  searchForm:UntypedFormGroup;
  loading = false;
  dataLoaded = true;
  submitted = false;
  users: object;
  libraries: object;
  total: number;
  page: number = 1;
  limit: number = 25;
  allow_add_user: boolean = false;
  filter: string = '';
  currentUser = this.authenticationService.currentUserValue;
  is_admin = (this.currentUser.short_codes.includes('is_admin'));
  total_users_added: number = 0;
  library_id = this.currentUser.library_id;  
  institution_node = [];
  parent_institutions = [];        
  dropdownSettings = {};  
  singleDropdownSettings = {};
  selectedItems = [];
  library_name = '';
  is_parent = false;  

  constructor(
    private userService: UserMaintenanceService,
    private toastr: ToastrService,
    private authenticationService: AuthenticationService,
    private formBuilder: UntypedFormBuilder,
    private libraryService: LibraryService
  ) { }
  ngOnInit() {        
  
    if(this.is_admin){
      this.library_id = 0;
      this.getParentInstitutions();
    }
    else{      
      this.getInstitutionNode(
        {
          'id' : this.currentUser.library_id,
          'name' : this.currentUser.library_name,
          'lineage' : '1.1'
        }
      );      
    }    

    this.createUserForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.searchForm = this.formBuilder.group({
      libraries: []
    });
    
    this.check_user_can_upload(this.library_id);
    this.getLibraryList();
     
    this.dropdownSettings= {                  
      idField: 'id',
      textField: 'name',      
      allowSearchFilter: true,      
    };

    this.singleDropdownSettings= {                  
      singleSelection: true,
      closeDropDownOnSelection: true,
      idField: 'id',
      textField: 'name',      
      allowSearchFilter: true,      
    };

  }

  // convenience getter for easy access to form fields
  get f() { return this.createUserForm.controls; }

  check_user_can_upload(lib_id: number) {
    if (this.is_admin) {
      this.allow_add_user = true;
      return false;
    }
    this.userService.check_user_can_upload(lib_id)
      .subscribe(res => {
        this.allow_add_user = res;
      });
  }

  getParentInstitutions(){
    this.libraryService.getLibrariesList(0, 1)
     .subscribe(res => {      
     this.parent_institutions = res.items;      
    });
  }

  getInstitutionNode(item){
    this.library_id = item.id;
    this.is_parent = false;
    this.selectedItems = [item];    

    this.libraryService.getLibraryNodes(item.id)
    .subscribe(res => {  

      if(res.length > 1){
        this.is_parent = true;        
        this.selectedItems = res;
        this.institution_node = res;     
        this.library_id = 0; 
      }                                     
      this.getUserList(this.page, this.filter);                                    
    });
  }

  getItemStyle(text) {    
    let count = this.getItemLineage(text);
    let space = 0;

    space = (count*15);
    return {left: space+'px', marginRight: space+'px' };
  }

  getItemLineage(lineage) {
    let blocks = lineage.split('.');
    return (blocks.length) - 1;
  }

  getItemClass(data) {    
    const selff = this;
    let allData = this.institution_node.sort(this.sortFunction);
    let parentData = [];
    let newClass = '';

    allData.map(function(value) {
      let item = selff.selectedItems.filter(function(item) { 
        return item.id == value.id;
      });

      if(item.length > 0) {
        if(parentData.length > 0) {
          let isExist = false;
          for (const i in parentData) {
            if(value.lineage.substring(0, parentData[i].length) == parentData[i]) {
              isExist = true;
            }
          }

          if(!isExist) {
            parentData.push(value.lineage);
          }
        }
        else {
          parentData.push(value.lineage);
        }

        if(value.id == data.id) {
          if(!parentData.includes(data.lineage) && parentData.length>0) {
            newClass = 'd-none';
            $('.selected-item .d-none').closest('.selected-item').addClass('d-none');
          }
        }
      }

    });

    return newClass;
  }

  hideItemCount(lineage) {
    const num = this.getItemCount(lineage);
    return num==0;
  }

  getItemCountText(lineage) {
    const num = this.getItemCount(lineage);
    return '+'+num+' institution'+(num>1?'s':'');
  }

  getItemCount(lineage) {
    const selff = this;
    let allData = this.institution_node.sort(this.sortFunction);
    let oldItem;
    let num = 0;

    allData.map(function(value) {
      let item = selff.selectedItems.filter(function(item) { 
        return item.id == value.id && value.lineage.substring(0, lineage.length) == lineage;
      });

      if(item.length > 0) {
        if(oldItem == null) {
          oldItem = value;
          num++;
        }
        else {
          if(value.lineage.substring(0, oldItem.lineage.length) == oldItem.lineage) {
            num++;
          }
        }
      }
    });

    return num>0?num-1:num;
  }

  sortFunction(a, b) {
    if (a['lineage'].length === b['lineage'].length) {
      return 0;
    }
    else {
      return (a['lineage'].length < b['lineage'].length) ? -1 : 1;
    }
  }

  get getItems() {
    return this.institution_node.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
  }

  getUserList(page: number, filter: string = '') {    
    this.dataLoaded = false;        
    let ids = this.selectedItems.map(function(value) { return value['id']; });            
    let lib_ids = ids.join(",");    
    this.users = this.userService.getUsers(lib_ids, page, filter, this.limit)
      .pipe(tap(res => {
        this.total = res.total;
        this.page = page;
        this.dataLoaded = true;        
      }), map(res => res.items));      
  }

  onParentSelect(item){        
    this.getInstitutionNode(item);                    
  }

  resetParentInstitution(){         
    this.library_id = 0;
    this.is_parent = false;        
    this.selectedItems = [];
    this.institution_node = [];      
    
    this.getUserList(this.page, this.filter);  
  }

  onLibrariesDeSelect(selected){      
    this.library_id = 0;
    let result = this.getChildrenOption(selected.id);

    if(result.length > 1){      
      let removed_ids = result.map(function(value) { return value['id']; });    
      let remaining_items = this.selectedItems.filter(function(dat, i){
        return !removed_ids.includes(dat.id);
      });
     this.selectedItems = remaining_items;
    }

    if(this.selectedItems.length == 1 && result.length <= 1){
      this.library_id = this.selectedItems[0].id;      
    }    
        
    this.getUserList(this.page, this.filter);  
  }

  onLibrariesSelect(item){    
    this.library_id = 0;
    let result = this.getChildrenOption(item.id);

    if(result.length > 1){      
      let existing_ids = this.selectedItems.map(function(value) { return value['id']; });    
      let items_to_add = result.filter(function(dat, i){
        return !existing_ids.includes(dat.id);
      });

      this.selectedItems = [...this.selectedItems, ...items_to_add];                        
    }

    if(this.selectedItems.length == 1 && result.length <= 1){
      this.library_id = item.id;
    }
        
    this.getUserList(this.page, this.filter);      
  }


  onLibrariesSelectAll(libraries){
    let lib = libraries;    
    this.getUserList(this.page, this.filter);      
  }

  getChildrenOption(selected_id){
    let __FOUND = this.institution_node.findIndex(function(post, index) {          
      if(post.id == selected_id)
      return true;
    });
  
    let line = this.institution_node[__FOUND]['lineage'];    
    let result = this.institution_node.filter(function(dat, i){
      return (dat.lineage.startsWith(line) && dat.id != selected_id);
    });

    return result;
  }

  deleteUser(e, userid: string) {
    let row = e.target.parentNode.parentNode;
    let r = confirm("Delete User?");
    if (r == true) {
      this.userService.deleteUser(userid)
        .subscribe(
          data => {            
            this.toastr.success('Successfully Deleted User.', 'Notification');
            row.remove();
            //this.getUserList(this.library_id, this.page, this.filter);            
          },
          (error: HttpErrorResponse) => {
            console.log(error.message);
          });
    }
  }

  updateUserPassword(e, userid) {
    let password = e.target.previousSibling.value;

    this.userService.setUserPassword(userid, password)
      .subscribe(
        data => {          
          this.toastr.success('Successfully Updated User Password.', 'Notification');
        },
        (error: HttpErrorResponse) => {
          console.log(error.message);
        });
  }

  updateUserStatus(e, userid: string) {
    let is_checked = e.currentTarget.checked ? 1 : 0;

    this.userService.setUserStatus(userid, is_checked)
      .subscribe(
        data => {          
          this.toastr.success('Successfully Updated User Status.', 'Notification');
        },
        (error: HttpErrorResponse) => {
          console.log(error.message);
        });
  }

  
  uploaduserCSV(files: FileList) {
    if (files && files.length > 0) {
      let file: File = files.item(0);
      let allowedExtensions = /(\.csv)$/i;

      if (!allowedExtensions.exec(file.name)) {
        this.toastr.warning('Please Upload a valid CSV file.', 'Notification');        
        return false;
      }

      let reader: FileReader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        let csv: string = reader.result as string;
        this.total_users_added = 0;

        const userList = csv.split('\r\n');

        if (userList[0] == 'Username/Email,Password')
        {
          userList.splice(0, 1); // remove header column
        }
        
        this.addUsers(userList);
      }
    }

    return false;
  }

  filterbyUsername(e) {
    this.filter = e.target.value;
    
    this.getUserList(this.page, this.filter);
  }

  addUsers(users, single_user: boolean = false)
  {
    // if no more users to be added
    if (users.length < 1)
    {
      // call this first then display the message while waiting for its data
      this.getUserList(this.page, this.filter);

      let message: string = '';

      if (this.total_users_added > 0)
      {
        message += `${this.total_users_added} New User/s Successfully Uploaded.`;
      }
      
      this.showSuccessMessage(message);      
      this.loading = false;
      this.total_users_added = 0;

      return;
    }

    // get atleast 200 users at a time
    let selected_users = users.splice(0, 200);

    this.userService.addUsers(this.library_id, selected_users, single_user)
    .subscribe(
      data => 
      {
        this.total_users_added +=  data.total;

        // send remaining users
        this.addUsers(users);
      },
      err => 
      {
        this.showFailMessage(err);
        this.loading = false;
      });
  }

  showSuccessMessage(message: string = '')
  {
    this.toastr.success(message, 'Notification');

    if ($('#addUserModal').is(':visible')) 
    {
      $('#addUserModal .close').click();
    }
  }

  showFailMessage(err: any)
  {
    this.toastr.warning(err, 'Notification');

    if ($('#addUserModal').is(':visible')) 
    {
      $('#addUserModal .close').click();
    }
  }

  loadUserCreate() {    
    this.createUserForm.reset();
  }

  createSingleUser(e) {
    this.submitted = true;
    e.preventDefault();
    // stop here if form is invalid
    if (this.createUserForm.invalid) {
      return;
    }

    this.loading = true;

    this.addUsers([`${this.f.username.value},${this.f.password.value}`], true);
  }

  getLibraryList() {
    this.userService.getLibraries()
      .subscribe(res => {
        this.libraries = res.items;
      });
  }


}
