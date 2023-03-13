import {Component, Input, OnInit,  QueryList, ViewChildren} from '@angular/core';
import {map, tap} from "rxjs/operators";
import { UntypedFormControl } from '@angular/forms';
import {ReportService} from "../../_services/report.service";
import * as moment from 'moment';
import { Moment } from 'moment';
import {NgbdSortableHeader, SortEvent} from '../../_helpers/sortable.directive';
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE, OwlDateTimeComponent, OwlDateTimeFormats } from 'ng-pick-datetime';
import { MomentDateTimeAdapter, OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS } from 'ng-pick-datetime/date-time/adapter/moment-adapter/moment-date-time-adapter.class';
import {ExcelService} from '../../_services/excel.service';


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
  selector: 'app-publisher-activity',
  templateUrl: './publisher-activity.component.html',
  styleUrls: ['./publisher-activity.component.css'],
  providers: [
        {provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE]},
        {provide: OWL_DATE_TIME_FORMATS, useValue: MY_MOMENT_DATE_TIME_FORMATS},
    ]
})
export class PublisherActivityComponent implements OnInit {
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  @Input() supplier_id;
  @Input() supplier_name;
  @Input() is_admin;  

  checkouts: object;

  page: number = 1;
  limit: number = 25;
  filter : string = 'quarter_now';
  isCustomRange: boolean = false;
  date_range: string = '';  
  total: number = 0;
  total_amount: number = 0;
  total_checkouts: number = 0;
  total_publisher_portion: number = 0;
  payout_rate = '';
  loading: boolean = true;
  sort: string = '';  
  month_year = new UntypedFormControl(moment());

  constructor(
    private reportService: ReportService,
    private excelService:ExcelService,
    ) {}

  report_type = 'detached';

  ngOnInit() {}

  filterActivityReports(filterVal: any){
    this.filter = filterVal;
    this.isCustomRange = false;

    if(filterVal == 'custom_range'){
      this.isCustomRange = true;
    }
    else{
      this.getActivityReports(this.supplier_id, this.page, this.report_type);
    }
  }

  filterCustomRange(){
    this.getActivityReports(this.supplier_id, this.page, this.report_type);
  }

  getActivityReports(supp_id: number, page: number, report_type) {
    this.report_type = report_type;
    if(!supp_id){
      return false;
    }

    let filterYearMonth = '';
    if (this.isCustomRange) {
      filterYearMonth = this.month_year.value.format('YYYY-MM');
    }

    this.checkouts = this.reportService.getPublisherActivityReport(supp_id, this.filter, page, this.limit, 
      this.date_range, this.sort, filterYearMonth, this.report_type)
        .pipe(tap (res => {          
          this.loading = false;          
          this.total = res.total['pagination_total'];
          this.total_checkouts = res.total['total_checkouts'];
          this.total_amount =  res.total['Amount'];
          this.total_publisher_portion =  res.total['Publisher Portion'];
          this.payout_rate =  res.total['payout_rate'];
          this.page = page;
          
        }), map( res => res.items ) );        
  }

  exportToCSV(){
    this.loading = true;
    let date = moment().format('MMDDYYYY');

    let filterYearMonth = '';
    if (this.isCustomRange) {
      filterYearMonth = this.month_year.value.format('YYYY-MM');
    }

    this.reportService.downloadPublisherActivityReport(this.supplier_id, this.filter, this.date_range, this.sort, filterYearMonth, this.report_type)
    .subscribe(data => {
      this.loading = false;
      this.excelService.exportAsExcelFile(data, 
        'Publisher ' + this.supplier_name + ' Activity Report'        
        );        
      // let blob = new Blob([data], { type: 'text/csv' });
      // saveAs(blob, 'PUBLISHER ' + this.supplier_name + ' Activity Report ' + date + '.csv');
    });
  }

   onSort({column, direction}: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.loading = true;
    this.sort = direction != '' ? column + '.' + direction : '';
    this.getActivityReports(this.supplier_id, this.page, this.report_type);
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
        this.getActivityReports(this.supplier_id, this.page, this.report_type);
    }
}
