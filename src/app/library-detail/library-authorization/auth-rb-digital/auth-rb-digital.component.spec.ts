import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthRbDigitalComponent } from './auth-rb-digital.component';

describe('AuthRbDigitalComponent', () => {
  let component: AuthRbDigitalComponent;
  let fixture: ComponentFixture<AuthRbDigitalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthRbDigitalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthRbDigitalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
