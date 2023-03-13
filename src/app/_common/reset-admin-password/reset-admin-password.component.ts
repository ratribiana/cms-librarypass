import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {first} from "rxjs/operators";
import {ResetPasswordService} from "../_services/reset-password.service";
import {HttpErrorResponse} from "@angular/common/http";

import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-reset-admin-password',
  templateUrl: './reset-admin-password.component.html',
  styleUrls: ['./reset-admin-password.component.css']
})
export class ResetAdminPasswordComponent implements OnInit {
  passwordResetForm: FormGroup;  
  email: string = '';
  expire_time: string = '';
  hash: string = '';
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';

  constructor(    
    private formBuilder: FormBuilder,
    private resetPasswordService: ResetPasswordService,
    private router: Router,
    private route: ActivatedRoute,
    private _flashMessagesService: FlashMessagesService
  ) { }

  ngOnInit() {  
    this.passwordResetForm = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });  

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
}

// convenience getter for easy access to form fields
get f() { return this.passwordResetForm.controls; }

onResetSubmit(e) {

    this.submitted = true;
    e.preventDefault();

    // // stop here if form is invalid
    if (this.passwordResetForm.invalid) {
        return;
    }

    this.loading = true;

    this.resetPasswordService.reset_admin_password(this.f.password.value, this.f.username.value)
        .pipe(first())
        .subscribe(
            data => {
                this.loading = false;
                this.router.navigate([this.returnUrl]).then(() => {
                    this._flashMessagesService.show('Your password has been updated.', { cssClass: 'alert-success', timeout: 5000 });
                })
            },
            (error: HttpErrorResponse) => {
                //this.error = error.message;
                this.loading = false;
                this._flashMessagesService.show('There was an error locating your account information. Please try a different username / email.', { cssClass: 'alert-danger', timeout: 5000 });
            });
}

}
