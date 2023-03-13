import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublisherStatementComponent } from './publisher-statement.component';

describe('PublisherStatementComponent', () => {
  let component: PublisherStatementComponent;
  let fixture: ComponentFixture<PublisherStatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublisherStatementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublisherStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
