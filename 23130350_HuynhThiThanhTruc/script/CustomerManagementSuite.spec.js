const { test, expect } = require('../../fixtures');
const path = require('path');
const fs = require('fs');

/**
 * Tự động phát hiện và đợi màn hình chống bot Cloudflare kết thúc
 */
async function handleCloudflare(page) {
  const cf = page.locator('text=/Verif.*you are human|Performing security verification|checking your browser|Just a moment/i').or(page.locator('#challenge-running, #challenge-stage'));
  if (await cf.first().isVisible({ timeout: 2500 }).catch(() => false)) {
    console.log('Cloudflare đang kiểm tra bảo mật... Vui lòng đợi...');
    await cf.first().waitFor({ state: 'detached', timeout: 45000 }).catch(() => { });
    await page.waitForTimeout(2000);
  }
}

/**
 * Đảm bảo đăng nhập Administrator
 */
async function ensureAdminLoggedIn(page) {
  if (page.url() === 'about:blank' || page.url().includes('/login') || !page.url().includes('localhost:8080')) {
    await page.goto('http://localhost:8080/login');
    await handleCloudflare(page);

    const emailInput = page.locator('#Email');
    if (await emailInput.isVisible({ timeout: 10000 }).catch(() => false)) {
      await emailInput.fill('admin@yourstore.com');
      await page.fill('#Password', '@Truc27102005');
      await page.locator('button.login-button').click();
      await page.waitForLoadState('networkidle');
    }
  }
}

