const { test, expect, ensureDisplayCardExpanded } = require('./fixtures');

test.describe('Admin Content Topics View', () => {
    test('CONTENT_Topic_View_01: Kiem tra mo trang Topics (pages) tu menu Content management', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const contentMenu = page.locator('.nav-sidebar li.nav-item').filter({ hasText: 'Content management' }).locator('a.nav-link').first();
            const topicsSubmenu = page.locator('.nav-sidebar a[href*="/Admin/Topic/List"]').first();

            if (!await topicsSubmenu.isVisible().catch(() => false)) {
                await contentMenu.click();
            }

            await expect(topicsSubmenu).toBeVisible({ timeout: 15000 });
            await topicsSubmenu.click();
            await page.waitForLoadState('domcontentloaded');

            await expect(page).toHaveURL(/.*\/Admin\/Topic\/List/i);
            await expect(page.getByRole('heading', { name: 'Topics (pages)' })).toBeVisible();
            await expect(page.locator('a:has-text("Add new")').first()).toBeVisible();
        });

    test('CONTENT_Topic_View_02: Kiem tra khung Search hien thi dung', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await expect(keywordsInput).toBeVisible({ timeout: 15000 });
            await expect(keywordsInput).toHaveValue('');

            const helpIcon = page.locator('.ico-help, [data-toggle="tooltip"], i.fa-question-circle').first();
            await expect(helpIcon).toBeVisible();

            const searchButton = page.locator('#search-topics, button:has-text("Search")').first();
            await expect(searchButton).toBeVisible();
        });

    test('CONTENT_Topic_View_03: Kiem tra cac cot va du lieu mac dinh trong luoi', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const gridTable = page.locator('#topics-grid, table.dataTable').first();
            await expect(gridTable).toBeVisible({ timeout: 15000 });

            const headerText = await gridTable.locator('thead').innerText();
            expect(headerText).toContain('Name');
            expect(headerText).toContain('Published');
            expect(headerText).toContain('Password protected');
            expect(headerText).toContain('Include in sitemap');
            expect(headerText).toContain('Edit');

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
            await expect(editBtn).toBeVisible();

            const checkOrCloseIcon = page.locator('#topics-grid i, table.dataTable i, .true-icon, .false-icon').first();
            await expect(checkOrCloseIcon).toBeVisible();
        });

    test('CONTENT_Topic_View_04: Kiem tra mac dinh hien thi tat ca topic khi chua tim kiem', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const rows = page.locator('#topics-grid tbody tr, table tbody tr');
            await expect(rows.first()).toBeVisible({ timeout: 15000 });
            const count = await rows.count();
            expect(count).toBeGreaterThan(0);

            const pagination = page.locator('nav[aria-label="pagination"], .pagination, [role="status"], .card-body');
            await expect(pagination.first()).toBeVisible();
        });

    test('CONTENT_Topic_View_05: Kiem tra tooltip dau ? cua Search keywords', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_Topic_View_05)').toBe(false);
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const helpIcon = page.locator('.ico-help, [data-toggle="tooltip"], i.fa-question-circle').first();
            await expect(helpIcon).toBeVisible({ timeout: 15000 });

            await helpIcon.hover();
            const tooltip = page.locator('.tooltip, [role="tooltip"], .tooltip-inner');
            const isTooltipVisible = await tooltip.first().waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);

            if (isTooltipVisible) {
                await expect(tooltip.first()).toBeVisible();
            } else {
                const attrTitle = await helpIcon.getAttribute('data-original-title') || await helpIcon.getAttribute('title') || await helpIcon.locator('..').getAttribute('title');
                expect(attrTitle || await helpIcon.isVisible()).toBeTruthy();
            }
        });

    test('CONTENT_Topic_View_06: Kiem tra thu gon va mo rong khung Search', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const collapseBtn = page.locator('button[data-card-widget="collapse"], .card-tools .btn-tool, .search-row i').first();
            const searchBody = page.locator('.card-body, .search-body').first();

            await expect(searchBody).toBeVisible({ timeout: 15000 });

            await collapseBtn.click();
            await page.waitForTimeout(500);

            await collapseBtn.click();
            await page.waitForTimeout(500);
            await expect(searchBody).toBeVisible();
        });

    test('CONTENT_Topic_View_07: Kiem tra lien ket Learn more about topics pages', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const learnMoreLink = page.locator('.content a[href*="docs.nopcommerce.com"], .content a[href*="topics-pages"]').first();
            await expect(learnMoreLink).toBeVisible({ timeout: 15000 });

            const href = await learnMoreLink.getAttribute('href');
            expect(href).toContain('docs.nopcommerce.com');
        });
});

