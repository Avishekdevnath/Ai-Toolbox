import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { aiTools, utilityTools } from '@/data/tools';

export async function POST(request: NextRequest) {
  try {
    const { currentToolId, userSearchHistory = [], limit = 8 } = await request.json();
    
    const allTools = [...aiTools, ...utilityTools];
    const recommendations = [];

    // 1. Popular tools (based on usage analytics)
    const popularTools = allTools
      .filter(tool => tool.id !== currentToolId)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 2);

    popularTools.forEach(tool => {
      recommendations.push({
        tool,
        reason: 'Popular among users',
        confidence: 0.95,
        type: 'popular'
      });
    });

    // 2. Similar tools (same category or features)
    if (currentToolId) {
      const currentTool = allTools.find(t => t.id === currentToolId);
      if (currentTool) {
        const similarTools = allTools
          .filter(tool => 
            tool.id !== currentToolId && 
            (tool.category === currentTool.category || 
             tool.features.some(f => currentTool.features.includes(f)))
          )
          .slice(0, 2);

        similarTools.forEach(tool => {
          recommendations.push({
            tool,
            reason: 'Similar to tools you\'ve used',
            confidence: 0.87,
            type: 'similar'
          });
        });
      }
    }

    // 3. Trending tools (based on recent activity)
    const trendingTools = allTools
      .filter(tool => tool.id !== currentToolId)
      .sort(() => Math.random() - 0.5) // Simulate trending
      .slice(0, 2);

    trendingTools.forEach(tool => {
      recommendations.push({
        tool,
        reason: 'Trending in your category',
        confidence: 0.82,
        type: 'trending'
      });
    });

    // 4. Personalized recommendations (based on search history)
    if (userSearchHistory.length > 0) {
      const searchTerms = userSearchHistory.join(' ').toLowerCase();
      const personalizedTools = allTools
        .filter(tool => 
          tool.id !== currentToolId &&
          (tool.name.toLowerCase().includes(searchTerms) ||
           tool.description.toLowerCase().includes(searchTerms) ||
           tool.category.toLowerCase().includes(searchTerms))
        )
        .slice(0, 2);

      personalizedTools.forEach(tool => {
        recommendations.push({
          tool,
          reason: 'Based on your search history',
          confidence: 0.78,
          type: 'personalized'
        });
      });
    }

    // 5. Category-based recommendations
    const categoryTools = allTools
      .filter(tool => tool.id !== currentToolId)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    categoryTools.forEach(tool => {
      recommendations.push({
        tool,
        reason: `Popular in ${tool.category}`,
        confidence: 0.75,
        type: 'category'
      });
    });

    // Remove duplicates and limit results
    const uniqueRecommendations = recommendations
      .filter((rec, index, self) => 
        index === self.findIndex(r => r.tool.id === rec.tool.id)
      )
      .slice(0, limit);

    return NextResponse.json({
      recommendations: uniqueRecommendations,
      total: uniqueRecommendations.length
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
} 