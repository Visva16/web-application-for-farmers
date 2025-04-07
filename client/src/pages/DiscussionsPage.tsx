import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/Pagination';
import { MessageSquare, Clock, Eye, Tag, Plus, Loader2 } from 'lucide-react';
import { getDiscussions, DiscussionResponse } from '@/api/discussions';

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<DiscussionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDiscussions();
  }, [currentPage]);

  const fetchDiscussions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDiscussions({
        page: currentPage,
        limit: 10,
        sort: 'createdAt',
        order: 'desc',
        search: searchTerm || undefined
      });
      setDiscussions(response.discussions);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDiscussions();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Community Discussions</h1>
        {isAuthenticated && (
          <Button onClick={() => navigate('/discussions/new')}>
            <Plus className="mr-2 h-4 w-4" /> Start Discussion
          </Button>
        )}
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading discussions...</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4 border border-red-300 rounded-md">
          {error}
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">No discussions found. Be the first to start a discussion!</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {discussions.map((discussion) => (
              <Card key={discussion._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle
                      className="text-xl font-bold cursor-pointer hover:text-primary"
                      onClick={() => navigate(`/discussions/${discussion._id}`)}
                    >
                      {discussion.title}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Eye className="h-4 w-4 mr-1" />
                      {discussion.views}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="line-clamp-2 text-muted-foreground mb-2">
                    {discussion.content}
                  </p>
                  {discussion.tags && discussion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {discussion.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" /> {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2 flex justify-between text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">{discussion.authorName}</span>
                    <span className="mx-1">·</span>
                    <span>{discussion.authorRole}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {discussion.commentCount || 0}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(discussion.createdAt)}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}