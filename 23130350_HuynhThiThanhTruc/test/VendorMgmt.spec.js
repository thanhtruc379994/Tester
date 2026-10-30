const { test, expect } = require('../../fixtures');

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
 * Helper xóa vendor nếu đã tồn tại để đảm bảo test chạy lại nhiều lần không bị lỗi trùng lặp
 */
async function deleteVendorIfExists(page, vendorName) {
  await page.goto('http://localhost:8080/Admin/Vendor/List');
  await handleCloudflare(page);
  const row = page.locator('#vendors-grid tbody tr', { hasText: vendorName });
  if (await row.isVisible({ timeout: 2000 }).catch(() => false)) {
    await row.locator('a:has-text("Edit")').click();
    await handleCloudflare(page);
    const deleteBtn = page.locator('#vendor-delete');
    if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteBtn.click();
      const confirmBtn = page.locator('#vendormodel-Delete-delete-confirmation button[type="submit"]:has-text("Delete")');
      await confirmBtn.click();
      await page.waitForLoadState('networkidle');
    }
  }
}

/**
 * Helper đảm bảo chế độ Advanced Settings được bật để hiển thị đầy đủ thông tin Address
 */
async function ensureAdvancedMode(page) {
  const modeCheckbox = page.locator('#advanced-settings-mode, .onoffswitch-checkbox');
  if (await modeCheckbox.count() > 0 && !(await modeCheckbox.isChecked())) {
    await page.locator('.onoffswitch-label').click();
    await page.waitForTimeout(600);
  }
}