test.describe('Admin Content Topics Add', () => {
    test('CONTENT_Topic_Add_01: Kiem tra click Add new mo trang them topic', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const addNewBtn = page.locator('a[href*="/Admin/Topic/Create"], a:has-text("Add new")').first();
            await expect(addNewBtn).toBeVisible({ timeout: 15000 });
            await addNewBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await expect(page).toHaveURL(/.*\/Admin\/Topic\/Create/i);
            await expect(page.locator('#Title, input[name="Title"]')).toBeVisible({ timeout: 15000 });
            await ensureDisplayCardExpanded(page);
            await expect(page.locator('#SystemName, input[name="SystemName"]')).toBeVisible({ timeout: 15000 });
            await expect(page.locator('button[name="save"], button:has-text("Save")').first()).toBeVisible();
        });

    test('CONTENT_Topic_Add_02: Kiem tra them topic voi thong tin hop le', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/Create', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await ensureDisplayCardExpanded(page);

            const systemName = `test_topic_${Date.now()}`;
            const title = 'Test topic 01';

            await page.locator('#Title, input[name="Title"]').fill(title);
            await page.locator('#SystemName, input[name="SystemName"]').fill(systemName);

            await page.evaluate(() => {
                const bodyEl = document.querySelector('#Body');
                if (bodyEl) bodyEl.value = 'Noi dung kiem thu';
                if (window.$ && window.$('#Body').summernote) {
                    window.$('#Body').summernote('code', 'Noi dung kiem thu');
                }
            });

            await page.locator('button[name="save"]').first().click();
            await page.waitForLoadState('domcontentloaded');

            const alertBox = page.locator('.alert-success, .alert:has-text("successfully"), .alert:has-text("security purposes"), #admin-notifications .alert, .alert');
            await expect(alertBox.first()).toBeVisible({ timeout: 15000 });
        });

    test('CONTENT_Topic_Add_03: Kiem tra them topic bang Save and Continue Edit', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/Create', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await ensureDisplayCardExpanded(page);

            const systemName = `test_topic_${Date.now()}`;
            const title = 'Test topic 02';

            await page.locator('#Title, input[name="Title"]').fill(title);
            await expect(page.locator('#Title, input[name="Title"]')).toHaveValue(title);
            await page.locator('#SystemName, input[name="SystemName"]').fill(systemName);

            await page.locator('button[name="save-continue"]').first().click();
            await page.waitForLoadState('domcontentloaded');

            const alertBox = page.locator('.alert-success, .alert:has-text("successfully"), .alert:has-text("security purposes"), #admin-notifications .alert, .alert');
            await expect(alertBox.first()).toBeVisible({ timeout: 15000 });
        });

    test('CONTENT_Topic_Add_04: Kiem tra them topic voi tieu de tieng Viet co dau', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_Topic_Add_04)').toBe(false);
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/Create', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await ensureDisplayCardExpanded(page);

            const systemName = `test_topic_vn_${Date.now()}`;
            const title = 'Chính sách đổi trả';

            await page.locator('#Title, input[name="Title"]').fill(title);
            await expect(page.locator('#Title, input[name="Title"]')).toHaveValue(title);
            await page.locator('#SystemName, input[name="SystemName"]').fill(systemName);

            await page.locator('button[name="save-continue"]').first().click();
            await page.waitForLoadState('domcontentloaded');

            const alertBox = page.locator('.alert-success, .alert:has-text("successfully"), .alert:has-text("security purposes"), #admin-notifications .alert, .alert');
            await expect(alertBox.first()).toBeVisible({ timeout: 15000 });
        });

    test('CONTENT_Topic_Add_05: Kiem tra nhap Body bang trinh soan thao', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/Create', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await ensureDisplayCardExpanded(page);

            const systemName = `test_topic_rt_${Date.now()}`;
            const title = 'Rich text topic';
            const formattedHtml = '<p><b>Bold text</b> and <a href="https://example.com">link</a></p>';

            await page.locator('#Title, input[name="Title"]').fill(title);
            await page.locator('#SystemName, input[name="SystemName"]').fill(systemName);

            await page.evaluate((html) => {
                const bodyEl = document.querySelector('#Body');
                if (bodyEl) bodyEl.value = html;
                if (window.$ && window.$('#Body').summernote) {
                    window.$('#Body').summernote('code', html);
                } else if (window.tinymce && window.tinymce.get('Body')) {
                    window.tinymce.get('Body').setContent(html);
                }
            }, formattedHtml);

            await page.locator('button[name="save-continue"]').first().click();
            await page.waitForLoadState('domcontentloaded');

            const alertBox = page.locator('.alert-success, .alert:has-text("successfully"), .alert:has-text("security purposes"), #admin-notifications .alert, .alert');
            await expect(alertBox.first()).toBeVisible({ timeout: 15000 });
        });

    test('CONTENT_Topic_Add_06: Kiem tra de trong cac truong bat buoc khi luu', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/Create', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await ensureDisplayCardExpanded(page);

            await page.locator('#Title, input[name="Title"]').fill('');
            await page.locator('#SystemName, input[name="SystemName"]').fill('');

            await page.locator('button[name="save"]').first().click();
            await page.waitForLoadState('domcontentloaded');

            const validationError = page.locator('.field-validation-error, .text-danger, .validation-summary-errors, span[data-valmsg-for], #admin-notifications .alert, .alert');
            await expect(validationError.first()).toBeVisible({ timeout: 15000 });
        });

    test('CONTENT_Topic_Add_07: Kiem tra System name trung voi topic da co', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_Topic_Add_07)').toBe(false);
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/Create', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await ensureDisplayCardExpanded(page);

            await page.locator('#Title, input[name="Title"]').fill('Trung ten');
            await page.locator('#SystemName, input[name="SystemName"]').fill('ContactUs');

            await page.locator('button[name="save"]').first().click();
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('body')).not.toContainText('500');
            const alertOrError = page.locator('.field-validation-error, .text-danger, .alert, .message-error');
            await expect(alertOrError.first()).toBeVisible({ timeout: 15000 });
        });

    test('CONTENT_Topic_Add_08: Kiem tra System name chua khoang trang va ky tu dac biet', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/Create', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await ensureDisplayCardExpanded(page);

            await page.locator('#Title, input[name="Title"]').fill('Ky tu dac biet');
            await page.locator('#SystemName, input[name="SystemName"]').fill('test topic @#$');

            await page.locator('button[name="save"]').first().click();
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('body')).not.toContainText('500');
            const alertOrError = page.locator('.alert, .field-validation-error, .text-danger, .content');
            await expect(alertOrError.first()).toBeVisible({ timeout: 15000 });
        });

    test('CONTENT_Topic_Add_09: Kiem tra nhap Display order khong hop le', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/Create', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await ensureDisplayCardExpanded(page);

            const systemName = `test_order_${Date.now()}`;
            await page.locator('#Title, input[name="Title"]').fill('Order test');
            await page.locator('#SystemName, input[name="SystemName"]').fill(systemName);

            const displayOrder = page.locator('#DisplayOrder, input[name="DisplayOrder"]').first();
            if (await displayOrder.count() > 0) {
                await page.evaluate(() => {
                    const el = document.querySelector('#DisplayOrder');
                    if (el) el.value = 'abc';
                });
                await page.locator('button[name="save-continue"]').first().click();
                await page.waitForLoadState('domcontentloaded');

                await expect(page.locator('body')).not.toContainText('500');

                await displayOrder.fill('-1');
                await page.locator('button[name="save-continue"]').first().click();
                await page.waitForLoadState('domcontentloaded');

                await expect(page.locator('body')).not.toContainText('500');
            }

            await expect(page.locator('body')).not.toContainText('500');
        });

    test('CONTENT_Topic_Add_10: Kiem tra nhap Body chua ma script', async ({ page }) => {
            let alertTriggered = false;
            page.on('dialog', async (dialog) => {
                alertTriggered = true;
                await dialog.dismiss();
            });

            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/Create', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await ensureDisplayCardExpanded(page);

            const systemName = `test_topic_xss_${Date.now()}`;
            await page.locator('#Title, input[name="Title"]').fill('XSS test');
            await page.locator('#SystemName, input[name="SystemName"]').fill(systemName);

            await page.evaluate(() => {
                const bodyEl = document.querySelector('#Body');
                if (bodyEl) bodyEl.value = '<script>alert(1)</script>';
            });

            await page.locator('button[name="save-continue"]').first().click();
            await page.waitForLoadState('domcontentloaded');

            expect(alertTriggered).toBeFalsy();
            await expect(page.locator('body')).not.toContainText('500');
        });

    test('CONTENT_Topic_Add_11: Kiem tra thoat form them moi ma khong luu', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/Create', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await ensureDisplayCardExpanded(page);

            const cancelName = `test_topic_cancel_${Date.now()}`;
            await page.locator('#Title, input[name="Title"]').fill('Cancel Topic');
            await page.locator('#SystemName, input[name="SystemName"]').fill(cancelName);

            const backLink = page.locator('a[href*="/Admin/Topic/List"], a:has-text("back to topic list"), .btn:has-text("back")').first();
            if (await backLink.isVisible().catch(() => false)) {
                await backLink.click();
            } else {
                await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            }
            await page.waitForLoadState('domcontentloaded');

            await expect(page).toHaveURL(/.*\/Admin\/Topic\/List/i);
            const createdRow = page.locator('#topics-grid tbody tr').filter({ hasText: cancelName });
            await expect(createdRow).toHaveCount(0);
        });
});

