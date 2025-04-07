import api from './api';

export interface DiscussionResponse {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  views: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
}

export interface DiscussionListResponse {
  discussions: DiscussionResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateDiscussionData {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdateDiscussionData {
  title?: string;
  content?: string;
  tags?: string[];
}

// Description: Get all discussions with pagination and filtering
// Endpoint: GET /api/discussions
// Request: { page?: number, limit?: number, sort?: string, order?: 'asc'|'desc', search?: string, tags?: string }
// Response: { success: boolean, discussions: Discussion[], pagination: { total: number, page: number, limit: number, pages: number } }
export const getDiscussions = async (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  tags?: string;
}): Promise<DiscussionListResponse> => {
  try {
    const response = await api.get('/discussions', { params });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get a single discussion by ID
// Endpoint: GET /api/discussions/:id
// Request: {}
// Response: { success: boolean, discussion: Discussion }
export const getDiscussionById = async (id: string): Promise<{ success: boolean, discussion: DiscussionResponse }> => {
  try {
    const response = await api.get(`/discussions/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create a new discussion
// Endpoint: POST /api/discussions
// Request: { title: string, content: string, tags?: string[] }
// Response: { success: boolean, discussion: Discussion, message: string }
export const createDiscussion = async (data: CreateDiscussionData): Promise<{ success: boolean, discussion: DiscussionResponse, message: string }> => {
  try {
    const response = await api.post('/discussions', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update an existing discussion
// Endpoint: PUT /api/discussions/:id
// Request: { title?: string, content?: string, tags?: string[] }
// Response: { success: boolean, discussion: Discussion, message: string }
export const updateDiscussion = async (id: string, data: UpdateDiscussionData): Promise<{ success: boolean, discussion: DiscussionResponse, message: string }> => {
  try {
    const response = await api.put(`/discussions/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete a discussion
// Endpoint: DELETE /api/discussions/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteDiscussion = async (id: string): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await api.delete(`/discussions/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get a single discussion by ID with its comments
// Endpoint: GET /api/discussions/:id
// Request: {}
// Response: { _id: string, title: string, content: string, authorId: string, authorName: string, createdAt: string, updatedAt: string, comments: Array<Comment>, tags: string[] }
export const getDiscussion = async (id: string): Promise<any> => {
  try {
    const response = await api.get(`/discussions/${id}`);
    return response.data.discussion;
  } catch (error) {
    console.error("Error fetching discussion:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Add a comment to a discussion
// Endpoint: POST /api/discussions/:id/comments
// Request: { content: string }
// Response: { success: boolean, comment: Comment, message: string }
export const addComment = async (discussionId: string, data: { content: string }): Promise<any> => {
  try {
    const response = await api.post(`/discussions/${discussionId}/comments`, data);
    return response.data;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete a comment
// Endpoint: DELETE /api/discussions/:discussionId/comments/:commentId
// Request: {}
// Response: { success: boolean, message: string }
export const deleteComment = async (discussionId: string, commentId: string): Promise<any> => {
  try {
    const response = await api.delete(`/discussions/${discussionId}/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update a comment
// Endpoint: PUT /api/discussions/:discussionId/comments/:commentId
// Request: { content: string }
// Response: { success: boolean, comment: Comment, message: string }
export const updateComment = async (discussionId: string, commentId: string, data: { content: string }): Promise<any> => {
  try {
    const response = await api.put(`/discussions/${discussionId}/comments/${commentId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Add a reply to a comment
// Endpoint: POST /api/discussions/:discussionId/comments/:commentId/replies
// Request: { content: string }
// Response: { success: boolean, comment: Comment, message: string }
export const addReply = async (discussionId: string, commentId: string, data: { content: string }): Promise<any> => {
  try {
    const response = await api.post(`/discussions/${discussionId}/comments/${commentId}/replies`, data);
    return response.data;
  } catch (error) {
    console.error("Error adding reply:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get replies for a comment
// Endpoint: GET /api/discussions/:discussionId/comments/:commentId/replies
// Request: {}
// Response: { success: boolean, replies: Comment[] }
export const getReplies = async (discussionId: string, commentId: string): Promise<any> => {
  try {
    const response = await api.get(`/discussions/${discussionId}/comments/${commentId}/replies`);
    return response.data;
  } catch (error) {
    console.error("Error fetching replies:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};