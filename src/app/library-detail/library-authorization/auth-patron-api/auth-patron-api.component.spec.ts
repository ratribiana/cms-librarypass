import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthPatronApiComponent } from './auth-patron-api.component';

describe('AuthPatronApiComponent', () => {
  let component: AuthPatronApiComponent;
  let fixture: ComponentFixture<AuthPatronApiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthPatronApiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthPatronApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
