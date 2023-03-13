import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from "../../environments/environment";
import { AuthenticationService } from "../_services";
import {LibraryService} from "../_services/library.service"
import { LibrarianStatementComponent } from "./librarian-statement/librarian-statement.component";
import { LibrarianActivityComponent } from "./librarian-activity/librarian-activity.component";
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-librarian',
  templateUrl: './librarian.component.html',
  styleUrls: ['./librarian.component.css']
})
export class LibrarianComponent implements OnInit {

  searchForm:UntypedFormGroup;
  apiUrl = environment.apiEndpoint;
  currentUser = this.authenticationService.currentUserValue;
  library_ids = [];
  library_id = this.currentUser.library_id;  
  is_admin = (this.currentUser.short_codes.includes('is_admin'));
  dropdownSettings = {};     
  dropdownSingleSelect = {} 
  selectedItems = [];
  parent_institutions = [];  
  delayTimer;
  page: number = 1;
  show_patron_info = this.currentUser.show_patron_info == 0 ? 0 : 1;
  is_parent = false;
  institution_node = [];    

  @ViewChild(LibrarianStatementComponent) statement_cmpt: LibrarianStatementComponent;
  @ViewChild(LibrarianActivityComponent) activity_cmpt: LibrarianActivityComponent;

  constructor(
    private authenticationService: AuthenticationService,
    private libraryService: LibraryService,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit() {    
     
    this.dropdownSettings= {            
      idField: 'id',
      textField: 'name',      
      allowSearchFilter: true  
    };

    this.dropdownSingleSelect= {      
      closeDropDownOnSelection: true,
      idField: 'id',
      textField: 'name',      
      allowSearchFilter: true,
      singleSelection: true,
    };

    if(this.is_admin){               
      this.library_id = 0;
      this.getParentInstitutions();      
      this.displayReports([]);    
    }
    else{
      this.getInstitutionNode();   
    }        

    this.searchForm = this.fb.group({
      libraries: []
    });
  }

  getInstitutionNode(){
    this.is_parent = false;
    this.libraryService.getLibraryNodes(this.library_id)
    .subscribe(res => {  

      if(res.length > 1){
        this.is_parent = true;        
        this.selectedItems = res;
        this.institution_node = res;      
      }
            
      let ids = res.map(function(value) { return value['id']; });                  
      this.displayReports(ids);            
    });
  }

  getParentInstitutions(){
    this.libraryService.getLibrariesList(0)
     .subscribe(res => {      
     this.parent_institutions = res.items;      
    });
  }

  resetParentInstitution(event){    
    event.preventDefault();
    this.is_parent = false;        
    this.selectedItems = [];
    this.library_ids = [];
    this.institution_node = [];          
    this.library_id = 0;
    this.displayReports([]);    
  }

  onLibrariesSelectAll(libraries){
    let lib = libraries;
    let ids = lib.map(function(value) { return value['id']; });    
    this.delayedDisplayReports(ids);
  }

  onLibrariesDeSelect(selected){        
    let result = this.getChildrenOption(selected.id);

    if(result.length > 1){      
      let removed_ids = result.map(function(value) { return value['id']; });    
      let remaining_items = this.selectedItems.filter(function(dat, i){
        return !removed_ids.includes(dat.id);
      });
     this.selectedItems = remaining_items;
    }
    
    let ids = this.selectedItems.map(function(value) { return value['id']; });    
    this.delayedDisplayReports(ids);
  }

  onLibrariesSelect(selected){       
    let result = this.getChildrenOption(selected.id);    

    if(result.length > 1){      
      let existing_ids = this.selectedItems.map(function(value) { return value['id']; });    
      let items_to_add = result.filter(function(dat, i){
        return !existing_ids.includes(dat.id);
      });

      this.selectedItems = [...this.selectedItems, ...items_to_add];                  
    }
    
    let ids = this.selectedItems.map(function(value) { return value['id']; });            
    // ids = ids.filter((c, index) => {
    //   return ids.indexOf(c) === index;
    // });
    this.delayedDisplayReports(ids);
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

    
  delayedDisplayReports(ids){
    let $this = this;    
    clearTimeout(this.delayTimer);
    this.delayTimer = setTimeout(function() {                   
      $this.displayReports(ids);      
    }, 1500); // Will do the ajax stuff after 1000 ms, or 1 s
  }

  onParentSelect(item){    
    this.library_id = item.id;    
    this.getInstitutionNode();          
  }

  displayReports(library_ids){       
    this.library_ids = library_ids;     
    this.statement_cmpt.getLibrarianStatementReports(library_ids, this.page);
    this.activity_cmpt.getLibrarianActivityReport(library_ids, this.page);    
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

}
