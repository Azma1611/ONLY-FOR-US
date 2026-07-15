import dotenv from 'dotenv';
dotenv.config();

/**
 * Database Configuration
 * Modular structure to support switching databases easily.
 */
export const dbConfig = {
  // MongoDB Atlas configuration
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true
    }
  },
  
  // Future-proofing for MySQL / PostgreSQL
  mysql: {
    uri: process.env.MYSQL_URI || '', // Not implemented yet
  },
  
  postgres: {
    uri: process.env.POSTGRES_URI || '', // Not implemented yet
  }
};
