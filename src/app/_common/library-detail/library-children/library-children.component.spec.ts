import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryChildrenComponent } from './library-children.component';

describe('LibraryChildrenComponent', () => {
  let component: LibraryChildrenComponent;
  let fixture: ComponentFixture<LibraryChildrenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryChildrenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryChildrenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
