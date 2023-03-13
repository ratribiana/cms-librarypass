import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dotNotation'
})
export class DotNotationPipe implements PipeTransform {

  transform(value: any, args?: any): any {
      if(value != null && value.length > 0){
          return value.replace(/ /g, ".");
      }
  }

}
