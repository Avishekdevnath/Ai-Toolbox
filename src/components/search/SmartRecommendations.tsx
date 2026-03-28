'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Clock, Star, Zap } from 'lucide-react';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  href: string;
  features: string[];
  popularity?: number;
  rating?: number;
}

interface Recommendation {
  tool: Tool;
  reason: string;
  confidence: number;
  type: 'popular' | 'trending' | 'similar' | 'personalized' | 'category';
}

interface SmartRecommendationsProps {
  currentToolId?: string;
  userSearchHistory?: string[];
  className?: string;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  currentToolId,
  userSearchHistory = [],
  className = ""
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchRecommendations();
  }, [currentToolId, userSearchHistory]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentToolId,
          userSearchHistory,
          limit: 8
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      } else {
        // Fallback to mock recommendations
        generateMockRecommendations();
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      generateMockRecommendations();
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecommendations = () => {
    const mockTools: Tool[] = [
      {
        id: 'swot-analysis',
        name: 'SWOT Analysis Tool',
        description: 'Generate comprehensive SWOT analysis based on your input',
        icon: '📊',
        category: 'Business',
        href: '/tools/swot-analysis',
        features: ['AI-powered analysis', 'Comprehensive reports', 'Export options'],
        popularity: 95,
        rating: 4.8
      },
      {
        id: 'finance-advisor',
        name: 'Finance Tools',
        description: 'Comprehensive financial planning and analysis',
        icon: '💰',
        category: 'Finance Tools',
        href: '/tools/finance-advisor',
        features: ['8 modules', 'AI insights', 'Retirement planning'],
        popularity: 92,
        rating: 4.7
      },
      {
        id: 'diet-planner',
        name: 'Diet Planner',
        description: 'AI-driven meal planning and nutrition recommendations',
        icon: '🥗',
        category: 'Healthcare',
        href: '/tools/diet-planner',
        features: ['AI meal plans', 'Nutrition analysis', 'Dietary restrictions'],
        popularity: 88,
        rating: 4.6
      },
      {
        id: 'resume-reviewer',
        name: 'Resume Reviewer',
        description: 'AI-powered resume analysis and optimization',
        icon: '📄',
        category: 'Career',
        href: '/tools/resume-reviewer',
        features: ['ATS optimization', 'Industry analysis', 'Actionable feedback'],
        popularity: 85,
        rating: 4.5
      }
    ];

    const mockRecommendations: Recommendation[] = [
      {
        tool: mockTools[0],
        reason: 'Popular among business users',
        confidence: 0.95,
        type: 'popular'
      },
      {
        tool: mockTools[1],
        reason: 'Similar to tools you\'ve used',
        confidence: 0.87,
        type: 'similar'
      },
      {
        tool: mockTools[2],
        reason: 'Trending in your category',
        confidence: 0.82,
        type: 'trending'
      },
      {
        tool: mockTools[3],
        reason: 'Based on your search history',
        confidence: 0.78,
        type: 'personalized'
      }
    ];

    setRecommendations(mockRecommendations);
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'popular': return <TrendingUp className="h-4 w-4" />;
      case 'trending': return <Zap className="h-4 w-4" />;
      case 'similar': return <Sparkles className="h-4 w-4" />;
      case 'personalized': return <Star className="h-4 w-4" />;
      case 'category': return <Clock className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'popular': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      case 'trending': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      case 'similar': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'personalized': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'category': return 'text-[var(--color-text-secondary)] bg-[var(--color-muted)]';
      default: return 'text-[var(--color-text-secondary)] bg-[var(--color-muted)]';
    }
  };

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.tool.category === selectedCategory);

  if (loading) {
    return (
      <div className={`bg-[var(--color-surface)] rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-[var(--color-muted)] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-[var(--color-muted)] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[var(--color-surface)] rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
          Smart Recommendations
        </h3>
        <button
          onClick={fetchRecommendations}
          className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          Refresh
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-[var(--color-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)]'
            }`}
          >
            All
          </button>
          {Array.from(new Set(recommendations.map(r => r.tool.category))).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-[var(--color-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {filteredRecommendations.map((recommendation, index) => (
          <Link
            key={index}
            href={recommendation.tool.href}
            className="block p-4 border border-[var(--color-border)] rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{recommendation.tool.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-1">
                    {recommendation.tool.name}
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                    {recommendation.tool.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {recommendation.tool.popularity}% popular
                    </span>
                    <span className="flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      {recommendation.tool.rating} rating
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(recommendation.type)}`}>
                  {getRecommendationIcon(recommendation.type)}
                  <span className="ml-1 capitalize">{recommendation.type}</span>
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {Math.round(recommendation.confidence * 100)}% match
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-secondary)]">
                💡 {recommendation.reason}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-[var(--color-text-muted)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">
            No recommendations available for this category.
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartRecommendations; 