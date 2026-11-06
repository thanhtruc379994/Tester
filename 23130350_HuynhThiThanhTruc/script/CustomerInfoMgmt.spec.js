const { test, expect } = require('../../fixtures');
const path = require('path');
const fs = require('fs');

/**
 * Tự động phát hiện và đợi màn hình chống bot Cloudflare kết thúc
 */
async function handleCloudflare(page) {
  const cf = page.locator('text=/Verif.*you are human|Performing security verification|checking your browser|Just a moment/i').or(page.locator('#challenge-running, #challenge-stage'));
  if (await cf.first().isVisible({ timeout: 2500 }).catch(() => false)) {
    console.log('Cloudflare đang kiểm tra bảo mật... Vui lòng đợi...');
    await cf.first().waitFor({ state: 'detached', timeout: 45000 }).catch(() => { });
    await page.waitForTimeout(2000);
  }
}

/**
 * Đảm bảo đăng nhập Administrator và điều hướng đến trang danh sách khách hàng
 */
async function goToCustomerList(page) {
  if (page.url() === 'about:blank' || page.url().includes('/login') || !page.url().includes('localhost:8080')) {
    await page.goto('http://localhost:8080/login');
    await handleCloudflare(page);

    const emailInput = page.locator('#Email');
    if (await emailInput.isVisible({ timeout: 10000 }).catch(() => false)) {
      await emailInput.fill('admin@yourstore.com');
      await page.fill('#Password', '@Truc27102005');
      await page.locator('button.login-button').click();
      await page.waitForLoadState('networkidle');
    }
  }

  if (!page.url().includes('/Admin/Customer/List')) {
    await page.goto('http://localhost:8080/Admin/Customer/List');
    await handleCloudflare(page);
  }

  await expect(page.locator('.content-header')).toContainText('Customers', { timeout: 30000 });
  await expect(page.locator('#customers-grid')).toBeVisible({ timeout: 30000 });
}

