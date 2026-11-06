const { test, expect } = require('../../fixtures');
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
test.describe('Quản lý vai trò khách hàng (Customer Roles) - nopCommerce Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    //  Chỉ thực hiện đăng nhập 1 lần duy nhất ở đầu suite nếu chưa đăng nhập
    if (page.url() === 'about:blank' || page.url().includes('/login')) {
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
    // 2. Chuyển đến trang Customer Roles nếu đang ở màn hình khác
    if (!page.url().includes('/Admin/CustomerRole/List') && !page.url().includes('/Admin/CustomerRole/')) {
      await page.goto('http://localhost:8080/Admin/CustomerRole/List');
      await handleCloudflare(page);
    }
    if (page.url().includes('/Admin/CustomerRole/List')) {
      await expect(page.locator('.content-header')).toContainText('Customer roles', { timeout: 30000 });
      await expect(page.locator('#customerroles-grid')).toBeVisible({ timeout: 30000 });
    }
  });

  // cus_role_management_01: Kiểm tra danh sách vai trò khách hàng hiển thị đầy đủ thông tin
  test('cus_role_management_01: Kiểm tra danh sách vai trò khách hàng hiển thị đầy đủ thông tin', async ({ page }) => {
    await handleCloudflare(page);
    await expect(page.locator('.content-header')).toContainText('Customer roles');

    // 1. Kiểm tra tiêu đề bảng có đầy đủ 6 cột thông tin
    const visibleHeaders = page.locator('th:visible');
    await expect(visibleHeaders.filter({ hasText: /^Name$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Free shipping$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Tax exempt$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Active$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Is system role$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Edit$/ })).toBeVisible();

    // Kiểm tra các vai trò mặc định hệ thống đều tồn tại trong danh sách
    const defaultRoles = ['Administrators', 'Forum Moderators', 'Guests', 'Registered', 'Vendors'];
    for (const role of defaultRoles) {
      const row = page.locator('#customerroles-grid tbody tr', { hasText: role });
      await expect(row).toBeVisible();
      await expect(row.locator('a:has-text("Edit")')).toBeVisible();
    }
  });

  // cus_role_management_02: Kiểm tra thêm vai trò khách hàng thành công
  test('cus_role_management_02: Kiểm tra thêm vai trò khách hàng thành công', async ({ page }) => {
    await handleCloudflare(page);

    // Xóa vai trò 'QA Role 01' nếu đã có từ lần chạy trước để đảm bảo tính độc lập
    const existingRole = page.locator('#customerroles-grid tbody tr', { hasText: 'QA Role 01' });
    if (await existingRole.isVisible().catch(() => false)) {
      await existingRole.locator('a:has-text("Edit")').click();
      await page.locator('#customerrole-delete').click();
      await page.locator('#customerrolemodel-Delete-delete-confirmation button[type="submit"]:has-text("Delete")').click();
      await page.waitForLoadState('networkidle');
    }

    await page.click('a.btn-primary[href*="/Admin/CustomerRole/Create"], a:has-text("Add new")');
    await handleCloudflare(page);
    await expect(page.locator('.content-header')).toContainText('Add a new customer role');

    await page.fill('#Name', 'QA Role 01');
    await page.click('button[name="save"]');
    await handleCloudflare(page);
    await expect(page.locator('.alert-success')).toContainText('The new customer role has been added successfully.');
    await expect(page.locator('#customerroles-grid tbody tr', { hasText: 'QA Role 01' })).toBeVisible();
  });

  // cus_role_management_03: Kiểm tra trường Name của vai trò khách hàng khi thêm là bắt buộc
  test('cus_role_management_03: Kiểm tra trường Name của vai trò khách hàng khi thêm là bắt buộc', async ({ page }) => {
    await handleCloudflare(page);
    await page.click('a.btn-primary[href*="/Admin/CustomerRole/Create"], a:has-text("Add new")');
    await handleCloudflare(page);
    await expect(page.locator('.content-header')).toContainText('Add a new customer role');
    await page.fill('#Name', '');
    await page.click('button[name="save"]');
    const errorMsg = page.locator('#Name-error');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText(/Please provide a name/i);

    await page.goto('http://localhost:8080/Admin/CustomerRole/List');
    await handleCloudflare(page);
  });

  // cus_role_management_04: Kiểm tra các thuộc tính của vai trò được lưu đúng
  test('cus_role_management_04: Kiểm tra các thuộc tính của vai trò được lưu đúng', async ({ page }) => {
    await handleCloudflare(page);

    // Xóa vai trò 'QA Role 02' nếu đã có từ lần chạy trước
    const existingRole = page.locator('#customerroles-grid tbody tr', { hasText: 'QA Role 02' });
    if (await existingRole.isVisible().catch(() => false)) {
      await existingRole.locator('a:has-text("Edit")').click();
      await page.locator('#customerrole-delete').click();
      await page.locator('#customerrolemodel-Delete-delete-confirmation button[type="submit"]:has-text("Delete")').click();
      await page.waitForLoadState('networkidle');
    }
    // Click [Add new], nhập Name = 'QA Role 02'
    await page.click('a.btn-primary[href*="/Admin/CustomerRole/Create"], a:has-text("Add new")');
    await handleCloudflare(page);
    await page.fill('#Name', 'QA Role 02');
    await page.locator('#Active').setChecked(true);
    await page.locator('#FreeShipping').setChecked(true);
    await page.locator('#TaxExempt').setChecked(true);
    await page.click('button[name="save-continue"]');
    await handleCloudflare(page);
    // Kiểm tra thông báo thành công và 3 checkbox vẫn được tích trên màn hình chỉnh sửa
    await expect(page.locator('.alert-success')).toContainText(/added successfully|updated successfully/i);
    await expect(page.locator('#Active')).toBeChecked();
    await expect(page.locator('#FreeShipping')).toBeChecked();
    await expect(page.locator('#TaxExempt')).toBeChecked();
    await page.goto('http://localhost:8080/Admin/CustomerRole/List');
    await handleCloudflare(page);
    const row02 = page.locator('#customerroles-grid tbody tr', { hasText: 'QA Role 02' });
    await expect(row02).toBeVisible();

    // Active, Free shipping và Tax exempt hiển thị true (icon check xanh true-icon / fa-check)
    await expect(row02.locator('td:nth-child(2) i.true-icon, td:nth-child(2) i.fa-check')).toBeVisible(); // Free shipping = true
    await expect(row02.locator('td:nth-child(3) i.true-icon, td:nth-child(3) i.fa-check')).toBeVisible(); // Tax exempt = true
    await expect(row02.locator('td:nth-child(4) i.true-icon, td:nth-child(4) i.fa-check')).toBeVisible(); // Active = true

    // Chỉnh sửa vai trò, bỏ tích [Free shipping] và [Tax exempt], click [Save]
    await row02.locator('a:has-text("Edit")').click();
    await handleCloudflare(page);
    await page.locator('#FreeShipping').setChecked(false);
    await page.locator('#TaxExempt').setChecked(false);
    await page.click('button[name="save"]');
    await handleCloudflare(page);

    // Danh sách hiển thị Active = true, Free shipping = false, Tax exempt = false
    const updatedRow = page.locator('#customerroles-grid tbody tr', { hasText: 'QA Role 02' });
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow.locator('td:nth-child(2) i.false-icon, td:nth-child(2) i.fa-times')).toBeVisible(); // Free shipping = false
    await expect(updatedRow.locator('td:nth-child(3) i.false-icon, td:nth-child(3) i.fa-times')).toBeVisible(); // Tax exempt = false
    await expect(updatedRow.locator('td:nth-child(4) i.true-icon, td:nth-child(4) i.fa-check')).toBeVisible();   // Active = true
  });

  // cus_role_management_05: Kiểm tra thiết lập vai trò hệ thống
  test('cus_role_management_05: Kiểm tra thiết lập vai trò hệ thống', async ({ page }) => {
    await handleCloudflare(page);

    // Trên màn hình Customer roles, kiểm tra Is system role:
    // Các vai trò mặc định hiển thị Is system role = true; 'QA Role 01' hiển thị Is system role = false
    const systemRoles = ['Administrators', 'Registered', 'Guests', 'Vendors'];
    for (const role of systemRoles) {
      const row = page.locator('#customerroles-grid tbody tr', { hasText: role });
      await expect(row.locator('td:nth-child(5) i.true-icon, td:nth-child(5) i.fa-check')).toBeVisible();
    }
    const customRow = page.locator('#customerroles-grid tbody tr', { hasText: 'QA Role 01' });
    await expect(customRow.locator('td:nth-child(5) i.false-icon, td:nth-child(5) i.fa-times')).toBeVisible();

    // 2. Mở [Edit] của 'Administrators' và kiểm tra trường [System name] không thể chỉnh sửa
    const adminRow = page.locator('#customerroles-grid tbody tr', { hasText: 'Administrators' });
    await adminRow.locator('a:has-text("Edit")').click();
    await handleCloudflare(page);

    // Kỳ vọng nghiệp vụ: Trường System name của vai trò hệ thống phải bị khóa (disabled) trên giao diện để tránh người dùng sửa nhầm
    // LỖI HỆ THỐNG (BUG): nopCommerce không khóa trường này trên giao diện mà vẫn để ô input mở cho phép nhập -> Test FAILED để báo cáo lỗi
    await expect(page.locator('#SystemName')).toBeDisabled();

    // Quay lại danh sách vai trò
    await page.goto('http://localhost:8080/Admin/CustomerRole/List');
    await handleCloudflare(page);
  });

  // cus_role_management_06: Kiểm tra không thể xóa vai trò hệ thống
  test('cus_role_management_06: Kiểm tra không thể xóa vai trò hệ thống', async ({ page }) => {
    await handleCloudflare(page);

    // Trên màn hình Customer roles, click [Edit] của vai trò 'Guests'
    const guestRow = page.locator('#customerroles-grid tbody tr', { hasText: 'Guests' });
    await guestRow.locator('a:has-text("Edit")').click();
    await handleCloudflare(page);
    await expect(page.locator('.content-header')).toContainText('Edit customer role details');

    // Click nút [Delete] và xác nhận trong popup modal
    const deleteBtn = page.locator('#customerrole-delete');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Xác nhận xóa trong modal
    const modal = page.locator('#customerrolemodel-Delete-delete-confirmation');
    await expect(modal).toBeVisible();
    await modal.locator('button[type="submit"]:has-text("Delete")').click();
    await handleCloudflare(page);
    await expect(page.locator('.alert-danger')).toContainText(/system role could not be deleted/i);

    // Quay lại danh sách vai trò, xác minh vai trò 'Guests' vẫn còn trong danh sách
    await page.goto('http://localhost:8080/Admin/CustomerRole/List');
    await handleCloudflare(page);
    await expect(page.locator('#customerroles-grid tbody tr', { hasText: 'Guests' })).toBeVisible();
  });

});
