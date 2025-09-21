import { getDatabase } from '@/lib/mongodb';
import {
  ResumeRequest,
  ResumeAnalysis,
  ResumeResponse,
  industryKeywords
} from '@/schemas/resumeSchema';

export class ResumeModel {
  private static collectionName = 'resume_analyses';

  static async saveAnalysis(userId: string, request: ResumeRequest, analysis: ResumeAnalysis): Promise<string> {
    const db = await getDatabase();
    
    const result = await db.collection(this.collectionName).insertOne({
      userId,
      request,
      analysis,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return result.insertedId.toString();
  }

  static async getAnalysisById(id: string): Promise<any> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    return db.collection(this.collectionName).findOne({
      _id: new ObjectId(id)
    });
  }

  static async getAnalysisHistory(userId: string, limit: number = 10): Promise<any[]> {
    const db = await getDatabase();
    
    return db.collection(this.collectionName)
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  static async deleteAnalysis(id: string, userId: string): Promise<boolean> {
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
    
    const analyses = await db.collection(this.collectionName)
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    const totalAnalyses = analyses.length;
    const averageScore = analyses.length > 0 
      ? analyses.reduce((sum, analysis) => sum + (analysis.analysis?.overallScore || 0), 0) / analyses.length 
      : 0;

    const industryBreakdown = analyses.reduce((acc, analysis) => {
      const industry = analysis.request.industry;
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentAnalyses = analyses.slice(0, 5);

    return {
      totalAnalyses,
      averageScore: Math.round(averageScore * 100) / 100,
      industryBreakdown,
      recentAnalyses
    };
  }

  static async searchAnalyses(userId: string, query: string): Promise<any[]> {
    const db = await getDatabase();
    
    return db.collection(this.collectionName)
      .find({
        userId,
        $or: [
          { 'request.jobTitle': { $regex: query, $options: 'i' } },
          { 'request.industry': { $regex: query, $options: 'i' } },
          { 'analysis.summary': { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async getIndustryKeywords(industry: string): Promise<string[]> {
    return industryKeywords[industry] || [];
  }

  static async getPopularIndustries(): Promise<string[]> {
    const db = await getDatabase();
    
    const pipeline = [
      { $group: { _id: '$request.industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { industry: '$_id', count: 1, _id: 0 } }
    ];

    const results = await db.collection(this.collectionName).aggregate(pipeline).toArray();
    return results.map(r => r.industry);
  }
} 