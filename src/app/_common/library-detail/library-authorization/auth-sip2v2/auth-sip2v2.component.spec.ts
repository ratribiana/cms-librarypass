import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSip2v2Component } from './auth-sip2v2.component';

describe('AuthSip2v2Component', () => {
  let component: AuthSip2v2Component;
  let fixture: ComponentFixture<AuthSip2v2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthSip2v2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthSip2v2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
