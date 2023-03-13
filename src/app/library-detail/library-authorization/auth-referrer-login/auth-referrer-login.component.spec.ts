import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthReferrerLoginComponent } from './auth-referrer-login.component';

describe('AuthReferrerLoginComponent', () => {
  let component: AuthReferrerLoginComponent;
  let fixture: ComponentFixture<AuthReferrerLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthReferrerLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthReferrerLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
