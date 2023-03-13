import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {first} from "rxjs/operators";
import {ResetPasswordService} from "../_services/reset-password.service";
import {HttpErrorResponse} from "@angular/common/http";
import {AuthenticationService} from "../_services";
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
    passwordResetForm: FormGroup;
    passwordUpdateForm: FormGroup;
    email: string = '';
    expire_time: string = '';
    hash: string = '';
    loading = false;
    submitted = false;
    returnUrl: string;
    error = '';
    private sub: any;

  constructor(
      private activatedRoute: ActivatedRoute,
      private formBuilder: FormBuilder,
      private resetPasswordService: ResetPasswordService,
      private router: Router,
      private route: ActivatedRoute,
      private authenticationService: AuthenticationService,
      private _flashMessagesService: FlashMessagesService
  )
  {}

    ngOnInit() {
        // add class
        document.body.classList.add('login-body');
        document.querySelectorAll('.nav-menu')[0].classList.add('container');
        document.querySelectorAll('#main_content')[0].classList.add('container');
        
        // if(this.authenticationService.currentUserValue)
        // {
        //     this.router.navigate(['/'] );
        //     return false;
        // }

        // old code [10-29-22]
        // this.sub = this.activatedRoute.params.subscribe(params => {
        //     this.email = params['email']; // (+) converts string 'id' to a number
        //     this.expire_time = params['expire_time'];
        //     this.hash = params['hash'];
        // });

        this.sub = this.activatedRoute.queryParams.subscribe(params => {
            this.email = params['e']; // (+) converts string 'id' to a number
            this.expire_time = params['t'];
            this.hash = params['s'];
        });

        this.passwordResetForm = this.formBuilder.group({
            username: ['', Validators.required],
        });

        this.passwordUpdateForm = this.formBuilder.group({
            password: ['', Validators.required],
            email: [this.email, Validators.required],
            expire_time: [this.expire_time, Validators.required],
            hash: [this.hash, Validators.required],
        });

        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // ngOnDestroy() {
    //     this.sub.unsubscribe();
    // }

    // convenience getter for easy access to form fields
    get f() { return this.passwordResetForm.controls; }
    get r() { return this.passwordUpdateForm.controls; }

    onResetSubmit(e) {

        this.submitted = true;
        e.preventDefault();

        // // stop here if form is invalid
        if (this.passwordResetForm.invalid) {
            return;
        }

        this.loading = true;

        this.resetPasswordService.forgot_password(this.f.username.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.loading = false;
                    this.router.navigate([this.returnUrl]).then(() => {
                        this._flashMessagesService.show('Check your inbox. We\'ve sent you a link to reset your password.', { cssClass: 'alert-success', timeout: 5000 });
                    })
                },
                (error: HttpErrorResponse) => {
                    //this.error = error.message;
                    this.loading = false;
                    this._flashMessagesService.show('There was an error locating your account information. Please try a different username / email.', { cssClass: 'alert-danger', timeout: 5000 });
                });
    }


    onUpdateSubmit(e) {
        this.submitted = true;
        e.preventDefault();

        // stop here if form is invalid
        if (this.passwordUpdateForm.invalid) {
            return;
        }

        this.loading = true;

        this.resetPasswordService.reset_password(this.r.password.value, this.r.email.value, this.r.expire_time.value, this.r.hash.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.loading = false;
                    this.authenticationService.logout();
                    this.router.navigate(['/login'], { queryParams: { returnUrl: this.returnUrl } }).then(() => {
                        this._flashMessagesService.show('Your password has been updated.', { cssClass: 'alert-success', timeout: 5000 });
                    })
                },
                (error: HttpErrorResponse) => {
                    //this.error = error.message;
                    this.loading = false;
                    this.router.navigate([this.returnUrl]).then(() => {
                        this._flashMessagesService.show('Invalid Reset Password link.', { cssClass: 'alert-danger', timeout: 5000 });
                    })
                });
    }




}
