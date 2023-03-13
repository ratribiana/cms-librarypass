import { Component, OnInit, Input, EventEmitter, Output, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common'; 

@Component({
  selector: 'app-page-list',
  templateUrl: './page-list.component.html',
  styleUrls: ['./page-list.component.css']
})
export class PageListComponent implements OnInit {
  @Input() pageList : any[] = [];
  @Input() comicName: string = '';
  @Output() selectedPageIndex = new EventEmitter();
  constructor(
    @Inject(DOCUMENT) document
  ) { }

  ngOnInit() {
  }



  editPage(index) {
    var highlightedDiv = document.querySelectorAll('.edit-page');
    if (highlightedDiv.length)
      highlightedDiv[0].classList.remove('edit-page');

    if (document.getElementById('list_page_' + index))
      document.getElementById('list_page_' + index).classList.add('edit-page');

    this.selectedPageIndex.emit(index);
  }
}
