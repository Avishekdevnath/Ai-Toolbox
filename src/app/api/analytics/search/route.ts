import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Get search analytics from database
    const searchAnalytics = await db.collection('search_analytics').findOne({});
    
    if (searchAnalytics) {
      return NextResponse.json(searchAnalytics);
    }

    // Return mock data if no analytics exist
    const mockAnalytics = {
      totalSearches: 1247,
      uniqueSearches: 892,
      popularQueries: [
        { query: 'AI tools', count: 156 },
        { query: 'Finance', count: 134 },
        { query: 'Career', count: 98 },
        { query: 'Health', count: 87 },
        { query: 'Productivity', count: 76 }
      ],
      searchTrends: [
        { date: '2024-01-01', count: 45 },
        { date: '2024-01-02', count: 52 },
        { date: '2024-01-03', count: 48 },
        { date: '2024-01-04', count: 61 },
        { date: '2024-01-05', count: 58 }
      ],
      topCategories: [
        { category: 'Business', count: 234 },
        { category: 'Finance', count: 198 },
        { category: 'Career', count: 167 },
        { category: 'Health', count: 145 },
        { category: 'Utility', count: 123 }
      ],
      searchSuccessRate: 87.5,
      averageSearchTime: 2.3
    };

    return NextResponse.json(mockAnalytics);
  } catch (error) {
    console.error('Error fetching search analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, filters, userId, searchTime } = await request.json();
    const db = await getDatabase();

    // Record search analytics
    const searchRecord = {
      query,
      filters,
      userId,
      searchTime,
      timestamp: new Date(),
      success: true // You can determine this based on results
    };

    await db.collection('search_analytics').insertOne(searchRecord);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording search analytics:', error);
    return NextResponse.json(
      { error: 'Failed to record search analytics' },
      { status: 500 }
    );
  }
} 