# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 23130075_NguyenHuuDuy/script/create-products.spec.js >> Admin - Create Product >> Create_product_price_negative_22 - Nhập Price âm
- Location: 23130075_NguyenHuuDuy/script/create-products.spec.js:311:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.field-validation-error, .validation-summary-errors, .alert-danger, .input-validation-error').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.field-validation-error, .validation-summary-errors, .alert-danger, .input-validation-error').first() with timeout 15000ms
  - waiting for locator('.field-validation-error, .validation-summary-errors, .alert-danger, .input-validation-error').first()

```

```yaml
- navigation:
  - list:
    - listitem:
      - link:
        - /url: "#"
  - link:
    - /url: /Admin
  - list:
    - listitem:
      - combobox "English":
        - textbox "English"
    - listitem:
      - link "John Smith":
        - /url: "#"
    - listitem:
      - link "Logout":
        - /url: /logout
    - listitem
    - listitem:
      - link "Public store":
        - /url: /
    - listitem:
      - link:
        - /url: "#"
- complementary:
  - link "logo.png":
    - /url: /Admin
    - img "logo.png"
  - textbox "Search"
  - navigation:
    - menu:
      - listitem:
        - link "Dashboard":
          - /url: /Admin
          - paragraph: Dashboard
      - listitem:
        - link "Catalog":
          - /url: "#"
          - paragraph: Catalog
        - list:
          - listitem:
            - link "Products":
              - /url: /Admin/Product/List
              - paragraph: Products
          - listitem:
            - link "Categories":
              - /url: /Admin/Category/List
              - paragraph: Categories
          - listitem:
            - link "Manufacturers":
              - /url: /Admin/Manufacturer/List
              - paragraph: Manufacturers
          - listitem:
            - link "Product reviews":
              - /url: /Admin/ProductReview/List
              - paragraph: Product reviews
          - listitem:
            - link "Product tags":
              - /url: /Admin/Product/ProductTags
              - paragraph: Product tags
          - listitem:
            - link "Attributes":
              - /url: "#"
              - paragraph: Attributes
          - listitem:
            - link "Price lists":
              - /url: /Admin/PriceList/List
              - paragraph: Price lists
      - listitem:
        - link "Sales":
          - /url: "#"
          - paragraph: Sales
      - listitem:
        - link "Customers":
          - /url: "#"
          - paragraph: Customers
      - listitem:
        - link "Promotions":
          - /url: "#"
          - paragraph: Promotions
      - listitem:
        - link "Content management":
          - /url: "#"
          - paragraph: Content management
      - listitem:
        - link "Configuration":
          - /url: "#"
          - paragraph: Configuration
      - listitem:
        - link "System":
          - /url: "#"
          - paragraph: System
      - listitem:
        - link "Reports":
          - /url: "#"
          - paragraph: Reports
      - listitem:
        - link "Help":
          - /url: "#"
          - paragraph: Help
- text: The new product has been added successfully.
- heading "Products" [level=1]
- link "Add new":
  - /url: /Admin/Product/Create
- link "Bulk edit products":
  - /url: /Admin/Product/BulkEdit
- button "Download catalog as PDF"
- button "Export"
- button
- button "Import"
- button "Delete (selected)"
- text: Search Product name
- textbox "Product name"
- text: Category
- combobox "All":
  - textbox "All"
- text: Search subcategories
- checkbox "Search subcategories"
- text: Manufacturer
- combobox "All":
  - textbox "All"
- text: Vendor
- combobox "All":
  - textbox "All"
- text: Warehouse
- combobox "All":
  - textbox "All"
- text: Product type
- combobox "All":
  - textbox "All"
- text: Published
- combobox "All":
  - textbox "All"
- text: Go directly to product SKU
- textbox "Go directly to product SKU"
- button "Go"
- button "Search"
- text: Learn more about
- link "products":
  - /url: https://docs.nopcommerce.com/running-your-store/catalog/products/index.html?utm_source=admin-panel&utm_medium=admin-page&utm_campaign=documentation&utm_content=doc-reference
