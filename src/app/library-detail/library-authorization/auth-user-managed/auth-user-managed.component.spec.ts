import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthUserManagedComponent } from './auth-user-managed.component';

describe('AuthUserManagedComponent', () => {
  let component: AuthUserManagedComponent;
  let fixture: ComponentFixture<AuthUserManagedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthUserManagedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthUserManagedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
