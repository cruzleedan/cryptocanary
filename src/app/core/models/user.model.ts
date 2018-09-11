export interface User {
    id: string;
    email: string;
    token: string;
    username: string;
    avatar: string;
    blockFlag: boolean;
    AcceptedTermsFlag: boolean;
    score: number;
    deletedAt: string;
    createdAt: string;
    updatedAt: string;
    reviews: object;
    roles: object;
    gender: string;
    desc: string;
    reviewsCount?: number;
    entitiesCount?: number;
}
