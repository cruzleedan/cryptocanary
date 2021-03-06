import { Pipe, PipeTransform } from '@angular/core';
import { Entity } from '../../core/models/entity.model';

@Pipe({
  name: 'ratingPercent'
})
export class RatingPercentPipe implements PipeTransform {

  transform(entity: Entity, args?: any): any {
    let overallRating: string | number = 'Not Rated';
    if (entity.rating && entity.reviewCount) {
      overallRating = (entity.rating / 4) * 100;
      overallRating = Math.round(overallRating * 100) / 100;
      return overallRating + '%';
    }
    const maxRating = 4,
      superShady = 4 / maxRating,
      veryShady = 3 / maxRating,
      shady = 2 / maxRating,
      slightlyShady = 1 / maxRating,
      notShadyAtAll = 0 / maxRating;

    let superShadyCount = entity.superShady || 0,
      veryShadyCount = entity.veryShady || 0,
      shadyCount = entity.shady || 0,
      slightlyShadyCount = entity.slightlyShady || 0,
      notShadyAtAllCount = entity.notShadyAtAll || 0;
    if (
      (!superShadyCount && !veryShadyCount && !shadyCount && !slightlyShadyCount && !notShadyAtAllCount)
      &&
      entity.Reviews
    ) {
      console.log('Will count reviews ');
      entity.Reviews.forEach(review => {
        switch (+review.rating) {
          case 4:
            superShadyCount++;
            break;
          case 3:
            veryShadyCount++;
            break;
          case 2:
            shadyCount++;
            break;
          case 1:
            slightlyShadyCount++;
            break;
          case 0:
            notShadyAtAllCount++;
            break;
        }
      });
    }
    const superShadyPct = superShady * superShadyCount,
      veryShadyPct = veryShady * veryShadyCount,
      shadyPct = shady * shadyCount,
      slightlyShadyPct = slightlyShady * slightlyShadyCount,
      notShadyAtAllPct = notShadyAtAll * notShadyAtAllCount;

    const reviewCount = entity.reviewCount;

    if (reviewCount) {
      overallRating = ((superShadyPct + veryShadyPct + shadyPct + slightlyShadyPct + notShadyAtAllPct) / reviewCount) * 100;
      overallRating = Math.round(overallRating * 100) / 100;
      overallRating = overallRating + '%';
    }
    return overallRating;
  }

}
