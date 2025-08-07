import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/adminAuth';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminSession = await AdminAuth.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if admin has settings permission
    if (!AdminAuth.hasPermission(adminSession, 'manage_settings')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Get system settings
    const settings = await db.collection('systemsettings').find({}).toArray();
    
    // Convert to object format
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Default settings structure
    const defaultSettings = {
      general: {
        siteName: settingsObject.site_name || 'AI Toolbox',
        siteDescription: settingsObject.site_description || 'Professional AI Tools Platform',
        maintenanceMode: settingsObject.maintenance_mode?.enabled || false,
        registrationEnabled: settingsObject.registration_enabled !== false,
        maxUsers: settingsObject.max_users || 10000
      },
      security: {
        sessionTimeout: settingsObject.session_timeout || 1440,
        maxLoginAttempts: settingsObject.max_login_attempts || 5,
        passwordMinLength: settingsObject.password_min_length || 8,
        requireEmailVerification: settingsObject.require_email_verification !== false,
        enableTwoFactor: settingsObject.enable_two_factor || false
      },
      notifications: {
        emailNotifications: settingsObject.email_notifications !== false,
        adminAlerts: settingsObject.admin_alerts !== false,
        userNotifications: settingsObject.user_notifications !== false,
        alertThreshold: settingsObject.alert_threshold || 10
      },
      analytics: {
        dataRetentionDays: settingsObject.data_retention_days || 90,
        enableTracking: settingsObject.enable_tracking !== false,
        anonymizeData: settingsObject.anonymize_data || false,
        exportEnabled: settingsObject.export_enabled !== false
      }
    };

    return NextResponse.json({
      success: true,
      settings: defaultSettings
    });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminSession = await AdminAuth.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if admin has settings permission
    if (!AdminAuth.hasPermission(adminSession, 'manage_settings')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { general, security, notifications, analytics } = body;

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Prepare settings updates
    const updates = [
      { key: 'site_name', value: general.siteName },
      { key: 'site_description', value: general.siteDescription },
      { key: 'maintenance_mode', value: { enabled: general.maintenanceMode } },
      { key: 'registration_enabled', value: general.registrationEnabled },
      { key: 'max_users', value: general.maxUsers },
      { key: 'session_timeout', value: security.sessionTimeout },
      { key: 'max_login_attempts', value: security.maxLoginAttempts },
      { key: 'password_min_length', value: security.passwordMinLength },
      { key: 'require_email_verification', value: security.requireEmailVerification },
      { key: 'enable_two_factor', value: security.enableTwoFactor },
      { key: 'email_notifications', value: notifications.emailNotifications },
      { key: 'admin_alerts', value: notifications.adminAlerts },
      { key: 'user_notifications', value: notifications.userNotifications },
      { key: 'alert_threshold', value: notifications.alertThreshold },
      { key: 'data_retention_days', value: analytics.dataRetentionDays },
      { key: 'enable_tracking', value: analytics.enableTracking },
      { key: 'anonymize_data', value: analytics.anonymizeData },
      { key: 'export_enabled', value: analytics.exportEnabled }
    ];

    // Update settings
    for (const update of updates) {
      await db.collection('systemsettings').updateOne(
        { key: update.key },
        {
          $set: {
            ...update,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    // Log activity
    await AdminAuth.logActivity(
      adminSession.id,
      'update_system_settings',
      'system_settings',
      { sections: Object.keys(body) }
    );

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 