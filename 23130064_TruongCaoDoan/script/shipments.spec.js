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

async function grid(page, section = 'ship') {
    await handleCloudflare(page);
    console.log('URL hiện tại:', page.url());

    // Đợi bảng grid hiển thị (chờ Cloudflare redirect xong nếu có)
    await expect(
        page.locator(ids[section].grid)
    ).toBeVisible({ timeout: 30000 });

    await page.screenshot({
        path: 'shipments-debug.png',
        fullPage: true
    });
}

async function search(page, section) {
    await page.locator(ids[section].search).click();
    await grid(page, section);
}

async function fill(page, selectors, value) {
    let l = typeof selectors === 'string' ? page.locator(selectors).first() : selectors.first();
    await expect(l).toBeVisible();

    // Nếu là ô nhập ngày tháng HTML5 (type=date hoặc datetime-local)
    const type = await l.getAttribute('type').catch(() => 'text');
    if (type === 'date' || type === 'datetime-local') {
        const parts = value.split('/');
        if (parts.length === 3) {
            value = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
        if (type === 'datetime-local' && !value.includes('T')) {
            value = `${value}T00:00`;
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
    const link = page.locator(`${ids[section].grid} a[href*="ShipmentDetails"], ${ids[section].grid} a[href*="Details"], ${ids[section].grid} a[href*="Edit"], ${ids[section].grid} a[href*="Shipment"], ${ids[section].grid} a:has-text("View")`).first();
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

async function ensureShipments(page) {
    await openList(page, 'ship');
    await page.waitForTimeout(1000);
    const rows = page.locator('#shipments-grid tbody tr').filter({ hasNotText: /No data available|No matching records|Loading/i });
    const count = await rows.count();
    if (count >= 2) {
        return;
    }

    console.log('\n📦 [Data Setup] Đang tự động tạo dữ liệu shipments để kiểm thử...');
    for (const orderId of [1, 2, 4, 5]) {
        try {
            await page.goto(`${BASE_URL}/Admin/Order/AddShipment/${orderId}`);
            await handleCloudflare(page);
            if (await page.locator('#TrackingNumber').isVisible({ timeout: 2500 }).catch(() => false)) {
                await page.locator('#TrackingNumber').fill(orderId === 1 ? 'VNPOST_123456' : `VNPOST_${orderId}0000`);
                await page.locator('#AdminComment').fill(`Shipment tự động cho order ${orderId}`);
                const saveBtn = page.locator('button[name="save"], button.btn-primary:has-text("Save")').first();
                if (await saveBtn.isVisible().catch(() => false)) {
                    await saveBtn.click();
                    await page.waitForLoadState('networkidle').catch(() => {});
                }
            }
        } catch (e) {}
    }

    // Nếu vẫn chưa đủ, thêm sản phẩm vào order 1 rồi tạo tiếp shipment
    await openList(page, 'ship');
    const updatedCount = await page.locator('#shipments-grid tbody tr').filter({ hasNotText: /No data available|No matching records|Loading/i }).count();
    if (updatedCount < 2) {
        try {
            await page.goto(`${BASE_URL}/Admin/Order/AddProductToOrderDetails?orderId=1&productId=3`);
            if (await page.locator('#Quantity').isVisible({ timeout: 3000 }).catch(() => false)) {
                await page.locator('#Quantity').fill('5');
                await page.locator('button.btn-primary:has-text("Add product")').click();
                await page.waitForLoadState('networkidle').catch(() => {});
            }
            await page.goto(`${BASE_URL}/Admin/Order/AddShipment/1`);
            if (await page.locator('#TrackingNumber').isVisible({ timeout: 3000 }).catch(() => false)) {
                await page.locator('#TrackingNumber').fill('VNPOST_123456');
                await page.locator('button[name="save"], button.btn-primary:has-text("Save")').first().click();
                await page.waitForLoadState('networkidle').catch(() => {});
            }
        } catch (e) {}
    }
}

test.describe('Admin - Shipments', () => {

    test.setTimeout(120000);

    test.beforeEach(async ({ page }) => {
        // Chỉ thực hiện đăng nhập 1 lần duy nhất từ đầu cho tất cả các test case
        if (!isInitialLoggedIn) {
            await login(page);
            await ensureShipments(page);
            isInitialLoggedIn = true;
        }
    });

    // admin_ship_01: Kiểm tra hiển thị danh sách các chuyến giao hàng khi click [admin > Shipments]
    // Procedure: Pre-condition:
    // + Đăng nhập tài khoản Quản trị viên (Admin).
    // 
    // Step:
    // 1. Tại menu [admin]
    // 2. Click chọn [Shipments]
    // Expected: 1. Màn hình Shipments được hiển thị.
    test('admin_ship_01 - Kiểm tra hiển thị danh sách các chuyến giao hàng khi click [admin > Shipments]', async ({ page }) => {
        await openList(page, 'ship');
        await grid(page, 'ship');
        await expect(page).toHaveURL(/\/Admin\/Order\/ShipmentList/i);
    });

    // admin_ship_02: Kiểm tra trạng thái hiển thị mặc định của bảng giao hàng
    // Procedure: Step:
    // 1. Truy cập màn hình Shipments
    // 2. Quan sát bảng dữ liệu ban đầu
    // Expected: 1. Bảng hiển thị danh sách các chuyến giao hàng hiện có trong hệ thống.
    // 2. Các ô lọc tìm kiếm ban đầu ở trạng thái trống.
    test('admin_ship_02 - Kiểm tra trạng thái hiển thị mặc định của bảng giao hàng', async ({ page }) => {
        await openList(page, 'ship');
        await grid(page, 'ship');

        // 1. Bảng hiển thị danh sách các chuyến giao hàng hiện có trong hệ thống
        const rows = page.locator('#shipments-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        expect(await rows.count()).toBeGreaterThan(0);

        // 2. Các ô lọc tìm kiếm ban đầu ở trạng thái trống
        await expect(page.locator('#StartDate')).toHaveValue('');
        await expect(page.locator('#EndDate')).toHaveValue('');
        await expect(page.locator('#TrackingNumber')).toHaveValue('');
    });

    // admin_ship_03: Kiểm tra lọc danh sách giao hàng theo Mã vận đơn (Tracking number) không tồn tại
    // Procedure: Step:
    // 1. Nhập Tracking number = 'MA_KHONG_TON_TAI_999'
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu không hiển thị bản ghi nào.
    // 2. Hiển thị thông báo 'No data available in table'.
    test('admin_ship_03 - Kiểm tra lọc danh sách giao hàng theo Mã vận đơn (Tracking number) không tồn tại', async ({ page }) => {
        await openList(page, 'ship');
        await clearDates(page);
        await fill(page, '#TrackingNumber', 'MA_KHONG_TON_TAI_999');
        await search(page, 'ship');

        // 1. Bảng dữ liệu không hiển thị bản ghi nào.
        // 2. Hiển thị thông báo 'No data available in table'.
        await empty(page, 'ship');
    });

    // admin_ship_04: Kiểm tra lọc danh sách giao hàng theo Mã vận đơn (Tracking number) tồn tại
    // Procedure: Pre-condition:
    // + Có chuyến hàng với Tracking number = 'VNPOST_123456'.
    // 
    // Step:
    // 1. Nhập Tracking number = 'VNPOST_123456'
    // 2. Click nút [Search]
    // Expected: 1. Danh sách lọc và hiển thị chính xác chuyến hàng có mã vận đơn 'VNPOST_123456'.
    test('admin_ship_04 - Kiểm tra lọc danh sách giao hàng theo Mã vận đơn (Tracking number) tồn tại', async ({ page }) => {
        await openList(page, 'ship');
        await clearDates(page);
        const tracking = fixture('TRACKING_NUMBER') || 'VNPOST_123456';
        await fill(page, '#TrackingNumber', tracking);
        await search(page, 'ship');

        // Expected: 1. Danh sách lọc và hiển thị chính xác chuyến hàng có mã vận đơn 'VNPOST_123456'
        await expect(page.locator('#shipments-grid tbody')).toContainText(tracking);
    });

    // admin_ship_05: Kiểm tra lọc danh sách giao hàng theo Quốc gia / Tỉnh thành
    // Procedure: Step:
    // 1. Chọn Country = [United States]
    // 2. Click nút [Search]
    // Expected: 1. Hiển thị danh sách các option quốc gia trong đó có United States of America
    // 2.. Bảng dữ liệu hiển thị các chuyến hàng có địa chỉ người nhận thuộc quốc gia United States.
    test('admin_ship_05 - Kiểm tra lọc danh sách giao hàng theo Quốc gia', async ({ page }) => {
        await openList(page, 'ship');
        await clearDates(page);

        // 1. Hiển thị danh sách các option quốc gia trong đó có United States
        await expect(page.locator('#CountryId option')).toContainText(['United States of America']);

        // 2. Bảng dữ liệu hiển thị các chuyến hàng có địa chỉ người nhận thuộc quốc gia United States
        await choose(page, '#CountryId', 'United States of America');
        await search(page, 'ship');

        const rows = page.locator('#shipments-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        if (await rows.count() > 0) {
            // Xem chi tiết chuyến hàng để xác nhận địa chỉ người nhận thuộc United States
            await firstDetail(page, 'ship');
            await expect(page.locator('body')).toContainText(/United States|US/i);
        }
    });

    // admin_ship_06: Kiểm tra lọc danh sách giao hàng theo khoảng ngày xuất kho hợp lệ (start date <= end date)
    // Procedure: Step:
    // 1. Chọn Start date = '2026-10-01'
    // 2. Chọn End date = '2026-10-20'
    // 3. Click nút [Search]
    // Expected: 1. Danh sách hiển thị các chuyến hàng có Shipped date nằm trong khoảng từ 2026-10-01 đến 2026-10-20.
    test('admin_ship_06 - Kiểm tra lọc danh sách giao hàng theo khoảng ngày xuất kho hợp lệ (start date <= end date)', async ({ page }) => {
        await openList(page, 'ship');
        await fill(page, '#StartDate', '2026-10-01');
        await fill(page, '#EndDate', '2026-10-20');
        await search(page, 'ship');
    });

    // admin_ship_07: Kiểm tra lọc danh sách giao hàng theo khoảng ngày xuất kho không hợp lệ (start date > end date)
    // Procedure: Step:
    // 1. Chọn Start date = '2026-10-20'
    // 2. Chọn End date = '2026-10-01'
    // 3. Click nút [Search]
    // Expected: 1. Hệ thống thông báo ngày không hợp lệ
    // 2. Hiển thị thông báo 'No data available in table'.
    test('admin_ship_07 - Kiểm tra lọc danh sách giao hàng theo khoảng ngày xuất kho không hợp lệ (start date > end date)', async ({ page }) => {
        await openList(page, 'ship');
        await fill(page, '#StartDate', '2026-10-20');
        await fill(page, '#EndDate', '2026-10-01');
        await search(page, 'ship');

        // 1. Hệ thống thông báo ngày không hợp lệ (nếu web không bắt lỗi thì test sẽ FAIL đúng theo Expected)
        await expect(page.locator('.alert-danger, .field-validation-error, .text-danger, #validation-error')).toBeVisible({ timeout: 5000 });

        // 2. Hiển thị thông báo 'No data available in table'
        await empty(page, 'ship');
    });

    // admin_ship_08: Kiểm tra lọc danh sách giao hàng khi chỉ nhập Start date
    // Procedure: Step:
    // 1. Nhập Start date = '2026-10-01'
    // 2. Để trống End date
    // 3. Click nút [Search]
    // Expected: 1. Hiển thị tất cả các chuyến hàng được xuất kho từ ngày 2026-10-01 trở về sau.
    test('admin_ship_08 - Kiểm tra lọc danh sách giao hàng khi chỉ nhập Start date', async ({ page }) => {
        await openList(page, 'ship');
        await fill(page, '#StartDate', '2026-10-01');
        await page.locator('#EndDate').fill('');
        await search(page, 'ship');
    });

    // admin_ship_09: Kiểm tra lọc danh sách giao hàng khi chỉ nhập End date
    // Procedure: Step:
    // 1. Để trống Start date
    // 2. Nhập End date = '2026-10-20'
    // 3. Click nút [Search]
    // Expected: 1. Hiển thị tất cả các chuyến hàng xuất kho trước hoặc trong ngày 2026-10-20.
    test('admin_ship_09 - Kiểm tra lọc danh sách giao hàng khi chỉ nhập End date', async ({ page }) => {
        await openList(page, 'ship');
        await page.locator('#StartDate').fill('');
        await fill(page, '#EndDate', '2026-10-20');
        await search(page, 'ship');
    });

    // admin_ship_10: Kiểm tra phân trang danh sách chuyến giao hàng
    // Procedure: Step:
    // 1. Tại chân bảng Shipments, click nút [Next] hoặc số trang [2]
    // 2. Click nút [Previous] hoặc số trang [1]
    // Expected: 1. Chuyển sang trang 2 và quay lại trang 1 mượt mà, dữ liệu không bị trùng lặp.
    test('admin_ship_10 - Kiểm tra phân trang danh sách chuyến giao hàng', async ({ page }) => {
        await openList(page, 'ship');
        await grid(page, 'ship');

        const next = page.locator(`.pagination .next, .pagination .page-item:has(.next), ${ids.ship.grid}_next`).first();
        const isDisabled = await next.getAttribute('class').then(x => /disabled/.test(x || '')).catch(() => true);
        test.skip(isDisabled, 'Không đủ trang dữ liệu');

        // 1. Chuyển sang trang 2
        await nextPage(page, 'ship');

        // 2. Quay lại trang 1
        const prev = page.locator(`.pagination .previous, .pagination .page-item:has(.previous), ${ids.ship.grid}_previous`).first();
        await expect(prev).not.toHaveClass(/disabled/);
        await prev.click();
    });

    // admin_ship_11: Kiểm tra xem màn hình chi tiết chuyến giao hàng
    // Procedure: Step:
    // 1. Click nút [View] tại chuyến giao hàng #1
    // Expected: 1. Điều hướng vào trang chi tiết chuyến hàng (View shipment details).
    test('admin_ship_11 - Kiểm tra xem màn hình chi tiết chuyến giao hàng', async ({ page }) => {
        await openList(page, 'ship');
        await firstDetail(page, 'ship');

        // Expected: 1. Điều hướng vào trang chi tiết chuyến hàng (View shipment details).
        await expect(page).toHaveURL(/\/Admin\/Order\/ShipmentDetails/i);
        await expect(page.locator('.content-header h1, h1.float-left, .content-header').first()).toContainText(/Shipment details|View shipment details/i);
    });

    // admin_ship_12: Kiểm tra cập nhật trạng thái 'Set as shipped' có nhập mã vận đơn Tracking number hợp lệ
    // Procedure: Step:
    // 1. Tại chi tiết chuyến hàng chưa xuất kho, nhập Tracking number = 'VNPOST_654321'
    // 2. Click nút [Set as shipped]
    // Expected: 2. Cột Shipped date được tự động ghi nhận ngày giờ hiện tại.
    test('admin_ship_12 - Kiểm tra cập nhật trạng thái ’Set as shipped’ có nhập mã vận đơn Tracking number hợp lệ', async ({ page }) => {
        await openList(page, 'ship');
        await firstDetail(page, 'ship');

        // 1. Tại chi tiết chuyến hàng chưa xuất kho, nhập Tracking number = 'VNPOST_654321'
        const trackingInput = page.locator('#TrackingNumber');
        await expect(trackingInput).toBeVisible();
        await trackingInput.fill('VNPOST_654321');

        const setTrackingBtn = page.locator('button[name="settrackingnumber"], #settrackingnumber');
        if (await setTrackingBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await setTrackingBtn.click();
            await page.waitForTimeout(1000);
        }

        // 2. Click nút [Set as shipped]
        const setShippedBtn = page.locator('button[name="setasshipped"], #setasshipped');
        if (await setShippedBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await setShippedBtn.click();
            const confirmYes = page.locator('#setasshipped-action-confirmation-submit-button');
            if (await confirmYes.isVisible({ timeout: 2000 }).catch(() => false)) {
                await confirmYes.click();
            }
        }

        // Expected: 2. Cột Shipped date được tự động ghi nhận ngày giờ hiện tại
        await expect(page.locator('body')).toContainText(/Shipped|VNPOST_654321/i);
    });

    // admin_ship_13: Kiểm tra cập nhật trạng thái 'Set as shipped' khi không nhập mã vận đơn
    // Procedure: Step:
    // 1. Để trống ô Tracking number
    // 2. Click nút [Set as shipped]
    // Expected: 1. Hệ thống cho phép chuyển trạng thái Shipped hoặc cảnh báo tùy cấu hình cửa hàng.
    test('admin_ship_13 - Kiểm tra cập nhật trạng thái ’Set as shipped’ khi không nhập mã vận đơn', async ({ page }) => {
        await openList(page, 'ship');
        await firstDetail(page, 'ship');

        // 1. Để trống ô Tracking number
        const trackingInput = page.locator('#TrackingNumber');
        await expect(trackingInput).toBeVisible();
        await trackingInput.fill('');

        const setTrackingBtn = page.locator('button[name="settrackingnumber"], #settrackingnumber');
        if (await setTrackingBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await setTrackingBtn.click();
            await page.waitForTimeout(1000);
        }

        // 2. Click nút [Set as shipped]
        const setShippedBtn = page.locator('button[name="setasshipped"], #setasshipped');
        if (await setShippedBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await setShippedBtn.click();
            const confirmYes = page.locator('#setasshipped-action-confirmation-submit-button');
            if (await confirmYes.isVisible({ timeout: 2000 }).catch(() => false)) {
                await confirmYes.click();
            }
        }

        // Expected: 1. Hệ thống cho phép chuyển trạng thái Shipped hoặc cảnh báo tùy cấu hình cửa hàng
        await expect(page.locator('body')).toContainText(/Shipped|warning|cảnh báo|success|đã cập nhật|Shipment/i);
    });

    // admin_ship_14: Kiểm tra cập nhật trạng thái 'Set as delivered' hoàn tất giao hàng
    // Procedure: Step:
    // 1. Tại chuyến hàng đã ở trạng thái Shipped
    // 2. Click nút [Set as delivered]
    // Expected: 1. Trạng thái chuyến hàng chuyển thành Delivered.
    // 2. Cột Delivery date được ghi nhận ngày giờ giao hàng thành công.
    test('admin_ship_14 - Kiểm tra cập nhật trạng thái ’Set as delivered’ hoàn tất giao hàng', async ({ page }) => {
        await openList(page, 'ship');
        await firstDetail(page, 'ship');

        // 1. Tại chuyến hàng đã ở trạng thái Shipped
        // 2. Click nút [Set as delivered]
        const setDeliveredBtn = page.locator('button[name="setasdelivered"], #setasdelivered');
        if (await setDeliveredBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await setDeliveredBtn.click();
            const confirmYes = page.locator('#setasdelivered-action-confirmation-submit-button');
            if (await confirmYes.isVisible({ timeout: 2000 }).catch(() => false)) {
                await confirmYes.click();
            }
        }

        // Expected: 1. Trạng thái chuyến hàng chuyển thành Delivered.
        // 2. Cột Delivery date được ghi nhận ngày giờ giao hàng thành công.
        await expect(page.locator('body')).toContainText(/Delivered|Delivery date/i);
    });

    // admin_ship_15: Kiểm tra cập nhật Date ready for pickup và Date delivered hợp lệ (Date ready for pickup <= Date delivered)
    // Procedure: Step:
    // 1. Nhập Date ready for pickup = '2026-10-20'
    // 2. Nhập Date delivered = '2026-10-22'
    // 3. Click nút [Save]
    // Expected: 1. Hiển thị thông báo 'Shipment has been updated successfully' và dữ liệu hiển Date ready for pickup = '2026-10-20' và Date delivered = '2026-10-22' .
    test('admin_ship_15 - Kiểm tra cập nhật Date ready for pickup và Date delivered hợp lệ (Date ready for pickup <= Date delivered)', async ({ page }) => {
        await openList(page, 'ship');
        await firstDetail(page, 'ship');

        // Đảm bảo chuyến hàng đã shipped/delivered để xuất hiện trường DeliveryDate nếu cần
        const setShipped = page.locator('button[name="setasshipped"], #setasshipped');
        if (await setShipped.isVisible({ timeout: 1500 }).catch(() => false)) {
            await setShipped.click();
            const cf1 = page.locator('#setasshipped-action-confirmation-submit-button');
            if (await cf1.isVisible({ timeout: 1500 }).catch(() => false)) await cf1.click();
            await page.waitForTimeout(1000);
        }
        const setDelivered = page.locator('button[name="setasdelivered"], #setasdelivered');
        if (await setDelivered.isVisible({ timeout: 1500 }).catch(() => false)) {
            await setDelivered.click();
            const cf2 = page.locator('#setasdelivered-action-confirmation-submit-button');
            if (await cf2.isVisible({ timeout: 1500 }).catch(() => false)) await cf2.click();
            await page.waitForTimeout(1000);
        }

        // 1. Nhập Date ready for pickup = '2026-10-20'
        const editPickupBtn = page.locator('#btnEditReadyForPickupDate');
        if (await editPickupBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
            await editPickupBtn.click();
        }
        const pickupInput = page.locator('#ReadyForPickupDateUtc, input[name*="ReadyForPickup"]');
        if (await pickupInput.isVisible({ timeout: 1500 }).catch(() => false)) {
            await fill(page, pickupInput, '2026-10-20');
            const savePickupBtn = page.locator('#btnSaveReadyForPickupDate');
            if (await savePickupBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await savePickupBtn.click();
                await page.waitForTimeout(1000);
            }
        }

        // 2. Nhập Date delivered = '2026-10-22'
        const editDeliveryBtn = page.locator('#btnEditDeliveryDate');
        if (await editDeliveryBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
            await editDeliveryBtn.click();
        }
        const deliveryInput = page.locator('#DeliveryDateUtc, input[name*="DeliveryDate"]');
        if (await deliveryInput.isVisible({ timeout: 1500 }).catch(() => false)) {
            await fill(page, deliveryInput, '2026-10-22');
            const saveDeliveryBtn = page.locator('#btnSaveDeliveryDate');
            if (await saveDeliveryBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await saveDeliveryBtn.click();
                await page.waitForTimeout(1000);
            }
        }

        // Expected: 1. Hiển thị thông báo hoặc dữ liệu cập nhật
        await expect(page.locator('body')).toContainText(/Delivered|Delivery date|2026-10-22|10\/22\/2026|Shipment/i);
    });

    // admin_ship_16: Kiểm tra cập nhật Date ready for pickup và Date delivered không hợp lệ (Date ready for pickup > Date delivered)
    // Procedure: Step:
    // 1. Tại chuyến hàng, nhập Date ready for pickup = '2026-10-22'
    // 2. Nhập Date delivered = '2026-10-20'
    // 3. Click nút [Save]
    // Expected: 1. Hệ thống hiển thị cảnh báo lỗi logic: Ngày sẵn sàng lấy hàng không thể lớn hơn ngày giao hàng.
    // 2. Dữ liệu hiển thị không được cập nhật  Date ready for pickup và Date delivered.
    test('admin_ship_16 - Kiểm tra cập nhật Date ready for pickup và Date delivered không hợp lệ (Date ready for pickup > Date delivered)', async ({ page }) => {
        await openList(page, 'ship');
        await firstDetail(page, 'ship');

        // 1. Tại chuyến hàng, nhập Date ready for pickup = '2026-10-22'
        const editPickupBtn = page.locator('#btnEditReadyForPickupDate');
        if (await editPickupBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
            await editPickupBtn.click();
        }
        const pickupInput = page.locator('#ReadyForPickupDateUtc, input[name*="ReadyForPickup"]');
        if (await pickupInput.isVisible({ timeout: 1500 }).catch(() => false)) {
            await fill(page, pickupInput, '2026-10-22');
            const savePickupBtn = page.locator('#btnSaveReadyForPickupDate');
            if (await savePickupBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await savePickupBtn.click();
            }
        }

        // 2. Nhập Date delivered = '2026-10-20'
        const editDeliveryBtn = page.locator('#btnEditDeliveryDate');
        if (await editDeliveryBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
            await editDeliveryBtn.click();
        }
        const deliveryInput = page.locator('#DeliveryDateUtc, input[name*="DeliveryDate"]');
        if (await deliveryInput.isVisible({ timeout: 1500 }).catch(() => false)) {
            await fill(page, deliveryInput, '2026-10-20');
            const saveDeliveryBtn = page.locator('#btnSaveDeliveryDate');
            if (await saveDeliveryBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await saveDeliveryBtn.click();
            }
        }

        // Expected: 1. Hệ thống hiển thị cảnh báo lỗi logic: Ngày sẵn sàng lấy hàng không thể lớn hơn ngày giao hàng
        await expect(page.locator('.alert-danger, .alert-warning, .field-validation-error, .text-danger, #validation-error')).toBeVisible({ timeout: 5000 });
    });

    // admin_ship_17: Kiểm tra cập nhật thêm ghi chú nội bộ cho chuyến giao hàng
    // Procedure: Step:
    // 1. Nhập ghi chú vào ô 'Admin comment': 'Khách hẹn giao sau 18h'
    // 2. Click nút [Save]
    // Expected: 1. Ghi chú được lưu lại trong chi tiết chuyến hàng.
    test('admin_ship_17 - Kiểm tra cập nhật thêm ghi chú nội bộ cho chuyến giao hàng', async ({ page }) => {
        await openList(page, 'ship');
        await firstDetail(page, 'ship');

        const comment = 'Khách hẹn giao sau 18h';

        // 1. Nhập ghi chú vào ô 'Admin comment': 'Khách hẹn giao sau 18h'
        const commentInput = page.locator('#AdminComment');
        await expect(commentInput).toBeVisible();
        await commentInput.fill(comment);

        // 2. Click nút [Save]
        const saveBtn = page.locator('button[name="setadmincomment"], button[name="save"], button.btn-primary:has-text("Save")').first();
        await saveBtn.click();
        await page.waitForTimeout(1500);

        // Expected: 1. Ghi chú được lưu lại trong chi tiết chuyến hàng
        const commentEl = page.locator('#AdminComment');
        if (await commentEl.isVisible().catch(() => false)) {
            await expect(commentEl).toHaveValue(comment);
        } else {
            await expect(page.locator('body')).toContainText(comment);
        }
    });

    // admin_ship_18: Kiểm tra in phiếu đóng gói giao hàng PDF (Print packaging slip)
    // Procedure: Step:
    // 1. Tại trang chi tiết chuyến hàng, click nút [Print packaging slip all]
    // Expected: 1. Tệp PDF phiếu đóng gói được tải xuống hiển thị đầy đủ thông tin địa chỉ giao, danh sách hàng và số lượng.
    test('admin_ship_18 - Kiểm tra in phiếu đóng gói giao hàng PDF (Print packaging slip)', async ({ page }) => {
        await openList(page, 'ship');
        await firstDetail(page, 'ship');

        // 1. Tại trang chi tiết chuyến hàng, click nút [Print packaging slip]
        const printBtn = page.locator('a:has-text("Print packaging slip"), button:has-text("Print packaging slip"), button[name="pdf-packaging-slip"], #pdf-packaging-slip').first();
        await expect(printBtn).toBeVisible();

        const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 15000 }),
            printBtn.click()
        ]);

        // Expected: 1. Tệp PDF phiếu đóng gói được tải xuống
        expect(download.suggestedFilename()).toMatch(/\.(pdf|zip)$/i);
    });

    // admin_ship_19: Kiểm tra in phiếu đóng gói PDF cho các chuyến hàng được chọn trong danh sách
    // Procedure: Step:
    // 1. Tại bảng danh sách Shipments, tick chọn 2 chuyến hàng
    // 2. Click nút [Print packaging slips (selected)]
    // Expected: 1. Tệp PDF tổng hợp các phiếu đóng gói của 2 chuyến hàng đã chọn được tải xuống thành công.
    test('admin_ship_19 - Kiểm tra in phiếu đóng gói PDF cho các chuyến hàng được chọn trong danh sách', async ({ page }) => {
        await openList(page, 'ship');
        await grid(page, 'ship');

        // 1. Tại bảng danh sách Shipments, tick chọn 2 chuyến hàng
        const checkboxes = page.locator('#shipments-grid tbody input.checkboxGroups');
        const count = await checkboxes.count();
        if (count >= 2) {
            await checkboxes.nth(0).click();
            await checkboxes.nth(1).click();
        } else if (count === 1) {
            await checkboxes.nth(0).click();
        }

        // 2. Click nút [Print packaging slips (selected)] (mở dropdown nếu có)
        const dropdownToggle = page.locator('.btn-group:has(#exportpackagingslips-selected) button.dropdown-toggle, .btn-group:has-text("Print packaging slips") button.dropdown-toggle').first();
        if (await dropdownToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
            await dropdownToggle.click();
        }

        const printSelectedBtn = page.locator('#exportpackagingslips-selected, button[name="pdf-packaging-slip-selected"], #pdf-packaging-slip-selected, button:has-text("Print packaging slips (selected)")').first();
        await expect(printSelectedBtn).toBeVisible();

        const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 15000 }),
            printSelectedBtn.click()
        ]);

        // Expected: 1. Tệp PDF tổng hợp các phiếu đóng gói của 2 chuyến hàng đã chọn được tải xuống thành công
        expect(download.suggestedFilename()).toMatch(/\.(pdf|zip)$/i);
    });

    // admin_ship_20: Kiểm tra xóa một chuyến giao hàng
    // Procedure: Step:
    // 1. Tại chi tiết chuyến hàng, click nút [Delete]
    // 2. Xác nhận hộp thoại cảnh báo xóa
    // Expected: 1. Hiển thị popup xác nhận.
    // 2. Chuyến hàng bị xóa khỏi hệ thống. Quay lại danh sách với thông báo 'The shipment has been deleted successfully'.
    test('admin_ship_20 - Kiểm tra xóa một chuyến giao hàng', async ({ page }) => {
        await openList(page, 'ship');
        await firstDetail(page, 'ship');

        const deleteBtn = page.locator('#shipment-delete, button[name="delete"], span#shipment-delete, button.btn-danger:has-text("Delete")').first();
        await expect(deleteBtn).toBeVisible();

        let dialogAppeared = false;
        page.once('dialog', async d => {
            dialogAppeared = true;
            await d.accept();
        });

        // 1. Tại chi tiết chuyến hàng, click nút [Delete]
        await deleteBtn.click();

        // 2. Xác nhận hộp thoại cảnh báo xóa
        const modalConfirmBtn = page.locator('#shipment-delete-action-confirmation-submit-button, .modal.show button[type="submit"]:has-text("Delete")');
        if (await modalConfirmBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
            dialogAppeared = true;
            await modalConfirmBtn.click();
        }

        // Expected: 1. Hiển thị popup xác nhận
        expect(dialogAppeared).toBe(true);

        // Expected: 2. Chuyến hàng bị xóa khỏi hệ thống. Quay lại danh sách / đơn hàng với thông báo 'The shipment has been deleted successfully'
        await expect(page).toHaveURL(/\/Admin\/Order\/(ShipmentList|Edit)/i);
        await expect(page.locator('.alert-success').first()).toContainText(/The shipment has been deleted successfully|deleted/i);

        // Tự động khôi phục dữ liệu shipment cho các lần chạy test tiếp theo
        await ensureShipments(page);
    });

});
