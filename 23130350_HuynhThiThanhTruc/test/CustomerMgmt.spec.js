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

test.describe('Quản lý khách hàng - nopCommerce', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin-demo.nopcommerce.com/login');
    await handleCloudflare(page);

    const emailInput = page.locator('#Email');
    const adminHeader = page.locator('.content-header');

    // Chờ cho đến khi vượt qua Cloudflare và màn hình Login hoặc Admin xuất hiện
    await expect(emailInput.or(adminHeader)).toBeVisible({ timeout: 30000 });

    // Nếu đang ở trang Login thì thực hiện đăng nhập
    if (await emailInput.isVisible()) {
      await emailInput.fill('admin@yourstore.com');
      await page.fill('#Password', 'admin');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/**', { timeout: 30000 });
    }

    // Điều hướng tới trang Khách hàng nếu chưa ở đúng trang
    if (!page.url().includes('/Admin/Customer/List')) {
      await page.goto('https://admin-demo.nopcommerce.com/Admin/Customer/List');
      await handleCloudflare(page);
    }

    // Đảm bảo trang Danh sách khách hàng đã sẵn sàng
    await expect(page.locator('.content-header')).toContainText('Customers', { timeout: 30000 });
    await expect(page.locator('#customers-grid')).toBeVisible({ timeout: 30000 });
  });

  // customer_info_management_01: Kiểm tra danh sách hiển thị
  test('Danh sách khách hàng hiển thị đầy đủ thông tin', async ({ page }) => {
    await handleCloudflare(page);
    await expect(page.locator('.content-header')).toContainText('Customers');
    // Kiểm tra lưới dữ liệu (Grid) hiển thị các cột
    const table = page.locator('#customers-grid');
    await expect(table).toBeVisible();
    await expect(table).toContainText('Email');
    await expect(table).toContainText('Name');
  });

  // customer_info_management_02 & 03 & 04: Kiểm tra tìm kiếm khách hàng
  test('Tìm kiếm khách hàng theo Email, First name, Last name', async ({ page }) => {
    await handleCloudflare(page);
    // Tìm theo Email
    await page.fill('#SearchEmail', 'victoria_victoria@nopCommerce.com');
    await page.click('#search-customers');
    await expect(page.locator('#customers-grid tbody tr').first()).toContainText('victoria_victoria@nopCommerce.com');

    // Tìm theo Name (Xóa email, nhập tên)
    await page.fill('#SearchEmail', '');
    await page.fill('#SearchFirstName', 'Victoria');
    await page.click('#search-customers');
    await expect(page.locator('#customers-grid tbody tr').first()).toContainText('Victoria');
  });

  // customer_info_management_06: Thêm mới khách hàng thành công
  test('Thêm mới khách hàng thành công', async ({ page }) => {
    await handleCloudflare(page);
    await page.click('a.btn-primary[href="/Admin/Customer/Create"]'); // Nút Add new
    await handleCloudflare(page);

    const uniqueEmail = `test_customer_${Date.now()}@example.com`;
    await page.fill('#Email', uniqueEmail);
    await page.fill('#Password', 'Test@1234');
    await page.fill('#FirstName', 'Linh');
    await page.fill('#LastName', 'Nguyen');
    await page.check('#Active');

    await page.click('button[name="save"]');
    await handleCloudflare(page);

    // Xác nhận thông báo thành công
    await expect(page.locator('.alert-success')).toContainText('The new customer has been added successfully.');
  });

  // customer_info_management_07 & 08: Thêm khách hàng với Email trống hoặc sai định dạng
  test('Thêm khách hàng lỗi: Email trống hoặc sai định dạng', async ({ page }) => {
    await handleCloudflare(page);
    await page.click('a[href="/Admin/Customer/Create"]');
    await handleCloudflare(page);

    // Trường hợp để trống Email
    await page.fill('#Password', 'Test@1234');
    await page.click('button[name="save"]');
    await expect(page.locator('.field-validation-error')).toContainText(/must not be empty|required/i);

    // Trường hợp sai định dạng
    await page.fill('#Email', 'linh.nguyen.example.com');
    await page.click('button[name="save"]');
    await expect(page.locator('.field-validation-error')).toContainText(/valid email/i);
  });

  // customer_info_management_10: Chỉnh sửa thông tin khách hàng
  test('Chỉnh sửa thông tin khách hàng', async ({ page }) => {
    await handleCloudflare(page);
    await page.click('#customers-grid tbody tr:first-child a.btn-default:has-text("Edit")');
    await handleCloudflare(page);

    await page.fill('#FirstName', 'UpdatedName');
    await page.fill('#Company', 'ABC Co');

    await page.click('button[name="save"]');
    await handleCloudflare(page);
    await expect(page.locator('.alert-success')).toContainText('The customer has been updated successfully.');
  });

  // customer_info_management_11: Xóa khách hàng
  test('Xóa khách hàng', async ({ page }) => {
    await handleCloudflare(page);
    await page.click('#customers-grid tbody tr:first-child a.btn-default:has-text("Edit")');
    await handleCloudflare(page);

    await page.waitForSelector('#customer-delete', { timeout: 30000 });
    // Click Delete để mở modal xác nhận
    await page.click('#customer-delete');
    // Bấm nút Delete trong modal Bootstrap
    await page.locator('#customermodel-Delete-delete-confirmation button[type="submit"]').click();
    await handleCloudflare(page);

    await expect(page.locator('.alert-success')).toContainText('The customer has been deleted successfully.');
  });
});