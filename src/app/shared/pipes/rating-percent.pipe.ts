import { Pipe, PipeTransform } from '@angular/core';
import { Entity } from '../../core/models/entity.model';

@Pipe({
  name: 'ratingPercent'
})
export class RatingPercentPipe implements PipeTransform {

  transform(entity: Entity, args?: any): any {
    if (entity.rating && entity.reviewCount) {
      return (entity.rating / 5) * 100 + '%';
    }
    const maxRating = 5,
      superShady = 5 / maxRating,
      veryShady = 4 / maxRating,
      shady = 3 / maxRating,
      slightlyShady = 2 / maxRating,
      notShadyAtAll = 1 / maxRating;

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
          case 5:
            superShadyCount++;
            break;
          case 4:
            veryShadyCount++;
            break;
          case 3:
            shadyCount++;
            break;
          case 2:
            slightlyShadyCount++;
            break;
          case 1:
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
    let overallRating: string | number = 'Not Rated';
    if (reviewCount) {
      overallRating = ((superShadyPct + veryShadyPct + shadyPct + slightlyShadyPct + notShadyAtAllPct) / reviewCount) * 100;
      overallRating = overallRating + '%';
    }
    return overallRating;
  }

}
