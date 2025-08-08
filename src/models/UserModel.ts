import { getDatabase } from '@/lib/mongodb';
import { User } from '@/schemas/userSchema';

export class UserModel {
  private static collectionName = 'users';

  static async create(userData: { email: string; name: string; password?: string; image?: string }): Promise<User> {
    const db = await getDatabase();
    const user: any = {
      email: userData.email.toLowerCase(),
      name: userData.name,
      image: userData.image,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      role: 'user'
    };
    const result = await db.collection(this.collectionName).insertOne(user);
    return { ...user, _id: result.insertedId } as User;
  }

  static async findById(id: string): Promise<User | null> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    return db.collection(this.collectionName).findOne({ 
      _id: new ObjectId(id) 
    }) as Promise<User | null>;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const db = await getDatabase();
    
    return db.collection(this.collectionName).findOne({ 
      email: email.toLowerCase() 
    }) as Promise<User | null>;
  }

  static async findByVerificationToken(token: string): Promise<User | null> {
    const db = await getDatabase();
    
    return db.collection(this.collectionName).findOne({
      'security.emailVerificationToken': token,
      'security.emailVerificationExpires': { $gt: new Date() }
    }) as Promise<User | null>;
  }

  static async update(id: string, updateData: any): Promise<boolean> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    const result = await db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  }

  static async verifyEmail(id: string): Promise<boolean> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    const result = await db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          emailVerified: true,
          'security.emailVerified': true,
          updatedAt: new Date()
        },
        $unset: {
          'security.emailVerificationToken': '',
          'security.emailVerificationExpires': ''
        }
      }
    );

    return result.modifiedCount > 0;
  }

  static async updateLoginActivity(id: string, ip: string, userAgent: string): Promise<boolean> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    const result = await db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          'activity.lastLogin': new Date(),
          'activity.lastActive': new Date(),
          updatedAt: new Date()
        },
        $push: {
          'activity.loginHistory': {
            timestamp: new Date(),
            ip,
            userAgent
          }
        }
      }
    );

    return result.modifiedCount > 0;
  }

  static async incrementToolUsage(id: string, toolName: string): Promise<boolean> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    const result = await db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: {
          [`activity.toolUsage.${toolName}.count`]: 1
        },
        $set: {
          [`activity.toolUsage.${toolName}.lastUsed`]: new Date(),
          'activity.lastActive': new Date(),
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    const result = await db.collection(this.collectionName).deleteOne({ 
      _id: new ObjectId(id) 
    });

    return result.deletedCount > 0;
  }

  static async getStats(): Promise<any> {
    const db = await getDatabase();
    
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      usersByRole,
      usersByPlan,
      recentSignups
    ] = await Promise.all([
      db.collection(this.collectionName).countDocuments(),
      db.collection(this.collectionName).countDocuments({ isActive: true }),
      db.collection(this.collectionName).countDocuments({ emailVerified: true }),
      db.collection(this.collectionName).aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]).toArray(),
      db.collection(this.collectionName).aggregate([
        { $group: { _id: '$subscription.plan', count: { $sum: 1 } } }
      ]).toArray(),
      db.collection(this.collectionName).countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      usersByRole: {
        user: usersByRole.find(r => r._id === 'user')?.count || 0,
        admin: usersByRole.find(r => r._id === 'admin')?.count || 0,
        moderator: usersByRole.find(r => r._id === 'moderator')?.count || 0
      },
      usersByPlan: {
        free: usersByPlan.find(p => p._id === 'free')?.count || 0,
        basic: usersByPlan.find(p => p._id === 'basic')?.count || 0,
        premium: usersByPlan.find(p => p._id === 'premium')?.count || 0,
        enterprise: usersByPlan.find(p => p._id === 'enterprise')?.count || 0
      },
      recentSignups,
      averageSessionDuration: 0 // TODO: Calculate from activity data
    };
  }

  static async search(query: string, limit: number = 10): Promise<User[]> {
    const db = await getDatabase();
    
    return db.collection(this.collectionName).find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).limit(limit).toArray() as Promise<User[]>;
  }

  static async getActiveUsers(days: number = 30): Promise<User[]> {
    const db = await getDatabase();
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return db.collection(this.collectionName).find({
      'activity.lastActive': { $gte: cutoffDate }
    }).toArray() as Promise<User[]>;
  }
} 