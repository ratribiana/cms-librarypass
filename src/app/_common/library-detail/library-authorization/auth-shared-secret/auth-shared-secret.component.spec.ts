import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSharedSecretComponent } from './auth-shared-secret.component';

describe('AuthSharedSecretComponent', () => {
  let component: AuthSharedSecretComponent;
  let fixture: ComponentFixture<AuthSharedSecretComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthSharedSecretComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthSharedSecretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
