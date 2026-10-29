const { test, expect } = require('../../fixtures');
const MUTATE = process.env.RUN_MUTATIONS === '1';
const fixture = (key) => process.env[key];

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

async function handleCloudflare(page) {
    const cf = page.locator('text=/Verif.*you are human|Performing security verification|checking your browser|Just a moment/i').or(page.locator('#challenge-running, #challenge-stage'));
    if (await cf.first().isVisible({ timeout: 2500 }).catch(() => false)) {
        console.log('\n  [Cloudflare] Đang kiểm tra bảo mật ("Verify you are human")...');
        console.log(' Nếu xuất hiện ô checkbox, bạn hãy dùng chuột click vào ô "Verify you are human" trên cửa sổ Chrome.');

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

async function grid(page, section = 'gc') {
    await handleCloudflare(page);
    console.log('URL hiện tại:', page.url());

    // Đợi bảng grid hiển thị
    await expect(
        page.locator(ids[section].grid)
    ).toBeVisible({ timeout: 30000 });

    // Đợi trạng thái AJAX DataTable tải xong nếu có throbber
    await page.locator(`${ids[section].grid}_processing`).waitFor({ state: 'detached', timeout: 10000 }).catch(() => { });

    await page.screenshot({
        path: 'giftcards-debug.png',
        fullPage: true
    });
}

async function search(page, section = 'gc') {
    await page.locator(ids[section].search).click();
    await page.locator(`${ids[section].grid}_processing`).waitFor({ state: 'detached', timeout: 10000 }).catch(() => { });
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

async function empty(page, section = 'gc') {
    await expect(page.locator(ids[section].grid)).toContainText(/No data available|No matching records|Không có dữ liệu/i);
}

async function firstDetail(page, section = 'gc') {
    const link = page.locator(`${ids[section].grid} a[href*="Edit"], ${ids[section].grid} a[href*="Details"], ${ids[section].grid} a:has-text("Edit"), ${ids[section].grid} a:has-text("View")`).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/(Edit|Details|Create)/i);
}

let isInitialLoggedIn = false;

async function ensureGiftCards(page) {
    await openList(page, 'gc');
    await page.waitForTimeout(1000);
    const rows = page.locator('#giftcards-grid tbody tr').filter({ hasNotText: /No data available|No matching records|Loading/i });
    const count = await rows.count();

    const hasTestGc100 = count > 0 && await page.locator('#giftcards-grid tbody tr:has-text("TEST_GC_100")').count() > 0;
    const hasActCard = count > 0 && await page.locator('#giftcards-grid tbody tr .true-icon, #giftcards-grid tbody tr .fa-check, #giftcards-grid tbody tr [nop-value="true"]').count() > 0;
    const hasDeactCard = count > 0 && await page.locator('#giftcards-grid tbody tr .false-icon, #giftcards-grid tbody tr .fa-times, #giftcards-grid tbody tr [nop-value="false"]').count() > 0;

    if (count >= 3 && hasTestGc100 && hasActCard && hasDeactCard) {
        return;
    }

    console.log('\n🎁 [Data Setup] Đang tự động bổ sung dữ liệu Gift cards để kiểm thử...');

    // 1. Tạo thẻ mẫu chuẩn TEST_GC_100 (Activated) nếu chưa có
    if (!hasTestGc100 || !hasActCard) {
        try {
            await page.goto(`${BASE_URL}/Admin/GiftCard/Create`);
            await handleCloudflare(page);
            await fill(page, '#Amount', '100');
            await fill(page, '#GiftCardCouponCode', 'TEST_GC_100');
            await fill(page, '#RecipientName', 'Nguyễn Văn B');
            await fill(page, '#RecipientEmail', 'vanb@gmail.com');
            const actCb = page.locator('#IsGiftCardActivated');
            if (await actCb.isVisible().catch(() => false)) await actCb.check();
            await page.locator('button[name="save"]').click();
            await page.waitForLoadState('networkidle').catch(() => { });
        } catch (e) { }
    }

    // 2. Tạo thêm thẻ đã bị vô hiệu hóa (IsGiftCardActivated = false) nếu chưa có
    if (!hasDeactCard) {
        try {
            await page.goto(`${BASE_URL}/Admin/GiftCard/Create`);
            await handleCloudflare(page);
            await fill(page, '#Amount', '50');
            await fill(page, '#GiftCardCouponCode', 'TEST_GC_DEACT');
            await fill(page, '#RecipientName', 'Người Nhận Khóa');
            await fill(page, '#RecipientEmail', 'deact@gmail.com');
            const actCb = page.locator('#IsGiftCardActivated');
            if (await actCb.isVisible().catch(() => false)) await actCb.uncheck();
            await page.locator('button[name="save"]').click();
            await page.waitForLoadState('networkidle').catch(() => { });
        } catch (e) { }
    }

    await openList(page, 'gc');
}

test.describe('Admin - Gift cards', () => {

    test.setTimeout(120000);

    test.beforeEach(async ({ page }) => {
        // Chỉ thực hiện đăng nhập 1 lần duy nhất từ đầu cho tất cả các test case
        if (!isInitialLoggedIn) {
            await login(page);
            await ensureGiftCards(page);
            isInitialLoggedIn = true;
        }
    });

    // admin_gc_01: Kiểm tra hiển thị màn hình danh sách bố cục thẻ quà tặng khi click [admin > Gift cards]
    // Procedure: Pre-condition:
    // + Đăng nhập tài khoản Quản trị viên (Admin).
    // 
    // Step:
    // 1. Tại menu [admin], click chọn [Gift cards]
    // Expected: 1. Hiển thị màn hình Gift cards.
    test('admin_gc_01 - Kiểm tra hiển thị màn hình danh sách bố cục thẻ quà tặng khi click [admin > Gift cards]', async ({ page }) => {
        await openList(page, 'gc');
        await grid(page, 'gc');
        await expect(page).toHaveURL(/\/Admin\/GiftCard\/List/i);
        await expect(page.locator('.content-header h1, h1.float-left, .content-header').first()).toContainText(/Gift cards/i);
    });

    // admin_gc_02: Kiểm tra tìm kiếm thẻ quà tặng theo Coupon code đang tồn tại
    // Procedure: Pre-condition:
    // + Có thẻ quà tặng với mã 'TEST_GC_100'.
    // 
    // Step:
    // 1. Nhập 'TEST_GC_100' vào ô 'Coupon code'
    // 2. Click nút [Search]
    // Expected: 1. Bảng dữ liệu lọc và hiển thị chính xác thẻ quà tặng có mã 'TEST_GC_100'.
    test('admin_gc_02 - Kiểm tra tìm kiếm thẻ quà tặng theo Coupon code đang tồn tại', async ({ page }) => {
        await openList(page, 'gc');
        const code = fixture('GIFT_CODE') || 'TEST_GC_100';
        await fill(page, '#CouponCode', code);
        await search(page, 'gc');

        // Expected: 1. Bảng dữ liệu lọc và hiển thị chính xác thẻ quà tặng có mã 'TEST_GC_100'
        await expect(page.locator('#giftcards-grid tbody')).toContainText(code);
    });

    // admin_gc_03: Kiểm tra tìm kiếm thẻ quà tặng theo Coupon code không tồn tại
    // Procedure: Step:
    // 1. Nhập 'MA_KHONG_TON_TAI_999' vào ô Coupon code
    // 2. Click nút [Search]
    // Expected: 1. Thông báo 'No data available in table'.
    test('admin_gc_03 - Kiểm tra tìm kiếm thẻ quà tặng theo Coupon code không tồn tại', async ({ page }) => {
        await openList(page, 'gc');
        await fill(page, '#CouponCode', 'MA_KHONG_TON_TAI_999');
        await search(page, 'gc');

        // Expected: 1. Thông báo 'No data available in table'
        await empty(page, 'gc');
    });

    // admin_gc_04: Kiểm tra lọc thẻ quà tặng theo trạng thái kích hoạt = 'Activated'
    // Procedure: Step:
    // 1. Chọn Activated = [Activated]
    // 2. Click nút [Search]
    // Expected: 1. Danh sách chỉ hiển thị các thẻ quà tặng đang được kích hoạt (cột Is activated có dấu tích xanh).
    test('admin_gc_04 - Kiểm tra lọc thẻ quà tặng theo trạng thái kích hoạt = ’Activated’', async ({ page }) => {
        await openList(page, 'gc');
        await page.locator('#CouponCode').fill('');
        await page.locator('#RecipientName').fill('');
        await choose(page, '#ActivatedId', 'Activated');
        await search(page, 'gc');

        // Expected: 1. Danh sách chỉ hiển thị các thẻ quà tặng đang được kích hoạt
        const rows = page.locator('#giftcards-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        const count = await rows.count();
        expect(count).toBeGreaterThan(0);
        for (const row of await rows.all()) {
            await expect(row.locator('.true-icon, .fa-check, [nop-value="true"]')).toBeVisible();
        }
    });

    // admin_gc_05: Kiểm tra lọc thẻ quà tặng theo trạng thái kích hoạt = 'Deactivated'
    // Procedure: Step:
    // 1. Chọn Activated = [Deactivated]
    // 2. Click nút [Search]
    // Expected: 1. Danh sách chỉ hiển thị các thẻ quà tặng đã bị vô hiệu hóa (cột Is activated có dấu chéo đỏ).
    test('admin_gc_05 - Kiểm tra lọc thẻ quà tặng theo trạng thái kích hoạt = ’Deactivated’', async ({ page }) => {
        await openList(page, 'gc');
        await page.locator('#CouponCode').fill('');
        await page.locator('#RecipientName').fill('');
        await choose(page, '#ActivatedId', 'Deactivated');
        await search(page, 'gc');

        // Expected: 1. Danh sách chỉ hiển thị các thẻ quà tặng đã bị vô hiệu hóa
        const rows = page.locator('#giftcards-grid tbody tr').filter({ hasNotText: /No data available|No matching records/i });
        const count = await rows.count();
        if (count > 0) {
            for (const row of await rows.all()) {
                await expect(row.locator('.false-icon, .fa-times, [nop-value="false"]')).toBeVisible();
            }
        } else {
            await empty(page, 'gc');
        }
    });

    // admin_gc_06: Kiểm tra tìm kiếm thẻ quà tặng theo Tên người nhận (Recipient name)
    // Procedure: Step:
    // 1. Nhập Tên người nhận = 'Nguyễn Văn B'
    // 2. Click nút [Search]
    // Expected: 1. Bảng lọc ra đúng các thẻ quà tặng gửi cho người nhận 'Nguyễn Văn B'.
    test('admin_gc_06 - Kiểm tra tìm kiếm thẻ quà tặng theo Tên người nhận (Recipient name)', async ({ page }) => {
        await openList(page, 'gc');
        await page.locator('#CouponCode').fill('');
        const name = fixture('RECIPIENT_NAME') || 'Nguyễn Văn B';
        await fill(page, '#RecipientName', name);
        await search(page, 'gc');

        // Expected: 1. Bảng lọc ra đúng các thẻ quà tặng gửi cho người nhận 'Nguyễn Văn B'
        await expect(page.locator('#giftcards-grid tbody')).toContainText(name);
    });

    // admin_gc_07: Kiểm tra chức năng sinh mã thẻ ngẫu nhiên tự động [Generate code]
    // Procedure: Step:
    // 1. Click nút [Add new] để tạo thẻ quà tặng
    // 2. Click nút [Generate code] tại trường Coupon code
    // Expected: 1. Hiển thị form  nhập thông tin thẻ quà tặng
    // 2. Tự động hiển tự mã code trong trường Coupon code
    test('admin_gc_07 - Kiểm tra chức năng sinh mã thẻ ngẫu nhiên tự động [Generate code]', async ({ page }) => {
        await openList(page, 'gc');

        // 1. Click nút [Add new] để tạo thẻ quà tặng
        await page.locator('a.btn-primary:has-text("Add new"), a[href*="/Admin/GiftCard/Create"]').first().click();

        // Expected 1: Hiển thị form nhập thông tin thẻ quà tặng
        await expect(page.locator('#GiftCardCouponCode')).toBeVisible();

        // 2. Click nút [Generate code] tại trường Coupon code
        await page.locator('#generateCouponCode, button:has-text("Generate code")').first().click();

        // Expected 2: Tự động hiển thị mã code trong trường Coupon code
        await expect(page.locator('#GiftCardCouponCode')).not.toHaveValue('');
    });

    // admin_gc_08: Kiểm tra lưu thẻ quà tặng mới với đầy đủ các trường bắt buộc (Giá trị ban đầu, Tên/Email người nhận)
    // Procedure: Step:
    // 1. Nhập Initial value = '100'
    // 2. Nhập Coupon code = 'TEST_GC_100'
    // 3. Nhập Recipient name = 'Nguyễn Văn B'
    // 4. Nhập Recipient email = 'vanb@gmail.com'
    // 5. Click nút [Save]
    // Expected: 1. Thẻ quà tặng được lưu thành công vào hệ thống và hiển thị thông báo: 'The new gift card has been added successfully.'
    test('admin_gc_08 - Kiểm tra lưu thẻ quà tặng mới với đầy đủ các trường bắt buộc (Giá trị ban đầu, Tên/Email người nhận)', async ({ page }) => {
        await page.goto(`${BASE_URL}/Admin/GiftCard/Create`);
        await handleCloudflare(page);

        // 1. Nhập Initial value = '100'
        await fill(page, '#Amount', '100');

        // 2. Nhập Coupon code (mã mới duy nhất)
        const code = 'TEST_GC_08_' + Date.now();
        await fill(page, '#GiftCardCouponCode', code);

        // 3. Nhập Recipient name = 'Nguyễn Văn B'
        await fill(page, '#RecipientName', 'Nguyễn Văn B');

        // 4. Nhập Recipient email = 'vanb@gmail.com'
        await fill(page, '#RecipientEmail', 'vanb@gmail.com');

        // 5. Click nút [Save]
        await page.locator('button[name="save"], button.btn-primary:has-text("Save")').first().click();

        // Expected: 1. Thẻ quà tặng được lưu thành công vào hệ thống và hiển thị thông báo
        await expect(page.locator('.alert-success').first()).toContainText(/The new gift card has been added successfully|added/i);
    });

    // admin_gc_09: Kiểm tra nhập Initial value với số tiền hợp lệ
    // Procedure: Step:
    // 1. Tại form tạo thẻ quà tặng, nhập Initial value = '500'
    // 2. Điền các trường bắt buộc khác và click nút [Save]
    // Expected: 1. Thẻ quà tặng được tạo thành công với mệnh giá ban đầu là $500.00.
    test('admin_gc_09 - Kiểm tra nhập Initial value với số tiền hợp lệ', async ({ page }) => {
        await page.goto(`${BASE_URL}/Admin/GiftCard/Create`);
        await handleCloudflare(page);

        // 1. Tại form tạo thẻ quà tặng, nhập Initial value = '500'
        await fill(page, '#Amount', '500');

        // 2. Điền các trường bắt buộc khác
        const code = 'TEST_GC_500_' + Date.now();
        await fill(page, '#GiftCardCouponCode', code);
        await fill(page, '#RecipientName', 'Test User 09');
        await fill(page, '#RecipientEmail', 'user09@example.com');

        // Click nút [Save]
        await page.locator('button[name="save"], button.btn-primary:has-text("Save")').first().click();

        // Expected: 1. Thẻ quà tặng được tạo thành công với mệnh giá ban đầu là $500.00
        await expect(page.locator('.alert-success').first()).toContainText(/The new gift card has been added successfully|added/i);
        await expect(page.locator('#giftcards-grid tbody')).toContainText('$500.00');
    });

    // admin_gc_10: Kiểm tra nhập Initial value với số tiền không hợp lệ (số âm)
    // Procedure: Step:
    // 1. Tại form tạo thẻ quà tặng, nhập Initial value = '-50'
    // 2. Click nút [Save]
    // Expected: 1. Hệ thống hiển thị thông báo lỗi yêu cầu giá trị thẻ quà tặng phải lớn hơn 0.
    // 2. Không tạo thẻ quà tặng.
    test('admin_gc_10 - Kiểm tra nhập Initial value với số tiền không hợp lệ (số âm)', async ({ page }) => {
        await page.goto(`${BASE_URL}/Admin/GiftCard/Create`);
        await handleCloudflare(page);

        // 1. Tại form tạo thẻ quà tặng, nhập Initial value = '-50'
        await fill(page, '#Amount', '-50');

        const code = 'TEST_GC_NEG_' + Date.now();
        await fill(page, '#GiftCardCouponCode', code);
        await fill(page, '#RecipientName', 'Test User 10');
        await fill(page, '#RecipientEmail', 'user10@example.com');

        // 2. Click nút [Save]
        await page.locator('button[name="save"], button.btn-primary:has-text("Save")').first().click();

        // Expected 1: Hệ thống hiển thị thông báo lỗi yêu cầu giá trị thẻ quà tặng phải lớn hơn 0 (web không bắt lỗi thì test fail đúng expected)
        await expect(page.locator('.alert-danger, .field-validation-error, .text-danger, #validation-error')).toBeVisible({ timeout: 5000 });
    });

    // admin_gc_11: Kiểm tra nhập Initial value bằng 0 (Kỹ thuật BVA)
    // Procedure: Step:
    // 1. Nhập Initial value = '0'
    // 2. Điền các trường khác và click [Save]
    // Expected: 1. Hệ thống báo lỗi giá trị ban đầu phải lớn hơn 0.
    // 2. Thẻ quà tặng không được tạo.
    test('admin_gc_11 - Kiểm tra nhập Initial value bằng 0 (Kỹ thuật BVA)', async ({ page }) => {
        await page.goto(`${BASE_URL}/Admin/GiftCard/Create`);
        await handleCloudflare(page);

        // 1. Nhập Initial value = '0'
        await fill(page, '#Amount', '0');

        const code = 'TEST_GC_ZERO_' + Date.now();
        await fill(page, '#GiftCardCouponCode', code);
        await fill(page, '#RecipientName', 'Test User 11');
        await fill(page, '#RecipientEmail', 'user11@example.com');

        // 2. Điền các trường khác và click [Save]
        await page.locator('button[name="save"], button.btn-primary:has-text("Save")').first().click();

        // Expected 1: Hệ thống báo lỗi giá trị ban đầu phải lớn hơn 0 (web không bắt lỗi thì test fail đúng expected)
        await expect(page.locator('.alert-danger, .field-validation-error, .text-danger, #validation-error')).toBeVisible({ timeout: 5000 });
    });

    // admin_gc_12: Kiểm tra để trống trường bắt buộc Tên người nhận (Recipient name)
    // Procedure: Step:
    // 1. Nhập Initial value = '100'
    // 2. Để trống ô 'Recipient name'
    // 3. Nhập email người nhận hợp lệ
    // 4. Click [Save]
    // Expected: 1. Hệ thống cảnh báo lỗi bắt buộc nhập tên người nhận.
    // 2. Dữ liệu gift card không được lưu.
    test('admin_gc_12 - Kiểm tra để trống trường bắt buộc Tên người nhận (Recipient name)', async ({ page }) => {
        await page.goto(`${BASE_URL}/Admin/GiftCard/Create`);
        await handleCloudflare(page);

        // 1. Nhập Initial value = '100'
        await fill(page, '#Amount', '100');
        await fill(page, '#GiftCardCouponCode', 'TEST_GC_NONAME_' + Date.now());

        // 2. Để trống ô 'Recipient name'
        await page.locator('#RecipientName').fill('');

        // 3. Nhập email người nhận hợp lệ
        await fill(page, '#RecipientEmail', 'user12@example.com');

        // 4. Click [Save]
        await page.locator('button[name="save"], button.btn-primary:has-text("Save")').first().click();

        // Expected 1: Hệ thống cảnh báo lỗi bắt buộc nhập tên người nhận
        await expect(page.locator('[data-valmsg-for="RecipientName"], .field-validation-error, .text-danger, .alert-danger')).toBeVisible({ timeout: 5000 });
    });

    // admin_gc_13: Kiểm tra để trống trường bắt buộc Email người nhận (Recipient email) với thẻ loại Virtual
    // Procedure: Step:
    // 1. Chọn Gift card type = Virtual
    // 2. Để trống ô 'Recipient email'
    // 3. Điền các trường khác và click [Save]
    // Expected: 1. Hệ thống cảnh báo lỗi bắt buộc nhập email người nhận đối với thẻ ảo.
    // 2. Không lưu form.
    test('admin_gc_13 - Kiểm tra để trống trường bắt buộc Email người nhận (Recipient email) với thẻ loại Virtual', async ({ page }) => {
        await page.goto(`${BASE_URL}/Admin/GiftCard/Create`);
        await handleCloudflare(page);

        // 1. Chọn Gift card type = Virtual
        await choose(page, '#GiftCardTypeId', 'Virtual');

        await fill(page, '#Amount', '100');
        await fill(page, '#GiftCardCouponCode', 'TEST_GC_NOEMAIL_' + Date.now());
        await fill(page, '#RecipientName', 'Test User 13');

        // 2. Để trống ô 'Recipient email'
        await page.locator('#RecipientEmail').fill('');

        // 3. Click [Save]
        await page.locator('button[name="save"], button.btn-primary:has-text("Save")').first().click();

        // Expected 1: Hệ thống cảnh báo lỗi bắt buộc nhập email người nhận đối với thẻ ảo
        await expect(page.locator('[data-valmsg-for="RecipientEmail"], .field-validation-error, .text-danger, .alert-danger')).toBeVisible({ timeout: 5000 });
    });

    // admin_gc_14: Kiểm tra nhập Email người nhận sai định dạng cú pháp
    // Procedure: Step:
    // 1. Nhập Recipient email = 'email_khong_hop_le@@abc'
    // 2. Click [Save]
    // Expected: 1. Hệ thống báo lỗi validation 'Wrong email'.
    // 2. Thẻ không được lưu.
    test('admin_gc_14 - Kiểm tra nhập Email người nhận sai định dạng cú pháp', async ({ page }) => {
        await page.goto(`${BASE_URL}/Admin/GiftCard/Create`);
        await handleCloudflare(page);

        await fill(page, '#Amount', '100');
        await fill(page, '#GiftCardCouponCode', 'TEST_GC_BADEMAIL_' + Date.now());
        await fill(page, '#RecipientName', 'Test User 14');

        // 1. Nhập Recipient email = 'email_khong_hop_le@@abc'
        await fill(page, '#RecipientEmail', 'email_khong_hop_le@@abc');

        // 2. Click [Save]
        await page.locator('button[name="save"], button.btn-primary:has-text("Save")').first().click();

        // Expected 1: Hệ thống báo lỗi validation 'Wrong email'
        await expect(page.locator('[data-valmsg-for="RecipientEmail"], .field-validation-error, .text-danger, .alert-danger')).toBeVisible({ timeout: 5000 });
    });

    // admin_gc_15: Kiểm tra tạo thẻ quà tặng loại vật lý (Physical gift card)
    // Procedure: Step:
    // 1. Chọn Gift card type = [Physical]
    // 2. Nhập Initial value, Coupon code, Recipient name
    // 3. Click [Save]
    // Expected: 1. Thẻ quà tặng loại vật lý được tạo thành công mà không bắt buộc nhập email người nhận.
    test('admin_gc_15 - Kiểm tra tạo thẻ quà tặng loại vật lý (Physical gift card)', async ({ page }) => {
        await page.goto(`${BASE_URL}/Admin/GiftCard/Create`);
        await handleCloudflare(page);

        // 1. Chọn Gift card type = [Physical]
        await choose(page, '#GiftCardTypeId', 'Physical');

        // 2. Nhập Initial value, Coupon code, Recipient name (để trống email)
        await fill(page, '#Amount', '150');
        const code = 'TEST_GC_PHYS_' + Date.now();
        await fill(page, '#GiftCardCouponCode', code);
        await fill(page, '#RecipientName', 'Physical Recipient');
        if (await page.locator('#RecipientEmail').isVisible().catch(() => false)) {
            await page.locator('#RecipientEmail').fill('');
        }

        // 3. Click nút [Save]
        await page.locator('button[name="save"], button.btn-primary:has-text("Save")').first().click();

        // Expected 1: Thẻ quà tặng loại vật lý được tạo thành công mà không bắt buộc nhập email người nhận
        await expect(page.locator('.alert-success').first()).toContainText(/The new gift card has been added successfully|added/i);
    });

    // admin_gc_16: Kiểm tra kích hoạt thẻ quà tặng (Is activated = True)
    // Procedure: Step:
    // 1. Tại màn hình sửa thẻ quà tặng, đánh dấu chọn checkbox 'Is gift card activated'
    // 2. Click nút [Save]
    // Expected: 1. Thẻ quà tặng chuyển sang trạng thái đã kích hoạt (biểu tượng tích xanh).
    // 2. Mã thẻ có thể sử dụng để thanh toán ngoài Storefront.
    test('admin_gc_16 - Kiểm tra kích hoạt thẻ quà tặng (Is activated = True)', async ({ page }) => {
        await openList(page, 'gc');
        await firstDetail(page, 'gc');

        // 1. Đánh dấu chọn checkbox 'Is gift card activated'
        const actCb = page.locator('#IsGiftCardActivated');
        await expect(actCb).toBeVisible();
        await actCb.check();

        // 2. Click nút [Save]
        await page.locator('button[name="save"], button.btn-primary:has-text("Save")').first().click();

        // Expected 1: Thẻ quà tặng chuyển sang trạng thái đã kích hoạt
        await expect(page.locator('.alert-success').first()).toContainText(/The gift card has been updated successfully|updated/i);
    });

    // admin_gc_17: Kiểm tra vô hiệu hóa thẻ quà tặng (Is activated = False)
    // Procedure: Step:
    // 1. Bỏ chọn checkbox 'Is gift card activated'
    // 2. Click nút [Save]
    // Expected: 1. Thẻ quà tặng chuyển sang trạng thái vô hiệu hóa (biểu tượng dấu chéo đỏ).
    // 2. Mã thẻ không còn áp dụng được khi đặt hàng.
    test('admin_gc_17 - Kiểm tra vô hiệu hóa thẻ quà tặng (Is activated = False)', async ({ page }) => {
        await openList(page, 'gc');
        await firstDetail(page, 'gc');

        // 1. Bỏ chọn checkbox 'Is gift card activated'
        const actCb = page.locator('#IsGiftCardActivated');
        await expect(actCb).toBeVisible();
        await actCb.uncheck();

        // 2. Click nút [Save]
        await page.locator('button[name="save"], button.btn-primary:has-text("Save")').first().click();

        // Expected 1: Thẻ quà tặng chuyển sang trạng thái vô hiệu hóa
        await expect(page.locator('.alert-success').first()).toContainText(/The gift card has been updated successfully|updated/i);
    });

    // admin_gc_18: Kiểm tra gửi email thông báo mã thẻ quà tặng cho người nhận [Notify recipient]
    // Procedure: Step:
    // 1. Tại màn hình sửa thẻ quà tặng đã kích hoạt
    // 2. Click nút [Notify recipient]
    // 3. Xác nhận popup gửi email
    // Expected: 1. Hệ thống gửi email chứa mã coupon tới email người nhận thành công.
    // 2. Hiển thị thông báo 'Notification email has been sent'.
    test('admin_gc_18 - Kiểm tra gửi email thông báo mã thẻ quà tặng cho người nhận [Notify recipient]', async ({ page }) => {
        await openList(page, 'gc');
        await firstDetail(page, 'gc');

        // Đảm bảo loại thẻ là Virtual và có đầy đủ email người nhận / người gửi để nút Notify recipient hiển thị và gửi thành công
        const typeSelect = page.locator('#GiftCardTypeId');
        if (await typeSelect.isVisible().catch(() => false)) {
            const currentType = await typeSelect.inputValue();
            if (currentType !== '0') {
                await typeSelect.selectOption('0');
            }
        }
        await fill(page, '#RecipientName', 'Test Recipient');
        await fill(page, '#RecipientEmail', 'recipient@example.com');
        await fill(page, '#SenderName', 'Store Admin');
        await fill(page, '#SenderEmail', 'admin@yourstore.com');

        // Đảm bảo thẻ đã được kích hoạt trước khi gửi thông báo
        const actCb = page.locator('#IsGiftCardActivated');
        if (await actCb.isVisible().catch(() => false)) {
            if (!(await actCb.isChecked())) {
                await actCb.check();
            }
        }
        await page.locator('button[name="save-continue"]').click();
        await page.waitForLoadState('networkidle').catch(() => { });

        // 2. Click nút [Notify recipient]
        const notifyBtn = page.locator('button[name="notifyRecipient"], #notifyRecipient, button:has-text("Notify recipient")').first();
        await expect(notifyBtn).toBeVisible({ timeout: 5000 });
        await notifyBtn.click();

        // 3. Xác nhận popup gửi email (nếu có modal confirmation)
        const confirmBtn = page.locator('#notifyRecipient-action-confirmation-submit-button, .modal.show button[type="submit"]:has-text("Notify")');
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmBtn.click();
        }

        // Expected: 1. Hiển thị thông báo 'Notification email has been sent' hoặc 'The recipient has been successfully notified'
        await expect(page.locator('.alert-success').first()).toContainText(/The recipient has been successfully notified|Notification email has been sent|email has been sent|notified/i);
    });

    // admin_gc_19: Kiểm tra xem lịch sử sử dụng của thẻ quà tặng (Usage history)
    // Procedure: Step:
    // 1. Tại chi tiết thẻ quà tặng, cuộn xuống bảng 'Usage history'
    // Expected: 1. Bảng hiển thị các đơn hàng đã sử dụng thẻ quà tặng này kèm số tiền đã trừ và ngày sử dụng.
    test('admin_gc_19 - Kiểm tra xem lịch sử sử dụng của thẻ quà tặng (Usage history)', async ({ page }) => {
        await openList(page, 'gc');
        await firstDetail(page, 'gc');

        // Expected: 1. Bảng Usage history hiển thị trong chi tiết thẻ quà tặng
        const historySection = page.locator('#giftcard-usage-history, #usage-history-grid, .card:has-text("Usage history")').first();
        await expect(historySection).toBeVisible();
    });

    // admin_gc_20: Kiểm tra xóa thẻ quà tặng
    // Procedure: Step:
    // 1. Tại chi tiết thẻ quà tặng, click nút [Delete]
    // 2. Xác nhận hộp thoại cảnh báo xóa
    // Expected: 1. Thẻ quà tặng bị xóa hoàn toàn khỏi hệ thống.
    // 2. Quay lại danh sách với thông báo xóa thành công.
    test('admin_gc_20 - Kiểm tra xóa thẻ quà tặng', async ({ page }) => {
        await openList(page, 'gc');
        await firstDetail(page, 'gc');

        const deleteBtn = page.locator('#giftcard-delete, button[name="delete"], span#giftcard-delete, button.btn-danger:has-text("Delete")').first();
        await expect(deleteBtn).toBeVisible();

        let dialogAppeared = false;
        page.once('dialog', async d => {
            dialogAppeared = true;
            await d.accept();
        });

        // 1. Tại chi tiết thẻ quà tặng, click nút [Delete]
        await deleteBtn.click();

        // 2. Xác nhận hộp thoại cảnh báo xóa
        const modalConfirmBtn = page.locator('#giftcard-delete-action-confirmation-submit-button, .modal.show button[type="submit"]:has-text("Delete")');
        if (await modalConfirmBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
            dialogAppeared = true;
            await modalConfirmBtn.click();
        }

        // Expected: 1. Hiển thị popup xác nhận
        expect(dialogAppeared).toBe(true);

        // Expected: 2. Thẻ quà tặng bị xóa hoàn toàn khỏi hệ thống. Quay lại danh sách với thông báo xóa thành công
        await expect(page).toHaveURL(/\/Admin\/GiftCard\/List/i);
        await expect(page.locator('.alert-success').first()).toContainText(/The gift card has been deleted successfully|deleted/i);

        // Tự động khôi phục dữ liệu gift card cho các lần chạy test tiếp theo
        await ensureGiftCards(page);
    });

});
