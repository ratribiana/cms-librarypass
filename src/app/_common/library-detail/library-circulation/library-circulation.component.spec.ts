import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryCirculationComponent } from './library-circulation.component';

describe('LibraryCirculationComponent', () => {
  let component: LibraryCirculationComponent;
  let fixture: ComponentFixture<LibraryCirculationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryCirculationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryCirculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
