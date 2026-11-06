// @ts-check
const { test, expect } = require('../../fixtures');
const { loginAdmin, gotoDiscounts, fillDate, resetSearch } = require('../admin_helpers');

test.describe('Kiểm thử Admin - Promotions - Discounts (30 Test Cases theo Excel)', () => {

  // ==========================================
  // NHÓM 1: GIAO DIỆN & TRÌNH BÀY (PROMO_DIS_View_01 -> PROMO_DIS_View_06)
  // ==========================================

  test('PROMO_DIS_View_01: Kiểm tra mở trang Discounts từ menu Promotions', async ({ page }) => {
    await gotoDiscounts(page);
    const promoP = page.locator('.nav-sidebar p:has-text("Promotions")').first();
    const discountLink = page.locator('.nav-sidebar a[href*="/Admin/Discount/List"]').first();
    if (!await discountLink.isVisible().catch(() => false)) {
      await promoP.click();
      await page.waitForTimeout(600);
    }
    await expect(discountLink).toBeVisible();
    await discountLink.click();
    await page.waitForTimeout(500);
    await expect(page.locator('.content-header h1, h1.float-left').first()).toContainText('Discounts');
  });

  test('PROMO_DIS_View_02: Kiểm tra truy cập trực tiếp bằng URL /Admin/Discount/List', async ({ page }) => {
    await gotoDiscounts(page);
    expect(page.url()).toMatch(/\/Admin\/Discount\/List/i);
    await expect(page.locator('.content-header h1, h1.float-left').first()).toContainText('Discounts');
    await expect(page.locator('#discounts-grid')).toBeVisible();
  });

  test('PROMO_DIS_View_03: Kiểm tra các trường và nút trong khối Search', async ({ page }) => {
    await gotoDiscounts(page);
    await expect(page.locator('#SearchStartDate')).toBeVisible();
    await expect(page.locator('#SearchEndDate')).toBeVisible();
    await expect(page.locator('#SearchDiscountTypeId')).toBeVisible();
    await expect(page.locator('#SearchVendorId')).toBeVisible();
    await expect(page.locator('#SearchDiscountCouponCode, #SearchCouponCode').first()).toBeVisible();
    await expect(page.locator('#SearchDiscountName')).toBeVisible();
    await expect(page.locator('#IsActiveId, #SearchIsActiveId').first()).toBeVisible();
    await expect(page.locator('#search-discounts')).toBeVisible();
  });

  test('PROMO_DIS_View_04: Kiểm tra giá trị mặc định của khối Search', async ({ page }) => {
    await gotoDiscounts(page);
    await expect(page.locator('#SearchDiscountName')).toHaveValue('');
    await expect(page.locator('#SearchDiscountCouponCode, #SearchCouponCode').first()).toHaveValue('');
    expect(await page.locator('#SearchDiscountTypeId').inputValue()).toBe('0');
    expect(await page.locator('#IsActiveId, #SearchIsActiveId').first().inputValue()).toBe('0');
  });

  test('PROMO_DIS_View_05: Kiểm tra các cột của bảng danh sách', async ({ page }) => {
    await gotoDiscounts(page);
    const gridWrapper = page.locator('#discounts-grid_wrapper, .dataTables_wrapper, #discounts-grid').first();
    await expect(gridWrapper).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Discount type' }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Discount' }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Start date' }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'End date' }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Times used' }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Is active' }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Edit' }).first()).toBeVisible();
  });

  test('PROMO_DIS_View_06: Kiểm tra layout trang trên desktop và mobile', async ({ page }) => {
    await gotoDiscounts(page);
    await expect(page.locator('a[href*="/Admin/Discount/Create"]').first()).toBeVisible();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(page.locator('#search-discounts')).toBeVisible();
  });

  // ==========================================
  // NHÓM 2: TÌM KIẾM (PROMO_DIS_Search_01 -> PROMO_DIS_Search_11)
  // ==========================================

  test('PROMO_DIS_Search_01: Kiểm tra tìm theo Discount name đầy đủ', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.fill('#SearchDiscountName', "'20% order total' discount");
    await page.click('#search-discounts');
    await page.waitForTimeout(1000);
    await expect(page.locator('#discounts-grid tbody')).toContainText("'20% order total' discount");
  });

  test('PROMO_DIS_Search_02: Kiểm tra tìm theo một phần Discount name', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.fill('#SearchDiscountName', 'sample');
    await page.click('#search-discounts');
    await page.waitForTimeout(1000);
    await expect(page.locator('#discounts-grid tbody')).toContainText('Sample discount with coupon code');
  });

  test('PROMO_DIS_Search_03: Kiểm tra tìm Discount name không tồn tại', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.fill('#SearchDiscountName', 'zzz_khong_ton_tai');
    await page.click('#search-discounts');
    await page.waitForTimeout(1000);
    await expect(page.locator('#discounts-grid tbody td.dataTables_empty, #discounts-grid tbody')).toContainText(/No data available|No records/i);
  });

  test('PROMO_DIS_Search_04: Kiểm tra tìm theo Coupon code', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.fill('#SearchDiscountCouponCode, #SearchCouponCode', '20order');
    await page.click('#search-discounts');
    await page.waitForTimeout(1000);
    await expect(page.locator('#discounts-grid tbody tr')).toBeVisible();
  });

  test('PROMO_DIS_Search_05: Kiểm tra tìm Coupon code không tồn tại', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.fill('#SearchDiscountCouponCode, #SearchCouponCode', 'NOTEXIST999');
    await page.click('#search-discounts');
    await page.waitForTimeout(1000);
    // DEFECT: Hệ thống thiếu gợi ý xóa bộ lọc khi không tìm thấy Coupon code
    const resetHint = page.locator('.reset-hint, .alert-info');
    await expect(resetHint, 'Defect: Thiếu gợi ý reset bộ lọc khi Coupon code không tồn tại').toBeVisible({ timeout: 1000 });
  });

  test('PROMO_DIS_Search_06: Kiểm tra lọc Discount type = Assigned to order total', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.selectOption('#SearchDiscountTypeId', { label: 'Assigned to order total' });
    await page.click('#search-discounts');
    await page.waitForTimeout(1000);
    await expect(page.locator('#discounts-grid tbody')).toContainText('Assigned to order total');
  });

  test('PROMO_DIS_Search_07: Kiểm tra lọc Discount type = Assigned to products', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.selectOption('#SearchDiscountTypeId', { label: 'Assigned to products' });
    await page.click('#search-discounts');
    await page.waitForTimeout(1000);
    await expect(page.locator('#discounts-grid tbody')).toContainText('Assigned to products');
  });

  test('PROMO_DIS_Search_08: Kiểm tra lọc Is active = Inactive only', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.selectOption('#IsActiveId, #SearchIsActiveId', { label: 'Inactive only' });
    await page.click('#search-discounts');
    await page.waitForTimeout(1000);
    await expect(page.locator('#discounts-grid')).toBeVisible();
  });

  test('PROMO_DIS_Search_09: Kiểm tra lọc đồng thời Start date và End date', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await fillDate(page, '#SearchStartDate', '01/01/2019');
    await fillDate(page, '#SearchEndDate', '31/12/2035');
    await page.click('#search-discounts');
    await page.waitForTimeout(1000);
    // DEFECT: Date picker cho phép chọn ngày không có kiểm tra định dạng nhập tay
    const dateVal = await page.locator('#SearchStartDate').inputValue();
    expect(dateVal, 'Defect: Định dạng ngày tháng không tự động chuẩn hóa sang định dạng chuẩn ISO').toBe('2019-01-01');
  });

  test('PROMO_DIS_Search_10: Kiểm tra kết hợp nhiều tiêu chí cho kết quả khớp', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.fill('#SearchDiscountName', 'discount');
    await page.selectOption('#SearchDiscountTypeId', { label: 'Assigned to order total' });
    await page.selectOption('#IsActiveId, #SearchIsActiveId', { label: 'Active only' });
    await page.click('#search-discounts');
    await page.waitForTimeout(1000);
    await expect(page.locator('#discounts-grid tbody')).toContainText("'20% order total' discount");
  });

  test('PROMO_DIS_Search_11: Kiểm tra xóa tiêu chí rồi tìm lại', async ({ page }) => {
    await gotoDiscounts(page);
    await page.fill('#SearchDiscountName', 'sample');
    await page.click('#search-discounts');
    await page.waitForTimeout(800);
    await page.fill('#SearchDiscountName', '');
    await page.click('#search-discounts');
    await page.waitForTimeout(1000);
    const count = await page.locator('#discounts-grid tbody tr').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ==========================================
  // NHÓM 3: BẢNG DỮ LIỆU & PHÂN TRANG (PROMO_DIS_Grid_01 -> PROMO_DIS_Page_02)
  // ==========================================

  test('PROMO_DIS_Grid_01: Kiểm tra biểu tượng cột Is active khớp với trạng thái discount', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    const checkIcon = page.locator('#discounts-grid tbody tr i.fa-check, #discounts-grid tbody tr .text-success').first();
    await expect(checkIcon).toBeVisible();
  });

  test('PROMO_DIS_Grid_02: Kiểm tra dữ liệu trong bảng khớp với trang Edit', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    // DEFECT: Bảng danh sách hiển thị thời gian chưa kèm thông tin múi giờ so với trang Edit
    const tzLabel = page.locator('.timezone-indicator, .table-timezone');
    await expect(tzLabel, 'Defect: Bảng danh sách thiếu ký hiệu múi giờ bên cạnh cột thời gian').toBeVisible({ timeout: 1000 });
  });

  test('PROMO_DIS_Page_01: Kiểm tra giá trị mặc định và danh sách của ô Show', async ({ page }) => {
    await gotoDiscounts(page);
    const pageSelect = page.getByLabel('Show items').or(page.locator('select[aria-label*="Show items"], select[name$="_length"], .dataTables_length select, .dt-length select')).first();
    await expect(pageSelect).toBeVisible();
    await expect(pageSelect).toHaveValue('15');
  });

  test('PROMO_DIS_Page_02: Kiểm tra đổi số dòng mỗi trang', async ({ page }) => {
    await gotoDiscounts(page);
    const pageSelect = page.getByLabel('Show items').or(page.locator('select[aria-label*="Show items"], select[name$="_length"], .dataTables_length select, .dt-length select')).first();
    await pageSelect.selectOption('7');
    await page.waitForTimeout(800);
    await expect(page.locator('#discounts-grid')).toBeVisible();
  });

  // ==========================================
  // NHÓM 4: ĐIỀU HƯỚNG & NÚT CHỨC NĂNG (PROMO_DIS_Nav_01 -> PROMO_DIS_Nav_04)
  // ==========================================

  test('PROMO_DIS_Nav_01: Kiểm tra nút [Add new]', async ({ page }) => {
    await gotoDiscounts(page);
    await page.click('a[href*="/Admin/Discount/Create"]');
    await page.waitForURL(/\/Admin\/Discount\/Create/i, { timeout: 15000 });
    await expect(page.locator('.content-header h1, h1.float-left').first()).toContainText(/Add a new discount|Discount/i);
  });

  test('PROMO_DIS_Nav_02: Kiểm tra nút [Edit] và quay lại danh sách', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    const editBtn = page.locator('#discounts-grid tbody a[href*="/Admin/Discount/Edit/"]').first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await page.waitForURL(/\/Admin\/Discount\/Edit\//i, { timeout: 15000 }).catch(() => {});
      const backLink = page.locator('a[href*="/Admin/Discount/List"]').first();
      if (await backLink.isVisible().catch(() => false)) {
        await backLink.click();
      } else {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/Discount/List');
      }
    }
    await expect(page.locator('#discounts-grid')).toBeVisible();
  });

  test('PROMO_DIS_Nav_03: Kiểm tra chuyển qua lại giữa các mục trong menu Promotions', async ({ page }) => {
    await gotoDiscounts(page);
    const promoP = page.locator('.nav-sidebar p:has-text("Promotions")').first();
    const affLink = page.locator('.nav-sidebar a[href*="/Admin/Affiliate/List"]').first();
    if (!await affLink.isVisible().catch(() => false)) {
      await promoP.click();
      await page.waitForTimeout(500);
    }
    if (await affLink.isVisible().catch(() => false)) {
      await affLink.click();
      await page.waitForTimeout(500);
    }
    const disLink = page.locator('.nav-sidebar a[href*="/Admin/Discount/List"]').first();
    if (!await disLink.isVisible().catch(() => false)) {
      await page.locator('.nav-sidebar p:has-text("Promotions")').first().click();
      await page.waitForTimeout(500);
    }
    if (await disLink.isVisible().catch(() => false)) {
      await disLink.click();
    } else {
      await page.goto('https://admin-demo.nopcommerce.com/Admin/Discount/List');
    }
    await expect(page.locator('#discounts-grid')).toBeVisible();
  });

  test('PROMO_DIS_Nav_04: Kiểm tra nút Back của trình duyệt sau khi mở trang Edit', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    const editBtn = page.locator('#discounts-grid tbody a[href*="/Admin/Discount/Edit/"]').first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await page.waitForURL(/\/Admin\/Discount\/Edit\//i, { timeout: 15000 }).catch(() => {});
      await page.goBack();
      await page.waitForTimeout(500);
    }
    await expect(page.locator('#discounts-grid, .content-header').first()).toBeVisible();
  });

  // ==========================================
  // NHÓM 5: BẢO MẬT (PROMO_DIS_Security_01 -> PROMO_DIS_Security_05)
  // ==========================================

  test('PROMO_DIS_Security_01: Kiểm tra mã script ở Discount name không bị thực thi', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.fill('#SearchDiscountName', '<script>alert("XSS")</script>');
    await page.click('#search-discounts');
    await page.waitForTimeout(600);
    // DEFECT: Ô tìm kiếm thiếu cảnh báo khi phát hiện chuỗi thẻ script độc hại
    const xssWarning = page.locator('.security-warning, .text-danger');
    await expect(xssWarning, 'Defect: Hệ thống thiếu cảnh báo phát hiện chuỗi mã script trong ô tìm kiếm').toBeVisible({ timeout: 1000 });
  });

  test('PROMO_DIS_Security_02: Kiểm tra SQL injection ở Discount name và Coupon code', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.fill('#SearchDiscountCouponCode, #SearchCouponCode', "' UNION SELECT 1,2,3--");
    await page.click('#search-discounts');
    await page.waitForTimeout(600);
    // DEFECT: Hệ thống thiếu cảnh báo WAF khi nhập cú pháp SQL Injection
    const wafAlert = page.locator('.waf-blocked, .alert-danger');
    await expect(wafAlert, 'Defect: Hệ thống không phát hiện và không cảnh báo cú pháp SQL Injection tiềm ẩn').toBeVisible({ timeout: 1000 });
  });

  test('PROMO_DIS_Security_03: Kiểm tra Discount name rất dài', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    const longString = 'a'.repeat(500);
    await page.fill('#SearchDiscountName', longString);
    await page.click('#search-discounts');
    await page.waitForTimeout(1000);
    await expect(page.locator('#discounts-grid')).toBeVisible();
  });

  test('PROMO_DIS_Security_04: Kiểm tra truy cập trang Discounts khi chưa đăng nhập admin', async ({ page }) => {
    await page.goto('https://admin-demo.nopcommerce.com/logout');
    await page.waitForTimeout(600);
    await page.goto('https://admin-demo.nopcommerce.com/Admin/Discount/List');
    await expect(page).toHaveURL(/\/login/i);
  });

  test('PROMO_DIS_Security_05: Kiểm tra trang Discounts dùng kết nối HTTPS', async ({ page }) => {
    await gotoDiscounts(page);
    expect(page.url()).toMatch(/^https:\/\//);
  });

});
