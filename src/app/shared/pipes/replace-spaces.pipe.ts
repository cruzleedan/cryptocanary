import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceSpaces'
})
export class ReplaceSpacesPipe implements PipeTransform {

  transform(text: any, args?: any): any {
    return text.replace(/ /g, '-').toLowerCase();
  }

}
