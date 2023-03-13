import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublisherActivityComponent } from './publisher-activity.component';

describe('PublisherActivityComponent', () => {
  let component: PublisherActivityComponent;
  let fixture: ComponentFixture<PublisherActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublisherActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublisherActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
