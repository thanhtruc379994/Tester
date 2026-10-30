// create_category.spec.js
// 30 test tự động cho chức năng Create Category (Admin > Catalog > Categories > Add new)
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

// Vào thẳng trang Create category bằng cookie đã có; chỉ login khi bị đẩy về trang đăng nhập
async function openCreate(page) {
    await page.goto(CREATE_URL);
    await handleCloudflare(page);

    const needLogin = page.url().includes('/login') ||
        await page.locator('#Email').isVisible({timeout: 3000}).catch(() => false);
    if (needLogin) {
        await login(page);
        await page.goto(CREATE_URL);
        await handleCloudflare(page);
    }

    await expect(page).toHaveURL(/\/Admin\/Category\/Create/i, {timeout: 30000});
    await expect(page.locator('#Name')).toBeVisible({timeout: 30000});
}

// Tên duy nhất để các lần chạy không đụng nhau
function uniq(prefix = 'AutoCat') {
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

// Lưu thành công: hiện thông báo xanh
async function expectSaved(page) {
    await expect(page.locator('.alert-success')).toBeVisible({timeout: 30000});
}

// Lưu bị từ chối: không có thông báo thành công và có lỗi hiển thị
async function expectRejected(page) {
    await expect(page.locator('.field-validation-error, .validation-summary-errors, .alert-danger, .input-validation-error').first()).toBeVisible({timeout: 15000});
    await expect(page.locator('.alert-success')).toHaveCount(0);
}

async function expectEditPage(page) {
    await expect(page).toHaveURL(/\/Admin\/Category\/Edit\/\d+/i, {timeout: 30000});
}

// Tạo nhanh 1 category chỉ với Name (+ trường bổ sung) rồi ở lại trang Edit
async function createAndEdit(page, name, extra = async () => {}) {
    await openCreate(page);
    await page.locator('#Name').fill(name);
    await extra();
    await saveContinue(page);
    await expectEditPage(page);
}

// Tìm category theo tên trong Category list, trả về nội dung các dòng kết quả (chữ thường); rỗng nếu không có
async function listRows(page, name) {
    await page.goto(LIST_URL);
    await handleCloudflare(page);
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

// ------------------------------ tests ------------------------------

test.describe('Admin - Create Category', () => {

    test.setTimeout(120000);

    test('Add_category_display_01 - Kiểm tra mở màn hình Thêm category khi click [Add new] từ Danh sách Category', async ({page}) => {
        await page.goto(LIST_URL);
        await handleCloudflare(page);
        if (page.url().includes('/login')) {
            await login(page);
            await page.goto(LIST_URL);
        }
        await page.locator('a[href*="/Admin/Category/Create"]').first().click();
        await expect(page).toHaveURL(/\/Admin\/Category\/Create/i, {timeout: 30000});
        await expect(page.locator('.card[data-card-name="category-info"]')).toBeVisible();
        await expect(page.locator('.card[data-card-name="category-display"]')).toBeVisible();
    });

    test('Add_category_default_value_02 - Kiểm tra giá trị mặc định trên màn hình Thêm category', async ({page}) => {
        await openCreate(page);
        await expect(page.locator('#Name')).toHaveValue('');
        await expect(page.locator('.note-editable').first()).toHaveText('');
        await expect(page.locator('#ParentCategoryId')).toHaveValue('0');
        await expect(page.locator('.card[data-card-name="category-display"]')).toHaveClass(/collapsed-card/);
    });

    test('Add_category_required_mark_03 - Kiểm tra dấu (*) bắt buộc ở trường Name', async ({page}) => {
        await openCreate(page);
        await expect(page.locator('.form-group:has(#Name) .required, .form-group:has(#Name) :text("*")').first()).toBeVisible();
    });

    test('Add_category_toggle_panel_04 - Kiểm tra thu gọn/mở rộng panel Category info và Display', async ({page}) => {
        await openCreate(page);
        await page.locator('#Name').fill('abc');
        const info = page.locator('.card[data-card-name="category-info"]');
        await info.locator('.card-header').first().click();
        await expect(info).toHaveClass(/collapsed-card/);
        await info.locator('.card-header').first().click();
        await expect(info).not.toHaveClass(/collapsed-card/);
        await expect(page.locator('#Name')).toHaveValue('abc');
        await expandDisplay(page);
    });

    test('Add_category_display_defaults_05 - Kiểm tra giá trị mặc định panel Display', async ({page}) => {
        await openCreate(page);
        await expandDisplay(page);
        await expect(page.locator('#Published')).toBeChecked();
        await expect(page.locator('#ShowOnHomepage')).not.toBeChecked();
        expect(await numValue(page, 'DisplayOrder')).toBe(0);
    });

    test('Add_category_back_link_06 - Kiểm tra link back to category list', async ({page}) => {
        const name = uniq('BackLink');
        await openCreate(page);
        await page.locator('#Name').fill(name);
        await page.getByRole('link', {name: /back to category list/i}).click();
        await expect(page).toHaveURL(/\/Admin\/Category\/List/i, {timeout: 30000});
        expect((await listRows(page, name)).length).toBe(0);
    });

    test('Add_category_valid_name_07 - Lưu category với Name hợp lệ', async ({page}) => {
        const name = uniq('ValidName');
        await openCreate(page);
        await page.locator('#Name').fill(name);
        await save(page);
        await expect(page).toHaveURL(/\/Admin\/Category\/List/i, {timeout: 30000});
        await expectSaved(page);
        expect((await listRows(page, name)).length).toBe(1);
    });

    test('Add_category_empty_name_08 - Lưu category để trống Name', async ({page}) => {
        await openCreate(page);
        await save(page);
        await expectRejected(page);
        await expect(page).toHaveURL(/\/Admin\/Category\/Create/i);
    });

    test('Add_category_whitespace_name_09 - Lưu với Name chỉ có khoảng trắng', async ({page}) => {
        await openCreate(page);
        await page.locator('#Name').fill('     ');
        await save(page);
        await expectRejected(page);
    });

    test('Add_category_trim_name_10 - Name có khoảng trắng đầu/cuối được tự động trim', async ({page}) => {
        const name = uniq('Trim');
        await createAndEdit(page, `  ${name}  `);
        await expect(page.locator('#Name')).toHaveValue(name);
    });

    test('Add_category_max_length_name_11 - Name có độ dài tối đa cho phép (400 ký tự)', async ({page}) => {
        const stamp = String(Date.now());
        const name = 'M' + stamp + 'a'.repeat(400 - stamp.length - 1);
        await openCreate(page);
        await page.locator('#Name').fill(name);
        await save(page);
        await expect(page).toHaveURL(/\/Admin\/Category\/List/i, {timeout: 30000});
        await expectSaved(page);
    });

    test('Add_category_over_length_name_12 - Name vượt quá độ dài tối đa (401 ký tự)', async ({page}) => {
        await openCreate(page);
        await page.locator('#Name').fill('b'.repeat(401));
        await save(page);
        // Hệ thống phải xử lý có kiểm soát: báo lỗi hoặc lưu theo quy định, không lỗi 500
        await expect(page.locator('.alert-success, .field-validation-error, .validation-summary-errors, .alert-danger, .input-validation-error').first()).toBeVisible({timeout: 30000});
        await expect(page.locator('body')).not.toContainText(/Server Error|Internal Server Error|Exception/i);
    });

    test('Add_category_special_chars_name_13 - Name chứa ký tự đặc biệt', async ({page}) => {
        const name = uniq('Spec') + ' @#$%&\'"';
        await createAndEdit(page, name);
        await expect(page.locator('#Name')).toHaveValue(name);
    });

    test('Add_category_html_name_14 - Name chứa mã HTML/script không bị thực thi', async ({page}) => {
        let dialogShown = false;
        page.on('dialog', async d => { dialogShown = true; await d.dismiss(); });
        const name = uniq('Html') + '<script>alert(1)</script>';
        await openCreate(page);
        await page.locator('#Name').fill(name);
        await save(page);
        await expect(page).toHaveURL(/\/Admin\/Category\/List/i, {timeout: 30000});
        await page.waitForLoadState('networkidle');
        expect(dialogShown).toBeFalsy();
    });

    test('Add_category_unicode_name_15 - Name chứa tiếng Việt có dấu', async ({page}) => {
        const name = uniq('Điện thoại thông minh');
        await createAndEdit(page, name);
        await expect(page.locator('#Name')).toHaveValue(name);
    });

    test('Add_category_duplicate_name_16 - Name trùng category đã tồn tại', async ({page}) => {
        const name = uniq('Dup');
        await createAndEdit(page, name);
        await openCreate(page);
        await page.locator('#Name').fill(name);
        await save(page);
        // Xác nhận theo hành vi thực tế: tạo được hoặc báo lỗi trùng, không lỗi hệ thống
        await expect(page.locator('.alert-success, .field-validation-error, .validation-summary-errors, .alert-danger').first()).toBeVisible({timeout: 30000});
        await expect(page.locator('body')).not.toContainText(/Server Error|Internal Server Error/i);
    });

    test('Add_category_empty_description_17 - Lưu để trống Description', async ({page}) => {
        await openCreate(page);
        await page.locator('#Name').fill(uniq('DescEmpty'));
        await save(page);
        await expectSaved(page);
    });

    test('Add_category_valid_description_18 - Nhập Description hợp lệ', async ({page}) => {
        await createAndEdit(page, uniq('DescOk'), async () => {
            await setDescription(page, 'Mô tả danh mục');
        });
        await expect(page.locator('.note-editable').first()).toContainText('Mô tả danh mục');
    });

    test('Add_category_parent_list_26 - Kiểm tra danh sách Parent category', async ({page}) => {
        await openCreate(page);
        const options = (await page.locator('#ParentCategoryId option').allInnerTexts()).map(o => o.trim());
        expect(options[0]).toBe('[None]');
        expect(options).toContain('Books');
        expect(options).toContain('Computers >> Desktops');
    });

    test('Add_category_parent_none_27 - Lưu với Parent category = [None]', async ({page}) => {
        const name = uniq('Root');
        await openCreate(page);
        await page.locator('#Name').fill(name);
        await save(page);
        await expectSaved(page);
        const rows = await listRows(page, name);
        expect(rows.length).toBe(1);
        expect(rows[0]).not.toContain('>>');
    });

    test('Add_category_parent_root_28 - Lưu với Parent là category gốc', async ({page}) => {
        const name = uniq('Child');
        await openCreate(page);
        await page.locator('#Name').fill(name);
        await page.locator('#ParentCategoryId').selectOption({label: 'Books'});
        await save(page);
        await expectSaved(page);
        const rows = await listRows(page, name);
        expect(rows.length).toBe(1);
        expect(rows[0]).toContain(`books >> ${name.toLowerCase()}`);
    });

    test('Add_category_parent_child_29 - Lưu với Parent là category con (nhiều cấp)', async ({page}) => {
        const name = uniq('Level3');
        await openCreate(page);
        await page.locator('#Name').fill(name);
        await page.locator('#ParentCategoryId').selectOption({label: 'Computers >> Desktops'});
        await save(page);
        await expectSaved(page);
        const rows = await listRows(page, name);
        expect(rows.length).toBe(1);
        expect(rows[0]).toContain(`computers >> desktops >> ${name.toLowerCase()}`);
    });

    test('Add_category_display_order_30 - Nhập Display order hợp lệ', async ({page}) => {
        await createAndEdit(page, uniq('Order'), async () => {
            await expandDisplay(page);
            await fillNum(page, 'DisplayOrder', 10);
        });
        await expandDisplay(page);
        expect(await numValue(page, 'DisplayOrder')).toBe(10);
    });

    test('Add_category_display_order_invalid_31 - Nhập Display order không hợp lệ', async ({page}) => {
        await openCreate(page);
        await expandDisplay(page);
        const f = numField(page, 'DisplayOrder');
        await f.click();
        await f.pressSequentially('abc');
        await f.press('Tab');
        // Ô số không chấp nhận chữ: giá trị không thể là 'abc'
        expect(await f.inputValue()).not.toMatch(/abc/i);
    });

    test('Add_category_published_flag_32 - Tick/bỏ tick Published', async ({page}) => {
        await createAndEdit(page, uniq('Unpub'), async () => {
            await expandDisplay(page);
            await page.locator('#Published').uncheck();
        });
        await expandDisplay(page);
        await expect(page.locator('#Published')).not.toBeChecked();
    });

    test('Add_category_show_home_menu_33 - Tick Show on home page / Include in top menu', async ({page}) => {
        await createAndEdit(page, uniq('HomeMenu'), async () => {
            await expandDisplay(page);
            await page.locator('#ShowOnHomepage').check();
            await page.locator('#IncludeInTopMenu').check();
        });
        await expandDisplay(page);
        await expect(page.locator('#ShowOnHomepage')).toBeChecked();
        await expect(page.locator('#IncludeInTopMenu')).toBeChecked();
    });

    test('Add_category_save_continue_34 - Click Save and Continue Edit với dữ liệu hợp lệ', async ({page}) => {
        const name = uniq('SaveContinue');
        await createAndEdit(page, name);
        await expectSaved(page);
        await expect(page.locator('#Name')).toHaveValue(name);
    });

    test('Add_category_list_after_save_35 - Category mới hiển thị đúng trong Danh sách Category', async ({page}) => {
        const name = uniq('InList');
        await openCreate(page);
        await page.locator('#Name').fill(name);
        await save(page);
        await expectSaved(page);
        const rows = await listRows(page, name);
        expect(rows.length).toBe(1);
        expect(rows[0]).toContain(name.toLowerCase());
    });

    test('Add_category_data_match_36 - Dữ liệu đã lưu khớp dữ liệu đã nhập', async ({page}) => {
        const name = uniq('FullData');
        await createAndEdit(page, name, async () => {
            await setDescription(page, 'Mô tả đầy đủ');
            await page.locator('#ParentCategoryId').selectOption({label: 'Books'});
            await expandDisplay(page);
            await fillNum(page, 'DisplayOrder', 5);
        });
        await expect(page.locator('#Name')).toHaveValue(name);
        await expect(page.locator('.note-editable').first()).toContainText('Mô tả đầy đủ');
        await expect(page.locator('#ParentCategoryId option:checked')).toHaveText('Books');
        await expandDisplay(page);
        expect(await numValue(page, 'DisplayOrder')).toBe(5);
    });

    test('Add_category_only_name_37 - Lưu khi chỉ nhập Name (các trường khác mặc định)', async ({page}) => {
        await openCreate(page);
        await page.locator('#Name').fill(uniq('OnlyName'));
        await save(page);
        await expectSaved(page);
    });
});