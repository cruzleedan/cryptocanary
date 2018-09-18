import { Pipe, PipeTransform } from '@angular/core';
import { Entity } from '../../core/models/entity.model';

@Pipe({
  name: 'ratingPercent'
})
export class RatingPercentPipe implements PipeTransform {

  transform(entity: Entity, args?: any): any {
    const maxRating = 5,
      superShady = 5 / maxRating,
      veryShady = 4 / maxRating,
      shady = 3 / maxRating,
      slightlyShady = 2 / maxRating,
      notShadyAtAll = 1 / maxRating;

    const superShadyCount = entity.superShady || 0,
      veryShadyCount = entity.veryShady || 0,
      shadyCount = entity.shady || 0,
      slightlyShadyCount = entity.slightlyShady || 0,
      notShadyAtAllCount = entity.notShadyAtAll || 0;

    const superShadyPct = superShady * superShadyCount,
      veryShadyPct = veryShady * veryShadyCount,
      shadyPct = shady * shadyCount,
      slightlyShadyPct = slightlyShady * slightlyShadyCount,
      notShadyAtAllPct = notShadyAtAll * notShadyAtAllCount;

    const reviewCount = entity.reviewCount;
    const overallRating = ((superShadyPct + veryShadyPct + shadyPct + slightlyShadyPct + notShadyAtAllPct) / reviewCount) * 100;
    return overallRating + '%';
  }

}
