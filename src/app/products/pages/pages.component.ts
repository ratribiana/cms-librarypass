import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CdkDrag, CdkDragStart,  CdkDropList, CdkDropListGroup, 
          CdkDragMove, CdkDragEnter, moveItemInArray} from "@angular/cdk/drag-drop";
import {ViewportRuler} from "@angular/cdk/overlay";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { faWindowClose, faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import { ProductsService} from "../../_services";
import {ConfirmModalComponent, ModalConfig} from '../../_common/confirm-modal'
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css']
})
export class PagesComponent implements OnInit {
  @ViewChild(CdkDropListGroup) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList) placeholder: CdkDropList;

  @ViewChild('modalDelete')  modalDelete: ConfirmModalComponent;
  @ViewChild('modalInvalid')  modalInvalid: ConfirmModalComponent;
  @ViewChild('modalImport')  modalImport: ConfirmModalComponent;


  @Input() product_id;
  faWindowClose = faWindowClose;
  faInfoCircle = faInfoCircle;
  serverError = '';
  previewImageSrc = '';
  pageRequestLimit = 10;
  totalPages = 0;


  modalConfig: ModalConfig = {
    modalTitle: 'Import Remote File',
    onDismiss: () => {
      return true;
    },
    dismissButtonLabel: 'Import',
    onClose: () => {
      return false;
    },
    closeButtonLabel: 'Close',
    backdropStatic: true,
    disableDismissButton: true,
  }

  detailForm = new FormGroup({
    waid_format: new FormControl(0),
    disable_trim: new FormControl(0),
  });

  ftpForm = new FormGroup({
    source_url: new FormControl('', [Validators.required]),
    login: new FormControl(''),
    password: new FormControl(''),
    s3_source: new FormControl(0),
    type: new FormControl(0),
    replace_pages: new FormControl(0),
    disable_trimbox: new FormControl(0),
    disable_trim: new FormControl(0),
   });

  allowed_types = '.jpg,.jpeg,.gif,.tif,.tiff,.gif';
  deleteAllPages = false;
  queueList = [];

  /** confirmation to delete  */
  modalDeleteConfig: ModalConfig = {
    modalTitle: 'Warning',
    onDismiss: () => {
      return true;
    },
    dismissButtonLabel: 'Delete',
    onClose: () => {
      return false;
    },
    closeButtonLabel: 'Cancel',
    backdropStatic: true,
  }

  /** alert box for invalive */
  modalInvalidConfig: ModalConfig = {
    modalTitle: 'Error',
    dismissButtonLabel: 'Ok',
    hideCloseButton: true,
  }

  files: any[] = [];

  fileNames = '';

  pagesList = [];
  activeContainer;
  target: CdkDropList;
  targetIndex: number;
  source: CdkDropList;
  sourceIndex: number;
  dragIndex: number;
  deletePageSrc = '';

  constructor(
    private viewportRuler: ViewportRuler,
    private productService: ProductsService,
    ) { 
      this.target = null;
      this.source = null;
  }

  ngOnInit() {
    if (this.product_id > 0) {
      this.initProductPages(null);
   }
  }


  initProductPages(productId) {
    if (productId) {
      this.product_id = productId;
    }
     this.lazyRequestProductPages();
     this.getProductPageRemoteQueue();
  }

  resetValue() {
    this.detailForm.reset(this.detailForm.value);
    this.product_id = 0;
    this.pagesList = [];
  }



  saveDraft() {
    if (this.product_id) {
      this.productService.updateProduct(this.product_id, this.detailForm.value)
      .subscribe(
        data => { },
        err => {});
    } 
  }

  /** lets get if there is a queue in ftp */
  getProductPageRemoteQueue() {
    this.productService.getProductPageRemoteQueue(this.product_id).subscribe(res => {
      this.queueList = res.items;
    });
  }

  /** import evetnt */
  async onImportRemoteFile() {
    let action = await this.modalImport.open();
    if (action == true){
       this.productService.createProductPageRemoteQueue(this.product_id, this.ftpForm.value).subscribe(res => {
          this.getProductPageRemoteQueue();
        });
       this.resetFtpInfo();
    }
  }

  /** this will  close preivee */
  closePreview() {
    this.previewImageSrc = '';
  }

  /** preview function */
  showPreview(url) {
    this.previewImageSrc = url;
  }

  /** function to reverse teh order of pages */
  onReversePage() {
    this.pagesList.reverse();
    this.saveNewPageOrder();
  }

