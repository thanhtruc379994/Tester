const { test, expect } = require('../../fixtures');
const MUTATE = process.env.RUN_MUTATIONS === '1';
const fixture = (key) => process.env[key];

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

async function handleCloudflare(page) {
    const cf = page.locator('text=/Verif.*you are human|Performing security verification|checking your browser|Just a moment/i').or(page.locator('#challenge-running, #challenge-stage'));
    if (await cf.first().isVisible({ timeout: 2500 }).catch(() => false)) {
        console.log('\n⚠️  [Cloudflare] Đang kiểm tra bảo mật ("Verify you are human")...');
        console.log('👉 Nếu xuất hiện ô checkbox, bạn hãy dùng chuột click vào ô "Verify you are human" trên cửa sổ Chrome.');

        // Không tự click bằng Playwright vì Cloudflare sẽ phát hiện bot và lặp vô tận
        await cf.first().waitFor({ state: 'detached', timeout: 45000 }).catch(() => { });
        await page.waitForTimeout(2000);
    }
}

async function login(page) {
    // Nếu trình duyệt đã ở sẵn trong Admin từ test case trước thì bỏ qua, không load lại
    if (page.url().includes('/Admin') && !page.url().includes('/login')) {
        return;
    }

    await page.goto(`${BASE_URL}/Admin`);
    await handleCloudflare(page);

    // Kiểm tra xem đã thực sự vào được trang Admin chưa (có sidebar quản trị)
    const isDashboard = await page.locator('.main-sidebar, .brand-link, .nav-sidebar').isVisible({ timeout: 5000 }).catch(() => false);
    if (isDashboard) {
        return;
    }

    if (await page.locator('#Email').isVisible({ timeout: 3000 }).catch(() => false)) {
        await page.locator('#Email').fill('admin@yourstore.com');
        await page.locator('#Password').fill('Doanga123@');

        await page.locator('button.login-button, button[type="submit"]:has-text("Log in")').first().click();

        await handleCloudflare(page);

        await page.waitForURL(/\/Admin/i, {
            timeout: 60000
        });
    }
}

