import { Pipe, PipeTransform } from '@angular/core';
import { Entity } from '../../core/models/entity.model';
import { Review } from '../../core/models/review.model';

@Pipe({
  name: 'ratingLabel'
})
export class RatingLabelPipe implements PipeTransform {

  transform(data: Entity | Review, args?: any): any {
    let rating = data.rating;
    if (data.hasOwnProperty('reviewCount') && !data.reviewCount) {
      return '';
    }
    if (!rating || rating === 0) {
      return '0';
    }
    rating = parseFloat(rating.toString());
    const indx = Math.round(rating);
    const labels = ['Not Shady At All', 'Slightly Shady', 'Shady', 'Very Shady', 'Super Shady'];
    return indx >= 0 && indx < labels.length ? labels[indx] : '';
  }

}
