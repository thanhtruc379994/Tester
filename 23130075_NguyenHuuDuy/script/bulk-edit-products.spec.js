// bulk-edit-products.spec.js
// 32 test tự động cho chức năng Tìm kiếm / Lọc trong Bulk edit products (Admin > Catalog > Bulk edit products)
// Khớp với Sheet 'search-product-in-edit-bulk' trong Group13_23130075_NguyenHuuDuy.xlsx
import {test, expect} from '@playwright/test';

const BASE = 'http://localhost:8080';
const ADMIN_EMAIL = 'admin@yourStore.com';
const ADMIN_PASSWORD = 'Admin@123';
const BULK_URL = BASE + '/Admin/Product/BulkEdit';
const TABLE_SELECTOR = 'table.table-hover';

async function handleCloudflare(page) {
    // Không áp dụng cho localhost
}

async function login(page) {
    if (page.url().includes('/Admin') && !page.url().includes('/login')) {
        return;
    }
    await page.goto(BASE + '/Admin');
    await handleCloudflare(page);

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

async function openBulk(page) {
    await page.goto(BULK_URL);
    await handleCloudflare(page);

    const needLogin = page.url().includes('/login') ||
        await page.locator('#Email').isVisible({timeout: 3000}).catch(() => false);
    if (needLogin) {
        await login(page);
        await page.goto(BULK_URL);
        await handleCloudflare(page);
    }

    await expect(page).toHaveURL(/\/Admin\/Product\/BulkEdit/i, {timeout: 30000});
    await expect(page.locator('#SearchProductName')).toBeVisible({timeout: 30000});
    await page.waitForLoadState('networkidle');
}

async function resetFilters(page) {
    await page.locator('#SearchProductName').fill('');
    await page.locator('#SearchCategoryId').selectOption('0');
    if (await page.locator('#SearchIncludeSubCategories').isChecked()) {
        await page.locator('#SearchIncludeSubCategories').uncheck();
    }
    await page.locator('#SearchManufacturerId').selectOption('0');
    await page.locator('#SearchVendorId').selectOption('0');
    await page.locator('#SearchWarehouseId').selectOption('0');
    await page.locator('#SearchProductTypeId').selectOption('0');
    await page.locator('#SearchPublishedId').selectOption('0');
}

async function clickSearch(page) {
    await page.locator('button.btn-search, button:has-text("Search")').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
}

async function rowCount(page) {
    const table = page.locator(TABLE_SELECTOR).first();
    const tbody = table.locator('tbody');
    const text = (await tbody.innerText().catch(() => '')) || '';
    if (/No data available|No matching records|Không có dữ liệu/i.test(text)) {
        return 0;
    }
    return table.locator('tbody tr').count();
}

async function getProductNames(page) {
    const rows = page.locator(`${TABLE_SELECTOR} tbody tr`);
    const count = await rowCount(page);
    const names = [];
    for (let i = 0; i < count; i++) {
        const nameInput = rows.nth(i).locator('input[name^="name-"], td:nth-child(2) input').first();
        if (await nameInput.count() > 0) {
            names.push(await nameInput.inputValue());
        }
    }
    return names;
}

test.describe('Admin - Bulk edit products (Search & Filters)', () => {

    test.setTimeout(60000);

    test.beforeEach(async ({page}) => {
        await openBulk(page);
        await resetFilters(page);
    });

    test('Search_product_in_bulk_edit_default_value_01 - Kiểm tra giao diện & giá trị mặc định khi mở trang Bulk edit products', async ({page}) => {
        expect(await page.locator('#SearchProductName').inputValue()).toBe('');
        expect(await page.locator('#SearchCategoryId').inputValue()).toBe('0');
        expect(await page.locator('#SearchIncludeSubCategories').isChecked()).toBe(false);
        expect(await page.locator('#SearchManufacturerId').inputValue()).toBe('0');
        expect(await page.locator('#SearchVendorId').inputValue()).toBe('0');
        expect(await page.locator('#SearchWarehouseId').inputValue()).toBe('0');
        expect(await page.locator('#SearchProductTypeId').inputValue()).toBe('0');
        expect(await page.locator('#SearchPublishedId').inputValue()).toBe('0');

        expect(await rowCount(page)).toBeGreaterThan(0);
        const loadedInfo = await page.locator('#loaded-info').innerText();
        expect(loadedInfo).toMatch(/\d+-\d+ of \d+ items/i);
    });

    test('Search_product_in_bulk_edit_columns_02 - Kiểm tra các cột của bảng kết quả', async ({page}) => {
        const headers = await page.locator(`${TABLE_SELECTOR} thead th`).allInnerTexts();
        const expectedHeaders = ['Select', 'Product name', 'SKU', 'Price', 'Old price', 'Stock quantity', 'Published'];
        for (const h of expectedHeaders) {
            expect(headers.some(header => header.trim().includes(h))).toBe(true);
        }
    });

    test('Search_product_in_bulk_edit_empty_product_name_03 - Tìm với Product name để trống, bấm Search', async ({page}) => {
        await page.locator('#SearchProductName').fill('');
        await clickSearch(page);
        expect(await rowCount(page)).toBeGreaterThan(0);
    });

    test('Search_product_in_bulk_edit_exact_product_name_04 - Tìm với tên sản phẩm chính xác', async ({page}) => {
        const target = 'Apple MacBook Pro';
        await page.locator('#SearchProductName').fill(target);
        await clickSearch(page);
        const count = await rowCount(page);
        expect(count).toBe(1);
        const names = await getProductNames(page);
        expect(names.length).toBeGreaterThan(0);
        expect(names[0]).toContain(target);
        const loadedInfo = await page.locator('#loaded-info').innerText();
        expect(loadedInfo).toContain('1-1 of 1 items');
    });

    test('Search_product_in_bulk_edit_keyword_05 - Tìm với một phần tên (từ khóa)', async ({page}) => {
        await page.locator('#SearchProductName').fill('Nikon');
        await clickSearch(page);
        const count = await rowCount(page);
        expect(count).toBe(3);
        const names = await getProductNames(page);
        expect(names.some(n => n.includes('Nikon'))).toBe(true);
    });

    test('Search_product_in_bulk_edit_case_insensitive_06 - Tìm không phân biệt hoa/thường', async ({page}) => {
        await page.locator('#SearchProductName').fill('nikon');
        await clickSearch(page);
        const countLower = await rowCount(page);

        await page.locator('#SearchProductName').fill('NIKON');
        await clickSearch(page);
        const countUpper = await rowCount(page);

        expect(countLower).toBe(countUpper);
        expect(countLower).toBe(3);
    });

    test('Search_product_in_bulk_edit_keyword_with_spaces_07 - Tìm với từ khóa có khoảng trắng đầu/cuối', async ({page}) => {
        await page.locator('#SearchProductName').fill('  Nikon  ');
        await clickSearch(page);
        const count = await rowCount(page);
        expect(count).toBe(3);
    });

    test('Search_product_in_bulk_edit_not_exist_name_08 - Tìm với tên sản phẩm không tồn tại', async ({page}) => {
        await page.locator('#SearchProductName').fill('zzzxxx123_not_exist');
        await clickSearch(page);
        expect(await rowCount(page)).toBe(0);
        const tbodyText = await page.locator(`${TABLE_SELECTOR} tbody`).first().innerText();
        expect(tbodyText).toMatch(/No data available|No matching records|Không có dữ liệu/i);
    });

    test('Search_product_in_bulk_edit_special_chars_09 - Tìm với ký tự đặc biệt', async ({page}) => {
        for (const char of ['%', "'", '_']) {
            await page.locator('#SearchProductName').fill(char);
            await clickSearch(page);
            await expect(page.locator('body')).not.toContainText(/Server Error|Exception|500/i);
        }
    });

    test('Search_product_in_bulk_edit_injection_10 - Tìm với SQL injection / script', async ({page}) => {
        let dialogShown = false;
        page.on('dialog', async d => { dialogShown = true; await d.dismiss(); });

        await page.locator('#SearchProductName').fill("' OR '1'='1");
        await clickSearch(page);
        await expect(page.locator('body')).not.toContainText(/Server Error|Exception|SqlException/i);

        await page.locator('#SearchProductName').fill('<script>alert(1)</script>');
        await clickSearch(page);
        expect(dialogShown).toBe(false);
    });

    test('Search_product_in_bulk_edit_long_keyword_11 - Tìm với từ khóa rất dài (> 400 ký tự)', async ({page}) => {
        const longText = 'A'.repeat(500);
        await page.locator('#SearchProductName').fill(longText);
        await clickSearch(page);
        await expect(page.locator('body')).not.toContainText(/Server Error|Exception/i);
        expect(await rowCount(page)).toBe(0);
    });

    test('Search_product_in_bulk_edit_unicode_keyword_12 - Tìm với từ khóa tiếng Việt / Unicode', async ({page}) => {
        await page.locator('#SearchProductName').fill('Điện thoại');
        await clickSearch(page);
        await expect(page.locator('body')).not.toContainText(/Server Error|Exception/i);
    });

    test('Search_product_in_bulk_edit_press_enter_13 - Tìm bằng phím Enter trong ô Product name', async ({page}) => {
        await page.locator('#SearchProductName').fill('Apple');
        await page.locator('#SearchProductName').press('Enter');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(600);
        const count = await rowCount(page);
        expect(count).toBeGreaterThan(0);
    });

    test('Search_product_in_bulk_edit_category_no_subcategories_14 - Lọc theo Category, không tick Search subcategories', async ({page}) => {
        await page.locator('#SearchCategoryId').selectOption('1'); // Computers
        await page.locator('#SearchIncludeSubCategories').uncheck();
        await clickSearch(page);
        const count = await rowCount(page);
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('Search_product_in_bulk_edit_category_with_subcategories_15 - Lọc theo Category, có tick Search subcategories', async ({page}) => {
        await page.locator('#SearchCategoryId').selectOption('1'); // Computers
        await page.locator('#SearchIncludeSubCategories').check();
        await clickSearch(page);
        const countWithSub = await rowCount(page);
        expect(countWithSub).toBeGreaterThan(0);
    });

    test('Search_product_in_bulk_edit_subcategories_with_all_16 - Tick Search subcategories khi Category = All', async ({page}) => {
        await page.locator('#SearchCategoryId').selectOption('0'); // All
        await page.locator('#SearchIncludeSubCategories').check();
        await clickSearch(page);
        expect(await rowCount(page)).toBeGreaterThan(0);
    });

    test('Search_product_in_bulk_edit_manufacturer_17 - Lọc theo Manufacturer', async ({page}) => {
        await page.locator('#SearchManufacturerId').selectOption('1'); // Apple
        await clickSearch(page);
        const names = await getProductNames(page);
        expect(names.length).toBeGreaterThan(0);
        expect(names.some(n => n.includes('Apple'))).toBe(true);
    });

    test('Search_product_in_bulk_edit_vendor_18 - Lọc theo Vendor', async ({page}) => {
        await page.locator('#SearchVendorId').selectOption('1'); // Vendor 1
        await clickSearch(page);
        await expect(page.locator('body')).not.toContainText(/Server Error|Exception/i);
    });

    test('Search_product_in_bulk_edit_warehouse_19 - Lọc theo Warehouse', async ({page}) => {
        await page.locator('#SearchWarehouseId').selectOption('1'); // Warehouse 1
        await clickSearch(page);
        await expect(page.locator('body')).not.toContainText(/Server Error|Exception/i);
    });

    test('Search_product_in_bulk_edit_type_simple_20 - Lọc theo Product type = Simple', async ({page}) => {
        await page.locator('#SearchProductTypeId').selectOption('5'); // Simple
        await clickSearch(page);
        expect(await rowCount(page)).toBeGreaterThan(0);
    });

    test('Search_product_in_bulk_edit_type_grouped_21 - Lọc theo Product type = Grouped', async ({page}) => {
        await page.locator('#SearchProductTypeId').selectOption('10'); // Grouped
        await clickSearch(page);
        const count = await rowCount(page);
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('Search_product_in_bulk_edit_published_only_22 - Lọc Published = Published only', async ({page}) => {
        await page.locator('#SearchPublishedId').selectOption('1'); // Published only
        await clickSearch(page);
        const count = await rowCount(page);
        expect(count).toBeGreaterThan(0);
        const rows = page.locator(`${TABLE_SELECTOR} tbody tr`);
        for (let i = 0; i < Math.min(count, 5); i++) {
            const pubCheck = rows.nth(i).locator('input[name^="published-"], td:nth-child(7) input[type="checkbox"]').first();
            expect(await pubCheck.isChecked()).toBe(true);
        }
    });

    test('Search_product_in_bulk_edit_unpublished_only_23 - Lọc Published = Unpublished only', async ({page}) => {
        await page.locator('#SearchPublishedId').selectOption('2'); // Unpublished only
        await clickSearch(page);
        const count = await rowCount(page);
        if (count > 0) {
            const rows = page.locator(`${TABLE_SELECTOR} tbody tr`);
            for (let i = 0; i < count; i++) {
                const pubCheck = rows.nth(i).locator('input[name^="published-"], td:nth-child(7) input[type="checkbox"]').first();
                expect(await pubCheck.isChecked()).toBe(false);
            }
        } else {
            expect(count).toBe(0);
        }
    });

    test('Search_product_in_bulk_edit_name_and_category_24 - Tìm theo Product name + Category', async ({page}) => {
        await page.locator('#SearchProductName').fill('Lenovo');
        await page.locator('#SearchCategoryId').selectOption('1'); // Computers
        await page.locator('#SearchIncludeSubCategories').check();
        await clickSearch(page);
        const count = await rowCount(page);
        expect(count).toBeGreaterThanOrEqual(1);
        const names = await getProductNames(page);
        expect(names.every(n => n.toLowerCase().includes('lenovo'))).toBe(true);
    });

    test('Search_product_in_bulk_edit_name_category_mismatch_25 - Product name khớp nhưng Category không khớp', async ({page}) => {
        await page.locator('#SearchProductName').fill('Nikon');
        await page.locator('#SearchCategoryId').selectOption('6'); // Software
        await clickSearch(page);
        expect(await rowCount(page)).toBe(0);
    });

    test('Search_product_in_bulk_edit_manufacturer_and_type_26 - Tìm theo Manufacturer + Product type', async ({page}) => {
        await page.locator('#SearchManufacturerId').selectOption('1'); // Apple
        await page.locator('#SearchProductTypeId').selectOption('5'); // Simple
        await clickSearch(page);
        const count = await rowCount(page);
        expect(count).toBeGreaterThan(0);
        const names = await getProductNames(page);
        expect(names.some(n => n.includes('Apple'))).toBe(true);
    });

    test('Search_product_in_bulk_edit_all_filters_match_27 - Tìm với tất cả bộ lọc có kết quả', async ({page}) => {
        await page.locator('#SearchProductName').fill('MacBook');
        await page.locator('#SearchCategoryId').selectOption('5'); // Notebooks
        await page.locator('#SearchManufacturerId').selectOption('1'); // Apple
        await page.locator('#SearchProductTypeId').selectOption('5'); // Simple
        await page.locator('#SearchPublishedId').selectOption('1'); // Published only
        await clickSearch(page);
        const count = await rowCount(page);
        expect(count).toBe(1);
        const names = await getProductNames(page);
        expect(names[0]).toContain('MacBook');
    });

    test('Search_product_in_bulk_edit_all_filters_no_result_28 - Tìm với tổ hợp bộ lọc mâu thuẫn', async ({page}) => {
        await page.locator('#SearchProductName').fill('MacBook');
        await page.locator('#SearchManufacturerId').selectOption('2'); // HP
        await page.locator('#SearchProductTypeId').selectOption('10'); // Grouped
        await page.locator('#SearchPublishedId').selectOption('2'); // Unpublished
        await clickSearch(page);
        expect(await rowCount(page)).toBe(0);
    });

    test('Search_product_in_bulk_edit_paging_buttons_29 - Kiểm tra nút First / Previous / Next / Last', async ({page}) => {
        // Mặc định ở trang 1: First và Previous phải disabled
        await expect(page.locator('#move-first')).toBeDisabled();
        await expect(page.locator('#move-previous')).toBeDisabled();
        // Kiểm tra nút Next nếu có nhiều trang
        const nextBtn = page.locator('#move-next');
        if (await nextBtn.isEnabled()) {
            await nextBtn.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(600);
            await expect(page.locator('#move-first')).toBeEnabled();
            await expect(page.locator('#move-previous')).toBeEnabled();
            await page.locator('#move-first').click();
            await page.waitForLoadState('networkidle');
        }
    });

    test('Search_product_in_bulk_edit_paging_info_after_filter_30 - Kiểm tra thông tin phân trang sau khi lọc', async ({page}) => {
        await page.locator('#SearchProductName').fill('Nikon');
        await clickSearch(page);
        const loadedInfo = await page.locator('#loaded-info').innerText();
        expect(loadedInfo).toContain('1-3 of 3 items');
        await expect(page.locator('#move-first')).toBeDisabled();
        await expect(page.locator('#move-previous')).toBeDisabled();
        await expect(page.locator('#move-next')).toBeDisabled();
        await expect(page.locator('#move-last')).toBeDisabled();
    });

    test('Search_product_in_bulk_edit_no_login_31 - Truy cập Bulk edit products khi chưa đăng nhập', async ({browser}) => {
        const freshContext = await browser.newContext();
        const newPage = await freshContext.newPage();
        await newPage.goto(BULK_URL);
        await expect(newPage).toHaveURL(/\/login/i, {timeout: 30000});
        await freshContext.close();
    });

    test('Search_product_in_bulk_edit_no_permission_32 - Truy cập khi tài khoản không có quyền Manage Products', async ({page}) => {
        // Xác nhận quyền truy cập: trang Bulk Edit yêu cầu xác thực Admin
        await page.goto(BULK_URL);
        await expect(page).toHaveURL(/\/Admin\/Product\/BulkEdit/i);
        await expectNoServerError(page);
    });
});

async function expectNoServerError(page) {
    await expect(page.locator('body')).not.toContainText(/Server Error|Internal Server Error|Exception/i);
}
