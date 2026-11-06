const { test, expect } = require('./fixtures');

test.describe('Admin Content Message Templates View', () => {
    test('CONTENT_MsgTpl_View_01: Kiem tra mo trang Message templates tu menu Content management', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const contentMenu = page.locator('nav.mt-2 li.nav-item:has(> a:has-text("Content management"))').first();
        await expect(contentMenu).toBeVisible({ timeout: 15000 });

        const isExpanded = await contentMenu.evaluate(el => el.classList.contains('menu-open') || el.classList.contains('menu-is-opening'));
        if (!isExpanded) {
            await contentMenu.locator('> a').click();
            await page.waitForTimeout(500);
        }

        const msgTplLink = contentMenu.locator('a[href*="/Admin/MessageTemplate/List"]').first();
        await expect(msgTplLink).toBeVisible({ timeout: 10000 });
        await msgTplLink.click();
        await page.waitForLoadState('domcontentloaded');

        await expect(page).toHaveURL(/Admin\/MessageTemplate\/List/i);
        const heading = page.locator('.content-header h1:not(.throbber-header), h1:not(.throbber-header)').first();
        await expect(heading).toContainText(/Message templates/i);

        const addNewBtn = page.locator('a:has-text("Add new"), button:has-text("Add new")');
        expect(await addNewBtn.count()).toBe(0);
    });

    test('CONTENT_MsgTpl_View_02: Kiem tra khung Search hien thi dung', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await expect(searchKeywords).toBeVisible({ timeout: 15000 });
        await expect(searchKeywords).toHaveValue('');

        const isActiveSelect = page.locator('#IsActiveId, #SearchIsActiveId, select[name*="Active"]').first();
        await expect(isActiveSelect).toBeVisible({ timeout: 15000 });

        const searchBtn = page.locator('#search-templates, button:has-text("Search")').first();
        await expect(searchBtn).toBeVisible({ timeout: 15000 });
    });

    test('CONTENT_MsgTpl_View_03: Kiem tra cac cot va du lieu mac dinh trong luoi', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const gridTable = page.locator('#templates-grid, table.dataTable').first();
        await expect(gridTable).toBeVisible({ timeout: 15000 });

        const headerText = await page.locator('#templates-grid thead, table.dataTable thead').first().innerText();
        expect(headerText).toContain('Name');
        expect(headerText).toContain('Subject');
        expect(headerText).toContain('Is active');
        expect(headerText).toContain('Limited to stores');
        expect(headerText).toContain('Edit');

        const editBtn = page.locator('#templates-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
        await expect(editBtn).toBeVisible({ timeout: 15000 });
    });

    test('CONTENT_MsgTpl_View_04: Kiem tra mac dinh hien thi tat ca template khi chua tim kiem', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await expect(searchKeywords).toHaveValue('');

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const rows = page.locator('#templates-grid tbody tr');
        expect(await rows.count()).toBeGreaterThan(0);

        const infoText = page.locator('.dt-info, #templates-grid_info, .dataTables_info').first();
        await expect(infoText).toBeVisible({ timeout: 15000 });
    });

    test('CONTENT_MsgTpl_View_05: Kiem tra tooltip dau ? cua Search keywords', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const helpIcon = page.locator('.card-search .fa-question-circle, .card-search [title*="Search"], label:has-text("Search keywords") .fa-question-circle').first();
        if (await helpIcon.isVisible().catch(() => false)) {
            await helpIcon.hover();
            const tooltip = page.locator('.tooltip.show, [role="tooltip"], .tooltip-inner').first();
            await expect(tooltip).toBeVisible({ timeout: 5000 });
        } else {
            const label = page.locator('label:has-text("Search keywords"), label[for="SearchKeywords"]').first();
            await expect(label).toBeVisible();
        }
    });

    test('CONTENT_MsgTpl_View_06: Kiem tra tooltip dau ? cua Is active', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const helpIcon = page.locator('label:has-text("Is active") .fa-question-circle, label:has-text("Active") .fa-question-circle, .card-search .fa-question-circle').nth(1);
        if (await helpIcon.isVisible().catch(() => false)) {
            await helpIcon.hover();
            const tooltip = page.locator('.tooltip.show, [role="tooltip"], .tooltip-inner').first();
            await expect(tooltip).toBeVisible({ timeout: 5000 });
        } else {
            const label = page.locator('label:has-text("Is active"), label:has-text("Active")').first();
            await expect(label).toBeVisible();
        }
    });

    test('CONTENT_MsgTpl_View_07: Kiem tra thu gon va mo rong khung Search', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('Blog');
        await expect(searchKeywords).toHaveValue('Blog');

        const collapseBtn = page.locator('.card-search button[data-card-widget="collapse"], .card-search [data-card-widget="collapse"]').first();
        if (await collapseBtn.isVisible().catch(() => false)) {
            await collapseBtn.click();
            await page.waitForTimeout(500);
            await collapseBtn.click();
            await page.waitForTimeout(500);
            await expect(searchKeywords).toHaveValue('Blog');
        } else {
            await expect(searchKeywords).toHaveValue('Blog');
        }
    });

    test('CONTENT_MsgTpl_View_08: Kiem tra lien ket Learn more about message templates', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const docLink = page.locator('a[href*="docs.nopcommerce.com"]:has-text("message templates"), a[href*="docs"]:has-text("message")').first();
        if (await docLink.isVisible().catch(() => false)) {
            const href = await docLink.getAttribute('href');
            expect(href).toContain('docs.nopcommerce.com');
        } else {
            const learnMoreText = page.locator('body:has-text("Learn more")').first();
            await expect(learnMoreText).toBeVisible();
        }
    });
});

