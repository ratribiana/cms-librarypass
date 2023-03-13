import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryProfileComponent } from './library-profile.component';

describe('LibraryProfileComponent', () => {
  let component: LibraryProfileComponent;
  let fixture: ComponentFixture<LibraryProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
