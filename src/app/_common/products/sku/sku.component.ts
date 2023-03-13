import { Component, OnInit, Input } from '@angular/core';
import { ProductsService} from "../../_services";
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-sku',
  templateUrl: './sku.component.html',
  styleUrls: ['./sku.component.css']
})
export class SkuComponent implements OnInit {
  @Input() product_id;

  applicationsList = [];
  productApplications = [];

  skuForm = new UntypedFormGroup({});

  constructor(
      private productService: ProductsService
  ) { }

  ngOnInit() {
    if (this.product_id> 0) {
      this.initApplications(null);
    }
  }

  /** lets loop to create form controls  */
  async initApplications(productId) {
    if (productId) {
      this.product_id = productId;
    }
    await this.getApplications();
    let group = {};
    this.applicationsList.forEach(sku=>{
        group['application_' + sku.id] = new UntypedFormControl('');
    });

    this.skuForm = new UntypedFormGroup(group);

    // lets get skus of product itself
    await this.getProductApplications();
    if (this.productApplications) {
      this.productApplications.forEach(rec=>{ 
           this.skuForm.get('application_' + rec.application_id).setValue(rec.sku);
      });
    }
  }

  resetValue() {
    this.skuForm.reset(this.skuForm.value);
    this.product_id = 0;
  }

  /** get list of skus */
    getApplications() {
      return new Promise(resolve => {
        this.productService.getApplications().subscribe(res => {
          this.applicationsList = res.items;
          resolve(res);
        });
      });
  }

  /** lets get application of product */
  getProductApplications() {
    return new Promise(resolve => {
        this.productService.getProductApplications(this.product_id).subscribe(res => {
          this.productApplications = res.items
          resolve(res);
        });
      });
  }

  saveDraft() {
    // lets make sure product id exists
    if (this.product_id) {
      this.productService.updateProductApplications(this.product_id, this.skuForm.value)
          .subscribe( data => {},err => {});
    }
  }
}
