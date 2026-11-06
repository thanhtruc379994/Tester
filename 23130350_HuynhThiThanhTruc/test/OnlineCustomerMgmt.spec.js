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
test.describe('Quản lý khách hàng trực tuyến (Online Customers) - nopCommerce Test Suite', () => {
  test.beforeEach(async ({ page }) => {
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
    if (!page.url().includes('/Admin/OnlineCustomer/List')) {
      await page.goto('http://localhost:8080/Admin/OnlineCustomer/List');
      await handleCloudflare(page);
    }
    await expect(page.locator('.content-header')).toContainText('Online customers', { timeout: 30000 });
    await expect(page.locator('#onlinecustomers-grid')).toBeVisible({ timeout: 30000 });
  });

  // cus_buy_online_management_01: Kiểm tra danh sách khách hàng trực tuyến hiển thị đầy đủ thông tin
  test('cus_buy_online_management_01: Kiểm tra danh sách khách hàng trực tuyến hiển thị đầy đủ thông tin', async ({ page }) => {
    await handleCloudflare(page);
    await expect(page.locator('.content-header')).toContainText('Online customers');
    const visibleHeaders = page.locator('th:visible');
    await expect(visibleHeaders.filter({ hasText: /^Customer info$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^IP Address$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Location$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Last activity$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Last visited page$/ })).toBeVisible();

    const rows = page.locator('#onlinecustomers-grid tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0); // Có ít nhất 1 khách hàng đang trực tuyến

    // Định dạng IP hợp lệ (IPv4 hoặc IPv6, ví dụ: 192.168.1.1 hoặc ::ffff:172.21.0.1)
    const IP_REGEX = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:::ffff:)?[0-9a-fA-F:.]+$/;

    // Duyệt kiểm tra TOÀN BỘ tất cả các dòng: BẮT BUỘC mọi dòng đều phải có IP hợp lệ, nếu không có hoặc để trống là FAIL
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      await expect(row.locator('td:nth-child(1)')).not.toBeEmpty();       // Customer info không được để trống (Guest hoặc Email)
      await expect(row.locator('td:nth-child(2)')).not.toBeEmpty();       // BẮT BUỘC: IP Address không được để trống
      await expect(row.locator('td:nth-child(2)')).toHaveText(IP_REGEX); // BẮT BUỘC: IP Address phải đúng định dạng IP
      // LỖI HỆ THỐNG (BUG): nopCommerce chưa cấu hình GeoIP nên cột Location luôn bị để trống rỗng -> Test FAILED đúng như kỳ vọng bắt lỗi của Tester
      await expect(row.locator('td:nth-child(3)')).not.toBeEmpty();
      await expect(row.locator('td:nth-child(4)')).not.toBeEmpty();       // Last activity không được để trống
    }
  });

  // cus_buy_online_management_02: Kiểm tra lọc khách hàng trực tuyến theo Customer roles
  test('cus_buy_online_management_02: Kiểm tra lọc khách hàng trực tuyến theo Customer roles', async ({ page }) => {
    await handleCloudflare(page);
    // Lọc khách hàng có vai trò 'Registered' (Id = 2)
    await page.evaluate(() => {
      $('#SelectedCustomerRoleIds').val(['2']).trigger('change');
    });
    await page.click('#search-customers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const registeredRows = page.locator('#onlinecustomers-grid tbody tr');
    const regCount = await registeredRows.count();
    expect(regCount).toBeGreaterThan(0);
    for (let i = 0; i < regCount; i++) {
      const text = await registeredRows.nth(i).locator('td:nth-child(1)').innerText();
      expect(text).toContain('@');
    }
    await page.evaluate(() => {
      $('#SelectedCustomerRoleIds').val(['3']).trigger('change');
    });
    await page.click('#search-customers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const guestRows = page.locator('#onlinecustomers-grid tbody tr');
    const guestCount = await guestRows.count();
    expect(guestCount).toBeGreaterThan(0);
    for (let i = 0; i < guestCount; i++) {
      const text = await guestRows.nth(i).locator('td:nth-child(1)').innerText();
      expect(text).toContain('Guest');
    }
    await page.evaluate(() => {
      $('#SelectedCustomerRoleIds').val([]).trigger('change');
    });
    await page.click('#search-customers');
    await page.waitForLoadState('networkidle');
  });

  // cus_buy_online_management_03: Kiểm tra khách truy cập chưa đăng nhập được hiển thị là Guest
  test('cus_buy_online_management_03: Kiểm tra khách truy cập chưa đăng nhập được hiển thị là Guest', async ({ page }) => {
    await handleCloudflare(page);

    // Mở một phiên trình duyệt độc lập (ẩn danh) chưa đăng nhập và truy cập trang chủ cửa hàng
    const guestContext = await page.context().browser().newContext();
    const guestPage = await guestContext.newPage();
    await guestPage.goto('http://localhost:8080/');
    await guestPage.waitForLoadState('networkidle');
    // Quay lại trang quản trị Online customers và tìm kiếm lại
    await page.goto('http://localhost:8080/Admin/OnlineCustomer/List');
    await handleCloudflare(page);
    await page.click('#search-customers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    //Khách truy cập chưa đăng nhập được hiển thị là 'Guest' trong Customer info và có địa chỉ IP
    const guestRow = page.locator('#onlinecustomers-grid tbody tr', { hasText: 'Guest' }).first();
    await expect(guestRow).toBeVisible();
    const customerInfo = await guestRow.locator('td:nth-child(1)').innerText();
    const ipAddress = await guestRow.locator('td:nth-child(2)').innerText();
    expect(customerInfo.trim()).toBe('Guest');
    expect(ipAddress.trim().length).toBeGreaterThan(0); // Có địa chỉ IP chính xác
    await guestContext.close();
  });
});
