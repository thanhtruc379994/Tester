const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    timeout: 30000,
    use: {
        headless: false,
        channel: 'chrome',
        actionTimeout: 15000,
        launchOptions: {
            slowMo: 300
        }
    },
    workers: 1,
    fullyParallel: false,
    reporter: 'list'
});
