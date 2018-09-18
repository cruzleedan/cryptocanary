import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'strToJSON'
})
export class StrToJSONPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    value = JSON.parse(value);
    return value;
  }

}
