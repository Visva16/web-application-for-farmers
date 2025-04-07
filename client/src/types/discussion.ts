export interface Discussion {
  _id: string;
  title: string;
  content: string;
  categoryId: string;
  category?: {
    _id: string;
    name: string;
  };
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  commentCount: number;
  tags: string[];
  isResolved?: boolean;
  isPinned?: boolean;
}

export interface DiscussionComment {
  _id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  parentCommentId?: string;
  isAcceptedAnswer?: boolean;
}

export interface DiscussionCategory {
  _id: string;
  name: string;
  description: string;
  slug: string;
  discussionCount: number;
}

export interface DiscussionFilters {
  category?: string;
  search?: string;
  tags?: string[];
  author?: string;
  isResolved?: boolean;
  sort?: 'newest' | 'oldest' | 'mostComments' | 'mostViews' | 'mostLikes';
}

export interface PaginatedDiscussions {
  discussions: Discussion[];
  total: number;
  page: number;
  limit: number;
}