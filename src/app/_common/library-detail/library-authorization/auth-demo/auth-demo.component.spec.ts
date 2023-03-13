import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthDemoComponent } from './auth-demo.component';

describe('AuthDemoComponent', () => {
  let component: AuthDemoComponent;
  let fixture: ComponentFixture<AuthDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
