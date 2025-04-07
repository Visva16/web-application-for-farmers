import api from "./api";

// Types
export interface Discussion {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  upvotes: number;
  downvotes: number;
  replyCount: number;
}

export interface DiscussionComment {
  _id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
}

export interface CreateDiscussionData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface CreateCommentData {
  content: string;
  discussionId: string;
}

// Get all discussions with optional filters
export const getDiscussions = async (params?: {
  category?: string;
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    console.log("Fetching discussions with params:", params);
    const response = await api.get("/discussions", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching discussions:", error);
    throw new Error(error?.response?.data?.error || "Failed to fetch discussions");
  }
};

// Get a single discussion by ID
export const getDiscussionById = async (id: string) => {
  try {
    console.log(`Fetching discussion with ID: ${id}`);
    const response = await api.get(`/discussions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching discussion with ID ${id}:`, error);
    throw new Error(error?.response?.data?.error || "Failed to fetch discussion");
  }
};

// Create a new discussion
export const createDiscussion = async (data: CreateDiscussionData) => {
  try {
    console.log("Creating new discussion:", data);
    const response = await api.post("/discussions", data);
    return response.data;
  } catch (error) {
    console.error("Error creating discussion:", error);
    throw new Error(error?.response?.data?.error || "Failed to create discussion");
  }
};

// Update a discussion
export const updateDiscussion = async (id: string, data: Partial<CreateDiscussionData>) => {
  try {
    console.log(`Updating discussion ${id}:`, data);
    const response = await api.put(`/discussions/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating discussion ${id}:`, error);
    throw new Error(error?.response?.data?.error || "Failed to update discussion");
  }
};

// Delete a discussion
export const deleteDiscussion = async (id: string) => {
  try {
    console.log(`Deleting discussion ${id}`);
    const response = await api.delete(`/discussions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting discussion ${id}:`, error);
    throw new Error(error?.response?.data?.error || "Failed to delete discussion");
  }
};

// Get comments for a discussion
export const getDiscussionComments = async (discussionId: string) => {
  try {
    console.log(`Fetching comments for discussion ${discussionId}`);
    const response = await api.get(`/discussions/${discussionId}/comments`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for discussion ${discussionId}:`, error);
    throw new Error(error?.response?.data?.error || "Failed to fetch comments");
  }
};

// Add a comment to a discussion
export const addComment = async (data: CreateCommentData) => {
  try {
    console.log(`Adding comment to discussion ${data.discussionId}`);
    const response = await api.post(`/discussions/${data.discussionId}/comments`, data);
    return response.data;
  } catch (error) {
    console.error(`Error adding comment to discussion ${data.discussionId}:`, error);
    throw new Error(error?.response?.data?.error || "Failed to add comment");
  }
};

// Vote on a discussion (upvote or downvote)
export const voteOnDiscussion = async (id: string, voteType: "upvote" | "downvote") => {
  try {
    console.log(`Voting ${voteType} on discussion ${id}`);
    const response = await api.post(`/discussions/${id}/vote`, { voteType });
    return response.data;
  } catch (error) {
    console.error(`Error voting on discussion ${id}:`, error);
    throw new Error(error?.response?.data?.error || "Failed to vote on discussion");
  }
};

// Vote on a comment (upvote or downvote)
export const voteOnComment = async (discussionId: string, commentId: string, voteType: "upvote" | "downvote") => {
  try {
    console.log(`Voting ${voteType} on comment ${commentId}`);
    const response = await api.post(`/discussions/${discussionId}/comments/${commentId}/vote`, { voteType });
    return response.data;
  } catch (error) {
    console.error(`Error voting on comment ${commentId}:`, error);
    throw new Error(error?.response?.data?.error || "Failed to vote on comment");
  }
};