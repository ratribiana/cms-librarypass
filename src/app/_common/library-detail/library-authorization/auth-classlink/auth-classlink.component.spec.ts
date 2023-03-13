import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthClasslinkComponent } from './auth-classlink.component';

describe('AuthClasslinkComponent', () => {
  let component: AuthClasslinkComponent;
  let fixture: ComponentFixture<AuthClasslinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthClasslinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthClasslinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
