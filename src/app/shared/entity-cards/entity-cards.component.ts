import { Component, OnInit } from '@angular/core';
import { Entity } from '../../core/models/entity.model';

@Component({
  selector: 'app-entity-cards',
  templateUrl: './entity-cards.component.html',
  styleUrls: ['./entity-cards.component.scss']
})
export class EntityCardsComponent implements OnInit {
  entities: Entity[];
  currentUrl: string = location.href;
  socialMedias = [
    'facebook', 'twitter', 'google', 'linkedin',
    // 'pinterest', 'reddit', 'tumblr', 'whatsapp', 'messenger',
    // 'telegram', 'vk', 'stumble', 'xing', 'sms', 'email', 'copy', 'print'
  ];
  constructor() {
    this.entities = [{
      id: 'lskjdf',
      categoryId: 'coinId',
      userId: 'userknowitall',
      name: 'Ethereum',
      reviewCount: 2,
      image: '',
      approved: true,
      createdAt: '',
      links: [{
        link: 'http://www.ethereum.org',
        name: 'www.ethereum.org'
      }],
      rating: 4,
      desc: `Ipsum sit quis cillum amet consequat officia eiusmod in.
       Dolore aliquip proident officia et occaecat commodo commodo. Irure fugiat sunt cupidatat eiusmod ex velit velit pariatur dolor.
       Magna qui duis nulla officia nulla adipisicing pariatur officia fugiat in tempor.`
    }];
  }

  ngOnInit() {
  }

}
