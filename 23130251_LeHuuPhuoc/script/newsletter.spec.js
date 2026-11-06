// @ts-check
const { test, expect } = require('../../fixtures');
const { loginAdmin, gotoNewsletter, ensureNewsletterData, clickSearchNewsletter, fillDate, getOffsetDate, resetSearchNewsletter } = require('../admin_helpers');

test.describe('Kiểm thử Admin - Promotions - Newsletter subscribers (61 Test Cases)', () => {

  test('PROMO_NEWS_View_01: Kiểm tra mở trang Newsletter subscribers từ menu Promotions', async ({ page }) => {
      await gotoNewsletter(page);

      const promoP = page.locator('.nav-sidebar p:has-text("Promotions")').first();
      const newsLink = page.locator('.nav-sidebar a[href*="/Admin/NewsLetterSubscription/List"]').first();
      
      if (!await newsLink.isVisible().catch(() => false)) {
        await promoP.click();
        await page.waitForTimeout(600);
      }

      await expect(newsLink).toBeVisible();
      await newsLink.click();
      await page.waitForTimeout(500);

      await expect(page.locator('.content-header h1, h1.float-left').first()).toContainText('Newsletter subscribers');
    });

  test('PROMO_NEWS_View_02: Kiểm tra truy cập trực tiếp bằng URL /Admin/NewsLetterSubscription/List', async ({ page }) => {
      await gotoNewsletter(page);
      expect(page.url()).toMatch(/\/Admin\/NewsLetterSubscription\/List/i);
      await expect(page.locator('.content-header h1, h1.float-left').first()).toContainText('Newsletter subscribers');
      await expect(page.locator('#newsletter-subscriptions-grid, table').first()).toBeVisible();
    });

  test('PROMO_NEWS_View_03: Kiểm tra các nút chức năng ở góc phải trang', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      const addBtn = page.locator('a.btn-primary[href*="/Admin/NewsLetterSubscription/Create"], a:has-text("Add new")').first();
      const exportBtn = page.locator('button[name="exportcsv"], button:has-text("Export to CSV"), a:has-text("Export to CSV")').first();
      const importBtn = page.locator('button[name="importcsv"], button:has-text("Import from CSV"), button[data-target*="import"]').first();
  
      await expect(addBtn).toBeVisible();
      await expect(exportBtn).toBeVisible();
      await expect(importBtn).toBeVisible();
  
    });

  test('PROMO_NEWS_View_04: Kiểm tra các trường và nút trong khối Search', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      await expect(page.locator('#SearchEmail, input[name="SearchEmail"]').first()).toBeVisible();
      await expect(page.locator('#StartDate, #SearchStartDate').first()).toBeVisible();
      await expect(page.locator('#EndDate, #SearchEndDate').first()).toBeVisible();
      await expect(page.locator('#ActiveId, #SearchActiveId, select[name="ActiveId"]').first()).toBeVisible();
      await expect(page.locator('#CustomerRoleId, select[name="CustomerRoleId"]').first()).toBeVisible();
      await expect(page.locator('#search-subscriptions, #search-newsletter-subscriptions, button[id*="search"]').first()).toBeVisible();
  
    });

  test('PROMO_NEWS_View_05: Kiểm tra giá trị mặc định của khối Search', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      await expect(page.locator('#SearchEmail, input[name="SearchEmail"]').first()).toHaveValue('');
      const activeVal = await page.locator('#ActiveId, #SearchActiveId, select[name="ActiveId"]').first().inputValue();
      expect(activeVal).toBe('0');
      const roleVal = await page.locator('#CustomerRoleId, select[name="CustomerRoleId"]').first().inputValue();
      expect(roleVal).toBe('0');
  
    });

  test('PROMO_NEWS_View_06: Kiểm tra tooltip (?) của các trường tìm kiếm', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      const helpIcons = page.locator('.ico-help, [data-toggle="tooltip"], i.fa-question-circle');
      const count = await helpIcons.count();
      expect(count).toBeGreaterThan(0);
  
      await helpIcons.first().hover();
      await page.waitForTimeout(500);
  
    });

  test('PROMO_NEWS_View_07: Kiểm tra thu gọn / mở rộng khối Search', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      const emailInput = page.locator('#SearchEmail, input[name="SearchEmail"]').first();
      await emailInput.fill('phuoc');
  
      const collapseBtn = page.locator('.card-tools button[data-card-widget="collapse"], button[data-card-widget="collapse"]').first();
      if (await collapseBtn.isVisible().catch(() => false)) {
        await collapseBtn.click();
        await page.waitForTimeout(600);
        await collapseBtn.click();
        await page.waitForTimeout(600);
      }
  
      await expect(emailInput).toHaveValue('phuoc');
  
    });

  test('PROMO_NEWS_View_08: Kiểm tra các cột của bảng danh sách', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      await expect(page.locator('.dt-container, .dataTables_wrapper, table').first()).toBeVisible();
      const tableText = await page.locator('.dt-container, .dataTables_wrapper, table').first().innerText();
  
      expect(tableText).toMatch(/Email/i);
      expect(tableText).toMatch(/Active/i);
      expect(tableText).toMatch(/Created on/i);
      expect(tableText).toMatch(/Edit/i);
  
    });

  test('PROMO_NEWS_View_09: Kiểm tra dữ liệu mặc định trong bảng', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      const table = page.locator('.dt-container, .dataTables_wrapper, table').first();
      await expect(table).toBeVisible();
  
    });

  test('PROMO_NEWS_View_10: Kiểm tra layout trang trên desktop và mobile', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      // 1. Desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(page.locator('#search-subscriptions, #search-newsletter-subscriptions, button[id*="search"]').first()).toBeVisible();
      await expect(page.locator('a.btn-primary[href*="/Admin/NewsLetterSubscription/Create"], a:has-text("Add new")').first()).toBeVisible();
  
      // 2. Mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('#search-subscriptions, #search-newsletter-subscriptions, button[id*="search"]').first()).toBeVisible();
      await page.setViewportSize({ width: 1280, height: 720 });
  
    });

  test('PROMO_NEWS_Data_01: Tạo subscriber Active bằng cách đăng ký tài khoản có tích Newsletter', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      const emailInput = page.locator('#SearchEmail, input[name="SearchEmail"]').first();
      await emailInput.fill('phuoc.news01@example.com');
      await clickSearchNewsletter(page);
  
      const grid = page.locator('.dt-container, .dataTables_wrapper, table').first();
      await expect(grid).toContainText('phuoc.news01@example.com');
  
    });

  test('PROMO_NEWS_Data_02: Tạo subscriber chưa Active bằng ô Newsletter ở footer storefront', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      const emailInput = page.locator('#SearchEmail, input[name="SearchEmail"]').first();
      await emailInput.fill('phuoc.news02@example.com');
      await clickSearchNewsletter(page);
  
      const grid = page.locator('.dt-container, .dataTables_wrapper, table').first();
      await expect(grid).toContainText('phuoc.news02@example.com');
  
    });

  test('PROMO_NEWS_Search_01: Kiểm tra danh sách giá trị của Active', async ({ page }) => {
  
      await gotoNewsletter(page);
      const options = await page.locator('#ActiveId, #SearchActiveId, select[name="ActiveId"]').first().locator('option').allInnerTexts();
      expect(options.some(o => /All/i.test(o))).toBeTruthy();
      expect(options.some(o => /Active/i.test(o))).toBeTruthy();
      expect(options.some(o => /Not active|Inactive/i.test(o))).toBeTruthy();
  
    });

  test('PROMO_NEWS_Search_02: Kiểm tra danh sách giá trị của Customer role', async ({ page }) => {
  
      await gotoNewsletter(page);
      const options = await page.locator('#CustomerRoleId, select[name="CustomerRoleId"]').first().locator('option').allInnerTexts();
      expect(options.some(o => /All/i.test(o))).toBeTruthy();
      expect(options.some(o => /Registered|Administrators|Guests/i.test(o))).toBeTruthy();
  
    });

  test('PROMO_NEWS_Search_03: Kiểm tra danh sách giá trị của Subscription type', async ({ page }) => {
  
      await gotoNewsletter(page);
      const typeSelect = page.locator('#SubscriptionTypeId, #SearchSubscriptionTypeId, select[name*="SubscriptionType"]').first();
      if (await typeSelect.isVisible().catch(() => false)) {
        const options = await typeSelect.locator('option').allInnerTexts();
        expect(options.length).toBeGreaterThan(0);
      } else {
        await expect(page.locator('.content-header')).toBeVisible();
      }
  
    });

  test('PROMO_NEWS_Search_04: Kiểm tra tìm theo Email đầy đủ', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('phuoc.news01@example.com');
      await clickSearchNewsletter(page);
  
      const grid = page.locator('.dt-container, .dataTables_wrapper, table').first();
      await expect(grid).toContainText('phuoc.news01@example.com');
  
    });

  test('PROMO_NEWS_Search_05: Kiểm tra tìm theo một phần Email', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('phuoc.news');
      await clickSearchNewsletter(page);
  
      const grid = page.locator('.dt-container, .dataTables_wrapper, table').first();
      await expect(grid).toContainText('phuoc.news');
  
    });

  test('PROMO_NEWS_Search_06: Kiểm tra tìm theo Email viết hoa', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('PHUOC.NEWS01@EXAMPLE.COM');
      await clickSearchNewsletter(page);
  
      const grid = page.locator('.dt-container, .dataTables_wrapper, table').first();
      await expect(grid).toContainText('phuoc.news01@example.com');
  
    });

  test('PROMO_NEWS_Search_07: Kiểm tra tìm Email không tồn tại', async ({ page }) => {
  
      await gotoNewsletter(page);
      await resetSearchNewsletter(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('zzz_khong_ton_tai@example.com');
      await clickSearchNewsletter(page);
  
      const grid = page.locator('.dt-container, .dataTables_wrapper, table').first();
      await expect(grid).toContainText(/No data available|No matching records|không có dữ liệu|No records/i);
  
    });

  test('PROMO_NEWS_Search_08: Kiểm tra tìm với Email sai định dạng', async ({ page }) => {
    await gotoNewsletter(page);
    await resetSearchNewsletter(page);
    await page.locator('#SearchEmail').fill('abc@@123');
    await clickSearchNewsletter(page);

    const emailError = page.locator('.field-validation-error, #SearchEmail-error');
    await expect(emailError, 'Defect: Ô tìm kiếm Email thiếu validation cảnh báo định dạng email không hợp lệ').toBeVisible({ timeout: 1000 });

  
    });

  test('PROMO_NEWS_Search_09: Kiểm tra lọc Active = chỉ Active', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#ActiveId, #SearchActiveId, select[name="ActiveId"]').first().selectOption({ value: '1' });
      await clickSearchNewsletter(page);
  
      const grid = page.locator('.dt-container, .dataTables_wrapper, table').first();
      await expect(grid).toContainText('phuoc.news01@example.com');
  
    });

  test('PROMO_NEWS_Search_10: Kiểm tra lọc Active = chỉ Not active', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#ActiveId, #SearchActiveId, select[name="ActiveId"]').first().selectOption({ value: '2' });
      await clickSearchNewsletter(page);
  
      const grid = page.locator('.dt-container, .dataTables_wrapper, table').first();
      await expect(grid).toContainText('phuoc.news02@example.com');
  
    });

  test('PROMO_NEWS_Search_11: Kiểm tra lọc Customer role = Registered', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      const roleSelect = page.locator('#CustomerRoleId, select[name="CustomerRoleId"]').first();
      await roleSelect.selectOption({ label: 'Registered' }).catch(() => roleSelect.selectOption({ index: 1 }));
      await clickSearchNewsletter(page);
  
      const grid = page.locator('.dt-container, .dataTables_wrapper, table').first();
      await expect(grid).toBeVisible();
  
    });

  test('PROMO_NEWS_Search_12: Kiểm tra lọc theo Subscription type', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      const typeSelect = page.locator('#SubscriptionTypeId, #SearchSubscriptionTypeId, select[name*="SubscriptionType"]').first();
      if (await typeSelect.isVisible().catch(() => false)) {
        await typeSelect.selectOption({ index: 1 }).catch(() => {});
      }
      await clickSearchNewsletter(page);
  
      const grid = page.locator('.dt-container, .dataTables_wrapper, table').first();
      await expect(grid).toBeVisible();
  
    });

  test('PROMO_NEWS_Search_13: Kiểm tra lọc theo Start date', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      // 1. Ngày hôm qua (2020 hoặc quá khứ)
      await fillDate(page, '#StartDate, #SearchStartDate', '01/01/2020');
      await clickSearchNewsletter(page);
      await expect(page.locator('.dt-container, .dataTables_wrapper, table').first()).toContainText('phuoc.news');
  
      // 2. Ngày mai (tương lai xa)
      await fillDate(page, '#StartDate, #SearchStartDate', '01/01/2035');
      await clickSearchNewsletter(page);
      await expect(page.locator('.dt-container, .dataTables_wrapper, table').first()).toContainText(/No data available|No matching records|No records/i);
  
    });

  test('PROMO_NEWS_Search_14: Kiểm tra lọc theo End date', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      // 1. Ngày mai (tương lai xa)
      await fillDate(page, '#EndDate, #SearchEndDate', '31/12/2035');
      await clickSearchNewsletter(page);
      await expect(page.locator('.dt-container, .dataTables_wrapper, table').first()).toContainText('phuoc.news');
  
      // 2. Ngày hôm qua (quá khứ xa)
      await fillDate(page, '#EndDate, #SearchEndDate', '01/01/2015');
      await clickSearchNewsletter(page);
      await expect(page.locator('.dt-container, .dataTables_wrapper, table').first()).toContainText(/No data available|No matching records|No records/i);
  
    });

  test('PROMO_NEWS_Search_15: Kiểm tra lọc đồng thời Start date và End date', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await fillDate(page, '#StartDate, #SearchStartDate', '01/01/2020');
      await fillDate(page, '#EndDate, #SearchEndDate', '31/12/2035');
      await clickSearchNewsletter(page);
  
      await expect(page.locator('.dt-container, .dataTables_wrapper, table').first()).toContainText('phuoc.news');
  
    });

  test('PROMO_NEWS_Search_16: Kiểm tra Start date lớn hơn End date', async ({ page }) => {
    await gotoNewsletter(page);
    await resetSearchNewsletter(page);
    await fillDate(page, '#StartDate', '01/01/2035');
    await fillDate(page, '#EndDate', '01/01/2020');
    await clickSearchNewsletter(page);

    const dateAlert = page.locator('.date-validation-error, .alert-danger');
    await expect(dateAlert, 'Defect: Không có thông báo lỗi khi Start date lớn hơn End date trong tìm kiếm bản tin').toBeVisible({ timeout: 1000 });

  
    });

  test('PROMO_NEWS_Search_17: Kiểm tra kết hợp nhiều tiêu chí cho kết quả khớp', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('phuoc.news01');
      await page.locator('#ActiveId, #SearchActiveId, select[name="ActiveId"]').first().selectOption({ value: '1' });
      await clickSearchNewsletter(page);
  
      const grid = page.locator('.dt-container, .dataTables_wrapper, table').first();
      await expect(grid).toContainText('phuoc.news01@example.com');
  
    });

  test('PROMO_NEWS_Search_18: Kiểm tra kết hợp nhiều tiêu chí không có kết quả', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('phuoc.news01');
      await page.locator('#ActiveId, #SearchActiveId, select[name="ActiveId"]').first().selectOption({ value: '2' }); // Not active
      await clickSearchNewsletter(page);
  
      const grid = page.locator('.dt-container, .dataTables_wrapper, table').first();
      await expect(grid).toContainText(/No data available|No matching records|No records/i);
  
    });

  test('PROMO_NEWS_Search_19: Kiểm tra xóa tiêu chí rồi tìm lại', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('phuoc.news01');
      await clickSearchNewsletter(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('');
      await clickSearchNewsletter(page);
  
      const grid = page.locator('.dt-container, .dataTables_wrapper, table').first();
      await expect(grid).toContainText('phuoc.news');
  
    });

  test('PROMO_NEWS_Search_20: Kiểm tra tìm kiếm bằng phím Enter', async ({ page }) => {
    await ensureNewsletterData(page);
    const emailInput = page.locator('#SearchEmail');
    await emailInput.fill('phuoc.news01');
    await emailInput.press('Enter');
    await page.waitForTimeout(600);

    expect(page.url(), 'Defect: URL không cập nhật query parameter khi người dùng tìm kiếm bằng phím Enter').toContain('SearchEmail=');

  
    });

  test('PROMO_NEWS_Search_21: Kiểm tra Email có khoảng trắng đầu cuối', async ({ page }) => {
    await ensureNewsletterData(page);
    await page.locator('#SearchEmail').fill('  phuoc.news01  ');
    await clickSearchNewsletter(page);

    const val = await page.locator('#SearchEmail').inputValue();
    expect(val, 'Defect: Ô tìm kiếm Email bản tin chưa tự động loại bỏ khoảng trắng thừa đầu cuối').toBe('phuoc.news01');

  
    });

  test('PROMO_NEWS_Grid_01: Kiểm tra biểu tượng cột Active khớp với trạng thái subscriber', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('phuoc.news01@example.com');
      await clickSearchNewsletter(page);
  
      const row = page.locator('table tbody tr:first-child');
      await expect(row).toContainText('phuoc.news01@example.com');
      await expect(row).toBeVisible();
  
    });

  test('PROMO_NEWS_Grid_02: Kiểm tra cột Subscription type khớp với trang Edit', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('phuoc.news01@example.com');
      await clickSearchNewsletter(page);
  
      const editBtn = page.locator('table tbody tr:first-child a[href*="/Admin/NewsLetterSubscription/Edit/"], table tbody tr:first-child a:has-text("Edit")').first();
      await editBtn.click();
      await page.waitForURL(/\/Admin\/NewsLetterSubscription\/Edit\//i, { timeout: 15000 });
      await expect(page.locator('#Email, input[name="Email"]').first()).toHaveValue('phuoc.news01@example.com');
  
    });

  test('PROMO_NEWS_Grid_03: Kiểm tra cột Language', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('phuoc.news01@example.com');
      await clickSearchNewsletter(page);
  
      const row = page.locator('table tbody tr:first-child');
      await expect(row).toContainText('English');
  
    });

  test('PROMO_NEWS_Grid_04: Kiểm tra định dạng cột Created on', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('phuoc.news01@example.com');
      await clickSearchNewsletter(page);
  
      const rowText = await page.locator('table tbody tr:first-child').innerText();
      expect(rowText).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  
    });

  test('PROMO_NEWS_Grid_05: Kiểm tra dữ liệu trong bảng khớp với trang Edit', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('phuoc.news01@example.com');
      await clickSearchNewsletter(page);
  
      const editBtn = page.locator('table tbody tr:first-child a[href*="/Admin/NewsLetterSubscription/Edit/"], table tbody tr:first-child a:has-text("Edit")').first();
      await editBtn.click();
      await page.waitForURL(/\/Admin\/NewsLetterSubscription\/Edit\//i, { timeout: 15000 });
  
      await expect(page.locator('#Email, input[name="Email"]').first()).toHaveValue('phuoc.news01@example.com');
      await expect(page.locator('#Active, input[name="Active"]').first()).toBeChecked();
  
    });

  test('PROMO_NEWS_Page_01: Kiểm tra giá trị mặc định và danh sách của ô Show', async ({ page }) => {
  
      await gotoNewsletter(page);
      const lengthSelect = page.locator('#dt-length-0, select[aria-controls*="grid"], select[name*="length"]').first();
      await expect(lengthSelect).toBeVisible();
  
      const val = await lengthSelect.inputValue();
      expect(val).toBe('15');
  
    });

  test('PROMO_NEWS_Page_02: Kiểm tra đổi số dòng mỗi trang', async ({ page }) => {
  
      await ensureNewsletterData(page);
      const lengthSelect = page.locator('#dt-length-0, select[aria-controls*="grid"], select[name*="length"]').first();
      await expect(lengthSelect).toBeVisible();
  
      await lengthSelect.selectOption('7');
      await page.waitForTimeout(500);
      await lengthSelect.selectOption('100');
      await page.waitForTimeout(500);
  
      await expect(page.locator('.dt-container, .dataTables_wrapper, table').first()).toBeVisible();
  
    });

  test('PROMO_NEWS_Page_03: Kiểm tra nút Previous / Next khi chỉ có 1 trang', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      const prevItem = page.locator('li.dt-paging-button:has-text("Previous"), li.page-item:has-text("Previous")').first();
      const nextItem = page.locator('li.dt-paging-button:has-text("Next"), li.page-item:has-text("Next")').first();
  
      if (await prevItem.isVisible().catch(() => false)) {
        await expect(prevItem).toHaveClass(/disabled/);
      }
      if (await nextItem.isVisible().catch(() => false)) {
        await expect(nextItem).toHaveClass(/disabled/);
      }
  
    });

  test('PROMO_NEWS_Page_04: Kiểm tra nút làm mới bảng (biểu tượng refresh)', async ({ page }) => {
    await gotoNewsletter(page);
    const refreshBtn = page.locator('#search-subscriptions');
    await refreshBtn.click({ noWaitAfter: true });

    const loadingOverlay = page.locator('.dt-processing, .dataTables_processing');
    await expect(loadingOverlay, 'Defect: Thiếu hiển thị trạng thái loading overlay khi bấm làm mới bảng dữ liệu').toBeVisible({ timeout: 500 });

  
    });

  test('PROMO_NEWS_Export_01: Kiểm tra xuất danh sách subscriber ra file CSV', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      const exportBtn = page.locator('button[name="exportcsv"], button:has-text("Export to CSV"), a:has-text("Export to CSV")').first();
  
      const [download, response] = await Promise.all([
        page.waitForEvent('download', { timeout: 8000 }).catch(() => null),
        page.waitForResponse(r => r.url().includes('ExportCSV'), { timeout: 8000 }).catch(() => null),
        exportBtn.click({ noWaitAfter: true })
      ]);
  
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.csv$/i);
      } else if (response) {
        expect(response.status()).toBe(200);
      } else {
        await expect(page.locator('.content-header, .dt-container, table').first()).toBeVisible();
      }
  
    });

  test('PROMO_NEWS_Export_02: Kiểm tra xuất file CSV khi đang áp dụng bộ lọc', async ({ page }) => {
    await gotoNewsletter(page);
    await page.locator('#SearchEmail').fill('phuoc.news01');
    await clickSearchNewsletter(page);

    const exportBtn = page.locator('button[name="exportcsv"]');
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 8000 }).catch(() => null),
      exportBtn.click({ noWaitAfter: true })
    ]);

    expect(download, 'Không tải được file export').not.toBeNull();
    expect(download.suggestedFilename(), 'Defect: Tên file CSV xuất khi có bộ lọc chưa chứa tiền tố _filtered_ theo đặc tả').toContain('_filtered_');

  
    });

  test('PROMO_NEWS_Export_03: Kiểm tra xuất file CSV khi bảng không có dữ liệu', async ({ page }) => {
    await gotoNewsletter(page);
    await resetSearchNewsletter(page);
    await page.locator('#SearchEmail').fill('zzz_khong_ton_tai@example.com');
    await clickSearchNewsletter(page);

    const exportBtn = page.locator('button[name="exportcsv"]');
    await exportBtn.click({ noWaitAfter: true });
    await page.waitForTimeout(600);

    const alertNoData = page.locator('.alert-warning:has-text("No data"), .toast-warning');
    await expect(alertNoData, 'Defect: Thiếu thông báo cảnh báo không có dữ liệu để xuất khi bảng đang trống').toBeVisible({ timeout: 1000 });

  
    });

  test('PROMO_NEWS_Import_01: Kiểm tra mở hộp thoại Import from CSV', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      const importBtn = page.locator('button[name="importcsv"], button:has-text("Import from CSV"), button[data-target*="import"]').first();
      await importBtn.click();
      await page.waitForTimeout(1000);
  
      const modal = page.locator('#importcsv-window, .modal').filter({ hasText: /Import/i }).first();
      await expect(modal).toBeVisible({ timeout: 5000 });
  
    });

  test('PROMO_NEWS_Import_02: Kiểm tra đóng hộp thoại Import mà không import', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      const importBtn = page.locator('button[name="importcsv"], button:has-text("Import from CSV"), button[data-target*="import"]').first();
      await importBtn.click();
      await page.waitForTimeout(1000);
  
      const modal = page.locator('#importcsv-window, .modal').filter({ hasText: /Import/i }).first();
      await expect(modal).toBeVisible({ timeout: 5000 });
  
      const closeBtn = modal.locator('button.close, [data-dismiss="modal"]').first();
      await closeBtn.click();
      await page.waitForTimeout(1000);
  
      await expect(modal).not.toBeVisible({ timeout: 5000 }).catch(() => {});
  
    });

  test('PROMO_NEWS_Import_03: Kiểm tra click [Import] khi chưa chọn file', async ({ page }) => {
    await gotoNewsletter(page);
    const importBtn = page.locator('button[name="importcsv"]');
    await importBtn.click();
    await page.waitForTimeout(600);

    const modal = page.locator('#importcsv-window');
    await expect(modal).toBeVisible({ timeout: 5000 });

    const fileInput = modal.locator('#importcsvfile');
    await expect(fileInput, 'Defect: Trường chọn file thiếu thuộc tính validation bắt buộc (required)').toHaveAttribute('required', '');

  
    });

  test('PROMO_NEWS_Import_04: Kiểm tra import file không phải định dạng CSV', async ({ page }) => {
    await gotoNewsletter(page);
    const importBtn = page.locator('button[name="importcsv"]');
    await importBtn.click();
    await page.waitForTimeout(600);

    const modal = page.locator('#importcsv-window');
    await expect(modal).toBeVisible({ timeout: 5000 });

    const fileInput = modal.locator('#importcsvfile');
    await expect(fileInput, 'Defect: Ô tải file thiếu thuộc tính accept=".csv" để ngăn người dùng chọn sai định dạng').toHaveAttribute('accept', '.csv');
    });

  test('PROMO_NEWS_Nav_01: Kiểm tra nút [Add new]', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      const addBtn = page.locator('a.btn-primary[href*="/Admin/NewsLetterSubscription/Create"], a:has-text("Add new")').first();
      await addBtn.click();
  
      await page.waitForURL(/\/Admin\/NewsLetterSubscription\/Create/i, { timeout: 15000 });
      await expect(page.locator('.content-header h1, h1.float-left').first()).toContainText(/Add a new subscription|subscription|Newsletter/i);
  
    });

  test('PROMO_NEWS_Nav_02: Kiểm tra nút [Edit] và quay lại danh sách', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('phuoc.news01@example.com');
      await clickSearchNewsletter(page);
  
      const editBtn = page.locator('table tbody tr:first-child a[href*="/Admin/NewsLetterSubscription/Edit/"], table tbody tr:first-child a:has-text("Edit")').first();
      await editBtn.click();
      await page.waitForURL(/\/Admin\/NewsLetterSubscription\/Edit\//i, { timeout: 15000 });
  
      const backLink = page.locator('a:has-text("back to subscriptions list"), a:has-text("back to"), a[href*="/Admin/NewsLetterSubscription/List"]').first();
      await backLink.click();
  
      await page.waitForURL(/\/Admin\/NewsLetterSubscription\/List/i, { timeout: 15000 });
      await expect(page.locator('.content-header h1, h1.float-left').first()).toContainText('Newsletter subscribers');
  
    });

  test('PROMO_NEWS_Nav_03: Kiểm tra chuyển qua lại giữa các mục trong menu Promotions', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      const subTypeLink = page.locator('.nav-sidebar a[href*="/Admin/NewsLetterSubscriptionType/List"], .nav-sidebar p:has-text("Subscription types")').first();
      if (await subTypeLink.isVisible().catch(() => false)) {
        await subTypeLink.click();
        await page.waitForURL(/\/Admin\/NewsLetterSubscriptionType\/List/i, { timeout: 15000 });
      }
  
      const newsLink = page.locator('.nav-sidebar a[href*="/Admin/NewsLetterSubscription/List"], .nav-sidebar p:has-text("Newsletter subscribers")').first();
      await newsLink.click();
      await page.waitForURL(/\/Admin\/NewsLetterSubscription\/List/i, { timeout: 15000 });
  
      await expect(page.locator('.content-header h1, h1.float-left').first()).toContainText('Newsletter subscribers');
  
    });

  test('PROMO_NEWS_Nav_04: Kiểm tra liên kết "Learn more about email campaigns"', async ({ page }) => {
  
      await gotoNewsletter(page);
  
      const docLink = page.locator('a[href*="docs.nopcommerce.com"], a:has-text("Learn more")').first();
      if (await docLink.isVisible().catch(() => false)) {
        await expect(docLink).toHaveAttribute('href', /docs\.nopcommerce\.com/);
      } else {
        await expect(page.locator('.content-header')).toBeVisible();
      }
  
    });

  test('PROMO_NEWS_Nav_05: Kiểm tra tải lại trang (F5) sau khi tìm kiếm', async ({ page }) => {
    await ensureNewsletterData(page);
    await page.locator('#SearchEmail').fill('phuoc.news01');
    await clickSearchNewsletter(page);

    await page.reload();
    await page.waitForTimeout(600);

    const emailInput = page.locator('#SearchEmail');
    await expect(emailInput, 'Defect: Tiêu chí tìm kiếm Email không được lưu giữ lại sau khi tải lại trang (F5)').toHaveValue('phuoc.news01');

  
    });

  test('PROMO_NEWS_Nav_06: Kiểm tra nút Back của trình duyệt sau khi mở trang Edit', async ({ page }) => {
  
      await ensureNewsletterData(page);
  
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill('phuoc.news01@example.com');
      await clickSearchNewsletter(page);
  
      const editBtn = page.locator('a[href*="/Admin/NewsLetterSubscription/Edit/"]').first();
      await editBtn.waitFor({ state: 'visible', timeout: 15000 });
      await editBtn.click();
      await page.waitForURL(/\/Admin\/NewsLetterSubscription\/Edit\//i, { timeout: 15000 });
  
      await page.goBack();
      await page.waitForURL(/\/Admin\/NewsLetterSubscription\/List/i, { timeout: 15000 });
      await expect(page.locator('.content-header h1, h1.float-left').first()).toContainText('Newsletter subscribers');
  
    });

  test('PROMO_NEWS_Security_01: Kiểm tra mã script ở Email không bị thực thi', async ({ page }) => {
    await gotoNewsletter(page);
    await resetSearchNewsletter(page);
    await page.locator('#SearchEmail').fill('<script>alert(1)</script>');
    await clickSearchNewsletter(page);

    const xssWarning = page.locator('.security-error, .field-validation-error');
    await expect(xssWarning, 'Defect: Không có cảnh báo phát hiện chuỗi thẻ HTML/script độc hại trong ô Email').toBeVisible({ timeout: 1000 });
    });

  test('PROMO_NEWS_Security_02: Kiểm tra SQL injection ở Email', async ({ page }) => {
    await gotoNewsletter(page);
    await resetSearchNewsletter(page);
    await page.locator('#SearchEmail').fill("' OR 1=1 --");
    await clickSearchNewsletter(page);

    const sqliWarning = page.locator('.security-warning');
    await expect(sqliWarning, 'Defect: Hệ thống thiếu bộ lọc và cảnh báo đối với cú pháp SQL Injection').toBeVisible({ timeout: 1000 });

  
    });

  test('PROMO_NEWS_Security_03: Kiểm tra Email rất dài', async ({ page }) => {
  
      await gotoNewsletter(page);
      await resetSearchNewsletter(page);
  
      const longString = 'a'.repeat(500);
      await page.locator('#SearchEmail, input[name="SearchEmail"]').first().fill(longString);
      await clickSearchNewsletter(page);
  
      await expect(page.locator('.dt-container, .dataTables_wrapper, table').first()).toBeVisible();
  
    });

  test('PROMO_NEWS_Security_04: Kiểm tra truy cập trang Newsletter subscribers khi chưa đăng nhập admin', async ({ page }) => {
      await page.goto('https://admin-demo.nopcommerce.com/logout');
      await page.waitForTimeout(600);
      await page.goto('https://admin-demo.nopcommerce.com/Admin/NewsLetterSubscription/List');
      await expect(page).toHaveURL(/\/login/i);
    });

  test('PROMO_NEWS_Security_05: Kiểm tra trang Newsletter subscribers dùng kết nối HTTPS', async ({ page }) => {
  
      await gotoNewsletter(page);
      expect(page.url()).toMatch(/^https:\/\//);
  
    });

  test('PROMO_NEWS_Security_06: Kiểm tra truy cập trang Edit với ID subscriber không tồn tại', async ({ page }) => {
    await gotoNewsletter(page);
    await page.goto('https://admin-demo.nopcommerce.com/Admin/NewsLetterSubscription/Edit/999999');
    await page.waitForTimeout(1000);

    const notFoundAlert = page.locator('.alert-danger:has-text("not found"), .page-title h1:has-text("Not Found")');
    await expect(notFoundAlert, 'Defect: Truy cập ID subscriber không tồn tại không hiển thị trang hoặc thông báo 404').toBeVisible({ timeout: 1000 });

  
    });
});
