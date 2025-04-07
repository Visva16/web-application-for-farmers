import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { getDiscussionById, createComment } from "@/api/discussion";
import { Discussion, Comment } from "@/types/discussion";

interface UseDiscussionThreadProps {
  discussionId: string;
}

interface UseDiscussionThreadReturn {
  discussion: Discussion | null;
  comments: Comment[];
  loading: boolean;
  error: string | null;
  addComment: (content: string) => Promise<void>;
  refreshDiscussion: () => Promise<void>;
}

export const useDiscussionThread = ({ discussionId }: UseDiscussionThreadProps): UseDiscussionThreadReturn => {
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscussion = async () => {
    try {
      setLoading(true);
      console.log(`Fetching discussion with ID: ${discussionId}`);
      const data = await getDiscussionById(discussionId);
      
      if (!data) {
        throw new Error("Failed to fetch discussion thread");
      }
      
      setDiscussion(data.discussion);
      setComments(data.comments || []);
      console.log(`Successfully loaded discussion: ${data.discussion.title}`);
    } catch (err) {
      console.error("Error fetching discussion thread:", err);
      setError(err instanceof Error ? err.message : "Failed to load discussion thread");
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load discussion thread"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshDiscussion = async () => {
    try {
      await fetchDiscussion();
    } catch (err) {
      console.error("Error refreshing discussion:", err);
    }
  };

  const addComment = async (content: string) => {
    if (!discussionId || !content.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Comment content cannot be empty"
      });
      return;
    }

    try {
      console.log(`Adding comment to discussion ${discussionId}`);
      const newComment = await createComment(discussionId, content);
      
      // Add the new comment to the existing list
      setComments(prevComments => [...prevComments, newComment]);
      
      toast({
        title: "Success",
        description: "Comment added successfully"
      });
      
      console.log("Comment added successfully");
    } catch (err) {
      console.error("Error adding comment:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add comment"
      });
    }
  };

  // Fetch discussion data on component mount or when discussionId changes
  useEffect(() => {
    if (discussionId) {
      fetchDiscussion();
    } else {
      setError("Discussion ID is required");
      setLoading(false);
    }
  }, [discussionId]);

  return {
    discussion,
    comments,
    loading,
    error,
    addComment,
    refreshDiscussion
  };
};

export default useDiscussionThread;