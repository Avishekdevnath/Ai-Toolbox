import { getDatabase } from '@/lib/mongodb';
import {
  QuoteRequest,
  QuoteResponse,
  Quote,
  fallbackQuotes,
  fallbackFamous
} from '@/schemas/quoteSchema';

export class QuoteModel {
  private static collectionName = 'quote_requests';

  static async saveRequest(userId: string, request: QuoteRequest, response: QuoteResponse): Promise<string> {
    const db = await getDatabase();
    
    const result = await db.collection(this.collectionName).insertOne({
      userId,
      request,
      response,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return result.insertedId.toString();
  }

  static async getRequestById(id: string): Promise<any> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    return db.collection(this.collectionName).findOne({
      _id: new ObjectId(id)
    });
  }

  static async getRequestHistory(userId: string, limit: number = 10): Promise<any[]> {
    const db = await getDatabase();
    
    return db.collection(this.collectionName)
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  static async deleteRequest(id: string, userId: string): Promise<boolean> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    const result = await db.collection(this.collectionName).deleteOne({
      _id: new ObjectId(id),
      userId
    });

    return result.deletedCount > 0;
  }

  static async getAnalytics(userId: string): Promise<any> {
    const db = await getDatabase();
    
    const requests = await db.collection(this.collectionName)
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    const totalRequests = requests.length;
    const totalQuotes = requests.reduce((sum, req) => sum + (req.response?.quotes?.length || 0), 0);

    const topicBreakdown = requests.reduce((acc, req) => {
      const topic = req.request.topic;
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const moodBreakdown = requests.reduce((acc, req) => {
      const mood = req.request.mood;
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const languageBreakdown = requests.reduce((acc, req) => {
      const language = req.request.language;
      acc[language] = (acc[language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentRequests = requests.slice(0, 5);

    return {
      totalRequests,
      totalQuotes,
      topicBreakdown,
      moodBreakdown,
      languageBreakdown,
      recentRequests
    };
  }

  static async searchRequests(userId: string, query: string): Promise<any[]> {
    const db = await getDatabase();
    
    return db.collection(this.collectionName)
      .find({
        userId,
        $or: [
          { 'request.topic': { $regex: query, $options: 'i' } },
          { 'request.author': { $regex: query, $options: 'i' } },
          { 'response.quotes.quote': { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async getPopularTopics(): Promise<string[]> {
    const db = await getDatabase();
    
    const pipeline = [
      { $group: { _id: '$request.topic', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { topic: '$_id', count: 1, _id: 0 } }
    ];

    const results = await db.collection(this.collectionName).aggregate(pipeline).toArray();
    return results.map(r => r.topic);
  }

  static async getPopularAuthors(): Promise<string[]> {
    const db = await getDatabase();
    
    const pipeline = [
      { $group: { _id: '$request.author', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { author: '$_id', count: 1, _id: 0 } }
    ];

    const results = await db.collection(this.collectionName).aggregate(pipeline).toArray();
    return results.map(r => r.author);
  }

  static async getFallbackQuotes(request: QuoteRequest): Promise<Quote[]> {
    let filtered = fallbackQuotes;
    
    if (request.author) {
      filtered = filtered.filter(q => q.author.toLowerCase().includes(request.author.toLowerCase()));
    }
    if (request.topic) {
      filtered = filtered.filter(q => q.topic.toLowerCase().includes(request.topic.toLowerCase()));
    }
    if (request.mood) {
      filtered = filtered.filter(q => q.mood.toLowerCase().includes(request.mood.toLowerCase()));
    }
    
    // If birthday and topic/mood/author not found, fallback to birthday quotes
    if (request.birthDate && filtered.length === 0) {
      filtered = fallbackQuotes.filter(q => q.topic === 'birthday');
    }
    
    // Shuffle and take up to count
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, request.count).map(q => ({ quote: q.quote, author: q.author }));
  }

  static async getFamousPeopleForDate(date: string): Promise<string[]> {
    const monthDay = this.getMonthDay(date);
    return fallbackFamous[monthDay] || [];
  }

  private static getMonthDay(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-US', { month: 'long', day: 'numeric' });
  }
} 