// Chạy liên tục dạng Test Suite: các test case chạy tuần tự một mạch trên cùng phiên làm việc
test.describe('Quản lý nhà cung cấp (Vendors / Providers) - nopCommerce Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Chỉ thực hiện đăng nhập 1 lần duy nhất ở đầu suite nếu chưa đăng nhập
    if (page.url() === 'about:blank' || page.url().includes('/login')) {
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

    // 2. Chuyển đến trang Vendors nếu chưa ở đúng trang
    if (!page.url().includes('/Admin/Vendor/List') && !page.url().includes('/Admin/Vendor/')) {
      await page.goto('http://localhost:8080/Admin/Vendor/List');
      await handleCloudflare(page);
    }

    // Đảm bảo trang danh sách nhà cung cấp đã sẵn sàng nếu đang ở trang List
    if (page.url().includes('/Admin/Vendor/List')) {
      await expect(page.locator('.content-header')).toContainText('Vendors', { timeout: 30000 });
      await expect(page.locator('#vendors-grid')).toBeVisible({ timeout: 30000 });
    }
  });

  // provider_management_01: Kiểm tra thêm mới nhà cung cấp thành công
  test('provider_management_01: Kiểm tra thêm mới nhà cung cấp thành công', async ({ page }) => {
    await handleCloudflare(page);

    // Xóa vendor 'Vendor QA 01' nếu đã tồn tại từ trước
    await deleteVendorIfExists(page, 'Vendor QA 01');

    await page.goto('http://localhost:8080/Admin/Vendor/List');
    await handleCloudflare(page);

    // 1. Click nút [Add new]
    await page.click('a.btn-primary[href*="/Admin/Vendor/Create"], a:has-text("Add new")');
    await handleCloudflare(page);
    await expect(page.locator('.content-header')).toContainText('Add a new vendor');

    // 2. Nhập Name = 'Vendor QA 01', Email = 'vendor.qa01@example.com', tích chọn [Active]
    await page.fill('#Name', 'Vendor QA 01');
    await page.fill('#Email', 'vendor.qa01@example.com');
    await page.locator('#Active').setChecked(true);

    // 3. Click nút [Save]
    await page.click('button[name="save"]');
    await handleCloudflare(page);

    // Kỳ vọng: Hiển thị thông báo thành công và 'Vendor QA 01' xuất hiện trong danh sách với Active = true
    await expect(page.locator('.alert-success')).toContainText('The new vendor has been added successfully.');
    const newVendorRow = page.locator('#vendors-grid tbody tr', { hasText: 'Vendor QA 01' });
    await expect(newVendorRow).toBeVisible();
    await expect(newVendorRow.locator('td:nth-child(3) i.true-icon, td:nth-child(3) i.fa-check')).toBeVisible(); // Active = true
  });

  // provider_management_02: Kiểm tra trường Name của nhà cung cấp là bắt buộc
  test('provider_management_02: Kiểm tra trường Name của nhà cung cấp là bắt buộc', async ({ page }) => {
    await handleCloudflare(page);

    // 1. Trên màn hình Vendors, click nút [Add new]
    await page.click('a.btn-primary[href*="/Admin/Vendor/Create"], a:has-text("Add new")');
    await handleCloudflare(page);
    await expect(page.locator('.content-header')).toContainText('Add a new vendor');

    // 2. Để trống [Name], nhập Email = 'vendor.qa02@example.com'
    await page.fill('#Name', '');
    await page.fill('#Email', 'vendor.qa02@example.com');

    // 3. Click nút [Save]
    await page.click('button[name="save"]');

    // Kỳ vọng: Hiển thị thông báo lỗi 'Please provide a name.'; nhà cung cấp không được tạo
    const errorMsg = page.locator('#Name-error');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Please provide a name.');

    // Quay lại danh sách nhà cung cấp
    await page.goto('http://localhost:8080/Admin/Vendor/List');
    await handleCloudflare(page);
  });

  // provider_management_03: Kiểm tra xác thực định dạng Email của nhà cung cấp
  test('provider_management_03: Kiểm tra xác thực định dạng Email của nhà cung cấp', async ({ page }) => {
    await handleCloudflare(page);

    // 1. Trên màn hình Vendors, click nút [Add new]
    await page.click('a.btn-primary[href*="/Admin/Vendor/Create"], a:has-text("Add new")');
    await handleCloudflare(page);
    await expect(page.locator('.content-header')).toContainText('Add a new vendor');

    // 2. Nhập Name = 'Vendor QA 03', Email = 'vendor.qa03.example.com' (thiếu @)
    await page.fill('#Name', 'Vendor QA 03');
    await page.fill('#Email', 'vendor.qa03.example.com');

    // 3. Click nút [Save]
    await page.click('button[name="save"]');

    // Kỳ vọng: Hiển thị thông báo sai định dạng email; nhà cung cấp không được tạo
    const emailError = page.locator('#Email-error');
    await expect(emailError).toBeVisible();
    await expect(emailError).toContainText(/Please enter a valid email address|valid email/i);

    // Quay lại danh sách nhà cung cấp
    await page.goto('http://localhost:8080/Admin/Vendor/List');
    await handleCloudflare(page);
  });

  // provider_management_04: Kiểm tra thông tin địa chỉ của nhà cung cấp được lưu
  test('provider_management_04: Kiểm tra thông tin địa chỉ của nhà cung cấp được lưu', async ({ page }) => {
    await handleCloudflare(page);

    // Xóa vendor 'Vendor QA 04' nếu đã tồn tại từ trước
    await deleteVendorIfExists(page, 'Vendor QA 04');

    await page.goto('http://localhost:8080/Admin/Vendor/List');
    await handleCloudflare(page);

    // 1. Trên màn hình Vendors, click [Add new], nhập Name = 'Vendor QA 04', Email = 'vendor.qa04@example.com'
    await page.click('a.btn-primary[href*="/Admin/Vendor/Create"], a:has-text("Add new")');
    await handleCloudflare(page);
    await expect(page.locator('.content-header')).toContainText('Add a new vendor');

    // Bật chế độ Advanced Settings để hiển thị panel thông tin Address
    await ensureAdvancedMode(page);

    await page.fill('#Name', 'Vendor QA 04');
    await page.fill('#Email', 'vendor.qa04@example.com');

    // 2. Nhập Country = 'United States', State/province = 'California', City = 'Los Angeles', Address = '123 Main St', Zip/postal code = '90001'
    await page.selectOption('#Address_CountryId', { label: 'United States of America' });
    await expect(page.locator('#Address_StateProvinceId option', { hasText: 'California' })).toBeAttached({ timeout: 10000 });
    await page.selectOption('#Address_StateProvinceId', { label: 'California' });
    await page.fill('#Address_City', 'Los Angeles');
    await page.fill('#Address_Address1', '123 Main St');
    await page.fill('#Address_ZipPostalCode', '90001');

    // 3. Click nút [Save and Continue Edit]
    await page.click('button[name="save-continue"]');
    await handleCloudflare(page);

    // Kỳ vọng: Nhà cung cấp được lưu; màn hình chỉnh sửa hiển thị đúng Country, State/province, City, Address và Zip/postal code đã nhập
    await expect(page.locator('.alert-success')).toContainText(/added successfully|updated successfully/i);

    // Đảm bảo chế độ Advanced vẫn bật trên trang Edit
    await ensureAdvancedMode(page);

    // Xác minh dữ liệu địa chỉ đã lưu chính xác
    const selectedCountry = await page.locator('#Address_CountryId option:checked').innerText();
    const selectedState = await page.locator('#Address_StateProvinceId option:checked').innerText();
    const cityValue = await page.locator('#Address_City').inputValue();
    const addressValue = await page.locator('#Address_Address1').inputValue();
    const zipValue = await page.locator('#Address_ZipPostalCode').inputValue();

    expect(selectedCountry).toContain('United States');
    expect(selectedState).toBe('California');
    expect(cityValue).toBe('Los Angeles');
    expect(addressValue).toBe('123 Main St');
    expect(zipValue).toBe('90001');

    // Quay lại danh sách nhà cung cấp
    await page.goto('http://localhost:8080/Admin/Vendor/List');
    await handleCloudflare(page);
  });

  // provider_management_05: Thêm nhà cung cấp bằng email hoặc tên đã tồn tại
  test('provider_management_05: Thêm nhà cung cấp bằng email hoặc tên đã tồn tại', async ({ page }) => {
    await handleCloudflare(page);

    await page.goto('http://localhost:8080/Admin/Vendor/List');
    await handleCloudflare(page);

    // Đảm bảo đã có ít nhất một 'Vendor 1' trong hệ thống làm điều kiện tiên quyết
    const existingVendor1 = page.locator('#vendors-grid tbody tr', { hasText: 'Vendor 1' });
    if ((await existingVendor1.count()) === 0) {
      await page.click('a.btn-primary[href*="/Admin/Vendor/Create"], a:has-text("Add new")');
      await handleCloudflare(page);
      await page.fill('#Name', 'Vendor 1');
      await page.fill('#Email', 'vendor1email@gmail.com');
      await page.locator('#Active').setChecked(true);
      await page.click('button[name="save"]');
      await handleCloudflare(page);
    }

    try {
      // 1. Trên màn hình Vendors, click nút [Add new]
      await page.goto('http://localhost:8080/Admin/Vendor/List');
      await handleCloudflare(page);
      await page.click('a.btn-primary[href*="/Admin/Vendor/Create"], a:has-text("Add new")');
      await handleCloudflare(page);
      await expect(page.locator('.content-header')).toContainText('Add a new vendor');

      // 2. Nhập Name = 'Vendor 1', Email = 'vendor1email@gmail.com', tích chọn [Active] (đây là thông tin đã tồn tại trong DB)
      await page.fill('#Name', 'Vendor 1');
      await page.fill('#Email', 'vendor1email@gmail.com');
      await page.locator('#Active').setChecked(true);

      // 3. Click nút [Save]
      await page.click('button[name="save"]');
      await handleCloudflare(page);

      // Kỳ vọng nghiệp vụ: Hệ thống phải phát hiện trùng lặp, hiển thị thông báo lỗi và không cho phép tạo mới
      // BUG nopCommerce: Hệ thống thiếu kiểm tra tính duy nhất (uniqueness), vẫn cho phép lưu và tạo thêm 1 bản ghi trùng
      // Assertion dưới đây được viết để bắt đúng bug: kỳ vọng có thông báo lỗi trùng lặp
      const errorMsg = page.locator('.alert-danger, .field-validation-error, #Name-error, #Email-error');
      await expect(errorMsg).toBeVisible({ timeout: 5000 });
      await expect(errorMsg).toContainText(/already exists|trùng lặp|đã tồn tại/i);
    } finally {
      // Dọn dẹp dữ liệu: Nếu hệ thống đã tạo thêm dòng trùng 'Vendor 1', xóa dòng trùng thứ 2 để giữ sạch dữ liệu
      try {
        await page.goto('http://localhost:8080/Admin/Vendor/List');
        await handleCloudflare(page);
        const duplicateRows = page.locator('#vendors-grid tbody tr', { hasText: 'Vendor 1' });
        const count = await duplicateRows.count();
        if (count > 1) {
          await duplicateRows.nth(1).locator('a:has-text("Edit")').click();
          await handleCloudflare(page);
          await page.locator('#vendor-delete').click();
          await page.locator('#vendormodel-Delete-delete-confirmation button[type="submit"]:has-text("Delete")').click();
          await page.waitForLoadState('networkidle');
        }
      } catch (e) {
      }
    }
  });

});

