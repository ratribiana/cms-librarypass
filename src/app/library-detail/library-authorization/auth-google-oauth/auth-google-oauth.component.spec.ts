import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthGoogleOauthComponent } from './auth-google-oauth.component';

describe('AuthGoogleOauthComponent', () => {
  let component: AuthGoogleOauthComponent;
  let fixture: ComponentFixture<AuthGoogleOauthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthGoogleOauthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthGoogleOauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
