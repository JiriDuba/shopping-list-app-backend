// src/lib/mongo.js
const mongoose = require('mongoose');

let cached = global.mongoose || { conn: null, promise: null };

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectToDatabase };