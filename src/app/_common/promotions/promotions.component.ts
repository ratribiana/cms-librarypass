import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import {PromotionsService} from "../_services/promotions.service";
import {MiscService} from "../_services/misc.service";
import { AuthenticationService } from "../_services";
import { LibraryService } from "../_services/library.service";
import { HttpErrorResponse } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { DataTableDirective } from 'angular-datatables';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.css']
})
export class PromotionsComponent implements OnInit {
  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;
  
  dtOptions: any = {};  
  createPromotionForm: UntypedFormGroup;
  apiUrl = environment.apiEndpoint;
  promotions: [];
  table: any;
  currentUser = this.authenticationService.currentUserValue;
  library_id = this.currentUser.library_id;
  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
  loading = false;
  dataLoaded = false;
  submitted = false; 
  multiSelectClicked = false; 
  languages = [];
  age_ratings = [];
  fileData = null;    
  checked_promotions = []; 
  libraries = [];
  is_reordered = false; 
  page_url = this.router.url;
  page_type = this.page_url.split('/')[1].slice(0,-1);
  page_title = 'Banner';
  banner_image = '';
  dropdownSettings = {};  
  is_admin = (this.currentUser.short_codes.includes('is_admin'));

  constructor(
    private libraryService: LibraryService, 
    private promotionsService: PromotionsService,     
    private authenticationService: AuthenticationService,
    private formBuilder: UntypedFormBuilder,
    private misc: MiscService,
    private toastr: ToastrService,
    private router : Router
  ) { }

  ngOnInit() {    
    var self = this;
    this.page_title = this.page_type == 'drawer' ? 'Drawer' : 'Banner';

    this.libraryService.getContentRatings().subscribe(data => {      
      this.age_ratings = data;       
    });

    // this.misc.getLanguagesList().subscribe(data => {      
    //   this.languages = data;       
    // });
    
    this.getLibraryList();

    this.dropdownSettings= {
      singleSelection: true,
      closeDropDownOnSelection: true,
      idField: 'id',
      textField: 'name',      
      allowSearchFilter: true
  };   
    
    this.createPromotionForm = this.formBuilder.group({
      name: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],      
      language_id: [''],
      content_rating_id: [''],
      content_url: ['',[ Validators.pattern('^https?://([\\w\\d]+\.)?librarypass\.com$')] ],
      promo_image: ['']
    });

