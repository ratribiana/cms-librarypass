import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LibraryService, ProductsService} from "../../_services";
import * as moment from 'moment';

@Component({
  selector: 'app-pricing-availability',
  templateUrl: './pricing-availability.component.html',
  styleUrls: ['./pricing-availability.component.css']
})
export class PricingAvailabilityComponent implements OnInit {
  @Input() product_id;

  priceTiersDropdown = {};
  contentRatingsDropdown = {};
  libraryPriceTiersDropdown = {};
  previousPriceTiersDropdown = {};
  disableLibraryPriceTier = true;
  hideElementNotNeeded = true;

  priceTiers = [];
  contentRatings = [];
  libraryPriceTiers = [];
  previousPriceTiers = [];



  detailForm = new FormGroup({
    available_date: new FormControl(''),
    print_on_sale_date: new FormControl(''),
    price_tier_id: new FormControl(0),
    library_content_rating_id: new FormControl([]),
    active: new FormControl(0),
    web: new FormControl(0),
    subscription: new FormControl(0),
    rental_allowed: new FormControl(0),
    drm_free: new FormControl(0),
    price_change_date: new FormControl(''),
    previous_price_tier_id: new FormControl(0),
    mature: new FormControl(0),
    adult: new FormControl(0),
    tapjoy: new FormControl(0),
    library: new FormControl(0),
    library_price_tier_id: new FormControl(0)
  });

  constructor(
    private productService: ProductsService,
    private libraryService: LibraryService
    ) { }

  ngOnInit() {

    this.initDropdownSetting();

    if (this.product_id > 0) {
      this.initPriceTiersData(null);
    }
  }

  resetValue() {
    this.detailForm.reset(this.detailForm.value);
    this.product_id = 0;
  }

  saveDraft(){
    // lets make sure product id is present
    if (this.product_id) {
      let postData = this.detailForm.value;
      // lets format the date time to standard
      postData.available_date = moment(this.detailForm.get('available_date').value).format('YYYY-MM-DD HH:mm:ss');
      postData.print_on_sale_date = moment(this.detailForm.get('print_on_sale_date').value).format('YYYY-MM-DD HH:mm:ss');
      postData.price_change_date = moment(this.detailForm.get('price_change_date').value).format('YYYY-MM-DD HH:mm:ss');
      postData.library_content_rating_id = this.detailForm.get('library_content_rating_id').value[0].id;
      postData.price_tier_id = this.detailForm.get('price_tier_id').value[0].id;
      postData.previous_price_tier_id = this.detailForm.get('previous_price_tier_id').value[0].id;
      postData.library_price_tier_id = this.detailForm.get('library_price_tier_id').value[0].id;

      this.productService.updateProductPricingAvailability(this.product_id, postData)
      .subscribe(
        data => {
          this.product_id = data.id;
        },
        err => {});
    } 
  }


  initPriceTiersData(productId) {
    if (productId) {
      this.product_id = productId;
    }
      this.getPriceTiersList();
      this.getContentRatingsList();
      this.getLibraryPriceTiersList();
      this.getProduct();
  }

  // lets get product
  getProduct(){
     return new Promise(resolve => {

        this.productService.getProduct(this.product_id).subscribe(res => {

          this.detailForm.setValue({
          available_date: new Date(res.available_date),
          print_on_sale_date: res.print_on_sale_date ? new Date(res.print_on_sale_date): null ,
          price_tier_id: [this.searchPriceTier(parseInt(res.price_tier_id))],
          library_content_rating_id: [this.searchContentRating(parseInt(res.library_content_rating_id))],
          active: parseInt(res.active),
          web: parseInt(res.web),
          subscription: parseInt(res.subscription),
          rental_allowed: parseInt(res.rental_allowed),
          drm_free: parseInt(res.drm_free),
          price_change_date: res.price_change_date ? new Date(res.price_change_date): null,
          previous_price_tier_id: [this.searchPriceTier(parseInt(res.previous_price_tier_id))],
          mature: parseInt(res.mature),
          adult: parseInt(res.adult),
          tapjoy: parseInt(res.tapjoy),
          library: parseInt(res.library),
          library_price_tier_id: parseInt(res.library) ==0 ? null : [this.searchLibraryPriceTier(parseInt(res.library_price_tier_id))]
        });
          document.dispatchEvent(new MouseEvent('click'));
          resolve(res);
        });
      });
  }

  initDropdownSetting() {
    this.priceTiersDropdown= {
        singleSelection: true,
        closeDropDownOnSelection: true,
        idField: 'id',
        textField: 'name',      
        allowSearchFilter: true
    };

    this.contentRatingsDropdown= {
        singleSelection: true,
        closeDropDownOnSelection: true,
        idField: 'id',
        textField: 'name',      
        allowSearchFilter: true
    };

    this.libraryPriceTiersDropdown= {
        singleSelection: true,
        closeDropDownOnSelection: true,
        idField: 'id',
        textField: 'name',      
        allowSearchFilter: true
    };

    this.previousPriceTiersDropdown= {
        singleSelection: true,
        closeDropDownOnSelection: true,
        idField: 'id',
        textField: 'name',      
        allowSearchFilter: true
    };
  }

  //-- START PRICE TIER DROPDOQN
  getPriceTiersList(){
    return new Promise(resolve => {
    this.productService.getPriceTiers()
      .subscribe(res => {
        this.priceTiers = res.items;  
        this.previousPriceTiers = res.items;  
         resolve(res);    
      });
       });
  }

  searchPriceTier(id) {
    let result = {};
    this.priceTiers.forEach(rec =>{
          if(rec.id == id){
            result = rec;
            return rec;
          }
      });

      return result;
  }
 //-- END PRICE TIER DROPDOQN

  //-- START CONTENT RATING DROPDOQN
  getContentRatingsList(){
    return new Promise(resolve => {
    this.productService.getContentRatings()
      .subscribe(res => {
        this.contentRatings = res.items;  
         resolve(res);    
      });
       });
  }

  searchContentRating(id) {
    let result = {};
    this.contentRatings.forEach(rec =>{
          if(rec.id == id){
            result = rec;
            return rec;
          }
      });

      return result;
  }
  //-- END CONTENT RATING DROPDOQN

  //-- START LIBRARY PRICE TIER DROPDOQN
  getLibraryPriceTiersList(){
    return new Promise(resolve => {
    this.libraryService.getPriceTiers()
      .subscribe(res => {
        this.libraryPriceTiers = res;  
         resolve(res);    
      });
       });
  }

  searchLibraryPriceTier(id) {
    let result = {};
    this.libraryPriceTiers.forEach(rec =>{
          if(rec.id == id){
            result = rec;
            return rec;
          }
      });

      return result;
  }

  onChangeLibraryPriceTier(event) {
    this.disableLibraryPriceTier = !event.target.checked;
  }
  //-- END LIBRARY PRICE TIER DROPDOQN

}
