import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionProductsComponent } from './promotion-products.component';

describe('PromotionProductsComponent', () => {
  let component: PromotionProductsComponent;
  let fixture: ComponentFixture<PromotionProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromotionProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotionProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
