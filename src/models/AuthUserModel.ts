import mongoose, { Schema, Model, models } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export interface AuthUserDoc {
  _id: mongoose.Types.ObjectId;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  passwordHash: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

const AuthUserSchema = new Schema<AuthUserDoc>({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
  phoneNumber: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user', index: true },
}, { timestamps: true, collection: 'authusers' });

// Ensure indexes are created
// Indexes are already defined in the schema above

export type AuthUserModelType = Model<AuthUserDoc>;

function getModel(): AuthUserModelType {
  return (models.AuthUser as AuthUserModelType) || mongoose.model<AuthUserDoc>('AuthUser', AuthUserSchema);
}

export async function getAuthUserModel(): Promise<AuthUserModelType> {
  await connectToDatabase();
  return getModel();
}

// Static methods for the AuthUserModel
export class AuthUserModel {
  private static async ensureConnection() {
    await connectToDatabase();
  }

  private static async getModel() {
    return await getAuthUserModel();
  }

  static async create(userData: {
    email: string;
    username?: string;
    firstName: string;
    lastName: string;
    password: string;
    phoneNumber?: string;
    role?: 'admin' | 'user';
  }) {
    const model = await this.getModel();
    
    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12);
    
    const user = new model({
      email: userData.email.toLowerCase(),
      username: userData.username?.toLowerCase(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      passwordHash,
      role: userData.role || 'user'
    });

    return await user.save();
  }

  static async findById(id: string) {
    await this.ensureConnection();
    const model = await this.getModel();
    return await model.findById(id);
  }

  static async findByEmail(email: string) {
    await this.ensureConnection();
    const model = await this.getModel();
    return await model.findOne({ email: email.toLowerCase() });
  }

  static async findByUsername(username: string) {
    await this.ensureConnection();
    const model = await this.getModel();
    return await model.findOne({ username: username.toLowerCase() });
  }

  static async findByEmailOrUsername(identifier: string) {
    if (identifier.includes('@')) {
      return this.findByEmail(identifier);
    } else {
      return this.findByUsername(identifier);
    }
  }

  static async updateLastLogin(userId: string) {
    const model = await this.getModel();
    return await model.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          updatedAt: new Date()
        }
      }
    );
  }

  static async updatePassword(userId: string, hashedPassword: string) {
    const model = await this.getModel();
    return await model.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          passwordHash: hashedPassword,
          updatedAt: new Date()
        }
      }
    );
  }

  static async update(userId: string, updateData: any) {
    const model = await this.getModel();
    return await model.findByIdAndUpdate(
      userId,
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { new: true }
    );
  }

  static async delete(userId: string) {
    const model = await this.getModel();
    return await model.findByIdAndDelete(userId);
  }

  static async getStats() {
    const model = await this.getModel();
    
    const [
      totalUsers,
      usersByRole
    ] = await Promise.all([
      model.countDocuments(),
      model.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ]);

    return {
      totalUsers,
      activeUsers: totalUsers, // All users are active by default
      verifiedUsers: totalUsers, // All users are verified by default
      usersByRole: {
        user: usersByRole.find(r => r._id === 'user')?.count || 0,
        admin: usersByRole.find(r => r._id === 'admin')?.count || 0,
        moderator: 0
      },
      usersByPlan: {
        free: totalUsers,
        basic: 0,
        premium: 0,
        enterprise: 0
      },
      recentSignups: 0,
      averageSessionDuration: 0
    };
  }

  static async search(query: string, limit: number = 10) {
    const model = await this.getModel();
    return await model.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    }).limit(limit);
  }

  static async getActiveUsers(days: number = 30) {
    const model = await this.getModel();
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return await model.find({
      updatedAt: { $gte: cutoffDate }
    });
  }

  // Helper method to convert AuthUserDoc to User interface format
  static mapToUserInterface(authUser: AuthUserDoc) {
    return {
      _id: authUser._id,
      email: authUser.email,
      username: authUser.username,
      name: `${authUser.firstName} ${authUser.lastName}`.trim(),
      password: authUser.passwordHash,
      image: null,
      emailVerified: true,
      profile: {
        bio: '',
        location: '',
        website: '',
        avatar: '',
        socialLinks: {}
      },
      preferences: {
        theme: 'system' as const,
        language: 'en' as const,
        notifications: {
          email: true,
          push: false,
          marketing: false
        },
        privacy: {
          profileVisibility: 'public' as const,
          showEmail: false,
          showActivity: true
        }
      },
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: new Date(),
        passwordHistory: [],
        loginAttempts: 0,
        emailVerified: true
      },
      activity: {
        lastLogin: new Date(),
        lastActive: new Date(),
        loginHistory: [],
        toolUsage: {}
      },
      subscription: {
        plan: 'free' as const,
        status: 'active' as const,
        startDate: new Date(),
        features: ['basic_tools', 'ai_analysis', 'url_shortener']
      },
      createdAt: authUser.createdAt,
      updatedAt: authUser.updatedAt,
      isActive: true,
      role: authUser.role,
      permissions: ['basic_access'],
      accounts: []
    };
  }
}