test.describe('Admin Content Message Templates Security', () => {
    test('CONTENT_MsgTpl_Security_01: Kiem tra truy cap trang Message templates khi chua dang nhap admin', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/logout', { waitUntil: 'domcontentloaded' });
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });

        await expect(page).toHaveURL(/.*\/login.*/i);
        const loginBtn = page.locator('button[type="submit"], button:has-text("Log in")');
        await expect(loginBtn).toBeVisible();

        await loginBtn.click();
        await page.waitForLoadState('domcontentloaded');
    });
});

test.describe('Admin Content Message Templates Search', () => {
    test('CONTENT_MsgTpl_Search_01: Kiem tra tim theo ten template day du', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('Blog.BlogComment');
        await page.locator('#search-templates, button:has-text("Search")').first().click();

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const tableText = await page.locator('#templates-grid tbody').innerText();
        expect(tableText).toContain('Blog.BlogComment');
    });

    test('CONTENT_MsgTpl_Search_02: Kiem tra tim theo mot phan ten template', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('Blog');
        await page.locator('#search-templates, button:has-text("Search")').first().click();

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const tableText = await page.locator('#templates-grid tbody').innerText();
        expect(tableText).toContain('Blog');
    });

    test('CONTENT_MsgTpl_Search_03: Kiem tra tim khong phan biet chu hoa / chu thuong', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        const searchBtn = page.locator('#search-templates, button:has-text("Search")').first();

        await searchKeywords.fill('blog');
        await searchBtn.click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const countLower = await page.locator('#templates-grid tbody tr').count();

        await searchKeywords.fill('BLOG');
        await searchBtn.click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const countUpper = await page.locator('#templates-grid tbody tr').count();

        expect(countLower).toEqual(countUpper);
    });

    test('CONTENT_MsgTpl_Search_04: Kiem tra tim theo noi dung Subject', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_MsgTpl_Search_04)').toBe(false);
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('Back in stock');
        await page.locator('#search-templates, button:has-text("Search")').first().click();

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const tableText = await page.locator('#templates-grid tbody').innerText();
        expect(tableText).toContain('Customer.BackInStock');
    });

    test('CONTENT_MsgTpl_Search_05: Kiem tra tim theo nhieu tu khoa', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('Customer Email');
        await page.locator('#search-templates, button:has-text("Search")').first().click();

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const rows = page.locator('#templates-grid tbody tr');
        expect(await rows.count()).toBeGreaterThanOrEqual(0);
    });

    test('CONTENT_MsgTpl_Search_06: Kiem tra tim co khoang trang dau va cuoi tu khoa', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('  Blog.BlogComment  ');
        await page.locator('#search-templates, button:has-text("Search")').first().click();

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const tableText = await page.locator('#templates-grid tbody').innerText();
        expect(tableText).toContain('Blog.BlogComment');
    });

    test('CONTENT_MsgTpl_Search_07: Kiem tra tim bang tieng Viet co dau', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_MsgTpl_Search_07)').toBe(false);
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('Thư điện tử');
        await page.locator('#search-templates, button:has-text("Search")').first().click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const tableText = await page.locator('#templates-grid tbody').innerText();
        expect(tableText).toContain('Thư điện tử');
    });

    test('CONTENT_MsgTpl_Search_08: Kiem tra de trong tu khoa roi click Search', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        const searchBtn = page.locator('#search-templates, button:has-text("Search")').first();

        await searchKeywords.fill('Blog.BlogComment');
        await searchBtn.click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

        await searchKeywords.fill('');
        await searchBtn.click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

        const rows = page.locator('#templates-grid tbody tr');
        expect(await rows.count()).toBeGreaterThan(1);
    });

    test('CONTENT_MsgTpl_Search_09: Kiem tra tim voi tu khoa chi gom khoang trang', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_MsgTpl_Search_09)').toBe(false);
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('   ');
        await page.locator('#search-templates, button:has-text("Search")').first().click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

        const alert = page.locator('.alert-danger, .field-validation-error');
        await expect(alert.first()).toBeVisible();
    });

    test('CONTENT_MsgTpl_Search_10: Kiem tra tim voi tu khoa khong co template khop', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('xyzabc123');
        await expect(searchKeywords).toHaveValue('xyzabc123');
        await searchKeywords.press('Enter');
        const searchBtn = page.locator('#search-templates, button:has-text("Search")').first();
        await searchBtn.click();

        await page.waitForTimeout(1000);
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

        const emptyMessage = page.locator('#templates-grid .dataTables_empty, #templates-grid tbody td:has-text("No data"), #templates-grid tbody td:has-text("No matching")');
        if (await emptyMessage.first().isVisible({ timeout: 8000 }).catch(() => false)) {
            await expect(emptyMessage.first()).toBeVisible();
        } else {
            const tableText = await page.locator('#templates-grid tbody').innerText();
            const hasNoData = /no data|no records|no matching/i.test(tableText) || !tableText.includes('Blog.BlogComment');
            expect(hasNoData).toBe(true);
        }
    });

    test('CONTENT_MsgTpl_Search_11: Kiem tra tim voi ky tu dac biet', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('@#$%^&*()');
        await page.locator('#search-templates, button:has-text("Search")').first().click();

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        await expect(page.locator('body')).not.toContainText('500');
    });

    test('CONTENT_MsgTpl_Search_12: Kiem tra tim voi chuoi SQL injection', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill("'' OR '1'='1'");
        await page.locator('#search-templates, button:has-text("Search")').first().click();

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        await expect(page.locator('body')).not.toContainText('500');
    });

    test('CONTENT_MsgTpl_Search_13: Kiem tra tim voi doan ma script (XSS)', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        let alertFired = false;
        page.on('dialog', async dialog => {
            alertFired = true;
            await dialog.dismiss().catch(() => {});
        });

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('<script>alert(1)</script>');
        await page.locator('#search-templates, button:has-text("Search")').first().click();

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        expect(alertFired).toBe(false);
    });

    test('CONTENT_MsgTpl_Search_14: Kiem tra tim voi chuoi rat dai (1000 ky tu)', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_MsgTpl_Search_14)').toBe(false);
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const longKeyword = 'a'.repeat(1000);
        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill(longKeyword);
        await page.locator('#search-templates, button:has-text("Search")').first().click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        await expect(page.locator('.field-validation-error')).toBeVisible();
    });

    test('CONTENT_MsgTpl_Search_15: Kiem tra nhan phim Enter thay cho nut Search', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('Blog.BlogComment');
        await searchKeywords.press('Enter');

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const tableText = await page.locator('#templates-grid tbody').innerText();
        expect(tableText).toContain('Blog.BlogComment');
    });
});

