import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {ProductsService} from "../../_services";


@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.css']
})
export class CreditsComponent implements OnInit {
  @Input() product_id;

  detailForm = new FormGroup({
    writers: new FormControl('', [Validators.required]),
    artists: new FormControl('', [Validators.required])
   });


  constructor(
     private productService: ProductsService    
     ) { }

  ngOnInit() {
    if (this.product_id > 0) {
      this.getProductCredits(null);
    }
  }

  resetValue() {
    this.detailForm.reset(this.detailForm.value);
    this.product_id = 0;
  }

  /** lets pull credits of the product */
  getProductCredits(productId) {
    if (productId) {
      this.product_id = productId;
    }

    return new Promise(resolve => {
        this.productService.getProductCredits(this.product_id).subscribe(res => {
          this.assignEntries(res.items);
          resolve(res);
        });
      });
  }

  /** lets assign entries in the text area */
  assignEntries(data) {
    if (data.length < 1) {
      return;
    }
    let writersList = [];
    let artistsList = [];

    data.forEach(entry => {
      if (entry.role.toLowerCase() == 'writer') {
        writersList.push(entry.name)
      }

      if (entry.role.toLowerCase() == 'artist') {
        artistsList.push(entry.name)
      }
    });

    // lets update the text area
    this.detailForm.patchValue({
      writers:  writersList.join("\n"),
      artists:  artistsList.join("\n")
     }
    );
  }

  saveDraft(){
    // lets make sure product id exists
    if (this.product_id) {
        this.productService.updateProductCredits(this.product_id, this.detailForm.value)
          .subscribe( data => {},err => {});
    }
  }

}
