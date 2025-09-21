import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import { config } from './config';

interface ConnectionState {
  client: MongoClient | null;
  db: Db | null;
  isConnecting: boolean;
  lastError: Error | null;
  connectionAttempts: number;
  lastConnectionAttempt: Date | null;
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private state: ConnectionState = {
    client: null,
    db: null,
    isConnecting: false,
    lastError: null,
    connectionAttempts: 0,
    lastConnectionAttempt: null,
  };

  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second
  private readonly maxConnectionAttempts = 5;
  private readonly connectionTimeout = 10000; // 10 seconds

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Get database connection with retry mechanism
   */
  async getDatabase(): Promise<Db> {
    // If we have a valid connection, return it
    if (this.state.db && this.state.client?.topology?.isConnected()) {
      return this.state.db;
    }

    // If we're already connecting, wait
    if (this.state.isConnecting) {
      return this.waitForConnection();
    }

    // Try to establish connection
    return this.establishConnection();
  }

  /**
   * Establish database connection with retry logic
   */
  private async establishConnection(): Promise<Db> {
    this.state.isConnecting = true;
    this.state.connectionAttempts++;

    try {
      // Check if we've exceeded max attempts
      if (this.state.connectionAttempts > this.maxConnectionAttempts) {
        throw new Error(`Max connection attempts (${this.maxConnectionAttempts}) exceeded`);
      }

      // Close existing connection if any
      if (this.state.client) {
        await this.closeConnection();
      }

      // Create new connection
      const client = await this.createConnection();
      const db = client.db(config.mongodb.dbName);

      // Test connection
      await db.admin().ping();

      // Update state
      this.state.client = client;
      this.state.db = db;
      this.state.isConnecting = false;
      this.state.lastError = null;
      this.state.connectionAttempts = 0;

      console.log('✅ Database connection established successfully');
      return db;

    } catch (error: any) {
      this.state.lastError = error;
      this.state.isConnecting = false;
      this.state.lastConnectionAttempt = new Date();

      console.error(`❌ Database connection attempt ${this.state.connectionAttempts} failed:`, error.message);

      // If this is not the last attempt, retry
      if (this.state.connectionAttempts < this.maxConnectionAttempts) {
        await this.delay(this.retryDelay * this.state.connectionAttempts);
        return this.establishConnection();
      }

      throw new Error(`Failed to establish database connection after ${this.maxConnectionAttempts} attempts: ${error.message}`);
    }
  }

  /**
   * Create MongoDB connection with proper options
   */
  private async createConnection(): Promise<MongoClient> {
    const options: MongoClientOptions = {
      maxPoolSize: config.mongodb.options.maxPoolSize,
      serverSelectionTimeoutMS: config.mongodb.options.serverSelectionTimeoutMS,
      socketTimeoutMS: config.mongodb.options.socketTimeoutMS,
      retryWrites: config.mongodb.options.retryWrites,
      retryReads: config.mongodb.options.retryReads,
      connectTimeoutMS: this.connectionTimeout,
      heartbeatFrequencyMS: 10000,
      maxIdleTimeMS: 30000,
      minPoolSize: 1,
    };

    const client = new MongoClient(config.mongodb.uri, options);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Database connection timeout'));
      }, this.connectionTimeout);

      client.connect()
        .then(() => {
          clearTimeout(timeout);
          resolve(client);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Wait for ongoing connection attempt
   */
  private async waitForConnection(): Promise<Db> {
    const maxWaitTime = 30000; // 30 seconds
    const checkInterval = 100; // 100ms
    const startTime = Date.now();

    while (this.state.isConnecting) {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Timeout waiting for database connection');
      }

      await this.delay(checkInterval);
    }

    if (this.state.db && this.state.client?.topology?.isConnected()) {
      return this.state.db;
    }

    throw new Error('Database connection failed');
  }

  /**
   * Close database connection
   */
  async closeConnection(): Promise<void> {
    if (this.state.client) {
      try {
        await this.state.client.close();
        console.log('🔌 Database connection closed');
      } catch (error) {
        console.error('❌ Error closing database connection:', error);
      } finally {
        this.state.client = null;
        this.state.db = null;
      }
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    isConnected: boolean;
    isConnecting: boolean;
    lastError: string | null;
    connectionAttempts: number;
    lastConnectionAttempt: Date | null;
  } {
    return {
      isConnected: !!(this.state.db && this.state.client?.topology?.isConnected()),
      isConnecting: this.state.isConnecting,
      lastError: this.state.lastError?.message || null,
      connectionAttempts: this.state.connectionAttempts,
      lastConnectionAttempt: this.state.lastConnectionAttempt,
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    details?: any;
  }> {
    try {
      const db = await this.getDatabase();
      await db.admin().ping();

      return {
        status: 'healthy',
        message: 'Database connection is healthy',
        details: {
          database: config.mongodb.dbName,
          connectionString: config.mongodb.uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
          status: this.getConnectionStatus(),
        }
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        details: {
          error: error.message,
          status: this.getConnectionStatus(),
        }
      };
    }
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down database manager...');
    await this.closeConnection();
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Graceful shutdown handling
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    await databaseManager.shutdown();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    await databaseManager.shutdown();
    process.exit(0);
  });
} 