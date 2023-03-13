import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthOpenathensComponent } from './auth-openathens.component';

describe('AuthOpenathensComponent', () => {
  let component: AuthOpenathensComponent;
  let fixture: ComponentFixture<AuthOpenathensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthOpenathensComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthOpenathensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
