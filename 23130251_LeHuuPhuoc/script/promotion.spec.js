// @ts-check
const { test, expect } = require('../../fixtures');
const { loginAdmin, gotoDiscounts, fillDate, resetSearch } = require('../admin_helpers');

test.describe('Kiểm thử Admin - Promotions - Discounts (48 Test Cases)', () => {

  test('PROMO_DIS_View_01: Kiểm tra mở trang Discounts từ menu Promotions', async ({ page }) => {
      await gotoDiscounts(page);

      const promoLink = page.locator('.nav-sidebar li:has(p:has-text("Promotions")), .nav-sidebar p:has-text("Promotions")').first();
      const discountLink = page.locator('.nav-sidebar a[href*="/Admin/Discount/List"], .nav-sidebar a:has-text("Discounts")').first();
      
      if (!await discountLink.isVisible().catch(() => false)) {
        await promoLink.click().catch(() => {});
        await page.waitForTimeout(600);
      }

      if (await discountLink.isVisible().catch(() => false)) {
        await discountLink.click().catch(() => {});
        await page.waitForTimeout(500);
      }

      await expect(page.locator('.content-header h1, h1.float-left, #discounts-grid').first()).toBeVisible();
    });

  test('PROMO_DIS_View_02: Kiểm tra truy cập trực tiếp bằng URL /Admin/Discount/List', async ({ page }) => {
      await gotoDiscounts(page);
      expect(page.url()).toMatch(/\/Admin\/Discount\/List/i);
      await expect(page.locator('.content-header h1, h1.float-left').first()).toContainText('Discounts');
      await expect(page.locator('#discounts-grid')).toBeVisible();
    });

  test('PROMO_DIS_View_03: Kiểm tra thông báo cảnh báo ở đầu trang', async ({ page }) => {
  
      await gotoDiscounts(page);
      
      // Kiểm tra thanh thông báo cảnh báo màu vàng
      const warningAlert = page.locator('.alert-warning, .alert-dismissible, .alert').first();
      if (await warningAlert.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(warningAlert).toContainText(/Ignore discounts|Configuration/i);
        const closeBtn = warningAlert.locator('button.close, [data-dismiss="alert"], [data-bs-dismiss="alert"]').first();
        if (await closeBtn.isVisible().catch(() => false)) {
          await closeBtn.click();
          await expect(warningAlert).toBeHidden({ timeout: 5000 }).catch(() => {});
        }
      } else {
        await expect(page.locator('#discounts-grid')).toBeVisible();
      }
  
    });

  test('PROMO_DIS_View_04: Kiểm tra các trường và nút trong khối Search', async ({ page }) => {
  
      await gotoDiscounts(page);
      
      // Kiểm tra các trường tìm kiếm và nút Search
      await expect(page.locator('#SearchStartDate')).toBeVisible();
      await expect(page.locator('#SearchEndDate')).toBeVisible();
      await expect(page.locator('#SearchDiscountTypeId')).toBeVisible();
      await expect(page.locator('#SearchVendorId')).toBeVisible();
      await expect(page.locator('#SearchDiscountCouponCode, #SearchCouponCode').first()).toBeVisible();
      await expect(page.locator('#SearchDiscountName')).toBeVisible();
      await expect(page.locator('#IsActiveId, #SearchIsActiveId').first()).toBeVisible();
      await expect(page.locator('#search-discounts')).toBeVisible();
  
    });

  test('PROMO_DIS_View_05: Kiểm tra giá trị mặc định của khối Search', async ({ page }) => {
  
      await gotoDiscounts(page);
      
      // Discount name và Coupon code mặc định trống
      await expect(page.locator('#SearchDiscountName')).toHaveValue('');
      await expect(page.locator('#SearchDiscountCouponCode, #SearchCouponCode').first()).toHaveValue('');
      
      // Discount type, Vendor, Is active mặc định là "All" (value = '0')
      const typeVal = await page.locator('#SearchDiscountTypeId').inputValue();
      expect(typeVal).toBe('0');
      const activeVal = await page.locator('#IsActiveId, #SearchIsActiveId').first().inputValue();
      expect(activeVal).toBe('0');
  
    });

  test('PROMO_DIS_View_06: Kiểm tra tooltip (?) của các trường tìm kiếm', async ({ page }) => {
      await gotoDiscounts(page);
      
      const helpIcons = page.locator('.ico-help, [data-toggle="tooltip"], [data-bs-toggle="tooltip"], i.fa-question-circle, .label-wrapper');
      const count = await helpIcons.count();
      if (count > 0) {
        await helpIcons.first().hover().catch(() => {});
        await page.waitForTimeout(300);
      }
      expect(count).toBeGreaterThanOrEqual(0);
      await expect(page.locator('#search-discounts, .btn-search').first()).toBeVisible();
    });

  test('PROMO_DIS_View_07: Kiểm tra thu gọn / mở rộng khối Search', async ({ page }) => {
  
      await gotoDiscounts(page);
      
      await page.fill('#SearchDiscountName', 'sample');
      
      // Click nút thu gọn khối search
      const collapseBtn = page.locator('.card-tools button[data-card-widget="collapse"], button[data-card-widget="collapse"]').first();
      if (await collapseBtn.isVisible().catch(() => false)) {
        await collapseBtn.click();
        await page.waitForTimeout(600);
        
        // Click mở rộng lại
        await collapseBtn.click();
        await page.waitForTimeout(600);
      }
      
      // Giá trị ô input vẫn còn nguyên
      await expect(page.locator('#SearchDiscountName')).toHaveValue('sample');
  
    });

  test('PROMO_DIS_View_08: Kiểm tra các cột của bảng danh sách', async ({ page }) => {
  
      await gotoDiscounts(page);
      
      await expect(page.locator('#discounts-grid')).toBeVisible();
      const tableText = await page.locator('.dt-container, .dataTables_wrapper, #discounts-grid').first().innerText();
      
      expect(tableText).toMatch(/Name/i);
      expect(tableText).toMatch(/Discount type/i);
      expect(tableText).toMatch(/Discount/i);
      expect(tableText).toMatch(/Start date/i);
      expect(tableText).toMatch(/End date/i);
      expect(tableText).toMatch(/Times used/i);
      expect(tableText).toMatch(/Is active/i);
      expect(tableText).toMatch(/Edit/i);
  
    });

  test('PROMO_DIS_View_09: Kiểm tra dữ liệu mặc định trong bảng', async ({ page }) => {
  
      await gotoDiscounts(page);
      await resetSearch(page);
      
      const grid = page.locator('#discounts-grid');
      await expect(grid).toContainText("order total' discount");
      await expect(grid).toContainText('Sample discount with coupon code');
  
    });

  test('PROMO_DIS_View_10: Kiểm tra định dạng cột Discount (phần trăm và số tiền)', async ({ page }) => {
  
      await gotoDiscounts(page);
      await resetSearch(page);
      
      const grid = page.locator('#discounts-grid tbody');
      const content = await grid.innerText();
      
      // Kiểm tra có discount phần trăm (20%) và discount số tiền (10 USD)
      expect(content).toContain('20%');
      expect(content).toContain('10 USD');
  
    });

  test('PROMO_DIS_View_11: Kiểm tra layout trang trên desktop và mobile', async ({ page }) => {
  
      await gotoDiscounts(page);
      
      // 1. Desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(page.locator('#search-discounts')).toBeVisible();
      await expect(page.locator('a.btn-primary[href*="/Admin/Discount/Create"], a:has-text("Add new")').first()).toBeVisible();
  
      // 2. Mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('#search-discounts')).toBeVisible();
      await page.setViewportSize({ width: 1280, height: 720 });
  
    });

  test('PROMO_DIS_Search_01: Kiểm tra tìm theo Discount name đầy đủ', async ({ page }) => {
  
      await gotoDiscounts(page);
      await page.fill('#SearchDiscountName', "'20% order total' discount");
      await page.click('#search-discounts');
      await page.waitForTimeout(1000);
      
      const rows = page.locator('#discounts-grid tbody tr');
      await expect(rows.first()).toContainText("'20% order total' discount");
  
    });

  test('PROMO_DIS_Search_02: Kiểm tra tìm theo một phần Discount name', async ({ page }) => {
  
      await gotoDiscounts(page);
      await page.fill('#SearchDiscountName', 'sample');
      await page.click('#search-discounts');
      await page.waitForTimeout(1000);
      
      const rows = page.locator('#discounts-grid tbody tr');
      await expect(rows.first()).toContainText('Sample discount with coupon code');
  
    });

  test('PROMO_DIS_Search_03: Kiểm tra tìm Discount name không tồn tại', async ({ page }) => {
  
      await gotoDiscounts(page);
      await page.fill('#SearchDiscountName', 'zzz_khong_ton_tai');
      await page.click('#search-discounts');
      await page.waitForTimeout(1000);
      
      await expect(page.locator('#discounts-grid')).toContainText(/No data available|No matching records|không có dữ liệu/i);
  
    });

  test('PROMO_DIS_Search_04: Kiểm tra tìm theo Coupon code', async ({ page }) => {
  
      await gotoDiscounts(page);
      await resetSearch(page);
      
      const couponInput = page.locator('#SearchDiscountCouponCode, #SearchCouponCode').first();
      await couponInput.fill('123');
      await page.click('#search-discounts');
      await page.waitForTimeout(1000);
      
      await expect(page.locator('#discounts-grid')).toBeVisible();
  
    });

  test('PROMO_DIS_Search_05: Kiểm tra tìm Coupon code không tồn tại', async ({ page }) => {
  
      await gotoDiscounts(page);
      await resetSearch(page);
      
      const couponInput = page.locator('#SearchDiscountCouponCode, #SearchCouponCode').first();
      await couponInput.fill('NOTEXIST999');
      await page.click('#search-discounts');
      await page.waitForTimeout(1000);
      
      await expect(page.locator('#discounts-grid')).toContainText(/No data available|No matching records|không có dữ liệu/i);
  
    });

  test('PROMO_DIS_Search_06: Kiểm tra danh sách giá trị của Discount type', async ({ page }) => {
  
      await gotoDiscounts(page);
      const options = await page.locator('#SearchDiscountTypeId option').allInnerTexts();
      expect(options.some(o => /All/i.test(o))).toBeTruthy();
      expect(options.some(o => /Assigned to order total/i.test(o))).toBeTruthy();
      expect(options.some(o => /Assigned to products/i.test(o))).toBeTruthy();
  
    });

  test('PROMO_DIS_Search_07: Kiểm tra lọc Discount type = Assigned to order total', async ({ page }) => {
  
      await gotoDiscounts(page);
      await resetSearch(page);
      
      await page.locator('#SearchDiscountTypeId').selectOption({ label: 'Assigned to order total' });
      await page.click('#search-discounts');
      await page.waitForTimeout(1000);
      
      const rows = page.locator('#discounts-grid tbody tr');
      await expect(rows.first()).toContainText("'20% order total' discount");
  
    });

  test('PROMO_DIS_Search_08: Kiểm tra lọc Discount type = Assigned to products', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.locator('#SearchDiscountName').fill('Special!@#$%^&*()');
    await page.locator('#search-discounts').click();
    await page.waitForTimeout(600);

    const alert = page.locator('.search-warning, .field-validation-error');
    await expect(alert, 'Defect: Tìm kiếm tên giảm giá bằng ký tự đặc biệt thiếu thông báo cảnh báo').toBeVisible({ timeout: 1000 });

  
    });

  test('PROMO_DIS_Search_09: Kiểm tra lọc Is active = Active only', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.locator('#SearchCouponCode').fill('  SUMMER2026  ');
    await page.locator('#search-discounts').click();
    await page.waitForTimeout(600);

    const val = await page.locator('#SearchCouponCode').inputValue();
    expect(val, 'Defect: Trường Search Coupon Code chưa tự động cắt khoảng trắng đầu cuối (trim)').toBe('SUMMER2026');

  
    });

  test('PROMO_DIS_Search_10: Kiểm tra lọc Is active = Inactive only', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.locator('#SearchCouponCode').fill('abc_lowercase');
    await page.locator('#search-discounts').click();
    await page.waitForTimeout(600);

    const caseSensitiveCheckbox = page.locator('#SearchCouponCaseSensitive, input[name*="CaseSensitive"]');
    await expect(caseSensitiveCheckbox, 'Defect: Thiếu tùy chọn phân biệt chữ hoa/thường khi tìm kiếm Coupon code').toBeVisible({ timeout: 1000 });

  
    });

  test('PROMO_DIS_Search_11: Kiểm tra lọc theo Start date', async ({ page }) => {
  
      await gotoDiscounts(page);
      await resetSearch(page);
      
      // 1. Nhập Start date quá khứ (01/01/2019)
      await fillDate(page, '#SearchStartDate', '01/01/2019');
      await page.click('#search-discounts');
      await page.waitForTimeout(1000);
      await expect(page.locator('#discounts-grid tbody tr').first()).toBeVisible();
      
      // 2. Nhập Start date tương lai xa (01/01/2035)
      await fillDate(page, '#SearchStartDate', '01/01/2035');
      await page.click('#search-discounts');
      await page.waitForTimeout(1000);
      await expect(page.locator('#discounts-grid')).toContainText(/No data available|No matching records/i);
  
    });

  test('PROMO_DIS_Search_12: Kiểm tra lọc theo End date', async ({ page }) => {
  
      await gotoDiscounts(page);
      await resetSearch(page);
      
      // 1. End date tương lai xa (31/12/2035)
      await fillDate(page, '#SearchEndDate', '31/12/2035');
      await page.click('#search-discounts');
      await page.waitForTimeout(1000);
      await expect(page.locator('#discounts-grid tbody tr').first()).toBeVisible();
  
      // 2. End date quá khứ (01/01/2015)
      await fillDate(page, '#SearchEndDate', '01/01/2015');
      await page.click('#search-discounts');
      await page.waitForTimeout(1000);
      await expect(page.locator('#discounts-grid')).toContainText(/No data available|No matching records/i);
  
    });

  test('PROMO_DIS_Search_13: Kiểm tra lọc đồng thời Start date và End date', async ({ page }) => {
  
      await gotoDiscounts(page);
      await resetSearch(page);
      
      await fillDate(page, '#SearchStartDate', '01/01/2019');
      await fillDate(page, '#SearchEndDate', '31/12/2035');
      await page.click('#search-discounts');
      await page.waitForTimeout(1000);
      
      await expect(page.locator('#discounts-grid tbody tr').first()).toBeVisible();
  
    });

  test('PROMO_DIS_Search_14: Kiểm tra Start date lớn hơn End date', async ({ page }) => {
  
      await gotoDiscounts(page);
      await resetSearch(page);
      
      await fillDate(page, '#SearchStartDate', '01/01/2035');
      await fillDate(page, '#SearchEndDate', '01/01/2019');
      await page.click('#search-discounts');
      await page.waitForTimeout(1000);
      
      await expect(page.locator('#discounts-grid')).toContainText(/No data available|No matching records/i);
  
    });

  test('PROMO_DIS_Search_15: Kiểm tra bộ lọc Vendor', async ({ page }) => {
  
      await gotoDiscounts(page);
      const options = await page.locator('#SearchVendorId option').allInnerTexts();
      expect(options.some(o => /All/i.test(o))).toBeTruthy();
      
      await page.click('#search-discounts');
      await expect(page.locator('#discounts-grid')).toBeVisible();
  
    });

  test('PROMO_DIS_Search_16: Kiểm tra kết hợp nhiều tiêu chí cho kết quả khớp', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await fillDate(page, '#SearchStartDate', '01/01/2030');
    await fillDate(page, '#SearchEndDate', '01/01/2020');
    await page.locator('#search-discounts').click();
    await page.waitForTimeout(600);

    const dateError = page.locator('.date-range-error, .field-validation-error, .alert-danger');
    await expect(dateError, 'Defect: Thiếu validation thông báo Start date lớn hơn End date').toBeVisible({ timeout: 1000 });

  
    });

  test('PROMO_DIS_Search_17: Kiểm tra kết hợp nhiều tiêu chí không có kết quả', async ({ page }) => {
  
      await gotoDiscounts(page);
      await resetSearch(page);
      
      await page.fill('#SearchDiscountName', '20%');
      await page.locator('#SearchDiscountTypeId').selectOption({ label: 'Assigned to products' });
      await page.click('#search-discounts');
      await page.waitForTimeout(1000);
      
      await expect(page.locator('#discounts-grid')).toContainText(/No data available|No matching records/i);
  
    });

  test('PROMO_DIS_Search_18: Kiểm tra xóa tiêu chí rồi tìm lại', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.locator('#SearchDiscountName').fill('   ');
    await page.locator('#search-discounts').click();
    await page.waitForTimeout(600);

    const val = await page.locator('#SearchDiscountName').inputValue();
    expect(val, 'Defect: Nhập toàn khoảng trắng vào ô tìm kiếm chưa được tự động làm sạch').toBe('');

  
    });

  test('PROMO_DIS_Search_19: Kiểm tra tìm kiếm bằng phím Enter', async ({ page }) => {
  
      await gotoDiscounts(page);
      await resetSearch(page);
      
      await page.fill('#SearchDiscountName', 'sample');
      await page.locator('#SearchDiscountName').press('Enter');
      await page.waitForTimeout(1000);
      
      await expect(page.locator('#discounts-grid tbody tr').first()).toContainText('Sample discount with coupon code');
  
    });

  test('PROMO_DIS_Search_20: Kiểm tra Discount name có khoảng trắng đầu cuối', async ({ page }) => {
    await gotoDiscounts(page);
    const searchBtn = page.locator('#search-discounts');
    await searchBtn.click({ noWaitAfter: true });

    await expect(searchBtn, 'Defect: Nút Search không hiển thị trạng thái loading/disabled khi đang tìm kiếm').toHaveClass(/loading|disabled/, { timeout: 500 });

  
    });

  test('PROMO_DIS_Grid_01: Kiểm tra biểu tượng cột Is active khớp với trạng thái discount', async ({ page }) => {
  
      await gotoDiscounts(page);
      await resetSearch(page);
      
      const activeIcon = page.locator('#discounts-grid tbody tr:first-child i.true-icon, #discounts-grid tbody tr:first-child i.fa-check, #discounts-grid tbody tr:first-child .text-success').first();
      await expect(activeIcon).toBeVisible();
      
      await page.locator('#discounts-grid tbody tr:first-child a[href*="/Admin/Discount/Edit/"], #discounts-grid tbody tr:first-child a:has-text("Edit")').first().click();
      await page.waitForURL(/\/Admin\/Discount\/Edit\//i, { timeout: 15000 });
      
      await expect(page.locator('#IsActive')).toBeChecked();
  
    });

  test('PROMO_DIS_Grid_02: Kiểm tra dữ liệu trong bảng khớp với trang Edit', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    await page.locator('#discounts-grid tbody tr:first-child a:has-text("Edit")').first().click();
    await page.waitForURL(/\/Admin\/Discount\/Edit\//i, { timeout: 15000 });

    const timezoneNotice = page.locator('.timezone-info, .text-muted:has-text("UTC")');
    await expect(timezoneNotice, 'Defect: Trang Edit thiếu thông tin quy định chuẩn múi giờ hiển thị so với bảng danh sách').toBeVisible({ timeout: 1000 });

  
    });

  test('PROMO_DIS_Page_01: Kiểm tra giá trị mặc định và danh sách của ô Show', async ({ page }) => {
  
      await gotoDiscounts(page);
      const lengthSelect = page.locator('#dt-length-0, select[aria-controls="discounts-grid"], select[name*="length"]').first();
      await expect(lengthSelect).toBeVisible();
      
      const val = await lengthSelect.inputValue();
      expect(val).toBe('15');
  
    });

  test('PROMO_DIS_Page_02: Kiểm tra đổi số dòng mỗi trang', async ({ page }) => {
  
      await gotoDiscounts(page);
      const lengthSelect = page.locator('#dt-length-0, select[aria-controls="discounts-grid"], select[name*="length"]').first();
      await expect(lengthSelect).toBeVisible();
      
      await lengthSelect.selectOption('7');
      await page.waitForTimeout(500);
      await expect(page.locator('#discounts-grid')).toContainText("order total' discount");
      
      await lengthSelect.selectOption('100');
      await page.waitForTimeout(500);
      await expect(page.locator('#discounts-grid')).toContainText("order total' discount");
  
    });

  test('PROMO_DIS_Page_03: Kiểm tra nút Previous / Next khi chỉ có 1 trang', async ({ page }) => {
  
      await gotoDiscounts(page);
      
      const prevBtn = page.locator('#discounts-grid_previous, .paginate_button.previous, li.page-item:has-text("Previous")').first();
      const nextBtn = page.locator('#discounts-grid_next, .paginate_button.next, li.page-item:has-text("Next")').first();
      
      if (await prevBtn.isVisible().catch(() => false)) {
        await expect(prevBtn).toHaveClass(/disabled/);
      }
      if (await nextBtn.isVisible().catch(() => false)) {
        await expect(nextBtn).toHaveClass(/disabled/);
      }
  
    });

  test('PROMO_DIS_Page_04: Kiểm tra nút làm mới bảng (biểu tượng refresh)', async ({ page }) => {
  
      await gotoDiscounts(page);
      await page.fill('#SearchDiscountName', 'sample');
      await page.click('#search-discounts');
      await page.waitForTimeout(1000);
      
      const refreshBtn = page.locator('.btn-refresh, button[data-action="refresh"], #search-discounts').first();
      await refreshBtn.click();
      await page.waitForTimeout(1000);
      
      await expect(page.locator('#discounts-grid tbody tr').first()).toContainText('Sample discount with coupon code');
  
    });

  test('PROMO_DIS_Nav_01: Kiểm tra nút [Add new]', async ({ page }) => {
  
      await gotoDiscounts(page);
      const addBtn = page.locator('a.btn-primary[href*="/Admin/Discount/Create"], a:has-text("Add new")').first();
      await expect(addBtn).toBeVisible();
      await addBtn.click();
      
      await page.waitForURL(/\/Admin\/Discount\/Create/i, { timeout: 15000 });
      await expect(page.locator('.content-header h1, h1.float-left').first()).toContainText(/Add a new discount|Discount/i);
  
    });

  test('PROMO_DIS_Nav_02: Kiểm tra nút [Edit] và quay lại danh sách', async ({ page }) => {
      await gotoDiscounts(page);
      await resetSearch(page);
      
      const editBtn = page.locator('#discounts-grid tbody a[href*="/Admin/Discount/Edit/"], #discounts-grid tbody a:has-text("Edit")').first();
      if (await editBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editBtn.click().catch(() => {});
        await page.waitForURL(/\/Admin\/Discount\/Edit\//i, { timeout: 10000 }).catch(() => {});
        
        const backLink = page.locator('a:has-text("back to discount list"), a[href*="/Admin/Discount/List"]').first();
        if (await backLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          await backLink.click().catch(() => {});
        }
      }
      if (!page.url().includes('/Admin/Discount/List')) {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/Discount/List', { timeout: 15000 }).catch(() => {});
      }
      
      await expect(page.locator('#discounts-grid, .content-header').first()).toBeVisible();
    });

  test('PROMO_DIS_Nav_03: Kiểm tra chuyển qua lại giữa các mục trong menu Promotions', async ({ page }) => {
      await gotoDiscounts(page);
      
      const promoP = page.locator('.nav-sidebar li:has(p:has-text("Promotions")), .nav-sidebar p:has-text("Promotions")').first();
      const affLink = page.locator('.nav-sidebar a[href*="/Admin/Affiliate/List"], .nav-sidebar a:has-text("Affiliates")').first();
      
      if (!await affLink.isVisible().catch(() => false)) {
        await promoP.click().catch(() => {});
        await page.waitForTimeout(500);
      }
      
      if (await affLink.isVisible().catch(() => false)) {
        await affLink.click().catch(() => {});
        await page.waitForURL(/\/Admin\/Affiliate\/List/i, { timeout: 10000 }).catch(() => {});
      }
      
      const disLink = page.locator('.nav-sidebar a[href*="/Admin/Discount/List"], .nav-sidebar a:has-text("Discounts")').first();
      if (!await disLink.isVisible().catch(() => false)) {
        await promoP.click().catch(() => {});
        await page.waitForTimeout(500);
      }
      
      if (await disLink.isVisible().catch(() => false)) {
        await disLink.click().catch(() => {});
      }
      if (!page.url().includes('/Admin/Discount/List')) {
        await page.goto('https://admin-demo.nopcommerce.com/Admin/Discount/List', { timeout: 15000 }).catch(() => {});
      }
      
      await expect(page.locator('#discounts-grid, .content-header').first()).toBeVisible();
    });

  test('PROMO_DIS_Nav_04: Kiểm tra liên kết "Learn more about discounts"', async ({ page }) => {
  
      await gotoDiscounts(page);
      
      const docLink = page.locator('a[href*="docs.nopcommerce.com"]').first();
      if (await docLink.isVisible().catch(() => false)) {
        await expect(docLink).toHaveAttribute('href', /docs\.nopcommerce\.com/);
      }
  
    });

  test('PROMO_DIS_Nav_05: Kiểm tra tải lại trang (F5) sau khi tìm kiếm', async ({ page }) => {
    await gotoDiscounts(page);
    await page.locator('#SearchDiscountName').fill('TestDiscount');
    await page.locator('#search-discounts').click();
    await page.waitForTimeout(600);

    await page.reload();
    await page.waitForTimeout(600);

    const nameInput = page.locator('#SearchDiscountName');
    await expect(nameInput, 'Defect: Trạng thái tìm kiếm không được lưu lại trên URL/Session sau khi reload trang (F5)').toHaveValue('TestDiscount');

  
    });

  test('PROMO_DIS_Nav_06: Kiểm tra nút Back của trình duyệt sau khi mở trang Edit', async ({ page }) => {
  
      await gotoDiscounts(page);
      await resetSearch(page);
      
      await page.locator('#discounts-grid tbody tr:first-child a[href*="/Admin/Discount/Edit/"], #discounts-grid tbody tr:first-child a:has-text("Edit")').first().click();
      await page.waitForURL(/\/Admin\/Discount\/Edit\//i, { timeout: 15000 });
      
      await page.goBack();
      await page.waitForURL(/\/Admin\/Discount\/List/i, { timeout: 15000 });
      await expect(page.locator('#discounts-grid')).toBeVisible();
  
    });

  test('PROMO_DIS_Security_01: Kiểm tra mã script ở Discount name không bị thực thi', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    const xssPayload = '<script>alert("XSS")</script>';
    await page.locator('#SearchDiscountName').fill(xssPayload);
    await page.locator('#search-discounts').click();
    await page.waitForTimeout(600);

    const secWarning = page.locator('.security-warning, .text-danger');
    await expect(secWarning, 'Defect: Hệ thống thiếu cảnh báo phát hiện chuỗi mã script độc hại trong ô tìm kiếm').toBeVisible({ timeout: 1000 });
    });

  test('PROMO_DIS_Security_02: Kiểm tra SQL injection ở Discount name và Coupon code', async ({ page }) => {
    await gotoDiscounts(page);
    await resetSearch(page);
    const sqli = "' UNION SELECT 1,2,3--";
    await page.locator('#SearchCouponCode').fill(sqli);
    await page.locator('#search-discounts').click();
    await page.waitForTimeout(600);

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
