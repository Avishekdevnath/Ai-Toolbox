'use client';

import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';

interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Record<number, number>;
}

interface Rating {
  _id: string;
  userId: string;
  rating: number;
  review?: string;
  helpful: number;
  createdAt: string;
}

interface ToolRatingProps {
  toolSlug: string;
  toolName: string;
  userId?: string;
  showReviews?: boolean;
}

export default function ToolRating({ 
  toolSlug, 
  toolName, 
  userId, 
  showReviews = true 
}: ToolRatingProps) {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRatings();
  }, [toolSlug]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tools/ratings?toolSlug=${toolSlug}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.data.stats);
        setRatings(data.data.ratings);
        
        // Check if user has already rated
        if (userId) {
          const userRatingData = data.data.ratings.find((r: Rating) => r.userId === userId);
          if (userRatingData) {
            setUserRating(userRatingData.rating);
            setUserReview(userRatingData.review || '');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to rate this tool',
        variant: 'destructive'
      });
      return;
    }

    if (userRating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/tools/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          toolSlug,
          toolName,
          rating: userRating,
          review: userReview
        })
      });

      if (response.ok) {
        toast({
          title: 'Rating Submitted',
          description: 'Thank you for your feedback!',
        });
        fetchRatings(); // Refresh ratings
      } else {
        throw new Error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit rating. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (ratingId: string) => {
    try {
      const response = await fetch('/api/tools/ratings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ratingId,
          action: 'helpful'
        })
      });

      if (response.ok) {
        fetchRatings(); // Refresh ratings
        toast({
          title: 'Thank you!',
          description: 'Your feedback has been recorded',
        });
      }
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const handleReport = async (ratingId: string) => {
    try {
      const response = await fetch('/api/tools/ratings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ratingId,
          action: 'report'
        })
      });

      if (response.ok) {
        toast({
          title: 'Report Submitted',
          description: 'Thank you for reporting this review',
        });
      }
    } catch (error) {
      console.error('Error reporting rating:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Ratings & Reviews</span>
          {stats && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(stats.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <Badge variant="secondary">
                {stats.averageRating.toFixed(1)} ({stats.totalRatings})
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Input */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Your Rating</label>
            <div className="flex items-center space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= userRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Your Review (Optional)</label>
            <Textarea
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="Share your experience with this tool..."
              className="mt-2"
              rows={3}
              maxLength={1000}
            />
          </div>

          <Button
            onClick={handleRatingSubmit}
            disabled={submitting || userRating === 0}
            className="w-full"
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>

        {/* Reviews */}
        {showReviews && ratings.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Recent Reviews</h3>
            {ratings.map((rating) => (
              <div key={rating._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rating.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleHelpful(rating._id)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {rating.helpful}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReport(rating._id)}
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {rating.review && (
                  <p className="text-sm text-gray-700">{rating.review}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 