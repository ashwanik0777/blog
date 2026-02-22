import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

mongoose.set('strictQuery', true);
mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    // Ensure database name is "Blog"
    const uri = MONGODB_URI.includes('/Blog') || MONGODB_URI.includes('?') 
      ? MONGODB_URI 
      : MONGODB_URI.replace(/\/[^/?]*(\?|$)/, '/Blog$1');
    
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      dbName: 'Blog',
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
    }).then((mongoose) => {
      console.log('✅ Connected to MongoDB database: Blog');
      return mongoose;
    }).catch((error) => {
      cached.promise = null;
      throw error;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect; 