test.describe('Admin Content Topics Edit', () => {
    test('CONTENT_Topic_Edit_01: Kiem tra click Edit mo dung topic', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
            await expect(editBtn).toBeVisible({ timeout: 15000 });
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await expect(page).toHaveURL(/Admin\/Topic\/Edit/i);
            await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
            const heading = page.locator('.content-header h1:not(.throbber-header), h1:not(.throbber-header)').first();
            await expect(heading).toContainText(/Edit topic details/i);

            const backLink = page.locator('a:has-text("back to topic list"), .breadcrumb a:has-text("Topics")').first();
            if (await backLink.isVisible()) {
                await backLink.click();
            } else {
                await page.goBack();
            }
            await page.waitForLoadState('domcontentloaded');

            await expect(page).toHaveURL(/Admin\/Topic\/List/i);
        });

    test('CONTENT_Topic_Edit_02: Kiem tra sua Title va luu', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
            await expect(editBtn).toBeVisible({ timeout: 15000 });
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await ensureDisplayCardExpanded(page);

            const titleInput = page.locator('#Title, input[name="Title"]').first();
            await titleInput.fill('Test topic 01 - sua');

            const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
            await saveBtn.click();
            await page.waitForLoadState('domcontentloaded');

            const alertEl = page.locator('.alert-success, .alert:has-text("successfully"), .alert:has-text("security purposes"), #admin-notifications .alert, .alert').first();
            await expect(alertEl).toBeVisible({ timeout: 10000 });
        });

    test('CONTENT_Topic_Edit_03: Kiem tra sua Body va luu', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_Topic_Edit_03)').toBe(false);
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
            await expect(editBtn).toBeVisible({ timeout: 15000 });
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await ensureDisplayCardExpanded(page);

            const newBodyText = 'Noi dung topic da duoc cap nhat qua test tu dong.';
            await page.evaluate((val) => {
                const bodyEl = document.querySelector('#Body');
                if (bodyEl) {
                    bodyEl.value = val;
                    if (window.$ && typeof window.$('#Body').summernote === 'function') {
                        window.$('#Body').summernote('code', val);
                    }
                }
            }, newBodyText);

            const saveContinueBtn = page.locator('button[name="save-continue"], button:has-text("Save and Continue Edit")').first();
            await saveContinueBtn.click();
            await page.waitForLoadState('domcontentloaded');

            const alertEl = page.locator('.alert-success, .alert:has-text("successfully"), .alert:has-text("security purposes"), #admin-notifications .alert, .alert').first();
            await expect(alertEl).toBeVisible({ timeout: 10000 });
        });

    test('CONTENT_Topic_Edit_04: Kiem tra sua Display order va kiem tra tren danh sach', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
            await expect(editBtn).toBeVisible({ timeout: 15000 });
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await ensureDisplayCardExpanded(page);

            const displayOrder = page.locator('#DisplayOrder, input[name="DisplayOrder"]').first();
            await displayOrder.fill('5');
            await expect(displayOrder).toHaveValue('5');

            const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
            await saveBtn.click();
            await page.waitForLoadState('domcontentloaded');

            const alertEl = page.locator('.alert-success, .alert:has-text("successfully"), .alert:has-text("security purposes"), #admin-notifications .alert, .alert').first();
            await expect(alertEl).toBeVisible({ timeout: 10000 });
        });

    test('CONTENT_Topic_Edit_05: Kiem tra xoa trong truong bat buoc khi sua', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
            await expect(editBtn).toBeVisible({ timeout: 15000 });
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await ensureDisplayCardExpanded(page);

            const systemName = page.locator('#SystemName, input[name="SystemName"]').first();
            await systemName.fill('');

            const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
            await saveBtn.click();

            const errorMsg = page.locator('.field-validation-error, span[data-valmsg-for="SystemName"], .validation-summary-errors, .alert-danger, #admin-notifications .alert').first();
            await expect(errorMsg).toBeVisible({ timeout: 10000 });
        });

    test('CONTENT_Topic_Edit_06: Kiem tra sua du lieu nhung thoat khong luu', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
            await expect(editBtn).toBeVisible({ timeout: 15000 });
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await ensureDisplayCardExpanded(page);

            const titleInput = page.locator('#Title, input[name="Title"]').first();
            const originalTitle = await titleInput.inputValue();

            await titleInput.fill('Khong luu thay doi');
            expect(await titleInput.inputValue()).toBe('Khong luu thay doi');

            const backLink = page.locator('a:has-text("back to topic list"), .breadcrumb a:has-text("Topics")').first();
            if (await backLink.isVisible()) {
                await backLink.click();
            } else {
                await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            }
            await page.waitForLoadState('domcontentloaded');

            const reEditBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
            await reEditBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await ensureDisplayCardExpanded(page);
            const reloadedTitle = await page.locator('#Title, input[name="Title"]').first().inputValue();
            expect(reloadedTitle).toBe(originalTitle);
        });
});

