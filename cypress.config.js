const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_baseUrl || 'http://localhost:5000',
    supportFile: false,
    viewportWidth: 1280,
    viewportHeight: 800,
    setupNodeEvents(on, config) {},
  },
});
