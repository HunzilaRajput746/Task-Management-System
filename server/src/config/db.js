import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoInstance } from 'mongodb-memory-server-core';

// On Windows, the mongo_killer sub-process misidentifies parent PID via process.kill(pid, 0)
// and kills mongod prematurely. Bypassing _launchKiller ensures rock-solid process persistence.
if (process.platform === 'win32' && MongoInstance?.prototype) {
  MongoInstance.prototype._launchKiller = function () {
    return undefined;
  };
}

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

    // Spin up MongoMemoryServer with killer-process bypass and extended timeout
    console.log(`Spinning up In-Memory MongoDB instance for zero-config execution...`);
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'pulse_task_manager',
      },
      spawn: {
        timeout: 60000,
      },
    });

    const uri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`In-Memory MongoDB Connected successfully at: ${uri}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection warning: ${error.message}`);
    throw error;
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
