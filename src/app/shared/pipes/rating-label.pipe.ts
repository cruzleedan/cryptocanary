import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ratingLabel'
})
export class RatingLabelPipe implements PipeTransform {

    transform(rating: any, args?: any): any {
        if (!rating || rating === 0) {
            return '0';
        }
        rating = parseFloat(rating);
        const indx = Math.round(rating);
        const labels = ['Not Shady At All', 'Slightly Shady', 'Shady', 'Very Shady', 'Super Shady'];
        return indx >= 0 && indx < labels.length ? labels[indx] : '';
    }

}
