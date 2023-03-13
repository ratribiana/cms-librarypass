import { Component, OnInit } from '@angular/core';
import { environment } from "../../environments/environment";
import { AuthenticationService } from "../_services";
import { MiscService } from "../_services/misc.service";
import { map, tap } from "rxjs/operators";
import { ReportService } from "../_services/report.service";
import { FlashMessagesService } from "angular2-flash-messages";
import {LibraryService} from "../_services/library.service"

@Component({
  selector: 'app-marc-records',
  templateUrl: './marc-records.component.html',
  styleUrls: ['./marc-records.component.css']
})
export class MarcRecordsComponent implements OnInit {

  apiUrl = environment.apiEndpoint;
  currentUser = this.authenticationService.currentUserValue;
  library_id = this.currentUser.library_id;
  is_admin = (this.currentUser.short_codes.includes('is_admin'));
  total: number;
  reports: object;

  page: number = 1;
  limit: number = 12;
  year: any = this.misc.getCurrentYear();
  prev_years = this.misc.generatePreviousYears();

  current_month: any = this.misc.getPreviousMonth();
  month: any = !this.is_admin ? 0 : this.misc.getPreviousMonth(true);
  month_list = this.misc.generateMonthsList();

  loading: boolean;
  dropdownSettings = {};  
  schools = [];

  constructor(
    private authenticationService: AuthenticationService,
    private reportService: ReportService,
    private misc: MiscService,
    private _flashMessagesService: FlashMessagesService,
    private libraryService: LibraryService
  ) { }

  ngOnInit() {
    let self = this;
    this.getMarcReports(this.library_id, this.page);

    this.dropdownSettings= {
      singleSelection: true,
      closeDropDownOnSelection: true,
      idField: 'id',
      textField: 'name',      
      allowSearchFilter: true
    };

    if(this.is_admin){
      this.getSchoolList();
    }
  }

  filterReportsbyYear(filterVal: number) {
    this.year = filterVal;
    this.getMarcReports(this.library_id, this.page);
  }

  filterReportsbyMonth(filterVal: number) {
    this.month = filterVal;
    this.getMarcReports(this.library_id, this.page);
  }

  getMarcReports(lib_id: number, page: number) {
    this.month = null;
    this.reports = this.reportService.getMarcReports(lib_id, this.month, this.year, page, this.limit)
      .pipe(tap(res => {
        this.total = res.total;
        this.page = page;
      }), map(res => res.items));
  }

  requestMarcReports(e, type) {
    e.preventDefault();        
    if (!this.library_id) {
      this._flashMessagesService.show('Request Failed. Please select a Library for Marc Record.', { cssClass: 'alert-danger', timeout: 5000 });
      return;
    }
    
    this.reportService.requestMarcReports(this.library_id, this.currentUser.id, type)
    .subscribe(data => {
        this.loading = false;
        this.getMarcReports(this.library_id, this.page);        
    });
    

    this._flashMessagesService.show('Successfully Requested Marc Record.', { cssClass: 'alert-success', timeout: 5000 });
  }

  getSchoolList(){
    this.libraryService.getLibrariesList(0, 0, 1)
    .subscribe(res => {      
      this.schools = res.items;      
    });
  }

  onSchoolSelect(item: any){                        
    this.library_id = parseInt(item.id);        
    this.getMarcReports(this.library_id, this.page);
  }

  onSchoolDeSelect(item: any){            
    this.library_id = null;
    this.getMarcReports(this.library_id, this.page);
  }


}
