import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {ProductsService} from "../../_services";
import {DualListComponent} from '../../_common/dual-list/dual-list.component';


@Component({
  selector: 'app-locales',
  templateUrl: './locales.component.html',
  styleUrls: ['./locales.component.css']
})
export class LocalesComponent implements OnInit {
  @Input() product_id;



  tab = 1;
  keepSorted = true;
  key: string;
  display: string;
  filter = true;
  source: Array<any>;
  confirmed: Array<any>;
  disabled = true;
  format: any = DualListComponent.DEFAULT_FORMAT;

  localesList: Array<any>;
  localeRawPreset:  Array<any>;
  selectedLocales: Array<any>;
  localizationMode:any = 0;

  localeDropdown = {};


  constructor(
     private productService: ProductsService
    ) { }

  ngOnInit() {
    if (this.product_id > 0) {
      this.initLocales(null);
    }

    this.prepPresetDropdown();
  }

  resetValue() {
    this.selectedLocales = [];
    this.product_id = 0;
  }


  /** initialize values */
  async initLocales(productId) {
    if (productId) {
      this.product_id = productId;
    }
    await this.getLocales();
    await this.getProductLocales();

    this.key = 'id';
    this.display = 'name'; 
    this.keepSorted = true;
    this.source = this.localesList;
    this.confirmed = this.selectedLocales;

  }

  prepPresetDropdown() {
    this.localeDropdown = {
      singleSelection: true,
      closeDropDownOnSelection: true,
      idField: 'id',
      textField: 'name',      
      allowSearchFilter: false
    };
  }


  /** get all locales */
  getLocales() {
    return new Promise(resolve => {
      this.productService.getLocales().subscribe(res => {
        this.localesList = res.items;
        this.localeRawPreset = res.preset;
        resolve(res);
      });
    });
  }

  /** get locales of a certain product */
  getProductLocales() {
    return new Promise(resolve => {
        this.productService.getProductLocales(this.product_id).subscribe(res => {
          
          this.localizationMode = res.mode;
          this.disabled  = res.mode == 0 ? true : false;
          
          let items = res.items;
          this.selectedLocales = new Array<any>();
          
          if (items) {
            items.forEach(item =>{
              let rec = this.searchLocales(item.locale_id);
              if (rec) {
                this.selectedLocales.push(rec);
              }
            })
          }

          resolve(res);
        });
      });
  }

    /** this will just get the real value in original list */
  searchLocales(id) {
    let result = {};
    this.localesList.forEach(rec =>{
          if(rec.id == id){
            result = rec;
            return rec;
          }
      });

      return result;
  }

  /** on click radio button */
  onLocaleModeChange(value) {
    this.localizationMode = value;
    this.disabled  = value == 0 ? true : false;
  }

  saveDraft() {
    // lets make sure product id exists
    if (this.product_id) {
      let data = {
        mode: this.localizationMode,
        locales: this.selectedLocales
      };
      this.productService.updateProductLocales(this.product_id, data)
          .subscribe( data => {},err => {});
    }
  }


  onPresetSelect(e) {
    this.localeRawPreset.forEach(preset => {
        if (e.id == preset.id) {
          this.selectedLocales = new Array<any>();
          preset.locales.forEach(code => {
              this.selectedLocales.push({id: code.id, code: code.code})
          }); 
          this.confirmed = this.selectedLocales;
        }
    });
  }

}
