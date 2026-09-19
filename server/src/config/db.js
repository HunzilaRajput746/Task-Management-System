import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    // Check if an external MongoDB URI is provided and reachable
    if (mongoUri && !mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
      try {
        console.log(`Connecting to external MongoDB cluster...`);
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (err) {
        console.warn(`External MongoDB connection failed (${err.message}). Falling back to Embedded In-Memory MongoDB...`);
      }
    }

    // Try local URI first if specified
    if (mongoUri) {
      try {
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 2000,
        });
        console.log(`Local MongoDB Connected successfully at ${conn.connection.host}`);
        return conn;
      } catch (err) {
        console.log(`No active local MongoDB daemon detected (${err.message}).`);
        console.log(`Initializing high-performance In-Memory MongoDB engine...`);
      }
    }

    // Spin up MongoMemoryServer with extended launchTimeout (60s) for Windows binary extraction
    console.log(`Spinning up In-Memory MongoDB instance for zero-config execution...`);
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'pulse_task_manager',
      },
      spawn: {
        timeout: 60000, // 60s timeout for Windows environments
      },
    });

    const uri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`In-Memory MongoDB Connected successfully at: ${uri}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection warning: ${error.message}`);
    // If MongoMemoryServer has a binary error on Windows, provide actionable instructions
    console.log('\n--------------------------------------------------------------');
    console.log('NOTE: If local In-Memory MongoDB binary is blocked by Windows,');
    console.log('you can simply paste any free MongoDB Atlas URI into server/.env:');
    console.log('MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pulse');
    console.log('--------------------------------------------------------------\n');
    throw error;
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
