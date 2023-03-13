import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCirculationComponent } from './service-circulation.component';

describe('ServiceCirculationComponent', () => {
  let component: ServiceCirculationComponent;
  let fixture: ComponentFixture<ServiceCirculationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceCirculationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCirculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
