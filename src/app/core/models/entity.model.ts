import { User } from './user.model';
import { Category } from './category.model';

export interface Entity {
  id: string;
  categoryId: string;
  userId: string;
  name: string;
  desc: string;
  rating: number;
  reviewCount: number;
  links: object[];
  image: string;
  address: string;
  phone: string;
  email: string;
  approved: boolean;
  excellentRating?: number;
  greatRating?: number;
  averageRating?: number;
  poorRating?: number;
  badRating?: number;
  User?: User;
  Category?: Category;
  category?: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}