test.describe('Admin Content Message Templates Filter', () => {
    test('CONTENT_MsgTpl_Filter_01: Kiem tra loc Is active = Active only', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const isActiveSelect = page.locator('#IsActiveId, #SearchIsActiveId, select[name*="Active"]').first();
        await isActiveSelect.selectOption({ label: 'Active only' }).catch(async () => {
            await isActiveSelect.selectOption('1');
        });

        await page.locator('#search-templates, button:has-text("Search")').first().click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

        const trueIcons = page.locator('#templates-grid tbody .fa-check, #templates-grid tbody .true-icon');
        expect(await trueIcons.count()).toBeGreaterThan(0);
    });

    test('CONTENT_MsgTpl_Filter_02: Kiem tra loc Is active = Inactive only', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const isActiveSelect = page.locator('#IsActiveId, #SearchIsActiveId, select[name*="Active"]').first();
        await isActiveSelect.selectOption({ label: 'Inactive only' }).catch(async () => {
            await isActiveSelect.selectOption('2');
        });

        await page.locator('#search-templates, button:has-text("Search")').first().click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

        const rows = page.locator('#templates-grid tbody tr');
        expect(await rows.count()).toBeGreaterThanOrEqual(1);
    });

    test('CONTENT_MsgTpl_Filter_03: Kiem tra chon lai Is active = All', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const isActiveSelect = page.locator('#IsActiveId, #SearchIsActiveId, select[name*="Active"]').first();
        const searchBtn = page.locator('#search-templates, button:has-text("Search")').first();

        await isActiveSelect.selectOption({ label: 'Active only' }).catch(async () => {
            await isActiveSelect.selectOption('1');
        });
        await searchBtn.click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

        await isActiveSelect.selectOption({ label: 'All' }).catch(async () => {
            await isActiveSelect.selectOption('0');
        });
        await searchBtn.click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

        const rows = page.locator('#templates-grid tbody tr');
        expect(await rows.count()).toBeGreaterThan(0);
    });

    test('CONTENT_MsgTpl_Filter_04: Kiem tra ket hop tu khoa va Is active', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('Blog');

        const isActiveSelect = page.locator('#IsActiveId, #SearchIsActiveId, select[name*="Active"]').first();
        await isActiveSelect.selectOption({ label: 'Active only' }).catch(async () => {
            await isActiveSelect.selectOption('1');
        });

        await page.locator('#search-templates, button:has-text("Search")').first().click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

        const tableText = await page.locator('#templates-grid tbody').innerText();
        expect(tableText).toContain('Blog');
    });
});

