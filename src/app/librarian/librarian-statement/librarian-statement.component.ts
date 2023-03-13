import {Component, Input, OnInit} from '@angular/core';
import {ReportService} from "../../_services/report.service";
import {MiscService} from "../../_services/misc.service";
import {map, tap} from "rxjs/operators";
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import {ExcelService} from '../../_services/excel.service';
@Component({
  selector: 'app-librarian-statement',
  templateUrl: './librarian-statement.component.html',
  styleUrls: ['./librarian-statement.component.css']
})
export class LibrarianStatementComponent implements OnInit {

  @Input() library_id;
  @Input() library_ids;
  @Input() is_admin;
  @Input() show_patron_info;

  total: number;
  reports : object;

  //selectedItems: any;

  page: number = 1;
  limit: number = 12;
  year : any = this.misc.getCurrentYear();
  prev_years = this.misc.generatePreviousYears();

  current_month : any = this.misc.getPreviousMonth();
  month : any = this.misc.getPreviousMonth(true);
  month_list = this.misc.generateMonthsList();
  loading: boolean = true;
  //selectedItems = [];

  constructor(
      private reportService: ReportService,
      private misc: MiscService,
      private excelService:ExcelService,
  ) { }

  ngOnInit() {
    // if(!this.is_admin){
    //   this.month = 0;
    // }
  }

  filterStatementbyYear(filterVal: number){
    this.year = filterVal;
    console.log(this.library_ids);
    this.getLibrarianStatementReports(this.library_ids, this.page);
  }

  filterStatementbyMonth(filterVal: number){    
    this.month = filterVal;
    console.log(this.library_ids);
    this.getLibrarianStatementReports(this.library_ids, this.page);
  }

  getLibrarianStatementReports(lib_ids: any, page: number) {
    let ids = lib_ids.join(",");    
    this.loading = true;
    this.reports = this.reportService.getLibrarianStatementReports(ids, this.month, this.year, page, this.limit)
        .pipe(tap (res => {
          this.total = res.total;
          this.page = page;
          this.loading = false;
        }), map( 
          res => res.items,
        ) );

    //var selff = this;
    //this.reports.subscribe(reports => {
      //reports.map(function(data) {
        // selff.selectedItems[data.id] = 0;
      //});
    //});
  }

  downloadZipReport(){
    this.loading = true;
    let date = moment().format('MMDDYYYY');
    
    this.reportService.downloadLibrarianZIPReports(this.library_ids, this.month, this.year)
      .subscribe(data => {
        this.loading = false;
        let blob = new Blob([data], { type: 'application/zip' });
        saveAs(blob, 'Institution_Statements_Report_'+ date +'.zip');
      });
  }

  downloadLibraryReportData(report, e){
    let button = e.target;
    button.disabled = true
    this.loading = true;    
    //let filename = `${report.report_year}.${report.report_month}.${report.library_name}.Checkouts.report.csv`;
    let filename = `${report.report_year}.${report.report_month}.${report.library_name}.Checkouts.report`;
    
    this.reportService.downloadLibraryReportData(report.id)
    .subscribe(data => {
        button.disabled = false;
        this.excelService.exportAsExcelFile(data, filename  );     
        // let blob = new Blob([data], { type: 'text/csv' });
        // saveAs(blob, filename);
    });
  }
}
