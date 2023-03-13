import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency'
})
export class CurrencyPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    //return '$' + parseFloat((value - 0).toFixed(2)).toLocaleString('en');  
    let val = (Math.round(value * 100) / 100).toFixed(2);
    return '$' + val;  
  }

}
