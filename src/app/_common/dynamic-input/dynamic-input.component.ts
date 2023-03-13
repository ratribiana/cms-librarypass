import {  Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';


@Component({
  selector: 'app-dynamic-input',
  templateUrl: './dynamic-input.component.html',
  styleUrls: ['./dynamic-input.component.css']
})
export class DynamicInputComponent implements OnInit {
@Input() type_id :any;
@Input() label_name :string;
@Input() input_id :any;
@Input() input_value :any;
@Input() disabled :boolean;
@Input() sources;
@Output() onChangeValue = new EventEmitter();


  constructor() { }

  ngOnInit() {
      // let make sure to format if its date type
     if (this.type_id == 4 && this.input_value) {
        this.input_value = new Date(this.input_value);
     }
  }

  onValueChange() {
    // if date klets format it
    if (this.type_id == 4) {
      this.input_value = moment(this.input_value).format('YYYY-MM-DD');
    }
    this.onChangeValue.emit({id: this.input_id, value: this.input_value}); 
  }
}