    this.initPromotionsTable();
    this.loadPromotionsList(this.library_id, this.page_type);      
  }

  ngAfterViewInit(): void {
    var self = this;
    $('#promotions_table').on( 'row-reordered.dt', function ( e, diff, edit ) {
      self.is_reordered = true;    

      // change sort number on table re-order 
      $('#promotions_table').one('draw.dt', function() {
        $(this).find('.reorder').map(function() {
          var order = $(this).closest('tr').index()+1;
          $(this).find('.reorder-number').text(order);
        });
      });

    } );        
  }
  
  handleFileInput(event) {
    if(event.target.files && event.target.files.length) {
      this.fileData = event.target.files.item(0);    
      const reader = new FileReader();  
      
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {   
        this.banner_image = reader.result as string;        
      }
      
    }
  }

  onLibrarySelect(item: any){                    
    this.library_id = parseInt(item.id);    
    this.dataLoaded = false;
    this.rerender();

  }

  onLibraryDeSelect(item: any){        
    this.library_id = null;   
    this.dataLoaded = false;
    this.rerender();
  }

  loadPromotionsList(library_id, page_type){    
    this.promotionsService.getPromotionsList(library_id, page_type)
    .subscribe(data => {
      this.promotions = data.data;
      // Calling the DT trigger to manually render the table                
      this.dtTrigger.next();   
      this.dataLoaded = true;
    }); 
  }

  getLibraryList(){
    this.libraryService.getLibrariesList()
    .subscribe(res => {
      this.libraries = res.items;      
    });
  }

  initPromotionsTable(): void{
    let total_info = this.library_id ? "_TOTAL_ of 50 Maximum Promotions" : "";
    this.dtOptions = {
      paging : false,
      searching : false,
      language: {
        'info': total_info,
      },
      columns: [
      {       
        data: 'sort_number_data',
        visible: false
      },
      {
        title: 'Sort',
        data: 'sort_number',
        orderable: false
      }, 
      {
        title: 'Name',
        data: 'name',
        orderable: false
      }, 
      {
        title: 'Start Date',
        data: 'start_date',
        orderable: false
      },
      {
        title: 'End Date',
        data: 'end_date',
        orderable: false
      },
      {       
        data: 'id',
        visible: false
      },
      {
        title: 'Active',
        orderable: false
      },
      {
        title: 'Select',
        orderable: false
      },
      {
        title: 'Actions',
        orderable: false
      }      
      
    ],
      rowReorder: {
        dataSrc: 'sort_number_data',
        update: true,        
        selector: 'tbody tr .reorder'
        // editor:  editor
      },

      
      drawCallback: () => {
        var api = new $.fn.dataTable.Api( '#promotions_table' );
 
        // Output the data for the visible rows to the browser's console      
        if(this.is_reordered){
          let sorted_params = [];

          api.rows({page:'current'}).every( function ( rowIdx, tableLoop, rowLoop ) {
            var data = this.data();
            sorted_params.push(data['id']);            
          } );

          this.sortPromotions(sorted_params);
        }
        
      },

      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        const self = this;
        // Unbind first in order to avoid any duplicate handler
        // (see https://github.com/l-lin/angular-datatables/issues/87)

        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          // console.log(this.persons);
        });
        return row;
      }
    };
  }

  updatePromotionStatus(e, promotionid) {  
    let is_checked = e.currentTarget.checked ? 1 : 0;        
    
    e.target.parentElement.parentElement.classList.toggle('expired');
    this.promotionsService.setPromotionStatus(promotionid, is_checked)
      .subscribe(
        data => {          
          this.toastr.success('Successfully Updated Promotion Status.', 'Notification');
        },
        err => {      
          e.target.checked = false;          
          this.toastr.error(err, 'Error', {
            timeOut: 5000,
          });
        });
  }

  showMultipleActionsButton(e) {
    let selected_promotions = [];
    $.each($("input[name='deleted_promotions']:checked"), function(){            
      selected_promotions.push($(this).val());
    });

    this.checked_promotions = selected_promotions;

    if(this.checked_promotions.length > 0) {      
      this.multiSelectClicked = true;
    }
    else{
      this.multiSelectClicked = false;
    }    
  }

  deletePromotions(e) {  
    let r = confirm("Delete Selected Promotions?");
    if (r == true) {
      this.promotionsService.deleteSelectedPromotions(this.checked_promotions)
          .subscribe(
              data => {                                
                this.toastr.success('Successfully Deleted Selected Promotions.', 'Notification');
                this.dataLoaded = false;
                this.multiSelectClicked = false;
                this.sortAfterDelete(this.checked_promotions);
              },
              err => {          
                console.log(err.message);
              });
    }
  }

  deletePromotion(e, id) {
    e.preventDefault();    
    // let row = e.target.parentNode.parentNode;
    let r = confirm("Delete Promotion?");
    if (r == true) {
      this.promotionsService.deletePromotion(id)
          .subscribe(
              data => {                
                this.toastr.success('Successfully Deleted the Promotion.', 'Notification');
                this.sortAfterDelete(id);
              },
              err => {          
                console.log(err.message);
              });
    }
  } 

  editPromotion(e, id) {
    e.preventDefault();    
    this.router.navigate(['/' + this.page_url + '/' + id ]);
  }
  
  async sortPromotions(data){ 
    await this.savePromotionsSort(data);       
  }

  async sortAfterDelete(deleted_ids){
    let api = new $.fn.dataTable.Api( '#promotions_table' );               
    let sorted_params = [];
      
    if(typeof deleted_ids != 'object'){
      deleted_ids = [deleted_ids];
    }
 
    api.rows({page:'current'}).every( function ( rowIdx, tableLoop, rowLoop ) {
      var data = this.data();      

      if(jQuery.inArray(data['id'], deleted_ids) === -1) {
          sorted_params.push(data['id']);            
      }
                       
    } );
      await this.savePromotionsSort(sorted_params);                 
      this.rerender();
  }
  
  savePromotionsSort = function(data){           
    return new Promise(resolve => {
      setTimeout(() => this.promotionsService.updatePromotionSort(data)
        .subscribe( data => {
          this.toastr.success('Promotions Sort Updated.', 'Notification');       
          resolve(1);
        }), 500);      
    });     
  }

  rerender(){
    var api = new $.fn.dataTable.Api( '#promotions_table' );
    api.destroy();                                 
    this.loadPromotionsList(this.library_id, this.page_type);
  }

  createPromotions(e) {
    this.submitted = true;
    e.preventDefault();    
    // stop here if form is invalid
    if (this.createPromotionForm.invalid) {
      return;
    }

    this.loading = true;
    var form_data = this.createPromotionForm.value;    
    form_data.start_date = moment(form_data.start_date).format("YYYY-MM-DD HH:mm:ss");
    form_data.end_date = moment(form_data.end_date).format("YYYY-MM-DD HH:mm:ss");
    form_data.type = this.page_type;

    if(this.library_id){
      form_data.library_id = this.library_id.toString();
    }
    
    let formData = form_data;
            
    if(this.fileData){

      formData = new FormData();

      formData.append('promo_image', this.fileData, this.fileData.name);
      formData.append('promo_image_file', this.fileData.name);

      formData.append('name', form_data.name);

      if(form_data.start_date){            
        formData.append('start_date', form_data.start_date);
      }
  
      if(form_data.end_date){      
        formData.append('end_date', form_data.end_date);
      }
  
      if(form_data.content_url){         
        formData.append('content_url', form_data.content_url);
      }
    
      if(this.library_id){
        formData.append('library_id', this.library_id.toString());
      }
      
      formData.append('type', form_data.type);
  
      if(form_data.language_id){
        formData.append('language_id', form_data.language_id.toString());
      }

      if(form_data.content_rating_id){
        formData.append('content_rating_id', form_data.content_rating_id.toString());
      }
      
    }    
        

    this.promotionsService.addPromotions(formData)
      .subscribe(
        data => {                    
          this.loading = false;                    
          this.toastr.success('Promotions Created.', 'Notification');
          $('button.close').click();
          this.router.navigate(['/' + this.page_url + '/' + data ]);
        },
        err => {                    
          this.loading = false;                    
          this.toastr.error(err, 'Error', {
            timeOut: 5000,
          });
        });
    
  }

  // convenience getter for easy access to form fields
  get f() { return this.createPromotionForm.controls; }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

}
