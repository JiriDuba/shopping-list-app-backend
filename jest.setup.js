// jest.setup.js
// Nastavíme fiktivní URI, aby kontrola v src/lib/mongo.js prošla.
// MongoMemoryServer si v connect() funkci v test-db.js pak nastaví vlastní URI.
process.env.MONGODB_URI = "mongodb://localhost:27017/test";