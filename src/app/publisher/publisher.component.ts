import {Component, OnInit, ViewChild} from '@angular/core';
import {environment} from "../../environments/environment";
import {AuthenticationService} from "../_services";
import {ReportService} from "../_services/report.service";
import {PublisherStatementComponent} from "./publisher-statement/publisher-statement.component";
import {PublisherActivityComponent} from "./publisher-activity/publisher-activity.component";
import { ToastrService } from 'ngx-toastr';
import {HttpErrorResponse} from "@angular/common/http";
import {ExcelService} from '../_services/excel.service';
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE, OwlDateTimeComponent, OwlDateTimeFormats } from 'ng-pick-datetime';
import { MomentDateTimeAdapter, OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS } from 'ng-pick-datetime/date-time/adapter/moment-adapter/moment-date-time-adapter.class';
import { UntypedFormControl } from '@angular/forms';
import * as moment from 'moment';
import { Moment } from 'moment';
import { saveAs } from 'file-saver';

export const MY_MOMENT_DATE_TIME_FORMATS: OwlDateTimeFormats = {
  parseInput: 'YYYY-MM',
  fullPickerInput: 'l LT',
  datePickerInput: 'YYYY-MM',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};
@Component({
  selector: 'app-publisher',
  templateUrl: './publisher.component.html',
  styleUrls: ['./publisher.component.css'],
  providers: [
    {provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE]},
    {provide: OWL_DATE_TIME_FORMATS, useValue: MY_MOMENT_DATE_TIME_FORMATS},
]
})
export class PublisherComponent implements OnInit {

  apiUrl = environment.apiEndpoint;
  currentUser = this.authenticationService.currentUserValue;
  is_admin = (this.currentUser.short_codes.includes('is_admin'));
  dropdownSettings = {};  
  suppliers = [];

  supplier_id = this.currentUser.supplier_id;
  supplier_name: string = this.currentUser.supplier_name;  
  page: number = 1;
  loading: boolean = false;
  report_type = 'detached';
  month_year = new UntypedFormControl(moment());


  @ViewChild(PublisherStatementComponent) pub_statement:PublisherStatementComponent;
  @ViewChild(PublisherActivityComponent) pub_activity:PublisherActivityComponent;

  constructor(
      private authenticationService: AuthenticationService,
      private reportService: ReportService,      
      private toastr: ToastrService,
      private excelService:ExcelService,
  ) {}

  ngOnInit() {  
    this.dropdownSettings= {
        singleSelection: true,
        closeDropDownOnSelection: true,
        idField: 'id',
        textField: 'name',      
        allowSearchFilter: true
    };

    if(this.is_admin){
      this.getPublisherList();
    }    
  }

  ngAfterViewInit() {
    this.pub_statement.getStatementReports(this.supplier_id, this.page, this.report_type);
    this.pub_activity.getActivityReports(this.supplier_id, this.page, this.report_type);
  }

  getPublisherList(){
    this.reportService.getSuppliersList(1)
    .subscribe(res => {
      this.suppliers = res.items;      
    });
  }

  onPublisherSelect(item: any){                    
    this.supplier_id = parseInt(item.id);   
    this.supplier_name = item.name;
    this.pub_statement.getStatementReports(this.supplier_id, this.page, this.report_type);
    this.pub_activity.getActivityReports(this.supplier_id, this.page, this.report_type);
  }

  onPublisherDeSelect(item: any){        
    this.supplier_id = null;
    this.supplier_name = '';   
    this.pub_statement.getStatementReports(this.supplier_id, this.page, this.report_type);
    this.pub_activity.getActivityReports(this.supplier_id, this.page, this.report_type);
  }

  switchReportType(reportType){
    this.report_type = reportType;
    this.pub_statement.getStatementReports(this.supplier_id, this.page, this.report_type);
    this.pub_activity.getActivityReports(this.supplier_id, this.page, this.report_type);
  }


  downloadZipReport(e){
    e.preventDefault();     
    this.loading = true;
    
    this.reportService.downloadPublisherQuarterlyZIPReports(this.report_type)
      .subscribe(data => {        
        let blob = new Blob([data], { type: 'application/zip' });
        saveAs(blob, 'Publisher_Quarterly_Report.zip');
        this.loading = false;
      },
      (error: HttpErrorResponse) => {        
        this.loading = false;
        this.toastr.info('Previous Quarter Report is empty.', 'Error', {
          timeOut: 5000,
        });
      });
  }

  downloadMonthlySummaryReport(e){
    e.preventDefault();     
    this.loading = true;
    let filename = 'Publishers_Monthly_Summary';
    let date = this.month_year.value.format('YYYY-MM');

    this.reportService.downloadPublishersMonthlySummary(date)
    .subscribe(data => {
        this.excelService.exportAsExcelFile(data, filename);
        this.loading = false;         
    },
    (error: HttpErrorResponse) => {        
      this.loading = false;
      this.toastr.info('Monthly Summary Report is empty.', 'Error', {
        timeOut: 5000,
      });
    }); 
  }

  downloadSummaryReport(e){
    e.preventDefault();     
    this.loading = true;
    let filename = 'Publishers_Quarterly_Summary';

    this.reportService.downloadPublishersQuarterlySummary()
    .subscribe(data => {
        this.excelService.exportAsExcelFile(data, filename);
        this.loading = false;         
    },
    (error: HttpErrorResponse) => {        
      this.loading = false;
      this.toastr.info('Previous Quarter Report is empty.', 'Error', {
        timeOut: 5000,
      });
    }); 
  }

  chosenYearHandler( normalizedYear: Moment ) {
      const ctrlValue = this.month_year.value;
      ctrlValue.year(normalizedYear.year());
      this.month_year.setValue(ctrlValue);
  }

  chosenMonthHandler( normalizedMonth: Moment, datepicker: OwlDateTimeComponent<Moment> ) {
      const ctrlValue = this.month_year.value;
      ctrlValue.month(normalizedMonth.month());
      this.month_year.setValue(ctrlValue);
      datepicker.close();      
  }
}
