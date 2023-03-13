import {  Component, Injectable, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap'
import { ModalConfig } from './modal.config'

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css']
})
@Injectable()
export class ConfirmModalComponent implements OnInit {
@Input() public modalConfig: ModalConfig
@ViewChild('modal') private modalContent: TemplateRef<ConfirmModalComponent>
private confirmModalRef: NgbModalRef
private modalOption: NgbModalOptions = {};

  constructor(
    private modalService: NgbModal
    ) {}

  ngOnInit() {
  }

  open(): Promise<boolean> {
    if (this.modalConfig.backdropStatic) {
        this.modalOption.backdrop = 'static';
        this.modalOption.keyboard = false;
    }
    
     return new Promise<boolean>(resolve => {
      this.confirmModalRef = this.modalService.open(this.modalContent,  this.modalOption)
      this.confirmModalRef.result.then(resolve, resolve)
  })
  }

  async close(): Promise<void> {
     if (this.modalConfig.shouldClose === undefined || (await this.modalConfig.shouldClose())) {
        const result = this.modalConfig.onClose === undefined || (await this.modalConfig.onClose())
        this.confirmModalRef.close(result)
    }
  }

  async dismiss(): Promise<void> {
       if (this.modalConfig.shouldDismiss === undefined || (await this.modalConfig.shouldDismiss())) {
        const result = this.modalConfig.onDismiss === undefined || (await this.modalConfig.onDismiss())
        this.confirmModalRef.dismiss(result)
    }
  }

}
