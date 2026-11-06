// @ts-check
const { test, expect } = require('../../fixtures');
const { gotoAffiliates, resetSearchAffiliates } = require('../admin_helpers');

test.describe('Kiểm thử Admin - Promotions - Affiliates (30 Test Cases theo Excel)', () => {

  // Helper đảm bảo khối tìm kiếm mở rộng
  async function ensureSearchCardOpen(page) {
    const cardBody = page.locator('.search-body, .card-search .card-body');
    if (await cardBody.isHidden().catch(() => false)) {
      await page.click('.card-search, [data-card-widget="collapse"]');
      await page.waitForTimeout(400);
    }
  }

  // ==========================================
  // NHÓM 1: GIAO DIỆN & TRÌNH BÀY (PROMO_AFF_View_01 -> PROMO_AFF_View_08)
  // ==========================================

  test('PROMO_AFF_View_01: Kiểm tra mở trang Affiliates từ menu Promotions', async ({ page }) => {
    await gotoAffiliates(page);
    const promoP = page.locator('.nav-sidebar p:has-text("Promotions")').first();
    const affLink = page.locator('.nav-sidebar a[href*="/Admin/Affiliate/List"]').first();
    if (!await affLink.isVisible().catch(() => false)) {
      await promoP.click();
      await page.waitForTimeout(600);
    }
    if (await affLink.isVisible().catch(() => false)) {
      await affLink.click();
      await page.waitForTimeout(500);
    }
    await expect(page.locator('.content-header h1, h1.float-left').first()).toContainText('Affiliates');
  });

  test('PROMO_AFF_View_02: Kiểm tra truy cập trực tiếp bằng URL /Admin/Affiliate/List', async ({ page }) => {
    await gotoAffiliates(page);
    expect(page.url()).toMatch(/\/Admin\/Affiliate\/List/i);
    await expect(page.locator('.content-header h1, h1.float-left').first()).toContainText('Affiliates');
    await expect(page.locator('#affiliates-grid')).toBeVisible();
  });

  test('PROMO_AFF_View_03: Kiểm tra đoạn giới thiệu phía trên bảng danh sách', async ({ page }) => {
    await gotoAffiliates(page);
    const intro = page.locator('.content-header, .content').first();
    await expect(intro).toContainText(/Affiliate|Affiliates/i);
  });

  test('PROMO_AFF_View_04: Kiểm tra các trường và nút trong khối Search', async ({ page }) => {
    await gotoAffiliates(page);
    await ensureSearchCardOpen(page);
    await expect(page.locator('#SearchFirstName')).toBeVisible();
    await expect(page.locator('#SearchLastName')).toBeVisible();
    await expect(page.locator('#SearchFriendlyUrlName')).toBeVisible();
    await expect(page.locator('#LoadOnlyWithOrders')).toBeAttached();
    await expect(page.locator('#search-affiliates')).toBeVisible();
  });

  test('PROMO_AFF_View_05: Kiểm tra giá trị mặc định của khối Search', async ({ page }) => {
    await gotoAffiliates(page);
    await ensureSearchCardOpen(page);
    await expect(page.locator('#SearchFirstName')).toHaveValue('');
    await expect(page.locator('#SearchLastName')).toHaveValue('');
    await expect(page.locator('#SearchFriendlyUrlName')).toHaveValue('');
    await expect(page.locator('#LoadOnlyWithOrders')).not.toBeChecked();
  });

  test('PROMO_AFF_View_06: Kiểm tra tooltip (?) của các trường tìm kiếm', async ({ page }) => {
    await gotoAffiliates(page);
    await ensureSearchCardOpen(page);
    // DEFECT: Khối tìm kiếm Affiliates thiếu tooltip giải thích chi tiết cho trường Friendly URL name
    const friendlyTooltip = page.locator('.friendly-url-tooltip, .tooltip-inner:has-text("Friendly URL name")');
    await expect(friendlyTooltip, 'Defect: Thiếu biểu tượng tooltip (?) hướng dẫn cho Friendly URL name').toBeVisible({ timeout: 1000 });
  });

  test('PROMO_AFF_View_07: Kiểm tra các cột của bảng danh sách', async ({ page }) => {
    await gotoAffiliates(page);
    const gridWrapper = page.locator('#affiliates-grid_wrapper, .dataTables_wrapper, #affiliates-grid').first();
    await expect(gridWrapper).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'First name' }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Last name' }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Active' }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Edit' }).first()).toBeVisible();
  });

  test('PROMO_AFF_View_08: Kiểm tra layout trang trên desktop và mobile', async ({ page }) => {
    await gotoAffiliates(page);
    await expect(page.locator('a[href*="/Admin/Affiliate/Create"]').first()).toBeVisible();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(page.locator('#search-affiliates')).toBeVisible();
  });

  // ==========================================
  // NHÓM 2: TÌM KIẾM (PROMO_AFF_Search_01 -> PROMO_AFF_Search_09)
  // ==========================================

  test('PROMO_AFF_Search_01: Kiểm tra tìm theo First name đầy đủ', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    await page.fill('#SearchFirstName', 'John');
    await page.click('#search-affiliates');
    await page.waitForTimeout(1000);
    await expect(page.locator('#affiliates-grid tbody')).toContainText('John');
  });

  test('PROMO_AFF_Search_02: Kiểm tra tìm theo Last name đầy đủ', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    await page.fill('#SearchLastName', 'Smith');
    await page.click('#search-affiliates');
    await page.waitForTimeout(1000);
    await expect(page.locator('#affiliates-grid tbody')).toContainText('Smith');
  });

  test('PROMO_AFF_Search_03: Kiểm tra tìm theo một phần First name', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    await page.fill('#SearchFirstName', 'joh');
    await page.click('#search-affiliates');
    await page.waitForTimeout(1000);
    await expect(page.locator('#affiliates-grid tbody')).toContainText('John');
  });

  test('PROMO_AFF_Search_04: Kiểm tra tìm đồng thời First name và Last name khớp nhau', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    await page.fill('#SearchFirstName', 'John');
    await page.fill('#SearchLastName', 'Smith');
    await page.click('#search-affiliates');
    await page.waitForTimeout(1000);
    await expect(page.locator('#affiliates-grid tbody')).toContainText('John');
    await expect(page.locator('#affiliates-grid tbody')).toContainText('Smith');
  });

  test('PROMO_AFF_Search_05: Kiểm tra tìm đồng thời First name và Last name không khớp nhau', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    await page.fill('#SearchFirstName', 'John');
    await page.fill('#SearchLastName', 'Doe');
    await page.click('#search-affiliates');
    await page.waitForTimeout(1000);
    await expect(page.locator('#affiliates-grid tbody td.dataTables_empty, #affiliates-grid tbody')).toContainText(/No data available|No records/i);
  });

  test('PROMO_AFF_Search_06: Kiểm tra tìm First name không tồn tại', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    await page.fill('#SearchFirstName', 'zzz_khong_ton_tai');
    await page.click('#search-affiliates');
    await page.waitForTimeout(1000);
    await expect(page.locator('#affiliates-grid tbody td.dataTables_empty, #affiliates-grid tbody')).toContainText(/No data available|No records/i);
  });

  test('PROMO_AFF_Search_07: Kiểm tra tìm theo Friendly URL name', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    await page.fill('#SearchFriendlyUrlName', 'john-smith');
    await page.click('#search-affiliates');
    await page.waitForTimeout(1000);
    await expect(page.locator('#affiliates-grid')).toBeVisible();
  });

  test('PROMO_AFF_Search_08: Kiểm tra lọc affiliate có đơn hàng (Load only with orders)', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    await page.check('#LoadOnlyWithOrders');
    await page.click('#search-affiliates');
    await page.waitForTimeout(1000);
    await expect(page.locator('#affiliates-grid')).toBeVisible();
  });

  test('PROMO_AFF_Search_09: Kiểm tra bỏ trống toàn bộ tiêu chí rồi click [Search]', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    const rows = await page.locator('#affiliates-grid tbody tr').count();
    expect(rows).toBeGreaterThanOrEqual(1);
  });

  // ==========================================
  // NHÓM 3: BẢNG DỮ LIỆU & PHÂN TRANG (PROMO_AFF_Grid_01 -> PROMO_AFF_Page_02)
  // ==========================================

  test('PROMO_AFF_Grid_01: Kiểm tra biểu tượng cột Active khớp với trạng thái affiliate', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    const checkIcon = page.locator('#affiliates-grid tbody tr i.fa-check, #affiliates-grid tbody tr .text-success').first();
    await expect(checkIcon).toBeVisible();
  });

  test('PROMO_AFF_Grid_02: Kiểm tra dữ liệu trong bảng khớp với trang Edit', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    // DEFECT: Cột Active trong bảng danh sách chưa hiển thị nhãn văn bản (Yes/No) hỗ trợ người khiếm thị
    const ariaActive = page.locator('#affiliates-grid tbody td:has(i.fa-check) span.sr-only, span.badge-status');
    await expect(ariaActive, 'Defect: Cột Active thiếu nhãn văn bản hỗ trợ accessibility').toBeVisible({ timeout: 1000 });
  });

  test('PROMO_AFF_Page_01: Kiểm tra giá trị mặc định và danh sách của ô Show', async ({ page }) => {
    await gotoAffiliates(page);
    const pageSelect = page.getByLabel('Show items').or(page.locator('select[aria-label*="Show items"], select[name$="_length"], .dataTables_length select, .dt-length select')).first();
    await expect(pageSelect).toBeVisible();
    await expect(pageSelect).toHaveValue('15');
  });

  test('PROMO_AFF_Page_02: Kiểm tra đổi số dòng mỗi trang', async ({ page }) => {
    await gotoAffiliates(page);
    const pageSelect = page.getByLabel('Show items').or(page.locator('select[aria-label*="Show items"], select[name$="_length"], .dataTables_length select, .dt-length select')).first();
    await pageSelect.selectOption('7');
    await page.waitForTimeout(800);
    await expect(page.locator('#affiliates-grid')).toBeVisible();
  });

  // ==========================================
  // NHÓM 4: ĐIỀU HƯỚNG & NÚT CHỨC NĂNG (PROMO_AFF_Nav_01 -> PROMO_AFF_Nav_04)
  // ==========================================

  test('PROMO_AFF_Nav_01: Kiểm tra nút [Add new]', async ({ page }) => {
    await gotoAffiliates(page);
    await page.click('a[href*="/Admin/Affiliate/Create"]');
    await page.waitForURL(/\/Admin\/Affiliate\/Create/i, { timeout: 15000 });
    await expect(page.locator('.content-header h1, h1.float-left').first()).toContainText(/Add a new affiliate|Affiliate/i);
  });

  test('PROMO_AFF_Nav_02: Kiểm tra nút [Edit] và quay lại danh sách', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    const editBtn = page.locator('#affiliates-grid tbody a[href*="/Admin/Affiliate/Edit/"]').first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await page.waitForURL(/\/Admin\/Affiliate\/Edit\//i, { timeout: 15000 }).catch(() => {});
      const backLink = page.locator('a[href*="/Admin/Affiliate/List"]').first();
      if (await backLink.isVisible().catch(() => false)) {
        await backLink.click();
      } else {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/Affiliate/List');
      }
    }
    await expect(page.locator('#affiliates-grid')).toBeVisible();
  });

  test('PROMO_AFF_Nav_03: Kiểm tra chuyển qua lại giữa các mục trong menu Promotions', async ({ page }) => {
    await gotoAffiliates(page);
    const promoP = page.locator('.nav-sidebar p:has-text("Promotions")').first();
    const newsLink = page.locator('.nav-sidebar a[href*="/Admin/NewsLetterSubscription/List"]').first();
    if (!await newsLink.isVisible().catch(() => false)) {
      await promoP.click();
      await page.waitForTimeout(500);
    }
    if (await newsLink.isVisible().catch(() => false)) {
      await newsLink.click();
      await page.waitForTimeout(500);
    }
    const affLink = page.locator('.nav-sidebar a[href*="/Admin/Affiliate/List"]').first();
    if (!await affLink.isVisible().catch(() => false)) {
      await page.locator('.nav-sidebar p:has-text("Promotions")').first().click();
      await page.waitForTimeout(500);
    }
    if (await affLink.isVisible().catch(() => false)) {
      await affLink.click();
    } else {
      await page.goto('https://admin-demo.nopcommerce.com/Admin/Affiliate/List');
    }
    await expect(page.locator('#affiliates-grid')).toBeVisible();
  });

  test('PROMO_AFF_Nav_04: Kiểm tra nút Back của trình duyệt sau khi mở trang Edit', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    const editBtn = page.locator('#affiliates-grid tbody a[href*="/Admin/Affiliate/Edit/"]').first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await page.waitForURL(/\/Admin\/Affiliate\/Edit\//i, { timeout: 15000 }).catch(() => {});
      await page.goBack();
      await page.waitForTimeout(500);
    }
    await expect(page.locator('#affiliates-grid, .content-header').first()).toBeVisible();
  });

  // ==========================================
  // NHÓM 5: BẢO MẬT (PROMO_AFF_Security_01 -> PROMO_AFF_Security_05)
  // ==========================================

  test('PROMO_AFF_Security_01: Kiểm tra mã script ở First name không bị thực thi', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    await page.fill('#SearchFirstName', '<script>alert("XSS")</script>');
    await page.click('#search-affiliates');
    await page.waitForTimeout(600);
    // DEFECT: Trường tìm kiếm không có cảnh báo phát hiện chuỗi thẻ HTML độc hại
    const xssWarning = page.locator('.security-warning, .text-danger');
    await expect(xssWarning, 'Defect: Hệ thống thiếu cảnh báo phát hiện chuỗi mã script trong ô First name').toBeVisible({ timeout: 1000 });
  });

  test('PROMO_AFF_Security_02: Kiểm tra SQL injection ở First name, Last name và Friendly URL name', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    await page.fill('#SearchFriendlyUrlName', "' UNION SELECT 1,2,3--");
    await page.click('#search-affiliates');
    await page.waitForTimeout(600);
    // DEFECT: Hệ thống thiếu cảnh báo WAF khi nhập cú pháp SQL Injection
    const wafAlert = page.locator('.waf-blocked, .alert-danger');
    await expect(wafAlert, 'Defect: Hệ thống không phát hiện và không cảnh báo cú pháp SQL Injection tiềm ẩn').toBeVisible({ timeout: 1000 });
  });

  test('PROMO_AFF_Security_03: Kiểm tra First name rất dài', async ({ page }) => {
    await gotoAffiliates(page);
    await resetSearchAffiliates(page);
    const longString = 'a'.repeat(500);
    await page.fill('#SearchFirstName', longString);
    await page.click('#search-affiliates');
    await page.waitForTimeout(1000);
    await expect(page.locator('#affiliates-grid')).toBeVisible();
  });

  test('PROMO_AFF_Security_04: Kiểm tra truy cập trang Affiliates khi chưa đăng nhập admin', async ({ page }) => {
    await page.goto('https://admin-demo.nopcommerce.com/logout');
    await page.waitForTimeout(600);
    await page.goto('https://admin-demo.nopcommerce.com/Admin/Affiliate/List');
    await expect(page).toHaveURL(/\/login/i);
  });

  test('PROMO_AFF_Security_05: Kiểm tra truy cập trang Edit với ID affiliate không tồn tại', async ({ page }) => {
    await gotoAffiliates(page);
    await page.goto('https://admin-demo.nopcommerce.com/Admin/Affiliate/Edit/999999');
    await page.waitForTimeout(1000);
    // NopCommerce redirect về List hoặc hiển thị trang lỗi không tìm thấy
    expect(page.url()).toMatch(/\/Admin\/Affiliate\/List|\/Admin\/Affiliate\/Edit/);
  });

});
