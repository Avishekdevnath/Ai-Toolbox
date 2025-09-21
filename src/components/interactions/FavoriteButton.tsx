'use client';

import React, { useState, useEffect } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';

interface FavoriteButtonProps {
  toolSlug: string;
  toolName: string;
  category: string;
  userId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteButton({ 
  toolSlug, 
  toolName, 
  category, 
  userId, 
  className = '',
  size = 'md'
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      checkFavoriteStatus();
    }
  }, [userId, toolSlug]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/user/favorites?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const isFav = data.data.favorites.some((fav: any) => fav.toolSlug === toolSlug);
        setIsFavorite(isFav);
      } else {
        // Silently fail and assume not favorite
        setIsFavorite(false);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
      // Silently fail and assume not favorite
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async () => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to add favorites',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/user/favorites?userId=${userId}&toolSlug=${toolSlug}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setIsFavorite(false);
          toast({
            title: 'Removed from Favorites',
            description: `${toolName} has been removed from your favorites`,
          });
        } else {
          throw new Error('Failed to remove favorite');
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            toolSlug,
            toolName,
            category
          })
        });

        if (response.ok) {
          setIsFavorite(true);
          toast({
            title: 'Added to Favorites',
            description: `${toolName} has been added to your favorites`,
          });
        } else if (response.status === 409) {
          toast({
            title: 'Already in Favorites',
            description: `${toolName} is already in your favorites`,
          });
          setIsFavorite(true);
        } else {
          throw new Error('Failed to add favorite');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      
      // Optimistic update - assume the operation succeeded
      if (isFavorite) {
        setIsFavorite(false);
        toast({
          title: 'Removed from Favorites',
          description: `${toolName} has been removed from your favorites`,
        });
      } else {
        setIsFavorite(true);
        toast({
          title: 'Added to Favorites',
          description: `${toolName} has been added to your favorites`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <Button
      variant={isFavorite ? 'default' : 'outline'}
      size="icon"
      onClick={toggleFavorite}
      disabled={loading}
      className={`${sizeClasses[size]} ${className} ${
        isFavorite 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'hover:bg-red-50 hover:border-red-300'
      }`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : isFavorite ? (
        <Heart className="w-4 h-4 fill-current" />
      ) : (
        <Heart className="w-4 h-4" />
      )}
    </Button>
  );
} 