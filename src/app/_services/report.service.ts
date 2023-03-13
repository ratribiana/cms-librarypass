import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class ReportService {
    // define our class properties. apiUrl is what we need
    apiUrl = environment.apiEndpoint;    

    // inject the HttpClient as http so we can use it in this class
    constructor(private http: HttpClient) {}

    // return what comes back from this http call
    getLibrarianStatementReports(id:number, month: string, year: string, page: number = 1, limit: number = 12)
    {
        return this.http.get<any>(`${this.apiUrl}/library-reports?library_id=` + id + `&month=`
            + month + `&year=` + year + `&page=` + page + `&limit=` + limit);
    }

    downloadLibraryReportData(report_id){
        let url = `${this.apiUrl}/library-reports/${report_id}?type=xls`;        

        //return this.http.get<any>(url, { responseType: 'blob' as 'json' });
        return this.http.get<any>(url);
    }

    getLibrarianActivityReport(id:number, filter: any, page: number = 1, limit: number = 25, date_range: string = '')
    {        
        filter = encodeURIComponent(filter);

        let url = `${this.apiUrl}/library-reports/checkouts?library_id=` + id + `&filter=`
            + filter + `&page=` + page + `&limit=` + limit;

        if(filter == 'custom_range'){
            url = url + date_range;
        }

        return this.http.get<any>(url);
    }

    downloadLibrarianActivityReport(id:number, filter: any, date_range: string = ''){
        filter = encodeURIComponent(filter);
                
        let url = `${this.apiUrl}/library-reports/checkouts?library_id=` + id + `&filter=`
            + filter + `&type=xls`;

        if(filter == 'custom_range'){
            url = url + date_range;
        }            

        //return this.http.get<any>(url, { responseType: 'blob' as 'json' });
        return this.http.get<any>(url);
    }


    getPublisherStatementReports(id:number, filter: string, page: number = 1, limit: number = 12)
    {
        return this.http.get<any>(`${this.apiUrl}/publisher-reports?publisher_id=` + id + `&filter=` + filter + `&page=` + page + `&limit=` + limit);
    }

    downloadPublisherReportData(report_id){        
        let url = `${this.apiUrl}/publisher-reports/${report_id}?type=csv`;     
        return this.http.get<any>(url, { responseType: 'blob' as 'json' });
    }

    downloadPublisherQuarterlyReport(publisher, quarter, year, report_type){
        let url = `${this.apiUrl}/publisher-reports/quarterly?publisher_id=${publisher}&quarter=${quarter}&year=${year}&report_type=${report_type}&type=xls`;             
        // return this.http.get<any>(url, { responseType: 'blob' as 'json' });
        return this.http.get<any>(url);
    }

    getPublisherActivityReport(id:number, filter: any, page: number = 1, limit: number = 25, date_range: string = '', 
        sort: string = '', year_month: string = '', report_type: string = ''){
        filter = encodeURIComponent(filter);
        let url = `${this.apiUrl}/publisher-reports/checkouts?publisher_id=` + id + `&filter=`
            + filter + `&page=` + page + `&limit=` + limit + `&sort_by=` + sort 
            + `&year_month=` + year_month + `&report_type=` + report_type;

        if(filter == 'custom_range'){
            url = url + date_range;
        }

        return this.http.get<any>(url);
    }

    downloadPublisherActivityReport(id:number, filter: any, date_range: string = '', sort: string = '', year_month: string = '', report_type: string = ''){
        filter = encodeURIComponent(filter);

        let url = `${this.apiUrl}/publisher-reports/checkouts?publisher_id=` + id + `&filter=` + filter 
            + `&sort_by=` + sort + `&year_month=` + year_month  + `&report_type=` + report_type + `&type=xls`;

        if(filter == 'custom_range'){
            url = url + date_range;
        }

        //return this.http.get<any>(url, { responseType: 'blob' as 'json' });
        return this.http.get<any>(url);
    }
    
    downloadLibrarianZIPReports(id:number, month: string, year:string){
       let url = `${this.apiUrl}/library-reports-zip?id=` + id + `&month=` + month + `&year=` + year;               
        return this.http.get<any>(url, { responseType: 'blob' as 'json' });
    }

    downloadPublisherZIPReports(id:number, filter: string){
        let url = `${this.apiUrl}/supplier-reports-zip?id=` + id + `&filter=` + filter;               
         return this.http.get<any>(url, { responseType: 'blob' as 'json' });
    }

    downloadPublisherQuarterlyZIPReports(report_type){
        let url = `${this.apiUrl}/publisher-reports/quarterly/all?period=prev&type=zip&report_type=${report_type}`;               
         return this.http.get<any>(url, { responseType: 'blob' as 'json' });
    }

    downloadPublishersQuarterlySummary(){
        let url = `${this.apiUrl}/publisher-reports/summary?type=quarter&period=prev`;                       
        return this.http.get<any>(url);
    }

    downloadPublishersMonthlySummary(date){
        let url = `${this.apiUrl}/publisher-reports/summary?type=monthly&date=${date}`;                       
        return this.http.get<any>(url);
    }
        
    requestMarcReports(library_id: number, user_id: number, type: string){
        return this.http
            .put<any>(`${this.apiUrl}/marc-record-request`, {library_id, user_id, type});            
    }

    getMarcReports(id:number, month: string, year: string, page: number = 1, limit: number = 12){
        return this.http.get<any>(`${this.apiUrl}/marc-records?id=` + id 
            // + `&month=`+ month 
            + `&year=` + year + `&page=` + page + `&limit=` + limit);
    }

    getSuppliersList(all:number = 0) {
        let getAll = '';

        if(all == 1){
            getAll = '?all=1';
        }
        return this.http.get<any>(`${this.apiUrl}/suppliers` + getAll);
    }

}
