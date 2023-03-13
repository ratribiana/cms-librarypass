import { Component, OnInit,ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {PromotionsService} from "../../_services/promotions.service";
import { environment } from "../../../environments/environment";
import { AuthenticationService } from "../../_services";
import { LibraryService } from "../../_services/library.service";
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ActivatedRoute } from "@angular/router";
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-promotion-detail',
  templateUrl: './promotion-detail.component.html',
  styleUrls: ['./promotion-detail.component.css']
})
export class PromotionDetailComponent implements OnInit {
  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;

  products: any = [];  
  dtOptions: any = {};  
  createPromotionForm: FormGroup;
  dtTrigger: Subject<any> = new Subject<void>();
  dropdownSettings = {};  
  apiUrl = environment.apiEndpoint;
  currentUser = this.authenticationService.currentUserValue;  
  library_id = this.currentUser.library_id;
  languages = [];
  age_ratings = [];
  is_reordered = false; 
  fileData = null;  
  dataLoaded = false;
  productsLoaded = false;
  multiSelectClicked = false;
  checked_books = [];
  loading = false;
  submitted = false;  
  promotion_id = null;  
  page_url = this.router.url;
  page_type = this.page_url.split('/')[1];
  page_title = 'Banner';
  banner_image = '';  
  drawer_link = 'https://lpfullcontent.librarypass.com/products/sort:selling/order:0/promotion:';
  is_admin = (this.currentUser.short_codes.includes('is_admin'));

