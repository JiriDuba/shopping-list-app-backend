// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: {}, // Žádná transformace, bereme soubory tak, jak jsou
  // ŽÁDNÝ moduleNameMapper zde nesmí být!
};