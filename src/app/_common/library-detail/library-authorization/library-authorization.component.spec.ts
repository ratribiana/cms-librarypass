import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryAuthorizationComponent } from './library-authorization.component';

describe('LibraryAuthorizationComponent', () => {
  let component: LibraryAuthorizationComponent;
  let fixture: ComponentFixture<LibraryAuthorizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryAuthorizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryAuthorizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
