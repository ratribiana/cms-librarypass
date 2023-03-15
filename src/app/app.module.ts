import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import 'select2';

import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LazyLoadImageModule } from 'ng-lazyload-image';

import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { DotNotationPipe } from './_pipes/dot-notation.pipe';
import { LoaderComponent } from './loader/loader.component';
import { LoaderInterceptorService } from "./_services/loader-interceptor.service";
import { TrimDirective } from './trim.directive';

import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { Select2Module } from "ng2-select2";
import { ResetPasswordComponent } from './reset-password/reset-password.component';

import { FlashMessagesModule } from 'angular2-flash-messages';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PublisherComponent } from './publisher/publisher.component';

import { PublisherActivityComponent } from './publisher/publisher-activity/publisher-activity.component';
import { PublisherStatementComponent } from './publisher/publisher-statement/publisher-statement.component';
import { LibrarianComponent } from './librarian/librarian.component';
import { LibrarianActivityComponent } from './librarian/librarian-activity/librarian-activity.component';
import { LibrarianStatementComponent } from './librarian/librarian-statement/librarian-statement.component';
import { PercentagePipe } from './_pipes/percentage.pipe';
import { DateFormatPipe } from './_pipes/date-format.pipe';
import { MarcRecordsComponent } from './marc-records/marc-records.component';
import { CurrencyPipe } from './_pipes/currency.pipe';
import { ResetAdminPasswordComponent } from './reset-admin-password/reset-admin-password.component';
import { UserMaintenanceComponent } from './user-maintenance/user-maintenance.component';
import { LibrariesComponent } from './libraries/libraries.component';
import { LibraryDetailComponent } from './library-detail/library-detail.component';
import { LibraryProfileComponent } from './library-detail/library-profile/library-profile.component';
import { LibraryServicesComponent } from './library-detail/library-services/library-services.component';
import { LibraryAuthorizationComponent } from './library-detail/library-authorization/library-authorization.component';
import { LibraryBillingComponent } from './library-detail/library-billing/library-billing.component';
import { LibraryCirculationComponent } from './library-detail/library-circulation/library-circulation.component';
import { AuthDemoComponent } from './library-detail/library-authorization/auth-demo/auth-demo.component';
import { AuthSamlComponent } from './library-detail/library-authorization/auth-saml/auth-saml.component';
import { AuthSip2Component } from './library-detail/library-authorization/auth-sip2/auth-sip2.component';
import { AuthPatronApiComponent } from './library-detail/library-authorization/auth-patron-api/auth-patron-api.component';
import { AuthIpAuthComponent } from './library-detail/library-authorization/auth-ip-auth/auth-ip-auth.component';
import { AuthSharedSecretComponent } from './library-detail/library-authorization/auth-shared-secret/auth-shared-secret.component';
import { AuthRbDigitalComponent } from './library-detail/library-authorization/auth-rb-digital/auth-rb-digital.component';
import { AuthSecretCodeComponent } from './library-detail/library-authorization/auth-secret-code/auth-secret-code.component';
import { AuthGoogleOauthComponent } from './library-detail/library-authorization/auth-google-oauth/auth-google-oauth.component';
import { AuthUserManagedComponent } from './library-detail/library-authorization/auth-user-managed/auth-user-managed.component';
import { AuthReferrerLoginComponent } from './library-detail/library-authorization/auth-referrer-login/auth-referrer-login.component';
import { AuthPrefixComponent } from './library-detail/library-authorization/auth-prefix/auth-prefix.component';
import { LibraryCreateComponent } from './library-detail/library-create/library-create.component';
import { LibraryBalanceAdjustComponent } from './library-detail/library-balance-adjust/library-balance-adjust.component';
import { ServiceCirculationComponent } from './library-detail/library-services/service-circulation/service-circulation.component';
import { CmsUserComponent } from './cms-user/cms-user.component';
import { CmsUserCreateComponent } from './cms-user/cms-user-create/cms-user-create.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AuthLtiComponent } from './library-detail/library-authorization/auth-lti/auth-lti.component';
import { LibraryChildrenComponent } from './library-detail/library-children/library-children.component';
import { ProductsComponent } from './products/products.component';
import {DataTablesModule} from 'angular-datatables';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PromotionsComponent } from './promotions/promotions.component';
import { PromotionDetailComponent } from './promotions/promotion-detail/promotion-detail.component';
import { SettingsComponent } from './settings/settings.component';
import { NgbdSortableHeader } from './_helpers/sortable.directive';
import { PromotionProductsComponent } from './promotions/promotion-products/promotion-products.component';
import { AuthSip2v2Component } from './library-detail/library-authorization/auth-sip2v2/auth-sip2v2.component';
import { UserGroupComponent } from './user-group/user-group.component';
import { RolesComponent } from './user-group/roles/roles.component';
import { GroupsComponent } from './user-group/groups/groups.component';
import { ComicDetailComponent } from './products/comic-detail/comic-detail.component';
import { ProductCreateComponent } from './products/product-create/product-create.component';
import { CategoriesComponent } from './products/categories/categories.component';
import { CreditsComponent } from './products/credits/credits.component';
import { PagesComponent } from './products/pages/pages.component';
import { UvieComponent } from './products/uvie/uvie.component';
import { PricingAvailabilityComponent } from './products/pricing-availability/pricing-availability.component';
import { SkuComponent } from './products/sku/sku.component';
import { ProductLinesComponent } from './products/product-lines/product-lines.component';
import { LocalesComponent } from './products/locales/locales.component';
import { SourcesComponent } from './products/sources/sources.component';
import { CustomFieldsComponent } from './products/custom-fields/custom-fields.component';
import { WorkflowLogComponent } from './products/workflow-log/workflow-log.component';
import { DualListComponent } from './_common/dual-list/dual-list.component';
import { ConfirmModalComponent } from './_common/confirm-modal/confirm-modal.component';
import { FileDragdropDirective } from './_helpers/file.dragdrop.directive';
import { DynamicInputComponent } from './_common/dynamic-input/dynamic-input.component';
import { UviewComponent } from './uview/uview.component';
import { CanvasComponent } from './uview/canvas/canvas.component';
import { KeyframesComponent } from './uview/keyframes/keyframes.component';
import { PageListComponent } from './uview/page-list/page-list.component';
import { DetailsComponent } from './uview/details/details.component';
import { WelcomeComponent } from './widgets/welcome/welcome.component';
import { UnauthorizePageComponent } from './unauthorize-page/unauthorize-page.component';
import { ContentFilteringComponent } from './content-filtering/content-filtering.component';
import { NotesComponent } from './products/notes/notes.component';
import { AuthCleverComponent } from './library-detail/library-authorization/auth-clever/auth-clever.component';
import { AuthClasslinkComponent } from './library-detail/library-authorization/auth-classlink/auth-classlink.component';
import { AuthGoogleClassroomComponent } from './library-detail/library-authorization/auth-google-classroom/auth-google-classroom.component';
import { ProductionDashboardComponent } from './production-dashboard/production-dashboard.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AutoFocusDirectiveDirective } from './_directives/auto-focus-directive.directive';
import { AuthMicrosoft365Component } from './library-detail/library-authorization/auth-microsoft365/auth-microsoft365.component';
import { AuthOpenathensComponent } from './library-detail/library-authorization/auth-openathens/auth-openathens.component';
@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    HttpClientModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    NgxPaginationModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    BrowserModule,
    BrowserAnimationsModule,
    // Select2Module,
    DragDropModule,
    DataTablesModule,
    NgbModule,
    FontAwesomeModule,
    NgxDatatableModule,
    FlashMessagesModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),    
    ToastrModule.forRoot({
      timeOut: 2000,      
      preventDuplicates: true,
      countDuplicates: true,
      closeButton: true,
      progressBar: true,
    }),
    LazyLoadImageModule,
  ],

  declarations: [
    TrimDirective,
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    DotNotationPipe,
    LoaderComponent,
    ResetPasswordComponent,
    PageNotFoundComponent,
    PublisherComponent,
    PublisherActivityComponent,
    PublisherStatementComponent,
    LibrarianComponent,
    LibrarianActivityComponent,
    LibrarianStatementComponent,
    PercentagePipe,
    DateFormatPipe,
    MarcRecordsComponent,
    CurrencyPipe,
    ResetAdminPasswordComponent,
    UserMaintenanceComponent,
    LibrariesComponent,
    LibraryDetailComponent,
    LibraryProfileComponent,
    LibraryServicesComponent,
    LibraryAuthorizationComponent,
    LibraryBillingComponent,
    LibraryCirculationComponent,
    AuthDemoComponent,
    AuthSamlComponent,
    AuthSip2Component,
    AuthPatronApiComponent,
    AuthIpAuthComponent,
    AuthSharedSecretComponent,
    AuthRbDigitalComponent,
    AuthSecretCodeComponent,
    AuthGoogleOauthComponent,
    AuthUserManagedComponent,
    AuthReferrerLoginComponent,
    LibraryCreateComponent,
    LibraryBalanceAdjustComponent,
    CmsUserComponent,
    CmsUserCreateComponent,
    ServiceCirculationComponent,
    AuthPrefixComponent,
    AuthLtiComponent,
    LibraryChildrenComponent,
    ProductsComponent,
    DashboardComponent,
    PromotionsComponent,
    PromotionDetailComponent,
    SettingsComponent,
    NgbdSortableHeader,
    PromotionProductsComponent,
    NgbdSortableHeader,    
    AuthSip2v2Component,
    ProductionDashboardComponent,
    AuthSip2v2Component,
    UserGroupComponent,
    RolesComponent,
    GroupsComponent,
    ComicDetailComponent,
    ProductCreateComponent,
    CategoriesComponent,
    CreditsComponent,
    PagesComponent,
    UvieComponent,
    PricingAvailabilityComponent,
    SkuComponent,
    ProductLinesComponent,
    LocalesComponent,
    SourcesComponent,
    CustomFieldsComponent,
    WorkflowLogComponent,
    DualListComponent,
    ConfirmModalComponent,
    FileDragdropDirective,
    DynamicInputComponent,
    UviewComponent,
    CanvasComponent,
    KeyframesComponent,
    PageListComponent,
    DetailsComponent,
    WelcomeComponent,
    UnauthorizePageComponent,
    ContentFilteringComponent,
    NotesComponent,
    AuthCleverComponent,
    AuthClasslinkComponent,
    AuthGoogleClassroomComponent,
    AutoFocusDirectiveDirective,
    AuthMicrosoft365Component,
    AuthOpenathensComponent,
  ],

  providers: [
    // { provide: Ability, useFactory: createAbility },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptorService, multi: true }

  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
