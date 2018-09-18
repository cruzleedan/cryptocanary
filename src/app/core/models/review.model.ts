import { Entity } from './entity.model';
import { User } from './user.model';

export interface Review {
    id: string;
    entityId: string;
    userId: string;
    username?: string;
    reviewCount?: number;
    avatar?: string;
    title: string;
    review: string;
    upvoteTally: number;
    downvoteTally: number;
    rating: number;
    deletedAt: string;
    createdAt: string;
    updatedAt: string;
    Entity?: Entity;
    User?: User;
}
