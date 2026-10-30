// search_category.spec.js
// 30 test tự động cho chức năng Search Category (Admin > Catalog > Categories)
import {test, expect} from '@playwright/test';

const BASE = 'http://localhost:8080';
const G = '#categories-grid';
const ADMIN_EMAIL = 'admin@yourStore.com';
const ADMIN_PASSWORD = 'Admin@123';
const LIST_URL = BASE + '/Admin/Category/List';

// ===== Nếu file của bạn đã có sẵn handleCloudflare thì XÓA hàm tạm này =====
async function handleCloudflare(page) {
    // TODO: dùng hàm handleCloudflare thật của bạn
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

// ------------------------------ helpers ------------------------------

// Vào thẳng Category list bằng cookie đã có; chỉ login khi bị đẩy về trang đăng nhập
async function openCategories(page) {
    await page.goto(LIST_URL);
    await handleCloudflare(page);

    const needLogin = page.url().includes('/login') ||
        await page.locator('#Email').isVisible({timeout: 3000}).catch(() => false);
    if (needLogin) {
        await login(page);
        await page.goto(LIST_URL);
        await handleCloudflare(page);
    }

    await expect(page).toHaveURL(/\/Admin\/Category\/List/i, {timeout: 30000});
    await expect(page.locator('#search-categories')).toBeVisible({timeout: 30000});
    await expect(page.locator(G)).toBeVisible({timeout: 30000});
    await waitGridLoaded(page);
}

async function waitGridLoaded(page) {
    await expect(page.locator(`${G} tbody tr`).first()).toBeVisible({timeout: 30000});
    await expect(page.locator(`${G}_processing`)).toBeHidden({timeout: 30000}).catch(() => {});
}

// Click Search và đợi request lấy dữ liệu (POST /Admin/Category/List) trả về
async function search(page) {
    const [res] = await Promise.all([
        page.waitForResponse(r => r.url().includes('/Category/List') && r.request().method() === 'POST', {timeout: 30000}),
        page.locator('#search-categories').click()
    ]);
    expect(res.status(), 'Category list phải trả về 2xx (không lỗi 500)').toBeLessThan(400);
    await waitGridLoaded(page);
}

async function typeName(page, text) {
    await page.locator('#SearchCategoryName').fill(text);
}

async function choose(page, selector, value) {
    await page.locator(selector).selectOption(value);
}

async function rowCount(page) {
    const rows = page.locator(`${G} tbody tr`);
    const text = (await rows.first().innerText().catch(() => '')) || '';
    if (/No data available|No matching records|Không có dữ liệu/i.test(text)) return 0;
    return rows.count();
}

// Tổng số bản ghi lấy từ dòng "1-15 of 16 items"
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

test.describe('Admin - Search Category', () => {

    test.setTimeout(120000);

    test('Search_category_default_value_01 - Kiểm tra giao diện & giá trị mặc định khi mở trang Category list', async ({page}) => {
        await openCategories(page);
        await expect(page.locator('#SearchCategoryName')).toHaveValue('');
        await expect(page.locator('#SearchPublishedId')).toHaveValue('0');
        expect(await rowCount(page)).toBeGreaterThan(0);
        expect(await rowCount(page)).toBeLessThanOrEqual(15);
        expect(await total(page)).toBeGreaterThan(0);
    });

    test('Search_category_columns_02 - Kiểm tra các cột của bảng kết quả', async ({page}) => {
        await openCategories(page);
        await expect(page.locator(`${G} thead`)).toContainText(/Name/i);
        await expect(page.locator(`${G} thead`)).toContainText(/Display order/i);
        await expect(page.locator(`${G} thead`)).toContainText(/Published/i);
    });

    test("Search_category_hierarchy_name_03 - Kiểm tra tên category con hiển thị theo dạng 'Cha >> Con'", async ({page}) => {
        await openCategories(page);
        expect(await gridText(page)).toContain('computers >> desktops');
    });

    test('Search_category_empty_name_04 - Tìm với Category name để trống', async ({page}) => {
        await openCategories(page);
        await search(page);
        expect(await rowCount(page)).toBeGreaterThan(0);
        expect(await total(page)).toBeGreaterThan(15);
    });

    test('Search_category_exact_name_05 - Tìm với tên category chính xác', async ({page}) => {
        await openCategories(page);
        await typeName(page, 'Books');
        await search(page);
        expect(await rowCount(page)).toBe(1);
        expect(await gridText(page)).toContain('books');
    });

    test('Search_category_partial_name_06 - Tìm với một phần tên', async ({page}) => {
        await openCategories(page);
        await typeName(page, 'Comp');
        await search(page);
        expect(await rowCount(page)).toBeGreaterThan(0);
        for (const t of await page.locator(`${G} tbody tr`).allInnerTexts()) {
            expect(t.toLowerCase()).toContain('comp');
        }
    });

    test('Search_category_child_name_07 - Tìm với tên category con', async ({page}) => {
        await openCategories(page);
        await typeName(page, 'Desktops');
        await search(page);
        expect(await rowCount(page)).toBeGreaterThan(0);
        expect(await gridText(page)).toContain('computers >> desktops');
    });

    test('Search_category_case_insensitive_08 - Tìm không phân biệt hoa/thường', async ({page}) => {
        await openCategories(page);
        await typeName(page, 'books');
        await search(page);
        const lower = await total(page);
        await typeName(page, 'BOOKS');
        await search(page);
        expect(lower).toBeGreaterThan(0);
        expect(await total(page)).toBe(lower);
    });

    test('Search_category_spaces_09 - Tìm với từ khóa có khoảng trắng đầu/cuối', async ({page}) => {
        await openCategories(page);
        await typeName(page, 'Books');
        await search(page);
        const base = await total(page);
        await typeName(page, '  Books  ');
        await search(page);
        expect(await total(page)).toBe(base);
    });

    test('Search_category_not_exist_10 - Tìm với tên category không tồn tại', async ({page}) => {
        await openCategories(page);
        await typeName(page, 'zzzxxx123');
        await search(page);
        await expectEmpty(page);
    });

    test('Search_category_special_chars_11 - Tìm với ký tự đặc biệt', async ({page}) => {
        await openCategories(page);
        for (const kw of ['%', "'", '_', '\\']) {
            await typeName(page, kw);
            await search(page);              // search() fail nếu server trả lỗi >= 400
            await expect(page.locator(G)).toBeVisible();
        }
    });

    test('Search_category_injection_12 - Tìm với SQL injection / script', async ({page}) => {
        let dialogShown = false;
        page.on('dialog', async d => { dialogShown = true; await d.dismiss(); });
        await openCategories(page);
        await search(page);
        const all = await total(page);
        await typeName(page, "' OR '1'='1");
        await search(page);
        expect(await total(page)).toBeLessThan(all);
        await typeName(page, '<script>alert(1)</script>');
        await search(page);
        expect(dialogShown).toBeFalsy();
    });

    test('Search_category_unicode_keyword_14 - Tìm với tiếng Việt có dấu', async ({page}) => {
        await openCategories(page);
        await typeName(page, 'tẻ');
        await search(page);
        await expect(page.locator(G)).toBeVisible();
    });

    test('Search_category_press_enter_15 - Tìm bằng phím Enter', async ({page}) => {
        await openCategories(page);
        await typeName(page, 'Books');
        await Promise.all([
            page.waitForResponse(r => r.url().includes('/Category/List') && r.request().method() === 'POST'),
            page.locator('#SearchCategoryName').press('Enter')
        ]);
        await waitGridLoaded(page);
        expect(await rowCount(page)).toBe(1);
        expect(await gridText(page)).toContain('books');
    });

    test('Search_category_published_list_17 - Kiểm tra danh sách giá trị của Published', async ({page}) => {
        await openCategories(page);
        const options = await page.locator('#SearchPublishedId option').allInnerTexts();
        expect(options.map(o => o.trim())).toEqual(['All', 'Published only', 'Unpublished only']);
    });

    test('Search_category_published_all_18 - Tìm với Published = All', async ({page}) => {
        await openCategories(page);
        await search(page);
        const base = await total(page);
        await choose(page, '#SearchPublishedId', '0');
        await search(page);
        expect(await total(page)).toBe(base);
    });

    test('Search_category_published_only_19 - Tìm với Published = Published only', async ({page}) => {
        await openCategories(page);
        await choose(page, '#SearchPublishedId', '1');
        await search(page);
        expect(await rowCount(page)).toBeGreaterThan(0);
        await expect(page.locator(`${G} .false-icon`)).toHaveCount(0);
        expect(await page.locator(`${G} .true-icon`).count()).toBeGreaterThan(0);
    });

    test('Search_category_unpublished_only_20 - Tìm với Published = Unpublished only', async ({page}) => {
        await openCategories(page);
        await choose(page, '#SearchPublishedId', '2');
        await search(page);
        await expect(page.locator(`${G} .true-icon`)).toHaveCount(0);
    });

    test('Search_category_name_and_published_21 - Kết hợp Category name + Published (có kết quả)', async ({page}) => {
        await openCategories(page);
        await typeName(page, 'Books');
        await choose(page, '#SearchPublishedId', '1');
        await search(page);
        expect(await rowCount(page)).toBe(1);
        expect(await gridText(page)).toContain('books');
    });

    test('Search_category_name_published_mismatch_22 - Kết hợp Category name + Published (không kết quả)', async ({page}) => {
        await openCategories(page);
        await typeName(page, 'Books');
        await choose(page, '#SearchPublishedId', '2');
        await search(page);
        await expectEmpty(page);
    });

    test('Search_category_paging_default_23 - Kiểm tra phân trang mặc định', async ({page}) => {
        await openCategories(page);
        await search(page);
        expect(await rowCount(page)).toBe(15);
        await expect(page.locator(`${G}_info`)).toContainText(/1\s*-\s*15\s+of/i);
        await expect(page.locator(`${G}_next`)).not.toHaveClass(/disabled/);
    });

    test('Search_category_paging_next_24 - Kiểm tra chuyển sang trang kế tiếp', async ({page}) => {
        await openCategories(page);
        await search(page);
        await page.locator(`${G}_next`).click();
        await waitGridLoaded(page);
        await expect(page.locator(`${G}_info`)).toContainText(/16\s*-/);
        expect(await rowCount(page)).toBeGreaterThan(0);
        expect(await rowCount(page)).toBeLessThan(15);
    });

    test('Search_category_paging_previous_25 - Kiểm tra quay về trang trước', async ({page}) => {
        await openCategories(page);
        await search(page);
        await page.locator(`${G}_next`).click();
        await waitGridLoaded(page);
        await page.locator(`${G}_previous`).click();
        await waitGridLoaded(page);
        await expect(page.locator(`${G}_info`)).toContainText(/1\s*-\s*15\s+of/i);
    });

    test('Search_category_paging_page_number_28 - Kiểm tra click trực tiếp số trang', async ({page}) => {
        await openCategories(page);
        await search(page);
        await page.locator(`${G}_paginate .paginate_button`, {hasText: /^2$/}).click();
        await waitGridLoaded(page);
        await expect(page.locator(`${G}_info`)).toContainText(/16\s*-/);
    });

    test('Search_category_paging_items_per_page_29 - Kiểm tra đổi số dòng/trang', async ({page}) => {
        await openCategories(page);
        await search(page);
        const all = await total(page);
        await page.locator(`${G}_length select`).selectOption('7');
        await waitGridLoaded(page);
        expect(await rowCount(page)).toBe(7);
        await page.locator(`${G}_length select`).selectOption('50');
        await waitGridLoaded(page);
        expect(await rowCount(page)).toBe(all);
    });

    test('Search_category_paging_less_than_page_30 - Kiểm tra phân trang khi kết quả ít hơn 1 trang', async ({page}) => {
        await openCategories(page);
        await typeName(page, 'Comp');
        await search(page);
        await expect(page.locator(`${G}_next`)).toHaveClass(/disabled/);
        await expect(page.locator(`${G}_previous`)).toHaveClass(/disabled/);
    });

    test('Search_category_new_search_reset_page_31 - Search mới khi đang ở trang 2', async ({page}) => {
        await openCategories(page);
        await search(page);
        await page.locator(`${G}_next`).click();
        await waitGridLoaded(page);
        await typeName(page, 'Books');
        await search(page);
        expect(await rowCount(page)).toBe(1);
        expect(await gridText(page)).toContain('books');
    });

    test('Search_category_paging_keep_filters_32 - Giữ nguyên bộ lọc khi chuyển trang', async ({page}) => {
        await openCategories(page);
        await choose(page, '#SearchPublishedId', '1');
        await page.locator(`${G}_length select`).selectOption('7');
        await waitGridLoaded(page);
        await search(page);
        await page.locator(`${G}_next`).click();
        await waitGridLoaded(page);
        await expect(page.locator(`${G} .false-icon`)).toHaveCount(0);
        await expect(page.locator('#SearchPublishedId')).toHaveValue('1');
    });

    test('Search_category_edit_button_35 - Kiểm tra nút Edit mở đúng category', async ({page}) => {
        await openCategories(page);
        await typeName(page, 'Books');
        await search(page);
        await page.locator(`${G} tbody tr`).first().getByRole('link', {name: /Edit/i}).click();
        await expect(page).toHaveURL(/\/Admin\/Category\/Edit\/\d+/i, {timeout: 30000});
        await expect(page.locator('#Name')).toHaveValue('Books');
    });

    test('Search_category_add_new_button_36 - Kiểm tra nút Add new', async ({page}) => {
        await openCategories(page);
        await page.locator('a[href*="/Admin/Category/Create"]').first().click();
        await expect(page).toHaveURL(/\/Admin\/Category\/Create/i, {timeout: 30000});
        await expect(page.locator('#Name')).toBeVisible();
    });
});