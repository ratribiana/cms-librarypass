import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSip2Component } from './auth-sip2.component';

describe('AuthSip2Component', () => {
  let component: AuthSip2Component;
  let fixture: ComponentFixture<AuthSip2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthSip2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthSip2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