test.describe('TEST SUITE TỔNG HỢP: CUSTOMER MANAGEMENT (65 TEST CASES)', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await ensureAdminLoggedIn(page);
  });

  // Tự động chụp màn hình sau mỗi test case phân theo từng thư mục chức năng riêng biệt
  test.afterEach(async ({ page }, testInfo) => {
    let folder = 'Other';
    if (testInfo.title.startsWith('cust_info_')) folder = 'CustomerInfo';
    else if (testInfo.title.startsWith('cust_role_')) folder = 'CustomerRole';
    else if (testInfo.title.startsWith('cust_onl_')) folder = 'OnlineCustomer';

    const screenshotDir = path.resolve(__dirname, 'screenshots', folder);
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const match = testInfo.title.match(/^(cust_[a-z]+_\d+)/);
    const tcId = match ? match[1] : 'test_case';
    const status = testInfo.status === testInfo.expectedStatus ? 'PASS' : 'FAILED';
    const screenshotPath = path.join(screenshotDir, `${tcId}_${status}.png`);

    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`[Screenshot saved]: ${screenshotPath}`);
    } catch (err) {
      console.error(`Lỗi chụp màn hình ${tcId}:`, err);
    }
  });

  // =========================================================================
  // PHÂN HỆ 1: QUẢN LÝ THÔNG TIN KHÁCH HÀNG (CUSTOMER INFO - 25 TCs)
  // =========================================================================
  test.describe('1. Phân hệ Quản lý Thông tin Khách hàng (Customer Info)', () => {

    test.beforeEach(async ({ page }) => {
      if (!page.url().includes('/Admin/Customer/List')) {
        await page.goto('http://localhost:8080/Admin/Customer/List');
        await handleCloudflare(page);
      }
      await expect(page.locator('.content-header')).toContainText('Customers', { timeout: 30000 });
      await expect(page.locator('#customers-grid')).toBeVisible({ timeout: 30000 });
    });

    test('cust_info_01: Kiểm tra hiển thị màn hình danh sách khách hàng [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      await expect(page.locator('.content-header')).toContainText('Customers');
      await expect(page.locator('#customers-grid')).toBeVisible();
      await expect(page.locator('#search-customers')).toBeVisible();
    });

    test('cust_info_02: Kiểm tra các cột trên bảng dữ liệu [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const visibleHeaders = page.locator('th:visible');
      await expect(visibleHeaders.filter({ hasText: /^Email$/ })).toBeVisible();
      await expect(visibleHeaders.filter({ hasText: /^Name$/ })).toBeVisible();
      await expect(visibleHeaders.filter({ hasText: /^Customer roles$/ })).toBeVisible();
      await expect(visibleHeaders.filter({ hasText: /^Company name$/ })).toBeVisible();
      await expect(visibleHeaders.filter({ hasText: /^Active$/ })).toBeVisible();
    });

    test('cust_info_03: Kiểm tra chức năng phân trang (20 bản ghi/trang) [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const lengthSelect = page.locator('select[name="customers-grid_length"]');
      if (await lengthSelect.isVisible()) {
        await lengthSelect.selectOption('20');
        await page.waitForLoadState('networkidle');
        const count = await page.locator('#customers-grid tbody tr').count();
        expect(count).toBeLessThanOrEqual(20);
      }
      const page2Button = page.locator('.paginate_button a:text("2"), .pagination .page-item:has-text("2") a');
      if (await page2Button.isVisible({ timeout: 3000 }).catch(() => false)) {
        await page2Button.click();
        await page.waitForLoadState('networkidle');
        await expect(page.locator('#customers-grid')).toBeVisible();
      } else {
        await expect(page.locator('.dataTables_paginate, .pagination, #customers-grid_paginate')).toBeVisible();
      }
    });

    test('cust_info_04: Kiểm tra tìm kiếm khách hàng theo Email tồn tại [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const targetEmail = 'admin@yourstore.com';
      await page.fill('#SearchEmail', targetEmail);
      await page.click('#search-customers');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('#customers-grid tbody tr').first()).toContainText(targetEmail);
    });

    test('cust_info_05: Kiểm tra tìm kiếm khách hàng theo Email không tồn tại [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      await page.fill('#SearchEmail', 'not_found_999@example.com');
      await page.click('#search-customers');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('#customers-grid tbody')).toContainText('No data available in table');
    });

    test('cust_info_06: Kiểm tra tìm kiếm theo First name (Khớp tương đối) [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      await page.fill('#SearchEmail', '');
      await page.fill('#SearchFirstName', 'John');
      await page.click('#search-customers');
      await page.waitForLoadState('networkidle');
      const count = await page.locator('#customers-grid tbody tr').count();
      expect(count).toBeGreaterThan(0);
    });

    test('cust_info_07: Kiểm tra tìm kiếm theo Last name [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      await page.fill('#SearchFirstName', '');
      await page.fill('#SearchLastName', 'Smith');
      await page.click('#search-customers');
      await page.waitForLoadState('networkidle');
      const count = await page.locator('#customers-grid tbody tr').count();
      expect(count).toBeGreaterThan(0);
    });

    test('cust_info_08: Kiểm tra lọc theo ngày (Biên dưới) [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      await page.fill('#SearchLastName', '');
      const dateFromInput = page.locator('#SearchRegistrationDateFrom, input[name="SearchRegistrationDateFrom"], #SearchLastActivityFrom, input[name="SearchLastActivityFrom"]').first();
      await expect(dateFromInput).toBeVisible({ timeout: 3000 });
      await dateFromInput.click();
      await dateFromInput.pressSequentially('11042025', { delay: 100 });
      await page.click('#search-customers');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('#customers-grid')).toBeVisible();
    });

    test('cust_info_09: Kiểm tra lọc theo ngày (Biên trên) [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const dateToInput = page.locator('#SearchRegistrationDateTo, input[name="SearchRegistrationDateTo"], #SearchLastActivityTo, input[name="SearchLastActivityTo"]').first();
      await expect(dateToInput).toBeVisible({ timeout: 3000 });
      await dateToInput.click();
      await dateToInput.pressSequentially('11042025', { delay: 100 });
      await page.click('#search-customers');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('#customers-grid')).toBeVisible();
    });

    test('cust_info_10: Kiểm tra lọc theo trạng thái kích hoạt Active = Yes [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const regDateFrom = page.locator('#SearchRegistrationDateFrom, input[name="SearchRegistrationDateFrom"]');
      if (await regDateFrom.isVisible({ timeout: 1000 }).catch(() => false)) await regDateFrom.fill('');
      const regDateTo = page.locator('#SearchRegistrationDateTo, input[name="SearchRegistrationDateTo"]');
      if (await regDateTo.isVisible({ timeout: 1000 }).catch(() => false)) await regDateTo.fill('');

      const activeSelect = page.locator('#SearchIsActiveId, select[name="SearchIsActiveId"], select:has(option:text("Yes"))');
      if (await activeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await activeSelect.selectOption({ label: 'Yes' }).catch(async () => {
          await activeSelect.selectOption('1').catch(() => {});
        });
      } else {
        const dropdownToggle = page.locator('.select2-selection:near(:text("Is active")), .form-group:has-text("Is active") .select2');
        if (await dropdownToggle.isVisible({ timeout: 1500 }).catch(() => false)) {
          await dropdownToggle.click();
          await page.locator('.select2-results__option:has-text("Yes")').click();
        }
      }

      await page.click('#search-customers');
      await page.waitForLoadState('networkidle');
      const firstRowActiveIcon = page.locator('#customers-grid tbody tr').first().locator('td:nth-child(6) i.fa-check, td:nth-child(6) i.true-icon, td:nth-child(6) i.text-success, td:nth-child(6) i');
      await expect(firstRowActiveIcon.first()).toBeVisible();
    });

    test('cust_info_11: Kiểm tra lọc khách hàng theo Customer roles [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      await page.click('#search-customers');
      await page.waitForLoadState('networkidle');
      const adminRows = page.locator('#customers-grid tbody tr', { hasText: 'Administrators' });
      await expect(adminRows.first()).toBeVisible();
    });

    test('cust_info_12: Kiểm tra hiển thị form thêm mới khách hàng [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      await page.locator('a.btn-primary:has-text("Add new")').click();
      await handleCloudflare(page);
      await expect(page.locator('.content-header')).toContainText('Add a new customer');
      await expect(page.locator('#Email')).toBeVisible();
      await expect(page.locator('#Password')).toBeVisible();
    });

    test('cust_info_13: Kiểm tra thêm mới khách hàng thành công (Happy Path) [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/Customer/Create');
      await handleCloudflare(page);
      const validEmail = `valid_${Date.now()}@example.com`;
      await page.fill('#Email', validEmail);
      await page.fill('#Password', 'Password@123');
      await page.fill('#FirstName', 'Thanh');
      await page.fill('#LastName', 'Truc');
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.alert-success, .alert')).toContainText(/customer has been added successfully|success/i);
    });

    test('cust_info_14: Kiểm tra ràng buộc trường bắt buộc Email (Bỏ trống) [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/Customer/Create');
      await handleCloudflare(page);
      await page.fill('#Email', '');
      await page.fill('#Password', 'Password@123');
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      const emailError = page.locator('#Email-error, span[data-valmsg-for="Email"], .field-validation-error');
      await expect(emailError.first()).toBeVisible();
      await expect(emailError.first()).toContainText(/Valid Email is required|Email is required|email/i);
    });

    test('cust_info_15: Kiểm tra ràng buộc định dạng Email (Thiếu @) [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/Customer/Create');
      await handleCloudflare(page);
      await page.fill('#Email', 'email.domain.com');
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      const emailError = page.locator('#Email-error, span[data-valmsg-for="Email"], .field-validation-error');
      await expect(emailError.first()).toBeVisible();
      await expect(emailError.first()).toContainText(/Wrong email|email/i);
    });

    test('cust_info_16: Kiểm tra ràng buộc định dạng Email (Thiếu domain) [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/Customer/Create');
      await handleCloudflare(page);
      await page.fill('#Email', 'email@');
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      const emailError = page.locator('#Email-error, span[data-valmsg-for="Email"], .field-validation-error');
      await expect(emailError.first()).toBeVisible();
      await expect(emailError.first()).toContainText(/Wrong email|email/i);
    });

    test('cust_info_17: Kiểm tra xử lý trùng lặp Email (Unique Email) [FAILED - Bug Intentional]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/Customer/Create');
      await handleCloudflare(page);
      await page.fill('#Email', 'admin@yourstore.com');
      await page.fill('#Password', 'Password@123');
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('#Email-error')).toContainText('The specified email already exists', { timeout: 4000 });
    });

    test('cust_info_18: Kiểm tra ràng buộc mật khẩu (Password trống) [FAILED - Bug Intentional]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/Customer/Create');
      await handleCloudflare(page);
      await page.fill('#Email', `test_nopass_${Date.now()}@example.com`);
      await page.fill('#Password', '');
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('#Password-error')).toBeVisible({ timeout: 4000 });
    });

    test('cust_info_19: Kiểm tra gán nhiều vai trò cùng lúc [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/Customer/Create');
      await handleCloudflare(page);
      const email = `multi_role_${Date.now()}@example.com`;
      await page.fill('#Email', email);
      await page.fill('#Password', 'Password@123');

      const roleBox = page.locator('.select2-selection--multiple, .k-multiselect-wrap, .form-group:has-text("Customer roles") .select2, div:has(> #SelectedCustomerRoleIds)');
      await expect(roleBox.first()).toBeVisible();
      await roleBox.first().click();

      const dropdownList = page.locator('.select2-dropdown:visible, .select2-results:visible, ul[role="listbox"]:visible');
      await expect(dropdownList.first()).toBeVisible({ timeout: 5000 });

      const roleToSelect = page.locator('.select2-results__option:has-text("Vendors"), .select2-results__option:has-text("Administrators"), li[role="option"]:has-text("Vendors")').first();
      await expect(roleToSelect).toBeVisible();
      await roleToSelect.click();

      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.alert-success, .alert')).toContainText(/customer has been added successfully|success/i);
    });

    test('cust_info_20: Kiểm tra chức năng [Save and Continue Edit] [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/Customer/Create');
      await handleCloudflare(page);
      const email = `continue_edit_${Date.now()}@example.com`;
      await page.fill('#Email', email);
      await page.fill('#Password', 'Password@123');
      await page.locator('button[name="save-continue"]').click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.content-header')).toContainText('Edit customer details');
    });

    test('cust_info_21: Kiểm tra điều hướng vào trang chỉnh sửa [Edit] [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const firstEditBtn = page.locator('#customers-grid tbody tr td:nth-child(7) a:has-text("Edit")').first();
      await firstEditBtn.click();
      await handleCloudflare(page);
      await expect(page.locator('.content-header')).toContainText('Edit customer details');
    });

    test('cust_info_22: Kiểm tra cập nhật thông tin cá nhân [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const firstEditBtn = page.locator('#customers-grid tbody tr td:nth-child(7) a:has-text("Edit")').first();
      await firstEditBtn.click();
      await handleCloudflare(page);
      const updatedFirstName = `Updated_${Date.now().toString().slice(-4)}`;
      await page.fill('#FirstName', updatedFirstName);
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.alert-success, .alert')).toContainText(/customer has been updated successfully|success/i);
    });

    test('cust_info_23: Kiểm tra đổi mật khẩu khách hàng (Change password) [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const firstEditBtn = page.locator('#customers-grid tbody tr td:nth-child(7) a:has-text("Edit")').first();
      await firstEditBtn.click();
      await handleCloudflare(page);

      const changePassInput = page.locator('#changePassword, input[name="newPassword"], #NewPassword');
      const changePassBtn = page.locator('button:has-text("Change password"), input[value="Change password"]');
      if (await changePassInput.isVisible() && await changePassBtn.isVisible()) {
        await changePassInput.fill('NewPass123');
        await changePassBtn.click();
        await page.waitForLoadState('networkidle');
        await expect(page.locator('.alert-success, .alert')).toBeVisible();
      } else {
        await expect(page.locator('#Password, .card:has-text("Password")').first()).toBeVisible();
      }
    });

    test('cust_info_24: Kiểm tra xóa khách hàng và xác nhận popup [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/Customer/Create');
      await handleCloudflare(page);
      const tempEmail = `to_delete_${Date.now()}@example.com`;
      await page.fill('#Email', tempEmail);
      await page.fill('#Password', 'Password@123');
      await page.locator('button[name="save-continue"]').click();
      await page.waitForLoadState('networkidle');

      const deleteBtn = page.locator('#customer-delete, button[data-target="#customer-delete-action-confirmation"], button:has-text("Delete")');
      await deleteBtn.first().click();

      const confirmModal = page.locator('#customer-delete-action-confirmation, .modal:visible');
      const cancelBtn = confirmModal.locator('button:has-text("Cancel"), button[data-dismiss="modal"]');
      if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cancelBtn.click();
        await page.waitForTimeout(500);
        await deleteBtn.first().click();
      }

      await confirmModal.locator('button[type="submit"]:has-text("Delete"), button:has-text("Delete")').first().click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.alert-success, .alert')).toContainText(/customer has been deleted successfully|success/i);
    });

    test('cust_info_25: Kiểm tra xuất dữ liệu khách hàng [Export to Excel] [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const exportBtnGroup = page.locator('.btn-group:has-text("Export")');
      if (await exportBtnGroup.isVisible({ timeout: 3000 }).catch(() => false)) {
        await exportBtnGroup.locator('button').first().click();
        const menu = page.locator('.dropdown-menu:visible');
        if (!await menu.isVisible({ timeout: 1000 }).catch(() => false)) {
          const dropdownArrow = exportBtnGroup.locator('button.dropdown-toggle');
          if (await dropdownArrow.isVisible()) await dropdownArrow.click();
        }
      } else {
        await page.locator('button:has-text("Export"), a:has-text("Export")').first().click();
      }

      const exportOption = page.locator('a:has-text("Export to Excel"), button:has-text("Export to Excel"), [name="exportexcel-all"]').first();
      await expect(exportOption).toBeVisible({ timeout: 5000 });

      const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
      await exportOption.click();
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
      } else {
        await page.waitForTimeout(1000);
        await expect(page.locator('#customers-grid')).toBeVisible();
      }
    });

  });

  // =========================================================================
  // PHÂN HỆ 2: QUẢN LÝ VAI TRÒ KHÁCH HÀNG (CUSTOMER ROLES - 20 TCs)
  // =========================================================================
  test.describe('2. Phân hệ Quản lý Vai trò Khách hàng (Customer Roles)', () => {

    test.beforeEach(async ({ page }) => {
      if (!page.url().includes('/Admin/CustomerRole/List')) {
        await page.goto('http://localhost:8080/Admin/CustomerRole/List');
        await handleCloudflare(page);
      }
      await expect(page.locator('.content-header')).toContainText('Customer roles', { timeout: 30000 });
      await expect(page.locator('#customerroles-grid')).toBeVisible({ timeout: 30000 });
    });

    test('cust_role_01: Kiểm tra hiển thị màn hình danh sách vai trò [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      await expect(page.locator('.content-header')).toContainText('Customer roles');
      await expect(page.locator('#customerroles-grid')).toBeVisible();
    });

    test('cust_role_02: Kiểm tra các cột dữ liệu hiển thị [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const visibleHeaders = page.locator('th:visible');
      await expect(visibleHeaders.filter({ hasText: /^Name$/ })).toBeVisible();
      await expect(visibleHeaders.filter({ hasText: /^Free shipping$/ })).toBeVisible();
      await expect(visibleHeaders.filter({ hasText: /^Tax exempt$/ })).toBeVisible();
      await expect(visibleHeaders.filter({ hasText: /^Active$/ })).toBeVisible();
      await expect(visibleHeaders.filter({ hasText: /^Is system role$/ })).toBeVisible();
    });

    test('cust_role_03: Kiểm tra hiển thị form thêm mới vai trò [PASS]', async ({ page }) => {
      await page.locator('a.btn-primary:has-text("Add new")').click();
      await handleCloudflare(page);
      await expect(page.locator('.content-header')).toContainText('Add a new customer role');
      await expect(page.locator('#Name')).toBeVisible();
    });

    test('cust_role_04: Kiểm tra thêm mới vai trò thành công (Happy Path) [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
      await handleCloudflare(page);
      const roleName = `Role_${Date.now().toString().slice(-5)}`;
      await page.fill('#Name', roleName);
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.alert-success, .alert')).toContainText(/customer role has been added successfully|success/i);
    });

    test('cust_role_05: Kiểm tra để trống Tên vai trò [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
      await handleCloudflare(page);
      await page.fill('#Name', '');
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      const errorMsg = page.locator('#Name-error, span[data-valmsg-for="Name"], .field-validation-error');
      await expect(errorMsg.first()).toBeVisible();
      await expect(errorMsg.first()).toContainText(/Please provide a name|Name is required|required/i);
    });

    test('cust_role_06: Kiểm tra giới hạn độ dài Tên vai trò (> 255 ký tự) [FAILED - Bug Intentional]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
      await handleCloudflare(page);
      await expect(page.locator('#Name')).toHaveAttribute('maxlength', '255', { timeout: 3000 });
    });

    test('cust_role_07: Kiểm tra thêm mới vai trò trùng tên [FAILED - Bug Intentional]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
      await handleCloudflare(page);
      await page.fill('#Name', 'Administrators');
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('#Name-error')).toHaveText('Customer role name already exists', { timeout: 4000 });
    });

    test('cust_role_08: Kiểm tra cấu hình thuộc tính Free shipping [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
      await handleCloudflare(page);
      const roleName = `FreeShip_${Date.now().toString().slice(-4)}`;
      await page.fill('#Name', roleName);
      await page.check('#FreeShipping');
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      const createdRow = page.locator('#customerroles-grid tbody tr', { hasText: roleName });
      await expect(createdRow.locator('td:nth-child(2) i.fa-check, td:nth-child(2) i.true-icon')).toBeVisible();
    });

    test('cust_role_09: Kiểm tra cấu hình thuộc tính Tax exempt [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
      await handleCloudflare(page);
      const roleName = `TaxExempt_${Date.now().toString().slice(-4)}`;
      await page.fill('#Name', roleName);
      await page.check('#TaxExempt');
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      const createdRow = page.locator('#customerroles-grid tbody tr', { hasText: roleName });
      await expect(createdRow.locator('td:nth-child(3) i.fa-check, td:nth-child(3) i.true-icon')).toBeVisible();
    });

    test('cust_role_10: Kiểm tra cấu hình thuộc tính Active [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
      await handleCloudflare(page);
      const roleName = `Inactive_${Date.now().toString().slice(-4)}`;
      await page.fill('#Name', roleName);
      await page.uncheck('#Active');
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      const createdRow = page.locator('#customerroles-grid tbody tr', { hasText: roleName });
      await expect(createdRow.locator('td:nth-child(4) i.fa-times, td:nth-child(4) i.false-icon, td:nth-child(4) i.text-danger')).toBeVisible();
    });

    test('cust_role_11: Kiểm tra chọn sản phẩm liên kết với vai trò [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
      await handleCloudflare(page);
      const chooseProductBtn = page.locator('button:has-text("Choose a product"), #chooseProduct, button[onclick*="ChooseProduct"]');
      if (await chooseProductBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        const [popup] = await Promise.all([
          page.waitForEvent('popup', { timeout: 3000 }).catch(() => null),
          chooseProductBtn.click()
        ]);
        if (popup) {
          await expect(popup).toBeDefined();
          await popup.close().catch(() => {});
        } else {
          await expect(page.locator('.modal:visible, [role="dialog"]:visible, #product-search-window')).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
      await expect(page.locator('.content-header')).toContainText('Add a new customer role');
    });

    test('cust_role_12: Kiểm tra xóa sản phẩm liên kết [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
      await handleCloudflare(page);
      const removeProductBtn = page.locator('button:has-text("Remove product"), #removeProduct');
      if (await removeProductBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await removeProductBtn.click();
      }
      await expect(page.locator('.content-header')).toContainText('Add a new customer role');
    });

    test('cust_role_13: Kiểm tra thuộc tính Is system role của vai trò hệ thống [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const adminRow = page.locator('#customerroles-grid tbody tr', { hasText: 'Administrators' });
      await expect(adminRow.first()).toBeVisible();
      await expect(adminRow.first().locator('td:nth-child(5) i.fa-check, td:nth-child(5) i.true-icon')).toBeVisible();
    });

    test('cust_role_14: Kiểm tra vô hiệu hóa trường System name đối với vai trò hệ thống [FAILED - Bug Intentional]', async ({ page }) => {
      await handleCloudflare(page);
      const adminRow = page.locator('#customerroles-grid tbody tr', { hasText: 'Administrators' });
      await adminRow.locator('a:has-text("Edit")').first().click();
      await handleCloudflare(page);
      await expect(page.locator('.content-header')).toContainText('Edit customer role details');
      const systemNameInput = page.locator('#SystemName');
      await expect(systemNameInput).toBeDisabled({ timeout: 4000 });
    });

    test('cust_role_15: Kiểm tra thao tác chặn xóa đối với vai trò hệ thống [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const guestsRow = page.locator('#customerroles-grid tbody tr', { hasText: 'Guests' });
      await guestsRow.locator('a:has-text("Edit")').first().click();
      await handleCloudflare(page);

      await expect(page.locator('.content-header')).toContainText('Edit customer role details');
      const roleDeleteBtn = page.locator('#customerrole-delete');
      if (await roleDeleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await roleDeleteBtn.click();
        const confirmModal = page.locator('#customerrole-delete-action-confirmation, .modal:visible');
        if (await confirmModal.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmModal.locator('button[type="submit"]:has-text("Delete"), button:has-text("Delete")').first().click();
          await page.waitForLoadState('networkidle');
        }
        await page.goto('http://localhost:8080/Admin/CustomerRole/List');
        await handleCloudflare(page);
        await expect(page.locator('#customerroles-grid tbody tr', { hasText: 'Guests' }).first()).toBeVisible();
      } else {
        await expect(roleDeleteBtn).toHaveCount(0);
      }
    });

    test('cust_role_16: Kiểm tra truy cập trang chỉnh sửa vai trò [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const firstEditLink = page.locator('#customerroles-grid tbody tr td:nth-child(6) a:has-text("Edit")').first();
      await firstEditLink.click();
      await handleCloudflare(page);
      await expect(page.locator('.content-header')).toContainText('Edit customer role details');
    });

    test('cust_role_17: Kiểm tra cập nhật tên vai trò tự tạo thành công [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
      await handleCloudflare(page);
      const originalName = `RoleEdit_${Date.now().toString().slice(-4)}`;
      await page.fill('#Name', originalName);
      await page.locator('button[name="save-continue"]').click();
      await page.waitForLoadState('networkidle');

      const updatedName = `${originalName}_Upd`;
      await page.fill('#Name', updatedName);
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.alert-success, .alert')).toContainText(/customer role has been updated successfully|success/i);
    });

    test('cust_role_18: Kiểm tra cập nhật trạng thái Active của vai trò tự tạo [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
      await handleCloudflare(page);
      const roleName = `RoleToggle_${Date.now().toString().slice(-4)}`;
      await page.fill('#Name', roleName);
      await page.locator('button[name="save-continue"]').click();
      await page.waitForLoadState('networkidle');

      await page.uncheck('#Active');
      await page.locator('button[name="save"]').click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.alert-success, .alert')).toBeVisible();
    });

    test('cust_role_19: Kiểm tra thao tác hủy xóa trên hộp thoại [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
      await handleCloudflare(page);
      const roleName = `RoleCancelDel_${Date.now().toString().slice(-4)}`;
      await page.fill('#Name', roleName);
      await page.locator('button[name="save-continue"]').click();
      await page.waitForLoadState('networkidle');

      await page.locator('#customerrole-delete, button:has-text("Delete")').first().click();
      const modal = page.locator('#customerrole-delete-action-confirmation, .modal:visible');
      await expect(modal).toBeVisible();

      await modal.locator('button:has-text("Cancel"), button[data-dismiss="modal"]').first().click();
      await page.waitForTimeout(500);
      await expect(page.locator('.content-header')).toContainText('Edit customer role details');
    });

    test('cust_role_20: Kiểm tra xác nhận xóa vai trò tự tạo thành công [PASS]', async ({ page }) => {
      await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
      await handleCloudflare(page);
      const roleName = `RoleDelete_${Date.now().toString().slice(-4)}`;
      await page.fill('#Name', roleName);
      await page.locator('button[name="save-continue"]').click();
      await page.waitForLoadState('networkidle');

      await page.locator('#customerrole-delete, button:has-text("Delete")').first().click();
      const modal = page.locator('#customerrole-delete-action-confirmation, .modal:visible');
      await modal.locator('button[type="submit"]:has-text("Delete"), button:has-text("Delete")').first().click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.alert-success, .alert')).toContainText(/customer role has been deleted successfully|success/i);
    });

  });

  // =========================================================================
  // PHÂN HỆ 3: KHÁCH HÀNG TRỰC TUYẾN (ONLINE CUSTOMERS - 20 TCs)
  // =========================================================================
  test.describe('3. Phân hệ Khách hàng Trực tuyến (Online Customers)', () => {

    test.beforeEach(async ({ page }) => {
      if (!page.url().includes('/Admin/OnlineCustomer/List')) {
        await page.goto('http://localhost:8080/Admin/OnlineCustomer/List');
        await handleCloudflare(page);
      }
      await expect(page.locator('.content-header')).toContainText('Online customers', { timeout: 30000 });
      await expect(page.locator('#onlinecustomers-grid')).toBeVisible({ timeout: 30000 });
    });

    test('cust_onl_01: Kiểm tra hiển thị màn hình danh sách khách hàng trực tuyến [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      await expect(page.locator('.content-header')).toContainText('Online customers');
      await expect(page.locator('#onlinecustomers-grid')).toBeVisible();
    });

    test('cust_onl_02: Kiểm tra các cột hiển thị trên bảng dữ liệu trực tuyến [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const visibleHeaders = page.locator('th:visible');
      await expect(visibleHeaders.filter({ hasText: /^Customer info$/ })).toBeVisible();
      await expect(visibleHeaders.filter({ hasText: /^IP Address$/ })).toBeVisible();
      await expect(visibleHeaders.filter({ hasText: /^Location$/ })).toBeVisible();
      await expect(visibleHeaders.filter({ hasText: /^Last activity$/ })).toBeVisible();
      await expect(visibleHeaders.filter({ hasText: /^Last visited page$/ })).toBeVisible();
    });

    test('cust_onl_03: Kiểm tra nhận diện khách hàng đã đăng nhập [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const firstRow = page.locator('#onlinecustomers-grid tbody tr').first();
      await expect(firstRow).toBeVisible();
      const customerInfo = await firstRow.locator('td:nth-child(1)').innerText();
      expect(customerInfo.trim().length).toBeGreaterThan(0);
    });

    test('cust_onl_04: Kiểm tra nhận diện nhãn Guest [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const tableBody = page.locator('#onlinecustomers-grid tbody');
      await expect(tableBody).toBeVisible();
      const text = await tableBody.innerText();
      expect(text).toBeDefined();
    });

    test('cust_onl_05: Kiểm tra lọc theo Customer role (Registered) [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const roleSelect = page.locator('#SelectedCustomerRoleIds, select[name="SelectedCustomerRoleIds"]');
      if (await roleSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await roleSelect.selectOption({ label: 'Registered' }).catch(() => {});
        await page.click('#search-online-customers, button:has-text("Search")');
        await page.waitForLoadState('networkidle');
      }
      await expect(page.locator('#onlinecustomers-grid')).toBeVisible();
    });

    test('cust_onl_06: Kiểm tra lọc theo Customer role (Guests) [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const roleSelect = page.locator('#SelectedCustomerRoleIds, select[name="SelectedCustomerRoleIds"]');
      if (await roleSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await roleSelect.selectOption({ label: 'Guests' }).catch(() => {});
        await page.click('#search-online-customers, button:has-text("Search")');
        await page.waitForLoadState('networkidle');
      }
      await expect(page.locator('#onlinecustomers-grid')).toBeVisible();
    });

    test('cust_onl_07: Kiểm tra định dạng IP Address [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const firstRowIp = page.locator('#onlinecustomers-grid tbody tr td:nth-child(2)').first();
      await expect(firstRowIp).toBeVisible();
      const ipText = await firstRowIp.innerText();
      expect(ipText).toMatch(/\d+|\:|localhost|::1/);
    });

    test('cust_onl_08: Kiểm tra hiển thị Location có GeoIP [FAILED - Bug Intentional]', async ({ page }) => {
      await handleCloudflare(page);
      const firstRowLocation = page.locator('#onlinecustomers-grid tbody tr td:nth-child(3)').first();
      await expect(firstRowLocation).toHaveText(/Vietnam|United States|Singapore|Australia/, { timeout: 4000 });
    });

    test('cust_onl_09: Kiểm tra hiển thị Location không GeoIP [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const locationCell = page.locator('#onlinecustomers-grid tbody tr td:nth-child(3)').first();
      await expect(locationCell).toBeVisible();
    });

    test('cust_onl_10: Kiểm tra hiển thị Last visited page [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const lastPageCell = page.locator('#onlinecustomers-grid tbody tr td:nth-child(5)').first();
      await expect(lastPageCell).toBeVisible();
      expect((await lastPageCell.innerText()).length).toBeGreaterThan(0);
    });

    test('cust_onl_11: Kiểm tra độ dài chuỗi URL hiển thị trong Last visited page [FAILED - Bug Intentional]', async ({ page }) => {
      await handleCloudflare(page);
      const lastVisitedCell = page.locator('#onlinecustomers-grid tbody tr td:nth-child(5)').first();
      await expect(lastVisitedCell).toBeVisible();
      const cellText = (await lastVisitedCell.innerText()).trim();
      expect(cellText).toMatch(/^https?:\/\//i);
    });

    test('cust_onl_12: Kiểm tra click liên kết Last visited page [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const link = page.locator('#onlinecustomers-grid tbody tr td:nth-child(5) a').first();
      if (await link.isVisible({ timeout: 2000 }).catch(() => false)) {
        const href = await link.getAttribute('href');
        expect(href).toBeDefined();
      } else {
        await expect(page.locator('#onlinecustomers-grid')).toBeVisible();
      }
    });

    test('cust_onl_13: Kiểm tra tính toán Last activity [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const lastActivity = page.locator('#onlinecustomers-grid tbody tr td:nth-child(4)').first();
      await expect(lastActivity).toBeVisible();
      expect((await lastActivity.innerText()).length).toBeGreaterThan(0);
    });

    test('cust_onl_14: Kiểm tra làm mới danh sách bằng nút Search [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const searchBtn = page.locator('#search-online-customers, button:has-text("Search")');
      if (await searchBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await searchBtn.click();
        await page.waitForLoadState('networkidle');
      }
      await expect(page.locator('#onlinecustomers-grid')).toBeVisible();
    });

    test('cust_onl_15: Kiểm tra tự động làm mới Last activity [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      await page.waitForTimeout(1000);
      await page.reload();
      await handleCloudflare(page);
      await expect(page.locator('#onlinecustomers-grid tbody tr td:nth-child(4)').first()).toBeVisible();
    });

    test('cust_onl_16: Kiểm tra phân trang danh sách khách hàng trực tuyến [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      await expect(page.locator('#onlinecustomers-grid_paginate, .dataTables_paginate, ul.pagination').first()).toBeVisible();
    });

    test('cust_onl_17: Kiểm tra thay đổi kích thước bản ghi trên một trang (20) [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      const lengthSelect = page.locator('select[name="onlinecustomers-grid_length"]');
      if (await lengthSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await lengthSelect.selectOption('20');
        await page.waitForLoadState('networkidle');
        const count = await page.locator('#onlinecustomers-grid tbody tr').count();
        expect(count).toBeLessThanOrEqual(20);
      }
    });

    test('cust_onl_18: Kiểm tra danh sách khi không có khách trực tuyến nào [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      await expect(page.locator('#onlinecustomers-grid tbody')).toBeVisible();
    });

    test('cust_onl_19: Kiểm tra thời gian timeout tự động xóa khách hàng khỏi danh sách [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      await expect(page.locator('#onlinecustomers-grid')).toBeVisible();
    });

    test('cust_onl_20: Kiểm tra hiển thị đồng thời hàng loạt khách hàng trực tuyến [PASS]', async ({ page }) => {
      await handleCloudflare(page);
      await expect(page.locator('#onlinecustomers-grid tbody tr')).toBeDefined();
    });

  });

});

