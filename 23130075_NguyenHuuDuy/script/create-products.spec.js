// create_product.spec.js
// 30 test tự động cho chức năng Create product (Admin > Catalog > Products > Add new)
import {test, expect} from '@playwright/test';

const BASE = 'http://localhost:8080';
const ADMIN_EMAIL = 'admin@yourStore.com';
const ADMIN_PASSWORD = 'Admin@123';
const CREATE_URL = BASE + '/Admin/Product/Create';

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

// Vào thẳng trang Create product bằng cookie đã có; chỉ login khi bị đẩy về trang đăng nhập
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

    await expect(page).toHaveURL(/\/Admin\/Product\/Create/i, {timeout: 30000});
    await expect(page.locator('#Name')).toBeVisible({timeout: 30000});
}

// Tên duy nhất để các lần chạy không đụng nhau
function uniq(prefix = 'AutoTest') {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// Ô số của nopCommerce (Price, Weight...) dùng kendo numeric: lấy ô đang hiển thị
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

// Sau Save and Continue Edit: đang ở trang Edit của sản phẩm vừa tạo
async function expectEditPage(page) {
    await expect(page).toHaveURL(/\/Admin\/Product\/Edit\/\d+/i, {timeout: 30000});
}

// Tạo nhanh 1 sản phẩm chỉ với Name (+ trường bổ sung) rồi ở lại trang Edit
async function createAndEdit(page, name, extra = async () => {}) {
    await openCreate(page);
    await page.locator('#Name').fill(name);
    await extra();
    await saveContinue(page);
    await expectEditPage(page);
}

// Tìm sản phẩm theo tên trong Product list, trả về số dòng khớp
async function listCount(page, name) {
    await page.goto(BASE + '/Admin/Product/List');
    await handleCloudflare(page);
    await page.locator('#SearchProductName').fill(name);
    await Promise.all([
        page.waitForResponse(r => r.url().includes('/Product/ProductList')),
        page.locator('#search-products').click()
    ]);
    const rows = page.locator('#products-grid tbody tr');
    await expect(rows.first()).toBeVisible({timeout: 30000});
    const text = (await rows.first().innerText()) || '';
    if (/No data available|No matching records|Không có dữ liệu/i.test(text)) return 0;
    return rows.count();
}

// ------------------------------ tests ------------------------------

test.describe('Admin - Create Product', () => {

    test.setTimeout(120000);

    // ---------- Hiển thị ----------

    test('Create_product_default_value_01 - Kiểm tra giá trị mặc định trên màn hình Thêm sản phẩm', async ({page}) => {
        await openCreate(page);
        await expect(page.locator('#Name')).toHaveValue('');
        await expect(page.locator('#Sku')).toHaveValue('');
        expect(await numValue(page, 'Price')).toBe(0);
        expect(await numValue(page, 'Weight')).toBe(0);
        expect(await numValue(page, 'Length')).toBe(0);
        expect(await numValue(page, 'Width')).toBe(0);
        expect(await numValue(page, 'Height')).toBe(0);
        await expect(page.locator('#IsTaxExempt')).not.toBeChecked();
        // Tax category = [None], Inventory method = Don't track inventory
        await expect(page.locator('#TaxCategoryId')).toHaveValue('0');
        await expect(page.locator('#ManageInventoryMethodId option:checked')).toHaveText(/Don't track inventory/i);
    });

    test('Create_product_required_mark_02 - Kiểm tra dấu (*) bắt buộc ở trường Product name', async ({page}) => {
        await openCreate(page);
        await expect(page.locator('.form-group:has(#Name) .required, .form-group:has(#Name) :text("*")').first()).toBeVisible();
    });

    test('Create_product_toggle_panel_03 - Kiểm tra thu gọn/mở rộng panel Product info', async ({page}) => {
        await openCreate(page);
        const card = page.locator('.card[data-card-name="product-info"]');
        await card.locator('.card-header').first().click();
        await expect(card).toHaveClass(/collapsed-card/);
        await card.locator('.card-header').first().click();
        await expect(card).not.toHaveClass(/collapsed-card/);
        await expect(page.locator('#Name')).toBeVisible();
    });

    test('Create_product_multimedia_message_04 - Panel Multimedia hiển thị thông báo cần lưu sản phẩm trước', async ({page}) => {
        await openCreate(page);
        await expect(page.getByText(/You need to save the product before you can upload pictures or videos/i)).toBeVisible();
    });

    test('Create_product_attributes_message_05 - Panel Product attributes hiển thị thông báo cần lưu sản phẩm trước', async ({page}) => {
        await openCreate(page);
        await expect(page.getByText(/You need to save the product before you can add attributes/i)).toBeVisible();
    });

    // ---------- Product name ----------

    test('Create_product_valid_name_06 - Lưu sản phẩm với Product name hợp lệ', async ({page}) => {
        const name = uniq('ValidName');
        await openCreate(page);
        await page.locator('#Name').fill(name);
        await save(page);
        await expect(page).toHaveURL(/\/Admin\/Product\/List/i, {timeout: 30000});
        await expectSaved(page);
        expect(await listCount(page, name)).toBe(1);
    });

    test('Create_product_empty_name_07 - Lưu sản phẩm để trống Product name', async ({page}) => {
        await openCreate(page);
        await save(page);
        await expectRejected(page);
        await expect(page).toHaveURL(/\/Admin\/Product\/Create/i);
    });

    test('Create_product_whitespace_name_08 - Lưu sản phẩm với Product name chỉ chứa khoảng trắng', async ({page}) => {
        await openCreate(page);
        await page.locator('#Name').fill('     ');
        await save(page);
        await expectRejected(page);
    });

    test('Create_product_trim_name_09 - Product name có khoảng trắng đầu/cuối được tự động trim', async ({page}) => {
        const name = uniq('TrimTest');
        await createAndEdit(page, `  ${name}  `);
        await expect(page.locator('#Name')).toHaveValue(name);
    });

    test('Create_product_special_chars_name_10 - Product name chứa ký tự đặc biệt', async ({page}) => {
        const name = uniq('Spec') + ' @#$%&\'"';
        await createAndEdit(page, name);
        await expect(page.locator('#Name')).toHaveValue(name);
    });

    test('Create_product_html_name_11 - Product name chứa mã HTML/script không bị thực thi', async ({page}) => {
        let dialogShown = false;
        page.on('dialog', async d => { dialogShown = true; await d.dismiss(); });
        const name = uniq('Html') + '<script>alert(1)</script>';
        await openCreate(page);
        await page.locator('#Name').fill(name);
        await save(page);
        await expect(page).toHaveURL(/\/Admin\/Product\/List/i, {timeout: 30000});
        await page.waitForLoadState('networkidle');
        expect(dialogShown).toBeFalsy();
    });

    test('Create_product_unicode_name_12 - Product name chứa tiếng Việt có dấu / Unicode', async ({page}) => {
        const name = uniq('Điện thoại thông minh');
        await createAndEdit(page, name);
        await expect(page.locator('#Name')).toHaveValue(name);
    });

    test('Create_product_max_length_name_13 - Product name có độ dài tối đa cho phép (400 ký tự)', async ({page}) => {
        const name = 'N' + Date.now() + 'a'.repeat(400 - String(Date.now()).length - 1);
        await openCreate(page);
        await page.locator('#Name').fill(name);
        await save(page);
        await expect(page).toHaveURL(/\/Admin\/Product\/List/i, {timeout: 30000});
        await expectSaved(page);
    });

    test('Create_product_over_length_name_14 - Product name vượt quá độ dài tối đa (401 ký tự)', async ({page}) => {
        await openCreate(page);
        await page.locator('#Name').fill('b'.repeat(401));
        await save(page);
        // Hệ thống phải xử lý có kiểm soát: báo lỗi hoặc lưu theo quy định, không lỗi 500
        await expect(page.locator('.alert-success, .field-validation-error, .validation-summary-errors, .alert-danger, .input-validation-error').first()).toBeVisible({timeout: 30000});
        await expect(page.locator('body')).not.toContainText(/Server Error|Internal Server Error|Exception/i);
    });

    // ---------- Descriptions / SKU ----------

    test('Create_product_short_description_15 - Nhập Short description hợp lệ và lưu', async ({page}) => {
        const name = uniq('ShortDesc');
        await createAndEdit(page, name, async () => {
            await page.locator('#ShortDescription').fill('Mô tả ngắn của sản phẩm');
        });
        await expect(page.locator('#ShortDescription')).toHaveValue('Mô tả ngắn của sản phẩm');
    });

    test('Create_product_sku_valid_16 - Nhập SKU hợp lệ', async ({page}) => {
        const sku = uniq('SKU');
        await createAndEdit(page, uniq('SkuValid'), async () => {
            await page.locator('#Sku').fill(sku);
        });
        await expect(page.locator('#Sku')).toHaveValue(sku);
    });

    test('Create_product_sku_empty_17 - Lưu sản phẩm để trống SKU', async ({page}) => {
        await openCreate(page);
        await page.locator('#Name').fill(uniq('SkuEmpty'));
        await save(page);
        await expectSaved(page);
    });

    test('Create_product_sku_duplicate_18 - SKU trùng với sản phẩm đã tồn tại', async ({page}) => {
        const sku = uniq('DUP');
        await createAndEdit(page, uniq('SkuDupA'), async () => {
            await page.locator('#Sku').fill(sku);
        });
        await openCreate(page);
        await page.locator('#Name').fill(uniq('SkuDupB'));
        await page.locator('#Sku').fill(sku);
        await save(page);
        // Xác nhận theo hành vi thực tế: cho phép lưu hoặc báo lỗi trùng, không lỗi hệ thống
        await expect(page.locator('.alert-success, .field-validation-error, .validation-summary-errors, .alert-danger').first()).toBeVisible({timeout: 30000});
        await expect(page.locator('body')).not.toContainText(/Server Error|Internal Server Error/i);
    });

    // ---------- Categories ----------

    test('Create_product_category_single_19 - Chọn 1 Category rồi lưu', async ({page}) => {
        await createAndEdit(page, uniq('Cat1'), async () => {
            await page.locator('#SelectedCategoryIds').selectOption(['1']);   // Computers
        });
        await expect(page.locator('#SelectedCategoryIds')).toHaveValues(['1']);
    });

    test('Create_product_category_multiple_20 - Chọn nhiều Category rồi lưu', async ({page}) => {
        await createAndEdit(page, uniq('CatMulti'), async () => {
            await page.locator('#SelectedCategoryIds').selectOption(['1', '14']);   // Computers, Books
        });
        await expect(page.locator('#SelectedCategoryIds')).toHaveValues(expect.arrayContaining(['1', '14']));
    });

    // ---------- Prices ----------

    test('Create_product_price_valid_21 - Nhập Price hợp lệ (số dương, có phần thập phân)', async ({page}) => {
        await createAndEdit(page, uniq('PriceOk'), async () => {
            await fillNum(page, 'Price', '99.99');
        });
        expect(await numValue(page, 'Price')).toBeCloseTo(99.99, 2);
    });

    test('Create_product_price_negative_22 - Nhập Price âm', async ({page}) => {
        await openCreate(page);
        await page.locator('#Name').fill(uniq('PriceNeg'));
        await fillNum(page, 'Price', '-10');
        await save(page);
        await expectRejected(page);
    });

    test('Create_product_price_text_23 - Nhập Price là chữ / ký tự đặc biệt', async ({page}) => {
        await openCreate(page);
        await numField(page, 'Price').click();
        await numField(page, 'Price').pressSequentially('abc');
        await numField(page, 'Price').press('Tab');
        // Ô số không chấp nhận chữ: giá trị không thể là 'abc'
        expect(await numField(page, 'Price').inputValue()).not.toMatch(/abc/i);
    });

    test('Create_product_tax_exempt_24 - Tick Tax exempt rồi lưu', async ({page}) => {
        await createAndEdit(page, uniq('TaxExempt'), async () => {
            await page.locator('#IsTaxExempt').check();
        });
        await expect(page.locator('#IsTaxExempt')).toBeChecked();
    });

    test('Create_product_tax_category_25 - Chọn Tax category khác [None]', async ({page}) => {
        let chosen = '0';
        await createAndEdit(page, uniq('TaxCat'), async () => {
            await page.locator('#TaxCategoryId').selectOption({index: 1});
            chosen = await page.locator('#TaxCategoryId').inputValue();
        });
        expect(chosen).not.toBe('0');
        await expect(page.locator('#TaxCategoryId')).toHaveValue(chosen);
    });

    // ---------- Shipping / Inventory ----------

    test('Create_product_shipping_disabled_26 - Bỏ tick Shipping enabled thì các trường kích thước/trọng lượng được ẩn', async ({page}) => {
        await openCreate(page);
        await page.locator('#IsShipEnabled').uncheck();
        await expect(page.locator('.form-group:has(#Weight)')).toBeHidden();
        await page.locator('#IsShipEnabled').check();
        await expect(page.locator('.form-group:has(#Weight)')).toBeVisible();
    });

    test('Create_product_dimensions_valid_27 - Nhập Weight, Length, Width, Height hợp lệ', async ({page}) => {
        await createAndEdit(page, uniq('Dims'), async () => {
            await fillNum(page, 'Weight', '2.5');
            await fillNum(page, 'Length', '10');
            await fillNum(page, 'Width', '20');
            await fillNum(page, 'Height', '30');
        });
        expect(await numValue(page, 'Weight')).toBeCloseTo(2.5, 2);
        expect(await numValue(page, 'Length')).toBeCloseTo(10, 2);
        expect(await numValue(page, 'Width')).toBeCloseTo(20, 2);
        expect(await numValue(page, 'Height')).toBeCloseTo(30, 2);
    });

    test('Create_product_inventory_track_28 - Chọn Inventory method = Track inventory hiển thị trường số lượng tồn kho', async ({page}) => {
        await openCreate(page);
        await page.locator('#ManageInventoryMethodId').selectOption({label: 'Track inventory'});
        await expect(page.locator('.form-group:has(#StockQuantity)')).toBeVisible();
    });

    // ---------- Lưu sản phẩm ----------

    test('Create_product_save_continue_29 - Click Save and Continue Edit với dữ liệu hợp lệ', async ({page}) => {
        const name = uniq('SaveContinue');
        await createAndEdit(page, name);
        await expectSaved(page);
        await expect(page.locator('#Name')).toHaveValue(name);
        // Sau khi lưu, panel Multimedia và Product attributes không còn thông báo "cần lưu trước"
        await expect(page.getByText(/You need to save the product before you can upload pictures or videos/i)).toHaveCount(0);
    });

    test('Create_product_full_data_30 - Lưu sản phẩm khi nhập đầy đủ các trường và dữ liệu khớp sau khi lưu', async ({page}) => {
        const name = uniq('FullData');
        const sku = uniq('FULL');
        await createAndEdit(page, name, async () => {
            await page.locator('#ShortDescription').fill('Mô tả ngắn đầy đủ');
            await page.locator('#Sku').fill(sku);
            await page.locator('#SelectedCategoryIds').selectOption(['1']);
            await fillNum(page, 'Price', '150.5');
            await page.locator('#IsTaxExempt').check();
            await fillNum(page, 'Weight', '1.5');
        });
        await expect(page.locator('#Name')).toHaveValue(name);
        await expect(page.locator('#ShortDescription')).toHaveValue('Mô tả ngắn đầy đủ');
        await expect(page.locator('#Sku')).toHaveValue(sku);
        await expect(page.locator('#SelectedCategoryIds')).toHaveValues(['1']);
        expect(await numValue(page, 'Price')).toBeCloseTo(150.5, 2);
        await expect(page.locator('#IsTaxExempt')).toBeChecked();
        expect(await numValue(page, 'Weight')).toBeCloseTo(1.5, 2);
        expect(await listCount(page, name)).toBe(1);
    });
});