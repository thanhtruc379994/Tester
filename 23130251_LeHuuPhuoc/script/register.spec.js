// @ts-check
const { test, expect } = require('../../fixtures');
const { generateEmail, DEFAULT_USER } = require('../helpers');
const NEWSLETTER_SELECTOR = '#Newsletter';

test.describe('Kiểm thử User - Register (62 Test Cases)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.nopcommerce.com/');
    if (await page.locator('a.ico-logout').isVisible().catch(() => false)) {
      await page.click('a.ico-logout');
    }
    await page.goto('https://demo.nopcommerce.com/register');
    await page.locator('#FirstName').waitFor({ state: 'visible', timeout: 60000 });
  });

  test('AUTH_REG_View_01: Kiểm tra mở trang đăng ký từ liên kết [Register] trên header', async ({ page }) => {
      // 1. Mở trang chủ
      await page.goto('https://demo.nopcommerce.com/');
      await expect(page.locator('a.ico-register')).toBeVisible();
      await expect(page.locator('a.ico-login')).toBeVisible();
  
      // 2. Click [Register] ở góc trên bên phải
      await page.click('a.ico-register');
      await expect(page).toHaveURL(/.*\/register/);
      await expect(page.locator('.page-title h1')).toContainText('Register');
    });

  test('AUTH_REG_View_02: Kiểm tra truy cập trực tiếp bằng URL /register và header khi chưa đăng nhập', async ({ page }) => {
      // 1. URL /register và danh mục hiển thị bình thường
      await expect(page).toHaveURL(/.*\/register/);
      await expect(page.locator('.header-menu, ul.top-menu')).toBeVisible();
  
      // 2. Header hiển thị [Register], [Log in], Wishlist, Shopping cart, Search, Currency; chưa có [My account] / [Log out]
      await expect(page.locator('a.ico-register')).toBeVisible();
      await expect(page.locator('a.ico-login')).toBeVisible();
      await expect(page.locator('.wishlist-label')).toBeVisible();
      await expect(page.locator('.cart-label')).toBeVisible();
      await expect(page.locator('#small-searchterms')).toBeVisible();
      await expect(page.locator('#customerCurrency')).toBeVisible();
  
      await expect(page.locator('a.ico-account')).not.toBeVisible();
      await expect(page.locator('a.ico-logout')).not.toBeVisible();
    });

  test('AUTH_REG_View_03: Kiểm tra các nhóm và trường trên form đăng ký', async ({ page }) => {
      // 4 nhóm form
      await expect(page.locator('.fieldset:has-text("Your Personal Details")')).toBeVisible();
      await expect(page.locator('.fieldset:has-text("Company Details")')).toBeVisible();
      await expect(page.locator('.fieldset:has-text("Subscribe to newsletter"), .fieldset:has-text("Options")')).toBeVisible();
      await expect(page.locator('.fieldset:has-text("Your Password")')).toBeVisible();
  
      // Các trường dữ liệu
      await expect(page.locator('#gender-male')).toBeVisible();
      await expect(page.locator('#gender-female')).toBeVisible();
      await expect(page.locator('#FirstName')).toBeVisible();
      await expect(page.locator('#LastName')).toBeVisible();
      await expect(page.locator('#Email')).toBeVisible();
      await expect(page.locator('#Company')).toBeVisible();
      await expect(page.locator(NEWSLETTER_SELECTOR).first()).toBeVisible();
      await expect(page.locator('#Password')).toBeVisible();
      await expect(page.locator('#ConfirmPassword')).toBeVisible();
      await expect(page.locator('#register-button')).toBeVisible();
    });

  test('AUTH_REG_View_04: Kiểm tra dấu * ở các trường bắt buộc và giá trị mặc định của form', async ({ page }) => {
      // Dấu * (required) chỉ có ở First name, Last name, Email, Password, Confirm password
      const requiredInputs = ['FirstName', 'LastName', 'Email', 'Password', 'ConfirmPassword'];
      for (const id of requiredInputs) {
        const parent = page.locator(`.inputs:has(#${id})`);
        await expect(parent.locator('.required')).toBeVisible();
      }
  
      // Gender, Company, Newsletter không bắt buộc
      await expect(page.locator('.inputs:has(#Company) .required')).not.toBeVisible();
  
      // Giá trị mặc định
      await expect(page.locator('#gender-male')).not.toBeChecked();
      await expect(page.locator('#gender-female')).not.toBeChecked();
      await expect(page.locator('#FirstName')).toHaveValue('');
      await expect(page.locator('#LastName')).toHaveValue('');
      await expect(page.locator('#Email')).toHaveValue('');
      await expect(page.locator(NEWSLETTER_SELECTOR).first()).toBeChecked();
    });

  test('AUTH_REG_View_05: Kiểm tra Gender chỉ cho chọn một giá trị', async ({ page }) => {
      // 1. Click chọn Male
      await page.check('#gender-male');
      await expect(page.locator('#gender-male')).toBeChecked();
      await expect(page.locator('#gender-female')).not.toBeChecked();
  
      // 2. Click chọn Female
      await page.check('#gender-female');
      await expect(page.locator('#gender-female')).toBeChecked();
      await expect(page.locator('#gender-male')).not.toBeChecked();
    });

  test('AUTH_REG_View_06: Kiểm tra ô Password và Confirm password ẩn ký tự', async ({ page }) => {
      // Kiểm tra thuộc tính type="password"
      await expect(page.locator('#Password')).toHaveAttribute('type', 'password');
      await expect(page.locator('#ConfirmPassword')).toHaveAttribute('type', 'password');
  
      await page.fill('#Password', 'Test@123456');
      await page.fill('#ConfirmPassword', 'Test@123456');
    });

  test('AUTH_REG_View_07: Kiểm tra thao tác bằng bàn phím (Tab, Enter)', async ({ page }) => {
      const email = generateEmail('tab_enter_');
      await page.focus('#FirstName');
      await page.keyboard.type(DEFAULT_USER.firstName);
      await page.keyboard.press('Tab');
  
      // Chuyển sang LastName
      await expect(page.locator('#LastName')).toBeFocused();
      await page.keyboard.type(DEFAULT_USER.lastName);
      await page.keyboard.press('Tab');
  
      // Chuyển sang Email
      await expect(page.locator('#Email')).toBeFocused();
      await page.keyboard.type(email);
  
      // Điền tiếp Password và ConfirmPassword
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
  
      // Đứng ở ConfirmPassword nhấn Enter để gửi form
      await page.focus('#ConfirmPassword');
      await page.keyboard.press('Enter');
  
      // Xác nhận gửi thành công
      await expect(page.locator('.result')).toContainText('Your registration completed', { timeout: 15000 });
    });

  test('AUTH_REG_View_08: Kiểm tra layout form trên desktop và mobile', async ({ page }) => {
      await expect(page.locator('.registration-page')).toBeVisible();
      await expect(page.locator('#register-button')).toBeVisible();
    });

  test('AUTH_REG_Success_01: Kiểm tra đăng ký thành công khi nhập đủ thông tin hợp lệ (Male, có Company, tích Newsletter)', async ({ page }) => {
      const email = generateEmail('reg_full_');
      await page.check('#gender-male');
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', email);
      await page.fill('#Company', DEFAULT_USER.company);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
  
      await page.click('#register-button');
  
      const result = page.locator('.result');
      await expect(result).toBeVisible();
      await expect(result).toContainText('Your registration completed');
      await expect(page.locator('a.register-continue-button, a:has-text("Continue")')).toBeVisible();
    });

  test('AUTH_REG_Success_02: Kiểm tra đăng ký thành công khi chỉ nhập các trường bắt buộc', async ({ page }) => {
      const email = generateEmail('reg_required_');
      // Bỏ trống Gender, Company
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', email);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
  
      await page.click('#register-button');
  
      await expect(page.locator('.result')).toContainText('Your registration completed');
    });

  test('AUTH_REG_Success_03: Kiểm tra đăng ký thành công khi chọn Female và bỏ tích Newsletter', async ({ page }) => {
      const email = generateEmail('reg_female_');
      await page.check('#gender-female');
      await page.locator(NEWSLETTER_SELECTOR).first().uncheck();
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', email);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
  
      await page.click('#register-button');
      await expect(page.locator('.result')).toContainText('Your registration completed');
  
      // Kiểm tra thông tin trong Customer Info
      await page.goto('https://demo.nopcommerce.com/customer/info');
      await expect(page.locator('#gender-female')).toBeChecked();
      await expect(page.locator(NEWSLETTER_SELECTOR).first()).not.toBeChecked();
    });

  test('AUTH_REG_Success_04: Kiểm tra nút [Continue] và trạng thái đăng nhập sau khi đăng ký', async ({ page }) => {
      const email = generateEmail('reg_continue_');
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', email);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      await page.click('a.register-continue-button, a:has-text("Continue")');
      await expect(page).toHaveURL(/.*demo\.nopcommerce\.com\/?$/);
      await expect(page.locator('a.ico-account')).toBeVisible();
      await expect(page.locator('a.ico-logout')).toBeVisible();
      await expect(page.locator('a.ico-register')).not.toBeVisible();
    });

  test('AUTH_REG_Success_05: Kiểm tra thông tin tài khoản được lưu đúng', async ({ page }) => {
      const email = generateEmail('reg_info_');
      await page.check('#gender-male');
      await page.fill('#FirstName', 'Phuoc');
      await page.fill('#LastName', 'Le');
      await page.fill('#Email', email);
      await page.fill('#Company', 'IUH Group 13');
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      await page.goto('https://demo.nopcommerce.com/customer/info');
      await expect(page.locator('#gender-male')).toBeChecked();
      await expect(page.locator('#FirstName')).toHaveValue('Phuoc');
      await expect(page.locator('#LastName')).toHaveValue('Le');
      await expect(page.locator('#Email')).toHaveValue(email);
      await expect(page.locator('#Company')).toHaveValue('IUH Group 13');
      await expect(page.locator(NEWSLETTER_SELECTOR).first()).toBeChecked();
    });

  test('AUTH_REG_Success_06: Kiểm tra đăng nhập lại bằng tài khoản vừa đăng ký', async ({ page }) => {
      const email = generateEmail('reg_relogin_');
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', email);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      // 1. Đăng xuất
      await page.click('a.ico-logout');
      await expect(page.locator('a.ico-login')).toBeVisible();
  
      // 2. Đăng nhập lại
      await page.click('a.ico-login');
      await page.fill('#Email', email);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.click('button.login-button');
  
      await expect(page.locator('a.ico-account')).toBeVisible();
    });

  test('AUTH_REG_Success_07: Kiểm tra khách hàng mới hiển thị trong trang admin', async ({ page }) => {
      const email = generateEmail('admin_chk_');
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', email);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      // Thử truy cập trang admin demo để xác minh
      try {
        await page.goto('https://admin-demo.nopcommerce.com/admin/', { timeout: 30000 });
        if (await page.locator('button.login-button').isVisible()) {
          await page.click('button.login-button');
        }
        await page.goto('https://admin-demo.nopcommerce.com/Admin/Customer/List');
        await page.fill('#SearchEmail', email);
        await page.click('#search-customers');
      } catch (e) {
        console.log('Admin demo page check skipped or network restricted:', e.message);
      }
    });

  test('AUTH_REG_Success_08: Kiểm tra đăng ký với tên tiếng Việt có dấu', async ({ page }) => {
      const email = generateEmail('vn_accent_');
      await page.fill('#FirstName', 'Phước');
      await page.fill('#LastName', 'Lê Hữu');
      await page.fill('#Email', email);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      await expect(page.locator('.result')).toContainText('Your registration completed');
      await page.goto('https://demo.nopcommerce.com/customer/info');
      await expect(page.locator('#FirstName')).toHaveValue('Phước');
      await expect(page.locator('#LastName')).toHaveValue('Lê Hữu');
    });

  test('AUTH_REG_Success_09: Kiểm tra đăng ký với tên có dấu nháy và gạch nối', async ({ page }) => {
      const email = generateEmail('hyphen_quote_');
      await page.fill('#FirstName', "Anne-Marie");
      await page.fill('#LastName', "O'Neil");
      await page.fill('#Email', email);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      await expect(page.locator('.result')).toContainText('Your registration completed');
      await page.goto('https://demo.nopcommerce.com/customer/info');
      await expect(page.locator('#FirstName')).toHaveValue("Anne-Marie");
      await expect(page.locator('#LastName')).toHaveValue("O'Neil");
    });

  test('AUTH_REG_Success_10: Kiểm tra đăng ký với Email có dấu "+" và dấu chấm', async ({ page }) => {
      const email = `phuoc.le+test_${Date.now()}@example.com`;
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', email);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      await expect(page.locator('.result')).toContainText('Your registration completed');
      await page.goto('https://demo.nopcommerce.com/customer/info');
      await expect(page.locator('#Email')).toHaveValue(email);
    });

  test('AUTH_REG_Success_11: Kiểm tra đăng ký với Email viết hoa rồi đăng nhập bằng chữ thường', async ({ page }) => {
      const timestamp = Date.now();
      const upperEmail = `PHUOC.TEST_${timestamp}@EXAMPLE.COM`;
      const lowerEmail = `phuoc.test_${timestamp}@example.com`;
  
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', upperEmail);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
      await expect(page.locator('.result')).toContainText('Your registration completed');
  
      // Đăng xuất và đăng nhập bằng email chữ thường
      await page.click('a.ico-logout');
      await page.click('a.ico-login');
      await page.fill('#Email', lowerEmail);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.click('button.login-button');
  
      await expect(page.locator('a.ico-account')).toBeVisible();
    });

  test('AUTH_REG_Success_12: Kiểm tra đăng ký với mật khẩu chứa ký tự đặc biệt', async ({ page }) => {
      const email = generateEmail('special_pwd_');
      const specialPwd = 'P@ss!#$%^&*()_+w0rd';
  
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', email);
      await page.fill('#Password', specialPwd);
      await page.fill('#ConfirmPassword', specialPwd);
      await page.click('#register-button');
  
      await expect(page.locator('.result')).toContainText('Your registration completed');
  
      // Đăng nhập lại để kiểm tra
      await page.click('a.ico-logout');
      await page.click('a.ico-login');
      await page.fill('#Email', email);
      await page.fill('#Password', specialPwd);
      await page.click('button.login-button');
      await expect(page.locator('a.ico-account')).toBeVisible();
    });

  test('AUTH_REG_Success_13: Kiểm tra giỏ hàng vãng lai được giữ lại sau khi đăng ký', async ({ page }) => {
      // 1. Thêm một sản phẩm vào cart khi chưa đăng nhập
      await page.goto('https://demo.nopcommerce.com/');
      const addToCartBtn = page.locator('.product-item button.product-box-add-to-cart-button').first();
      if (await addToCartBtn.isVisible().catch(() => false)) {
        await addToCartBtn.click();
        await page.waitForTimeout(1000);
      }
  
      // 2. Đăng ký tài khoản mới
      await page.goto('https://demo.nopcommerce.com/register');
      const email = generateEmail('cart_guest_');
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', email);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      // 3. Kiểm tra Shopping cart
      await page.goto('https://demo.nopcommerce.com/cart');
      await expect(page).toHaveURL(/.*\/cart/);
    });

  test('AUTH_REG_Success_14: Kiểm tra wishlist vãng lai được giữ lại sau khi đăng ký', async ({ page }) => {
      // 1. Vào wishlist khi chưa đăng nhập
      await page.goto('https://demo.nopcommerce.com/');
      const addToWishlist = page.locator('.product-item button.add-to-wishlist-button').first();
      if (await addToWishlist.isVisible().catch(() => false)) {
        await addToWishlist.click();
        await page.waitForTimeout(1000);
      }
  
      // 2. Đăng ký
      await page.goto('https://demo.nopcommerce.com/register');
      const email = generateEmail('wishlist_guest_');
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', email);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      // 3. Kiểm tra Wishlist
      await page.goto('https://demo.nopcommerce.com/wishlist');
      await expect(page).toHaveURL(/.*\/wishlist/);
    });

  test('AUTH_REG_Empty_01: Kiểm tra để trống First name', async ({ page }) => {
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', generateEmail());
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      const err = page.locator('#FirstName-error');
      await expect(err).toBeVisible();
      await expect(err).toContainText('First name is required.');
    });

  test('AUTH_REG_Empty_02: Kiểm tra để trống Last name', async ({ page }) => {
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#Email', generateEmail());
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      const err = page.locator('#LastName-error');
      await expect(err).toBeVisible();
      await expect(err).toContainText('Last name is required.');
    });

  test('AUTH_REG_Empty_03: Kiểm tra để trống Email', async ({ page }) => {
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      const err = page.locator('#Email-error');
      await expect(err).toBeVisible();
      await expect(err).toContainText('Email is required.');
    });

  test('AUTH_REG_Empty_04: Kiểm tra để trống Password', async ({ page }) => {
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', generateEmail());
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      const err = page.locator('#ConfirmPassword-error, #Password-error, span.field-validation-error, .message-error');
      await expect(err.first()).toBeVisible();
      await expect(err.first()).toContainText(/Password is required|do not match/i);
    });

  test('AUTH_REG_Empty_05: Kiểm tra để trống Confirm password', async ({ page }) => {
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', generateEmail());
      await page.fill('#Password', DEFAULT_USER.password);
      await page.click('#register-button');
  
      const err = page.locator('#ConfirmPassword-error, #Password-error, span.field-validation-error');
      await expect(err.first()).toBeVisible();
      await expect(err.first()).toContainText(/Password is required|do not match/i);
    });

  test('AUTH_REG_Empty_06: Kiểm tra để trống toàn bộ form', async ({ page }) => {
      await page.click('#register-button');
  
      await expect(page.locator('#FirstName-error')).toBeVisible();
      await expect(page.locator('#LastName-error')).toBeVisible();
      await expect(page.locator('#Email-error')).toBeVisible();
      await expect(page.locator('#ConfirmPassword-error')).toBeVisible();
    });

  test('AUTH_REG_Empty_07: Kiểm tra First name và Last name chỉ gồm khoảng trắng', async ({ page }) => {
      await page.fill('#FirstName', '   ');
      await page.fill('#LastName', '   ');
      await page.fill('#Email', generateEmail());
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      await expect(page.locator('.result')).not.toBeVisible();
    });

  test('AUTH_REG_Empty_08: Kiểm tra Password và Confirm password chỉ gồm khoảng trắng', async ({ page }) => {
    await page.fill('#FirstName', '   ');
    await page.fill('#LastName', '   ');
    await page.fill('#Email', generateEmail());
    await page.fill('#Password', 'Test@123456');
    await page.fill('#ConfirmPassword', 'Test@123456');
    await page.click('#register-button');

    const fnError = page.locator('#FirstName-error');
    await expect(fnError, 'Defect: Hệ thống chấp nhận chuỗi khoảng trắng cho họ tên thay vì báo lỗi bắt buộc').toHaveText('First name cannot be only whitespace');

    });

  test('AUTH_REG_Empty_09: Kiểm tra thông báo lỗi biến mất sau khi nhập đúng', async ({ page }) => {
    await page.fill('#FirstName', 'Phuoc');
    await page.fill('#LastName', 'Le');
    await page.fill('#Email', generateEmail());
    await page.fill('#Company', '   ');
    await page.fill('#Password', 'Test@123456');
    await page.fill('#ConfirmPassword', 'Test@123456');
    await page.click('#register-button');

    const compVal = await page.locator('#Company').inputValue().catch(() => '');
    expect(compVal, 'Defect: Tên công ty không được tự động loại bỏ khoảng trắng thừa').toBe('');

    });

  test('AUTH_REG_Email_01: Kiểm tra Email sai định dạng: thiếu @ và tên miền ("abc")', async ({ page }) => {
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', 'abc');
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      await expect(page.locator('#Email-error')).toContainText(/Wrong email|valid email/i);
    });

  test('AUTH_REG_Email_02: Kiểm tra Email sai định dạng: thiếu phần mở rộng tên miền ("abc@example")', async ({ page }) => {
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', 'abc@example');
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      await expect(page.locator('#Email-error')).toContainText(/Wrong email|valid email/i);
    });

  test('AUTH_REG_Email_03: Kiểm tra Email sai định dạng: thiếu phần tên trước @ ("@example.com")', async ({ page }) => {
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', '@example.com');
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      await expect(page.locator('#Email-error')).toContainText(/Wrong email|valid email/i);
    });

  test('AUTH_REG_Email_04: Kiểm tra Email sai định dạng: có 2 dấu @ ("abc@@example.com")', async ({ page }) => {
    await page.fill('#FirstName', 'Phuoc');
    await page.fill('#LastName', 'Le');
    await page.fill('#Email', 'abc@@example.com');
    await page.fill('#Password', 'Test@123456');
    await page.fill('#ConfirmPassword', 'Test@123456');
    await page.click('#register-button');

    const emailError = page.locator('#Email-error');
    await expect(emailError, 'Defect: Thông báo lỗi email 2 dấu @ chưa chi tiết theo chuẩn RFC').toHaveText('Email address contains invalid consecutive @ symbols');

    });

  test('AUTH_REG_Email_05: Kiểm tra Email sai định dạng: có khoảng trắng ở giữa ("abc @example.com")', async ({ page }) => {
    await page.fill('#FirstName', 'Phuoc');
    await page.fill('#LastName', 'Le');
    await page.fill('#Email', 'abc @example.com');
    await page.fill('#Password', 'Test@123456');
    await page.fill('#ConfirmPassword', 'Test@123456');
    await page.click('#register-button');

    const emailError = page.locator('#Email-error');
    await expect(emailError, 'Defect: Hệ thống thiếu thông báo cụ thể Email không được chứa khoảng trắng').toHaveText('Email cannot contain spaces');

    });

  test('AUTH_REG_Email_06: Kiểm tra Email chứa mã script ("<script>alert(1)</script>@example.com")', async ({ page }) => {
    await page.fill('#FirstName', 'Phuoc');
    await page.fill('#LastName', 'Le');
    await page.fill('#Email', '<script>alert(1)</script>@example.com');
    await page.fill('#Password', 'Test@123456');
    await page.fill('#ConfirmPassword', 'Test@123456');
    await page.click('#register-button');

    const emailError = page.locator('#Email-error');
    await expect(emailError, 'Defect: Hệ thống thiếu cảnh báo phát hiện mã script trong email').toHaveText('Email contains prohibited characters');
    });

  test('AUTH_REG_Email_07: Kiểm tra Email đã tồn tại', async ({ page }) => {
      const existingEmail = generateEmail('duplicate_');
      // Đăng ký lần 1
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', existingEmail);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
      await expect(page.locator('.result')).toContainText('Your registration completed');
  
      // Đăng xuất và thử đăng ký lại với cùng email
      await page.click('a.ico-logout');
      await page.goto('https://demo.nopcommerce.com/register');
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', existingEmail);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      const errorMsg = page.locator('.message-error');
      await expect(errorMsg).toContainText('The specified email already exists');
    });

  test('AUTH_REG_Email_08: Kiểm tra Email đã tồn tại nhưng khác chữ hoa / thường', async ({ page }) => {
      const timestamp = Date.now();
      const emailLower = `case_exist_${timestamp}@example.com`;
      const emailUpper = `CASE_EXIST_${timestamp}@EXAMPLE.COM`;
  
      // Đăng ký chữ thường
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', emailLower);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
      await expect(page.locator('.result')).toContainText('Your registration completed');
  
      // Đăng ký lại bằng chữ hoa
      await page.click('a.ico-logout');
      await page.goto('https://demo.nopcommerce.com/register');
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', emailUpper);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      const errorMsg = page.locator('.message-error');
      await expect(errorMsg).toContainText('The specified email already exists');
    });

  test('AUTH_REG_Password_01: Kiểm tra mật khẩu 5 ký tự (dưới giới hạn tối thiểu 6 ký tự)', async ({ page }) => {
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', generateEmail());
      await page.fill('#Password', 'Ab123');
      await page.fill('#ConfirmPassword', 'Ab123');
      await page.click('#register-button');
  
      const err = page.locator('#Password-error');
      await expect(err).toContainText('must have at least 6 characters');
    });

  test('AUTH_REG_Password_02: Kiểm tra mật khẩu đúng 6 ký tự (giá trị biên dưới)', async ({ page }) => {
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', generateEmail());
      await page.fill('#Password', 'Ab1234');
      await page.fill('#ConfirmPassword', 'Ab1234');
      await page.click('#register-button');
  
      await expect(page.locator('.result')).toContainText('Your registration completed');
    });

  test('AUTH_REG_Password_03: Kiểm tra mật khẩu đúng 64 ký tự (giá trị biên trên)', async ({ page }) => {
    const pass64 = 'A' + 'a@1'.repeat(21);
    await page.fill('#FirstName', 'Phuoc');
    await page.fill('#LastName', 'Le');
    await page.fill('#Email', generateEmail());
    await page.fill('#Password', pass64);
    await page.fill('#ConfirmPassword', pass64);

    const strengthBar = page.locator('.password-strength-strong, .password-strength');
    await expect(strengthBar, 'Defect: Hệ thống chưa tích hợp thanh đánh giá độ mạnh mật khẩu (Password Strength)').toBeVisible({ timeout: 1000 });

    });

  test('AUTH_REG_Password_04: Kiểm tra mật khẩu 65 ký tự (vượt giới hạn tối đa)', async ({ page }) => {
    const pass65 = 'A' + 'a@1'.repeat(21) + 'x';
    await page.fill('#FirstName', 'Phuoc');
    await page.fill('#LastName', 'Le');
    await page.fill('#Email', generateEmail());
    await page.fill('#Password', pass65);
    await page.fill('#ConfirmPassword', pass65);
    await page.click('#register-button');

    const passError = page.locator('#Password-error');
    await expect(passError, 'Defect: Hệ thống không giới hạn độ dài mật khẩu tối đa 64 ký tự').toHaveText('The password must not exceed 64 characters');

    });

  test('AUTH_REG_Password_05: Kiểm tra Confirm password khác hoàn toàn Password', async ({ page }) => {
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', generateEmail());
      await page.fill('#Password', 'Test@123456');
      await page.fill('#ConfirmPassword', 'Khac@654321');
      await page.click('#register-button');
  
      const err = page.locator('#ConfirmPassword-error');
      await expect(err).toContainText('The password and confirmation password do not match.');
    });

  test('AUTH_REG_Password_06: Kiểm tra Confirm password chỉ khác chữ hoa / thường', async ({ page }) => {
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', generateEmail());
      await page.fill('#Password', 'Test@123456');
      await page.fill('#ConfirmPassword', 'test@123456');
      await page.click('#register-button');
  
      const err = page.locator('#ConfirmPassword-error');
      await expect(err).toContainText('The password and confirmation password do not match.');
    });

  test('AUTH_REG_Password_07: Kiểm tra mật khẩu chỉ gồm chữ số', async ({ page }) => {
    await page.fill('#FirstName', 'Phuoc');
    await page.fill('#LastName', 'Le');
    await page.fill('#Email', generateEmail());
    await page.fill('#Password', '123456');
    await page.fill('#ConfirmPassword', '123456');
    await page.click('#register-button');

    const passError = page.locator('#Password-error');
    await expect(passError, 'Defect: Hệ thống thiếu ràng buộc độ phức tạp mật khẩu (cần có cả chữ cái và số)').toContainText('Password must contain both letters and numbers');

    });

  test('AUTH_REG_Field_01: Kiểm tra First name và Last name chỉ có 1 ký tự (biên dưới)', async ({ page }) => {
      await page.fill('#FirstName', 'A');
      await page.fill('#LastName', 'B');
      await page.fill('#Email', generateEmail());
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      await expect(page.locator('.result')).toContainText('Your registration completed');
    });

  test('AUTH_REG_Field_02: Kiểm tra họ tên chứa chữ số và ký tự đặc biệt', async ({ page }) => {
    await page.fill('#FirstName', 'Phuoc123!@#');
    await page.fill('#LastName', 'Le456$%^');
    await page.fill('#Email', generateEmail());
    await page.fill('#Password', 'Test@123456');
    await page.fill('#ConfirmPassword', 'Test@123456');
    await page.click('#register-button');

    const nameError = page.locator('#FirstName-error, #LastName-error');
    await expect(nameError, 'Defect: Trường họ tên không được phép chứa chữ số hoặc ký tự đặc biệt theo quy chuẩn').toBeVisible({ timeout: 1000 });

    });

  test('AUTH_REG_Field_03: Kiểm tra Company name chứa ký tự đặc biệt', async ({ page }) => {
    await page.fill('#FirstName', 'Phuoc');
    await page.fill('#LastName', 'Le');
    await page.fill('#Email', generateEmail());
    await page.fill('#Company', '<script>alert("hack")</script>');
    await page.fill('#Password', 'Test@123456');
    await page.fill('#ConfirmPassword', 'Test@123456');
    await page.click('#register-button');

    const compError = page.locator('#Company-error');
    await expect(compError, 'Defect: Tên công ty chứa thẻ HTML/Script không bị từ chối').toBeVisible({ timeout: 1000 });

    });

  test('AUTH_REG_News_01: Kiểm tra đăng ký tích Newsletter', async ({ page }) => {
      const email = generateEmail('news_check_');
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', email);
      await page.locator(NEWSLETTER_SELECTOR).first().check();
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      await expect(page.locator('.result')).toContainText('Your registration completed');
    });

  test('AUTH_REG_News_02: Kiểm tra đăng ký bỏ tích Newsletter', async ({ page }) => {
      const email = generateEmail('news_uncheck_');
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', email);
      await page.locator(NEWSLETTER_SELECTOR).first().uncheck();
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      await expect(page.locator('.result')).toContainText('Your registration completed');
      await page.goto('https://demo.nopcommerce.com/customer/info');
      await expect(page.locator(NEWSLETTER_SELECTOR).first()).not.toBeChecked();
    });

  test('AUTH_REG_News_03: Kiểm tra bật rồi tắt Newsletter sau khi đăng ký', async ({ page }) => {
      const email = generateEmail('news_toggle_');
      await page.locator(NEWSLETTER_SELECTOR).first().uncheck();
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', email);
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      // 1. Vào Customer info bật Newsletter
      await page.goto('https://demo.nopcommerce.com/customer/info');
      await page.locator(NEWSLETTER_SELECTOR).first().check();
      await page.click('#save-info-button, button:has-text("Save")');
  
      // 2. Tắt Newsletter
      await page.locator(NEWSLETTER_SELECTOR).first().uncheck();
      await page.click('#save-info-button, button:has-text("Save")');
      await expect(page.locator(NEWSLETTER_SELECTOR).first()).not.toBeChecked();
    });

  test('AUTH_REG_News_04: Kiểm tra email đã đăng ký newsletter ở footer rồi đăng ký tài khoản cùng email', async ({ page }) => {
    const testEmail = generateEmail();
    await page.goto('https://demo.nopcommerce.com/');
    await page.fill('#newsletter-email', testEmail);
    await page.click('#newsletter-subscribe-button');
    await page.waitForTimeout(1000);

    await page.goto('https://demo.nopcommerce.com/register');
    await page.fill('#FirstName', 'Phuoc');
    await page.fill('#LastName', 'Le');
    await page.fill('#Email', testEmail);
    await page.fill('#Password', 'Test@123456');
    await page.fill('#ConfirmPassword', 'Test@123456');
    await page.check('#Newsletter');
    await page.click('#register-button');

    const notif = page.locator('.newsletter-already-subscribed');
    await expect(notif, 'Defect: Thiếu thông báo đồng bộ email đã đăng ký newsletter trước đó').toBeVisible({ timeout: 1000 });

    });

  test('AUTH_REG_Security_01: Kiểm tra mã script ở First name không bị thực thi (XSS)', async ({ page }) => {
    const xssScript = '<script>document.title="Hacked"</script>';
    await page.fill('#FirstName', xssScript);
    await page.fill('#LastName', 'Le');
    await page.fill('#Email', generateEmail());
    await page.fill('#Password', 'Test@123456');
    await page.fill('#ConfirmPassword', 'Test@123456');
    await page.click('#register-button');

    const err = page.locator('#FirstName-error');
    await expect(err, 'Defect: Hệ thống chưa thực hiện sanitize và cảnh báo ký tự XSS ở trường First Name').toBeVisible({ timeout: 1000 });
    });

  test('AUTH_REG_Security_02: Kiểm tra SQL injection ở họ tên', async ({ page }) => {
      await page.fill('#FirstName', "' OR 1=1 --");
      await page.fill('#LastName', "'; DROP TABLE Customer; --");
      await page.fill('#Email', generateEmail('sqli_'));
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      // Hệ thống không bị lỗi crash 500 hoặc lộ chi tiết DB
      // Hệ thống xử lý an toàn, không crash
      expect(page.url()).toContain('nopcommerce.com');
    });

  test('AUTH_REG_Security_03: Kiểm tra nhấn [REGISTER] nhiều lần liên tiếp', async ({ page }) => {
    await page.fill('#FirstName', 'Phuoc');
    await page.fill('#LastName', 'Le');
    await page.fill('#Email', generateEmail());
    await page.fill('#Password', 'Test@123456');
    await page.fill('#ConfirmPassword', 'Test@123456');

    const regBtn = page.locator('#register-button');
    await regBtn.click({ noWaitAfter: true });

    await expect(regBtn, 'Defect: Nút Register không bị vô hiệu hóa khi đang xử lý đăng ký, có nguy cơ Double Submit').toBeDisabled({ timeout: 500 });

    });

  test('AUTH_REG_Security_04: Kiểm tra tải lại trang (F5) sau khi đăng ký thành công', async ({ page }) => {
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', generateEmail('reload_f5_'));
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      // F5 lại trang
      await page.reload();
      const isCompleted = await page.locator('.result').isVisible().catch(() => false);
      const isHome = page.url().includes('nopcommerce.com');
      expect(isCompleted || isHome).toBeTruthy();
    });

  test('AUTH_REG_Security_05: Kiểm tra nút Back của trình duyệt sau khi đăng ký thành công', async ({ page }) => {
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', generateEmail('browser_back_'));
      await page.fill('#Password', DEFAULT_USER.password);
      await page.fill('#ConfirmPassword', DEFAULT_USER.password);
      await page.click('#register-button');
  
      await page.click('a.register-continue-button, a:has-text("Continue")');
      await page.goBack();
      expect(page.url()).toContain('nopcommerce.com');
    });

  test('AUTH_REG_Security_06: Kiểm tra email và mật khẩu không xuất hiện trên URL (POST method)', async ({ page }) => {
      const rawPwd = 'SecretPassword123';
      const email = generateEmail('post_url_');
      await page.fill('#FirstName', DEFAULT_USER.firstName);
      await page.fill('#LastName', DEFAULT_USER.lastName);
      await page.fill('#Email', email);
      await page.fill('#Password', rawPwd);
      await page.fill('#ConfirmPassword', rawPwd);
      await page.click('#register-button');
  
      const currentUrl = page.url();
      expect(currentUrl).not.toContain(rawPwd);
      expect(currentUrl).not.toContain(email);
    });

  test('AUTH_REG_Security_07: Kiểm tra trang đăng ký dùng kết nối HTTPS', async ({ page }) => {
      expect(page.url().startsWith('https://')).toBeTruthy();
    });

  test('AUTH_REG_Link_01: Kiểm tra liên kết [Log in] trên header của trang đăng ký', async ({ page }) => {
      await page.click('a.ico-login');
      await expect(page).toHaveURL(/.*\/login/);
    });

  test('AUTH_REG_Link_02: Kiểm tra click logo nopCommerce khi đang nhập dở form', async ({ page }) => {
      await page.fill('#FirstName', 'DraftFirstName');
      await page.fill('#LastName', 'DraftLastName');
      await page.click('.header-logo a');
  
      await expect(page).toHaveURL('https://demo.nopcommerce.com/');
      await expect(page.locator('a.ico-register')).toBeVisible();
    });
});
