import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthGoogleClassroomComponent } from './auth-google-classroom.component';

describe('AuthGoogleClassroomComponent', () => {
  let component: AuthGoogleClassroomComponent;
  let fixture: ComponentFixture<AuthGoogleClassroomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthGoogleClassroomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthGoogleClassroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
