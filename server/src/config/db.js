import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is required. Add it in Render or your local environment.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