- table:
  - rowgroup:
    - row "Picture Product name SKU Price Stock quantity Published Edit":
      - columnheader:
        - checkbox
      - columnheader "Picture"
      - columnheader "Product name"
      - columnheader "SKU"
      - columnheader "Price"
      - columnheader "Stock quantity"
      - columnheader "Published"
      - columnheader "Edit"
- table:
  - rowgroup:
    - row "Picture Product name SKU Price Stock quantity Published Edit":
      - columnheader:
        - checkbox
      - columnheader "Picture"
      - columnheader "Product name"
      - columnheader "SKU"
      - columnheader "Price"
      - columnheader "Stock quantity"
      - columnheader "Published"
      - columnheader "Edit"
  - rowgroup:
    - row "Build your own computer COMP_CUST $1,200.00 10000 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "Build your own computer"
      - cell "COMP_CUST"
      - cell "$1,200.00"
      - cell "10000"
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/1
    - row "Digital Storm VANQUISH Custom Performance PC hehe DS_VA3_PC $1,259.00 10000 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "Digital Storm VANQUISH Custom Performance PC hehe"
      - cell "DS_VA3_PC"
      - cell "$1,259.00"
      - cell "10000"
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/2
    - row "Lenovo IdeaCentre LE_IC_600 $500.00 10000 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "Lenovo IdeaCentre"
      - cell "LE_IC_600"
      - cell "$500.00"
      - cell "10000"
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/3
    - row "Apple MacBook Pro AP_MBP_13 $1,800.00 10000 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "Apple MacBook Pro"
      - cell "AP_MBP_13"
      - cell "$1,800.00"
      - cell "10000"
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/4
    - row "Asus Laptop AS_551_LP $1,500.00 10000 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "Asus Laptop"
      - cell "AS_551_LP"
      - cell "$1,500.00"
      - cell "10000"
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/5
    - row "Samsung Premium Ultrabook SM_900_PU $1,590.00 10000 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "Samsung Premium Ultrabook"
      - cell "SM_900_PU"
      - cell "$1,590.00"
      - cell "10000"
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/6
    - row "HP Spectre XT Pro UltraBook HP_SPX_UB $1,350.00 10000 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "HP Spectre XT Pro UltraBook"
      - cell "HP_SPX_UB"
      - cell "$1,350.00"
      - cell "10000"
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/7
    - row "HP Envy 15.6-Inch Sleekbook HP_ESB_15 $1,460.00 10000 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "HP Envy 15.6-Inch Sleekbook"
      - cell "HP_ESB_15"
      - cell "$1,460.00"
      - cell "10000"
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/8
    - row "Lenovo Thinkpad Carbon Laptop LE_TX1_CL $1,360.00 10000 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "Lenovo Thinkpad Carbon Laptop"
      - cell "LE_TX1_CL"
      - cell "$1,360.00"
      - cell "10000"
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/9
    - row "Adobe Photoshop AD_CS4_PH $75.00 10000 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "Adobe Photoshop"
      - cell "AD_CS4_PH"
      - cell "$75.00"
      - cell "10000"
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/10
    - row "Microsoft Windows OS MS_WIN_8P $65.00 10000 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "Microsoft Windows OS"
      - cell "MS_WIN_8P"
      - cell "$65.00"
      - cell "10000"
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/11
    - row "Sound Forge Pro (recurring) SF_PRO_11 $54.99 10000 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "Sound Forge Pro (recurring)"
      - cell "SF_PRO_11"
      - cell "$54.99"
      - cell "10000"
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/12
    - row "Nikon D5500 DSLR N5500DS_0 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "Nikon D5500 DSLR"
      - cell "N5500DS_0"
      - cell
      - cell
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/13
    - row "Nikon D5500 DSLR - Black N5500DS_B $670.00 10000 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "Nikon D5500 DSLR - Black"
      - cell "N5500DS_B"
      - cell "$670.00"
      - cell "10000"
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/14
    - row "Nikon D5500 DSLR - Red N5500DS_R $630.00 10000 Edit":
      - cell:
        - checkbox
      - cell:
        - img
      - cell "Nikon D5500 DSLR - Red"
      - cell "N5500DS_R"
      - cell "$630.00"
      - cell "10000"
      - cell
      - cell "Edit":
        - link "Edit":
          - /url: /Admin/Product/Edit/15
