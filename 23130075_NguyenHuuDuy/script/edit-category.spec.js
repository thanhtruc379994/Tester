// edit_category.spec.js
// 30 test tự động cho chức năng Edit Category (Category list > nút [Edit] > /Admin/Category/Edit/{id})
import {test, expect} from '@playwright/test';

const BASE = 'http://localhost:8080';
const ADMIN_EMAIL = 'admin@yourStore.com';
const ADMIN_PASSWORD = 'Admin@123';
const CREATE_URL = BASE + '/Admin/Category/Create';
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

// Mở một URL admin bằng cookie đã có; chỉ login khi bị đẩy về trang đăng nhập
async function gotoAdmin(page, url) {
    await page.goto(url);
    await handleCloudflare(page);
    const needLogin = page.url().includes('/login') ||
        await page.locator('#Email').isVisible({timeout: 3000}).catch(() => false);
    if (needLogin) {
        await login(page);
        await page.goto(url);
        await handleCloudflare(page);
    }
}

async function openEdit(page, id) {
    await gotoAdmin(page, `${BASE}/Admin/Category/Edit/${id}`);
    await expect(page).toHaveURL(new RegExp(`/Admin/Category/Edit/${id}`, 'i'), {timeout: 30000});
    await expect(page.locator('#Name')).toBeVisible({timeout: 30000});
}

