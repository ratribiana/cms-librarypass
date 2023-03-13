import { Component, OnInit, Input } from '@angular/core';
import {ReportService, MiscService, ProductsService} from "../../_services";
import {map, tap} from "rxjs/operators";


@Component({
  selector: 'app-workflow-log',
  templateUrl: './workflow-log.component.html',
  styleUrls: ['./workflow-log.component.css']
})
export class WorkflowLogComponent implements OnInit {
  @Input() product_id;
  workflow_logs: object;
  total: number;
  page: number = 1;
  limit: number = 15;
  filter: string = '';

  constructor(
    private productService: ProductsService,   
    ) { }

  ngOnInit() {
    if (this.product_id > 0) { 
      this.initWorkflowData(null);
    }
  }

  initWorkflowData(productId) {
    if (productId) {
      this.product_id = productId;
    }
    this.getWorkflowlogs(this.page, this.filter);
  }

  resetValue() {
    this.product_id = 0;
  }

  /** this will search using keyword */
  filterRecords(evt) {
     this.filter = evt.target.value;
    this.getWorkflowlogs(this.page, this.filter);
  }


  getWorkflowlogs(page: number, filter: string=''){
     this.workflow_logs = this.productService.getWorkflowLogs(this.product_id, page, filter, this.limit)
        .pipe(tap (res => {
          this.total = res.total;
          this.page = page;
        }), map( res => res.items ) );
  }

}