async function openList(page, section) {
    const url = { ord: '/Admin/Order/List', ship: '/Admin/Order/ShipmentList', gc: '/Admin/GiftCard/List' }[section];
    await page.goto(BASE_URL + url);
    await handleCloudflare(page);
    await expect(page).toHaveURL(/\/Admin\//i);
}

const ids = {
    ord: { grid: '#orders-grid', search: '#search-orders' },
    ship: { grid: '#shipments-grid', search: '#search-shipments' },
    gc: { grid: '#giftcards-grid', search: '#search-giftcards' }
};

async function grid(page) {
    await handleCloudflare(page);
    console.log('URL hiện tại:', page.url());

    // Đợi bảng grid hiển thị (chờ Cloudflare redirect xong nếu có)
    await expect(
        page.locator('#orders-grid')
    ).toBeVisible({ timeout: 30000 });

    await page.screenshot({
        path: 'orders-debug.png',
        fullPage: true
    });
}

async function search(page, section) {
    await page.locator(ids[section].search).click();
    await grid(page, section);
}

async function fill(page, selectors, value) {
    let l = page.locator(selectors).first();
    await expect(l).toBeVisible();

    // Nếu là ô nhập ngày tháng HTML5 (type=date), bắt buộc phải có định dạng YYYY-MM-DD
    const type = await l.getAttribute('type').catch(() => 'text');
    if (type === 'date' || type === 'datetime-local') {
        const parts = value.split('/');
        if (parts.length === 3) {
            value = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
    }
    await l.fill(value);
}

async function choose(page, selector, label) {
    await page.locator(selector).selectOption({ label });
}

async function clearDates(page) {
    const start = page.locator('#StartDate');
    const end = page.locator('#EndDate');
    if (await start.isVisible().catch(() => false)) await start.fill('');
    if (await end.isVisible().catch(() => false)) await end.fill('');
}

async function empty(page, section) {
    await expect(page.locator(ids[section].grid)).toContainText(/No data available|No matching records|Không có dữ liệu/i);
}

async function firstDetail(page, section) {
    const link = page.locator(`${ids[section].grid} a[href*="Edit"], ${ids[section].grid} a[href*="Details"], ${ids[section].grid} a[href*="Shipment"]`).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/(Edit|Details|Shipment)/i);
}

async function nextPage(page, section) {
    const next = page.locator(`.pagination .next, .pagination .page-item:has(.next), ${ids[section].grid}_next`).first();
    await expect(next).not.toHaveClass(/disabled/);
    await next.click();
}

async function download(page, action, extension) {
    const [d] = await Promise.all([page.waitForEvent('download'), action()]);
    expect(d.suggestedFilename().toLowerCase()).toMatch(new RegExp('\\.' + extension + '$'));
}


let isInitialLoggedIn = false;

test.describe('Admin - Orders', () => {

    test.setTimeout(120000);

    test.beforeEach(async ({ page }) => {
        // Chỉ thực hiện đăng nhập 1 lần duy nhất từ đầu cho tất cả các test case
        if (!isInitialLoggedIn) {
            await login(page);
            isInitialLoggedIn = true;
        }
    });

    // admin_ord_01: Kiểm tra hiển thị màn hình danh sách đơn hàng khi click [admin > Orders]
    // Procedure: Pre-condition:
    // + Đăng nhập tài khoản Quản trị viên (Admin).
    // 
    // Step:
    // 1. Tại thanh menu bên trái, click chọn [admin]
    // 2. Click chọn mục con [Orders]
    // Expected: 1. Màn hình Quản lý đơn hàng hiển thị chính xác.
    // 2. Khung lọc tìm kiếm, các nút chức năng và bảng dữ liệu hiển thị đúng chuẩn GUI.
    test('admin_ord_01 - Kiểm tra hiển thị màn hình danh sách đơn hàng khi click [admin > Orders]', async ({ page }) => {
        await openList(page, 'ord');
        await grid(page, 'ord');
    });

    // admin_ord_02: Kiểm tra trạng thái hiển thị mặc định của bảng đơn hàng
    // Procedure: Step:
    // 1. Mở màn hình Orders
    // 2. Quan sát các tiêu chí lọc mặc định và bảng danh sách
    // Expected: 1. Các dropdown trạng thái hiển thị mặc định là 'All'.
    // 2. Bảng dữ liệu hiển thị danh sách toàn bộ các đơn hàng hiện có trong hệ thống.
    test('admin_ord_02 - Kiểm tra trạng thái hiển thị mặc định của bảng đơn hàng', async ({ page }) => {
        await openList(page, 'ord');
        await grid(page, 'ord');

        // 1. Các dropdown trạng thái hiển thị mặc định là 'All'
        await expect(page.locator('#OrderStatusIds option:checked')).toHaveText('All');
        await expect(page.locator('#PaymentStatusIds option:checked')).toHaveText('All');
        await expect(page.locator('#ShippingStatusIds option:checked')).toHaveText('All');

        // 2. Bảng dữ liệu hiển thị danh sách toàn bộ các đơn hàng hiện có trong hệ thống
        const rows = page.locator('#orders-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        expect(await rows.count()).toBeGreaterThan(0);
    });

    // admin_ord_03: Kiểm tra bố cục và các cột dữ liệu trên bảng đơn hàng
    // Procedure: Step:
    // 1. Quan sát hàng tiêu đề của bảng dữ liệu đơn hàng
    // Expected: 1. Bảng hiển thị đầy đủ các cột: Mã đơn (Order #), Trạng thái đơn (Order status), Trạng thái thanh toán (Payment status), Trạng thái giao hàng (Shipping status), Khách hàng (Customer), Cửa hàng (Store), Ngày tạo (Created on), Tổng tiền (Order total), Nút xem (View).
    test('admin_ord_03 - Kiểm tra bố cục và các cột dữ liệu trên bảng đơn hàng', async ({ page }) => {
        await openList(page, 'ord');
        await grid(page, 'ord');

        const thead = page.locator('#orders-grid thead');
        const expectedColumns = [
            'Order #',
            'Order status',
            'Payment status',
            'Shipping status',
            'Customer',
            'Created on',
            'Order total',
            'View'
        ];

        for (const col of expectedColumns) {
            await expect(thead).toContainText(col);
        }
    });

    // admin_ord_04: Kiểm tra lọc đơn hàng với khoảng ngày hợp lệ (Từ ngày <= Đến ngày)
    // Procedure: Step:
    // 1. Chọn Start date = '2026-10-01'
    // 2. Chọn End date = '2026-10-20'
    // 3. Click nút [Search]
    // Expected: 1. Danh sách chỉ hiển thị các đơn hàng được tạo trong khoảng từ 2026-10-01 00:00:00 đến 2026-10-20 23:59:59.
    test('admin_ord_04 - Kiểm tra lọc đơn hàng với khoảng ngày hợp lệ (Từ ngày <= Đến ngày)', async ({ page }) => {
        await openList(page, 'ord');
        await fill(page, '#StartDate', '2026-10-01');
        await fill(page, '#EndDate', '2026-10-20');
        await search(page, 'ord');
    });

    // admin_ord_05: Kiểm tra lọc đơn hàng với khoảng ngày không hợp lệ (Từ ngày > Đến ngày)
    // Procedure: Step:
    // 1. Chọn Start date = '2026-10-20'
    // 2. Chọn End date = '2026-10-01'
    // 3. Click nút [Search]
    // Expected: 1. Hệ thống hiển thị cảnh báo khoảng ngày không hợp lệ.
    // 2. Bảng dữ liệu hiển thị 'No data available in table'.
    test('admin_ord_05 - Kiểm tra lọc đơn hàng với khoảng ngày không hợp lệ (Từ ngày > Đến ngày)', async ({ page }) => {
        await openList(page, 'ord');
        await fill(page, '#StartDate', '2026-10-20');
        await fill(page, '#EndDate', '2026-10-01');
        await search(page, 'ord');

        // 1. Kiểm tra hệ thống hiển thị cảnh báo khoảng ngày không hợp lệ (nếu web không bắt lỗi thì test sẽ FAIL đúng theo Expected)
        await expect(page.locator('.alert-danger, .field-validation-error, .text-danger, #validation-error')).toBeVisible({ timeout: 5000 });

        // 2. Bảng dữ liệu hiển thị 'No data available in table'
        await empty(page, 'ord');
    });

    // admin_ord_06: Kiểm tra lọc đơn hàng khi chỉ nhập Từ ngày (Start date)
    // Procedure: Step:
    // 1. Nhập Start date = '2026-10-01'
    // 2. Để trống End date
    // 3. Click nút [Search]
    // Expected: 1. Danh sách hiển thị tất cả các đơn hàng được tạo từ ngày 2026-10-01 trở về sau.
    test('admin_ord_06 - Kiểm tra lọc đơn hàng khi chỉ nhập Từ ngày (Start date)', async ({ page }) => {
        await openList(page, 'ord');
        await fill(page, '#StartDate', '2026-10-01');
        await page.locator('#EndDate').fill('');
        await search(page, 'ord');
    });

    // admin_ord_07: Kiểm tra lọc đơn hàng khi chỉ nhập Đến ngày (End date)
    // Procedure: Step:
    // 1. Để trống Start date
    // 2. Nhập End date = '2026-10-20'
    // 3. Click nút [Search]
    // Expected: 1. Danh sách hiển thị tất cả các đơn hàng được tạo trước hoặc trong ngày 2026-10-20.
    test('admin_ord_07 - Kiểm tra lọc đơn hàng khi chỉ nhập Đến ngày (End date)', async ({ page }) => {
        await openList(page, 'ord');
        await page.locator('#StartDate').fill('');
        await fill(page, '#EndDate', '2026-10-20');
        await search(page, 'ord');
    });

    // admin_ord_08: Kiểm tra lọc đơn hàng theo Order status = 'Pending'
    // Procedure: Step:
    // 1. Chọn Order status = [Pending]
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu chỉ lọc các đơn hàng có trạng thái là 'Pending'.
    test('admin_ord_08 - Kiểm tra lọc đơn hàng theo Order status = ’Pending’', async ({ page }) => {
        await openList(page, 'ord');
        await clearDates(page);
        await choose(page, '#OrderStatusIds', 'Pending');
        await search(page, 'ord');
        const rows = page.locator('#orders-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        for (const row of await rows.all()) await expect(row).toContainText('Pending');
    });

    // admin_ord_09: Kiểm tra lọc đơn hàng theo Order status = 'Processing'
    // Procedure: Step:
    // 1. Chọn Order status = [Processing]
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu chỉ hiển thị các đơn hàng đang xử lý có trạng thái 'Processing'.
    test('admin_ord_09 - Kiểm tra lọc đơn hàng theo Order status = ’Processing’', async ({ page }) => {
        await openList(page, 'ord');
        await choose(page, '#OrderStatusIds', 'Processing');
        await search(page, 'ord');
        const rows = page.locator('#orders-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        for (const row of await rows.all()) await expect(row).toContainText('Processing');
    });

    // admin_ord_10: Kiểm tra lọc đơn hàng theo Order status = 'Complete'
    // Procedure: Step:
    // 1. Chọn Order status = [Complete]
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu chỉ hiển thị các đơn hàng đã hoàn tất (Complete) với nhãn màu xanh lá.
    test('admin_ord_10 - Kiểm tra lọc đơn hàng theo Order status = ’Complete’', async ({ page }) => {
        await openList(page, 'ord');
        await choose(page, '#OrderStatusIds', 'Complete');
        await search(page, 'ord');
        const rows = page.locator('#orders-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        for (const row of await rows.all()) await expect(row).toContainText('Complete');
    });

    // admin_ord_11: Kiểm tra lọc đơn hàng theo Order status = 'Cancelled'
    // Procedure: Step:
    // 1. Chọn Order status = [Cancelled]
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu chỉ hiển thị các đơn hàng đã bị hủy (Cancelled).
    test('admin_ord_11 - Kiểm tra lọc đơn hàng theo Order status = ’Cancelled’', async ({ page }) => {
        await openList(page, 'ord');
        await choose(page, '#OrderStatusIds', 'Cancelled');
        await search(page, 'ord');
        const rows = page.locator('#orders-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        for (const row of await rows.all()) await expect(row).toContainText('Cancelled');
    });

    // admin_ord_12: Kiểm tra lọc đơn hàng theo Payment status = 'Pending'
    // Procedure: Step:
    // 1. Chọn Payment status = [Pending]
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu chỉ hiển thị các đơn hàng chưa thực hiện thanh toán ('Pending').
    test('admin_ord_12 - Kiểm tra lọc đơn hàng theo Payment status = ’Pending’', async ({ page }) => {
        await openList(page, 'ord');
        await choose(page, '#PaymentStatusIds', 'Pending');
        await search(page, 'ord');
        const rows = page.locator('#orders-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        for (const row of await rows.all()) await expect(row).toContainText('Pending');
    });

    // admin_ord_13: Kiểm tra lọc đơn hàng theo Payment status = 'Authorized'
    // Procedure: Step:
    // 1. Chọn Payment status = [Authorized]
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu chỉ hiển thị các đơn hàng đã được tổ chức thanh toán xác thực giao dịch ('Authorized').
    test('admin_ord_13 - Kiểm tra lọc đơn hàng theo Payment status = ’Authorized’', async ({ page }) => {
        await openList(page, 'ord');
        await choose(page, '#PaymentStatusIds', 'Authorized');
        await search(page, 'ord');
        const rows = page.locator('#orders-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        for (const row of await rows.all()) await expect(row).toContainText('Authorized');
    });

    // admin_ord_14: Kiểm tra lọc đơn hàng theo Payment status = 'Paid'
    // Procedure: Step:
    // 1. Chọn Payment status = [Paid]
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu chỉ hiển thị các đơn hàng đã thanh toán thành công ('Paid').
    test('admin_ord_14 - Kiểm tra lọc đơn hàng theo Payment status = ’Paid’', async ({ page }) => {
        await openList(page, 'ord');
        await choose(page, '#PaymentStatusIds', 'Paid');
        await search(page, 'ord');
        const rows = page.locator('#orders-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        for (const row of await rows.all()) await expect(row).toContainText('Paid');
    });

    // admin_ord_15: Kiểm tra lọc đơn hàng theo Payment status = 'Refunded'
    // Procedure: Step:
    // 1. Chọn Payment status = [Refunded]
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu chỉ hiển thị các đơn hàng đã hoàn tiền toàn phần ('Refunded').
    test('admin_ord_15 - Kiểm tra lọc đơn hàng theo Payment status = ’Refunded’', async ({ page }) => {
        await openList(page, 'ord');
        await choose(page, '#PaymentStatusIds', 'Refunded');
        await search(page, 'ord');
        const rows = page.locator('#orders-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        for (const row of await rows.all()) await expect(row).toContainText('Refunded');
    });

    // admin_ord_16: Kiểm tra lọc đơn hàng theo Payment status = 'Voided'
    // Procedure: Step:
    // 1. Chọn Payment status = [Voided]
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu chỉ hiển thị các đơn hàng đã hủy bỏ giao dịch thanh toán ('Voided').
    test('admin_ord_16 - Kiểm tra lọc đơn hàng theo Payment status = ’Voided’', async ({ page }) => {
        await openList(page, 'ord');
        await choose(page, '#PaymentStatusIds', 'Voided');
        await search(page, 'ord');
        const rows = page.locator('#orders-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        for (const row of await rows.all()) await expect(row).toContainText('Voided');
    });

    // admin_ord_17: Kiểm tra lọc đơn hàng theo Payment status = 'Partially Refunded'
    // Procedure: Step:
    // 1. Chọn Payment status = [Partially Refunded]
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu chỉ hiển thị các đơn hàng được hoàn trả tiền một phần.
    test('admin_ord_17 - Kiểm tra lọc đơn hàng theo Payment status = ’Partially Refunded’', async ({ page }) => {
        await openList(page, 'ord');
        await choose(page, '#PaymentStatusIds', 'Partially refunded');
        await search(page, 'ord');
        const rows = page.locator('#orders-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        for (const row of await rows.all()) await expect(row).toContainText('Partially refunded');
    });

    // admin_ord_18: Kiểm tra lọc đơn hàng theo Shipping status = 'Not yet shipped'
    // Procedure: Step:
    // 1. Chọn Shipping status = [Not yet shipped]
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu chỉ hiển thị các đơn hàng chưa đóng gói xuất kho giao hàng.
    test('admin_ord_18 - Kiểm tra lọc đơn hàng theo Shipping status = ’Not yet shipped’', async ({ page }) => {
        await openList(page, 'ord');
        await choose(page, '#ShippingStatusIds', 'Not yet shipped');
        await search(page, 'ord');
        const rows = page.locator('#orders-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        for (const row of await rows.all()) await expect(row).toContainText('Not yet shipped');
    });

    // admin_ord_19: Kiểm tra lọc đơn hàng theo Shipping status = 'Shipped'
    // Procedure: Step:
    // 1. Chọn Shipping status = [Shipped]
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu chỉ hiển thị các đơn hàng đang trên đường vận chuyển.
    test('admin_ord_19 - Kiểm tra lọc đơn hàng theo Shipping status = ’Shipped’', async ({ page }) => {
        await openList(page, 'ord');
        await choose(page, '#ShippingStatusIds', 'Shipped');
        await search(page, 'ord');
        const rows = page.locator('#orders-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        for (const row of await rows.all()) await expect(row).toContainText('Shipped');
    });

    // admin_ord_20: Kiểm tra lọc đơn hàng theo Shipping status = 'Delivered'
    // Procedure: Step:
    // 1. Chọn Shipping status = [Delivered]
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu chỉ hiển thị các đơn hàng đã được giao thành công đến tay người nhận.
    test('admin_ord_20 - Kiểm tra lọc đơn hàng theo Shipping status = ’Delivered’', async ({ page }) => {
        await openList(page, 'ord');
        await choose(page, '#ShippingStatusIds', 'Delivered');
        await search(page, 'ord');
        const rows = page.locator('#orders-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        for (const row of await rows.all()) await expect(row).toContainText('Delivered');
    });

    // admin_ord_21: Kiểm tra tìm kiếm theo Email thanh toán với email đang tồn tại trong hệ thống
    // Procedure: Pre-condition:
    // + Có đơn hàng của khách hàng 'steve_gates@nopCommerce.com'.
    // 
    // Step:
    // 1. Nhập 'steve_gates@nopCommerce.com' vào ô 'Billing email'
    // 2. Click nút [Search]
    // Expected: 1. Danh sách lọc và hiển thị chính xác các đơn hàng thuộc email 'steve_gates@nopCommerce.com'.
    test('admin_ord_21 - Kiểm tra tìm kiếm theo Email thanh toán với email đang tồn tại trong hệ thống', async ({ page }) => {
        await openList(page, 'ord');
        await clearDates(page);
        const email = fixture('ORDER_EMAIL') || 'steve_gates@nopCommerce.com';
        await fill(page, '#BillingEmail', email);
        await search(page, 'ord');
        await expect(page.locator('#orders-grid tbody')).toContainText(email);
    });

    // admin_ord_22: Kiểm tra tìm kiếm theo Email thanh toán với định dạng sai cú pháp email
    // Procedure: Step:
    // 1. Nhập 'email_sai_cu_phap@@test' vào ô 'Billing email'
    // 2. Click nút [Search]
    // Expected: 1. Hệ thống hiển thị cảnh báo sai cú pháp email.
    test('admin_ord_22 - Kiểm tra tìm kiếm theo Email thanh toán với định dạng sai cú pháp email', async ({ page }) => {
        await openList(page, 'ord');
        await fill(page, '#BillingEmail', 'email_sai_cu_phap@@test');
        await search(page, 'ord');

        // Kiểm tra hệ thống hiển thị cảnh báo sai cú pháp email (nếu web không bắt lỗi thì test sẽ FAIL đúng theo Expected)
        await expect(page.locator('.field-validation-error, .text-danger, .alert-danger, [data-valmsg-for="BillingEmail"]')).toBeVisible({ timeout: 5000 });
    });

    // admin_ord_23: Kiểm tra tìm kiếm theo Tên khách hàng (Billing Last Name)
    // Procedure: Step:
    // 1. Nhập Last Name = 'Gates' vào ô tìm kiếm
    // 2. Click nút [Search]
    // Expected: 1. Danh sách hiển thị các đơn hàng có họ khách hàng chứa từ 'Gates'.
    test('admin_ord_23 - Kiểm tra tìm kiếm theo Tên khách hàng (Billing Last Name)', async ({ page }) => {
        await openList(page, 'ord');
        await clearDates(page);
        const lastName = fixture('BILLING_LAST_NAME') || 'Gates';
        await fill(page, '#BillingLastName', lastName);
        await search(page, 'ord');
        await expect(page.locator('#orders-grid tbody')).toContainText(lastName);
    });

    // admin_ord_24: Kiểm tra tìm kiếm theo từ khóa trong Ghi chú đơn hàng (Order notes)
    // Procedure: Step:
    // 1. Nhập từ khóa 'khách VIP' vào ô 'Order notes'
    // 2. Click nút [Search]
    // Expected: 1. Bảng lọc và hiển thị các đơn hàng có nội dung ghi chú chứa từ 'khách VIP'.
    test('admin_ord_24 - Kiểm tra tìm kiếm theo từ khóa trong Ghi chú đơn hàng (Order notes)', async ({ page }) => {
        await openList(page, 'ord');
        await clearDates(page);
        const note = fixture('ORDER_NOTE') || 'khách VIP';
        await fill(page, '#OrderNotes', note);
        await search(page, 'ord');
    });

    // admin_ord_25: Kiểm tra chuyển sang trang kế tiếp
    // Procedure: Step:
    // 1. Tại chân bảng đơn hàng, click nút [Next] hoặc số trang [2]
    // Expected: 1. Bảng tải và hiển thị danh sách đơn hàng của trang 2.
    // 2. Số thứ tự đơn hàng tiếp nối chính xác trang 1.
    test('admin_ord_25 - Kiểm tra chuyển sang trang kế tiếp', async ({ page }) => {
        await openList(page, 'ord');
        await grid(page, 'ord');
        const next = page.locator('.pagination .next, .pagination .page-item:has(.next), #orders-grid_next').first();
        const isDisabled = await next.getAttribute('class').then(x => /disabled/.test(x || '')).catch(() => true);
        test.skip(isDisabled, 'Không đủ trang dữ liệu');
        await nextPage(page, 'ord');
    });

    // admin_ord_26: Kiểm tra quay lại trang trước đó
    // Procedure: Pre-condition:
    // + Đang đứng ở trang 2 của danh sách đơn hàng.
    // 
    // Step:
    // 1. Click nút [Previous] hoặc số trang [1]
    // Expected: 1. Hệ thống quay trở lại và hiển thị danh sách đơn hàng của trang 1.
    test('admin_ord_26 - Kiểm tra quay lại trang trước đó', async ({ page }) => {
        await openList(page, 'ord');
        await grid(page, 'ord');
        const next = page.locator('.pagination .next, .pagination .page-item:has(.next), #orders-grid_next').first();
        const isDisabled = await next.getAttribute('class').then(x => /disabled/.test(x || '')).catch(() => true);
        test.skip(isDisabled, 'Không đủ trang dữ liệu');
        await nextPage(page, 'ord');
        const prev = page.locator('.pagination .previous, .pagination .page-item:has(.previous), #orders-grid_previous').first();
        await prev.click();
    });

    // admin_ord_27: Kiểm tra thay đổi số lượng bản ghi hiển thị trên trang (15, 20, 50, 100 dòng/trang)
    // Procedure: Step:
    // 1. Chọn dropdown kích thước trang lần lượt là 20, 50, 100 dòng/trang
    // Expected: 1. Số lượng dòng dữ liệu hiển thị trên bảng cập nhật tương ứng chính xác theo giá trị đã chọn.
    test('admin_ord_27 - Kiểm tra thay đổi số lượng bản ghi hiển thị trên trang (15, 20, 50, 100 dòng/trang)', async ({ page }) => {
        await openList(page, 'ord');
        await grid(page, 'ord');
        const size = page.locator("select[name='orders-grid_length']");
        await expect(size).toBeVisible();
        for (const n of ['15', '20', '50', '100']) {
            if (await size.locator(`option[value="${n}"]`).count()) await size.selectOption(n);
        }
    });

    // admin_ord_28: Kiểm tra điều hướng vào trang Chi tiết đơn hàng khi click nút [View]
    // Procedure: Step:
    // 1. Click nút [View] tại dòng đơn hàng #1
    // Expected: 1. Hệ thống chuyển hướng vào màn hình xem chi tiết đơn hàng #1 (View order details - 1).
    test('admin_ord_28 - Kiểm tra điều hướng vào trang Chi tiết đơn hàng khi click nút [View]', async ({ page }) => {
        await openList(page, 'ord');
        await firstDetail(page, 'ord');
    });

    // admin_ord_29: Kiểm tra bố cục trang Chi tiết đơn hàng (tab Thông tin chung, Địa chỉ, Danh sách sản phẩm, Ghi chú)
    // Procedure: Step:
    // 1. Quan sát giao diện trang Chi tiết đơn hàng
    // Expected: 1. Hiển thị đầy đủ 4 tab chức năng: Info (Thông tin chung), Billing & Shipping (Địa chỉ), Products (Sản phẩm), Order notes (Ghi chú).
    test('admin_ord_29 - Kiểm tra bố cục trang Chi tiết đơn hàng (tab Thông tin chung, Địa chỉ, Danh sách sản phẩm, Ghi chú)', async ({ page }) => {
        await openList(page, 'ord');
        await firstDetail(page, 'ord');
        await expect(page.locator('body')).toContainText(/Order info|Billing info|Products|Order notes/i);
    });

    // admin_ord_30: Kiểm tra thay đổi tổng tiền đơn hàng với số âm
    // Procedure: Step:
    // 1. Tại panel 'Order totals', click nút [Edit order total]
    // 2. Nhập số tiền âm: Order total= '-50'
    // 3. Click nút [Save]
    // Expected: 1. Hệ thống báo lỗi validation không cho phép tổng tiền là số âm.
    // 2. Giá trị tổng tiền cũ được giữ nguyên.
    test('admin_ord_30 - Kiểm tra thay đổi tổng tiền đơn hàng với số âm', async ({ page }) => {
        await page.goto(`${BASE_URL}/Admin/Order/Edit/1`);
        await handleCloudflare(page);

        // Lưu lại tổng tiền ban đầu trước khi sửa
        const totalsCard = page.locator('.card.card-default:has(#btnEditOrderTotals)');
        await expect(totalsCard).toBeVisible();
        const initialCardText = await totalsCard.innerText();
        const initialTotalMatch = initialCardText.match(/Order total\s*([\$\d\.,\-]+)/i);
        const originalTotal = initialTotalMatch ? initialTotalMatch[1] : '';

        // 1. Tại panel 'Order totals', click nút [Edit order total]
        await page.locator('#btnEditOrderTotals').click();
        await expect(page.locator('#OrderTotalValue')).toBeVisible();

        // 2. Nhập số tiền âm: Order total= '-50'
        await page.locator('#OrderTotalValue').fill('-50');

        // 3. Click nút [Save]
        await page.locator('#btnSaveOrderTotals').click();
        const confirmYes = page.locator('#btnSaveOrderTotals-action-confirmation-submit-button');
        if (await confirmYes.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmYes.click();
        }

        try {
            // Expected 1: Hệ thống báo lỗi validation không cho phép tổng tiền là số âm (thực tế web không bắt lỗi nên test sẽ FAIL đúng bản chất bug)
            await expect(page.locator('.alert-danger, .field-validation-error, .text-danger, #validation-error')).toBeVisible({ timeout: 5000 });

            // Expected 2: Giá trị tổng tiền cũ được giữ nguyên
            if (originalTotal) {
                await expect(totalsCard).toContainText(originalTotal);
            }
        } finally {
            // Khôi phục lại dữ liệu ban đầu để không làm hỏng đơn hàng cho các ca kiểm thử khác
            if (await page.locator('#btnEditOrderTotals').isVisible({ timeout: 3000 }).catch(() => false)) {
                await page.locator('#btnEditOrderTotals').click();
                await page.locator('#OrderTotalValue').fill('1855.0000');
                await page.locator('#btnSaveOrderTotals').click();
                const confirmBtn = page.locator('#btnSaveOrderTotals-action-confirmation-submit-button');
                if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await confirmBtn.click();
                }
            }
        }
    });

    // admin_ord_31: Kiểm tra thay đổi tổng tiền của đơn hàng với số tiền cực lớn
    // Procedure: Step:
    // 1. Tại panel 'Order totals', click nút [Edit order total]
    // 2. Nhập số tiền cực lớn: '999999999999'
    // 3. Click nút [Save]
    // Expected: 1. Hệ thống cảnh báo giới hạn độ dài hoặc định dạng tiền tệ vượt quá ngưỡng cho phép.
    // 2. Giá trị tổng tiền cũ được giữ nguyên.
    test('admin_ord_31 - Kiểm tra thay đổi tổng tiền của đơn hàng với số tiền cực lớn', async ({ page }) => {
        await page.goto(`${BASE_URL}/Admin/Order/Edit/1`);
        await handleCloudflare(page);

        // Lưu lại tổng tiền ban đầu trước khi sửa
        const totalsCard = page.locator('.card.card-default:has(#btnEditOrderTotals)');
        await expect(totalsCard).toBeVisible();
        const initialCardText = await totalsCard.innerText();
        const initialTotalMatch = initialCardText.match(/Order total\s*([\$\d\.,\-]+)/i);
        const originalTotal = initialTotalMatch ? initialTotalMatch[1] : '';

        // 1. Tại panel 'Order totals', click nút [Edit order total]
        await page.locator('#btnEditOrderTotals').click();
        await expect(page.locator('#OrderTotalValue')).toBeVisible();

        // 2. Nhập số tiền cực lớn: '999999999999'
        await page.locator('#OrderTotalValue').fill('999999999999');

        // 3. Click nút [Save]
        await page.locator('#btnSaveOrderTotals').click();
        const confirmYes = page.locator('#btnSaveOrderTotals-action-confirmation-submit-button');
        if (await confirmYes.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmYes.click();
        }

        try {
            // Expected 1: Hệ thống cảnh báo giới hạn độ dài hoặc định dạng tiền tệ vượt quá ngưỡng cho phép
            await expect(page.locator('.alert-danger, .alert-warning, .field-validation-error, .text-danger, #validation-error')).toBeVisible({ timeout: 5000 });

            // Expected 2: Giá trị tổng tiền cũ được giữ nguyên
            if (originalTotal) {
                await expect(totalsCard).toContainText(originalTotal);
            }
        } finally {
            // Khôi phục lại dữ liệu ban đầu
            if (await page.locator('#btnEditOrderTotals').isVisible({ timeout: 3000 }).catch(() => false)) {
                await page.locator('#btnEditOrderTotals').click();
                await page.locator('#OrderTotalValue').fill('1855.0000');
                await page.locator('#btnSaveOrderTotals').click();
                const confirmBtn = page.locator('#btnSaveOrderTotals-action-confirmation-submit-button');
                if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await confirmBtn.click();
                }
            }
        }
    });

    // admin_ord_32: Kiểm tra thay đổi tổng tiền của đơn hàng với số tiền thực tế
    // Procedure: Step:
    // 1. Tại panel 'Order totals', click nút [Edit order total]
    // 2. Nhập giá trị tổng tiền mới: '1500.00'
    // 3. Click nút [Save]
    // Expected: 1. Hiển thị thông báo lưu thành công.
    // 2. Tổng tiền đơn hàng cập nhật thành $1,500.00 chính xác.
    test('admin_ord_32 - Kiểm tra thay đổi tổng tiền của đơn hàng với số tiền thực tế', async ({ page }) => {
        await page.goto(`${BASE_URL}/Admin/Order/Edit/1`);
        await handleCloudflare(page);

        // 1. Tại panel 'Order totals', click nút [Edit order total]
        await page.locator('#btnEditOrderTotals').click();
        await expect(page.locator('#OrderTotalValue')).toBeVisible();

        // 2. Nhập giá trị tổng tiền mới: '1500.00'
        await page.locator('#OrderTotalValue').fill('1500.00');

        // 3. Click nút [Save]
        await page.locator('#btnSaveOrderTotals').click();
        const confirmYes = page.locator('#btnSaveOrderTotals-action-confirmation-submit-button');
        if (await confirmYes.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmYes.click();
        }

        try {
            // Expected 2: Tổng tiền đơn hàng cập nhật thành $1,500.00 chính xác
            const totalsCard = page.locator('.card.card-default:has(#btnEditOrderTotals)');
            await expect(totalsCard).toContainText('$1,500.00');
        } finally {
            // Khôi phục lại dữ liệu ban đầu
            if (await page.locator('#btnEditOrderTotals').isVisible({ timeout: 3000 }).catch(() => false)) {
                await page.locator('#btnEditOrderTotals').click();
                await page.locator('#OrderTotalValue').fill('1855.0000');
                await page.locator('#btnSaveOrderTotals').click();
                const confirmBtn = page.locator('#btnSaveOrderTotals-action-confirmation-submit-button');
                if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await confirmBtn.click();
                }
            }
        }
    });

    // admin_ord_33: Kiểm tra cập nhật trạng thái đơn hàng từ 'Pending' sang 'Processing'
    // Procedure: Step:
    // 1. Tại trang chi tiết đơn hàng đang ở 'Pending'
    // 2. Click nút [Change status]
    // 3. Chọn trạng thái mới = 'Processing'
    // 4. Click nút [Save]
    // Expected: 1. HIển thị list trạng thái có thể thay đổi gồm "Processing"
    // 2. Thông tin trạng thái đơn hiển thị 'Processing'.
    test('admin_ord_33 - Kiểm tra cập nhật trạng thái đơn hàng từ ’Pending’ sang ’Processing’', async ({ page }) => {
        // Mở đơn hàng đang có trạng thái Pending (#2)
        await page.goto(`${BASE_URL}/Admin/Order/Edit/2`);
        await handleCloudflare(page);

        // 2. Click nút [Change status]
        await page.locator('#btnChangeOrderStatus').click();
        await expect(page.locator('#OrderStatusId')).toBeVisible();

        // Expected 1: HIển thị list trạng thái có thể thay đổi gồm "Processing"
        await expect(page.locator('#OrderStatusId option')).toContainText(['Processing']);

        // 3. Chọn trạng thái mới = 'Processing'
        await page.locator('#OrderStatusId').selectOption({ label: 'Processing' });

        // 4. Click nút [Save]
        await page.locator('#btnSaveOrderStatus').click();
        const confirmYes = page.locator('#btnSaveOrderStatus-action-confirmation-submit-button');
        if (await confirmYes.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmYes.click();
        }

        try {
            // Expected 2: Thông tin trạng thái đơn hiển thị 'Processing'
            const infoCard = page.locator('#order-info');
            await expect(infoCard).toContainText('Processing');
        } finally {
            // Khôi phục lại trạng thái Pending ban đầu
            if (await page.locator('#btnChangeOrderStatus').isVisible({ timeout: 3000 }).catch(() => false)) {
                await page.locator('#btnChangeOrderStatus').click();
                await page.locator('#OrderStatusId').selectOption({ label: 'Pending' });
                await page.locator('#btnSaveOrderStatus').click();
                const confirmBtn = page.locator('#btnSaveOrderStatus-action-confirmation-submit-button');
                if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await confirmBtn.click();
                }
            }
        }
    });

    // admin_ord_34: Kiểm tra cập nhật trạng thái đơn hàng từ 'Processing' sang 'Complete'
    // Procedure: Step:
    // 1. Tại chi tiết đơn hàng đang ở 'Processing'
    // 2. Click nút [Change status]
    // 3. Chọn 'Complete'  
    // 4. Click [Save]
    // Expected: 1. HIển thị list trạng thái có thể thay đổi gồm "Complete"
    // 2. Thông tin trạng thái đơn hiển thị 'Complete'.
    test('admin_ord_34 - Kiểm tra cập nhật trạng thái đơn hàng từ ’Processing’ sang ’Complete’', async ({ page }) => {
        // Mở đơn hàng đang ở Processing (#1)
        await page.goto(`${BASE_URL}/Admin/Order/Edit/1`);
        await handleCloudflare(page);

        // 2. Click nút [Change status]
        await page.locator('#btnChangeOrderStatus').click();
        await expect(page.locator('#OrderStatusId')).toBeVisible();

        // Expected 1: HIển thị list trạng thái có thể thay đổi gồm "Complete"
        await expect(page.locator('#OrderStatusId option')).toContainText(['Complete']);

        // 3. Chọn 'Complete'
        await page.locator('#OrderStatusId').selectOption({ label: 'Complete' });

        // 4. Click [Save]
        await page.locator('#btnSaveOrderStatus').click();
        const confirmYes = page.locator('#btnSaveOrderStatus-action-confirmation-submit-button');
        if (await confirmYes.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmYes.click();
        }

        try {
            // Expected 2: Thông tin trạng thái đơn hiển thị 'Complete'
            const infoCard = page.locator('#order-info');
            await expect(infoCard).toContainText('Complete');
        } finally {
            // Khôi phục lại Processing
            if (await page.locator('#btnChangeOrderStatus').isVisible({ timeout: 3000 }).catch(() => false)) {
                await page.locator('#btnChangeOrderStatus').click();
                await page.locator('#OrderStatusId').selectOption({ label: 'Processing' });
                await page.locator('#btnSaveOrderStatus').click();
                const confirmBtn = page.locator('#btnSaveOrderStatus-action-confirmation-submit-button');
                if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await confirmBtn.click();
                }
            }
        }
    });

    // admin_ord_35: Kiểm tra hủy đơn hàng và chuyển trạng thái sang 'Cancelled'
    // Procedure: Step:
    // 1. Click nút [Cancel order] trên thanh công cụ chi tiết đơn hàng
    // 2. Xác nhận popup cảnh báo hủy đơn
    // Expected: 1. Đơn hàng chuyển sang trạng thái 'Cancelled'.
    // 2. Các nút thao tác thanh toán và xuất kho bị khóa lại.
    test('admin_ord_35 - Kiểm tra hủy đơn hàng và chuyển trạng thái sang ’Cancelled’', async ({ page }) => {
        // Đơn hàng #3
        await page.goto(`${BASE_URL}/Admin/Order/Edit/3`);
        await handleCloudflare(page);

        // 1. Click nút [Cancel order] trên thanh công cụ chi tiết đơn hàng
        await page.locator('#cancelorder').click();

        // 2. Xác nhận popup cảnh báo hủy đơn
        const confirmYes = page.locator('#cancelorder-action-confirmation-submit-button');
        await expect(confirmYes).toBeVisible({ timeout: 3000 });
        await confirmYes.click();

        try {
            // Expected: 1. Đơn hàng chuyển sang trạng thái 'Cancelled'.
            const infoCard = page.locator('#order-info');
            await expect(infoCard).toContainText('Cancelled');
        } finally {
            // Khôi phục lại Pending cho đơn #3
            if (await page.locator('#btnChangeOrderStatus').isVisible({ timeout: 3000 }).catch(() => false)) {
                await page.locator('#btnChangeOrderStatus').click();
                await page.locator('#OrderStatusId').selectOption({ label: 'Pending' });
                await page.locator('#btnSaveOrderStatus').click();
                const confirmBtn = page.locator('#btnSaveOrderStatus-action-confirmation-submit-button');
                if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await confirmBtn.click();
                }
            }
        }
    });

    // admin_ord_36: Kiểm tra thêm ghi chú đơn hàng có chọn 'Display to customer'
    // Procedure: Step:
    // 1. Tại tab Order notes, nhập nội dung ghi chú: 'Đơn hàng đang chuẩn bị xuất kho'
    // 2. Đánh dấu chọn 'Display to customer'
    // 3. Click nút [Add order note]
    // Expected: 1. Ghi chú được thêm vào danh sách lịch sử.
    // 2. Cột 'Display to customer' hiển thị dấu tích xanh và hiển thị được ngoài Storefront.
    test('admin_ord_36 - Kiểm tra thêm ghi chú đơn hàng có chọn ’Display to customer’', async ({ page }) => {
        await page.goto(`${BASE_URL}/Admin/Order/Edit/2`);
        await handleCloudflare(page);

        const testNote = 'Đơn hàng đang chuẩn bị xuất kho';

        // 1. Tại tab Order notes, nhập nội dung ghi chú
        await page.locator('#AddOrderNoteMessage').fill(testNote);

        // 2. Đánh dấu chọn 'Display to customer'
        await page.locator('#AddOrderNoteDisplayToCustomer').check();

        // 3. Click nút [Add order note]
        await page.locator('#addOrderNote').click();
        await page.waitForTimeout(1500);

        try {
            // Expected: 1. Ghi chú được thêm vào danh sách lịch sử
            const noteRow = page.locator('#ordernotes-grid tbody tr').filter({ hasText: testNote }).first();
            await expect(noteRow).toBeVisible();

            // 2. Cột 'Display to customer' hiển thị dấu tích xanh
            await expect(noteRow.locator('.true-icon, .fa-check, [nop-value="true"]')).toBeVisible();
        } finally {
            // Dọn dẹp ghi chú test để bảo toàn dữ liệu
            const noteRow = page.locator('#ordernotes-grid tbody tr').filter({ hasText: testNote }).first();
            if (await noteRow.isVisible().catch(() => false)) {
                page.once('dialog', async d => await d.accept());
                await noteRow.locator('a.btn:has-text("Delete"), button:has-text("Delete")').click();
                await page.waitForTimeout(1000);
            }
        }
    });

    // admin_ord_37: Kiểm tra thêm ghi chú đơn hàng không chọn 'Display to customer'
    // Procedure: Step:
    // 1. Nhập ghi chú nội bộ: 'Kiểm tra kỹ thông tin thanh toán trước khi ship'
    // 2. Bỏ chọn 'Display to customer'
    // 3. Click nút [Add order note]
    // Expected: 1. Ghi chú được lưu nội bộ thành công.
    // 2. Cột 'Display to customer' hiển thị dấu chéo đỏ (khách không xem được ngoài Storefront).
    test('admin_ord_37 - Kiểm tra thêm ghi chú đơn hàng không chọn ’Display to customer’', async ({ page }) => {
        await page.goto(`${BASE_URL}/Admin/Order/Edit/2`);
        await handleCloudflare(page);

        const testNote = 'Kiểm tra kỹ thông tin thanh toán trước khi ship';

        // 1. Nhập ghi chú nội bộ
        await page.locator('#AddOrderNoteMessage').fill(testNote);

        // 2. Bỏ chọn 'Display to customer'
        await page.locator('#AddOrderNoteDisplayToCustomer').uncheck();

        // 3. Click nút [Add order note]
        await page.locator('#addOrderNote').click();
        await page.waitForTimeout(1500);

        try {
            // Expected: 1. Ghi chú được lưu nội bộ thành công
            const noteRow = page.locator('#ordernotes-grid tbody tr').filter({ hasText: testNote }).first();
            await expect(noteRow).toBeVisible();

            // 2. Cột 'Display to customer' hiển thị dấu chéo đỏ
            await expect(noteRow.locator('.false-icon, .fa-times, [nop-value="false"]')).toBeVisible();
        } finally {
            // Dọn dẹp ghi chú test
            const noteRow = page.locator('#ordernotes-grid tbody tr').filter({ hasText: testNote }).first();
            if (await noteRow.isVisible().catch(() => false)) {
                page.once('dialog', async d => await d.accept());
                await noteRow.locator('a.btn:has-text("Delete"), button:has-text("Delete")').click();
                await page.waitForTimeout(1000);
            }
        }
    });

    // admin_ord_38: Kiểm tra xóa một ghi chú đơn hàng
    // Procedure: Step:
    // 1. Tại bảng danh sách ghi chú đơn hàng, click nút [Delete] trên 1 dòng ghi chú
    // 2. Xác nhận hộp thoại xóa
    // Expected: 1. Hiển thị popup xác nhận xóa
    // 2. Ghi chú đó bị xóa hoàn toàn khỏi bảng lịch sử đơn hàng.
    test('admin_ord_38 - Kiểm tra xóa một ghi chú đơn hàng', async ({ page }) => {
        await page.goto(`${BASE_URL}/Admin/Order/Edit/2`);
        await handleCloudflare(page);

        const tempNote = 'Ghi chú kiểm tra chức năng xóa';
        await page.locator('#AddOrderNoteMessage').fill(tempNote);
        await page.locator('#addOrderNote').click();
        await page.waitForTimeout(1500);

        const noteRow = page.locator('#ordernotes-grid tbody tr').filter({ hasText: tempNote }).first();
        await expect(noteRow).toBeVisible();

        // 1. Tại bảng danh sách ghi chú đơn hàng, click nút [Delete] trên 1 dòng ghi chú
        // 2. Xác nhận hộp thoại xóa
        let dialogMessage = '';
        page.once('dialog', async d => {
            dialogMessage = d.message();
            await d.accept();
        });
        await noteRow.locator('a.btn:has-text("Delete"), button:has-text("Delete")').click();
        await page.waitForTimeout(1500);

        // Expected: 1. Hiển thị popup xác nhận xóa
        expect(dialogMessage).toMatch(/Are you sure|xác nhận/i);

        // 2. Ghi chú đó bị xóa hoàn toàn khỏi bảng lịch sử đơn hàng
        await expect(page.locator('#ordernotes-grid tbody tr').filter({ hasText: tempNote })).toHaveCount(0);
    });

    // admin_ord_39: Kiểm tra xuất các đơn hàng đã chọn ra tệp Excel (.xlsx)
    // Procedure: Step:
    // 1. Đánh dấu chọn (checkbox) 2 đơn hàng trong bảng
    // 2. Click menu [Export]
    // 3. Chọn [Export to Excel (selected)]
    // Expected: 1. Tệp Excel được tải xuống và chứa đúng 2 đơn hàng đã chọn với đầy đủ thông tin mã đơn, ngày tạo, tổng tiền.
    test('admin_ord_39 - Kiểm tra xuất các đơn hàng đã chọn ra tệp Excel (.xlsx)', async ({ page }) => {
        await openList(page, 'ord');
        await grid(page, 'ord');

        // 1. Đánh dấu chọn (checkbox) 2 đơn hàng trong bảng
        const checkboxes = page.locator('#orders-grid tbody input.checkboxGroups');
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        // 2. Click menu [Export]
        await page.locator('.btn-group:has-text("Export") button.dropdown-toggle').click();

        // 3. Chọn [Export to Excel (selected)]
        const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 15000 }),
            page.locator('#exportexcel-selected').click()
        ]);

        // Expected: 1. Tệp Excel được tải xuống
        expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
    });

    // admin_ord_40: Kiểm tra xuất tất cả đơn hàng ra tệp Excel (.xlsx)
    // Procedure: Step:
    // 1. Click menu [Export]
    // 2. Chọn [Export to Excel (all)]
    // Expected: 1. Tệp Excel được tải xuống và chứa toàn bộ danh sách đơn hàng trong hệ thống được tải xuống thành công.
    test('admin_ord_40 - Kiểm tra xuất tất cả đơn hàng ra tệp Excel (.xlsx)', async ({ page }) => {
        await openList(page, 'ord');
        await grid(page, 'ord');

        // 1. Click menu [Export]
        await page.locator('.btn-group:has-text("Export") button.dropdown-toggle').click();

        // 2. Chọn [Export to Excel (all)]
        const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 15000 }),
            page.locator('button[name="exportexcel-all"]').click()
        ]);

        // Expected: 1. Tệp Excel được tải xuống thành công
        expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
    });

    // admin_ord_41: Kiểm tra in hóa đơn PDF cho các đơn hàng được chọn
    // Procedure: Step:
    // 1. Đánh dấu chọn 2 đơn hàng trong bảng
    // 2. Click nút [Print PDF invoices (selected)]
    // Expected: 1. Tệp PDF được tạo và tải xuống,  hiển thị đầy đủ  thông tin người mua, chi tiết sản phẩm, thuế và tổng tiền chính xác.
    test('admin_ord_41 - Kiểm tra in hóa đơn PDF cho các đơn hàng được chọn', async ({ page }) => {
        await openList(page, 'ord');
        await grid(page, 'ord');

        // 1. Đánh dấu chọn 2 đơn hàng trong bảng
        const checkboxes = page.locator('#orders-grid tbody input.checkboxGroups');
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        // 2. Click nút [Print PDF invoices (selected)]
        await page.locator('.btn-group:has-text("Print PDF invoices") button.dropdown-toggle').click();

        const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 15000 }),
            page.locator('#pdf-invoice-selected').click()
        ]);

        // Expected: 1. Tệp hóa đơn (PDF/ZIP) được tạo và tải xuống
        expect(download.suggestedFilename()).toMatch(/\.(pdf|zip)$/i);
    });

    // admin_ord_42: Kiểm tra in hóa đơn PDF cho tất cả đơn hàng
    // Procedure: Step:
    // 1. Click nút [Print PDF invoices (all)]
    // Expected: 1. Tệp PDF được tạo và tải xuống,  hiển thị đầy đủ  thông tin người mua, chi tiết sản phẩm, thuế và tổng tiền chính xác.
    test('admin_ord_42 - Kiểm tra in hóa đơn PDF cho tất cả đơn hàng', async ({ page }) => {
        await openList(page, 'ord');
        await grid(page, 'ord');

        // 1. Click nút [Print PDF invoices (all)]
        await page.locator('.btn-group:has-text("Print PDF invoices") button.dropdown-toggle').click();

        const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 15000 }),
            page.locator('button[name="pdf-invoice-all"]').click()
        ]);

        // Expected: 1. Tệp hóa đơn (PDF/ZIP) được tạo và tải xuống
        expect(download.suggestedFilename()).toMatch(/\.(pdf|zip)$/i);
    });

    // admin_ord_43: Kiểm tra thêm sản phẩm vào đơn hàng với số lượng sản phẩm là số âm
    // Procedure: Step:
    // 1. Tại tab Products của chi tiết đơn hàng, click [Add product]
    // 2. Chọn 1 sản phẩm và nhập Số lượng: '-2'
    // 3. Click [Save]
    // Expected: 1. Hệ thống báo lỗi validation yêu cầu số lượng phải lớn hơn 0.
    // 2. Sản phẩm không được thêm vào đơn hàng.
    test('admin_ord_43 - Kiểm tra thêm sản phẩm vào đơn hàng với số lượng sản phẩm là số âm', async ({ page }) => {
        // 1. Mở trang chọn chi tiết sản phẩm để thêm vào đơn #1
        await page.goto(`${BASE_URL}/Admin/Order/AddProductToOrderDetails?orderId=1&productId=3`);
        await handleCloudflare(page);

        // 2. Nhập Số lượng: '-2'
        await page.locator('#Quantity').fill('-2');

        // 3. Click nút thêm [Add product] / [Save]
        await page.locator('button.btn-primary:has-text("Add product")').click();
        await page.waitForTimeout(1000);

        try {
            // Expected 1: Hệ thống báo lỗi validation yêu cầu số lượng phải lớn hơn 0 (web không validate nên test sẽ FAIL đúng bản chất lỗi)
            await expect(page.locator('.alert-danger, .field-validation-error, .text-danger, #validation-error')).toBeVisible({ timeout: 5000 });

            // Expected 2: Sản phẩm không được thêm vào đơn hàng
            await page.goto(`${BASE_URL}/Admin/Order/Edit/1`);
            await expect(page.locator('#order-products tr:has-text("Lenovo IdeaCentre")')).toHaveCount(0);
        } finally {
            // Dọn dẹp nếu hệ thống lỡ lưu sản phẩm số lượng âm vào đơn hàng
            await page.goto(`${BASE_URL}/Admin/Order/Edit/1`);
            while (await page.locator('#order-products tr:has-text("Lenovo IdeaCentre")').count() > 0) {
                const row = page.locator('#order-products tr:has-text("Lenovo IdeaCentre")').first();
                const delBtn = row.locator('button[name*="btnDeleteOrderItem"]');
                const delId = await delBtn.getAttribute('name');
                await delBtn.click();
                await page.waitForTimeout(500);
                await page.locator(`#${delId}-action-confirmation-submit-button`).click();
                await page.waitForTimeout(1500);
            }
        }
    });

    // admin_ord_44: Kiểm tra thêm sản phẩm vào đơn hàng với giá sản phẩm được thêm là số âm
    // Procedure: Step:
    // 1. Tại form thêm sản phẩm, nhập Giá sản phẩm: '-100'
    // 2. Click [Save]
    // Expected: 1. Hệ thống báo lỗi giá sản phẩm không được là số âm.
    // 2. Form không được lưu.
    test('admin_ord_44 - Kiểm tra thêm sản phẩm vào đơn hàng với giá sản phẩm được thêm là số âm', async ({ page }) => {
        // 1. Mở trang chi tiết sản phẩm để thêm
        await page.goto(`${BASE_URL}/Admin/Order/AddProductToOrderDetails?orderId=1&productId=3`);
        await handleCloudflare(page);

        // Nhập Giá sản phẩm: '-100'
        await page.locator('#UnitPriceInclTax').fill('-100');

        // 2. Click [Save] / [Add product]
        await page.locator('button.btn-primary:has-text("Add product")').click();
        await page.waitForTimeout(1000);

        try {
            // Expected 1: Hệ thống báo lỗi giá sản phẩm không được là số âm (thực tế web không kiểm tra nên test sẽ FAIL đúng lỗi hệ thống)
            await expect(page.locator('.alert-danger, .field-validation-error, .text-danger, #validation-error')).toBeVisible({ timeout: 5000 });

            // Expected 2: Form không được lưu
            await page.goto(`${BASE_URL}/Admin/Order/Edit/1`);
            await expect(page.locator('#order-products tr:has-text("Lenovo IdeaCentre")')).toHaveCount(0);
        } finally {
            // Dọn dẹp
            await page.goto(`${BASE_URL}/Admin/Order/Edit/1`);
            while (await page.locator('#order-products tr:has-text("Lenovo IdeaCentre")').count() > 0) {
                const row = page.locator('#order-products tr:has-text("Lenovo IdeaCentre")').first();
                const delBtn = row.locator('button[name*="btnDeleteOrderItem"]');
                const delId = await delBtn.getAttribute('name');
                await delBtn.click();
                await page.waitForTimeout(500);
                await page.locator(`#${delId}-action-confirmation-submit-button`).click();
                await page.waitForTimeout(1500);
            }
        }
    });
});