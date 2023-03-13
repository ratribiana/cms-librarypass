import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthIpAuthComponent } from './auth-ip-auth.component';

describe('AuthIpAuthComponent', () => {
  let component: AuthIpAuthComponent;
  let fixture: ComponentFixture<AuthIpAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthIpAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthIpAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
