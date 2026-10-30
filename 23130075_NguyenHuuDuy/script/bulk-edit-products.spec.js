// bulk_edit_products.spec.js
// 30 test tự động cho chức năng cập nhật các cột trong Bulk edit products (Admin > Catalog > Bulk edit products)
import {test, expect} from '@playwright/test';

const BASE = 'http://localhost:8080';
const G = '#products-grid';
const ADMIN_EMAIL = 'admin@yourStore.com';
const ADMIN_PASSWORD = 'Admin@123';
const BULK_URL = BASE + '/Admin/Product/BulkEdit';

// Nút lưu thay đổi trên màn hình Bulk edit: ĐỔI selector này nếu nút của bạn khác
const SAVE_BTN = 'button:has-text("Save"), #bulk-edit-save, #save-products, button[name="save"]';

// Sản phẩm dùng để test (tìm theo tên cho ra đúng 1 dòng) và nhóm 3 dòng (Nikon D5500 DSLR + 2 biến thể)
const PRODUCT = 'Custom T-Shirt';
const GROUP = 'Nikon';

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

// Vào thẳng Bulk edit bằng cookie đã có; chỉ login khi bị đẩy về trang đăng nhập
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
    await waitGridLoaded(page);
}

async function waitGridLoaded(page) {
    await expect(page.locator(`${G} tbody tr`).first()).toBeVisible({timeout: 30000});
    await expect(page.locator(`${G}_processing`)).toBeHidden({timeout: 30000}).catch(() => {});
}

async function searchName(page, name) {
    await page.locator('#SearchProductName').fill(name);
    await page.locator('#search-products').click();
    await page.waitForLoadState('networkidle');
    await waitGridLoaded(page);
}

async function rowCount(page) {
    const rows = page.locator(`${G} tbody tr`);
    const text = (await rows.first().innerText().catch(() => '')) || '';
    if (/No data available|No matching records|Không có dữ liệu/i.test(text)) return 0;
    return rows.count();
}

// Vị trí cột theo tên tiêu đề (Select, Product name, SKU, Price, Old price, Stock quantity, Published)
async function colIndex(page, title) {
    const ths = await page.locator(`${G} thead th`).allInnerTexts();
    const i = ths.findIndex(t => new RegExp(`^\\s*${title}`, 'i').test(t));
    expect(i, `Không tìm thấy cột ${title}`).toBeGreaterThanOrEqual(0);
    return i;
}

async function cell(page, rowIndex, title) {
    const i = await colIndex(page, title);
    return page.locator(`${G} tbody tr`).nth(rowIndex).locator('td').nth(i);
}

async function input(page, rowIndex, title) {
    return (await cell(page, rowIndex, title)).locator('input').first();
}

// Nhập giá trị vào ô của một dòng
async function setCell(page, rowIndex, title, value) {
    const f = await input(page, rowIndex, title);
    await f.fill(String(value));
    await f.press('Tab');
}

// Nhập giá trị thô (kể cả chữ vào ô số) bằng cách gán trực tiếp rồi bắn sự kiện change
async function setRaw(page, rowIndex, title, value) {
    const f = await input(page, rowIndex, title);
    await f.evaluate((el, v) => {
        el.value = v;
        el.dispatchEvent(new Event('input', {bubbles: true}));
        el.dispatchEvent(new Event('change', {bubbles: true}));
    }, String(value));
}

async function setPublished(page, rowIndex, checked) {
    const c = await input(page, rowIndex, 'Published');
    if ((await c.isChecked()) !== checked) await c.setChecked(checked);
}

async function save(page) {
    await page.locator(SAVE_BTN).filter({visible: true}).first().click();
    await page.waitForLoadState('networkidle');
}

// Đọc toàn bộ giá trị các cột của một dòng
async function readRow(page, rowIndex = 0) {
    return {
        name: await (await input(page, rowIndex, 'Product name')).inputValue(),
        sku: await (await input(page, rowIndex, 'SKU')).inputValue(),
        price: parseFloat((await (await input(page, rowIndex, 'Price')).inputValue()).replace(/,/g, '')),
        oldPrice: parseFloat((await (await input(page, rowIndex, 'Old price')).inputValue()).replace(/,/g, '')),
        stock: parseFloat((await (await input(page, rowIndex, 'Stock quantity')).inputValue()).replace(/,/g, '')),
        published: await (await input(page, rowIndex, 'Published')).isChecked()
    };
}

