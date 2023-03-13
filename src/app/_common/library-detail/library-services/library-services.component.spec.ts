import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryServicesComponent } from './library-services.component';

describe('LibraryServicesComponent', () => {
  let component: LibraryServicesComponent;
  let fixture: ComponentFixture<LibraryServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