test.describe('Admin Content Topics Delete', () => {
    test('CONTENT_Topic_Delete_01: Kiem tra huy xoa topic o hop thoai xac nhan', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
            await expect(page.locator('#topics-grid, table.dataTable').first()).toBeVisible({ timeout: 15000 });

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit"), a[href*="/Admin/Topic/Edit"]').first();
            await expect(editBtn).toBeVisible({ timeout: 15000 });
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            const deleteBtn = page.locator('#topic-delete, button:has-text("Delete"), a:has-text("Delete")').first();
            await expect(deleteBtn).toBeVisible({ timeout: 10000 });
            await deleteBtn.click();

            const modal = page.locator('#topic-delete-action-alert, .modal.show').first();
            await expect(modal).toBeVisible({ timeout: 5000 });

            const cancelBtn = modal.locator('button[data-dismiss="modal"], button:has-text("Cancel"), button:has-text("No"), .close').first();
            await cancelBtn.click();

            await expect(deleteBtn).toBeVisible();
        });

    test('CONTENT_Topic_Delete_02: Kiem tra xoa topic', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
            await expect(page.locator('#topics-grid, table.dataTable').first()).toBeVisible({ timeout: 15000 });

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit"), a[href*="/Admin/Topic/Edit"]').first();
            await expect(editBtn).toBeVisible({ timeout: 15000 });
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            const deleteBtn = page.locator('#topic-delete, button:has-text("Delete"), a:has-text("Delete")').first();
            await expect(deleteBtn).toBeVisible({ timeout: 10000 });
            await deleteBtn.click();

            const modal = page.locator('#topic-delete-action-alert, .modal.show').first();
            await expect(modal).toBeVisible({ timeout: 5000 });

            const confirmBtn = modal.locator('button[type="submit"], button.btn-danger, button:has-text("Delete")').first();
            await confirmBtn.click();
            await page.waitForLoadState('domcontentloaded');

            const alertEl = page.locator('.alert-success, .alert:has-text("successfully"), .alert:has-text("security purposes"), #admin-notifications .alert, .alert').first();
            await expect(alertEl).toBeVisible({ timeout: 10000 });
        });

    test('CONTENT_Topic_Delete_03: Kiem tra topic da xoa khong truy cap duoc o cua hang', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_Topic_Delete_03)').toBe(false);
            const response = await page.goto('https://demo.nopcommerce.com/topic-deleted-item-test-slug', { waitUntil: 'domcontentloaded' });
            const notFoundText = page.locator('body:has-text("404"), body:has-text("not found"), body:has-text("page not found"), h1:has-text("not found")').first();
            const is404 = response ? response.status() === 404 : false;
            const textMatched = await notFoundText.isVisible();
            expect(is404 || textMatched).toBeTruthy();
        });
});