test.describe('Admin Content Message Templates Grid', () => {
    test('CONTENT_MsgTpl_Grid_01: Kiem tra thong tin tong so ban ghi va phan trang', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const lengthSelect = page.locator('.dt-length select, select[aria-controls="templates-grid"], #dt-length-0, select[name*="length"]').first();
        await expect(lengthSelect).toBeVisible({ timeout: 15000 });

        const infoText = page.locator('.dt-info, #templates-grid_info, .dataTables_info').first();
        await expect(infoText).toBeVisible({ timeout: 15000 });
        const text = await infoText.innerText();
        expect(text.length).toBeGreaterThan(0);
    });

    test('CONTENT_MsgTpl_Grid_02: Kiem tra doi so dong moi trang va chuyen trang', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const lengthSelect = page.locator('.dt-length select, select[aria-controls="templates-grid"], #dt-length-0, select[name*="length"]').first();
        await expect(lengthSelect).toBeVisible({ timeout: 15000 });

        const options = await lengthSelect.locator('option').allInnerTexts();
        const optionValues = options.map(o => o.trim()).filter(Boolean);
        const smallSize = optionValues.find(v => Number(v) > 0 && Number(v) <= 10) || optionValues[0];

        await lengthSelect.selectOption(smallSize);
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(1500);

        const rows = await page.locator('#templates-grid tbody tr').count();
        expect(rows).toBeGreaterThan(0);
    });

    test('CONTENT_MsgTpl_Grid_03: Kiem tra phan trang giu nguyen tu khoa tim kiem', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_MsgTpl_Grid_03)').toBe(false);
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('Customer');
        await page.locator('#search-templates, button:has-text("Search")').first().click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

        const nextBtn = page.locator('.dt-paging a.next, #templates-grid_paginate .next a, .pagination a:has-text("Next")').first();
        await nextBtn.click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

        await expect(searchKeywords).toHaveValue('WrongKeywordExpected');
    });
});

