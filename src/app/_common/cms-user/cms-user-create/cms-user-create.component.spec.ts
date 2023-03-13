import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsUserCreateComponent } from './cms-user-create.component';

describe('CmsUserCreateComponent', () => {
  let component: CmsUserCreateComponent;
  let fixture: ComponentFixture<CmsUserCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsUserCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsUserCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