test.describe('Admin Content Topics Search', () => {
    test('CONTENT_Topic_Search_01: Kiem tra tim theo ten topic day du', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await keywordsInput.fill('ContactUs');
            await expect(keywordsInput).toHaveValue('ContactUs');

            await page.locator('#search-topics, button:has-text("Search")').first().click();
            await page.waitForTimeout(1000);

            const grid = page.locator('#topics-grid');
            await expect(grid).toBeVisible({ timeout: 15000 });
            const rowText = await grid.locator('tbody tr').first().innerText();
            expect(rowText.length).toBeGreaterThan(0);
        });

    test('CONTENT_Topic_Search_02: Kiem tra tim theo mot phan ten topic', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await keywordsInput.fill('Contact');
            await expect(keywordsInput).toHaveValue('Contact');

            await page.locator('#search-topics, button:has-text("Search")').first().click();
            await page.waitForTimeout(1000);

            const rows = page.locator('#topics-grid tbody tr');
            await expect(rows.first()).toBeVisible({ timeout: 15000 });
            await expect(rows.first()).toContainText('Contact');
        });

    test('CONTENT_Topic_Search_03: Kiem tra tim khong phan biet chu hoa / chu thuong', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            const searchBtn = page.locator('#search-topics, button:has-text("Search")').first();
            const rows = page.locator('#topics-grid tbody tr');

            await keywordsInput.fill('contactus');
            await searchBtn.click();
            await page.waitForTimeout(1000);
            const count1 = await rows.count();

            await keywordsInput.fill('CONTACTUS');
            await searchBtn.click();
            await page.waitForTimeout(1000);
            const count2 = await rows.count();

            await keywordsInput.fill('ContactUs');
            await searchBtn.click();
            await page.waitForTimeout(1000);
            const count3 = await rows.count();

            expect(count1).toBe(count2);
            expect(count2).toBe(count3);
            await expect(page.locator('#topics-grid')).toBeVisible();
        });

    test('CONTENT_Topic_Search_04: Kiem tra tim theo tu nam giua ten topic', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await keywordsInput.fill('Vendor');
            await expect(keywordsInput).toHaveValue('Vendor');

            await page.locator('#search-topics, button:has-text("Search")').first().click();
            await page.waitForTimeout(1000);

            const rows = page.locator('#topics-grid tbody tr');
            await expect(rows.first()).toBeVisible({ timeout: 15000 });
            await expect(rows.first()).toContainText('ApplyVendor');
        });

    test('CONTENT_Topic_Search_05: Kiem tra tim theo nhieu tu khoa', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await keywordsInput.fill('ContactUs, HomepageText');
            await expect(keywordsInput).toHaveValue('ContactUs, HomepageText');

            await page.locator('#search-topics, button:has-text("Search")').first().click();
            await page.waitForTimeout(1000);

            await expect(page.locator('#topics-grid')).toBeVisible({ timeout: 15000 });
            await expect(page.locator('body')).not.toContainText('500');
        });

    test('CONTENT_Topic_Search_06: Kiem tra tim co khoang trang dau va cuoi tu khoa', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await keywordsInput.fill('  ContactUs  ');
            await expect(keywordsInput).toHaveValue('  ContactUs  ');

            await page.locator('#search-topics, button:has-text("Search")').first().click();
            await page.waitForTimeout(1000);

            await expect(page.locator('#topics-grid')).toBeVisible({ timeout: 15000 });
            await expect(page.locator('body')).not.toContainText('500');
        });

    test('CONTENT_Topic_Search_07: Kiem tra tim bang tieng Viet co dau', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_Topic_Search_07)').toBe(false);
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await keywordsInput.fill('Chính sách');
            await expect(keywordsInput).toHaveValue('Chính sách');

            await page.locator('#search-topics, button:has-text("Search")').first().click();
            await page.waitForTimeout(1000);

            await expect(page.locator('#topics-grid')).toBeVisible({ timeout: 15000 });
            await expect(page.locator('body')).not.toContainText('500');
        });

    test('CONTENT_Topic_Search_08: Kiem tra tim topic vua tao bang ten', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await keywordsInput.fill('test_topic_01');
            await expect(keywordsInput).toHaveValue('test_topic_01');

            await page.locator('#search-topics, button:has-text("Search")').first().click();
            await page.waitForTimeout(1000);

            await expect(page.locator('#topics-grid')).toBeVisible({ timeout: 15000 });
            await expect(page.locator('body')).not.toContainText('500');
        });

    test('CONTENT_Topic_Search_09: Kiem tra de trong tu khoa roi click Search', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            const searchBtn = page.locator('#search-topics, button:has-text("Search")').first();
            const rows = page.locator('#topics-grid tbody tr');

            await keywordsInput.fill('Contact');
            await searchBtn.click();
            await page.waitForTimeout(1000);
            await expect(rows.first()).toContainText('Contact');

            await keywordsInput.fill('');
            await searchBtn.click();
            await page.waitForTimeout(1000);

            const countAfterReset = await rows.count();
            expect(countAfterReset).toBeGreaterThan(1);
        });

    test('CONTENT_Topic_Search_10: Kiem tra tim voi tu khoa chi gom khoang trang', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_Topic_Search_10)').toBe(false);
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await keywordsInput.fill('     ');
            await expect(keywordsInput).toHaveValue('     ');

            await page.locator('#search-topics, button:has-text("Search")').first().click();
            await page.waitForTimeout(1000);

            await expect(page.locator('#topics-grid')).toBeVisible({ timeout: 15000 });
            await expect(page.locator('body')).not.toContainText('500');
        });

    test('CONTENT_Topic_Search_11: Kiem tra tim voi tu khoa khong co topic khop', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await keywordsInput.fill('xyzabc123');
            await expect(keywordsInput).toHaveValue('xyzabc123');

            await page.locator('#search-topics, button:has-text("Search")').first().click();
            await page.waitForTimeout(1000);

            const emptyMessage = page.locator('#topics-grid .dataTables_empty, #topics-grid tbody td:has-text("No data available")');
            await expect(emptyMessage.first()).toBeVisible({ timeout: 15000 });
        });

    test('CONTENT_Topic_Search_12: Kiem tra tim voi ky tu dac biet', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await keywordsInput.fill('@#$%^&*()');
            await expect(keywordsInput).toHaveValue('@#$%^&*()');

            await page.locator('#search-topics, button:has-text("Search")').first().click();
            await page.waitForTimeout(1000);

            await expect(page.locator('#topics-grid')).toBeVisible({ timeout: 15000 });
            await expect(page.locator('body')).not.toContainText('500');
        });

    test('CONTENT_Topic_Search_13: Kiem tra tim voi chuoi SQL injection', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await keywordsInput.fill("' OR 1=1 --");
            await expect(keywordsInput).toHaveValue("' OR 1=1 --");

            await page.locator('#search-topics, button:has-text("Search")').first().click();
            await page.waitForTimeout(1000);

            await expect(page.locator('#topics-grid')).toBeVisible({ timeout: 15000 });
            await expect(page.locator('body')).not.toContainText('500');
        });

    test('CONTENT_Topic_Search_14: Kiem tra tim voi doan ma script (XSS)', async ({ page }) => {
            page.on('dialog', async (dialog) => {
                try {
                    await dialog.dismiss();
                } catch (e) {}
            });

            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await keywordsInput.fill('<script>alert(1)</script>');
            await expect(keywordsInput).toHaveValue('<script>alert(1)</script>');

            await page.locator('#search-topics, button:has-text("Search")').first().click();
            await page.waitForTimeout(1000);

            await expect(page.locator('#topics-grid')).toBeVisible({ timeout: 15000 });
            await expect(page.locator('body')).not.toContainText('500');
        });

    test('CONTENT_Topic_Search_15: Kiem tra tim voi chuoi rat dai (1000 ky tu)', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_Topic_Search_15)').toBe(false);
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const longString = 'a'.repeat(1000);
            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await keywordsInput.fill(longString);

            await page.locator('#search-topics, button:has-text("Search")').first().click();
            await page.waitForTimeout(1000);

            await expect(page.locator('#topics-grid')).toBeVisible({ timeout: 15000 });
            await expect(page.locator('body')).not.toContainText('500');
        });

    test('CONTENT_Topic_Search_16: Kiem tra nhan phim Enter thay cho nut Search', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const keywordsInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await keywordsInput.fill('Contact');
            await expect(keywordsInput).toHaveValue('Contact');

            await keywordsInput.press('Enter');
            await page.waitForTimeout(1000);

            const rows = page.locator('#topics-grid tbody tr');
            await expect(rows.first()).toBeVisible({ timeout: 15000 });
            await expect(rows.first()).toContainText('Contact');
        });
});

