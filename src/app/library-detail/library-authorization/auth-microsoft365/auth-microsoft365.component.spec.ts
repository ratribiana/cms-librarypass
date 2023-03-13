import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthMicrosoft365Component } from './auth-microsoft365.component';

describe('AuthMicrosoft365Component', () => {
  let component: AuthMicrosoft365Component;
  let fixture: ComponentFixture<AuthMicrosoft365Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthMicrosoft365Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthMicrosoft365Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
