const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    use: {
        headless: false,
        channel: 'chrome',
        launchOptions: {
            slowMo: 500
        }
    },
    workers: 1,
    fullyParallel: false,
    reporter: 'list'
});