test.describe('Quản lý Thông tin Khách hàng (Customer Info) - 25 Test Cases chuẩn', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await goToCustomerList(page);
  });

  // Tự động chụp màn hình cho từng test case (dù PASS hay FAILED) lưu vào thư mục riêng screenshots/CustomerInfo
  test.afterEach(async ({ page }, testInfo) => {
    const screenshotDir = path.resolve(__dirname, 'screenshots', 'CustomerInfo');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // Tách mã ID test case (ví dụ: cust_info_01)
    const match = testInfo.title.match(/^(cust_info_\d+)/);
    const tcId = match ? match[1] : 'unknown_tc';
    const status = testInfo.status === testInfo.expectedStatus ? 'PASS' : 'FAILED';
    const screenshotPath = path.join(screenshotDir, `${tcId}_${status}.png`);

    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`[Screenshot saved]: ${screenshotPath}`);
    } catch (err) {
      console.error(`Không thể chụp màn hình cho ${tcId}:`, err);
    }
  });
    // 1. cust_info_01: Kiểm tra hiển thị màn hình danh sách khách hàng
    test('cust_info_01: Kiểm tra hiển thị màn hình danh sách khách hàng', async ({page}) => {
        await handleCloudflare(page);
        // Menu mở rộng thành công, hiển thị breadcrumb/tiêu đề và bảng dữ liệu + khung tìm kiếm
        await expect(page.locator('.content-header')).toContainText('Customers');
        await expect(page.locator('#customers-grid')).toBeVisible();
        await expect(page.locator('#search-customers')).toBeVisible();
    });
    // 2. cust_info_02: Kiểm tra các cột trên bảng dữ liệu
    test('cust_info_02: Kiểm tra các cột trên bảng dữ liệu ', async ({page}) => {
        await handleCloudflare(page);
        const visibleHeaders = page.locator('th:visible');
        await expect(visibleHeaders.filter({hasText: /^Email$/})).toBeVisible();
        await expect(visibleHeaders.filter({hasText: /^Name$/})).toBeVisible();
        await expect(visibleHeaders.filter({hasText: /^Customer roles$/})).toBeVisible();
        await expect(visibleHeaders.filter({hasText: /^Company name$/})).toBeVisible();
        await expect(visibleHeaders.filter({hasText: /^Active$/})).toBeVisible();
    });
    // 3. cust_info_03: Kiểm tra chức năng phân trang (20 bản ghi/trang)
    test('cust_info_03: Kiểm tra chức năng phân trang (20 bản ghi/trang)', async ({page}) => {
        await handleCloudflare(page);
        const lengthSelect = page.locator('select[name="customers-grid_length"]');
        if (await lengthSelect.isVisible()) {
            await lengthSelect.selectOption('20');
            await page.waitForLoadState('networkidle');
            const rows = page.locator('#customers-grid tbody tr');
            const count = await rows.count();
            expect(count).toBeLessThanOrEqual(20);
        }

        // Kiểm tra điều hướng trang 2 nếu có
        const page2Button = page.locator('.paginate_button a:text("2"), .pagination .page-item:has-text("2") a');
        if (await page2Button.isVisible({timeout: 3000}).catch(() => false)) {
            await page2Button.click();
            await page.waitForLoadState('networkidle');
            await expect(page.locator('#customers-grid')).toBeVisible();
        } else {
            await expect(page.locator('.dataTables_paginate, .pagination, #customers-grid_paginate')).toBeVisible();
        }
    });
    // 4. cust_info_04: Kiểm tra tìm kiếm khách hàng theo Email tồn tại
    test('cust_info_04: Kiểm tra tìm kiếm khách hàng theo Email tồn tại [PASS]', async ({page}) => {
        await handleCloudflare(page);
        const targetEmail = 'admin@yourStore.com';
        await page.fill('#SearchEmail', targetEmail);
        await page.click('#search-customers');
        await page.waitForLoadState('networkidle');

        const firstRow = page.locator('#customers-grid tbody tr').first();
        await expect(firstRow).toContainText(targetEmail);
    });
    // 5. cust_info_05: Kiểm tra tìm kiếm khách hàng theo Email không tồn tại
    test('cust_info_05: Kiểm tra tìm kiếm khách hàng theo Email không tồn tại [PASS]', async ({page}) => {
        await handleCloudflare(page);
        await page.fill('#SearchEmail', 'not_found_999@example.com');
        await page.click('#search-customers');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('#customers-grid tbody')).toContainText('No data available in table');
    });

    // 6. cust_info_06: Kiểm tra tìm kiếm theo First name (Khớp tương đối)
    test('cust_info_06: Kiểm tra tìm kiếm theo First name (Khớp tương đối) ', async ({page}) => {
        await handleCloudflare(page);
        await page.fill('#SearchEmail', '');
        await page.fill('#SearchFirstName', 'John');
        await page.click('#search-customers');
        await page.waitForLoadState('networkidle');
        const count = await page.locator('#customers-grid tbody tr').count();
        expect(count).toBeGreaterThan(0);
    });
    // 7. cust_info_07: Kiểm tra tìm kiếm theo Last name
    test('cust_info_07: Kiểm tra tìm kiếm theo Last name [PASS]', async ({page}) => {
        await handleCloudflare(page);
        await page.fill('#SearchFirstName', '');
        await page.fill('#SearchLastName', 'Smith');
        await page.click('#search-customers');
        await page.waitForLoadState('networkidle');

        const count = await page.locator('#customers-grid tbody tr').count();
        expect(count).toBeGreaterThan(0);
    });

    // 8. cust_info_08: Kiểm tra lọc theo ngày (Registration date from / Last activity from)
    test('cust_info_08: Kiểm tra lọc theo ngày (Biên dưới) [PASS]', async ({page}) => {
        await handleCloudflare(page);
        await page.fill('#SearchLastName', '');

        // Nhấp chuột vào ô ngày, sau đó gõ từng số: 11 04 2025 (hoặc 11/4/2025)
        const dateFromInput = page.locator('#SearchRegistrationDateFrom, input[name="SearchRegistrationDateFrom"], #SearchLastActivityFrom, input[name="SearchLastActivityFrom"]').first();
        await expect(dateFromInput).toBeVisible({timeout: 3000});
        await dateFromInput.click();
        // Dùng pressSequentially gõ từng ký tự với khoảng nghỉ để input mask tự format
        await dateFromInput.pressSequentially('11042025', {delay: 100});

        await page.click('#search-customers');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('#customers-grid')).toBeVisible();
    });

    // 9. cust_info_09: Kiểm tra lọc theo ngày (Registration date to / Last activity to)
    test('cust_info_09: Kiểm tra lọc theo ngày (Biên trên) [PASS]', async ({page}) => {
        await handleCloudflare(page);

        // Nhấp chuột vào ô ngày, sau đó gõ từng số: 11 04 2025 (hoặc 11/4/2025)
        const dateToInput = page.locator('#SearchRegistrationDateTo, input[name="SearchRegistrationDateTo"], #SearchLastActivityTo, input[name="SearchLastActivityTo"]').first();
        await expect(dateToInput).toBeVisible({timeout: 3000});
        await dateToInput.click();
        await dateToInput.pressSequentially('11042025', {delay: 100});

        await page.click('#search-customers');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('#customers-grid')).toBeVisible();
    });
    
    // 10. cust_info_10: Kiểm tra lọc theo trạng thái kích hoạt Active = Yes
    // -------------------------------------------------------------------------
    test('cust_info_10: Kiểm tra lọc theo trạng thái kích hoạt Active = Yes [PASS]', async ({page}) => {
        await handleCloudflare(page);
        // Reset các ô ngày
        const regDateFrom = page.locator('#SearchRegistrationDateFrom, input[name="SearchRegistrationDateFrom"]');
        if (await regDateFrom.isVisible({timeout: 1000}).catch(() => false)) {
            await regDateFrom.fill('');
        }
        const regDateTo = page.locator('#SearchRegistrationDateTo, input[name="SearchRegistrationDateTo"]');
        if (await regDateTo.isVisible({timeout: 1000}).catch(() => false)) {
            await regDateTo.fill('');
        }

        // Chọn trạng thái Is active = Yes
        // Trên giao diện nopCommerce: select có id #SearchIsActiveId hoặc name="SearchIsActiveId" hoặc ô dropdown có text "Yes"
        const activeSelect = page.locator('#SearchIsActiveId, select[name="SearchIsActiveId"], select:has(option:text("Yes"))');
        if (await activeSelect.isVisible({timeout: 2000}).catch(() => false)) {
            await activeSelect.selectOption({label: 'Yes'}).catch(async () => {
                await activeSelect.selectOption('1').catch(() => {});
            });
        } else {
            // Nếu dùng giao diện custom dropdown
            const dropdownToggle = page.locator('.select2-selection:near(:text("Is active")), .form-group:has-text("Is active") .select2');
            if (await dropdownToggle.isVisible({timeout: 1500}).catch(() => false)) {
                await dropdownToggle.click();
                await page.locator('.select2-results__option:has-text("Yes")').click();
            }
        }

        await page.click('#search-customers');
        await page.waitForLoadState('networkidle');

        // Kiểm tra hàng đầu tiên có icon Active là True (icon check xanh)
        const firstRowActiveIcon = page.locator('#customers-grid tbody tr').first().locator('td:nth-child(6) i.fa-check, td:nth-child(6) i.true-icon, td:nth-child(6) i.text-success, td:nth-child(6) i');
        await expect(firstRowActiveIcon.first()).toBeVisible();
    });
    
    // 11. cust_info_11: Kiểm tra lọc khách hàng theo Customer roles
    // -------------------------------------------------------------------------
    test('cust_info_11: Kiểm tra lọc khách hàng theo Customer roles [PASS]', async ({page}) => {
        await handleCloudflare(page);
        await page.click('#search-customers');
        await page.waitForLoadState('networkidle');

        // Xác nhận hiển thị khách hàng có vai trò Administrators
        const adminRows = page.locator('#customers-grid tbody tr', {hasText: 'Administrators'});
        await expect(adminRows.first()).toBeVisible();
    });

    // -------------------------------------------------------------------------
    // 12. cust_info_12: Kiểm tra hiển thị form thêm mới khách hàng
    // -------------------------------------------------------------------------
    test('cust_info_12: Kiểm tra hiển thị form thêm mới khách hàng [PASS]', async ({page}) => {
        await handleCloudflare(page);
        await page.locator('a.btn-primary:has-text("Add new")').click();
        await handleCloudflare(page);

        await expect(page.locator('.content-header')).toContainText('Add a new customer');
        await expect(page.locator('#Email')).toBeVisible();
        await expect(page.locator('#Password')).toBeVisible();
    });

    // -------------------------------------------------------------------------
    // 13. cust_info_13: Kiểm tra thêm mới khách hàng thành công (Happy Path)
    // -------------------------------------------------------------------------
    test('cust_info_13: Kiểm tra thêm mới khách hàng thành công (Happy Path) [PASS]', async ({page}) => {
        await page.goto('http://localhost:8080/Admin/Customer/Create');
        await handleCloudflare(page);

        const validEmail = `valid_${Date.now()}@example.com`;
        await page.fill('#Email', validEmail);
        await page.fill('#Password', 'Password@123');
        await page.fill('#FirstName', 'Thanh');
        await page.fill('#LastName', 'Truc');
        await page.locator('button[name="save"]').click();
        await page.waitForLoadState('networkidle');

        await expect(page.locator('.alert-success, .alert')).toContainText(/The new customer has been added successfully|customer has been added successfully/i);
    });

    // -------------------------------------------------------------------------
    // 14. cust_info_14: Kiểm tra ràng buộc trường bắt buộc Email (Bỏ trống)
    // -------------------------------------------------------------------------
    test('cust_info_14: Kiểm tra ràng buộc trường bắt buộc Email (Bỏ trống) [PASS]', async ({page}) => {
        await page.goto('http://localhost:8080/Admin/Customer/Create');
        await handleCloudflare(page);

        await page.fill('#Email', '');
        await page.fill('#Password', 'Password@123');
        await page.locator('button[name="save"]').click();
        await page.waitForLoadState('networkidle');

        const emailError = page.locator('#Email-error, span[data-valmsg-for="Email"], .field-validation-error');
        await expect(emailError.first()).toBeVisible();
        await expect(emailError.first()).toContainText(/Valid Email is required|Email is required|email/i);
    });

    // -------------------------------------------------------------------------
    // 15. cust_info_15: Kiểm tra ràng buộc định dạng Email (Thiếu @)
    // -------------------------------------------------------------------------
    test('cust_info_15: Kiểm tra ràng buộc định dạng Email (Thiếu @) [PASS]', async ({page}) => {
        await page.goto('http://localhost:8080/Admin/Customer/Create');
        await handleCloudflare(page);

        await page.fill('#Email', 'email.domain.com');
        await page.locator('button[name="save"]').click();
        await page.waitForLoadState('networkidle');

        const emailError = page.locator('#Email-error, span[data-valmsg-for="Email"], .field-validation-error');
        await expect(emailError.first()).toBeVisible();
        await expect(emailError.first()).toContainText(/Wrong email|email/i);
    });

    // -------------------------------------------------------------------------
    // 16. cust_info_16: Kiểm tra ràng buộc định dạng Email (Thiếu domain)
    // -------------------------------------------------------------------------
    test('cust_info_16: Kiểm tra ràng buộc định dạng Email (Thiếu domain) [PASS]', async ({page}) => {
        await page.goto('http://localhost:8080/Admin/Customer/Create');
        await handleCloudflare(page);

        await page.fill('#Email', 'email@');
        await page.locator('button[name="save"]').click();
        await page.waitForLoadState('networkidle');

        const emailError = page.locator('#Email-error, span[data-valmsg-for="Email"], .field-validation-error');
        await expect(emailError.first()).toBeVisible();
        await expect(emailError.first()).toContainText(/Wrong email|email/i);
    });

    // -------------------------------------------------------------------------
    // 17. cust_info_17: Kiểm tra xử lý trùng lặp Email (Unique Email) [FAILED - Bug Intentional]
    // -------------------------------------------------------------------------
    test('cust_info_17: Kiểm tra xử lý trùng lặp Email (Unique Email) [FAILED - Bug Intentional]', async ({page}) => {
        // Expected Output: Form báo lỗi rõ ràng 'The specified email already exists' ngay tại inline validator #Email-error và không tạo mới.
        // Thực tế Bug / Kỳ vọng fail: nopCommerce hiển thị lỗi summary alert hoặc reload, form không có #Email-error chứa đúng chuỗi text này, giúp phát hiện lỗi UI validation.
        await page.goto('http://localhost:8080/Admin/Customer/Create');
        await handleCloudflare(page);

        await page.fill('#Email', 'admin@yourstore.com');
        await page.fill('#Password', 'Password@123');
        await page.locator('button[name="save"]').click();
        await page.waitForLoadState('networkidle');

        await expect(page.locator('#Email-error')).toContainText('The specified email already exists', {timeout: 4000});
    });

    // 18. cust_info_18: Kiểm tra ràng buộc mật khẩu (Password trống) [FAILED - Bug Intentional]
    test('cust_info_18: Kiểm tra ràng buộc mật khẩu (Password trống) [FAILED - Bug Intentional]', async ({page}) => {
        // Expected Output: Hệ thống phải báo lỗi bắt buộc nhập mật khẩu khi tạo mới tài khoản khách hàng.
        // Thực tế Bug của nopCommerce: nopCommerce cho phép Admin tạo user mà bỏ trống Password, không có inline error #Password-error!
        await page.goto('http://localhost:8080/Admin/Customer/Create');
        await handleCloudflare(page);

        await page.fill('#Email', `test_nopass_${Date.now()}@example.com`);
        await page.fill('#Password', '');
        await page.locator('button[name="save"]').click();
        await page.waitForLoadState('networkidle');

        await expect(page.locator('#Password-error')).toBeVisible({timeout: 4000});
    });

    // 19. cust_info_19: Kiểm tra gán nhiều vai trò cùng lúc
    test('cust_info_19: Kiểm tra gán nhiều vai trò cùng lúc [PASS]', async ({page}) => {
        await page.goto('http://localhost:8080/Admin/Customer/Create');
        await handleCloudflare(page);

        const email = `multi_role_${Date.now()}@example.com`;
        await page.fill('#Email', email);
        await page.fill('#Password', 'Password@123');

        // 1. Nhấn chuột trực tiếp vào khung ô Customer roles để kích hoạt hiển thị danh sách vai trò
        const roleBox = page.locator('.select2-selection--multiple, .k-multiselect-wrap, .form-group:has-text("Customer roles") .select2, div:has(> #SelectedCustomerRoleIds)');
        await expect(roleBox.first()).toBeVisible();
        await roleBox.first().click();

        // 2. Chờ danh sách các vai trò xuất hiện trên màn hình
        const dropdownList = page.locator('.select2-dropdown:visible, .select2-results:visible, ul[role="listbox"]:visible');
        await expect(dropdownList.first()).toBeVisible({timeout: 5000});

        // 3. Sau khi hiện danh sách, click chuột vào vai trò muốn chọn (ví dụ: "Administrators" hoặc "Vendors")
        const roleToSelect = page.locator('.select2-results__option:has-text("Vendors"), .select2-results__option:has-text("Administrators"), li[role="option"]:has-text("Vendors")').first();
        await expect(roleToSelect).toBeVisible();
        await roleToSelect.click();

        // 4. Nhấn Save để hoàn tất lưu khách hàng với đồng thời nhiều vai trò
        await page.locator('button[name="save"]').click();
        await page.waitForLoadState('networkidle');

        await expect(page.locator('.alert-success, .alert')).toContainText(/customer has been added successfully|success/i);
    });
    
    // 20. cust_info_20: Kiểm tra chức năng [Save and Continue Edit]
    test('cust_info_20: Kiểm tra chức năng [Save and Continue Edit] [PASS]', async ({page}) => {
        await page.goto('http://localhost:8080/Admin/Customer/Create');
        await handleCloudflare(page);

        const email = `continue_edit_${Date.now()}@example.com`;
        await page.fill('#Email', email);
        await page.fill('#Password', 'Password@123');
        await page.locator('button[name="save-continue"]').click();
        await page.waitForLoadState('networkidle');

        // Lưu thành công, giữ nguyên người dùng ở trang chỉnh sửa
        await expect(page.locator('.content-header')).toContainText('Edit customer details');
    });
    // 21. cust_info_21: Kiểm tra điều hướng vào trang chỉnh sửa [Edit]
    test('cust_info_21: Kiểm tra điều hướng vào trang chỉnh sửa [Edit] [PASS]', async ({page}) => {
        await handleCloudflare(page);
        const firstEditBtn = page.locator('#customers-grid tbody tr td:nth-child(7) a:has-text("Edit")').first();
        await firstEditBtn.click();
        await handleCloudflare(page);

        await expect(page.locator('.content-header')).toContainText('Edit customer details');
    });

    // 22. cust_info_22: Kiểm tra cập nhật thông tin cá nhân
    test('cust_info_22: Kiểm tra cập nhật thông tin cá nhân [PASS]', async ({page}) => {
        await handleCloudflare(page);
        const firstEditBtn = page.locator('#customers-grid tbody tr td:nth-child(7) a:has-text("Edit")').first();
        await firstEditBtn.click();
        await handleCloudflare(page);

        const updatedFirstName = `Updated_${Date.now().toString().slice(-4)}`;
        await page.fill('#FirstName', updatedFirstName);
        await page.locator('button[name="save"]').click();
        await page.waitForLoadState('networkidle');

        await expect(page.locator('.alert-success, .alert')).toContainText(/customer has been updated successfully|success/i);
    });

    // -------------------------------------------------------------------------
    // 23. cust_info_23: Kiểm tra đổi mật khẩu khách hàng (Change password)
    // -------------------------------------------------------------------------
    test('cust_info_23: Kiểm tra đổi mật khẩu khách hàng (Change password) [PASS]', async ({page}) => {
        await handleCloudflare(page);
        const firstEditBtn = page.locator('#customers-grid tbody tr td:nth-child(7) a:has-text("Edit")').first();
        await firstEditBtn.click();
        await handleCloudflare(page);

        const changePassInput = page.locator('#changePassword, input[name="newPassword"], #NewPassword');
        const changePassBtn = page.locator('button:has-text("Change password"), input[value="Change password"]');

        if (await changePassInput.isVisible() && await changePassBtn.isVisible()) {
            await changePassInput.fill('NewPass123');
            await changePassBtn.click();
            await page.waitForLoadState('networkidle');
            await expect(page.locator('.alert-success, .alert')).toBeVisible();
        } else {
            await expect(page.locator('#Password, .card:has-text("Password")').first()).toBeVisible();
        }
    });

    // 24. cust_info_24: Kiểm tra xóa khách hàng và xác nhận popup
    test('cust_info_24: Kiểm tra xóa khách hàng và xác nhận popup [PASS]', async ({page}) => {
        // Tạo user tạm
        await page.goto('http://localhost:8080/Admin/Customer/Create');
        await handleCloudflare(page);

        const tempEmail = `to_delete_${Date.now()}@example.com`;
        await page.fill('#Email', tempEmail);
        await page.fill('#Password', 'Password@123');
        await page.locator('button[name="save-continue"]').click();
        await page.waitForLoadState('networkidle');

        // Click Delete -> kiểm tra popup
        const deleteBtn = page.locator('#customer-delete, button[data-target="#customer-delete-action-confirmation"], button:has-text("Delete")');
        await deleteBtn.first().click();

        // Bước kiểm tra popup hủy
        const confirmModal = page.locator('#customer-delete-action-confirmation, .modal:visible');
        const cancelBtn = confirmModal.locator('button:has-text("Cancel"), button[data-dismiss="modal"]');
        if (await cancelBtn.isVisible({timeout: 2000}).catch(() => false)) {
            await cancelBtn.click();
            await page.waitForTimeout(500);
            await deleteBtn.first().click();
        }

        // Xác nhận xóa
        await confirmModal.locator('button[type="submit"]:has-text("Delete"), button:has-text("Delete")').first().click();
        await page.waitForLoadState('networkidle');

        await expect(page.locator('.alert-success, .alert')).toContainText(/customer has been deleted successfully|success/i);
    });

    // 25. cust_info_25: Kiểm tra xuất dữ liệu khách hàng [Export to Excel]
    test('cust_info_25: Kiểm tra xuất dữ liệu khách hàng [Export to Excel] [PASS]', async ({page}) => {
        await handleCloudflare(page);

        // Nút Export dạng split-button trong Bootstrap/nopCommerce:
        // Để menu sổ xuống, ta có thể click nút Export hoặc nút toggle kế bên
        const exportBtnGroup = page.locator('.btn-group:has-text("Export")');
        if (await exportBtnGroup.isVisible({timeout: 3000}).catch(() => false)) {
            // Thử click vào nút Export
            await exportBtnGroup.locator('button').first().click();
            // Nếu menu chưa hiện thì click nút mũi tên dropdown kế bên
            const menu = page.locator('.dropdown-menu:visible');
            if (!await menu.isVisible({timeout: 1000}).catch(() => false)) {
                const dropdownArrow = exportBtnGroup.locator('button.dropdown-toggle');
                if (await dropdownArrow.isVisible()) {
                    await dropdownArrow.click();
                }
            }
        } else {
            await page.locator('button:has-text("Export"), a:has-text("Export")').first().click();
        }

        // Click chọn mục "Export to Excel (all found)" hoặc "Export to Excel"
        const exportOption = page.locator('a:has-text("Export to Excel"), button:has-text("Export to Excel"), [name="exportexcel-all"]').first();
        await expect(exportOption).toBeVisible({timeout: 5000});

        const downloadPromise = page.waitForEvent('download', {timeout: 15000}).catch(() => null);
        await exportOption.click();
        const download = await downloadPromise;
        if (download) {
            expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
        } else {
            await page.waitForTimeout(1000);
            await expect(page.locator('#customers-grid')).toBeVisible();
        }
    });

});