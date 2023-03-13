import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSecretCodeComponent } from './auth-secret-code.component';

describe('AuthSecretCodeComponent', () => {
  let component: AuthSecretCodeComponent;
  let fixture: ComponentFixture<AuthSecretCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthSecretCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthSecretCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
