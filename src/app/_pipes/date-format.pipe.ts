import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(!args){
      args = 'lll';
    }

    if(args == 'MMM'){
      return moment().month(value).format("MMMM");
    }

    return moment(value).format(args);
  }

}