  constructor( 
    private libraryService: LibraryService, 
    private promotionsService: PromotionsService,     
    private router: Router, 
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,    
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {    
    var self = this;        
    this.page_title = this.page_type == 'drawers' ? 'Drawer' : 'Banner';

    this.libraryService.getContentRatings().subscribe(data => {      
      this.age_ratings = data;       
    });
    
    // this.misc.getLanguagesList().subscribe(data => {      
    //   this.languages = data;       
    // });

    this.initPromotionsForm();

    this.activatedRoute.params.subscribe(params => {      
      this.promotion_id = params['id']; // (+) converts string 'id' to a number    
    });

    this.loadPromotionsData();
  }

  resetProductsTable(){        
    this.productsLoaded = false;    
    this.rerender();
    this.drawProductsTable();         
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

  loadPromotionsData(){
    this.promotionsService.getPromotion(this.promotion_id)
    .subscribe(data => {
  
      if(!data || (this.library_id != null && data['library_id'] != this.library_id)) {
        this.router.navigate(['/' + this.page_type ]);
        return false;
      }
      this.drawer_link = this.drawer_link + data['id'];
      this.setPromotionsForm(data);      
      
      if(this.page_type == 'drawers'){      
        // this.initProductSelect();        
        this.initProductsTable();
        this.drawProductsTable();
      }   

      this.dataLoaded = true;    
    });  
  }

  initPromotionsForm() {
    this.createPromotionForm = this.formBuilder.group({
      name: ['', Validators.required],
      start_date: [''],
      end_date: [''],      
      language_id: [''],
      content_rating_id: [''],
      content_url: ['',[ Validators.pattern('^https?://([\\w\\d]+\.)?librarypass\.com$')] ],
      promo_image: ['']
    });
  }

  setPromotionsForm(promotion) {
    
    if(promotion['promo_image_file']){
      this.banner_image = promotion['promo_image_url'];       
    }
    let start_date = promotion['start_date'] ? new Date(promotion['start_date']) : '';
    let end_date = promotion['end_date'] ? new Date(promotion['end_date']) : '';

    this.createPromotionForm.setValue({      
      name: promotion['name'],
      start_date: start_date,
      end_date: end_date,
      language_id: promotion['language_id'],
      content_rating_id: promotion['content_rating_id'],
      content_url: promotion['content_url'],
      promo_image: ''
    });    
  }

  async sortPromotionProducts(data){ 
    await this.saveProductsSort(data);       
  }

  async sortAfterDelete(deleted_ids){
    let api = new $.fn.dataTable.Api( '#promotions_products_table' );               
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
      await this.saveProductsSort(sorted_params);                 
      this.resetProductsTable();
  }

  saveProductsSort = function(data){           
    return new Promise(resolve => {
      setTimeout(() => this.promotionsService.updatePromotionProductsSort(data)
        .subscribe( data => {
          this.toastr.success('Products Sort Updated.', 'Notification');       
          resolve(1);
        }), 500);      
    });     
  }

  async drawProductsTable(){    
    this.products = await this.getProductsForPromotions();       
    this.dtTrigger.next(void 0);   
    this.productsLoaded = true;       
  }

  getProductsForPromotions() {
    return new Promise(resolve => {
      this.promotionsService.getPromotionProducts(this.promotion_id)
        .subscribe(res => {
          resolve(res.data);
        });
    });
  }

  initProductsTable(){
    let total_info = this.library_id ? "_TOTAL_ of 50 Maximum Books" : "";
    this.dtOptions = {
      paging : false,
      searching : false,
      language: {
        'info': total_info,
      },
      columns: [
      {
        title: 'Sort',
        data: 'sort_number',
        orderable: false
      }, 
      {
        title: 'Cover',
        data: 'image',
        orderable: false
      }, 
      {
        title: 'Name',
        data: 'name',
        orderable: false
      }, 
      {
        title: 'Bundle Name',
        data: 'bundle_name',
        orderable: false
      },
      {       
        data: 'id',
        visible: false
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
        dataSrc: 'sort_number',
        update: true,        
        //selector: 'td'
        // editor:  editor
      },
      
      drawCallback: () => {
        let api = new $.fn.dataTable.Api( '#promotions_products_table' );
 
        // Output the data for the visible rows1 to the browser's console      
        if(this.is_reordered){
          let sorted_params = [];

          api.rows({page:'current'}).every( function ( rowIdx, tableLoop, rowLoop ) {
            var data = this.data();
            sorted_params.push(data['id']);            
          } );

          this.sortPromotionProducts(sorted_params);
        }
        
      },

      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        // const self = this;
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


  initProductSelect(){
    $('.drawer-promotions-table').select2({
      width: 'resolve',      
      ajax: {

        url: `${this.apiUrl}/products?library_id=${this.library_id}`,
        dataType: 'json',
        delay: 150,
        headers: { "Authorization": `Bearer ${this.currentUser.token}` },
        data: function (params: any) {
          return {
            q: params.term,
            page: params.page
          };
        },
        processResults: function (data: any, params: any) {
          params.page = params.page || 1;
              
          return {
            results: data.items,
            pagination: {
              more: (params.page * 15) < data.total_count
            }
          };
        },
        cache: true    
      },

      templateResult: function (data: any){

        if (data.loading) {
          return data.text;
        }
        
        let $container = $(
          "<div class='select2-result-repository clearfix'>" +
            "<div class='select2-result-repository__avatar' style='float: left; width: 30px; margin-right: 10px;'>" +
            "<img src='" + data.product_image_url + "' /></div>" +
            "<div class='select2-result-repository__meta'>" +
              "<div class='select2-result-repository__title'>" + data.text + "</div>" +                    
            "</div>" +
          "</div>"
        );
                  
        return $container;
      },        
      placeholder: 'Search for Products',
      allowClear: true,
      minimumInputLength: 2
    });
  }

  ngAfterViewInit(): void {
    var self = this;
    $('#promotions_products_table').on( 'row-reordered.dt', function ( e, diff, edit ) {
      self.is_reordered = true;    
    } );        
  }  

  showMultipleActionsButton(e) {
    let selected_books = [];
    $.each($("input[name='deleted_books']:checked"), function(){            
      selected_books.push($(this).val());
    });

    this.checked_books = selected_books;

    if(this.checked_books.length > 0) {      
      this.multiSelectClicked = true;
    }
    else{
      this.multiSelectClicked = false;
    }    
  }

  deleteSelectedBooks(e) {  
    let r = confirm("Delete Selected Books?");
    if (r == true) {
      this.promotionsService.deleteSelectedProducts(this.checked_books)
          .subscribe(
              data => {                                
                this.toastr.success('Successfully Deleted Selected Books.', 'Notification');
                this.multiSelectClicked = false;                
                this.sortAfterDelete(this.checked_books);
              },
              err => {          
                console.log(err.message);
              });
    }
  }

  deleteProduct(e, id) {
    // let row = e.target.parentNode.parentNode;
    
    let r = confirm("Delete Book from list?");
    if (r == true) {
      this.promotionsService.deletePromotionProduct(id)
          .subscribe(
              data => {
                this.toastr.success('Successfully Deleted the Product.', 'Notification');                            
                this.sortAfterDelete(id);
              },
              err => {          
                console.log(err.message);
              });
    }

    
  }

  rerender(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();      
    });
  }

  addPromotionProducts(){    
    let selected_products = $('.drawer-promotions-table').val();

    if(selected_products === undefined || Object.keys(selected_products).length  == 0) {      
      return false;
    }
        
    this.promotionsService.addPromotionProducts(this.promotion_id, {'products' : selected_products })
    .subscribe(
      data => {                     
        $('.drawer-promotions-table').val(null).trigger('change');     
        this.rerender();
        this.drawProductsTable();        
        this.toastr.success('Products added.', 'Notification');
      },
      err => {                              
        this.toastr.error(err, 'Error', {
          timeOut: 5000,
        });
      });
  }

  // convenience getter for easy access to form fields
  get f() { return this.createPromotionForm.controls; }

  deletePromotion(e, id) {    
    e.preventDefault();    
    let r = confirm("Delete Promotion?");
    if (r == true) {
      this.promotionsService.deletePromotion(id)
        .subscribe(
            data => {              
              this.toastr.success('Successfully Deleted the Promotion.', 'Notification');
              this.router.navigate(['/' + this.page_type ]);
            },
            err => {          
              console.log(err.message);
        });
    }
  } 

  updatePromotions(e) {
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

    let formData = form_data;
            
    if(this.fileData){
      formData = new FormData();      
      
      formData.set('promo_image', this.fileData, this.fileData.name);      
      formData.set('promo_image_file', this.fileData.name);
    
      formData.set('name', form_data.name);

      if(this.library_id) {
        formData.set('library_id', this.library_id.toString());  
      }

      if(form_data.start_date){            
        formData.set('start_date', form_data.start_date);
      }
  
      if(form_data.end_date){      
        formData.set('end_date', form_data.end_date);
      }
  
      if(form_data.content_url){         
        formData.set('content_url', form_data.content_url);
      }    
  
      if(form_data.language_id){
        formData.set('language_id', form_data.language_id.toString());
      }     

      if(form_data.content_rating_id){
        formData.append('content_rating_id', form_data.content_rating_id.toString());
      }   
            
    }    
             
    this.promotionsService.updatePromotions(this.promotion_id, formData)
      .subscribe(
        data => {    
          console.log(data);
          this.loading = false;        
          this.toastr.success('Promotions Updated', 'Notification');
        },
        err => {            
          console.log(err);        
          this.loading = false;                    

          this.toastr.error(err, 'Error', {
            timeOut: 5000,
          });
        });
    
  }
}
