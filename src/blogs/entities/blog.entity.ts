export interface TComments {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Blog {
  id: string;
  title: string;
  content: string;
  authorId: string;
  comments?: TComments[];
  tags: string[];
  isPublished?: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
