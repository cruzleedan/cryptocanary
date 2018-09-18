import { Component, OnInit } from '@angular/core';
import { Review } from '../../core/models/review.model';

@Component({
  selector: 'app-review-cards',
  templateUrl: './review-cards.component.html',
  styleUrls: ['./review-cards.component.scss']
})
export class ReviewCardsComponent implements OnInit {
  reviews: Review[];
  constructor() { }

  ngOnInit() {
  }

}