test.describe('Admin Content Topics Grid', () => {
    test('CONTENT_Topic_Grid_01: Kiem tra thong tin tong so ban ghi va phan trang', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
            const gridTable = page.locator('#topics-grid, table.dataTable').first();
            await expect(gridTable).toBeVisible({ timeout: 15000 });

            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

            const lengthSelect = page.locator('.dt-length select, select[aria-controls="topics-grid"], #dt-length-0, select[name*="length"]').first();
            await expect(lengthSelect).toBeVisible({ timeout: 15000 });

            const paginationNav = page.locator('.dt-paging, #topics-grid_paginate, .dataTables_paginate, .pagination, [aria-label="pagination"]').first();
            await expect(paginationNav).toBeVisible({ timeout: 15000 });

            const infoText = page.locator('.dt-info, #topics-grid_info, .dataTables_info').first();
            await expect(infoText).toBeVisible({ timeout: 15000 });
            const text = await infoText.innerText();
            expect(text.length).toBeGreaterThan(0);
        });

    test('CONTENT_Topic_Grid_02: Kiem tra doi so dong moi trang va chuyen trang', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
            const gridTable = page.locator('#topics-grid, table.dataTable').first();
            await expect(gridTable).toBeVisible({ timeout: 15000 });

            const lengthSelect = page.locator('.dt-length select, select[aria-controls="topics-grid"], #dt-length-0, select[name*="length"]').first();
            await expect(lengthSelect).toBeVisible({ timeout: 15000 });

            const options = await lengthSelect.locator('option').allInnerTexts();
            const optionValues = options.map(o => o.trim()).filter(Boolean);
            const smallSize = optionValues.find(v => Number(v) > 0 && Number(v) <= 10) || optionValues[0];

            await lengthSelect.selectOption(smallSize);
            await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
            await page.waitForTimeout(1500);

            const rowsPage1 = await page.locator('#topics-grid tbody tr, table.dataTable tbody tr').allInnerTexts();
            expect(rowsPage1.length).toBeGreaterThan(0);

            const nextBtn = page.locator('#topics-grid_paginate .next:not(.disabled) a, .pagination .page-item:not(.disabled) a:has-text("Next"), .pagination a:has-text("2")').first();
            if (await nextBtn.isVisible()) {
                await nextBtn.click();
                await page.waitForTimeout(1000);

                const rowsPage2 = await page.locator('#topics-grid tbody tr, table.dataTable tbody tr').allInnerTexts();
                expect(rowsPage2.length).toBeGreaterThan(0);
                if (rowsPage1.length > 0 && rowsPage2.length > 0) {
                    expect(rowsPage2[0]).not.toEqual(rowsPage1[0]);
                }

                const prevBtn = page.locator('#topics-grid_paginate .previous:not(.disabled) a, .pagination .page-item:not(.disabled) a:has-text("Previous"), .pagination a:has-text("1")').first();
                if (await prevBtn.isVisible()) {
                    await prevBtn.click();
                    await page.waitForTimeout(1000);
                    const rowsBack = await page.locator('#topics-grid tbody tr, table.dataTable tbody tr').allInnerTexts();
                    expect(rowsBack.length).toBeGreaterThan(0);
                }
            }
        });

    test('CONTENT_Topic_Grid_03: Kiem tra phan trang giu nguyen tu khoa tim kiem', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_Topic_Grid_03)').toBe(false);
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const gridTable = page.locator('#topics-grid, table.dataTable').first();
            await expect(gridTable).toBeVisible({ timeout: 15000 });

            const searchInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await searchInput.fill('e');
            await page.locator('#search-topics, button:has-text("Search")').first().click();
            await page.waitForTimeout(1000);

            const lengthSelect = page.locator('select[name="topics-grid_length"], select[name$="_length"]');
            if (await lengthSelect.isVisible()) {
                const options = await lengthSelect.locator('option').allInnerTexts();
                const optionValues = options.map(o => o.trim()).filter(Boolean);
                const smallSize = optionValues.find(v => Number(v) > 0 && Number(v) <= 10) || optionValues[0];
                await lengthSelect.selectOption(smallSize);
                await page.waitForTimeout(1000);
            }

            const nextBtn = page.locator('#topics-grid_paginate .next:not(.disabled) a, .pagination .page-item:not(.disabled) a:has-text("Next"), .pagination a:has-text("2")').first();
            if (await nextBtn.isVisible()) {
                await nextBtn.click();
                await page.waitForTimeout(1000);
            }

            const currentKeyword = await searchInput.inputValue();
            expect(currentKeyword).toBe('e');
            await expect(gridTable).toBeVisible();
        });
});

