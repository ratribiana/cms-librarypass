import {Component, Input, OnInit} from '@angular/core';
import {ReportService} from "../../_services/report.service";
import {map, tap} from "rxjs/operators";
import {MiscService} from "../../_services/misc.service";
import * as moment from 'moment';
import {ExcelService} from '../../_services/excel.service';
@Component({
  selector: 'app-librarian-activity',
  templateUrl: './librarian-activity.component.html',
  styleUrls: ['./librarian-activity.component.css']
})
export class LibrarianActivityComponent implements OnInit {

  @Input() library_id;
  @Input() library_ids;
  @Input() show_patron_info;

  checkouts: object;
  total: number;
  page: number = 1;
  limit: number = 25;
  filter : string = '30_days';
  isCustomRange: boolean = false;
  date_range: string = '';  
  loading: boolean = true;
  year : any = this.misc.getCurrentYear();
  prev_years = this.misc.generatePreviousYears();

  constructor(private reportService: ReportService, private misc: MiscService, private excelService:ExcelService) { }

  ngOnInit() {}

  filterActivityReports(filterVal: any){
    this.filter = filterVal;
    this.isCustomRange = false;

    if(filterVal == 'custom_range'){
      this.isCustomRange = true;
    }
    else{
      this.getLibrarianActivityReport(this.library_ids, this.page);
    }
  }

  filterCustomRange(dateFilter: any){
    let start = (dateFilter[0].getMonth() + 1) + '-' + dateFilter[0].getDate() + '-' + dateFilter[0].getFullYear();
    let end = (dateFilter[1].getMonth() + 1) + '-' + dateFilter[1].getDate() + '-' + dateFilter[1].getFullYear();

    this.date_range = '&start=' + start + '&end=' + end;
    this.getLibrarianActivityReport(this.library_ids, this.page);
  }

  getLibrarianActivityReport(lib_ids: any, page: number) {    
    let ids = lib_ids.join(",");    
    this.loading = true;
    this.checkouts = this.reportService.getLibrarianActivityReport(ids, this.filter, page, this.limit, this.date_range)
        .pipe(tap (res => {
          this.total = res.total;
          this.page = page;
          this.loading = false;
        }), map( res => res.items ) );
  }

  exportToCSV(){
    this.loading = true;
    let date = moment().format('MMDDYYYY');
    let lib_ids = this.library_ids.join(",");

    this.reportService.downloadLibrarianActivityReport(lib_ids, this.filter, this.date_range)
    .subscribe(data => {
        this.loading = false;
        this.excelService.exportAsExcelFile(data, 'Institution_Activity_Report_' + date  );        
        // let blob = new Blob([data], { type: 'text/csv' });
        // saveAs(blob, 'Institution_Activity_Report_' + date +'.csv');
    });
  }
  

}