- table
- navigation "pagination":
  - list:
    - listitem: Previous
    - listitem:
      - link "1":
        - /url: "#"
    - listitem:
      - link "2":
        - /url: "#"
    - listitem:
      - link "3":
        - /url: "#"
    - listitem:
      - link "4":
        - /url: "#"
    - listitem:
      - link "5":
        - /url: "#"
    - listitem:
      - link "6":
        - /url: "#"
    - listitem:
      - link "Next":
        - /url: "#"
- text: Show
- combobox "Show items":
  - option "7"
  - option "15" [selected]
  - option "20"
  - option "50"
  - option "100"
- text: items
- status: 1-15 of 82 items
- button
- text: Powered by
- link "nopCommerce":
  - /url: https://www.nopcommerce.com/?utm_source=admin-panel&utm_medium=footer&utm_campaign=admin-panel
- text: Friday, October 30, 2026 6:31 AM nopCommerce version 5.00.0
```

# Test source

```ts
  1   | // create_product.spec.js
  2   | // 30 test tự động cho chức năng Create product (Admin > Catalog > Products > Add new)
  3   | import {test, expect} from '@playwright/test';
  4   | 
  5   | const BASE = 'http://localhost:8080';
  6   | const ADMIN_EMAIL = 'admin@yourStore.com';
  7   | const ADMIN_PASSWORD = 'Admin@123';
  8   | const CREATE_URL = BASE + '/Admin/Product/Create';
  9   | 
  10  | // ===== Nếu file của bạn đã có sẵn handleCloudflare thì XÓA hàm tạm này =====
  11  | async function handleCloudflare(page) {
  12  |     // TODO: dùng hàm handleCloudflare thật của bạn
  13  | }
  14  | 
  15  | async function login(page) {
  16  |     if (page.url().includes('/Admin') && !page.url().includes('/login')) {
  17  |         return;
  18  |     }
  19  |     await page.goto(BASE + '/Admin');
  20  |     await handleCloudflare(page);
  21  | 
  22  |     const isDashboard = await page.locator('.main-sidebar, .brand-link, .nav-sidebar').isVisible({timeout: 5000}).catch(() => false);
  23  |     if (isDashboard) {
  24  |         return;
  25  |     }
  26  | 
  27  |     if (await page.locator('#Email').isVisible({timeout: 3000}).catch(() => false)) {
  28  |         await page.locator('#Email').fill(ADMIN_EMAIL);
  29  |         await page.locator('#Password').fill(ADMIN_PASSWORD);
  30  |         await page.locator('button.login-button, button[type="submit"]:has-text("Log in")').first().click();
  31  |         await handleCloudflare(page);
  32  |         await page.waitForURL(/\/Admin/i, {timeout: 60000});
  33  |     }
  34  | }
  35  | 
  36  | // ------------------------------ helpers ------------------------------
  37  | 
  38  | // Vào thẳng trang Create product bằng cookie đã có; chỉ login khi bị đẩy về trang đăng nhập
  39  | async function openCreate(page) {
  40  |     await page.goto(CREATE_URL);
  41  |     await handleCloudflare(page);
  42  | 
  43  |     const needLogin = page.url().includes('/login') ||
  44  |         await page.locator('#Email').isVisible({timeout: 3000}).catch(() => false);
  45  |     if (needLogin) {
  46  |         await login(page);
  47  |         await page.goto(CREATE_URL);
  48  |         await handleCloudflare(page);
  49  |     }
  50  | 
  51  |     await expect(page).toHaveURL(/\/Admin\/Product\/Create/i, {timeout: 30000});
  52  |     await expect(page.locator('#Name')).toBeVisible({timeout: 30000});
  53  | }
  54  | 
  55  | // Tên duy nhất để các lần chạy không đụng nhau
  56  | function uniq(prefix = 'AutoTest') {
  57  |     return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  58  | }
  59  | 
  60  | // Ô số của nopCommerce (Price, Weight...) dùng kendo numeric: lấy ô đang hiển thị
  61  | function numField(page, id) {
  62  |     return page.locator(`.form-group:has(#${id}) input:visible`).first();
  63  | }
  64  | 
  65  | async function fillNum(page, id, value) {
  66  |     const f = numField(page, id);
  67  |     await f.click();
  68  |     await f.fill(String(value));
  69  |     await f.press('Tab');
  70  | }
  71  | 
  72  | async function numValue(page, id) {
  73  |     return parseFloat((await numField(page, id).inputValue()).replace(/,/g, ''));
  74  | }
  75  | 
  76  | async function save(page) {
  77  |     await page.locator('button[name="save"]').click();
  78  | }
  79  | 
  80  | async function saveContinue(page) {
  81  |     await page.locator('button[name="save-continue"]').click();
  82  | }
  83  | 
  84  | // Lưu thành công: hiện thông báo xanh
  85  | async function expectSaved(page) {
  86  |     await expect(page.locator('.alert-success')).toBeVisible({timeout: 30000});
  87  | }
  88  | 
  89  | // Lưu bị từ chối: không có thông báo thành công và có lỗi hiển thị
  90  | async function expectRejected(page) {
> 91  |     await expect(page.locator('.field-validation-error, .validation-summary-errors, .alert-danger, .input-validation-error').first()).toBeVisible({timeout: 15000});
      |                                                                                                                                       ^ Error: expect(locator).toBeVisible() failed
  92  |     await expect(page.locator('.alert-success')).toHaveCount(0);
  93  | }
  94  | 
  95  | // Sau Save and Continue Edit: đang ở trang Edit của sản phẩm vừa tạo
  96  | async function expectEditPage(page) {
  97  |     await expect(page).toHaveURL(/\/Admin\/Product\/Edit\/\d+/i, {timeout: 30000});
  98  | }
  99  | 
  100 | // Tạo nhanh 1 sản phẩm chỉ với Name (+ trường bổ sung) rồi ở lại trang Edit
  101 | async function createAndEdit(page, name, extra = async () => {}) {
  102 |     await openCreate(page);
  103 |     await page.locator('#Name').fill(name);
  104 |     await extra();
  105 |     await saveContinue(page);
  106 |     await expectEditPage(page);
  107 | }
  108 | 
  109 | // Tìm sản phẩm theo tên trong Product list, trả về số dòng khớp
  110 | async function listCount(page, name) {
  111 |     await page.goto(BASE + '/Admin/Product/List');
  112 |     await handleCloudflare(page);
  113 |     await page.locator('#SearchProductName').fill(name);
  114 |     await Promise.all([
  115 |         page.waitForResponse(r => r.url().includes('/Product/ProductList')),
  116 |         page.locator('#search-products').click()
  117 |     ]);
  118 |     const rows = page.locator('#products-grid tbody tr');
  119 |     await expect(rows.first()).toBeVisible({timeout: 30000});
  120 |     const text = (await rows.first().innerText()) || '';
  121 |     if (/No data available|No matching records|Không có dữ liệu/i.test(text)) return 0;
  122 |     return rows.count();
  123 | }
  124 | 
  125 | // ------------------------------ tests ------------------------------
  126 | 
  127 | test.describe('Admin - Create Product', () => {
  128 | 
  129 |     test.setTimeout(120000);
  130 | 
  131 |     // ---------- Hiển thị ----------
  132 | 
  133 |     test('Create_product_default_value_01 - Kiểm tra giá trị mặc định trên màn hình Thêm sản phẩm', async ({page}) => {
  134 |         await openCreate(page);
  135 |         await expect(page.locator('#Name')).toHaveValue('');
  136 |         await expect(page.locator('#Sku')).toHaveValue('');
  137 |         expect(await numValue(page, 'Price')).toBe(0);
  138 |         expect(await numValue(page, 'Weight')).toBe(0);
  139 |         expect(await numValue(page, 'Length')).toBe(0);
  140 |         expect(await numValue(page, 'Width')).toBe(0);
  141 |         expect(await numValue(page, 'Height')).toBe(0);
  142 |         await expect(page.locator('#IsTaxExempt')).not.toBeChecked();
  143 |         // Tax category = [None], Inventory method = Don't track inventory
  144 |         await expect(page.locator('#TaxCategoryId')).toHaveValue('0');
  145 |         await expect(page.locator('#ManageInventoryMethodId option:checked')).toHaveText(/Don't track inventory/i);
  146 |     });
  147 | 
  148 |     test('Create_product_required_mark_02 - Kiểm tra dấu (*) bắt buộc ở trường Product name', async ({page}) => {
  149 |         await openCreate(page);
  150 |         await expect(page.locator('.form-group:has(#Name) .required, .form-group:has(#Name) :text("*")').first()).toBeVisible();
  151 |     });
  152 | 
  153 |     test('Create_product_toggle_panel_03 - Kiểm tra thu gọn/mở rộng panel Product info', async ({page}) => {
  154 |         await openCreate(page);
  155 |         const card = page.locator('.card[data-card-name="product-info"]');
  156 |         await card.locator('.card-header').first().click();
  157 |         await expect(card).toHaveClass(/collapsed-card/);
  158 |         await card.locator('.card-header').first().click();
  159 |         await expect(card).not.toHaveClass(/collapsed-card/);
  160 |         await expect(page.locator('#Name')).toBeVisible();
  161 |     });
  162 | 
  163 |     test('Create_product_multimedia_message_04 - Panel Multimedia hiển thị thông báo cần lưu sản phẩm trước', async ({page}) => {
  164 |         await openCreate(page);
  165 |         await expect(page.getByText(/You need to save the product before you can upload pictures or videos/i)).toBeVisible();
  166 |     });
  167 | 
  168 |     test('Create_product_attributes_message_05 - Panel Product attributes hiển thị thông báo cần lưu sản phẩm trước', async ({page}) => {
  169 |         await openCreate(page);
  170 |         await expect(page.getByText(/You need to save the product before you can add attributes/i)).toBeVisible();
  171 |     });
  172 | 
  173 |     // ---------- Product name ----------
  174 | 
  175 |     test('Create_product_valid_name_06 - Lưu sản phẩm với Product name hợp lệ', async ({page}) => {
  176 |         const name = uniq('ValidName');
  177 |         await openCreate(page);
  178 |         await page.locator('#Name').fill(name);
  179 |         await save(page);
  180 |         await expect(page).toHaveURL(/\/Admin\/Product\/List/i, {timeout: 30000});
  181 |         await expectSaved(page);
  182 |         expect(await listCount(page, name)).toBe(1);
  183 |     });
  184 | 
  185 |     test('Create_product_empty_name_07 - Lưu sản phẩm để trống Product name', async ({page}) => {
  186 |         await openCreate(page);
  187 |         await save(page);
  188 |         await expectRejected(page);
  189 |         await expect(page).toHaveURL(/\/Admin\/Product\/Create/i);
  190 |     });
  191 | 
```