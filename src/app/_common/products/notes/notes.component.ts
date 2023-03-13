import { Component, OnInit, Input, ViewChild  } from '@angular/core';
import {ProductsService} from "../../_services";
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ConstantPool } from '@angular/compiler';



@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {

  @Input() product_id;
  notesList = [];

  
  detailForm = new UntypedFormGroup({
    notes: new UntypedFormControl(''),
   });

  constructor(
    private productService: ProductsService
  ) { }

  ngOnInit() {
    if (this.product_id > 0) {
      this.initNotes(this.product_id);
    }
  }

  initNotes(productId) {
    this.productService.getProductNotes(productId).subscribe(res => {
      this.notesList = res.items;
    });
  }

  addNewNotes() {
    this.productService.addProductNotes(this.detailForm.value, this.product_id)
    .subscribe(res => {
      this.notesList.push({
        'date_created': res.data.date_created,
        'notes' : res.data.notes,
        'username': res.username
      });
      this.detailForm.setValue({notes: ''});
    });
    
  }

}