async function snapshotAll(page) {
    const n = await rowCount(page);
    const snaps = [];
    for (let i = 0; i < n; i++) snaps.push(await readRow(page, i));
    return snaps;
}

// Tải lại trang rồi tìm lại để xác nhận dữ liệu thực sự đã lưu vào hệ thống
async function reloadAndSearch(page, name) {
    await openBulk(page);
    await searchName(page, name);
}

async function expectNoServerError(page) {
    await expect(page.locator('body')).not.toContainText(/Server Error|Internal Server Error|Exception/i);
}

// Khôi phục dữ liệu gốc sau khi test để các test sau không bị ảnh hưởng
async function restore(page, ctx) {
    for (const name of ctx.names) {
        await openBulk(page);
        await searchName(page, name);
        if ((await rowCount(page)) === ctx.snaps.length) {
            for (let i = 0; i < ctx.snaps.length; i++) {
                const s = ctx.snaps[i];
                await setCell(page, i, 'Product name', s.name);
                await setCell(page, i, 'SKU', s.sku);
                await setCell(page, i, 'Price', s.price);
                await setCell(page, i, 'Old price', s.oldPrice);
                await setCell(page, i, 'Stock quantity', s.stock);
                await setPublished(page, i, s.published);
            }
            await save(page);
            return;
        }
    }
}

// Chạy một test trên sản phẩm `name`: lưu dữ liệu gốc trước, tự khôi phục sau
async function withProduct(page, name, fn) {
    await openBulk(page);
    await searchName(page, name);
    const snaps = await snapshotAll(page);
    const ctx = {names: [name], snaps, original: snaps[0]};
    try {
        await fn(ctx);
    } finally {
        await restore(page, ctx).catch(() => {});
    }
}

// ------------------------------ tests ------------------------------

