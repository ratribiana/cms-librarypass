import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetAdminPasswordComponent } from './reset-admin-password.component';

describe('ResetAdminPasswordComponent', () => {
  let component: ResetAdminPasswordComponent;
  let fixture: ComponentFixture<ResetAdminPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetAdminPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetAdminPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
