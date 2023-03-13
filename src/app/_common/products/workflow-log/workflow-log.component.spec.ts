import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowLogComponent } from './workflow-log.component';

describe('WorkflowLogComponent', () => {
  let component: WorkflowLogComponent;
  let fixture: ComponentFixture<WorkflowLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
