import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibrarianActivityComponent } from './librarian-activity.component';

describe('LibrarianActivityComponent', () => {
  let component: LibrarianActivityComponent;
  let fixture: ComponentFixture<LibrarianActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibrarianActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibrarianActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
