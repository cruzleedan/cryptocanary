import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'pct'
})
export class PctPipe implements PipeTransform {

    transform(value: any, total: number, dec: number = 0, args?: any): string {
        if (total === 0) {
            return '0';
        }
        return parseFloat(`${(value / total) * 100}`).toFixed(dec);
    }

}
