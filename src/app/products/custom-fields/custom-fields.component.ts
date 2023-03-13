import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ProductsService} from "../../_services";
import { DynamicInputComponent } from '../../_common/dynamic-input/dynamic-input.component'
import {ConfirmModalComponent, ModalConfig} from '../../_common/confirm-modal'

@Component({
  selector: 'app-custom-fields',
  templateUrl: './custom-fields.component.html',
  styleUrls: ['./custom-fields.component.css']
})
export class CustomFieldsComponent implements OnInit {
  @Input() product_id;
  @ViewChild('modalDelete')  modalDelete: ConfirmModalComponent;


  customFields = [];
  userAddedFields = [];

  modalDeleteConfig: ModalConfig = {
    modalTitle: 'Warning',
    onDismiss: () => {
      return true;
    },
    dismissButtonLabel: 'Delete',
    onClose: () => {
      return false;
    },
    closeButtonLabel: 'Cancel',
    backdropStatic: true,
  }

  constructor(
    private productService: ProductsService    
    ) { }

  ngOnInit() {
    if (this.product_id > 0) {
      this.initCustomFieldsData(null);
    }
  }

  resetValue() {
    this.userAddedFields = [];
    this.product_id = 0;
  }

  async initCustomFieldsData(productId) {
    if (productId) {
      this.product_id = productId;
    }
    await this.getCustomFieldOptions();
    if(this.product_id > 0) {
      this.getProductValue();
    }
  }

  getProductValue() {
     this.productService.getProductCustomFields(this.product_id).subscribe(res => {
          let items = res.items;
          items.forEach(rec=>{
              this.populateUserCustomFields(rec);
          })
        });
  }

  getCustomFieldOptions() {
    return new Promise(resolve => {
       this.productService.getCustomFields().subscribe(res => {
        this.customFields = res.items;
         resolve(res);
        });
      });
  }



  /** this will initiate exisitng value */
  populateUserCustomFields(data) {
    let sources = this.getCustomFieldsData(data.custom_field_id);
    this.userAddedFields.push({
      id: data.id,
      value: data.value,
      custom_field_id: sources.id,
      source: sources,
    });
  }



  /** lets just get the sources */
  getCustomFieldsData(id) {
    let result = {id:''};
    this.customFields.forEach(rec =>{
          if(rec.id == id){
            result = rec;
            return rec;
          }
      });

      return result;
  }

  /** to add element */
  addCustomFields(id) {
    let sources = this.getCustomFieldsData(id);

    let tempId = Math.random().toString(36).slice(2);

    this.userAddedFields.push({
      id: tempId,
      value: '',
      custom_field_id: sources.id,
      source: sources,
    });
  }

  /** just get the seelcted index */
  getSelectedIndex(id) {
    let selectedIndex = 0
    this.userAddedFields.forEach((value, i) =>{
         if (value.id == id) {
          selectedIndex = i;
         }
      });
    return selectedIndex;
  }

  // remove custom fields
 async removeCustomFields(id) {
    let selectedIndex = this.getSelectedIndex(id);
    let action = true;

    // lets check if we need to update the server
    if (!isNaN(id)) {
      action = await this.modalDelete.open();
      if (action == true){
          this.productService.deleteProductCustomFields(this.product_id, id).subscribe(res => {});
      }
    }
     
    if (action == true){
      this.userAddedFields.splice(selectedIndex, 1);
    }
  }

  /** this will update new id */
  updateNewId(recs) {
    recs.forEach(value =>{
      if (value.old != value.new) {
        let selectedIndex = this.getSelectedIndex(value.old);
        this.userAddedFields[selectedIndex].id = value.new;
      }
    })

  }

  /** this handles all change event of the added custom fields */
  onChangeValue(eleData) {
    // lets update the array
    let selectedIndex = this.getSelectedIndex(eleData.id);
    this.userAddedFields[selectedIndex].value = eleData.value;
  }

  saveDraft() {
      if (this.product_id) {
          this.productService.updateProductCustomFields(this.product_id, this.userAddedFields)
            .subscribe( res => {
              this.updateNewId(res.id)
            },err => {});
      }
  }

}
