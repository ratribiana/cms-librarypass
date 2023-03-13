import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { LibraryService } from "../_services/library.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-library-detail',
  templateUrl: './library-detail.component.html',
  styleUrls: ['./library-detail.component.css']
})
export class LibraryDetailComponent implements OnInit {

  series: object;
  library_series: object;
  library_id: number;
  max_weekly_books_per_user: string;
  LibData: any = null;
  authSecretCode: string = '';
  library_name: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private libraryService: LibraryService,
    private router: Router,
  ) { }

  ngOnInit() {

    this.activatedRoute.params.subscribe(params => {
      this.library_id = params['id']; // (+) converts string 'id' to a number    
    });

    this.getlibraryData();
  }

  async getlibraryData() {
    if (this.library_id) {
      this.LibData = await this.getLibData();
      this.max_weekly_books_per_user = this.LibData.max_weekly_books_per_user;
      this.authSecretCode = this.LibData.auth_secret_code;
      this.library_name = this.LibData.name;
    }



    // if(!this.LibData.id){
    //   //this.router.navigate(['/libraries']);
    // }
  }

  getLibData() {
    return new Promise(resolve => {
      this.libraryService.getLibrary(this.library_id)
        .subscribe(res => {
          resolve(res);
        });
    });
  }


}
