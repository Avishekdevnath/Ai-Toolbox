import { getDatabase } from '@/lib/mongodb';
import {
  AgeAnalysisRequest,
  AgeAnalysisResponse
} from '@/schemas/ageAnalysisSchema';

export class AgeAnalysisModel {
  private static collectionName = 'age_analyses';

  static async saveAnalysis(userId: string, request: AgeAnalysisRequest, response: AgeAnalysisResponse): Promise<string> {
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
    const averageAge = analyses.length > 0 
      ? analyses.reduce((sum, analysis) => sum + analysis.response.ageData.age.years, 0) / analyses.length 
      : 0;

    const genderBreakdown = analyses.reduce((acc, analysis) => {
      const gender = analysis.request.gender || 'not_specified';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const lifestyleBreakdown = analyses.reduce((acc, analysis) => {
      const lifestyle = analysis.request.lifestyle || 'not_specified';
      acc[lifestyle] = (acc[lifestyle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageLifeExpectancy = analyses.length > 0 
      ? analyses.reduce((sum, analysis) => sum + analysis.response.lifeExpectancy.overall, 0) / analyses.length 
      : 0;

    const recentAnalyses = analyses.slice(0, 5);

    return {
      totalAnalyses,
      averageAge: Math.round(averageAge),
      genderBreakdown,
      lifestyleBreakdown,
      averageLifeExpectancy: Math.round(averageLifeExpectancy),
      recentAnalyses
    };
  }

  static async searchAnalyses(userId: string, query: string): Promise<any[]> {
    const db = await getDatabase();
    
    return db.collection(this.collectionName)
      .find({
        userId,
        $or: [
          { 'request.birthDate': { $regex: query, $options: 'i' } },
          { 'request.gender': { $regex: query, $options: 'i' } },
          { 'request.lifestyle': { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async getAgeDistribution(): Promise<any> {
    const db = await getDatabase();
    
    const pipeline = [
      {
        $group: {
          _id: {
            ageRange: {
              $switch: {
                branches: [
                  { case: { $lt: ['$response.ageData.age.years', 18] }, then: 'Under 18' },
                  { case: { $lt: ['$response.ageData.age.years', 25] }, then: '18-24' },
                  { case: { $lt: ['$response.ageData.age.years', 35] }, then: '25-34' },
                  { case: { $lt: ['$response.ageData.age.years', 45] }, then: '35-44' },
                  { case: { $lt: ['$response.ageData.age.years', 55] }, then: '45-54' },
                  { case: { $lt: ['$response.ageData.age.years', 65] }, then: '55-64' },
                  { case: { $lt: ['$response.ageData.age.years', 75] }, then: '65-74' }
                ],
                default: '75+'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.ageRange': 1 } }
    ];

    return db.collection(this.collectionName).aggregate(pipeline).toArray();
  }

  static async getLifeExpectancyStats(): Promise<any> {
    const db = await getDatabase();
    
    const pipeline = [
      {
        $group: {
          _id: null,
          avgLifeExpectancy: { $avg: '$response.lifeExpectancy.overall' },
          minLifeExpectancy: { $min: '$response.lifeExpectancy.overall' },
          maxLifeExpectancy: { $max: '$response.lifeExpectancy.overall' },
          totalAnalyses: { $sum: 1 }
        }
      }
    ];

    const results = await db.collection(this.collectionName).aggregate(pipeline).toArray();
    return results[0] || null;
  }

  static async getUpcomingBirthdays(userId: string, days: number = 30): Promise<any[]> {
    const db = await getDatabase();
    
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return db.collection(this.collectionName)
      .find({
        userId,
        'response.nextBirthday.nextBirthday': {
          $gte: now,
          $lte: futureDate
        }
      })
      .sort({ 'response.nextBirthday.nextBirthday': 1 })
      .toArray();
  }
} 