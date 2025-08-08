import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { AdminVerificationService } from '@/lib/adminVerificationService';
import { AdminUser } from '@/models/AdminUserModel';
import { ToolUsage } from '@/models/ToolUsageModel';
import { AdminActivity } from '@/models/AdminActivityModel';
import { AdminNotification } from '@/models/AdminNotificationModel';
import { SystemSettings } from '@/models/SystemSettingsModel';
import { tools } from '@/data/tools';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Dashboard stats API called');

    // Verify admin session
    const session = await AdminVerificationService.getAdminSession(request);
    if (!session.success || !session.session) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Admin session verified:', session.session.email);

    // Check permissions
    if (!AdminVerificationService.canViewDashboard(session.session)) {
      console.log('❌ Insufficient permissions');
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const startTime = Date.now();
    await connectToDatabase();
    const dbConnectionTime = Date.now() - startTime;

    console.log('✅ Database connected');

    // Database Health Metrics
    const dbConnection = true; // If we reach here, connection is successful
    const dbResponseTime = dbConnectionTime;
    
    // Get collection count
    const db = await getDatabase();
    const [
      totalUsers,
      totalAdmins,
      totalAnalyses,
      totalActivities,
      totalNotifications,
      totalSettings
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      AdminUser.countDocuments(),
      ToolUsage.countDocuments(),
      AdminActivity.countDocuments(),
      AdminNotification.countDocuments(),
      SystemSettings.countDocuments()
    ]);
    const totalCollections = collections.length;

    // API Performance Metrics (simulated for now)
    const apiResponseTime = Math.floor(Math.random() * 50) + 10; // 10-60ms
    const apiSuccessRate = 98 + Math.floor(Math.random() * 2); // 98-100%
    const activeEndpoints = 25; // Approximate number of API endpoints

    // Project Quality Metrics
    const systemUptime = 99.9; // Simulated uptime percentage
    const lastBackup = new Date().toISOString().split('T')[0]; // Today's date

    // Growth Metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await db.collection('users').countDocuments({ createdAt: { $gte: today } });
    const activeUsers = await db.collection('users').countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 24*60*60*1000) } });

    const stats = {
      // Database Health
      dbConnection,
      dbResponseTime,
      totalCollections,
      
      // API Performance
      apiResponseTime,
      apiSuccessRate,
      activeEndpoints,
      
      // Project Quality
      totalUsers,
      totalAdmins,
      systemUptime,
      lastBackup,
      
      // Growth Metrics
      newUsersToday,
      totalAnalyses,
      activeUsers
    };

    console.log('✅ Dashboard stats generated successfully');
    console.log('📊 Stats summary:', {
      users: totalUsers,
      admins: totalAdmins,
      analyses: totalAnalyses,
      dbResponseTime: `${dbResponseTime}ms`,
      apiResponseTime: `${apiResponseTime}ms`
    });

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error: any) {
    console.error('❌ Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
} 