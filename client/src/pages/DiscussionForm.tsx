import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  createDiscussion,
  getDiscussionById,
  updateDiscussion,
  CreateDiscussionData,
  UpdateDiscussionData
} from '@/api/discussions';
import { Loader2 } from 'lucide-react';

export default function DiscussionForm() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(id ? true : false);
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateDiscussionData>({
    defaultValues: {
      title: '',
      content: '',
      tags: []
    }
  });

  useEffect(() => {
    if (id) {
      // If we have an ID, we're editing an existing discussion
      fetchDiscussion(id);
    }
  }, [id]);

  const fetchDiscussion = async (discussionId: string) => {
    try {
      setInitialLoading(true);
      console.log(`Fetching discussion with id: ${discussionId}`);
      const { discussion } = await getDiscussionById(discussionId);
      console.log(`Discussion loaded: ${discussion.title}`);

      reset({
        title: discussion.title,
        content: discussion.content,
        tags: discussion.tags
      });
    } catch (err) {
      console.error("Error fetching discussion:", err);
      toast.error(err.message);
      navigate('/discussions');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: CreateDiscussionData) => {
    try {
      setLoading(true);

      // Convert comma-separated tags string to array if it's a string
      const formattedData = {
        ...data,
        tags: typeof data.tags === 'string'
          ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          : data.tags
      };

      if (id) {
        // Update existing discussion
        console.log(`Updating discussion with id: ${id}`, formattedData);
        await updateDiscussion(id, formattedData as UpdateDiscussionData);
        console.log("Discussion updated successfully");
        toast.success('Discussion updated successfully');
      } else {
        // Create new discussion
        console.log("Creating new discussion", formattedData);
        await createDiscussion(formattedData);
        console.log("Discussion created successfully");
        toast.success('Discussion created successfully');
      }
      navigate('/discussions');
    } catch (err) {
      console.error("Error saving discussion:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading discussion...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Edit Discussion' : 'Start a New Discussion'}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title"
                {...register('title', { required: 'Title is required' })}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Share your thoughts or questions..."
                rows={10}
                {...register('content', { required: 'Content is required' })}
                className={errors.content ? 'border-red-500' : ''}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="e.g. javascript, react, help"
                {...register('tags')}
              />
              <p className="text-sm text-muted-foreground">
                Separate tags with commas to help categorize your discussion
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/discussions')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {id ? 'Update Discussion' : 'Create Discussion'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}