import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryBalanceAdjustComponent } from './library-balance-adjust.component';

describe('LibraryBalanceAdjustComponent', () => {
  let component: LibraryBalanceAdjustComponent;
  let fixture: ComponentFixture<LibraryBalanceAdjustComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryBalanceAdjustComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryBalanceAdjustComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
