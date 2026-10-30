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
    await page.goto('http://localhost:8080/login');
    await handleCloudflare(page);

    const emailInput = page.locator('#Email');
    const adminHeader = page.locator('.content-header');

    // Chờ cho đến khi vượt qua Cloudflare và màn hình Login hoặc Admin xuất hiện
    await expect(emailInput.or(adminHeader)).toBeVisible({ timeout: 30000 });

    // Nếu đang ở trang Login thì thực hiện đăng nhập
    if (await emailInput.isVisible()) {
      await emailInput.fill('admin@yourstore.com');
      await page.fill('#Password', '@Truc27102005');
      await page.locator('button.login-button').click();
      await page.waitForLoadState('networkidle');
    }

    // Điều hướng tới trang Khách hàng nếu chưa ở đúng trang
    if (!page.url().includes('/Admin/Customer/List')) {
      await page.goto('http://localhost:8080/Admin/Customer/List');
      await handleCloudflare(page);
    }

    // Đảm bảo trang Danh sách khách hàng đã sẵn sàng
    await expect(page.locator('.content-header')).toContainText('Customers', { timeout: 30000 });
    await expect(page.locator('#customers-grid')).toBeVisible({ timeout: 30000 });
  });

  // customer_info_management_01: Kiểm tra danh sách khách hàng hiển thị đầy đủ thông tin
  test('customer_info_management_01: Kiểm tra danh sách khách hàng hiển thị đầy đủ thông tin', async ({ page }) => {
    await handleCloudflare(page);
    await expect(page.locator('.content-header')).toContainText('Customers');

    // 1. Kiểm tra tiêu đề bảng có đủ 6 cột thông tin: Email, Name, Customer roles, Company name, Active, Edit
    const visibleHeaders = page.locator('th:visible');
    await expect(visibleHeaders.filter({ hasText: /^Email$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Name$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Customer roles$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Company name$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Active$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Edit$/ })).toBeVisible();

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const rows = page.locator('#customers-grid tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0); // Đảm bảo trong bảng có ít nhất 1 dòng dữ liệu khách hàng

    // 2. Kiểm tra chi tiết dòng đầu tiên (First row):
    // - Email đúng định dạng regex (username@domain.com)
    // - Name & Customer roles không rỗng
    // - Có icon tick xanh Active (fa-check / true-icon)
    // - Có nút Edit hiển thị
    const firstRow = rows.first();
    await expect(firstRow.locator('td:nth-child(2)')).toHaveText(EMAIL_REGEX);
    await expect(firstRow.locator('td:nth-child(3)')).not.toBeEmpty();
    await expect(firstRow.locator('td:nth-child(4)')).not.toBeEmpty();
    await expect(firstRow.locator('td:nth-child(6) i.fa-check, td:nth-child(6) i.true-icon')).toBeVisible(); // Icon tick xanh Active
    await expect(firstRow.locator('td:nth-child(7) a:has-text("Edit")')).toBeVisible(); // Nút Edit

    // 3. Duyệt kiểm tra toàn bộ (HẾT) tất cả các dòng còn lại trong bảng để đảm bảo tính toàn vẹn dữ liệu
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      await expect(row.locator('td:nth-child(2)')).toHaveText(EMAIL_REGEX); // Email đúng chuẩn regex
      await expect(row.locator('td:nth-child(3)')).not.toBeEmpty();         // Name không rỗng
      await expect(row.locator('td:nth-child(4)')).not.toBeEmpty();         // Roles không rỗng
      await expect(row.locator('td:nth-child(6) i')).toBeVisible();         // Cột Active có icon trạng thái (true/false)
      await expect(row.locator('td:nth-child(7) a:has-text("Edit")')).toBeVisible(); // Có nút Edit
    }
  });

  // customer_info_management_02: Kiểm tra tìm kiếm khách hàng theo Email
  test('customer_info_management_02: Kiểm tra tìm kiếm khách hàng theo Email', async ({ page }) => {
    await handleCloudflare(page);
    await page.fill('#SearchEmail', 'steve_gates@nopCommerce.com');
    await page.click('#search-customers');
    await expect(page.locator('#customers-grid tbody tr').first()).toContainText('steve_gates@nopCommerce.com');
  });

  // customer_info_management_03: Kiểm tra tìm kiếm khách hàng theo First name
  test('customer_info_management_03: Kiểm tra tìm kiếm khách hàng theo First name', async ({ page }) => {
    await handleCloudflare(page);
    await page.fill('#SearchEmail', '');
    await page.fill('#SearchFirstName', 'Steve');
    await page.click('#search-customers');
    await expect(page.locator('#customers-grid tbody tr').first()).toContainText('Steve');
  });

  // customer_info_management_04: Kiểm tra tìm kiếm khách hàng theo Last name
  test('customer_info_management_04: Kiểm tra tìm kiếm khách hàng theo Last name', async ({ page }) => {
    await handleCloudflare(page);
    await page.fill('#SearchEmail', '');
    await page.fill('#SearchFirstName', '');
    await page.fill('#SearchLastName', 'Gates');
    await page.click('#search-customers');
    await expect(page.locator('#customers-grid tbody tr').first()).toContainText('Gates');
  });

  // customer_info_management_06: Kiểm tra thêm mới khách hàng thành công
  test('customer_info_management_06: Kiểm tra thêm mới khách hàng thành công', async ({ page }) => {
    await handleCloudflare(page);
    await page.click('a.btn-primary[href*="/Admin/Customer/Create"]');
    await handleCloudflare(page);

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const uniqueEmail = `newcustomer_${Date.now()}@example.com`;
    // Kiểm tra email tạo ra phải đúng chuẩn định dạng email
    expect(uniqueEmail).toMatch(EMAIL_REGEX);

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

  // customer_info_management_07: Kiểm tra thêm khách hàng không nhập Email
  test('customer_info_management_07: Kiểm tra thêm khách hàng không nhập Email', async ({ page }) => {
    await handleCloudflare(page);
    await page.click('a.btn-primary[href*="/Admin/Customer/Create"]');
    await handleCloudflare(page);

    await page.fill('#Password', 'Test@1234');
    await page.click('button[name="save"]');
    await expect(page.locator('.field-validation-error')).toContainText(/must not be empty|required/i);
  });

  // customer_info_management_08: Kiểm tra thêm khách hàng với định dạng Email không hợp lệ
  test('customer_info_management_08: Kiểm tra thêm khách hàng với định dạng Email không hợp lệ', async ({ page }) => {
    await handleCloudflare(page);
    await page.click('a.btn-primary[href*="/Admin/Customer/Create"]');
    await handleCloudflare(page);

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // TH1: Thiếu ký tự @ (không khớp format email)
    const invalidEmail1 = 'linh.nguyen.example.com';
    expect(invalidEmail1).not.toMatch(EMAIL_REGEX);
    await page.fill('#Email', invalidEmail1);
    await page.fill('#Password', 'Test@1234');
    await page.click('button[name="save"]');
    await expect(page.locator('.field-validation-error')).toContainText(/valid email/i);

    // TH2: Thiếu tên miền sau @ (không khớp format email)
    const invalidEmail2 = 'linh@';
    expect(invalidEmail2).not.toMatch(EMAIL_REGEX);
    await page.fill('#Email', invalidEmail2);
    await page.click('button[name="save"]');
    await expect(page.locator('.field-validation-error')).toContainText(/valid email/i);
  });

  // customer_info_management_09: Kiểm tra thêm khách hàng với Email đã tồn tại
  test('customer_info_management_09: Kiểm tra thêm khách hàng với Email đã tồn tại', async ({ page }) => {
    await handleCloudflare(page);
    await page.click('a.btn-primary[href*="/Admin/Customer/Create"]');
    await handleCloudflare(page);

    // Nhập email của Admin đã tồn tại
    await page.fill('#Email', 'admin@yourstore.com');
    await page.fill('#Password', 'Test@1234');
    await page.click('button[name="save"]');

    // Kiểm tra thông báo lỗi trùng email
    await expect(page.locator('.alert-danger, .validation-summary-errors, .field-validation-error')).toContainText(/already registered|already exists|already in use/i);
  });

  // customer_info_management_10: Kiểm tra chỉnh sửa thông tin khách hàng
  test('customer_info_management_10: Kiểm tra chỉnh sửa thông tin khách hàng', async ({ page }) => {
    await handleCloudflare(page);
    await page.click('#customers-grid tbody tr:first-child a.btn-default:has-text("Edit")');
    await handleCloudflare(page);

    await page.fill('#FirstName', 'Updated');
    await page.fill('#Company', 'ABC Co');

    await page.click('button[name="save"]');
    await handleCloudflare(page);
    await expect(page.locator('.alert-success')).toContainText('The customer has been updated successfully.');
  });

  // customer_info_management_11: Kiểm tra xóa khách hàng
  test('customer_info_management_11: Kiểm tra xóa khách hàng', async ({ page }) => {
    await handleCloudflare(page);
    await page.click('#customers-grid tbody tr:first-child a.btn-default:has-text("Edit")');
    await handleCloudflare(page);

    await page.waitForSelector('#customer-delete', { timeout: 30000 });
    // Click Delete để mở modal xác nhận
    await page.click('#customer-delete');

    // Thử click No, cancel trên modal trước
    const cancelBtn = page.locator('#customermodel-Delete-delete-confirmation').getByText('No, cancel');
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await page.waitForTimeout(500);
      await page.click('#customer-delete');
    }

    // Bấm nút Delete trong modal Bootstrap để xác nhận xóa
    await page.locator('#customermodel-Delete-delete-confirmation button[type="submit"]').click();
    await handleCloudflare(page);

    await expect(page.locator('.alert-success')).toContainText('The customer has been deleted successfully.');
  });





});