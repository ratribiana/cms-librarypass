import { Component, OnInit, Input } from '@angular/core';
import {ProductsService} from "../../_services";
import {DualListComponent} from '../../_common/dual-list/dual-list.component'

@Component({
  selector: 'app-product-lines',
  templateUrl: './product-lines.component.html',
  styleUrls: ['./product-lines.component.css']
})
export class ProductLinesComponent implements OnInit {
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

  productLineList: Array<any>;
  selectedProductLines: Array<any>;

  constructor(
     private productService: ProductsService
    ) { }

  ngOnInit() {
    if (this.product_id > 0) {
      this.initProductLines(null);
    }
  }

  /** lset initialize values */
  async initProductLines(productId) {
    if (productId) {
      this.product_id = productId;
    }
    await this.getProductLines();
    await this.getProductGroups();

    this.key = 'id';
    this.display = 'display_name'; 
    this.keepSorted = true;
    this.source = this.productLineList;
    this.confirmed = this.selectedProductLines;
  }

  resetValue() {
    this.selectedProductLines = [];
    this.product_id = 0;
  }

  /** lets get products gruops */
   getProductGroups() {
    return new Promise(resolve => {
        this.productService.getProductGroups(this.product_id).subscribe(res => {
          let items = res.items;
          this.selectedProductLines = new Array<any>();
          if (items) {
            items.forEach(item =>{
              let rec = this.searchProductLine(item.group_id);
              if (rec) {
                this.selectedProductLines.push(rec);
              }
            })
          }
          resolve(res);
        });
      });
  }

  /** this will just get the real value in original list */
  searchProductLine(id) {
    let result = {};
    this.productLineList.forEach(rec =>{
          if(rec.id == id){
            result = rec;
            return rec;
          }
      });

      return result;
  }

  /** get product lines  */
  getProductLines() {
    return new Promise(resolve => {
      this.productService.getProductLines().subscribe(res => {
        this.productLineList = res.items;
        resolve(res);
      });
    });
  }

  saveDraft() {
     // lets make sure product id exists
    if (this.product_id) {
      this.productService.updateProductLines(this.product_id, this.selectedProductLines)
          .subscribe( data => {},err => {});
    }
  }
}
