import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCleverComponent } from './auth-clever.component';

describe('AuthCleverComponent', () => {
  let component: AuthCleverComponent;
  let fixture: ComponentFixture<AuthCleverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthCleverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthCleverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
