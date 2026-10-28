const { test: base, expect } = require('@playwright/test');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const test = base.extend({
    // Worker fixture: Khởi chạy Chrome 1 lần duy nhất cho toàn bộ các test case
    workerStorage: [async ({}, use) => {
        const userDataDir = path.resolve(
            __dirname,
            '23130064_TruongCaoDoan',
            '.chrome_profile'
        );

        if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir, { recursive: true });
        }

        const context = await chromium.launchPersistentContext(userDataDir, {
            headless: false,
            channel: 'chrome',
            viewport: null,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--start-maximized'
            ],
            ignoreDefaultArgs: ['--enable-automation']
        });

        await use(context);
        await context.close();
    }, { scope: 'worker' }],

    // Test-scoped fixture: Tái sử dụng context từ workerStorage và không đóng giữa các test
    context: async ({ workerStorage }, use) => {
        await use(workerStorage);
    },

    page: async ({ context }, use) => {
        let page = context.pages().find(p => !p.isClosed());
        if (!page) {
            page = await context.newPage();
        }
        await use(page);
    }
});

module.exports = { test, expect };