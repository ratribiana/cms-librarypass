import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryBillingComponent } from './library-billing.component';

describe('LibraryBillingComponent', () => {
  let component: LibraryBillingComponent;
  let fixture: ComponentFixture<LibraryBillingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryBillingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
