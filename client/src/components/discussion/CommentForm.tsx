import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { createComment } from '@/api/discussion';

// Schema for comment validation
const commentSchema = z.object({
  content: z.string().min(1, "Comment can't be empty").max(1000, "Comment must be less than 1000 characters")
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
  discussionId: string;
  parentId?: string;
  onCommentAdded: () => void;
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

export function CommentForm({
  discussionId,
  parentId,
  onCommentAdded,
  placeholder = "Add a comment...",
  buttonText = "Post Comment",
  className = ""
}: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (data: CommentFormValues) => {
    try {
      setIsSubmitting(true);
      
      await createComment({
        discussionId,
        parentId,
        content: data.content,
      });
      
      form.reset();
      onCommentAdded();
      
      toast({
        title: "Success",
        description: parentId ? "Reply added successfully" : "Comment added successfully",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit comment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder={placeholder}
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : buttonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}