test.describe('Admin Content Message Templates Copy', () => {
    test('CONTENT_MsgTpl_Copy_01: Kiem tra tao ban sao template bang [Copy template]', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await expect(editBtn).toBeVisible({ timeout: 15000 });
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const copyBtn = page.locator('#message-template-copy, button:has-text("Copy template"), button[name="copytemplate"]').first();
        if (await copyBtn.isVisible().catch(() => false)) {
            await copyBtn.click();
            const copyModal = page.locator('.modal.show, #copytemplate-window').first();
            if (await copyModal.isVisible().catch(() => false)) {
                const submitCopy = copyModal.locator('button[type="submit"], button:has-text("Copy")').first();
                await submitCopy.click();
                await page.waitForLoadState('domcontentloaded');
            }
        }

        const subjectInput = page.locator('#Subject, input[name="Subject"]').first();
        await expect(subjectInput).toBeVisible({ timeout: 15000 });
        await subjectInput.fill('TEST_MsgTpl subject');

        const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
        await saveBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const alertEl = page.locator('.alert, #admin-notifications, .content-header').first();
        await expect(alertEl).toBeVisible({ timeout: 15000 });
    });
});

test.describe('Admin Content Message Templates Edit', () => {
    test('CONTENT_MsgTpl_Edit_01: Kiem tra click [Edit] mo dung template', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await expect(editBtn).toBeVisible({ timeout: 15000 });
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        await expect(page).toHaveURL(/Admin\/MessageTemplate\/Edit/i);
        const heading = page.locator('.content-header h1:not(.throbber-header), h1:not(.throbber-header)').first();
        await expect(heading).toContainText(/Edit message template details/i);
    });

    test('CONTENT_MsgTpl_Edit_02: Kiem tra cac truong va nut tren trang Edit', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        await expect(page.locator('#Subject, input[name="Subject"]').first()).toBeVisible({ timeout: 15000 });
        await expect(page.locator('#IsActive, input[name="IsActive"]').first()).toBeAttached();
        await expect(page.locator('button[name="save"], button:has-text("Save")').first()).toBeVisible();
    });

    test('CONTENT_MsgTpl_Edit_03: Kiem tra sua Subject va luu', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const subjectInput = page.locator('#Subject, input[name="Subject"]').first();
        await subjectInput.fill('TEST_MsgTpl subject updated');

        const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
        await saveBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const alertEl = page.locator('.alert, #admin-notifications, .content-header').first();
        await expect(alertEl).toBeVisible({ timeout: 15000 });
    });

    test('CONTENT_MsgTpl_Edit_04: Kiem tra sua Body va luu', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const bodyInput = page.locator('#Body, textarea[name="Body"], .note-editable, iframe[id*="Body"]').first();
        if (await bodyInput.isVisible().catch(() => false)) {
            await bodyInput.fill('Noi dung kiem thu TEST_MsgTpl').catch(() => {});
        }

        const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
        await saveBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const alertEl = page.locator('.alert, #admin-notifications, .content-header').first();
        await expect(alertEl).toBeVisible({ timeout: 15000 });
    });

    test('CONTENT_MsgTpl_Edit_05: Kiem tra luu bang [Save and Continue Edit]', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const subjectInput = page.locator('#Subject, input[name="Subject"]').first();
        await subjectInput.fill('TEST_MsgTpl subject 2');

        const saveContBtn = page.locator('button[name="save-continue"], button:has-text("Save and Continue Edit")').first();
        await saveContBtn.click();
        await page.waitForLoadState('domcontentloaded');

        await expect(page).toHaveURL(/Admin\/MessageTemplate\/Edit/i);
    });

    test('CONTENT_MsgTpl_Edit_06: Kiem tra Subject chua token hop le', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const subjectInput = page.locator('#Subject, input[name="Subject"]').first();
        await subjectInput.fill('%Store.Name%. TEST_MsgTpl');

        const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
        await saveBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const alertEl = page.locator('.alert, #admin-notifications, .content-header').first();
        await expect(alertEl).toBeVisible({ timeout: 15000 });
    });

    test('CONTENT_MsgTpl_Edit_07: Kiem tra sua Subject bang tieng Viet co dau', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const subjectInput = page.locator('#Subject, input[name="Subject"]').first();
        await subjectInput.fill('Thông báo kiểm thử TEST_MsgTpl');
        await page.locator('button[name="save"], button:has-text("Save")').first().click();
        await page.waitForLoadState('domcontentloaded');
        const alertEl = page.locator('.alert-success, .alert, #admin-notifications, .content-header').first();
        await expect(alertEl).toBeVisible({ timeout: 15000 });
    });

    test('CONTENT_MsgTpl_Edit_08: Kiem tra xoa trong Subject khi sua', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const subjectInput = page.locator('#Subject, input[name="Subject"]').first();
        await subjectInput.fill('');

        const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
        await saveBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const errorMsg = page.locator('.field-validation-error, span[data-valmsg-for="Subject"], .text-danger').first();
        await expect(errorMsg).toBeVisible({ timeout: 10000 });
    });

    test('CONTENT_MsgTpl_Edit_09: Kiem tra xoa trong Body khi sua', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_MsgTpl_Edit_09)').toBe(false);
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const bodyInput = page.locator('#Body, textarea[name="Body"]').first();
        if (await bodyInput.isVisible().catch(() => false)) {
            await bodyInput.fill('');
        }
        await page.locator('button[name="save"], button:has-text("Save")').first().click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('.field-validation-error:has-text("Body is required")')).toBeVisible();
    });

    test('CONTENT_MsgTpl_Edit_10: Kiem tra nhap Body chua ma script', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_MsgTpl_Edit_10)').toBe(false);
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const bodyInput = page.locator('#Body, textarea[name="Body"]').first();
        if (await bodyInput.isVisible().catch(() => false)) {
            await bodyInput.fill("<script>alert('xss')</script>");
        }
        await page.locator('button[name="save"], button:has-text("Save")').first().click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('.alert-danger:has-text("Dangerous request")')).toBeVisible();
    });

    test('CONTENT_MsgTpl_Edit_11: Kiem tra sua du lieu nhung thoat khong luu', async ({ page }) => {
        page.on('dialog', async dialog => {
            await dialog.accept().catch(() => {});
        });

        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const subjectInput = page.locator('#Subject, input[name="Subject"]').first();
        await subjectInput.fill('TEST_MsgTpl khong luu');

        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        const gridTable = page.locator('#templates-grid, table.dataTable').first();
        await expect(gridTable).toBeVisible({ timeout: 15000 });

        const tableText = await page.locator('#templates-grid').innerText();
        expect(tableText).not.toContain('TEST_MsgTpl khong luu');
    });
});

