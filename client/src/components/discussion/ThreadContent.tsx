import React from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Flag,
  Heart,
  BookmarkPlus
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Discussion } from "@/types/discussion";

interface ThreadContentProps {
  discussion: Discussion;
  onLike?: () => void;
  isLiked?: boolean;
  likeCount: number;
  commentCount: number;
}

const ThreadContent: React.FC<ThreadContentProps> = ({
  discussion,
  onLike,
  isLiked = false,
  likeCount,
  commentCount,
}) => {
  const formattedDate = discussion.createdAt 
    ? format(new Date(discussion.createdAt), "MMM d, yyyy")
    : "Unknown date";

  return (
    <CardContent className="pt-6">
      {/* Header with author info and date */}
      <div className="flex items-center mb-4">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarFallback>{discussion.authorName.charAt(0)}</AvatarFallback>
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${discussion.authorName}`} />
        </Avatar>
        <div>
          <div className="flex items-center">
            <span className="font-medium">{discussion.authorName}</span>
            {discussion.authorType && (
              <Badge variant="outline" className="ml-2 text-xs">
                {discussion.authorType}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{formattedDate}</div>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold mb-3">{discussion.title}</h2>

      {/* Content */}
      <div className="prose prose-sm max-w-none mb-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {discussion.content}
        </ReactMarkdown>
      </div>

      {/* Categories/Tags */}
      {discussion.categories && discussion.categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {discussion.categories.map((category, index) => (
            <Badge key={index} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center gap-1 ${isLiked ? "text-primary" : ""}`}
          onClick={onLike}
        >
          {isLiked ? <Heart className="h-4 w-4 fill-primary" /> : <ThumbsUp className="h-4 w-4" />}
          <span>{likeCount}</span>
        </Button>

        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          <span>{commentCount}</span>
        </Button>

        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>

        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <BookmarkPlus className="h-4 w-4" />
          <span>Save</span>
        </Button>

        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Flag className="h-4 w-4" />
          <span>Report</span>
        </Button>
      </div>
    </CardContent>
  );
};

export default ThreadContent;