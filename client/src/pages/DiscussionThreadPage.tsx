import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/useToast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { getDiscussion, addComment, deleteDiscussion, deleteComment, updateComment, addReply, getReplies } from "@/api/discussions";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, MessageSquare, ArrowLeft, Check, X, Reply, ChevronDown, ChevronUp } from "lucide-react";

type Comment = {
  _id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  parentId?: string | null;
  replies?: Comment[];
  showReplies?: boolean;
  replyFormVisible?: boolean;
};

type Discussion = {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  tags: string[];
};

const DiscussionThreadPage = () => {
  const { id } = useParams<{ id: string }>();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [repliesLoading, setRepliesLoading] = useState<Record<string, boolean>>({});
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiscussion = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await getDiscussion(id);

        // Add showReplies and replyFormVisible properties to the comments
        if (data.comments) {
          data.comments = data.comments.map(comment => ({
            ...comment,
            showReplies: false,
            replyFormVisible: false,
            replies: []
          }));
        }

        setDiscussion(data);
      } catch (error: any) {
        console.error("Error fetching discussion:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load discussion thread",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussion();
  }, [id, toast]);

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Comment cannot be empty",
      });
      return;
    }

    try {
      setSubmitting(true);
      await addComment(id!, { content: comment });
      const updatedDiscussion = await getDiscussion(id!);

      // Add showReplies and replyFormVisible properties
      if (updatedDiscussion.comments) {
        updatedDiscussion.comments = updatedDiscussion.comments.map(comment => ({
          ...comment,
          showReplies: false,
          replyFormVisible: false,
          replies: []
        }));
      }

      setDiscussion(updatedDiscussion);
      setComment("");
      toast({
        title: "Success",
        description: "Your comment has been added",
      });
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add comment",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(id!, commentId);
      const updatedDiscussion = await getDiscussion(id!);

      // Add showReplies and replyFormVisible properties
      if (updatedDiscussion.comments) {
        updatedDiscussion.comments = updatedDiscussion.comments.map(comment => ({
          ...comment,
          showReplies: false,
          replyFormVisible: false,
          replies: []
        }));
      }

      setDiscussion(updatedDiscussion);
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete comment",
      });
    }
  };

  const handleStartEditComment = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditCommentContent(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentContent("");
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editCommentContent.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Comment cannot be empty",
      });
      return;
    }

    try {
      setSubmitting(true);
      await updateComment(id!, commentId, { content: editCommentContent });
      const updatedDiscussion = await getDiscussion(id!);

      // Add showReplies and replyFormVisible properties
      if (updatedDiscussion.comments) {
        updatedDiscussion.comments = updatedDiscussion.comments.map(comment => ({
          ...comment,
          showReplies: false,
          replyFormVisible: false,
          replies: []
        }));
      }

      setDiscussion(updatedDiscussion);
      setEditingCommentId(null);
      setEditCommentContent("");
      toast({
        title: "Success",
        description: "Your comment has been updated",
      });
    } catch (error: any) {
      console.error("Error updating comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update comment",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDiscussion = async () => {
    try {
      await deleteDiscussion(id!);
      toast({
        title: "Success",
        description: "Discussion deleted successfully",
      });
      navigate("/discussions");
    } catch (error: any) {
      console.error("Error deleting discussion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete discussion",
      });
    }
  };

  const handleToggleReplies = async (commentId: string) => {
    if (!discussion) return;

    const updatedComments = [...discussion.comments];
    const commentIndex = updatedComments.findIndex(c => c._id === commentId);

    if (commentIndex === -1) return;

    const comment = updatedComments[commentIndex];

    // Toggle display
    comment.showReplies = !comment.showReplies;

    // If showing replies and no replies loaded yet, fetch them
    if (comment.showReplies && (!comment.replies || comment.replies.length === 0)) {
      try {
        setRepliesLoading({ ...repliesLoading, [commentId]: true });
        const response = await getReplies(id!, commentId);

        comment.replies = response.replies.map((reply: Comment) => ({
          ...reply,
          showReplies: false,
          replyFormVisible: false
        }));
      } catch (error: any) {
        console.error("Error fetching replies:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load replies",
        });
      } finally {
        setRepliesLoading({ ...repliesLoading, [commentId]: false });
      }
    }

    updatedComments[commentIndex] = comment;
    setDiscussion({ ...discussion, comments: updatedComments });
  };

  const handleToggleReplyForm = (commentId: string) => {
    if (!discussion) return;

    const updatedComments = [...discussion.comments];
    const commentIndex = updatedComments.findIndex(c => c._id === commentId);

    if (commentIndex === -1) return;

    // Toggle reply form visibility
    updatedComments[commentIndex].replyFormVisible = !updatedComments[commentIndex].replyFormVisible;
    setDiscussion({ ...discussion, comments: updatedComments });
  };

  const handleReplyContentChange = (commentId: string, content: string) => {
    setReplyContent({ ...replyContent, [commentId]: content });
  };

  const handleAddReply = async (commentId: string) => {
    const replyText = replyContent[commentId];

    if (!replyText || !replyText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Reply cannot be empty",
      });
      return;
    }

    try {
      setSubmitting(true);
      await addReply(id!, commentId, { content: replyText });

      // Refresh the replies for this comment
      const response = await getReplies(id!, commentId);

      if (!discussion) return;

      const updatedComments = [...discussion.comments];
      const commentIndex = updatedComments.findIndex(c => c._id === commentId);
      if (commentIndex === -1) return;

      // Update the replies and ensure the reply form is hidden
      updatedComments[commentIndex].replies = response.replies.map((reply: Comment) => ({
        ...reply,
        showReplies: false,
        replyFormVisible: false
      }));
      updatedComments[commentIndex].replyFormVisible = false;
      updatedComments[commentIndex].showReplies = true;

      setDiscussion({ ...discussion, comments: updatedComments });

      // Clear the reply content
      const newReplyContent = { ...replyContent };
      delete newReplyContent[commentId];
      setReplyContent(newReplyContent);

      toast({
        title: "Success",
        description: "Your reply has been added",
      });
    } catch (error: any) {
      console.error("Error adding reply:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add reply",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isAuthor = (authorId: string) => {
    if (!userInfo) return false;

    // Get all possible ID fields from userInfo
    const currentUserId = userInfo.sub || userInfo.userId || userInfo._id;

    // Compare the IDs - ensure we're comparing strings
    return currentUserId && currentUserId.toString() === authorId.toString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <h2 className="text-2xl font-bold mb-4">Discussion not found</h2>
        <Button asChild>
          <Link to="/discussions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Discussions
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-4">
        <Button variant="outline" asChild className="mb-4">
          <Link to="/discussions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Discussions
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{discussion.title}</CardTitle>
              <div className="flex items-center mt-2 text-muted-foreground text-sm">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback>{discussion.authorName.charAt(0)}</AvatarFallback>
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${discussion.authorName}`} />
                </Avatar>
                <span>{discussion.authorName}</span>
                <span className="mx-2">•</span>
                <span>{formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
            {isAuthor(discussion.authorId) && (
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" asChild>
                  <Link to={`/discussions/${id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Discussion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this discussion? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteDiscussion} className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {discussion.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap">{discussion.content}</div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <div className="space-y-4">
          {discussion.comments.length === 0 ? (
            <p>No comments yet. Be the first to comment!</p>
          ) : (
            discussion.comments.map(comment => (
              <div key={comment._id} className="border p-4 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.authorName}`} />
                    </Avatar>
                    <span className="font-semibold">{comment.authorName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {isAuthor(comment.authorId) && (
                      <>
                        <Button variant="outline" size="icon" onClick={() => handleStartEditComment(comment)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDeleteComment(comment._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="icon" onClick={() => handleToggleReplyForm(comment._id)}>
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleToggleReplies(comment._id)}>
                      {comment.showReplies ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  {editingCommentId === comment._id ? (
                    <div>
                      <Textarea
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                      />
                      <div className="flex space-x-2 mt-2">
                        <Button onClick={() => handleUpdateComment(comment._id)} disabled={submitting}>
                          <Check className="mr-2 h-4 w-4" /> Save
                        </Button>
                        <Button variant="outline" onClick={handleCancelEditComment}>
                          <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p>{comment.content}</p>
                  )}
                </div>
                {comment.replyFormVisible && (
                  <div className="mt-2 ml-6">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyContent[comment._id] || ""}
                      onChange={(e) => handleReplyContentChange(comment._id, e.target.value)}
                    />
                    <div className="flex space-x-2 mt-2">
                      <Button onClick={() => handleAddReply(comment._id)} disabled={submitting}>
                        Reply
                      </Button>
                      <Button variant="outline" onClick={() => handleToggleReplyForm(comment._id)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                {comment.showReplies && (
                  <div className="mt-2 ml-6">
                    {repliesLoading[comment._id] ? (
                      <p>Loading replies...</p>
                    ) : (
                      comment.replies && comment.replies.length > 0 ? (
                        comment.replies.map(reply => (
                          <div key={reply._id} className="border p-2 rounded mt-2">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>{reply.authorName.charAt(0)}</AvatarFallback>
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${reply.authorName}`} />
                              </Avatar>
                              <span className="font-semibold">{reply.authorName}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="mt-1">
                              <p>{reply.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No replies yet.</p>
                      )
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Add a Comment</h3>
        <Textarea
          placeholder="Write your comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button className="mt-2" onClick={handleAddComment} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default DiscussionThreadPage;
