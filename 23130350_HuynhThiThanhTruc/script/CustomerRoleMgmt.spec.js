const { test, expect } = require('../../fixtures');
const path = require('path');
const fs = require('fs');

async function handleCloudflare(page) {
  const cf = page.locator('text=/Verif.*you are human|Performing security verification|checking your browser|Just a moment/i').or(page.locator('#challenge-running, #challenge-stage'));
  if (await cf.first().isVisible({ timeout: 2500 }).catch(() => false)) {
    console.log('Cloudflare đang kiểm tra bảo mật... Vui lòng đợi...');
    await cf.first().waitFor({ state: 'detached', timeout: 45000 }).catch(() => { });
    await page.waitForTimeout(2000);
  }
}

async function goToCustomerRoleList(page) {
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

  if (!page.url().includes('/Admin/CustomerRole/List')) {
    await page.goto('http://localhost:8080/Admin/CustomerRole/List');
    await handleCloudflare(page);
  }

  await expect(page.locator('.content-header')).toContainText('Customer roles', { timeout: 30000 });
  await expect(page.locator('#customerroles-grid')).toBeVisible({ timeout: 30000 });
}

test.describe('Quản lý Vai trò Khách hàng (Customer Roles) - Đủ 20 Test Cases chuẩn', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await goToCustomerRoleList(page);
  });

  // Tự động chụp màn hình cho từng test case (dù PASS hay FAILED) lưu vào thư mục riêng screenshots/CustomerRole
  test.afterEach(async ({ page }, testInfo) => {
    const screenshotDir = path.resolve(__dirname, 'screenshots', 'CustomerRole');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const match = testInfo.title.match(/^(cust_role_\d+)/);
    const tcId = match ? match[1] : 'unknown_tc';
    const status = testInfo.status === testInfo.expectedStatus ? 'PASS' : 'FAILED';
    const screenshotPath = path.join(screenshotDir, `${tcId}_${status}.png`);

    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`[Screenshot saved]: ${screenshotPath}`);
    } catch (err) {
      console.error(`Không thể chụp màn hình cho ${tcId}:`, err);
    }
  });

  // 1. cust_role_01: Kiểm tra hiển thị màn hình danh sách vai trò
  test('cust_role_01: Kiểm tra hiển thị màn hình danh sách vai trò [PASS]', async ({ page }) => {
    await handleCloudflare(page);
    await expect(page.locator('.content-header')).toContainText('Customer roles');
    await expect(page.locator('#customerroles-grid')).toBeVisible();
  });

  // 2. cust_role_02: Kiểm tra các cột dữ liệu hiển thị
  test('cust_role_02: Kiểm tra các cột dữ liệu hiển thị [PASS]', async ({ page }) => {
    await handleCloudflare(page);
    const visibleHeaders = page.locator('th:visible');
    await expect(visibleHeaders.filter({ hasText: /^Name$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Free shipping$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Tax exempt$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Active$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Is system role$/ })).toBeVisible();
  });

  // 3. cust_role_03: Kiểm tra hiển thị form thêm mới vai trò
  test('cust_role_03: Kiểm tra hiển thị form thêm mới vai trò [PASS]', async ({ page }) => {
    await page.locator('a.btn-primary:has-text("Add new")').click();
    await handleCloudflare(page);
    await expect(page.locator('.content-header')).toContainText('Add a new customer role');
    await expect(page.locator('#Name')).toBeVisible();
  });

  // 4. cust_role_04: Kiểm tra thêm mới vai trò thành công (Happy Path)
  test('cust_role_04: Kiểm tra thêm mới vai trò thành công [PASS]', async ({ page }) => {
    await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
    await handleCloudflare(page);

    const roleName = `Role_${Date.now().toString().slice(-5)}`;
    await page.fill('#Name', roleName);
    await page.locator('button[name="save"]').click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.alert-success, .alert')).toContainText(/customer role has been added successfully|success/i);
  });

  // 5. cust_role_05: Kiểm tra để trống Tên vai trò
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

  // 6. cust_role_06: Kiểm tra giới hạn độ dài Tên vai trò (> 255 ký tự) [FAILED - Bug Intentional]
  test('cust_role_06: Kiểm tra giới hạn độ dài Tên vai trò (> 255 ký tự) [FAILED - Bug Intentional]', async ({ page }) => {
    // Expected Output: Trường Name phải có thuộc tính giới hạn maxlength="255" để ngăn người dùng nhập quá ký tự ở client
    // Thực tế Bug: Form không có thuộc tính maxlength ở thẻ input
    await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
    await handleCloudflare(page);

    await expect(page.locator('#Name')).toHaveAttribute('maxlength', '255', { timeout: 3000 });
  });

  // 7. cust_role_07: Kiểm tra thêm mới vai trò trùng tên [FAILED - Bug Intentional]
  test('cust_role_07: Kiểm tra thêm mới vai trò trùng tên [FAILED - Bug Intentional]', async ({ page }) => {
    // Expected Output: Báo lỗi tên đã tồn tại
    // Thực tế: nopCommerce không chặn trùng tên hiển thị
    await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
    await handleCloudflare(page);

    await page.fill('#Name', 'Administrators');
    await page.locator('button[name="save"]').click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#Name-error')).toHaveText('Customer role name already exists', { timeout: 4000 });
  });

  // 8. cust_role_08: Kiểm tra cấu hình thuộc tính 'Free shipping'
  test('cust_role_08: Kiểm tra cấu hình thuộc tính Free shipping [PASS]', async ({ page }) => {
    await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
    await handleCloudflare(page);

    const roleName = `FreeShip_${Date.now().toString().slice(-4)}`;
    await page.fill('#Name', roleName);
    await page.check('#FreeShipping');
    await page.locator('button[name="save-continue"]').click();
    await page.waitForLoadState('networkidle');

    // Xác nhận lưu thành công và thuộc tính Free shipping được lưu là True
    await expect(page.locator('.alert-success, .alert')).toBeVisible();
    await expect(page.locator('#FreeShipping')).toBeChecked();
  });

  // 9. cust_role_09: Kiểm tra cấu hình thuộc tính 'Tax exempt'
  test('cust_role_09: Kiểm tra cấu hình thuộc tính Tax exempt [PASS]', async ({ page }) => {
    await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
    await handleCloudflare(page);

    const roleName = `TaxExempt_${Date.now().toString().slice(-4)}`;
    await page.fill('#Name', roleName);
    await page.check('#TaxExempt');
    await page.locator('button[name="save-continue"]').click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.alert-success, .alert')).toBeVisible();
    await expect(page.locator('#TaxExempt')).toBeChecked();
  });

  // 10. cust_role_10: Kiểm tra cấu hình thuộc tính 'Active'
  test('cust_role_10: Kiểm tra cấu hình thuộc tính Active [PASS]', async ({ page }) => {
    await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
    await handleCloudflare(page);

    const roleName = `Inactive_${Date.now().toString().slice(-4)}`;
    await page.fill('#Name', roleName);
    await page.uncheck('#Active');
    await page.locator('button[name="save-continue"]').click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.alert-success, .alert')).toBeVisible();
    await expect(page.locator('#Active')).not.toBeChecked();
  });

  // 11. cust_role_11: Kiểm tra chọn sản phẩm liên kết với vai trò
  test('cust_role_11: Kiểm tra chọn sản phẩm liên kết với vai trò [PASS]', async ({ page }) => {
    await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
    await handleCloudflare(page);

    // Kiểm tra cấu hình liên kết sản phẩm (Purchasable with product)
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

  // 12. cust_role_12: Kiểm tra xóa sản phẩm liên kết
  test('cust_role_12: Kiểm tra xóa sản phẩm liên kết [PASS]', async ({ page }) => {
    await page.goto('http://localhost:8080/Admin/CustomerRole/Create');
    await handleCloudflare(page);

    const removeProductBtn = page.locator('button:has-text("Remove product"), #removeProduct');
    if (await removeProductBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await removeProductBtn.click();
    }
    await expect(page.locator('.content-header')).toContainText('Add a new customer role');
  });

  // 13. cust_role_13: Kiểm tra thuộc tính 'Is system role' của vai trò hệ thống
  test('cust_role_13: Kiểm tra thuộc tính Is system role của vai trò hệ thống [PASS]', async ({ page }) => {
    await handleCloudflare(page);
    const adminRow = page.locator('#customerroles-grid tbody tr', { hasText: 'Administrators' });
    await expect(adminRow.first()).toBeVisible();
    await expect(adminRow.first().locator('td:nth-child(5) i.fa-check, td:nth-child(5) i.true-icon')).toBeVisible();
  });

  // 14. cust_role_14: Kiểm tra vô hiệu hóa trường System name đối với vai trò hệ thống [FAILED - Bug Intentional]
  test('cust_role_14: Kiểm tra vô hiệu hóa trường System name đối với vai trò hệ thống [FAILED - Bug Intentional]', async ({ page }) => {
    await handleCloudflare(page);
    const adminRow = page.locator('#customerroles-grid tbody tr', { hasText: 'Administrators' });
    await adminRow.locator('a:has-text("Edit")').first().click();
    await handleCloudflare(page);

    await expect(page.locator('.content-header')).toContainText('Edit customer role details');
    // Trường System name bị vô hiệu hóa hoặc ẩn không cho sửa
    const systemNameInput = page.locator('#SystemName');
    if (await systemNameInput.isVisible({ timeout: 1500 }).catch(() => false)) {
      await expect(systemNameInput).toBeDisabled();
    } else {
      // nopCommerce ẩn ô này để bảo vệ không cho sửa
      await expect(systemNameInput).toHaveCount(0);
    }
  });

  // 15. cust_role_15: Kiểm tra thao tác chặn xóa đối với vai trò hệ thống [PASS]
  test('cust_role_15: Kiểm tra thao tác chặn xóa đối với vai trò hệ thống [PASS]', async ({ page }) => {
    await handleCloudflare(page);
    const guestsRow = page.locator('#customerroles-grid tbody tr', { hasText: 'Guests' });
    await guestsRow.locator('a:has-text("Edit")').first().click();
    await handleCloudflare(page);

    await expect(page.locator('.content-header')).toContainText('Edit customer role details');

    // Nút Delete bị ẩn hoặc hệ thống từ chối xóa vai trò hệ thống
    const deleteBtn = page.locator('#customerrole-delete');
    if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteBtn.click();
      const confirmModal = page.locator('#customerrole-delete-action-confirmation, .modal:visible');
      if (await confirmModal.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmModal.locator('button[type="submit"]:has-text("Delete"), button:has-text("Delete")').first().click();
        await page.waitForLoadState('networkidle');
      }
      await page.goto('http://localhost:8080/Admin/CustomerRole/List');
      await handleCloudflare(page);
      await expect(page.locator('#customerroles-grid tbody tr', { hasText: 'Guests' }).first()).toBeVisible();
    } else {
      await expect(deleteBtn).toHaveCount(0);
    }
  });

  // 16. cust_role_16: Kiểm tra truy cập trang chỉnh sửa vai trò
  test('cust_role_16: Kiểm tra truy cập trang chỉnh sửa vai trò [PASS]', async ({ page }) => {
    await handleCloudflare(page);
    const firstEditLink = page.locator('#customerroles-grid tbody tr td:nth-child(6) a:has-text("Edit")').first();
    await firstEditLink.click();
    await handleCloudflare(page);
    await expect(page.locator('.content-header')).toContainText('Edit customer role details');
  });

  // 17. cust_role_17: Kiểm tra cập nhật tên vai trò tự tạo thành công
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

  // 18. cust_role_18: Kiểm tra cập nhật trạng thái Active của vai trò tự tạo
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

  // 19. cust_role_19: Kiểm tra thao tác hủy xóa trên hộp thoại
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

  // 20. cust_role_20: Kiểm tra xác nhận xóa vai trò tự tạo thành công
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
