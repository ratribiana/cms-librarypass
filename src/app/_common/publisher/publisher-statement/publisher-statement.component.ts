import {Component, Injectable, Input, OnInit} from '@angular/core';
import {map, tap} from "rxjs/operators";
import {ReportService} from "../../_services/report.service";
import {MiscService} from "../../_services/misc.service";
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import {ExcelService} from '../../_services/excel.service';

@Component({
  selector: 'app-publisher-statement',
  templateUrl: './publisher-statement.component.html',
  styleUrls: ['./publisher-statement.component.css']
})

@Injectable()
export class PublisherStatementComponent implements OnInit {

  @Input() supplier_id;
  @Input() is_admin;

  reports: object;
  total: number;
  page: number = 1;
  limit: number = 12;  
  report_type = 'detached';

  current_month : any = this.misc.getPreviousMonth();
  month : any = this.misc.getPreviousMonth(true);
  month_list = this.misc.generateMonthsList();

  prev_years = this.misc.generatePreviousYears();
  year : any = this.misc.getCurrentYear();

  filter : string = this.prev_years[0];
  loading: boolean = true;

  constructor(
      private reportService: ReportService,
      private misc: MiscService,
      private excelService:ExcelService,
  ) { }

  ngOnInit() {
    if(!this.is_admin){
      this.month = 0;
    }
  }

  filterStatementReport(filterVal: any){
    this.filter = filterVal;
    this.getStatementReports(this.supplier_id, this.page, this.report_type);
  }

  getStatementReports(supp_id: number, page: number, report_type ) {
    this.report_type = report_type;
    if(!supp_id){
      return false;
    }
    this.loading = true;    
    this.reports = this.reportService.getPublisherStatementReports(supp_id, this.filter, page, this.limit)
        .pipe(tap (res => {
            this.total = res.total;
            this.page = page;
            this.loading = false;
        }), map( res => res.items ) );
  }

  exportReportToCSV(report, e){    
    let button = e.target;
    button.disabled = true
    this.loading = true;    
    // let filename = `${report.report_name}.csv`;
    let filename = report.report_name;

    //this.reportService.downloadPublisherReportData(report.id)
    this.reportService.downloadPublisherQuarterlyReport(report.publisher_id, report.quarter, report.year, this.report_type)
    .subscribe(data => {
        this.excelService.exportAsExcelFile(data, filename);
        button.disabled = false;              
        // let blob = new Blob([data], { type: 'text/csv' });
        // saveAs(blob, filename);
    });
  }

  downloadZipReport(){
    this.loading = true;
    let date = moment().format('MMDDYYYY');
    
    this.reportService.downloadPublisherZIPReports(this.supplier_id, this.filter)
      .subscribe(data => {
        this.loading = false;
        let blob = new Blob([data], { type: 'application/zip' });
        saveAs(blob, 'Publisher_Statements_Report_'+ date +'.zip');
      });
  }
}
