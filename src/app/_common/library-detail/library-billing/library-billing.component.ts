import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LibraryService } from "../../_services/library.service"
import { AnnounceService } from "../../_services/announce.service"
import { FlashMessagesService } from 'angular2-flash-messages';
import * as moment from 'moment';

@Component({
  selector: 'app-library-billing',
  templateUrl: './library-billing.component.html',
  styleUrls: ['./library-billing.component.css']
})
export class LibraryBillingComponent implements OnInit {

  @Input() library_id;
  @Input() LibData;

  updateLibraryBillingForm: UntypedFormGroup;
  updateLibraryDataForm: UntypedFormGroup;
  billing_types: object;
  payment_methods: object;
  loading = false;
  submitted = false;
  loadedForm = false;
  is_parent_billing: boolean = false;
  payment_method_val: string = '1';
  billing_type_val: string;
  current_balance: string;
  subscription_val: string;
  currentDate = "2019-12-01 00:00:00";

  constructor(
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private formBuilder: UntypedFormBuilder,
    private announceService: AnnounceService,
  ) { }

  ngOnInit() {
    this.loading = false;
    this.announceService.use_parent_billing.subscribe(message => this.is_parent_billing = message);

    this.getBillingTypes();
    this.getPaymentMethods();
    this.initLibraryBillingForm();
    this.setLibraryForm(this.LibData);

    this.updateLibraryBillingForm.get('payment_method').valueChanges.subscribe(val => {
      this.payment_method_val = val;
      this.setFieldsbyPaymentMethod(val);
    });

    this.updateLibraryBillingForm.get('billing_type').valueChanges.subscribe(val => {
      this.billing_type_val = val;
      this.setFieldsbyBillingType(val);
    });

    // this.updateLibraryBillingForm.get('parent_billing').valueChanges.subscribe(val => {
    //   this.is_parent_billing = val;      
    // });

    this.updateLibraryBillingForm.get('subscription').valueChanges.subscribe(val => {
      this.subscription_val = val;
    });    

  }

  setFieldsbyBillingType(selected_billing_type){
    if (selected_billing_type == '2') {
      this.updateLibraryBillingForm.get('minimum_balance').enable();
    }
    else {
      this.updateLibraryBillingForm.get('minimum_balance').disable();
    }
  }

  setFieldsbyPaymentMethod(selected_payment_method){
    if (selected_payment_method == '5') {
      this.updateLibraryBillingForm.get('billing_name').disable();
      this.updateLibraryBillingForm.get('billing_address1').disable();
      this.updateLibraryBillingForm.get('billing_address2').disable();
      this.updateLibraryBillingForm.get('billing_city').disable();
      this.updateLibraryBillingForm.get('billing_state').disable();
      this.updateLibraryBillingForm.get('billing_zip').disable();
      this.updateLibraryBillingForm.get('payment_creditcard').disable();
      this.updateLibraryBillingForm.get('payment_expiration_month').disable();
      this.updateLibraryBillingForm.get('payment_expiration_year').disable();
      this.updateLibraryBillingForm.get('payment_cvv').disable();
    }
    else {
      this.updateLibraryBillingForm.get('billing_name').enable();
      this.updateLibraryBillingForm.get('billing_address1').enable();
      this.updateLibraryBillingForm.get('billing_address2').enable();
      this.updateLibraryBillingForm.get('billing_city').enable();
      this.updateLibraryBillingForm.get('billing_state').enable();
      this.updateLibraryBillingForm.get('billing_zip').enable();
      this.updateLibraryBillingForm.get('payment_creditcard').enable();
      this.updateLibraryBillingForm.get('payment_expiration_month').enable();
      this.updateLibraryBillingForm.get('payment_expiration_year').enable();
      this.updateLibraryBillingForm.get('payment_cvv').enable();
    }
  }