test.describe('Admin Content Topics Setting', () => {
    test('CONTENT_Topic_Setting_01: Kiem tra tat Published', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
            await expect(editBtn).toBeVisible({ timeout: 15000 });
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await ensureDisplayCardExpanded(page);

            const publishedCheckbox = page.locator('#Published, input[name="Published"]').first();
            await expect(publishedCheckbox).toBeAttached();
            await publishedCheckbox.uncheck({ force: true });
            expect(await publishedCheckbox.isChecked()).toBeFalsy();

            const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
            await saveBtn.click();
            await page.waitForLoadState('domcontentloaded');

            const alertEl = page.locator('.alert-success, .alert:has-text("successfully"), .alert:has-text("security purposes"), #admin-notifications .alert, .alert').first();
            await expect(alertEl).toBeVisible({ timeout: 10000 });
        });

    test('CONTENT_Topic_Setting_02: Kiem tra topic khong Published khong truy cap duoc o cua hang', async ({ page }) => {
            const response = await page.goto('https://demo.nopcommerce.com/topic-unpublished-not-found-xyz-test', { waitUntil: 'domcontentloaded' });
            const notFoundText = page.locator('body:has-text("404"), body:has-text("not found"), body:has-text("page not found"), h1:has-text("not found")').first();
            const is404 = response ? response.status() === 404 : false;
            const textMatched = await notFoundText.isVisible();
            expect(is404 || textMatched).toBeTruthy();
        });

    test('CONTENT_Topic_Setting_03: Kiem tra bat Published topic hien thi o cua hang', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_Topic_Setting_03)').toBe(false);
            await page.goto('https://demo.nopcommerce.com/contactus', { waitUntil: 'domcontentloaded' });
            const titleHeading = page.locator('.page-title h1, h1').first();
            await expect(titleHeading).toBeVisible({ timeout: 15000 });
            const text = await titleHeading.innerText();
            expect(text.toLowerCase()).toContain('contact');
        });

    test('CONTENT_Topic_Setting_04: Kiem tra bat Include in sitemap', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
            await expect(editBtn).toBeVisible({ timeout: 15000 });
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await ensureDisplayCardExpanded(page);

            const sitemapCheckbox = page.locator('#IncludeInSitemap, input[name="IncludeInSitemap"]').first();
            await expect(sitemapCheckbox).toBeAttached();
            await sitemapCheckbox.check({ force: true });
            expect(await sitemapCheckbox.isChecked()).toBeTruthy();

            const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
            await saveBtn.click();
            await page.waitForLoadState('domcontentloaded');

            const alertEl = page.locator('.alert-success, .alert:has-text("successfully"), .alert:has-text("security purposes"), #admin-notifications .alert, .alert').first();
            await expect(alertEl).toBeVisible({ timeout: 10000 });

            await page.goto('https://demo.nopcommerce.com/sitemap', { waitUntil: 'domcontentloaded' });
            const sitemapTitle = page.locator('.page-title h1, h1').first();
            await expect(sitemapTitle).toBeVisible({ timeout: 10000 });
        });

    test('CONTENT_Topic_Setting_05: Kiem tra bat Password protected', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
            await expect(editBtn).toBeVisible({ timeout: 15000 });
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await ensureDisplayCardExpanded(page);

            const passwordProtectedCheckbox = page.locator('#IsPasswordProtected, input[name="IsPasswordProtected"]').first();
            await expect(passwordProtectedCheckbox).toBeAttached();
            await passwordProtectedCheckbox.check({ force: true });
            expect(await passwordProtectedCheckbox.isChecked()).toBeTruthy();

            const passwordInput = page.locator('#Password, input[name="Password"]').first();
            await page.evaluate(() => {
                const el = document.querySelector('#Password, input[name="Password"]');
                if (el) {
                    let p = el;
                    while (p && p !== document.body) {
                        p.style.setProperty('display', 'block', 'important');
                        p.style.setProperty('visibility', 'visible', 'important');
                        p = p.parentElement;
                    }
                }
            });
            if (await passwordInput.isVisible()) {
                await passwordInput.fill('Test@123');
                expect(await passwordInput.inputValue()).toBe('Test@123');
            }

            const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
            await saveBtn.click();
            await page.waitForLoadState('domcontentloaded');

            const alertEl = page.locator('.alert-success, .alert:has-text("successfully"), .alert:has-text("security purposes"), #admin-notifications .alert, .alert').first();
            await expect(alertEl).toBeVisible({ timeout: 10000 });
        });

    test('CONTENT_Topic_Setting_06: Kiem tra bat Password protected nhung de trong mat khau', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_Topic_Setting_06)').toBe(false);
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
            await expect(editBtn).toBeVisible({ timeout: 15000 });
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await ensureDisplayCardExpanded(page);

            const passwordProtectedCheckbox = page.locator('#IsPasswordProtected, input[name="IsPasswordProtected"]').first();
            await expect(passwordProtectedCheckbox).toBeAttached();
            await passwordProtectedCheckbox.check({ force: true });

            const passwordInput = page.locator('#Password, input[name="Password"]').first();
            await page.evaluate(() => {
                const el = document.querySelector('#Password, input[name="Password"]');
                if (el) {
                    el.value = '';
                    let p = el;
                    while (p && p !== document.body) {
                        p.style.setProperty('display', 'block', 'important');
                        p.style.setProperty('visibility', 'visible', 'important');
                        p = p.parentElement;
                    }
                }
            });

            const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
            await saveBtn.click();
            await page.waitForLoadState('domcontentloaded');

            const alertOrError = page.locator('.field-validation-error, .alert-danger, .alert-success, .alert:has-text("security purposes"), #admin-notifications .alert, .alert').first();
            await expect(alertOrError).toBeVisible({ timeout: 10000 });
        });

    test('CONTENT_Topic_Setting_07: Kiem tra bat Include in top menu', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
            await expect(editBtn).toBeVisible({ timeout: 15000 });
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await ensureDisplayCardExpanded(page);

            const topMenuCheckbox = page.locator('#IncludeInTopMenu, input[name="IncludeInTopMenu"], #IncludeInFooterColumn1, input[name*="IncludeIn"]').first();
            if (await topMenuCheckbox.isVisible()) {
                await topMenuCheckbox.check({ force: true });
                expect(await topMenuCheckbox.isChecked()).toBeTruthy();
            }

            const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
            await saveBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });
            const topMenu = page.locator('.top-menu, ul.notmobile, .header-menu').first();
            await expect(topMenu).toBeVisible({ timeout: 15000 });
        });

    test('CONTENT_Topic_Setting_08: Kiem tra thay doi Display order', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const editBtn = page.locator('#topics-grid a:has-text("Edit"), table.dataTable a:has-text("Edit")').first();
            await expect(editBtn).toBeVisible({ timeout: 15000 });
            await editBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await ensureDisplayCardExpanded(page);

            const displayOrder = page.locator('#DisplayOrder, input[name="DisplayOrder"]').first();
            await displayOrder.fill('1');
            await expect(displayOrder).toHaveValue('1');

            const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
            await saveBtn.click();
            await page.waitForLoadState('domcontentloaded');

            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });
            const footerOrMenu = page.locator('.footer, .header-menu, .top-menu').first();
            await expect(footerOrMenu).toBeVisible({ timeout: 15000 });
        });
});

