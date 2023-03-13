import { Component, OnInit, Input, EventEmitter, Output  } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-keyframes',
  templateUrl: './keyframes.component.html',
  styleUrls: ['./keyframes.component.css']
})
export class KeyframesComponent implements OnInit {
  @Input() entries = [];
  @Output() selectedKeyframe = new EventEmitter();
  @Output() editKeyframe = new EventEmitter();
  @Output() saveKeyframe = new EventEmitter();
  @Output() deleteKeyframe = new EventEmitter();
  @Output() updateFrameOrder = new EventEmitter();


  curEntryId = 0;
  
  constructor() { }

  ngOnInit() {
  }

  setKeyframeToEdit(id) {
    this.curEntryId = id;
    this.editKeyframe.emit(id);
  }


  setKeyFrameProperties(id) {
    this.entries.forEach((rec)=>{
      if(rec.id != id) {
        rec.is_blur = true;
      } else {
        rec.is_selected = true;
        rec.is_blur = false;
        rec.edit_this = true;
      } 
    });
  }

  setSelectedKeyFrame(objId : string) {
    let triggerEmit = false;
    this.entries.forEach((rec)=>{
      if(rec.id != objId) {
        rec.is_selected = false;
      } else {
        triggerEmit = rec.is_selected ? false : true;
        this.curEntryId = rec.id;
        rec.is_selected = true;
      } 
    });
    
    if (triggerEmit) {
      this.selectedKeyframe.emit(objId);
    }
  }
  

  saveKeyFrame(objId) {
    this.entries.forEach((rec)=>{
        this.curEntryId = null;
        rec.is_selected = false;
        rec.is_blur = false;
        rec.edit_this = false;
    });
    this.saveKeyframe.emit(objId);
  }

  deleteKeyFrame(objId) {
    this.deleteKeyframe.emit(objId);
  }

  saveApproved(objId) {
    this.saveKeyframe.emit(objId);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.entries, event.previousIndex, event.currentIndex);
    this.setFrameIndexOrder();
  }

  /**
   * just tag the current 
   * order of the frames
   */
  setFrameIndexOrder() {
    let indexArr = [];
    this.entries.forEach((rec, i)=>{
      rec.frame_index = i;
      if (!rec.is_new) {
        indexArr.push(rec.id);
      }
    });
    this.updateFrameOrder.emit(indexArr);
  }
}
