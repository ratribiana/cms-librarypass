import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import {ComicDetailComponent} from '../../products/comic-detail/comic-detail.component';
import {SkuComponent} from '../../products/sku/sku.component';
import {CategoriesComponent} from '../../products/categories/categories.component';
import {ProductLinesComponent} from '../../products/product-lines/product-lines.component';
import {LocalesComponent} from '../../products/locales/locales.component';
import {CreditsComponent} from '../../products/credits/credits.component';
import {PricingAvailabilityComponent} from '../../products/pricing-availability/pricing-availability.component';
import {WorkflowLogComponent} from '../../products/workflow-log/workflow-log.component';
import {SourcesComponent} from '../../products/sources/sources.component';
import {UvieComponent} from '../../products/uvie/uvie.component';
import {CustomFieldsComponent} from '../../products/custom-fields/custom-fields.component';
import {PagesComponent} from '../../products/pages/pages.component';
import {ProductsService} from "../../_services";
import { ToastrService } from 'ngx-toastr';
import { NotesComponent } from '../notes/notes.component';





@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.css']
})
export class ProductCreateComponent implements OnInit {
   @ViewChild(ComicDetailComponent) comicDetails;
   @ViewChild(SkuComponent) skuDetails;
   @ViewChild(CategoriesComponent) categoryDetails;
   @ViewChild(ProductLinesComponent) productLineDetails;
   @ViewChild(LocalesComponent) localeDetails;
   @ViewChild(CreditsComponent) creditsDetails;
   @ViewChild(PricingAvailabilityComponent) pricingDetails;
   @ViewChild(WorkflowLogComponent) workflowDetails;
   @ViewChild(SourcesComponent) sourcesDetails;
   @ViewChild(UvieComponent) uviewDetails;
   @ViewChild(CustomFieldsComponent) customFieldsDetails;
   @ViewChild(PagesComponent) pagesDetails;
   @ViewChild(NotesComponent) notes;


   disableAllPanel = 'disabled';
   visitedTab = ['details'];
   modeLabel = 'Create New';
   lastTabVisited = '';


  product_id: number=0;
  productData: {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private productService: ProductsService,
    private toastr:ToastrService
    ) {
  }

 ngOnInit() {
    this.disableAllPanel = 'disabled';
    this.activatedRoute.params.subscribe(params => {
       if (params['id']) {
          this.product_id = params['id'];
          this.disableAllPanel = '';
          this.modeLabel = 'Edit: ';
      }
    });
  }


  /**
   * Listent if new credit product
   */
  setProductId(productId) {
    this.disableAllPanel = '';
    this.product_id = productId;
    this.categoryDetails.initCategories(productId);
    this.creditsDetails.getProductCredits(productId);
    this.customFieldsDetails.initCustomFieldsData(productId);
    this.localeDetails.initLocales(productId);
    this.pagesDetails.initProductPages(productId);
    this.pricingDetails.initPriceTiersData(productId);
    this.productLineDetails.initProductLines(productId);
    this.skuDetails.initApplications(productId);
    this.sourcesDetails.initSourceData(productId);
    this.uviewDetails.getProduct(productId);
    this.workflowDetails.initWorkflowData(productId);
    this.notes.initNotes(productId);
  }

  setProductName(name) {
    this.modeLabel = 'Edit: ' + name;
  }


  /**
   * just to tag which tab is open
   */
  tagCurrentTab(tab) {
    if (!this.visitedTab.includes(tab)) {
        this.visitedTab.push(tab)
    }
  }

  /** just to determine which to save */
  saveDraft(tab) {
    switch(tab) {
      case 'details':
          this.comicDetails.saveDraft();
        break;

      case 'sku':
          this.skuDetails.saveDraft()
        break;

      case 'categories':
         this.categoryDetails.saveDraft();
        break;

      case 'pages':
         this.pagesDetails.saveDraft();
        break;

      case 'lines':
         this.productLineDetails.saveDraft();
        break;

      case 'locales':
         this.localeDetails.saveDraft();
        break;

      case 'credits':
         this.creditsDetails.saveDraft();
        break;

       case 'pricing':
         this.pricingDetails.saveDraft();
        break;

      case 'custom':
         this.customFieldsDetails.saveDraft();
        break;

      case 'uview':
         this.uviewDetails.saveDraft();
        break;

    }
  }


  /** just to save all visited tabs */
  processSaving() {
     return new Promise(resolve => {
        //lets loop on visited tab
        this.visitedTab.forEach(data => {
          this.saveDraft(data)
          this.lastTabVisited = data;
        });

          resolve(true);
     });
  }

  /** create entry in bundle queue */
  saveBuild() {
     this.productService.addProductToBundleQueue(this.product_id).subscribe(res => {});
  }

  /** save changes */
  async saveProduct() {
    await this.processSaving();
    // just incase user made changes on the current page
    this.toastr.success('Changes has been saved.', 'Success!');
    this.visitedTab = [this.lastTabVisited];
  }


  async saveAndBuild() {
    await this.processSaving();
    this.visitedTab = [this.lastTabVisited];
    this.saveBuild();
    this.toastr.success('Changes has been saved and build is on queue.', 'Success!');
    
  }

 async saveBuildAndCreate() {
    await this.processSaving();
    this.visitedTab = [this.lastTabVisited];
    await this.saveBuild();
    this.toastr.success('Changes has been saved and build is on queue.', 'Success!');
    this.resetAllComponent();
  }

  resetAllComponent() {
     this.disableAllPanel = 'disabled';
     this.visitedTab = ['details'];
     this.modeLabel = 'Create New';
     this.comicDetails.resetValue();
     this.skuDetails.resetValue()
     this.categoryDetails.resetValue();
     this.pagesDetails.resetValue();
     this.productLineDetails.resetValue();
     this.localeDetails.resetValue();
     this.creditsDetails.resetValue();
     this.pricingDetails.resetValue();
     this.customFieldsDetails.resetValue();
     this.uviewDetails.resetValue();
  }
}