test.describe('Admin - Bulk edit products', () => {

    test.setTimeout(180000);

    test('Bulk_edit_products_edit_name_valid_01 - Sửa Product name hợp lệ', async ({page}) => {
        await withProduct(page, PRODUCT, async (ctx) => {
            const newName = `${PRODUCT} Edited`;
            ctx.names.push(newName);
            await setCell(page, 0, 'Product name', newName);
            await save(page);
            await reloadAndSearch(page, newName);
            expect(await rowCount(page)).toBe(1);
            expect((await readRow(page)).name).toBe(newName);
        });
    });

    test('Bulk_edit_products_edit_name_empty_02 - Xóa trống Product name', async ({page}) => {
        await withProduct(page, PRODUCT, async () => {
            await setCell(page, 0, 'Product name', '');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect(await rowCount(page)).toBe(1);
            expect((await readRow(page)).name).toBe(PRODUCT);
        });
    });

    test('Bulk_edit_products_edit_name_special_03 - Sửa Product name chứa ký tự đặc biệt / HTML / script', async ({page}) => {
        let dialogShown = false;
        page.on('dialog', async d => { dialogShown = true; await d.dismiss(); });
        await withProduct(page, PRODUCT, async (ctx) => {
            const bad = '<script>alert(1)</script>';
            ctx.names.push(bad);
            await setCell(page, 0, 'Product name', bad);
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            await expectNoServerError(page);
            expect(dialogShown).toBeFalsy();
        });
    });

    test('Bulk_edit_products_edit_name_max_length_04 - Sửa Product name có độ dài tối đa / vượt tối đa', async ({page}) => {
        await withProduct(page, PRODUCT, async (ctx) => {
            const max = 'T'.repeat(400);
            ctx.names.push(max);
            await setCell(page, 0, 'Product name', max);
            await save(page);
            await reloadAndSearch(page, 'TTTTTTTTTT');
            expect(await rowCount(page)).toBe(1);
            expect((await readRow(page)).name).toBe(max);

            // 401 ký tự: xử lý có kiểm soát, không lỗi hệ thống
            await setCell(page, 0, 'Product name', 'T'.repeat(401));
            await save(page);
            await expectNoServerError(page);
        });
    });

    test('Bulk_edit_products_edit_sku_valid_05 - Sửa SKU hợp lệ', async ({page}) => {
        await withProduct(page, PRODUCT, async () => {
            await setCell(page, 0, 'SKU', 'CS_TSHIRT_NEW');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).sku).toBe('CS_TSHIRT_NEW');
        });
    });

    test('Bulk_edit_products_edit_sku_empty_06 - Xóa trống SKU', async ({page}) => {
        await withProduct(page, PRODUCT, async () => {
            await setCell(page, 0, 'SKU', '');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).sku).toBe('');
        });
    });

    test('Bulk_edit_products_edit_sku_duplicate_07 - Sửa SKU trùng sản phẩm khác', async ({page}) => {
        await withProduct(page, PRODUCT, async () => {
            await setCell(page, 0, 'SKU', 'AP_MBP_13');
            await save(page);
            // Xác nhận theo hành vi thực tế: cho phép lưu hoặc báo lỗi trùng, không lỗi hệ thống
            await expectNoServerError(page);
            await reloadAndSearch(page, PRODUCT);
            expect(await rowCount(page)).toBe(1);
        });
    });

    test('Bulk_edit_products_edit_price_valid_08 - Sửa Price hợp lệ', async ({page}) => {
        await withProduct(page, PRODUCT, async () => {
            await setCell(page, 0, 'Price', '99.99');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).price).toBeCloseTo(99.99, 2);
        });
    });

    test('Bulk_edit_products_edit_price_zero_09 - Sửa Price = 0', async ({page}) => {
        await withProduct(page, PRODUCT, async () => {
            await setCell(page, 0, 'Price', '0');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).price).toBe(0);
        });
    });

    test('Bulk_edit_products_edit_price_negative_10 - Sửa Price là số âm', async ({page}) => {
        await withProduct(page, PRODUCT, async (ctx) => {
            await setCell(page, 0, 'Price', '-10');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            // Mong đợi: không lưu giá âm, dữ liệu cũ không đổi
            expect((await readRow(page)).price).toBe(ctx.original.price);
        });
    });

    test('Bulk_edit_products_edit_price_text_11 - Sửa Price là chữ / ký tự đặc biệt', async ({page}) => {
        await withProduct(page, PRODUCT, async (ctx) => {
            await setRaw(page, 0, 'Price', 'abc');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            await expectNoServerError(page);
            expect((await readRow(page)).price).toBe(ctx.original.price);
        });
    });

    test('Bulk_edit_products_edit_price_empty_12 - Xóa trống Price', async ({page}) => {
        await withProduct(page, PRODUCT, async (ctx) => {
            await setCell(page, 0, 'Price', '');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).price).toBe(ctx.original.price);
        });
    });

    test('Bulk_edit_products_edit_price_max_13 - Sửa Price vượt giá trị tối đa', async ({page}) => {
        await withProduct(page, PRODUCT, async (ctx) => {
            await setCell(page, 0, 'Price', '99999999999999');
            await save(page);
            await expectNoServerError(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).price).not.toBe(99999999999999);
        });
    });

    test('Bulk_edit_products_edit_old_price_valid_14 - Sửa Old price hợp lệ', async ({page}) => {
        await withProduct(page, PRODUCT, async () => {
            await setCell(page, 0, 'Old price', '120.50');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).oldPrice).toBeCloseTo(120.5, 2);
        });
    });

    test('Bulk_edit_products_edit_old_price_negative_15 - Sửa Old price là số âm', async ({page}) => {
        await withProduct(page, PRODUCT, async (ctx) => {
            await setCell(page, 0, 'Old price', '-5');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).oldPrice).toBe(ctx.original.oldPrice);
        });
    });

    test('Bulk_edit_products_edit_old_price_text_16 - Sửa Old price là chữ / để trống', async ({page}) => {
        await withProduct(page, PRODUCT, async (ctx) => {
            await setRaw(page, 0, 'Old price', 'abc');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).oldPrice).toBe(ctx.original.oldPrice);

            await setCell(page, 0, 'Old price', '');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).oldPrice).toBe(ctx.original.oldPrice);
        });
    });

    test('Bulk_edit_products_edit_old_price_less_price_17 - Sửa Old price nhỏ hơn Price', async ({page}) => {
        await withProduct(page, PRODUCT, async () => {
            await setCell(page, 0, 'Price', '100');
            await setCell(page, 0, 'Old price', '50');
            await save(page);
            // Xác nhận theo hành vi thực tế: lưu được hoặc báo lỗi, không lỗi hệ thống
            await expectNoServerError(page);
            await reloadAndSearch(page, PRODUCT);
            expect(await rowCount(page)).toBe(1);
        });
    });

    test('Bulk_edit_products_edit_stock_valid_18 - Sửa Stock quantity hợp lệ', async ({page}) => {
        await withProduct(page, PRODUCT, async () => {
            await setCell(page, 0, 'Stock quantity', '500');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).stock).toBe(500);
        });
    });

    test('Bulk_edit_products_edit_stock_zero_19 - Sửa Stock quantity = 0', async ({page}) => {
        await withProduct(page, PRODUCT, async () => {
            await setCell(page, 0, 'Stock quantity', '0');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).stock).toBe(0);
        });
    });

    test('Bulk_edit_products_edit_stock_negative_20 - Sửa Stock quantity là số âm', async ({page}) => {
        await withProduct(page, PRODUCT, async () => {
            await setCell(page, 0, 'Stock quantity', '-1');
            await save(page);
            // Xác nhận theo hành vi thực tế: báo lỗi hoặc cho phép tồn kho âm, không lỗi hệ thống
            await expectNoServerError(page);
            await reloadAndSearch(page, PRODUCT);
            expect(await rowCount(page)).toBe(1);
        });
    });

    test('Bulk_edit_products_edit_stock_invalid_21 - Sửa Stock quantity là số thập phân / chữ / để trống', async ({page}) => {
        await withProduct(page, PRODUCT, async (ctx) => {
            await setRaw(page, 0, 'Stock quantity', 'abc');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).stock).toBe(ctx.original.stock);

            await setCell(page, 0, 'Stock quantity', '');
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).stock).toBe(ctx.original.stock);

            await setRaw(page, 0, 'Stock quantity', '1.5');
            await save(page);
            await expectNoServerError(page);
            await reloadAndSearch(page, PRODUCT);
            expect(Number.isInteger((await readRow(page)).stock)).toBeTruthy();
        });
    });

    test('Bulk_edit_products_untick_published_22 - Bỏ tick Published', async ({page}) => {
        await withProduct(page, PRODUCT, async () => {
            await setPublished(page, 0, false);
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).published).toBe(false);
        });
    });

    test('Bulk_edit_products_tick_published_23 - Tick Published', async ({page}) => {
        await withProduct(page, PRODUCT, async () => {
            // Chuẩn bị: đưa sản phẩm về trạng thái Unpublished
            await setPublished(page, 0, false);
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).published).toBe(false);

            await setPublished(page, 0, true);
            await save(page);
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).published).toBe(true);
        });
    });

    test('Bulk_edit_products_edit_multi_columns_24 - Sửa nhiều cột của cùng một sản phẩm', async ({page}) => {
        await withProduct(page, PRODUCT, async (ctx) => {
            const newName = `${PRODUCT} Multi`;
            ctx.names.push(newName);
            await setCell(page, 0, 'Product name', newName);
            await setCell(page, 0, 'SKU', 'CS_MULTI');
            await setCell(page, 0, 'Price', '33.5');
            await setCell(page, 0, 'Old price', '44.5');
            await setCell(page, 0, 'Stock quantity', '77');
            await setPublished(page, 0, false);
            await save(page);
            await reloadAndSearch(page, newName);
            const r = await readRow(page);
            expect(r.name).toBe(newName);
            expect(r.sku).toBe('CS_MULTI');
            expect(r.price).toBeCloseTo(33.5, 2);
            expect(r.oldPrice).toBeCloseTo(44.5, 2);
            expect(r.stock).toBe(77);
            expect(r.published).toBe(false);
        });
    });

    test('Bulk_edit_products_edit_multi_products_25 - Sửa nhiều sản phẩm cùng lúc', async ({page}) => {
        await withProduct(page, GROUP, async (ctx) => {
            expect(ctx.snaps.length).toBeGreaterThanOrEqual(3);
            await setCell(page, 0, 'Price', '111');
            await setCell(page, 1, 'Price', '222');
            await setCell(page, 2, 'Price', '333');
            await save(page);
            await reloadAndSearch(page, GROUP);
            expect((await readRow(page, 0)).price).toBe(111);
            expect((await readRow(page, 1)).price).toBe(222);
            expect((await readRow(page, 2)).price).toBe(333);
        });
    });

    test('Bulk_edit_products_save_no_change_26 - Lưu khi không sửa gì', async ({page}) => {
        await withProduct(page, PRODUCT, async (ctx) => {
            await save(page);
            await expectNoServerError(page);
            await reloadAndSearch(page, PRODUCT);
            expect(await readRow(page)).toEqual(ctx.original);
        });
    });

    test('Bulk_edit_products_one_invalid_row_27 - Sửa nhiều dòng trong đó có 1 dòng sai dữ liệu', async ({page}) => {
        await withProduct(page, GROUP, async (ctx) => {
            await setCell(page, 0, 'Price', '111');
            await setRaw(page, 1, 'Price', 'abc');
            await save(page);
            // Xác nhận theo hành vi thực tế: dòng hợp lệ có/không được lưu; dòng sai không được lưu
            await expectNoServerError(page);
            await reloadAndSearch(page, GROUP);
            expect((await readRow(page, 1)).price).toBe(ctx.snaps[1].price);
        });
    });

    test('Bulk_edit_products_persist_after_reload_28 - Dữ liệu đã sửa còn đúng sau khi tải lại trang và tìm kiếm lại', async ({page}) => {
        await withProduct(page, PRODUCT, async () => {
            await setCell(page, 0, 'Price', '45.5');
            await setCell(page, 0, 'Stock quantity', '321');
            await save(page);
            await page.reload();
            await waitGridLoaded(page);
            await searchName(page, PRODUCT);
            let r = await readRow(page);
            expect(r.price).toBeCloseTo(45.5, 2);
            expect(r.stock).toBe(321);
            // Tìm lại lần nữa từ trang mới
            await reloadAndSearch(page, PRODUCT);
            r = await readRow(page);
            expect(r.price).toBeCloseTo(45.5, 2);
            expect(r.stock).toBe(321);
        });
    });

    test('Bulk_edit_products_leave_without_save_29 - Thoát màn hình khi chưa lưu', async ({page}) => {
        await withProduct(page, PRODUCT, async (ctx) => {
            await setCell(page, 0, 'Price', '88');
            // Chuyển sang trang khác rồi quay lại, không bấm lưu
            page.once('dialog', d => d.accept());
            await page.goto(BASE + '/Admin/Product/List');
            await reloadAndSearch(page, PRODUCT);
            expect((await readRow(page)).price).toBe(ctx.original.price);
        });
    });

    test('Bulk_edit_products_edit_on_filtered_31 - Sửa dữ liệu trên kết quả đã lọc', async ({page}) => {
        await openBulk(page);
        await searchName(page, 'Apple MacBook Pro');
        const apple = (await readRow(page)).price;

        await withProduct(page, GROUP, async (ctx) => {
            for (let i = 0; i < ctx.snaps.length; i++) await setCell(page, i, 'Price', '777');
            await save(page);

            await reloadAndSearch(page, GROUP);
            for (let i = 0; i < ctx.snaps.length; i++) expect((await readRow(page, i)).price).toBe(777);

            // Bỏ lọc: sản phẩm khác không bị ảnh hưởng
            await reloadAndSearch(page, 'Apple MacBook Pro');
            expect((await readRow(page)).price).toBe(apple);
        });
    });
});