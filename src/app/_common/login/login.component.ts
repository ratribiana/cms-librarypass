import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {AuthenticationService} from "../_services";
import { FlashMessagesService } from 'angular2-flash-messages';
import {AclGuard} from '../_guards/acl.guard';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    error = '';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private _flashMessagesService: FlashMessagesService,
        private acl: AclGuard
    ) { }

    ngOnInit() {
        // add class
        document.body.classList.add('login-body');
        document.querySelectorAll('.nav-menu')[0].classList.add('container');
        document.querySelectorAll('#main_content')[0].classList.add('container');

        // reset login status
        if(this.authenticationService.currentUserValue)
        {
            this.router.navigate(['/'] );
            return false;
        }
        
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    ngOnDestroy() {
        // remove class on body tag
        document.body.classList.remove('login-body');
        document.querySelectorAll('.nav-menu')[0].classList.remove('container');
        document.querySelectorAll('#main_content')[0].classList.remove('container');
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onLoginSubmit(event) {
        this.submitted = true;
        event.preventDefault();
        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.authenticationService.login(this.f.username.value, this.f.password.value)            
            .subscribe(
                data => {
                    // lets check if we need to redirect them to page
                    if (this.returnUrl != '/') {
                        this.router.navigate([this.returnUrl]);
                    }else{
                        this.router.navigate(['/dashboard']);
                    }
                },
                error => {
                    //this.error = error;
                    this._flashMessagesService.show(error, { cssClass: 'alert-danger', timeout: 5000 });
                    this.loading = false;
                    return;
                });
    }
}
