import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibrarianStatementComponent } from './librarian-statement.component';

describe('LibrarianStatementComponent', () => {
  let component: LibrarianStatementComponent;
  let fixture: ComponentFixture<LibrarianStatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibrarianStatementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibrarianStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