function uniq(prefix = 'EditCat') {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// Panel Display mặc định thu gọn: mở ra trước khi thao tác
async function expandDisplay(page) {
    const card = page.locator('.card[data-card-name="category-display"]');
    if (await card.evaluate(el => el.classList.contains('collapsed-card')).catch(() => false)) {
        await card.locator('.card-header').first().click();
    }
    await expect(card).not.toHaveClass(/collapsed-card/);
}

// Ô số (Display order) dùng kendo numeric: lấy ô đang hiển thị
function numField(page, id) {
    return page.locator(`.form-group:has(#${id}) input:visible`).first();
}

async function fillNum(page, id, value) {
    const f = numField(page, id);
    await f.click();
    await f.fill(String(value));
    await f.press('Tab');
}

async function numValue(page, id) {
    return parseFloat((await numField(page, id).inputValue()).replace(/,/g, ''));
}

// Description dùng trình soạn thảo (vùng .note-editable)
async function setDescription(page, text) {
    const editor = page.locator('.note-editable').first();
    await editor.click();
    await editor.fill(text);
}

async function save(page) {
    await page.locator('button[name="save"]').click();
}

async function saveContinue(page) {
    await page.locator('button[name="save-continue"]').click();
}

async function expectSaved(page) {
    await expect(page.locator('.alert-success')).toBeVisible({timeout: 30000});
}

async function expectRejected(page) {
    await expect(page.locator('.field-validation-error, .validation-summary-errors, .alert-danger, .input-validation-error').first()).toBeVisible({timeout: 15000});
    await expect(page.locator('.alert-success')).toHaveCount(0);
}

async function expectNoServerError(page) {
    await expect(page.locator('body')).not.toContainText(/Server Error|Internal Server Error|Exception/i);
}

// Tạo category thử nghiệm qua màn hình Create, kết thúc ở trang Edit; trả về {id, name}
async function createCategory(page, {name = uniq(), parent = null, description = null} = {}) {
    await gotoAdmin(page, CREATE_URL);
    await expect(page.locator('#Name')).toBeVisible({timeout: 30000});
    await page.locator('#Name').fill(name);
    if (description) await setDescription(page, description);
    if (parent) await page.locator('#ParentCategoryId').selectOption({label: parent});
    await saveContinue(page);
    await expect(page).toHaveURL(/\/Admin\/Category\/Edit\/\d+/i, {timeout: 30000});
    const id = page.url().match(/Edit\/(\d+)/i)[1];
    return {id, name};
}

// Xóa category thử nghiệm (dọn dữ liệu)
async function deleteCategory(page, id) {
    await gotoAdmin(page, `${BASE}/Admin/Category/Edit/${id}`);
    const btn = page.locator('#category-delete');
    if (!(await btn.isVisible({timeout: 5000}).catch(() => false))) return;
    await btn.click();
    await page.locator('#category-delete-confirmation button[type="submit"]').click();
    await page.waitForURL(/\/Admin\/Category\/List/i, {timeout: 30000});
}

// Chạy test với các category thử nghiệm: tự tạo qua ctx.make(), tự xóa khi xong (con xóa trước cha)
async function withCats(page, fn) {
    const ctx = {ids: []};
    ctx.make = async (opts) => {
        const c = await createCategory(page, opts);
        ctx.ids.push(c.id);
        return c;
    };
    try {
        await fn(ctx);
    } finally {
        for (const id of [...ctx.ids].reverse()) {
            await deleteCategory(page, id).catch(() => {});
        }
    }
}

// Tìm category theo tên trong Category list, trả về nội dung các dòng (chữ thường); rỗng nếu không có
async function listRows(page, name) {
    await gotoAdmin(page, LIST_URL);
    await page.locator('#SearchCategoryName').fill(name);
    await Promise.all([
        page.waitForResponse(r => r.url().includes('/Category/List') && r.request().method() === 'POST'),
        page.locator('#search-categories').click()
    ]);
    const rows = page.locator('#categories-grid tbody tr');
    await expect(rows.first()).toBeVisible({timeout: 30000});
    const text = (await rows.first().innerText()) || '';
    if (/No data available|No matching records|Không có dữ liệu/i.test(text)) return [];
    return (await rows.allInnerTexts()).map(t => t.toLowerCase());
}

async function parentLabel(page) {
    return (await page.locator('#ParentCategoryId option:checked').innerText()).trim();
}

// ------------------------------ tests ------------------------------

test.describe('Admin - Edit Category', () => {

    test.setTimeout(180000);

    test('Edit_category_display_01 - Mở màn hình Edit từ Category list', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            await gotoAdmin(page, LIST_URL);
            await page.locator('#SearchCategoryName').fill(c.name);
            await Promise.all([
                page.waitForResponse(r => r.url().includes('/Category/List') && r.request().method() === 'POST'),
                page.locator('#search-categories').click()
            ]);
            await page.locator('#categories-grid tbody tr').first().getByRole('link', {name: /Edit/i}).click();
            await expect(page).toHaveURL(new RegExp(`/Admin/Category/Edit/${c.id}`, 'i'), {timeout: 30000});
            await expect(page.locator('#Name')).toHaveValue(c.name);
            await expect(page.locator('button[name="save"]')).toBeVisible();
            await expect(page.locator('button[name="save-continue"]')).toBeVisible();
            await expect(page.locator('#category-delete')).toBeVisible();
        });
    });

    test('Edit_category_old_data_02 - Dữ liệu cũ hiển thị đúng', async ({page}) => {
        await withCats(page, async (ctx) => {
            const parent = await ctx.make();
            const c = await ctx.make({parent: parent.name, description: 'Mô tả ban đầu'});
            await openEdit(page, c.id);
            await expect(page.locator('#Name')).toHaveValue(c.name);
            await expect(page.locator('.note-editable').first()).toContainText('Mô tả ban đầu');
            expect(await parentLabel(page)).toBe(parent.name);
        });
    });

    test('Edit_category_back_link_05 - Kiểm tra link back to category list', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            await openEdit(page, c.id);
            await page.locator('#Name').fill('Changed but not saved');
            await page.getByRole('link', {name: /back to category list/i}).click();
            await expect(page).toHaveURL(/\/Admin\/Category\/List/i, {timeout: 30000});
            await openEdit(page, c.id);
            await expect(page.locator('#Name')).toHaveValue(c.name);
        });
    });

    test('Edit_category_invalid_id_06 - Truy cập Edit với Id không tồn tại', async ({page}) => {
        await gotoAdmin(page, `${BASE}/Admin/Category/Edit/99999999`);
        await expectNoServerError(page);
        // Quay về danh sách hoặc báo lỗi hợp lệ, không hiển thị form sửa
        const onList = /\/Admin\/Category\/List/i.test(page.url());
        const hasMsg = (await page.locator('.alert, .validation-summary-errors').count()) > 0;
        expect(onList || hasMsg).toBeTruthy();
    });

    test('Edit_category_valid_name_07 - Sửa Name hợp lệ', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            const newName = uniq('Renamed');
            await openEdit(page, c.id);
            await page.locator('#Name').fill(newName);
            await saveContinue(page);
            await expectSaved(page);
            await openEdit(page, c.id);
            await expect(page.locator('#Name')).toHaveValue(newName);
        });
    });

    test('Edit_category_empty_name_08 - Xóa trống Name', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            await openEdit(page, c.id);
            await page.locator('#Name').fill('');
            await save(page);
            await expectRejected(page);
            await openEdit(page, c.id);
            await expect(page.locator('#Name')).toHaveValue(c.name);
        });
    });

    test('Edit_category_whitespace_name_09 - Sửa Name chỉ còn khoảng trắng', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            await openEdit(page, c.id);
            await page.locator('#Name').fill('     ');
            await save(page);
            await expectRejected(page);
        });
    });

    test('Edit_category_over_length_name_11 - Sửa Name vượt độ dài tối đa', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            await openEdit(page, c.id);
            await page.locator('#Name').fill('b'.repeat(401));
            await save(page);
            // Xử lý có kiểm soát: báo lỗi hoặc lưu theo quy định, không lỗi 500
            await expect(page.locator('.alert-success, .field-validation-error, .validation-summary-errors, .alert-danger, .input-validation-error').first()).toBeVisible({timeout: 30000});
            await expectNoServerError(page);
        });
    });

    test('Edit_category_special_chars_name_12 - Sửa Name thành ký tự đặc biệt', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            const name = uniq('Spec') + ' @#$%&\'"';
            await openEdit(page, c.id);
            await page.locator('#Name').fill(name);
            await saveContinue(page);
            await expectSaved(page);
            await expect(page.locator('#Name')).toHaveValue(name);
        });
    });

    test('Edit_category_html_name_13 - Sửa Name chứa HTML/script', async ({page}) => {
        let dialogShown = false;
        page.on('dialog', async d => { dialogShown = true; await d.dismiss(); });
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            await openEdit(page, c.id);
            await page.locator('#Name').fill(uniq('Html') + '<script>alert(1)</script>');
            await save(page);
            await expect(page).toHaveURL(/\/Admin\/Category\/List/i, {timeout: 30000});
            await page.waitForLoadState('networkidle');
            expect(dialogShown).toBeFalsy();
        });
    });

    test('Edit_category_unicode_name_14 - Sửa Name thành tiếng Việt có dấu', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            const name = uniq('Máy tính');
            await openEdit(page, c.id);
            await page.locator('#Name').fill(name);
            await saveContinue(page);
            await expectSaved(page);
            await expect(page.locator('#Name')).toHaveValue(name);
        });
    });

    test('Edit_category_duplicate_name_15 - Sửa Name trùng category khác', async ({page}) => {
        await withCats(page, async (ctx) => {
            const a = await ctx.make();
            const b = await ctx.make();
            await openEdit(page, b.id);
            await page.locator('#Name').fill(a.name);
            await save(page);
            // Xác nhận theo hành vi thực tế: lưu được hoặc báo lỗi trùng, không lỗi hệ thống
            await expect(page.locator('.alert-success, .field-validation-error, .validation-summary-errors, .alert-danger').first()).toBeVisible({timeout: 30000});
            await expectNoServerError(page);
        });
    });

    test('Edit_category_no_change_16 - Lưu khi không thay đổi gì', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make({description: 'Giữ nguyên'});
            await openEdit(page, c.id);
            await save(page);
            await expect(page).toHaveURL(/\/Admin\/Category\/List/i, {timeout: 30000});
            await expectSaved(page);
            await openEdit(page, c.id);
            await expect(page.locator('#Name')).toHaveValue(c.name);
            await expect(page.locator('.note-editable').first()).toContainText('Giữ nguyên');
        });
    });

    test('Edit_category_valid_description_17 - Sửa Description hợp lệ', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            await openEdit(page, c.id);
            await setDescription(page, 'Mô tả mới');
            await saveContinue(page);
            await expectSaved(page);
            await openEdit(page, c.id);
            await expect(page.locator('.note-editable').first()).toContainText('Mô tả mới');
        });
    });

    test('Edit_category_empty_description_18 - Xóa trống Description', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make({description: 'Sẽ bị xóa'});
            await openEdit(page, c.id);
            await setDescription(page, '');
            await saveContinue(page);
            await expectSaved(page);
            await openEdit(page, c.id);
            await expect(page.locator('.note-editable').first()).toHaveText('');
        });
    });

    test('Edit_category_parent_to_other_21 - Đổi Parent category từ [None] sang category khác', async ({page}) => {
        await withCats(page, async (ctx) => {
            const parent = await ctx.make();
            const c = await ctx.make();
            await openEdit(page, c.id);
            await page.locator('#ParentCategoryId').selectOption({label: parent.name});
            await save(page);
            await expectSaved(page);
            const rows = await listRows(page, c.name);
            expect(rows.length).toBe(1);
            expect(rows[0]).toContain(`${parent.name.toLowerCase()} >> ${c.name.toLowerCase()}`);
        });
    });

    test('Edit_category_parent_to_none_22 - Đổi Parent category về [None]', async ({page}) => {
        await withCats(page, async (ctx) => {
            const parent = await ctx.make();
            const c = await ctx.make({parent: parent.name});
            await openEdit(page, c.id);
            await page.locator('#ParentCategoryId').selectOption({label: '[None]'});
            await save(page);
            await expectSaved(page);
            const rows = await listRows(page, c.name);
            expect(rows.length).toBe(1);
            expect(rows[0]).not.toContain('>>');
        });
    });

    test('Edit_category_parent_change_23 - Đổi sang Parent category khác', async ({page}) => {
        await withCats(page, async (ctx) => {
            const p1 = await ctx.make();
            const p2 = await ctx.make();
            const c = await ctx.make({parent: p1.name});
            await openEdit(page, c.id);
            await page.locator('#ParentCategoryId').selectOption({label: p2.name});
            await save(page);
            await expectSaved(page);
            const rows = await listRows(page, c.name);
            expect(rows.length).toBe(1);
            expect(rows[0]).toContain(`${p2.name.toLowerCase()} >> ${c.name.toLowerCase()}`);
        });
    });

    test('Edit_category_parent_self_24 - Chọn chính category đang sửa làm Parent', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            await openEdit(page, c.id);
            const options = (await page.locator('#ParentCategoryId option').allInnerTexts()).map(o => o.trim());
            if (!options.includes(c.name)) return;   // Không cho chọn: đạt yêu cầu
            await page.locator('#ParentCategoryId').selectOption({label: c.name});
            await save(page);
            await expectNoServerError(page);
            // Nếu hệ thống cho lưu, category vẫn không được làm cha của chính nó
            await openEdit(page, c.id);
            expect(await parentLabel(page)).not.toBe(c.name);
        });
    });

    test('Edit_category_parent_loop_25 - Chọn category con của nó làm Parent', async ({page}) => {
        await withCats(page, async (ctx) => {
            const parent = await ctx.make();
            const child = await ctx.make({parent: parent.name});
            await openEdit(page, parent.id);
            const label = `${parent.name} >> ${child.name}`;
            const options = (await page.locator('#ParentCategoryId option').allInnerTexts()).map(o => o.trim());
            if (!options.includes(label)) return;   // Không cho chọn: đạt yêu cầu
            await page.locator('#ParentCategoryId').selectOption({label});
            await save(page);
            await expectNoServerError(page);
            // Không được tạo vòng lặp: cha vẫn là category gốc
            await openEdit(page, parent.id);
            expect(await parentLabel(page)).toBe('[None]');
        });
    });

    test('Edit_category_display_order_27 - Sửa Display order hợp lệ', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            await openEdit(page, c.id);
            await expandDisplay(page);
            await fillNum(page, 'DisplayOrder', 20);
            await saveContinue(page);
            await expectSaved(page);
            await openEdit(page, c.id);
            await expandDisplay(page);
            expect(await numValue(page, 'DisplayOrder')).toBe(20);
        });
    });

    test('Edit_category_display_order_invalid_28 - Display order không hợp lệ', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            await openEdit(page, c.id);
            await expandDisplay(page);
            const f = numField(page, 'DisplayOrder');
            await f.click();
            await f.pressSequentially('abc');
            await f.press('Tab');
            // Ô số không chấp nhận chữ: giá trị không thể là 'abc'
            expect(await f.inputValue()).not.toMatch(/abc/i);
        });
    });

    test('Edit_category_unpublish_29 - Bỏ tick Published', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            await openEdit(page, c.id);
            await expandDisplay(page);
            await page.locator('#Published').uncheck();
            await save(page);
            await expectSaved(page);
            await openEdit(page, c.id);
            await expandDisplay(page);
            await expect(page.locator('#Published')).not.toBeChecked();
            // Category List hiển thị biểu tượng ✗
            await listRows(page, c.name);
            await expect(page.locator('#categories-grid tbody tr').first().locator('.false-icon')).toHaveCount(1);
        });
    });

    test('Edit_category_republish_30 - Tick Published lại', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            // Chuẩn bị: đưa category về trạng thái Unpublished
            await openEdit(page, c.id);
            await expandDisplay(page);
            await page.locator('#Published').uncheck();
            await saveContinue(page);
            await expectSaved(page);

            await expandDisplay(page);
            await page.locator('#Published').check();
            await saveContinue(page);
            await expectSaved(page);
            await openEdit(page, c.id);
            await expandDisplay(page);
            await expect(page.locator('#Published')).toBeChecked();
            await listRows(page, c.name);
            await expect(page.locator('#categories-grid tbody tr').first().locator('.true-icon')).toHaveCount(1);
        });
    });

    test('Edit_category_save_32 - Click Save với dữ liệu hợp lệ', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            const newName = uniq('Saved');
            await openEdit(page, c.id);
            await page.locator('#Name').fill(newName);
            await save(page);
            await expect(page).toHaveURL(/\/Admin\/Category\/List/i, {timeout: 30000});
            await expectSaved(page);
            expect((await listRows(page, newName)).length).toBe(1);
        });
    });

    test('Edit_category_save_continue_33 - Click Save and Continue Edit', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            const newName = uniq('Continue');
            await openEdit(page, c.id);
            await page.locator('#Name').fill(newName);
            await saveContinue(page);
            await expect(page).toHaveURL(new RegExp(`/Admin/Category/Edit/${c.id}`, 'i'), {timeout: 30000});
            await expectSaved(page);
            await expect(page.locator('#Name')).toHaveValue(newName);
        });
    });

    test('Edit_category_list_after_save_34 - Thay đổi hiển thị đúng trong Category list', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            const newName = uniq('InList');
            await openEdit(page, c.id);
            await page.locator('#Name').fill(newName);
            await expandDisplay(page);
            await fillNum(page, 'DisplayOrder', 7);
            await save(page);
            await expectSaved(page);
            const rows = await listRows(page, newName);
            expect(rows.length).toBe(1);
            expect(rows[0]).toContain(newName.toLowerCase());
            expect(rows[0]).toContain('7');
        });
    });

    test('Edit_category_leave_without_save_35 - Thoát khi chưa lưu', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            await openEdit(page, c.id);
            await page.locator('#Name').fill('Not saved name');
            page.once('dialog', d => d.accept());
            await gotoAdmin(page, LIST_URL);
            await openEdit(page, c.id);
            await expect(page.locator('#Name')).toHaveValue(c.name);
        });
    });

    test('Edit_category_delete_confirm_38 - Xóa category và xác nhận', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            await openEdit(page, c.id);
            await page.locator('#category-delete').click();
            await page.locator('#category-delete-confirmation button[type="submit"]').click();
            await expect(page).toHaveURL(/\/Admin\/Category\/List/i, {timeout: 30000});
            await expectSaved(page);
            expect((await listRows(page, c.name)).length).toBe(0);
        });
    });

    test('Edit_category_delete_cancel_39 - Xóa category rồi chọn Cancel', async ({page}) => {
        await withCats(page, async (ctx) => {
            const c = await ctx.make();
            await openEdit(page, c.id);
            await page.locator('#category-delete').click();
            await page.locator('#category-delete-confirmation [data-dismiss="modal"]').first().click();
            await expect(page).toHaveURL(new RegExp(`/Admin/Category/Edit/${c.id}`, 'i'));
            await expect(page.locator('#Name')).toHaveValue(c.name);
            expect((await listRows(page, c.name)).length).toBe(1);
        });
    });
});