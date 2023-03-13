import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthPrefixComponent } from './auth-prefix.component';

describe('AuthPrefixComponent', () => {
  let component: AuthPrefixComponent;
  let fixture: ComponentFixture<AuthPrefixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthPrefixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthPrefixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
