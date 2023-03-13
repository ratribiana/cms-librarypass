import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { LibraryService } from "../../_services/library.service"
import { CdkDragDrop, CdkDragEnter, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FlashMessagesService } from 'angular2-flash-messages';
import * as _ from 'lodash';
import { ServiceCirculationComponent } from "./service-circulation/service-circulation.component";
import { AnnounceService } from "../../_services/announce.service"

@Component({
  selector: 'app-library-services',
  templateUrl: './library-services.component.html',
  styleUrls: ['./library-services.component.css']
})
export class LibraryServicesComponent implements OnInit {


  @Input() library_id;
  @Input() LibData;

  library_services: any;
  library_selected_services: any;
  updated_selected_services: any;
  loading: boolean = false;
  service_id: number;
  service_name: string;
  service_img: string;
  is_parent_services: boolean = false;

  @ViewChild(ServiceCirculationComponent) service_cmpt: ServiceCirculationComponent;

  constructor(
    private libraryService: LibraryService,
    private _flashMessagesService: FlashMessagesService,
    private announceService: AnnounceService,
  ) { }

  ngOnInit() {
    this.announceService.use_parent_service.subscribe(message => this.is_parent_services = message);
    this.getlibraryServices();
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  savedata(e) {
    this.loading = true;

    if (this.service_id) {
      this.service_cmpt.savedata();
    }

    this.libraryService.updateLibraryServices(this.library_id, this.updated_selected_services)
      .subscribe(
        data => {
          this.loading = false;
          this._flashMessagesService.show('Library Updated.', { cssClass: 'alert-success', timeout: 5000 });
        },
        err => {
          this.loading = false;
          this._flashMessagesService.show(err, { cssClass: 'alert-danger', timeout: 5000 });
        });
  }

  updatedata(event: CdkDragEnter<string[]>) {
    this.updated_selected_services = event.container.data;
  }

  getServices() {
    return new Promise(resolve => {
      this.libraryService.getServices()
        .subscribe(res => {
          resolve(res);
        });
    });
  }

  getSelectedServices() {
    return new Promise(resolve => {
      this.libraryService.getLibraryServices(this.library_id)
        .subscribe(res => {
          resolve(res);
        });
    });
  }

  selectService(lib_service) {
    this.service_id = lib_service.id;
    this.service_name = lib_service.name;
    this.service_img = lib_service.service_img_url;

    this.service_cmpt.loadServiceData(lib_service.id);
  }

  async getlibraryServices() {
    let lib_services = await this.getServices();
    let lib_selected_services = await this.getSelectedServices();

    if(lib_services){      
      this.service_id = lib_services[0]['id'];
    }
    
    this.library_services = _.differenceWith(lib_services, lib_selected_services, _.isEqual);

    this.updated_selected_services = lib_selected_services;
    this.library_selected_services = lib_selected_services;
  }

}