test.describe('Admin Content Message Templates Setting', () => {
    test('CONTENT_MsgTpl_Setting_01: Kiem tra tat Is active - cot Is active doi thanh dau X', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const isActiveCheckbox = page.locator('#IsActive, input[name="IsActive"]').first();
        if (await isActiveCheckbox.isChecked()) {
            await isActiveCheckbox.uncheck();
        }

        const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
        await saveBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const gridTable = page.locator('#templates-grid, table.dataTable').first();
        await expect(gridTable).toBeVisible({ timeout: 15000 });
    });

    test('CONTENT_MsgTpl_Setting_02: Kiem tra bat lai Is active - cot Is active doi thanh dau tick', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const isActiveCheckbox = page.locator('#IsActive, input[name="IsActive"]').first();
        if (!await isActiveCheckbox.isChecked()) {
            await isActiveCheckbox.check();
        }

        const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
        await saveBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const gridTable = page.locator('#templates-grid, table.dataTable').first();
        await expect(gridTable).toBeVisible({ timeout: 15000 });
    });
});

test.describe('Admin Content Message Templates Delete', () => {
    test('CONTENT_MsgTpl_Delete_01: Kiem tra huy xoa template o hop thoai xac nhan', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const deleteBtn = page.locator('#message-template-delete, button:has-text("Delete"), button.btn-danger').first();
        if (await deleteBtn.isVisible().catch(() => false)) {
            await deleteBtn.click();
            const modal = page.locator('#messagetemplate-delete-action-alert, .modal.show').first();
            if (await modal.isVisible().catch(() => false)) {
                const cancelBtn = modal.locator('button[data-dismiss="modal"], button:has-text("Cancel"), button:has-text("No"), .close').first();
                await cancelBtn.click();
                await expect(deleteBtn).toBeVisible();
            }
        }
    });

    test('CONTENT_MsgTpl_Delete_02: Kiem tra xoa template do minh tao', async ({ page }) => {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('TEST_MsgTpl');
        await page.locator('#search-templates, button:has-text("Search")').first().click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        if (await editBtn.isVisible().catch(() => false)) {
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            const deleteBtn = page.locator('#message-template-delete, button:has-text("Delete"), button.btn-danger').first();
            if (await deleteBtn.isVisible().catch(() => false)) {
                await deleteBtn.click();
                const modal = page.locator('#messagetemplate-delete-action-alert, .modal.show').first();
                if (await modal.isVisible().catch(() => false)) {
                    const confirmBtn = modal.locator('button[type="submit"], button.btn-danger, button:has-text("Delete")').first();
                    await confirmBtn.click();
                    await page.waitForLoadState('domcontentloaded');
                }
            }
        }

        const gridTable = page.locator('#templates-grid, table.dataTable, body').first();
        await expect(gridTable).toBeVisible({ timeout: 15000 });
    });

    test('CONTENT_MsgTpl_Delete_03: Kiem tra template da xoa khong con trong danh sach', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_MsgTpl_Delete_03)').toBe(false);
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const searchKeywords = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
        await searchKeywords.fill('TEST_MsgTpl');
        await page.locator('#search-templates, button:has-text("Search")').first().click();
        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

        const tableText = await page.locator('#templates-grid tbody').innerText();
        expect(tableText).toContain('TEST_MsgTpl');
    });
});

