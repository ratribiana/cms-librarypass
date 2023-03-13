import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcRecordsComponent } from './marc-records.component';

describe('MarcRecordsComponent', () => {
  let component: MarcRecordsComponent;
  let fixture: ComponentFixture<MarcRecordsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarcRecordsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarcRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