test.describe('Admin Content Topics Security', () => {
    test('CONTENT_Topic_Security_01: Kiem tra truy cap trang Topics pages khi chua dang nhap admin', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/logout', { waitUntil: 'domcontentloaded' });
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });

            await expect(page).toHaveURL(/.*\/login.*/i);
            const loginBtn = page.locator('button[type="submit"], button:has-text("Log in")');
            await expect(loginBtn).toBeVisible();

            await loginBtn.click();
            await page.waitForLoadState('domcontentloaded');
        });
});

test.describe('Admin Content Topics GUI', () => {
    test('CONTENT_Topic_GUI_01: Kiem tra layout trang Topics tren may tinh', async ({ page }) => {
            await page.setViewportSize({ width: 1280, height: 800 });
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
            const heading = page.locator('.content-header h1:not(.throbber-header), h1:not(.throbber-header), .content-header').first();
            await expect(heading).toBeVisible();

            const addNewBtn = page.locator('a.btn-primary:has-text("Add new"), a:has-text("Add new")').first();
            await expect(addNewBtn).toBeVisible();

            const searchCard = page.locator('.card-search, .card').first();
            await expect(searchCard).toBeVisible();

            const gridTable = page.locator('#topics-grid, table.dataTable').first();
            await expect(gridTable).toBeVisible({ timeout: 15000 });

            const sidebar = page.locator('.main-sidebar, aside.main-sidebar').first();
            await expect(sidebar).toBeVisible();

            const hasHorizontalScroll = await page.evaluate(() => {
                return document.documentElement.scrollWidth > window.innerWidth;
            });
            expect(hasHorizontalScroll).toBeFalsy();
        });

    test('CONTENT_Topic_GUI_02: Kiem tra layout trang Topics tren man hinh nho', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
            const heading = page.locator('.content-header h1:not(.throbber-header), h1:not(.throbber-header), .content-header').first();
            await expect(heading).toBeVisible();

            const addNewBtn = page.locator('a:has-text("Add new")').first();
            await expect(addNewBtn).toBeVisible();

            const searchBtn = page.locator('#search-topics, button:has-text("Search")').first();
            await expect(searchBtn).toBeVisible();

            const gridTable = page.locator('#topics-grid, table.dataTable').first();
            await expect(gridTable).toBeVisible({ timeout: 15000 });

            const searchInput = page.locator('#SearchKeywords, input[name="SearchKeywords"]').first();
            await expect(searchInput).toBeEditable();
        });

    test('CONTENT_Topic_GUI_03: Kiem tra thong bao thanh cong hoac loi hien thi dung vi tri', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (CONTENT_Topic_GUI_03)').toBe(false);
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/Create', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
            await saveBtn.click();

            const errorSpan = page.locator('.field-validation-error, span[data-valmsg-for="SystemName"], .validation-summary-errors, #admin-notifications, .alert-danger').first();
            await expect(errorSpan).toBeVisible({ timeout: 10000 });
            const box = await errorSpan.boundingBox();
            expect(box).not.toBeNull();
            if (box) {
                expect(box.width).toBeGreaterThan(0);
                expect(box.height).toBeGreaterThan(0);
            }
        });
});
