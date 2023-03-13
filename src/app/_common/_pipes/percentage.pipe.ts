import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentage'
})
export class PercentagePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(value != null && value.length > 0){
      let percent = value.replace(/%/g, "");
      return (percent - 0)+'%';
    }
  }

}
