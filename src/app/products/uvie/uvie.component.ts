import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {Observable, Subject, merge} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, switchMap} from 'rxjs/operators';
import { UserService, ProductsService} from "../../_services";
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { faSearch} from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-uvie',
  templateUrl: './uvie.component.html',
  styleUrls: ['./uvie.component.css']
})
export class UvieComponent implements OnInit {
  @ViewChild('instance') instance: NgbTypeahead;
  @Input() product_id;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  faSearch = faSearch;
  model: any;


  detailForm = new UntypedFormGroup({
    uview_allowed: new UntypedFormControl(0),
    uview_publish: new UntypedFormControl(0),
    uview_export: new UntypedFormControl(0),
  });

  constructor(
  private productService: ProductsService,
  private userService: UserService,
  ) { }

  ngOnInit() {
    if (this.product_id > 0) {
     this.getProduct(null);
   }
  }

  formatter = (x: { name: string }) => x.name;

  search = (text$: Observable<string>) => {

    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
     switchMap(
        term => this.getUsersInLibraryIverse(term),
      )
    );
  }

  getUsersInLibraryIverse(keyword: any) {
    if (keyword.length > 2) {
      return this.userService.searchLibraryIversAuthUsers(keyword).pipe();
    }
  }

  resetValue() {
    this.detailForm.reset(this.detailForm.value);
    this.product_id = 0;
  }

  /** get product info */
  getProduct(productId) {
    if (productId) {
      this.product_id = productId;
    }
      this.productService.getProduct(this.product_id).subscribe(res => {
             this.detailForm.patchValue({
                uview_allowed:   parseInt(res.uview_allowed),
                uview_publish:  parseInt(res.uview_publish),
                uview_export:  parseInt(res.uview_export),
            });      });
  }

  saveDraft() {
    this.productService.updateProduct(this.product_id, this.detailForm.value)
      .subscribe(
        data => {
          this.product_id = data.id;
        },
        err => {});
  }


  addUser(e) {
    console.log(this.model)
  }

}
