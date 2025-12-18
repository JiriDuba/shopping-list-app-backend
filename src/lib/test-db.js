// src/lib/test-db.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connect = async () => {
  if (mongoServer) return;

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // KLÍČOVÝ ŘÁDEK: Nastavíme URI do env, aby ho viděl i mongo.js
  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);
};

const close = async () => {
  if (mongoServer) {
    await mongoose.connection.close();
    await mongoServer.stop();
    mongoServer = null;
  }
};

const clear = async () => {
  if (mongoServer) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

module.exports = { connect, close, clear };