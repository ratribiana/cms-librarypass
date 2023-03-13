import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LibraryService } from "../../_services/library.service";
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import {ReportService, MiscService, ProductsService} from "../../_services";
import * as moment from 'moment';




@Component({
  selector: 'app-comic-detail',
  templateUrl: './comic-detail.component.html',
  styleUrls: ['./comic-detail.component.css']
})
export class ComicDetailComponent implements OnInit {
  @Input() product_id;
  @Output() onCreateNewProduct = new EventEmitter();
  @Output() updateName = new EventEmitter();
  @Output() isLoaded = new EventEmitter();

  

  serviceList: object;
  publisherDropdown= {};
  languageDropdown= {};
  productTypeDropdown= {};
  releaseDropDown= {};
  publishers = [];
  languages = [];
  productTypes = [];
  releaseTypes = [];

  /** declare form inputs */
  detailForm = new UntypedFormGroup({
      name: new UntypedFormControl('', [
          Validators.required
        ]),
      service_types: new UntypedFormControl([], [
          Validators.required
        ]),
      comic_bundle_name: new UntypedFormControl(''),
      series_bundle_name: new UntypedFormControl(''),
      number: new UntypedFormControl('', [
          Validators.required
        ]),
      product_type_id: new UntypedFormControl(''),
      supplier_id: new UntypedFormControl(''),
      language_id: new UntypedFormControl(''),
      raw_name: new UntypedFormControl('', [
          Validators.required
        ]),
      release_category_id: new UntypedFormControl(''),
      product_publisher_identifier: new UntypedFormControl(''),
      synopsis: new UntypedFormControl(''),
      video_url: new UntypedFormControl(''),
      description: new UntypedFormControl(''),
      manga_orientation: new UntypedFormControl(0),
      webtoon_orientation: new UntypedFormControl(0),
      price_tier_id: new UntypedFormControl(1),
      legal: new UntypedFormControl(''),
      notes: new UntypedFormControl(''),
    });


  constructor(
      private libraryService: LibraryService,
      private reportService: ReportService,
      private miscService: MiscService,     
      private productService: ProductsService,     

    ) { }

  ngOnInit() {
    this.initDropdownSetting();
    this.initDetailDataPage();
  }

  resetValue() {
    this.detailForm.reset(this.detailForm.value);
    this.product_id = 0;
  }


  async initDetailDataPage() {
     this.getServices();
     this.getPublisherList();
     this.getLangauges();
     this.getProductTypes();
     this.getReleaseTypes();

     if (this.product_id > 0) {
        this.getProduct();
     }

  }

    // lets get product
  getProduct(){
     return new Promise(resolve => {

        this.productService.getProduct(this.product_id).subscribe(res => {

          this.detailForm.setValue({
           name: res.name,
           service_types: res.service_types,
           comic_bundle_name: res.comic_bundle_name,
           series_bundle_name: res.series_bundle_name,
           number: res.number,
           product_type_id: [this.searchTypes(parseInt(res.product_type_id))],
           supplier_id: [this.searchPublisher(parseInt(res.supplier_id))],
           language_id: [this.searchLanguage(parseInt(res.language_id))],
           raw_name: res.raw_name,
           release_category_id: [this.searchRelease(parseInt(res.release_category_id))],
           product_publisher_identifier: res.product_publisher_identifier,
           synopsis: res.synopsis,
           video_url: res.video_url,
           description: res.description,
           manga_orientation: parseInt(res.manga_orientation),
           webtoon_orientation: parseInt(res.webtoon_orientation),
           price_tier_id: parseInt(res.price_tier_id),
           legal: res.legal,
           notes: res.notes,
        });
          this.updateName.emit(res.name);
          resolve(res);
        });
      });
  }

  initDropdownSetting() {
    this.publisherDropdown= {
        singleSelection: true,
        closeDropDownOnSelection: true,
        idField: 'id',
        textField: 'name',      
        allowSearchFilter: true
    };

    this.languageDropdown= {
        singleSelection: true,
        closeDropDownOnSelection: true,
        idField: 'id',
        textField: 'name',      
        allowSearchFilter: true
    };

    this.productTypeDropdown= {
        singleSelection: true,
        closeDropDownOnSelection: true,
        idField: 'id',
        textField: 'name',      
        allowSearchFilter: true
    };
  }

  

  /**
   * on save data
   */
  saveDraft() {
    // lets reconstruct since dropdowns values are array
    let postData = this.detailForm.value;
      postData.supplier_id = this.detailForm.get('supplier_id').value[0].id;
      postData.language_id = this.detailForm.get('language_id').value[0].id;
      postData.product_type_id = this.detailForm.get('product_type_id').value[0].id;
      postData.release_category_id = this.detailForm.get('release_category_id').value[0].id;


    // just update if product id present
    if (this.product_id) {
      this.productService.updateProduct(this.product_id, postData)
      .subscribe(
        data => {
          //this.product_id = data.id;
        },
        err => {});
      return;
    } 


    this.productService.createProduct(postData)
      .subscribe(
        data => {
          this.product_id = data.id;
          this.onCreateNewProduct.emit(this.product_id);
        },
        err => {});

  }

  //-- START PUBLISHIER DROPDOQN
  getPublisherList(){
    return new Promise(resolve => {
    this.reportService.getSuppliersList()
      .subscribe(res => {
        this.publishers = res.items;  
         resolve(res);    
      });
       });
  }

