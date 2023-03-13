import { Directive, HostListener, HostBinding, Output, EventEmitter, Input, ElementRef} from '@angular/core';

@Directive({
  selector: '[fileDragDrop]'
})

export class FileDragdropDirective {
  @Input() private allowed_extensions : Array<string> = [];
  @Input() private single_file_only : boolean = false;
  @Output() private filesChangeEmiter : EventEmitter<File[]> = new EventEmitter();
  @Output() private filesInvalidEmiter : EventEmitter<File[]> = new EventEmitter();
  @HostBinding('style.background') private background = '#eee';
  @HostBinding('style.border') private borderStyle = '2px dashed';
  @HostBinding('style.border-color') private borderColor = '#696D7D';
  @HostBinding('style.border-radius') private borderRadius = '5px';

  constructor(
    private el: ElementRef) { }

  @HostListener('dragover', ['$event']) public onDragOver(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background = 'lightgray';
    this.borderColor = 'cadetblue';
    this.borderStyle = '3px solid';
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#eee';
    this.borderColor = '#696D7D';
    this.borderStyle = '2px dashed';
  }

  @HostListener('drop', ['$event']) public onDrop(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#eee';
    this.borderColor = '#696D7D';
    this.borderStyle = '2px dashed';

    let files = evt.dataTransfer.files;
    // lets check single file only
    if(this.single_file_only && files.length > 1) {
      this.filesInvalidEmiter.emit(files);
      return;
    }

     // lets check if allowed extension
    let invalid_files: Array<File> = [];
    for (let i = 0; i < files.length; i++) {
      
        let re = /(?:\.([^.]+))?$/;
        let ext = '.' + re.exec(files[i].name)[1]; 

        if (!this.allowed_extensions.includes(ext)) {
          invalid_files.push(files[i]);
        }
    }


    if (invalid_files.length > 0) {
      this.filesInvalidEmiter.emit(invalid_files);
      return;
     }


    let valid_files : Array<File> = files;
    this.filesChangeEmiter.emit(valid_files);
  }
}