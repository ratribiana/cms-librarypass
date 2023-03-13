import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UviewComponent } from './uview.component';

describe('UviewComponent', () => {
  let component: UviewComponent;
  let fixture: ComponentFixture<UviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