/** function to delete all pages */
 async onDeleteAllPage() {
    this.deleteAllPages = true;
    let action = await this.modalDelete.open();
     if (action == true){ 
      this.pagesList = [];
       this.productService.deleteAllProductPage(this.product_id).subscribe(res => {
        });
     }
  }

  /** On delete page */
  async onDeletePage(e, id) {
    e.preventDefault();
    this.deleteAllPages = false;
    let recToDelete = this.getIndexOfPages(id);
    this.deletePageSrc = recToDelete.value.thumbnail_url;

    let action = await this.modalDelete.open();
     if (action == true){ 
        this.productService.deleteProductPage(this.product_id, recToDelete.value.id).subscribe(res => {
          this.pagesList.splice(recToDelete.index, 1)
        });
     }
  }

  /** just to get one record in the list */
  getIndexOfPages(id) {
    let result = {
      index: null,
      value: {thumbnail_url:'', id: 0}
    };
    this.pagesList.forEach((rec, i) =>{
          if(rec.id == id){
            result = {
              index: i,
              value: rec
            };
            return;
          }
      });

    return result;
  }

  /** on upload files */
  onFileChange(pFileList: File[]){
    this.files = Object.keys(pFileList).map(key => pFileList[key]);

    if (this.files.length < 1) {
      return;
    }

    this.files.forEach(f=>{
      let currentIndex = this.pagesList.length;

      let data = new FormData();
        data.append('file', f);
        data.append('ui_index', currentIndex.toString());
        this.pagesList.push({thumbnail_status: 0, name: f.name});
        this.productService.addProductPage(this.product_id, data).subscribe(res => {
            this.pagesList.splice(res.sort_number, 1, res);
        },
        (error) => {
             this.pagesList.splice(currentIndex, 1)
             this.serverError = error;
             this.modalInvalid.open();

        });
    })
 
    
  }

  /** on ivalid file upload */
  onFileInvalid(pFileList: File[]){
     this.serverError = '';
    this.files = Object.keys(pFileList).map(key => pFileList[key]);

    let filesInvalid = [];

    this.files.forEach(f => {
      filesInvalid.push(f.name)
    })

    this.fileNames = filesInvalid.join();
    this.modalInvalid.open();
  }

  /** submit new order of the pages */
  saveNewPageOrder() {
    let sortOrder = [];
     this.pagesList.forEach((rec, i) =>{ 
        sortOrder.push(rec.id);
     });

    this.productService.updateProductPageOrder(this.product_id, {pages: sortOrder}).subscribe(res => {});
  }

  /** just to clean the entry */
  resetFtpInfo() {
     this.ftpForm.setValue({ 
        source_url: '',
        login: '',
        password: '',
        s3_source: 0,
        type: 0,
        replace_pages: '0',
        disable_trimbox: '0',
        disable_trim: '0',
     });

     this.modalConfig.disableDismissButton = true;
  }

  /**
   * enable disable import button dpending
   * on the input or source_url
   * @param {[type]} ev [description]
   */
  onChangeUrl(ev){
    let url = ev.target.value;
    url = url.toLowerCase();
    // lets check if atleast a valid entry
    if (url.includes('http://') || url.includes('ftp://')) {
        this.modalConfig.disableDismissButton  = false;
    } else {
      this.modalConfig.disableDismissButton  = true;
    }

  }



  ////////////////////////////////////////
  /// BELOW IS FOR DRAG DROP FUNCTION ////
  ////////////////////////////////////////
  ngAfterViewInit() {
    let phElement = this.placeholder.element.nativeElement;

    phElement.style.display = 'none';
    phElement.parentElement.removeChild(phElement);
  }

  /** when its droped */
   onCardDropped() {
    if (!this.target)
      return;

    let phElement = this.placeholder.element.nativeElement;
    let parent = phElement.parentElement;

    phElement.style.display = 'none';

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(this.source.element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    if (this.sourceIndex != this.targetIndex){
      moveItemInArray(this.pagesList, this.sourceIndex, this.targetIndex);
    }

    this.saveNewPageOrder();
  }

  /** when it enters the place holder */
  onCardEnter = (drag: CdkDrag, drop: CdkDropList) => {
    if (drop == this.placeholder)
      return true;

    if (drop != this.activeContainer)
      return false;

    let phElement = this.placeholder.element.nativeElement;
    let sourceElement = drag.dropContainer.element.nativeElement;
    let dropElement = drop.element.nativeElement;

    let dragIndex = Array.prototype.indexOf.call(dropElement.parentElement.children, (this.source ? phElement : sourceElement));
    let dropIndex = Array.prototype.indexOf.call(dropElement.parentElement.children, dropElement);

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = drag.dropContainer;

      phElement.style.width = sourceElement.clientWidth + 'px';
      phElement.style.height = sourceElement.clientHeight + 'px';
      
      sourceElement.parentElement.removeChild(sourceElement);
    }

    this.targetIndex = dropIndex;
    this.target = drop;

    phElement.style.display = '';
    dropElement.parentElement.insertBefore(phElement, (dropIndex > dragIndex 
      ? dropElement.nextSibling : dropElement));

    // this.placeholder.enter(drag, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);
    this.placeholder._dropListRef.enter(drag._dragRef, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);
    return false;
  }

  /** when a card is drag or move in place holder */
  dragMoved(e: CdkDragMove) {
    let point = this.getPointerPositionOnPage(e.event);

    this.listGroup._items.forEach(dropList => {
      const {top, bottom, left, right} = dropList.element.nativeElement.getBoundingClientRect();

      if (point.y >= top && point.y <= bottom && point.x >= left && point.x <= right){
        this.activeContainer = dropList;
        return;
      }
    });
  }

  /** Determines the point of the page that was touched by the user. */
  getPointerPositionOnPage(event: MouseEvent | TouchEvent) {
    // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
    const point = __isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
    const scrollPosition = this.viewportRuler.getViewportScrollPosition();

        return {
            x: point.pageX - scrollPosition.left,
            y: point.pageY - scrollPosition.top
        };
    }


    lazyRequestProductPages() {
        this.productService.getProductPages(this.product_id, 1, this.pageRequestLimit, '', 1).subscribe(res => {
          this.pagesList = res.items
          this.totalPages = res.total_pages;
          this.getProductPages(2);
      });
    }

    getProductPages(page){
      let numRequest = Math.ceil(this.totalPages / this.pageRequestLimit);
      if(page > numRequest){
        return;
      }
      this.productService.getProductPages(this.product_id,  page, this.pageRequestLimit, '', 1).subscribe(res => {
          res.items.forEach(element => {
            this.pagesList.push(element)
          });
          this.getProductPages(page + 1);
      });
    }

    /** download image */
    downloadImage(url, name){
      // let blob = new Blob([url], { type: 'image/png' });
      saveAs(url, name+'.png');
    }
}


/** Determines whether an event is a touch event. */
function __isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return event.type.startsWith('touch');
}