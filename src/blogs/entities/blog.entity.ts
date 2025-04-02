interface TComments {
    id: string;
    authorName: string;
    content: string;
    createdAt: Date;
}

export class Blog {
    id: string;
    title: string;
    content: string;
    authorId: string;
    comments?: string[];
    tags?: TComments[];
    isPublished?: boolean;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
