import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapToIterable'
})
export class MapToIterablePipe implements PipeTransform {

  transform(value: any, args: any[] = null): any {
    // return Object.keys(value).map(key => value[key]);
    console.log('map values', value);

    return Object.keys(value);
  }

}
