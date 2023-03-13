import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UvieComponent } from './uvie.component';

describe('UvieComponent', () => {
  let component: UvieComponent;
  let fixture: ComponentFixture<UvieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UvieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UvieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
