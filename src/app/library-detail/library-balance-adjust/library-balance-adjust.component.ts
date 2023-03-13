import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LibraryService } from "../../_services/library.service"
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthenticationService } from "../../_services";

@Component({
  selector: 'app-library-balance-adjust',
  templateUrl: './library-balance-adjust.component.html',
  styleUrls: ['./library-balance-adjust.component.css']
})
export class LibraryBalanceAdjustComponent implements OnInit {

  @Input() library_id;
  @Input() LibData;

  current_balance: any;
  updateLibraryBalanceForm: UntypedFormGroup;
  library_balance_types: object;
  loading = false;
  submitted = false;
  loadedForm = false;
  currentUser = this.authenticationService.currentUserValue;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private authenticationService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.getCurrentbalance();
    this.getBalanceTypes();
    this.initLibraryBalanceForm();
  }

  initLibraryBalanceForm() {
    this.updateLibraryBalanceForm = this.formBuilder.group({
      library_balance_type: ['1', Validators.required],
      amount: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.loadedForm = true;
  }

  getCurrentbalance() {
    this.loading = true;
    this.libraryService.getLibraryCurrentBalance(this.library_id)
      .subscribe(res => {
        this.current_balance = res.current_balance;
        this.loading = false;
      });
  }

  getBalanceTypes() {
    this.libraryService.getBalanceTypes()
      .subscribe(res => {
        this.library_balance_types = res;
      });
  }

  updateLibraryBalanceType(e) {
    this.submitted = true;
    e.preventDefault();
    // stop here if form is invalid

    if (this.updateLibraryBalanceForm.invalid) {
      return;
    }

    this.loading = true;
    var form_data = this.updateLibraryBalanceForm.value;
    form_data.user = this.currentUser['username'];
    form_data.library_id = this.library_id;

    this.libraryService.updateLibraryBalances(form_data)
      .subscribe(
        data => {
          this.loading = false;
          this.getCurrentbalance();
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
        },
        err => {
          this.loading = false;
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
        });

  }

  // convenience getter for easy access to form fields
  get f() { return this.updateLibraryBalanceForm.controls; }

}