  searchPublisher(id) {
    let result = {};
    this.publishers.forEach(rec =>{
          if(rec.id == id){
            result = rec;
            return rec;
          }
      });
      return result;
  }

  //-- END PUBLISHIER DROPDOQN

  //-- START LANGUAGE DROPDOQN
  getLangauges() {
      return new Promise(resolve => {
        this.miscService.getLanguagesList().subscribe(res => {
          this.languages = res;
          resolve(res);
        });
      });
  }

  searchLanguage(id) {
    let result = {};
    this.languages.forEach(rec =>{
          if(rec.id == id){
            result = rec;
            return rec;
          }
      });

      return result;
  }
  //-- END LANGUAGE DROPDOQN

  //-- START TYPES DROPDOQN

  getProductTypes() {
      return new Promise(resolve => {
        this.productService.getProductTypes().subscribe(res => {
          this.productTypes = res;
          resolve(res);
        });
      });
  } 

  searchTypes(id) {
    let result = {};
    this.productTypes.forEach(rec =>{
          if(rec.id == id){
            result = rec;
            return rec;
          }
      });

      return result;
  }
  //-- END TYPES DROPDOQN


  getServices(){
     return new Promise(resolve => {
        this.libraryService.getServices().subscribe(res => {
          this.serviceList = res;
          resolve(res);
        });
      });
  }

  //-- START RELEASE TYPE DROPDOQN
  getReleaseTypes() {
      return new Promise(resolve => {
        this.productService.getReleaseTypes().subscribe(res => {
          this.releaseTypes = res;
          resolve(res);
        });
      });
  } 

  searchRelease(id) {
    let result = {};
    this.releaseTypes.forEach(rec =>{
          if(rec.id == id){
            result = rec;
            return rec;
          }
      });

      return result;
  }
  //-- END RELEASE TYPE DROPDOQN

  onNameUpdate(e) {
    this.constructProducId();
  }

  constructProducId() {
      // construct the suffix
      let name = this.detailForm.get('name').value;
      let pubId = this.detailForm.get('supplier_id');
      let publisherName = pubId.value != '' ?  pubId.value[0].name : '' ;
        if (publisherName != '') {
            publisherName = this.removeSpecialChars(publisherName)
            publisherName = publisherName.trim().toLowerCase().replace(/\s+/g, '.') + '.';
        }

      let suffix =  moment(new Date()).format('MMDDYYYY');

      let comicName =  name.split('#', 1);
          comicName = this.removeSpecialChars(comicName[0].trim());
          comicName = comicName.toLowerCase();
          comicName = comicName.replace(/[^\w\s]/gi,' ');
          comicName = comicName.replace(/\s+/g, '.');

      // check language
      let langId = this.detailForm.get('language_id');
      let lang =  langId.value != '' ? '.' + langId.value[0].name : '' ;
          if (lang != '') {
              lang = this.removeSpecialChars(lang)
              lang = lang.toLowerCase().replace(/\s+/g, '.');
          }

      // Set the raw name - it's the comic name without the #123 part
      let hashNumber =  name.split('#', 2);
      let rawName = name.replace(/:./gi, '');
          if (hashNumber.length > 0) {
            rawName = hashNumber[0].trim(); 
          }

      let seriesName = publisherName + [comicName, 'series'].join('.');
      let numWords = '';
      let numberInfo = '';
      if (hashNumber.length > 1) {
          numberInfo = this.removeSpecialChars(hashNumber[1]);
          numberInfo = numberInfo.trim().replace(/[^\w\s]/gi,' ');
          numberInfo = numberInfo.replace(/\s+/g, '.');

          if(!isNaN(Number(numberInfo))){
            numWords = '.' + this.numberToWords(numberInfo);
          }

      }

      let bundleName = publisherName + comicName + numWords + lang + '.' + suffix;
      // max length should be 100
      if (bundleName.length - numWords.length > 100) {
         let remain = bundleName.length - 100;
         let shortName = comicName.substr(0, comicName.length - remain);
         bundleName = publisherName + shortName + numWords + lang + '.' + suffix;
      }

      this.detailForm.patchValue({
        comic_bundle_name: bundleName,
        series_bundle_name: seriesName,
        raw_name: rawName,
        number: numberInfo
      });
  }

  isInt(value) {
    var x;
    if (isNaN(value)) {
      return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
  }

  removeSpecialChars(str1) {
    return str1.replace(/[^a-zA-Z 0-9.]+/g,'');
  }

  numberToWords(n) {
    let num = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
    let tens = "twenty thirty forty fifty sixty seventy eighty ninety".split(" ");
    let decimals = (n + "").split(".");

    let decimalWords = '';
    if (decimals.length > 1) {
      decimalWords =  '.point.' + this.numberToWords(decimals[1])
    }

    if (n < 20) return num[n];
    let digit = Math.floor(n%10);
    if (n < 100) return tens[~~(n/10)-2] + (digit? "." + num[digit]: "") + decimalWords;
    if (n < 1000) return num[~~(n/100)] +" hundred" + (n%100 == 0? "": " " + this.numberToWords(n%100)) + decimalWords;
    return this.numberToWords(~~(n/1000)) + " thousand" + (n%1000 != 0? " " + this.numberToWords(n%1000): "") + decimalWords;
  }
}
