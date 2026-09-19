import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      try {
        console.log(`Attempting connection to specified MongoDB URI...`);
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
        return conn;
      } catch (err) {
        console.warn(`Could not connect to external MongoDB (${err.message}). Falling back to Embedded In-Memory MongoDB...`);
      }
    }

    // Spin up MongoMemoryServer for zero-friction local development
    console.log(`Spinning up In-Memory MongoDB instance for local review & development...`);
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'pulse_task_manager',
      },
    });

    const uri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`In-Memory MongoDB Connected successfully at: ${uri}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection fatal error: ${error.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
