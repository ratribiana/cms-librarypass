import { Component, OnInit, Input } from '@angular/core';
import {ProductsService} from "../../_services";
import {DualListComponent} from '../../_common/dual-list/dual-list.component'


@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  @Input() product_id;

  tab = 1;
  keepSorted = true;
  key: string;
  display: string;
  filter = true;
  source: Array<any>;
  confirmed: Array<any>;
  disabled = false;
  format: any = DualListComponent.DEFAULT_FORMAT;

  categoriesList: Array<any>;
  selectedCategories: Array<any>;


  constructor(
     private productService: ProductsService
    ) { }

  ngOnInit() {
    if (this.product_id > 0) {
      this.initCategories(null);
    }
  }


 async initCategories(productId) {
    if (productId) {
      this.product_id = productId;
    }
    
  await this.getCategories();
  await this.getProductCategories();

    this.key = 'id';
    this.display = 'name'; 
    this.keepSorted = true;
    this.source = this.categoriesList;
    this.confirmed = this.selectedCategories;
  }

  /** get categories */
  getCategories() {
    return new Promise(resolve => {
      this.productService.getCategories().subscribe(res => {
        this.categoriesList = res.items;
        resolve(res);
      });
    });
  }


  resetValue() {
    this.selectedCategories = [];
    this.product_id = 0;
  }

  /** get categoris of this product */
  getProductCategories() {
    return new Promise(resolve => {
        this.productService.getProductCategories(this.product_id).subscribe(res => {
          let items = res.items;
          this.selectedCategories = new Array<any>();
          if (items) {
            items.forEach(item =>{
              let rec = this.searchCategory(item.category_id);
              if (rec) {
                this.selectedCategories.push(rec);
              }
            })
          }
          resolve(res);
        });
      });
  }

  /** this will just get the real value in original list */
  searchCategory(id) {
    let result = {};
    this.categoriesList.forEach(rec =>{
          if(rec.id == id){
            result = rec;
            return rec;
          }
      });

      return result;
  }


  saveDraft() {
    // lets make sure product id exists
    if (this.product_id) {
      this.productService.updateProductCategories(this.product_id, this.selectedCategories)
          .subscribe( data => {},err => {});
    }
  }
}
