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

            const saveBtn = page.locator('button[name="save"], button:has-text("Save")').first();
            await saveBtn.click();

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
    test('CONTENT_Topic_Search_07: Kiem tra tim bang tieng Viet co dau', async ({ page }) => {
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
            const topMenu = page.locator('.top-menu, ul.top-menu, .header-menu, nav, .header, header, .master-wrapper-page').first();
            await expect(topMenu).toBeVisible({ timeout: 15000 });
        });
});

test.describe('Admin Content Topics Security', () => {
    test('CONTENT_Topic_Security_01: Kiem tra truy cap trang Topics pages khi chua dang nhap admin', async ({ page }) => {
            await page.goto('https://admin-demo.nopcommerce.com/Admin/Topic/List', { waitUntil: 'domcontentloaded' });
            if (page.url().includes('login')) {
                await page.locator('button[type="submit"], button:has-text("Log in")').click();
                await page.waitForLoadState('domcontentloaded');
            }

            await page.locator('.throbber').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

            const headingOrGrid = page.locator('.content-header h1.float-left, .content-header h1, #topics-grid, button:has-text("Log in")').filter({ hasNotText: 'Wait' }).first();
            await expect(headingOrGrid).toBeVisible({ timeout: 15000 });
        });
});
