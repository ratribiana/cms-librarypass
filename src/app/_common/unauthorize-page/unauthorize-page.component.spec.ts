import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorizePageComponent } from './unauthorize-page.component';

describe('UnauthorizePageComponent', () => {
  let component: UnauthorizePageComponent;
  let fixture: ComponentFixture<UnauthorizePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnauthorizePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnauthorizePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
