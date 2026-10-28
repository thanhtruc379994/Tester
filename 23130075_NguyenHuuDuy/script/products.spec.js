// search_product.spec.js
// 30 test tự động cho chức năng Search Product (Admin > Catalog > Products)
import {test, expect} from '@playwright/test';

const BASE = 'http://localhost:8080';          // đổi thành https://admin-demo.nopcommerce.com nếu chạy trên demo
const G = '#products-grid';
const ADMIN_EMAIL = 'admin@yourStore.com'
const ADMIN_PASSWORD = 'Admin@123'

// ===== Nếu file của bạn đã có sẵn handleCloudflare thì XÓA hàm tạm này =====
async function handleCloudflare(page) {
    // TODO: dùng hàm handleCloudflare thật của bạn
}

async function login(page) {
    // Nếu trình duyệt đã ở sẵn trong Admin từ test case trước thì bỏ qua, không load lại
    if (page.url().includes('/Admin') && !page.url().includes('/login')) {
        return;
    }

    await page.goto(BASE + '/Admin');
    await handleCloudflare(page);

    // Kiểm tra xem đã thực sự vào được trang Admin chưa (có sidebar quản trị)
    const isDashboard = await page.locator('.main-sidebar, .brand-link, .nav-sidebar').isVisible({timeout: 5000}).catch(() => false);
    if (isDashboard) {
        return;
    }

    if (await page.locator('#Email').isVisible({timeout: 3000}).catch(() => false)) {
        await page.locator('#Email').fill(ADMIN_EMAIL);
        await page.locator('#Password').fill(ADMIN_PASSWORD);
        await page.locator('button.login-button, button[type="submit"]:has-text("Log in")').first().click();
        await handleCloudflare(page);
        await page.waitForURL(/\/Admin/i, {timeout: 60000});
    }
}

// ------------------------------ helpers ------------------------------

// Vào thẳng Product list bằng cookie đã có; chỉ login khi bị đẩy về trang đăng nhập
async function openProducts(page) {
    await page.goto(BASE + '/Admin/Product/List');
    await handleCloudflare(page);

    const needLogin = page.url().includes('/login') ||
        await page.locator('#Email').isVisible({timeout: 3000}).catch(() => false);
    if (needLogin) {
        await login(page);
        await page.goto(BASE + '/Admin/Product/List');
        await handleCloudflare(page);
    }

    await expect(page.locator('#search-products')).toBeVisible({timeout: 30000});
    await expect(page.locator(G)).toBeVisible({timeout: 30000});
    await waitGridLoaded(page);
}

// Đợi grid tải xong (có dòng dữ liệu hoặc dòng "No data")
async function waitGridLoaded(page) {
    await expect(page.locator(`${G} tbody tr`).first()).toBeVisible({timeout: 30000});
    await expect(page.locator(`${G}_processing`)).toBeHidden({timeout: 30000}).catch(() => {});
}

// Click Search và đợi request lấy dữ liệu trả về
async function search(page) {
    const [res] = await Promise.all([
        page.waitForResponse(r => r.url().includes('/Product/ProductList'), {timeout: 30000}),
        page.locator('#search-products').click()
    ]);
    expect(res.status(), 'ProductList phải trả về 2xx (không lỗi 500)').toBeLessThan(400);
    await waitGridLoaded(page);
}

async function typeName(page, text) {
    await page.locator('#SearchProductName').fill(text);
}

// select2 che <select> gốc nhưng selectOption vẫn hoạt động trên thẻ gốc
async function choose(page, selector, value) {
    await page.locator(selector).selectOption(value);
}

async function rowCount(page) {
    const rows = page.locator(`${G} tbody tr`);
    const text = (await rows.first().innerText().catch(() => '')) || '';
    if (/No data available|No matching records|Không có dữ liệu/i.test(text)) return 0;
    return rows.count();
}

// Tổng số bản ghi lấy từ dòng "1-15 of 59 items"
async function total(page) {
    const text = await page.locator(`${G}_info`).innerText().catch(() => '');
    const m = text.match(/of\s+([\d,.]+)/i);
    return m ? parseInt(m[1].replace(/[,.]/g, ''), 10) : 0;
}

async function expectEmpty(page) {
    await expect(page.locator(G)).toContainText(/No data available|No matching records|Không có dữ liệu/i);
}

