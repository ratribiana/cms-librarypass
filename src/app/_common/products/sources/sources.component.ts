import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {ProductsService} from "../../_services";
import {ConfirmModalComponent, ModalConfig} from '../../_common/confirm-modal';
import { faInfoCircle, faWindowClose, faDownload} from '@fortawesome/free-solid-svg-icons';



@Component({
  selector: 'app-sources',
  templateUrl: './sources.component.html',
  styleUrls: ['./sources.component.css']
})
export class SourcesComponent implements OnInit {
  @ViewChild('modalImport')  modalImport: ConfirmModalComponent;
  @ViewChild('modalInvalid')  modalInvalid: ConfirmModalComponent;
  @Input() product_id;

  printReadyImport = false;
  isMultipleFiles = false;
  fileName = '';
  validExtension ='';
  faInfoCircle = faInfoCircle;
  faWindowClose = faWindowClose;
  faDownload = faDownload;
  assetFiles = [];

  queueList = [];

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

  modalInvalidConfig: ModalConfig = {
    modalTitle: 'Error',
    dismissButtonLabel: 'Ok',
    hideCloseButton: true,
  }

  files: any[] = [];
  allowed_types_printready = '.pdf,.zip';
  allowed_types_indesign = '.psd,.zip';

  detailForm = new FormGroup({
    source_url: new FormControl('', [Validators.required]),
    type: new FormControl(0),
    login: new FormControl(''),
    password: new FormControl('')
   });


  constructor(
    private productService: ProductsService    
    ) { }

  ngOnInit() {
    if(this.product_id > 0) {
     this.initSourceData(null);
    }
  }


  resetValue() {
    this.detailForm.reset(this.detailForm.value);
    this.product_id = 0;
    this.assetFiles = [];
  }

  initSourceData(productId) {
    if (productId) {
      this.product_id = productId;
    }
    this.getProductSourceRemoteQueue();
    this.getAssetsUploaded();
  }

  /** lets get the assets files */
  getAssetsUploaded() {
    this.productService.getProductSourceAssets(this.product_id).subscribe(res => {
      this.assetFiles = res.items;
    });
  }

  /**
   * on confirm import original file
   */
  async onClickImportPrintReady() {
    this.printReadyImport = true;

    let action = await this.modalImport.open();

    if (action == true){
        this.detailForm.patchValue({ type: 1 })
        this.productService.updateProductImportPrintReady(this.product_id, this.detailForm.value)
        .subscribe( data => {
          this.getProductSourceRemoteQueue();
        },err => {});

    }

   this.resetFtpInfo();
  }

  /**
   * on confirm import indesign
   */
  async onClickImportInDesign(){
    this.printReadyImport = false;
    let action = await this.modalImport.open();

    if (action == true){
      this.detailForm.patchValue({ type: 2 })
      this.productService.updateProductImportIndesign(this.product_id, this.detailForm.value)
          .subscribe( data => {
             this.getProductSourceRemoteQueue();
          },err => {});
    }

    this.resetFtpInfo();
  }

  /** lets get if there is a queue in ftp */
  getProductSourceRemoteQueue() {
    this.productService.getProductSourceRemoteQueue(this.product_id).subscribe(res => {
      this.queueList = res.items;
    });
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

  /**
   * event when on drag drop or added file
   * print ready
   * @param {File[]} pFileList [description]
   */
  onFilePrintReadyChange(pFileList: File[]){
    console.log("onFilePrintReadyChange")
    this.files = Object.keys(pFileList).map(key => pFileList[key]);

    if (this.files.length < 1) {
      return;
    }

    var data = new FormData();
    data.append('file', this.files[0]);
      this.productService.updateProductUploadPrintReady(this.product_id, data)
        .subscribe( data => {},err => {});
  }


    /**
   * event when on drag drop or added file
   * on indesign
   * @param {File[]} pFileList [description]
   */
  onFileIndesignChange(pFileList: File[]){
    console.log("onFileIndesignChange")
    this.files = Object.keys(pFileList).map(key => pFileList[key]);

     if (this.files.length < 1) {
      return;
    }

    var data = new FormData();
    data.append('file', this.files[0]);
      this.productService.updateProductUploadIndesign(this.product_id, data)
        .subscribe( data => {},err => {});
  }

  /**
   * handles invalid inputs of print readyu
   * @param {File[]} pFileList [description]
   */
  onFileInvalidPrintReady(pFileList: File[]){
    this.files = Object.keys(pFileList).map(key => pFileList[key]);
    this.validExtension = this.allowed_types_printready;

    // if multiple files
    if ( this.files.length > 1) {
      this.isMultipleFiles = true;
      this.modalInvalid.open();
      return;
    }

    // if it goes here its invalid file
    this.isMultipleFiles = false;
    this.fileName = this.files[0].name
    this.modalInvalid.open();
  }

  /**
   * handles indeisg invalid
   * @param {File[]} pFileList [description]
   */
  onFileInvalidIndesign(pFileList: File[]){
    this.files = Object.keys(pFileList).map(key => pFileList[key]);
    this.validExtension = this.allowed_types_indesign;

    // if multiple files
    if ( this.files.length > 1) {
      this.isMultipleFiles = true;
      this.modalInvalid.open();
      return;
    }

    // if it goes here its invalid file
    this.isMultipleFiles = false;
    this.fileName = this.files[0].name
    this.modalInvalid.open();
  }

  /**
   * just to clear the entry
   */
  resetFtpInfo() {
     this.detailForm.setValue({ 
        source_url: '',
        login: '',
        password: '',
        type: '',
     });

     this.modalConfig.disableDismissButton = true;
  }

}