  initLibraryBillingForm() {
    this.updateLibraryDataForm = this.formBuilder.group({
      daily_spend_limit: ['', Validators.required]
    });

    this.updateLibraryBillingForm = this.formBuilder.group({
      parent_billing: [0],
      payment_method: ['', Validators.required],
      billing_name: [{value: '', disabled: true}, Validators.required],
      billing_address1: [{value: '', disabled: true}, Validators.required],
      billing_address2: [{value: '', disabled: true}],
      billing_city: [{value: '', disabled: true}, Validators.required],
      billing_state: [{value: '', disabled: true}, Validators.required],
      billing_zip: [{value: '', disabled: true}, Validators.required],
      payment_creditcard: [{value: '', disabled: true}, Validators.required],
      payment_expiration_month: [{value: '', disabled: true}, [Validators.required, Validators.pattern('[0-9]{2}'), Validators.max(12)]],
      payment_expiration_year: [{value: '', disabled: true}, [Validators.required, Validators.pattern('[0-9]{4}')]],
      payment_cvv: [{value: '', disabled: true}, [Validators.required, Validators.pattern('[0-9]{3}')]],
      billing_type: ['', Validators.required],
      charge_amount: ['', Validators.required],
      daily_spend_limit: ['', Validators.required],
      minimum_balance: [{value: '', disabled: true}, Validators.required],
      subscription: [''],
      subscription_start: [''],
      subscription_end: [''],

    });
  } 

  setLibraryForm(lib) {
    this.current_balance = lib['current_balance'];
    let default_payment_method = lib['library_payment_method_id'] == 0 ? '1' : lib['library_payment_method_id'];
    this.payment_method_val = default_payment_method;
    this.billing_type_val = lib['billing_type'];
    this.subscription_val = lib['subscription'];
    let subscription_start = lib['subscription_start'] ? new Date(lib['subscription_start']) : '';
    let subscription_end = lib['subscription_end'] ? new Date(lib['subscription_end']) : '';
    
    this.updateLibraryDataForm.setValue({      
      daily_spend_limit: lib['daily_spend_limit'],
    });

    this.updateLibraryBillingForm.setValue({
      parent_billing: Number(this.is_parent_billing),
      payment_method: default_payment_method,
      billing_name: lib['billing_name'],
      billing_address1: lib['billing_address1'],
      billing_address2: lib['billing_address2'],
      billing_city: lib['billing_city'],
      billing_state: lib['billing_state'],
      billing_zip: lib['billing_zip'],
      payment_creditcard: lib['payment_creditcard'],
      payment_expiration_month: lib['payment_expiration_month'],
      payment_expiration_year: lib['payment_expiration_year'],
      payment_cvv: lib['payment_cvv'],
      billing_type: lib['billing_type'],
      charge_amount: lib['charge_amount'],
      daily_spend_limit: lib['daily_spend_limit'],
      minimum_balance: lib['minimum_balance'],
      subscription: lib['subscription'],
      subscription_start: subscription_start,
      subscription_end: subscription_end,
    });

    this.setFieldsbyPaymentMethod(default_payment_method);
    this.setFieldsbyBillingType(this.billing_type_val);
    this.loadedForm = true;
  }

  // convenience getter for easy access to form fields
  get f() { return this.updateLibraryBillingForm.controls; }

  updateLibraryBilling(e) {
    this.submitted = true;
    e.preventDefault();
    // stop here if form is invalid        

    if (this.updateLibraryBillingForm.invalid) {
      return;
    }

    this.loading = true;
    var form_data = this.updateLibraryBillingForm.value;

    if (form_data['parent_billing'] == 1) {
      form_data = {};
      form_data['parent_billing'] = true;
    }

    if(form_data.subscription_start){
      form_data.subscription_start = moment(form_data.subscription_start).format("YYYY-MM-DD HH:mm:ss");
    }

    if(form_data.subscription_end){
      form_data.subscription_end = moment(form_data.subscription_end).format("YYYY-MM-DD HH:mm:ss");
    }

    this.libraryService.updateLibrary(this.library_id, form_data)
      .subscribe(
        data => {
          this.loading = false;
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
        },
        err => {          
          this.loading = false;
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
        });

  }

  getBillingTypes() {
    this.libraryService.getBillingTypes()
      .subscribe(res => {
        this.billing_types = res;
      });
  }

  getPaymentMethods() {
    this.libraryService.getPaymentMethods()
      .subscribe(res => {        
        this.payment_methods = res;
      });
  }

  updateLibraryData(e) {
    this.submitted = true;
    e.preventDefault();
    // stop here if form is invalid        

    if (this.updateLibraryDataForm.invalid) {
      return;
    }

    this.loading = true;
    var form_data = this.updateLibraryDataForm.value;

    this.libraryService.updateLibrary(this.library_id, form_data)
      .subscribe(
        data => {
          this.loading = false;
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
        },
        err => {          
          this.loading = false;
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
        });
  }


}