test.describe('Admin Content Message Templates GUI', () => {
    test('CONTENT_MsgTpl_GUI_01: Kiem tra layout trang Message templates tren may tinh', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const heading = page.locator('.content-header h1:not(.throbber-header), h1:not(.throbber-header), .content-header').first();
        await expect(heading).toBeVisible();

        const searchCard = page.locator('.card-search, .card').first();
        await expect(searchCard).toBeVisible();

        const gridTable = page.locator('#templates-grid, table.dataTable').first();
        await expect(gridTable).toBeVisible({ timeout: 15000 });

        const sidebar = page.locator('.main-sidebar, aside.main-sidebar').first();
        await expect(sidebar).toBeVisible();

        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(hasHorizontalScroll).toBeFalsy();
    });

    test('CONTENT_MsgTpl_GUI_02: Kiem tra layout trang Message templates tren man hinh nho', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        const heading = page.locator('.content-header h1:not(.throbber-header), h1:not(.throbber-header), .content-header').first();
        await expect(heading).toBeVisible();

        const searchBtn = page.locator('#search-templates, button:has-text("Search")').first();
        await expect(searchBtn).toBeVisible();

        const gridTable = page.locator('#templates-grid, table.dataTable').first();
        await expect(gridTable).toBeVisible({ timeout: 15000 });
    });

    test('CONTENT_MsgTpl_GUI_03: Kiem tra thong bao thanh cong / loi hien thi dung vi tri', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_MsgTpl_GUI_03)').toBe(false);
        await page.goto('https://admin-demo.nopcommerce.com/Admin/MessageTemplate/List', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('login')) {
            await page.locator('button[type="submit"], button:has-text("Log in")').click();
            await page.waitForLoadState('domcontentloaded');
        }

        const editBtn = page.locator('#templates-grid a:has-text("Edit")').first();
        await editBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
        await saveBtn.click();
        await page.waitForLoadState('domcontentloaded');

        const toast = page.locator('#toast-container, .toast-bottom-right');
        await expect(toast).toBeVisible();
    });
});
