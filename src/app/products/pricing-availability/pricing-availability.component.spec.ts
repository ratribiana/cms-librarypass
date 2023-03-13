import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingAvailabilityComponent } from './pricing-availability.component';

describe('PricingAvailabilityComponent', () => {
  let component: PricingAvailabilityComponent;
  let fixture: ComponentFixture<PricingAvailabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PricingAvailabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PricingAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
