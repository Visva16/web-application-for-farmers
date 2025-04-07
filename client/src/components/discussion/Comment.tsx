import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Comment as CommentType } from "@/types/discussion";

interface CommentProps {
  comment: CommentType;
  onReply?: (commentId: string) => void;
  onUpvote?: (commentId: string) => void;
  onDownvote?: (commentId: string) => void;
}

export const Comment: React.FC<CommentProps> = ({
  comment,
  onReply,
  onUpvote,
  onDownvote,
}) => {
  // Calculate time since comment was posted
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.authorName}`}
              alt={comment.authorName}
            />
          </Avatar>
          <div>
            <div className="font-medium">{comment.authorName}</div>
            <div className="text-sm text-gray-500">{timeAgo}</div>
          </div>
        </div>
        <div className="prose max-w-none">
          <p>{comment.content}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-start gap-4 pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => onUpvote && onUpvote(comment._id)}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{comment.upvotes || 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => onDownvote && onDownvote(comment._id)}
        >
          <ThumbsDown className="h-4 w-4" />
          <span>{comment.downvotes || 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => onReply && onReply(comment._id)}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Reply</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Comment;