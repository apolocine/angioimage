import mongoose from 'mongoose'

declare global {
  var mongoose: {
    conn: any
    promise: Promise<any> | null
  } | undefined
}

const MONGODB_URI = process.env.MONGO_URI

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGO_URI environment variable inside .env.local'
  )
}

let cached = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts)
  }

  try {
    cached.conn = await cached.promise
    console.log('MongoDB connected successfully')
  } catch (e) {
    console.error('MongoDB connection error:', e)
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect