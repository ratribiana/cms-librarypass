import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthLtiComponent } from './auth-lti.component';

describe('AuthLtiComponent', () => {
  let component: AuthLtiComponent;
  let fixture: ComponentFixture<AuthLtiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthLtiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthLtiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
