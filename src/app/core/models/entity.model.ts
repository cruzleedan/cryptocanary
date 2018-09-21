import { User } from './user.model';
import { Category } from './category.model';
import { Review } from './review.model';

export interface Entity {
  id: string;
  categoryId: string;
  userId: string;
  name: string;
  desc: string;
  rating: number;
  reviewCount: number;
  links: any [];
  image: string;
  address?: string;
  phone?: string;
  email?: string;
  approved: boolean;
  superShady?: number;
  veryShady?: number;
  shady?: number;
  slightlyShady?: number;
  notShadyAtAll?: number;
  User?: User;
  Category?: Category;
  category?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt?: string;
  Reviews?: Review[];
}
