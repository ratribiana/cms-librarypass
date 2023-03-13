import { DOCUMENT, Location } from '@angular/common'; 
import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { CanvasComponent } from './canvas/canvas.component';
import { KeyframesComponent } from './keyframes/keyframes.component';
import { PageListComponent } from './page-list/page-list.component';
import { DetailsComponent } from './details/details.component';
import { ProductsService } from "../_services";
import {ConfirmModalComponent, ModalConfig} from '../_common/confirm-modal'
import { ToastrService } from 'ngx-toastr';





@Component({
  selector: 'app-uview',
  templateUrl: './uview.component.html',
  styleUrls: ['./uview.component.css']
})
export class UviewComponent implements OnInit {
  @ViewChild(CanvasComponent) canvasComponent;
  @ViewChild(KeyframesComponent) keyframesComponent;
  @ViewChild(PageListComponent) pageListComponent;
  @ViewChild(DetailsComponent) detailsComponent;

  @ViewChild('modalDelete')  modalDelete: ConfirmModalComponent;

  entries = [];
  productId : number=0;
  pageList = [];
  comicName = '';
  imageUrl : string = '';
  keyframes = [];
  selectedPageUview:any;
  selectedPage = 0;
  editMode = false;
  totalPages = 0;
  pageRequestLimit = 6;
  viewedPage = [];
  showCreationTools = false;
  isRendering = false;

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private productService: ProductsService,
    private location: Location,
    @Inject(DOCUMENT) document,
    private toastr:ToastrService
    ) { }

  ngOnInit() {
    this.isRendering = true;
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
         this.productId = params['id'];
         // lets clean local storage
         if (localStorage.getItem('product') != params['id']) {
            localStorage.removeItem('pageList');
            localStorage.removeItem('comicName');
            localStorage.removeItem('viewedPage');
            localStorage.setItem('previousSelectedPage', '0');

         }
         localStorage.setItem('product', params['id']);
     }
   });

   this.selectedPage = localStorage.getItem('previousSelectedPage') != null ?  parseInt(localStorage.getItem('previousSelectedPage')) : 0;

   console.log(  this.selectedPage );
   // let check if pages are not expired
   if (localStorage.getItem('pageList') != null 
        && parseInt(localStorage.getItem('product')) == this.productId) {

      let pages =  JSON.parse(localStorage.getItem('pageList'));
      let thumbnail = pages[this.selectedPage].thumbnail_url;

      this.checkImageExpired(thumbnail, ()=>{},
        ()=>{
          localStorage.removeItem('viewedPage');
          localStorage.removeItem('pageList');
          window.location.reload();
        });
   }


   this.initData();
    // lets add style to remove menu and nav
    document.body.classList.add('uview-body');
    document.querySelectorAll('.nav-menu')[0].classList.add('container');
    document.querySelectorAll('#main_content')[0].classList.add('container');
  }

  async initData() {
   await this.getProduct();
   await this.lazyRequestPages();
   await this.getImageAndSetToCanvas(this.pageList[this.selectedPage].id);
   this.isRendering = false;
  }
  
  /**
   * lets tell the canvas component
   * to highlight the polygon that 
   * correspnds the keyframe we selected
   */
  highLightThisPolygonInCanvas(objId) {
    return new Promise(resolve => {
      this.showCreationTools = false;
      this.canvasComponent.setDrawingTool('pick');
      //this.canvasComponent.renderAllCreatedPolygons();
      this.canvasComponent.setEditingCanvasMode( this.editMode);
      this.canvasComponent.hightLightPolygon(objId);
      return resolve(1);
    });
  }

  /**
   * the event came from clicking canvas
   */
  eventHasSelectedObject(hasObjectSelected) {
    
    if (!hasObjectSelected && this.selectedPage > 0) {
      this.showCreationTools = true;
      return;
    }

    // if there is a selected object we hide creating of object
    // because it will probably an edit mode
    this.showCreationTools = !hasObjectSelected;
  }

  /**
   * We are told to delete a certain
   * keyframe to our database. Trigger is coming
   * from keyframe component
   */
  async onDeleteKeyFrame(objId) {
    let action = await this.modalDelete.open();
    if (action == true){
        let tmp = [];
       this.entries.forEach((rec)=> {
          if (objId != rec.id) {
            tmp.push(rec);
          }
       });
       this.entries = tmp;
       this.canvasComponent.deleteObject(objId);
       this.productService.deleteProductUviewKeyframes(this.productId, this.selectedPage, objId).subscribe( res => {},err => {});
       this.keyframesComponent.setFrameIndexOrder();
    }
  }

  /**
   * Lets tell to canvas component to set
   * an object to be hightlighted and edit options.
   * The trigger si comming from keyframe component
   */
  async setPolygonToEdit(objId) {
    await this.highLightThisPolygonInCanvas(objId);
    this.editMode = true;
    this.canvasComponent.hightLightPolygon(objId);
    this.canvasComponent.hideOtherObjectsExcept(objId);
    this.canvasComponent.editCurrentShape();
    this.keyframesComponent.setKeyFrameProperties(objId);
  }

  /**
   * We just highlight the section
   */
  setEntries(entry) {
    this.showKeyframePathSection();
    this.saveKeyframe(entry.id);
  }

  /**
   * Process data if user click the page
   * to be edited. the trigger is coming
   * from the page-list component
   */
  async setSelectedPage(pageIndex) {
    this.isRendering = true;
    this.selectedPage = pageIndex;
    localStorage.setItem('previousSelectedPage', pageIndex);
    await this.getImageAndSetToCanvas(this.pageList[pageIndex].id);
    await this.getKeyFrame(pageIndex);
    this.canvasComponent.clearCanvasObjects();
    this.canvasComponent.renderPolygonFromKeyframes(this.entries);
    this.canvasComponent.setDrawingTool('pick');
    this.canvasComponent.setEditingCanvasMode( this.editMode);
  }
  
  /**
   * event listener for canvas rendered
   */
  eventCanvasRendered(e) {
    this.isRendering = false;
    if (this.selectedPage) {
      this.showKeyframePathSection();
    }
  }

  /**
   * expand the keyframes to focus
   */
  showKeyframePathSection() {
    let btn = document.getElementById('btnKeyframes');
    if (btn.getAttribute('aria-expanded') == 'false') {
      btn.click();
    }
  }


  /**
   *  Get image url from database or local
   */
  getImageAndSetToCanvas(pageId) {
    return new Promise(resolve => {
      let urlFromLocal = '';
      if (localStorage.getItem('viewedPage') != null && parseInt(localStorage.getItem('product')) == this.productId) {
        this.viewedPage = JSON.parse(localStorage.getItem('viewedPage'));
        this.viewedPage.forEach(pages => {
            if (pages.id == pageId) {
               urlFromLocal = pages.url
            }
        });

        if (urlFromLocal != '') {
          this.canvasComponent.setCanvasImage(urlFromLocal);
          return resolve(1);
        }
      }

      this.productService.getProductPage(this.productId, pageId).subscribe(res => {
          this.viewedPage.push({id: pageId, url: res.items[0].image_url});
          localStorage.setItem('viewedPage', JSON.stringify(this.viewedPage));
          this.canvasComponent.setCanvasImage(res.items[0].image_url);
          return resolve(1);
      });
    });
  }

  /**
   * This will check if image is alraeady exired
   */
     checkImageExpired(url, available, expired) {
      var img = new Image();
        img.onload = available; 
        img.onerror = expired;
        img.src = url;
    }


  /**
   * get the keyframes data depending
   * on the selected page tob edited.
   * lets update the entries variable
   * which holds the keyframes of the page
   */
  getKeyFrame(pageIndex) {
    return new Promise(resolve => {
      this.showCreationTools = true;
      this.productService.getProductUviewKeyframes(this.productId, pageIndex).subscribe(res => {
        let resItems = res  ? res.items : [];
        let resUview = res ? res.uview : [];
        this.entries = [];

        this.keyframes.push({id: pageIndex, items: resItems, uview: resUview});
        this.entries = this.constructDataToCanvasEntries(resItems);
        this.selectedPageUview = resUview;
        return resolve(1);
      });
    });
  }

  /**
   * Lets construct the data accordingt to
   * canvas json format
   */
  constructDataToCanvasEntries(res) {
    if (!res){
      return;
    }
    let entries = [];
    res.forEach(rec => {
      let dataInfo = this.canvasComponent.objectToPixel(rec.polygon);     
      let entry = {
        id: rec.id,
        frame_index: 0,
        page_index: 0,
        polygon_points: 0,
        polygon: true,
        is_approved: false,
        is_new: false,
        data: {
          shape_type: dataInfo.shape_type,
          left: rec.frame_left_percent,
          top: rec.frame_top_percent,
          polygon_points: dataInfo.polygon_points,
          height: rec.frame_height_percent,
          width: rec.frame_width_percent,
        },
        is_selected: false,
        is_blur: false,
        edit_this: false,
      };

      // lets overwrite if already uview 2 data
      if (dataInfo) {
         entry = this.canvasComponent.setPolygonData(rec.id, dataInfo.shape_type, dataInfo, false);
         entry.polygon_points = dataInfo.polygon_points;
      } 
      entry.frame_index = rec.frame_index;
      entry.page_index = rec.page_index;
      entry.polygon = rec.polygon;
      entry.is_approved = rec.is_approved;
      entries.push(entry);
    });

    return entries;
  }

  /**
   * Lets get the product details
   * for more information about the book
   */
  getProduct(){
    return new Promise(resolve => {
      // lets check if its the same prodcut in our local storage
        if (localStorage.getItem('comicName') != null && parseInt(localStorage.getItem('product')) == this.productId) {
          this.comicName = localStorage.getItem('comicName');
          this.totalPages = parseInt(localStorage.getItem('pageCount'));
          resolve(1);
        }
          
        this.productService.getProduct(this.productId).subscribe(res => {
            // lets save in local storage
            localStorage.setItem('comicName', res.raw_name);
            localStorage.setItem('pageCount', res.pages);
            this.comicName = res.raw_name;
            this.totalPages = parseInt(res.pages)
            resolve(1);
        });
      });
 }

  /**
   * This will just request from server slowly
   */
  lazyRequestPages() {
    return new Promise(resolve => {
      // lets just get the info in local
      if (localStorage.getItem('pageList') != null && parseInt(localStorage.getItem('product')) == this.productId) {
        this.pageList = JSON.parse(localStorage.getItem('pageList'));
        return resolve(1);
      }

      this.productService.getProductPages(this.productId, 1, this.pageRequestLimit, '1').subscribe(res => {
        this.pageList = res.items
        this.getProductPages(2);
        return resolve(1);
      });

    });
  }

  /**
   * Lest get the pages of the product
   * for editng purpose
   */
  getProductPages(page){
    let numRequest = Math.ceil(this.totalPages / this.pageRequestLimit);

    if(page > numRequest){
      // time to save in local
      localStorage.setItem('pageList', JSON.stringify(this.pageList));
      return;
    }

    this.productService.getProductPages(this.productId, page, this.pageRequestLimit, '1').subscribe(res => {
        res.items.forEach(element => {
          this.pageList.push(element)
        });
        this.getProductPages(page + 1);
      
    });
  }

  movePage(navPageId) {
    if (navPageId < 0) {
      return;
    }

    if (navPageId > this.totalPages) {
      return;
    }
    this.canvasComponent.clearCanvasObjects();
    this.pageListComponent.editPage(navPageId);
  }

  /**
   * Lets save the single keyframe
   * that is currently edited. We only
   * save the polygon part and not the old
   * mapping
   */
  async saveKeyframe(keyIndex) {
    this.isRendering = true;
    this.editMode = false;
    let updateEntries = await this.canvasComponent.setPolygonDataToEntries(keyIndex);
    if (updateEntries == 0) {
      this.toastr.info('Unable to save. Polygon points not found', 'Warning!');
      return;
    }
    this.canvasComponent.setDrawingTool('pick');
    //this.canvasComponent.renderAllCreatedPolygons();
    this.canvasComponent.setEditingCanvasMode(false);
    // lets get the keyfram info from our list
    let kframeDetails = this.getKeyframeInframeData(keyIndex);
    if (!kframeDetails) {
      console.log('nothing to save. ID can not be found in entries (' + keyIndex + ')')
      return;
    }
    
    // lets construct the corerct columns to save to insert
    let postData = {
      id: kframeDetails.id,
      uview_id: this.selectedPageUview.id,
      page_index: this.selectedPage,
      frame_index: kframeDetails.frame_index,
      polygon: this.canvasComponent.objectToPercent(kframeDetails.data),
      is_approved: 1,
    };

    // - value in polygon means there is no record in database yet
    if (kframeDetails.is_new) {
        this.productService.createProductUviewKeyframes(this.productId, this.selectedPage, postData)
          .subscribe( res => {
            // lets update the keyframe
            this.entries = updateEntries;
            this.entries.forEach((kframe, i) => {
              if (kframe.id == keyIndex) {
                this.entries[i].id = res.id;
                this.entries[i].is_new = false;
                this.entries[i].is_approved = 1;
              }
            });
            this.movePage(this.selectedPage);
          },err => {
			        this.toastr.error('No reader account connected!', 'Error!');
          });

          this.isRendering = false;
          return;
    }

    // if it reach here then we update
    this.productService.updateProductUviewKeyframes(this.productId, this.selectedPage, postData)
    .subscribe( res => {
       this.entries = updateEntries;
      this.entries.forEach((kframe, i) => {
        if (kframe.id == keyIndex) {
          this.entries[i].is_approved = 1;
        }
    });
    this.movePage(this.selectedPage);
    this.isRendering = false;
    },err => {});
  }

  /**
   * lets save the current order to database
   */
  saveFrameOrder(postData) {
    // only update those old records
    this.productService.updateProductUviewKeyframesOrder(this.productId, this.selectedPage, postData)
    .subscribe( res => {},err => {});
  }


  /**
   * Get the details of keyframes
   * in our entries variable
   */
  getKeyframeInframeData(kfId) {
    let selected :any = null ;
    this.entries.forEach(kframe => {
        if (kframe.id == kfId) {
          selected = kframe;
        }
    });
    return selected;
  }
  
  /**
   * Tell the canvas component to activate
   * the tools requested. e.g pick, zoom, polygon etc..
   */
  setTool(tool, e) {
    e.preventDefault();
    this.canvasComponent.setDrawingTool(tool);
  }

  /**
   * Tell the canvas component to activate all edit 
   * tools of the current object hightlighted
   */
  editShapePoints() {
    this.canvasComponent.editCurrentShape();
  }

  closeTab() {
    open(this.router.url, '_self').close();
  }

  eventResizeScreen() {
    window.location.reload();
    //this.movePage(this.selectedPage);
  }

}