async function gridText(page) {
    return (await page.locator(`${G} tbody`).innerText()).toLowerCase();
}

// ------------------------------ tests ------------------------------

test.describe('Admin - Search Product', () => {

    test.setTimeout(120000);

    // Search_product_default_value_01: Kiểm tra giao diện & giá trị mặc định khi mở trang Product list
    // Procedure: Pre-condition: Đã đăng nhập Admin.
    // Step: 1. Mở trang Catalog > Products  2. Quan sát panel Search và bảng kết quả
    // Expected: 1. Product name rỗng; Category, Manufacturer, Vendor, Warehouse, Product type, Published = All; Search subcategories không tick; SKU rỗng
    // 2. Bảng hiển thị dữ liệu, 15 dòng/trang
    test('Search_product_default_value_01 - Kiểm tra giao diện & giá trị mặc định khi mở trang Product list', async ({page}) => {
        await openProducts(page);
        await expect(page.locator('#SearchProductName')).toHaveValue('');
        for (const id of ['#SearchCategoryId', '#SearchManufacturerId', '#SearchVendorId', '#SearchWarehouseId', '#SearchProductTypeId', '#SearchPublishedId']) {
            await expect(page.locator(id)).toHaveValue('0');
        }
        await expect(page.locator('#SearchIncludeSubCategories')).not.toBeChecked();
        await expect(page.locator('#GoDirectlyToSku')).toHaveValue('');
        expect(await rowCount(page)).toBeGreaterThan(0);
        expect(await rowCount(page)).toBeLessThanOrEqual(15);
    });

    // Search_product_collapse_panel_02: Thu gọn / mở rộng panel Search
    // Step: 1. Click header panel Search  2. Click lại lần nữa
    // Expected: 1. Phần bộ lọc bị ẩn, bảng vẫn hiển thị  2. Bộ lọc hiện lại, giá trị đã nhập được giữ nguyên
    test('Search_product_collapse_panel_02 - Thu gọn / mở rộng panel Search', async ({page}) => {
        await openProducts(page);
        await typeName(page, 'abc');
        await page.locator('.search-row').click();
        await expect(page.locator('.search-body')).toBeHidden();
        await expect(page.locator(G)).toBeVisible();
        await page.locator('.search-row').click();
        await expect(page.locator('.search-body')).toBeVisible();
        await expect(page.locator('#SearchProductName')).toHaveValue('abc');
    });

    // Search_product_empty_product_name_03: Tìm với Product name để trống, bấm Search
    // Step: 1. Để trống Product name  2. Click Search
    // Expected: 1. Hiển thị toàn bộ sản phẩm, phân trang 15/trang
    test('Search_product_empty_product_name_03 - Tìm với Product name để trống, bấm Search', async ({page}) => {
        await openProducts(page);
        await search(page);
        expect(await rowCount(page)).toBeGreaterThan(0);
        expect(await total(page)).toBeGreaterThan(15);
    });

    // Search_product_exact_product_name_04: Tìm với tên sản phẩm chính xác
    // Step: 1. Nhập 'Apple MacBook Pro'  2. Click Search
    // Expected: 1. Chỉ hiển thị sản phẩm 'Apple MacBook Pro'
    test('Search_product_exact_product_name_04 - Tìm với tên sản phẩm chính xác', async ({page}) => {
        await openProducts(page);
        await typeName(page, 'Apple MacBook Pro');
        await search(page);
        expect(await rowCount(page)).toBe(1);
        expect(await gridText(page)).toContain('apple macbook pro');
    });

    // Search_product_keyword_05: Tìm sản phẩm với một phần tên (từ khóa)
    // Step: 1. Nhập 'Nikon'  2. Click Search
    // Expected: 1. Mọi dòng kết quả đều chứa 'Nikon'
    test('Search_product_keyword_05 - Tìm sản phẩm với một phần tên (từ khóa)', async ({page}) => {
        await openProducts(page);
        await typeName(page, 'Nikon');
        await search(page);
        const n = await rowCount(page);
        expect(n).toBeGreaterThan(0);
        for (const t of await page.locator(`${G} tbody tr`).allInnerTexts()) {
            expect(t.toLowerCase()).toContain('nikon');
        }
    });

    // Search_product_case_insensitive_06: Tìm không phân biệt hoa/thường
    // Step: 1. Tìm 'nikon'  2. Tìm 'NIKON'
    // Expected: 1. Hai lần cho cùng số kết quả
    test('Search_product_case_insensitive_06 - Tìm không phân biệt hoa/thường', async ({page}) => {
        await openProducts(page);
        await typeName(page, 'nikon');
        await search(page);
        const lower = await total(page);
        await typeName(page, 'NIKON');
        await search(page);
        const upper = await total(page);
        expect(lower).toBeGreaterThan(0);
        expect(upper).toBe(lower);
    });

    // Search_product_keyword_with_spaces_07: Tìm với từ khóa có khoảng trắng đầu/cuối
    // Step: 1. Nhập '  Nikon  '  2. Click Search
    // Expected: 1. Kết quả giống tìm 'Nikon' (hệ thống trim)
    test('Search_product_keyword_with_spaces_07 - Tìm với từ khóa có khoảng trắng đầu/cuối', async ({page}) => {
        await openProducts(page);
        await typeName(page, 'Nikon');
        await search(page);
        const base = await total(page);
        await typeName(page, '  Nikon  ');
        await search(page);
        expect(await total(page)).toBe(base);
    });

    // Search_product_not_exist_name_08: Tìm với tên sản phẩm không tồn tại
    // Step: 1. Nhập 'zzzxxx123'  2. Click Search
    // Expected: 1. Bảng hiển thị 'No data available in table'
    test('Search_product_not_exist_name_08 - Tìm với tên sản phẩm không tồn tại', async ({page}) => {
        await openProducts(page);
        await typeName(page, 'zzzxxx123');
        await search(page);
        await expectEmpty(page);
    });

    // Search_product_special_chars_09: Tìm với ký tự đặc biệt
    // Step: 1. Lần lượt nhập '%', ''', '_', '\'  2. Click Search
    // Expected: 1. Không lỗi 500, grid vẫn hiển thị
    test('Search_product_special_chars_09 - Tìm với ký tự đặc biệt', async ({page}) => {
        await openProducts(page);
        for (const kw of ['%', "'", '_', '\\', '@#$&']) {
            await typeName(page, kw);
            await search(page);              // search() fail nếu server trả lỗi >= 400
            await expect(page.locator(G)).toBeVisible();
        }
    });

    // Search_product_injection_10: Tìm với SQL injection / script
    // Step: 1. Nhập "' OR '1'='1"  2. Nhập '<script>alert(1)</script>'
    // Expected: 1. Không popup script  2. Không trả về toàn bộ dữ liệu do injection
    test('Search_product_injection_10 - Tìm với SQL injection / script', async ({page}) => {
        let dialogShown = false;
        page.on('dialog', async d => { dialogShown = true; await d.dismiss(); });
        await openProducts(page);
        await search(page);
        const all = await total(page);
        await typeName(page, "' OR '1'='1");
        await search(page);
        expect(await total(page)).toBeLessThan(all);
        await typeName(page, '<script>alert(1)</script>');
        await search(page);
        expect(dialogShown).toBeFalsy();
    });

    // Search_product_long_keyword_11: Tìm với từ khóa rất dài (> 400 ký tự)
    // Step: 1. Nhập chuỗi 500 ký tự  2. Click Search
    // Expected: 1. Không lỗi hệ thống; bảng rỗng
    test('Search_product_long_keyword_11 - Tìm với từ khóa rất dài (> 400 ký tự)', async ({page}) => {
        await openProducts(page);
        await typeName(page, 'a'.repeat(500));
        await search(page);
        await expect(page.locator(G)).toBeVisible();
    });

    // Search_product_unicode_keyword_12: Tìm với từ khóa tiếng Việt / Unicode
    // Step: 1. Nhập 'máy tính'  2. Click Search
    // Expected: 1. Không lỗi; kết quả đúng theo dữ liệu
    test('Search_product_unicode_keyword_12 - Tìm với từ khóa tiếng Việt / Unicode', async ({page}) => {
        await openProducts(page);
        await typeName(page, 'máy tính');
        await search(page);
        await expect(page.locator(G)).toBeVisible();
    });

    // Search_product_press_enter_13: Tìm bằng phím Enter trong ô Product name
    // Step: 1. Nhập 'Lenovo'  2. Nhấn Enter
    // Expected: 1. Thực hiện tìm kiếm, mọi dòng kết quả chứa 'Lenovo'
    test('Search_product_press_enter_13 - Tìm bằng phím Enter trong ô Product name', async ({page}) => {
        await openProducts(page);
        await typeName(page, 'Lenovo');
        await Promise.all([
            page.waitForResponse(r => r.url().includes('/Product/ProductList')),
            page.locator('#SearchProductName').press('Enter')
        ]);
        await waitGridLoaded(page);
        expect(await rowCount(page)).toBeGreaterThan(0);
        for (const t of await page.locator(`${G} tbody tr`).allInnerTexts()) {
            expect(t.toLowerCase()).toContain('lenovo');
        }
    });

    // Search_product_category_no_subcategories_14: Lọc theo Category, không tick Search subcategories
    // Step: 1. Chọn Category = Computers  2. Không tick subcategories  3. Click Search
    // Expected: 1. Chỉ sản phẩm gán trực tiếp vào 'Computers'
    test('Search_product_category_no_subcategories_14 - Lọc theo Category, không tick Search subcategories', async ({page}) => {
        await openProducts(page);
        await choose(page, '#SearchCategoryId', '1');   // Computers
        await search(page);
        await expect(page.locator(G)).toBeVisible();
        expect(await total(page)).toBeLessThan(await (async () => { await choose(page, '#SearchCategoryId', '0'); await search(page); return total(page); })());
    });

    // Search_product_category_with_subcategories_15: Lọc theo Category, có tick Search subcategories
    // Step: 1. Chọn Computers  2. Tick Search subcategories  3. Click Search
    // Expected: 1. Số kết quả >= trường hợp không tick
    test('Search_product_category_with_subcategories_15 - Lọc theo Category, có tick Search subcategories', async ({page}) => {
        await openProducts(page);
        await choose(page, '#SearchCategoryId', '1');
        await search(page);
        const without = await total(page);
        await page.locator('#SearchIncludeSubCategories').check();
        await search(page);
        const withSub = await total(page);
        expect(withSub).toBeGreaterThanOrEqual(without);
        expect(withSub).toBeGreaterThan(0);
    });

    // Search_product_subcategories_with_all_16: Tick Search subcategories khi Category = All
    // Step: 1. Giữ Category = All  2. Tick Search subcategories  3. Click Search
    // Expected: 1. Checkbox không ảnh hưởng, hiển thị toàn bộ sản phẩm
    test('Search_product_subcategories_with_all_16 - Tick Search subcategories khi Category = All', async ({page}) => {
        await openProducts(page);
        await search(page);
        const all = await total(page);
        await page.locator('#SearchIncludeSubCategories').check();
        await search(page);
        expect(await total(page)).toBe(all);
    });

    // Search_product_manufacturer_18: Lọc theo Manufacturer có sản phẩm
    // Step: 1. Chọn Manufacturer = Apple  2. Click Search
    // Expected: 1. Chỉ hiển thị sản phẩm của Apple (có 'Apple MacBook Pro'), ít hơn tổng
    test('Search_product_manufacturer_18 - Lọc theo Manufacturer có sản phẩm', async ({page}) => {
        await openProducts(page);
        await search(page);
        const all = await total(page);
        await choose(page, '#SearchManufacturerId', '1');   // Apple
        await search(page);
        expect(await total(page)).toBeLessThan(all);
        expect(await gridText(page)).toContain('apple macbook pro');
    });

    // Search_product_vendor_20: Lọc theo Vendor có sản phẩm
    // Step: 1. Chọn Vendor 1  2. Click Search
    // Expected: 1. Kết quả hiển thị đúng; không lỗi (rỗng nếu vendor chưa có sản phẩm)
    test('Search_product_vendor_20 - Lọc theo Vendor có sản phẩm', async ({page}) => {
        await openProducts(page);
        await search(page);
        const all = await total(page);
        await choose(page, '#SearchVendorId', '1');
        await search(page);
        expect(await total(page)).toBeLessThanOrEqual(all);
    });

    // Search_product_warehouse_22: Lọc theo Warehouse có sản phẩm
    // Step: 1. Chọn Warehouse 1  2. Click Search
    // Expected: 1. Kết quả hiển thị đúng; không lỗi
    test('Search_product_warehouse_22 - Lọc theo Warehouse có sản phẩm', async ({page}) => {
        await openProducts(page);
        await search(page);
        const all = await total(page);
        await choose(page, '#SearchWarehouseId', '1');
        await search(page);
        expect(await total(page)).toBeLessThanOrEqual(all);
    });

    // Search_product_type_simple_24: Lọc theo Product type = Simple
    // Step: 1. Chọn Simple  2. Click Search
    // Expected: 1. Có kết quả; không nhiều hơn tổng
    test('Search_product_type_simple_24 - Lọc theo Product type = Simple', async ({page}) => {
        await openProducts(page);
        await search(page);
        const all = await total(page);
        await choose(page, '#SearchProductTypeId', '5');
        await search(page);
        expect(await total(page)).toBeGreaterThan(0);
        expect(await total(page)).toBeLessThanOrEqual(all);
    });

    // Search_product_type_grouped_25: Lọc theo Product type = Grouped
    // Step: 1. Chọn Grouped  2. Click Search
    // Expected: 1. Tổng Simple + Grouped = tổng tất cả
    test('Search_product_type_grouped_25 - Lọc theo Product type = Grouped', async ({page}) => {
        await openProducts(page);
        await search(page);
        const all = await total(page);
        await choose(page, '#SearchProductTypeId', '5');
        await search(page);
        const simple = await total(page);
        await choose(page, '#SearchProductTypeId', '10');
        await search(page);
        const grouped = await total(page);
        expect(simple + grouped).toBe(all);
    });

    // Search_product_published_only_26: Lọc Published = Published only
    // Step: 1. Chọn Published only  2. Click Search
    // Expected: 1. Mọi dòng có biểu tượng ✓, không có ✗
    test('Search_product_published_only_26 - Lọc Published = Published only', async ({page}) => {
        await openProducts(page);
        await choose(page, '#SearchPublishedId', '1');
        await search(page);
        expect(await rowCount(page)).toBeGreaterThan(0);
        await expect(page.locator(`${G} .false-icon`)).toHaveCount(0);
        expect(await page.locator(`${G} .true-icon`).count()).toBeGreaterThan(0);
    });

    // Search_product_unpublished_only_27: Lọc Published = Unpublished only
    // Step: 1. Chọn Unpublished only  2. Click Search
    // Expected: 1. Không có dòng nào có biểu tượng ✓ (rỗng nếu không có sản phẩm unpublished)
    test('Search_product_unpublished_only_27 - Lọc Published = Unpublished only', async ({page}) => {
        await openProducts(page);
        await choose(page, '#SearchPublishedId', '2');
        await search(page);
        await expect(page.locator(`${G} .true-icon`)).toHaveCount(0);
    });

    // Search_product_sku_exist_28: Go directly to SKU với SKU tồn tại
    // Step: 1. Nhập 'AP_MBP_13' vào ô SKU  2. Click Go
    // Expected: 1. Chuyển sang trang Edit product 'Apple MacBook Pro'
    test('Search_product_sku_exist_28 - Go directly to SKU với SKU tồn tại', async ({page}) => {
        await openProducts(page);
        await page.locator('#GoDirectlyToSku').fill('AP_MBP_13');
        await page.locator('#go-to-product-by-sku').click();
        await expect(page).toHaveURL(/\/Admin\/Product\/Edit\/\d+/i, {timeout: 30000});
        await expect(page.locator('#Name')).toHaveValue(/Apple MacBook Pro/i);
    });

    // Search_product_sku_not_exist_29: Go directly to SKU với SKU không tồn tại
    // Step: 1. Nhập 'NOT_EXIST_999'  2. Click Go
    // Expected: 1. Không chuyển sang trang Edit, ở lại danh sách
    test('Search_product_sku_not_exist_29 - Go directly to SKU với SKU không tồn tại', async ({page}) => {
        await openProducts(page);
        await page.locator('#GoDirectlyToSku').fill('NOT_EXIST_999');
        await page.locator('#go-to-product-by-sku').click();
        await page.waitForLoadState('networkidle');
        await expect(page).not.toHaveURL(/\/Product\/Edit\//i);
        await expect(page.locator('#search-products')).toBeVisible();
    });

    // Search_product_sku_empty_30: Go directly to SKU để trống
    // Step: 1. Để trống ô SKU  2. Click Go
    // Expected: 1. Không chuyển trang Edit, không lỗi
    test('Search_product_sku_empty_30 - Go directly to SKU để trống', async ({page}) => {
        await openProducts(page);
        await page.locator('#go-to-product-by-sku').click();
        await page.waitForLoadState('networkidle');
        await expect(page).not.toHaveURL(/\/Product\/Edit\//i);
        await expect(page.locator('#search-products')).toBeVisible();
    });

    // Search_product_sku_press_enter_32: Go directly to SKU bằng phím Enter
    // Step: 1. Nhập 'AP_MBP_13'  2. Nhấn Enter
    // Expected: 1. Chuyển sang trang Edit 'Apple MacBook Pro'
    test('Search_product_sku_press_enter_32 - Go directly to SKU bằng phím Enter', async ({page}) => {
        await openProducts(page);
        await page.locator('#GoDirectlyToSku').fill('AP_MBP_13');
        await page.locator('#GoDirectlyToSku').press('Enter');
        await expect(page).toHaveURL(/\/Admin\/Product\/Edit\/\d+/i, {timeout: 30000});
    });

    // Search_product_name_category_mismatch_35: Product name khớp nhưng Category không khớp
    // Step: 1. Nhập 'Nikon'  2. Chọn Category = Software  3. Click Search
    // Expected: 1. Bảng hiển thị 'No data available in table'
    test('Search_product_name_category_mismatch_35 - Product name khớp nhưng Category không khớp', async ({page}) => {
        await openProducts(page);
        await typeName(page, 'Nikon');
        await choose(page, '#SearchCategoryId', '6');    // Computers >> Software
        await search(page);
        await expectEmpty(page);
    });

    // Search_product_name_and_category_34: Tìm theo Product name + Category
    // Step: 1. Nhập 'Lenovo'  2. Chọn Computers, tick Search subcategories  3. Click Search
    // Expected: 1. Chỉ sản phẩm thỏa cả hai điều kiện (chứa 'Lenovo')
    test('Search_product_name_and_category_34 - Tìm theo Product name + Category', async ({page}) => {
        await openProducts(page);
        await typeName(page, 'Lenovo');
        await choose(page, '#SearchCategoryId', '1');
        await page.locator('#SearchIncludeSubCategories').check();
        await search(page);
        expect(await rowCount(page)).toBeGreaterThan(0);
        for (const t of await page.locator(`${G} tbody tr`).allInnerTexts()) {
            expect(t.toLowerCase()).toContain('lenovo');
        }
    });

    // Search_product_paging_next_40: Kiểm tra chuyển sang trang kế tiếp
    // Step: 1. Không lọc, click Search  2. Click Next
    // Expected: 1. Trang 2 hiển thị '16-30 of N items'; trang 2 được đánh dấu active
    // test('Search_product_paging_next_40 - Kiểm tra chuyển sang trang kế tiếp', async ({page}) => {
    //     await openProducts(page);
    //     await search(page);
    //     const next = page.locator(`${G}_next`);
    //     await expect(next).not.toHaveClass(/disabled/);
    //     await next.click();
    //     await waitGridLoaded(page);
    //     await expect(page.locator(`${G}_info`)).toContainText(/16\s*-\s*30/);
    //     await expect(page.locator(`${G}_paginate .paginate_button.active, ${G}_paginate .active`).first()).toContainText('2');
    // });

    test('Search_product_paging_next_40 - Kiểm tra chuyển sang trang kế tiếp', async ({ page }) => {
        await openProducts(page);
        await search(page);

        // Tìm nút Next theo HTML thực tế
        const next = page.locator(
            'a.page-link.next[aria-controls="products-grid"]'
        );

        // Kiểm tra nút Next tồn tại và hiển thị
        await expect(next).toBeVisible();

        // Kiểm tra nút Next không bị vô hiệu hóa
        await expect(next).not.toHaveClass(/disabled/);

        // Chuyển sang trang kế tiếp
        await next.click();

        // Chờ dữ liệu grid tải xong
        await waitGridLoaded(page);

        // Kiểm tra thông tin hiển thị từ sản phẩm 16 đến 30
        await expect(page.locator('#products-grid_info'))
            .toContainText(/16\s*-\s*30/);

        // Kiểm tra trang 2 đang active
        await expect(
            page.locator('.dt-paging-button.active')
        ).toContainText('2');
    });

});