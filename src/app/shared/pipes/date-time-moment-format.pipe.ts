import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'dateTimeMomentFormat',
    pure: false,
})
export class DateTimeMomentFormatPipe implements PipeTransform {
    transform(date: string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
        return moment(date, format).fromNow();
    }
}
