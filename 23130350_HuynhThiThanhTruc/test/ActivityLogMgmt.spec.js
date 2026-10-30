const { test, expect } = require('../../fixtures');

/**
 * Tự động phát hiện và đợi màn hình chống bot Cloudflare kết thúc
 */
async function handleCloudflare(page) {
  const cf = page.locator('text=/Verif.*you are human|Performing security verification|checking your browser|Just a moment/i')
    .or(page.locator('#challenge-running, #challenge-stage'));
  if (await cf.first().isVisible({ timeout: 2500 }).catch(() => false)) {
    console.log('Cloudflare đang kiểm tra bảo mật... Vui lòng đợi...');
    await cf.first().waitFor({ state: 'detached', timeout: 45000 }).catch(() => { });
    await page.waitForTimeout(2000);
  }
}

/**
 * Đảm bảo đã đăng nhập và điều hướng đến trang Activity Log
 */
async function goToActivityLog(page) {
  // Kiểm tra an toàn trạng thái trang hiện tại
  let currentUrl = 'about:blank';
  try {
    currentUrl = page.url();
  } catch (e) {
    currentUrl = 'about:blank';
  }

  // Nếu chưa đăng nhập hoặc trang trắng → thực hiện đăng nhập
  if (currentUrl === 'about:blank' || currentUrl.includes('/login') || !currentUrl.includes('localhost:8080')) {
    await page.goto('http://localhost:8080/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await handleCloudflare(page);
    const emailInput = page.locator('#Email');
    if (await emailInput.isVisible({ timeout: 15000 }).catch(() => false)) {
      await emailInput.fill('admin@yourstore.com');
      await page.fill('#Password', '@Truc27102005');
      await page.locator('button.login-button').click();
      await page.waitForLoadState('networkidle', { timeout: 60000 });
    }
  }

  // Điều hướng đến trang Activity Log
  await page.goto('http://localhost:8080/Admin/ActivityLog/ActivityLogs', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await handleCloudflare(page);
  await expect(page.locator('.content-header')).toContainText('Activity log', { timeout: 60000 });
}

/**
 * Lấy ngày hôm nay theo định dạng M/d/yyyy (ví dụ: 10/29/2026)
 */
function getTodayString() {
  const d = new Date();
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

// Chạy dạng Test Suite: 6 test cases cho module nhật ký hoạt động
test.describe('Quản lý nhật ký hoạt động (Activity Log) - nopCommerce Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000); // Tăng timeout lên 120s cho toàn bộ test (bao gồm beforeEach)
    await goToActivityLog(page);
  });

  // ─────────────────────────────────────────────────────────────────────
  // history_action_management_01: Kiểm tra danh sách hiển thị đầy đủ thông tin
  // ─────────────────────────────────────────────────────────────────────
  test('history_action_management_01: Kiểm tra danh sách nhật ký hoạt động hiển thị đầy đủ thông tin', async ({ page }) => {
    await handleCloudflare(page);

    // 1. Màn hình Activity Log được hiển thị
    await expect(page.locator('.content-header')).toContainText('Activity log');

    // Click [Search] để hiển thị dữ liệu
    await page.click('button#search-activity-log');
    await page.waitForLoadState('networkidle');

    // 2. Danh sách hiển thị đầy đủ các cột: Activity log type, Customer, IP address, Comment/Message, Created on
    const visibleHeaders = page.locator('#activitylog-grid th:visible');
    await expect(visibleHeaders.filter({ hasText: /^Activity log type$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Customer$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^IP address$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Comment$|^Message$/ })).toBeVisible();
    await expect(visibleHeaders.filter({ hasText: /^Created on$/ })).toBeVisible();

    // Kiểm tra có ít nhất 1 bản ghi trong bảng
    const rows = page.locator('#activitylog-grid tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  // ─────────────────────────────────────────────────────────────────────
  // history_action_management_02: Kiểm tra lọc theo khoảng ngày
  // ─────────────────────────────────────────────────────────────────────
  test('history_action_management_02: Kiểm tra lọc nhật ký hoạt động theo khoảng ngày', async ({ page }) => {
    await handleCloudflare(page);
    const today = getTodayString();

    // Bước 1: Đặt Created from = hôm nay, Created to = hôm nay, click [Search]
    await page.fill('#CreatedOnFrom', today);
    await page.fill('#CreatedOnTo', today);
    await page.click('button#search-activity-log');
    await page.waitForLoadState('networkidle');

    // Kỳ vọng 1: Có ít nhất 1 bản ghi được tạo hôm nay
    const rows = page.locator('#activitylog-grid tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Bước 2: Đặt khoảng ngày quá xa trong quá khứ (không có bản ghi), click [Search]
    await page.fill('#CreatedOnFrom', '1/1/2000');
    await page.fill('#CreatedOnTo', '1/1/2000');
    await page.click('button#search-activity-log');
    await page.waitForLoadState('networkidle');

    // Kỳ vọng 2: Không hiển thị bản ghi nào
    await expect(page.locator('#activitylog-grid tbody')).toContainText('No data available in table');

    // Reset bộ lọc
    await page.fill('#CreatedOnFrom', '');
    await page.fill('#CreatedOnTo', '');
  });

  // ─────────────────────────────────────────────────────────────────────
  // history_action_management_03: Kiểm tra lọc theo Activity log type
  // ─────────────────────────────────────────────────────────────────────
  test('history_action_management_03: Kiểm tra lọc nhật ký hoạt động theo Activity log type', async ({ page }) => {
    await handleCloudflare(page);

    // Lấy tất cả option trong dropdown Activity log type
    const activityTypeSelect = page.locator('#ActivityLogTypeId');
    await expect(activityTypeSelect).toBeVisible();
    const options = await activityTypeSelect.locator('option').all();
    expect(options.length).toBeGreaterThan(1); // Phải có ít nhất 1 loại ngoài "All"

    // Lấy option thứ 2 (đầu tiên không phải "All")
    const secondOption = options[1];
    const optionValue = await secondOption.getAttribute('value');
    const optionText = (await secondOption.innerText()).trim();

    // Bước 1: Chọn loại Activity log type cụ thể
    await activityTypeSelect.selectOption(optionValue);

    // Bước 2: Click [Search]
    await page.click('button#search-activity-log');
    await page.waitForLoadState('networkidle');

    // Kỳ vọng: Nếu có bản ghi thì tất cả đều thuộc loại đã chọn
    const rows = page.locator('#activitylog-grid tbody tr');
    const rowCount = await rows.count();
    const tableBody = await page.locator('#activitylog-grid tbody').innerText();

    if (rowCount > 0 && !tableBody.includes('No data available')) {
      // Kiểm tra tối đa 5 dòng đầu đều thuộc đúng loại đã chọn (cột 1 = Activity log type)
      for (let i = 0; i < Math.min(rowCount, 5); i++) {
        const cellText = (await rows.nth(i).locator('td:nth-child(1)').innerText()).trim();
        expect(cellText).toBe(optionText);
      }
    }

    // Reset dropdown về "All"
    await activityTypeSelect.selectOption('0');
  });

  // ─────────────────────────────────────────────────────────────────────
  // history_action_management_04: Kiểm tra lọc theo địa chỉ IP
  // ─────────────────────────────────────────────────────────────────────
  test('history_action_management_04: Kiểm tra lọc nhật ký hoạt động theo địa chỉ IP', async ({ page }) => {
    await handleCloudflare(page);

    // Load toàn bộ dữ liệu để lấy IP thực tế từ bảng
    await page.click('button#search-activity-log');
    await page.waitForLoadState('networkidle');

    const firstRow = page.locator('#activitylog-grid tbody tr').first();
    const ipCell = firstRow.locator('td:nth-child(3)'); // Cột IP address
    const existingIp = (await ipCell.innerText()).trim();

    // Bước 1: Lọc với IP thực tế đã lấy từ bảng
    if (existingIp && !existingIp.toLowerCase().includes('no data')) {
      await page.fill('#IpAddress', existingIp);
      await page.click('button#search-activity-log');
      await page.waitForLoadState('networkidle');

      // Kỳ vọng 1: Tất cả bản ghi trong kết quả phải có IP khớp
      const rows = page.locator('#activitylog-grid tbody tr');
      const count = await rows.count();
      if (count > 0) {
        for (let i = 0; i < Math.min(count, 5); i++) {
          const ip = (await rows.nth(i).locator('td:nth-child(3)').innerText()).trim();
          expect(ip).toContain(existingIp);
        }
      }
    }

    // Bước 2: Lọc IP không tồn tại trong hệ thống
    await page.fill('#IpAddress', '10.255.255.1');
    await page.click('button#search-activity-log');
    await page.waitForLoadState('networkidle');

    // Kỳ vọng 2: Không hiển thị bản ghi nào
    await expect(page.locator('#activitylog-grid tbody')).toContainText('No data available in table');

    // Reset
    await page.fill('#IpAddress', '');
  });

  test('history_action_management_05: Kiểm tra xóa một bản ghi nhật ký hoạt động', async ({ page }) => {
    await handleCloudflare(page);

    // Đảm bảo có dữ liệu để xóa
    await page.click('button#search-activity-log');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('#activitylog-grid tbody tr');
    const countBefore = await rows.count();
    expect(countBefore).toBeGreaterThan(1); // Cần ít nhất 2 bản ghi theo điều kiện tiên quyết

    // Bước 1: Click [Delete] trên bản ghi đầu tiên
    const deleteBtn = rows.first().locator('a:has-text("Delete"), button:has-text("Delete")');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Bước 2: Xác nhận xóa trên hộp thoại xuất hiện
    const confirmDialog = page.locator('.modal.show, [role="dialog"]:visible');
    if (await confirmDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmDialog.locator('button:has-text("Delete"), button[type="submit"]:has-text("Delete")').click();
      await page.waitForLoadState('networkidle');
    }

    // Bước 3: Tải lại danh sách sau khi xóa
    await page.click('button#search-activity-log');
    await page.waitForLoadState('networkidle');

    // Kỳ vọng: Số lượng bản ghi giảm đi 1; các bản ghi khác vẫn còn
    const countAfter = await page.locator('#activitylog-grid tbody tr').count();
    expect(countAfter).toBeLessThan(countBefore);
  });

  // ─────────────────────────────────────────────────────────────────────
  // history_action_management_06: Kiểm tra xóa toàn bộ nhật ký hoạt động (Clear log)
  // ─────────────────────────────────────────────────────────────────────
  test('history_action_management_06: Kiểm tra xóa toàn bộ nhật ký hoạt động (Clear log)', async ({ page }) => {
    await handleCloudflare(page);

    // Đảm bảo có dữ liệu
    await page.click('button#search-activity-log');
    await page.waitForLoadState('networkidle');
    const countBefore = await page.locator('#activitylog-grid tbody tr').count();

    const clearLogBtn = page.locator('button:has-text("Clear log"), a:has-text("Clear log")');
    await expect(clearLogBtn).toBeVisible();

    // ── Bước 1: Click [Clear log] → bấm [Cancel] ──
    await clearLogBtn.click();
    const confirmModal = page.locator('.modal.show, [role="dialog"]:visible');
    if (await confirmModal.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmModal.locator('button:has-text("Cancel"), button.btn-default, button[data-dismiss="modal"]').first().click();
      await page.waitForTimeout(500);
    }

    // Kỳ vọng 1: Bản ghi vẫn còn nguyên, không bị xóa
    await page.click('button#search-activity-log');
    await page.waitForLoadState('networkidle');
    const countAfterCancel = await page.locator('#activitylog-grid tbody tr').count();
    expect(countAfterCancel).toBe(countBefore);

    // ── Bước 2: Click [Clear log] lần nữa → xác nhận xóa ──
    await clearLogBtn.click();
    const confirmModal2 = page.locator('.modal.show, [role="dialog"]:visible');
    if (await confirmModal2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmModal2
        .locator('button:has-text("Delete"), button[type="submit"]:has-text("Delete"), button:has-text("Yes")')
        .first()
        .click();
      await page.waitForLoadState('networkidle');
    }

    // Kỳ vọng 2: Tất cả bản ghi bị xóa, hiển thị "No data available in table"
    await page.click('button#search-activity-log');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#activitylog-grid tbody')).toContainText('No data available in table');
  });

});
