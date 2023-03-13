import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentFilteringComponent } from './content-filtering.component';

describe('ContentFilteringComponent', () => {
  let component: ContentFilteringComponent;
  let fixture: ComponentFixture<ContentFilteringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentFilteringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentFilteringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
