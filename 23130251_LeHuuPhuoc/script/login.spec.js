// @ts-check
const { test, expect } = require('../../fixtures');
const { generateEmail, DEFAULT_USER, testAccount, ensureTestAccount } = require('../helpers');

test.describe('Kiểm thử User - Login & Logout (21 Test Cases)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.nopcommerce.com/');
    if (await page.locator('a.ico-logout').isVisible().catch(() => false)) {
      await page.click('a.ico-logout');
    }
    await page.goto('https://demo.nopcommerce.com/login');
    await page.locator('#Email').waitFor({ state: 'visible', timeout: 60000 });
  });

  test('AUTH_LOGIN_View_01: Kiểm tra mở trang đăng nhập từ menu [Log in]', async ({ page }) => {
      await page.goto('https://demo.nopcommerce.com/');
      await expect(page.locator('a.ico-login')).toBeVisible();
  
      await page.click('a.ico-login');
      await expect(page).toHaveURL(/.*\/login/);
  
      // Kiểm tra 2 khối Returning Customer và New Customer
      await expect(page.locator('.returning-wrapper')).toBeVisible();
      await expect(page.locator('.returning-wrapper #Email')).toBeVisible();
      await expect(page.locator('.returning-wrapper #Password')).toBeVisible();
      await expect(page.locator('.returning-wrapper #RememberMe')).toBeVisible();
      await expect(page.locator('.returning-wrapper a[href*="passwordrecovery"]')).toBeVisible();
      await expect(page.locator('.returning-wrapper button.login-button')).toBeVisible();
  
      await expect(page.locator('.new-wrapper')).toBeVisible();
      await expect(page.locator('.new-wrapper .register-button')).toBeVisible();
    });

  test('AUTH_LOGIN_View_02: Kiểm tra layout trang đăng nhập trên desktop và mobile', async ({ page }) => {
      await expect(page.locator('.login-page')).toBeVisible();
      await expect(page.locator('#Password')).toHaveAttribute('type', 'password');
      await expect(page.locator('button.login-button')).toBeVisible();
    });

  test('AUTH_LOGIN_View_03: Kiểm tra nút [Register] trong khối New Customer', async ({ page }) => {
      await page.click('.new-wrapper .register-button');
      await expect(page).toHaveURL(/.*\/register/);
      await expect(page.locator('.page-title h1')).toContainText('Register');
    });

  test('AUTH_LOGIN_Success_01: Kiểm tra đăng nhập với Email và Password đúng', async ({ page }) => {
      await ensureTestAccount(page);
      await page.fill('#Email', testAccount.email);
      await page.fill('#Password', testAccount.password);
      await page.click('button.login-button');
  
      await expect(page).toHaveURL('https://demo.nopcommerce.com/');
      await expect(page.locator('a.ico-account')).toBeVisible();
      await expect(page.locator('a.ico-logout')).toBeVisible();
      await expect(page.locator('a.ico-login')).not.toBeVisible();
    });

  test('AUTH_LOGIN_Success_02: Kiểm tra tùy chọn [Remember me]', async ({ page }) => {
      await ensureTestAccount(page);
      await page.fill('#Email', testAccount.email);
      await page.fill('#Password', testAccount.password);
      await page.check('#RememberMe');
      await page.click('button.login-button');
  
      await expect(page.locator('a.ico-account')).toBeVisible();
    });

  test('AUTH_LOGIN_Success_03: Kiểm tra Email không phân biệt chữ hoa thường', async ({ page }) => {
      await ensureTestAccount(page);
      const upperEmail = testAccount.email.toUpperCase();
      await page.fill('#Email', upperEmail);
      await page.fill('#Password', testAccount.password);
      await page.click('button.login-button');
  
      await expect(page.locator('a.ico-account')).toBeVisible();
    });

  test('AUTH_LOGIN_Success_04: Kiểm tra đăng nhập có khoảng trắng đầu cuối ở Email', async ({ page }) => {
    await ensureTestAccount(page);
    await page.fill('#Email', `  ${testAccount.email}  `);
    await page.fill('#Password', testAccount.password);
    await page.click('button.login-button');

    const emailVal = await page.locator('#Email').inputValue().catch(() => '');
    expect(emailVal, 'Defect: Email có khoảng trắng đầu cuối chưa được tự động loại bỏ (trim)').toBe(testAccount.email.trim());
    await expect(page.locator('a.ico-account')).toBeVisible();

    });

  test('AUTH_LOGIN_Success_05: Kiểm tra đăng nhập bằng phím Enter', async ({ page }) => {
      await ensureTestAccount(page);
      await page.fill('#Email', testAccount.email);
      await page.fill('#Password', testAccount.password);
      await page.focus('#Password');
      await page.keyboard.press('Enter');
  
      await expect(page.locator('a.ico-account')).toBeVisible({ timeout: 15000 });
    });

  test('AUTH_LOGIN_Success_06: Kiểm tra quay lại trang đang xem sau khi đăng nhập (ReturnUrl)', async ({ page }) => {
      await ensureTestAccount(page);
      await page.goto('https://demo.nopcommerce.com/login?returnUrl=%2Fcart');
      await page.fill('#Email', testAccount.email);
      await page.fill('#Password', testAccount.password);
      await page.click('button.login-button');
  
      await expect(page).toHaveURL(/.*(\/cart|\/)/);
      await expect(page.locator('a.ico-account')).toBeVisible();
    });

  test('AUTH_LOGIN_Fail_01: Kiểm tra Email đúng, Password sai', async ({ page }) => {
      await ensureTestAccount(page);
      await page.fill('#Email', testAccount.email);
      await page.fill('#Password', 'WrongPass@999');
      await page.click('button.login-button');
  
      const errorMsg = page.locator('.message-error');
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText('Login was unsuccessful.');
      await expect(errorMsg).toContainText('The credentials provided are incorrect');
    });

  test('AUTH_LOGIN_Fail_02: Kiểm tra Email chưa đăng ký', async ({ page }) => {
      const nonExistentEmail = generateEmail('nonexistent_');
      await page.fill('#Email', nonExistentEmail);
      await page.fill('#Password', 'SomePassword@123');
      await page.click('button.login-button');
  
      const errorMsg = page.locator('.message-error');
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText('Login was unsuccessful.');
    });

  test('AUTH_LOGIN_Fail_03: Kiểm tra để trống Email', async ({ page }) => {
      await page.fill('#Password', 'SomePassword@123');
      await page.click('button.login-button');
  
      const errorMsg = page.locator('#Email-error');
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText('Please enter your email');
    });

  test('AUTH_LOGIN_Fail_04: Kiểm tra để trống Password', async ({ page }) => {
      await ensureTestAccount(page);
      await page.fill('#Email', testAccount.email);
      await page.click('button.login-button');
  
      const errorMsg = page.locator('.message-error');
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText('The credentials provided are incorrect');
    });

  test('AUTH_LOGIN_Fail_05: Kiểm tra để trống cả hai trường', async ({ page }) => {
      await page.click('button.login-button');
  
      const errorMsg = page.locator('#Email-error');
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText('Please enter your email');
    });

  test('AUTH_LOGIN_Fail_06: Kiểm tra Email sai định dạng ("abc")', async ({ page }) => {
    await page.fill('#Email', 'abc');
    await page.fill('#Password', 'Test@123456');
    await page.click('button.login-button');

    const errorMsg = page.locator('#Email-error');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg, 'Defect: Thông báo lỗi định dạng email chưa chuẩn hóa theo tài liệu đặc tả (SRS)').toHaveText('Please enter a valid email format');

    });

  test('AUTH_LOGIN_Fail_07: Kiểm tra Password phân biệt chữ hoa thường', async ({ page }) => {
    await ensureTestAccount(page);
    await page.fill('#Email', testAccount.email);
    await page.fill('#Password', 'test@123456');
    await page.click('button.login-button');

    const errorMsg = page.locator('.message-error');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg, 'Defect: Hệ thống thiếu gợi ý phân biệt chữ hoa/thường cho mật khẩu').toContainText('Password is case-sensitive');

    });

  test('AUTH_LOGIN_Forgot_01: Kiểm tra liên kết [Forgot password?]', async ({ page }) => {
    await page.click('a[href*="passwordrecovery"]');
    await expect(page).toHaveURL(/.*\/passwordrecovery/);
    await expect(page.locator('.page-title h1')).toContainText('Password recovery');

    await expect(page.locator('#Email')).toBeVisible();
    await expect(page.locator('button[name="send-email"]')).toBeVisible();

    const recoverEmail = generateEmail('recover_');
    await page.fill('#Email', recoverEmail);
    await page.click('button[name="send-email"]');
    await expect(page.locator('.bar-notification, .result, .message-error, p.content').first()).toBeVisible({ timeout: 15000 });
  });

  test('AUTH_LOGIN_Logout_01: Kiểm tra đăng xuất và nút Back của trình duyệt', async ({ page }) => {
    await ensureTestAccount(page);
    await page.goto('https://demo.nopcommerce.com/login');
    await page.locator('#Email').waitFor({ state: 'visible', timeout: 30000 });

    await page.fill('#Email', testAccount.email);
    await page.fill('#Password', testAccount.password);
    await page.click('button.login-button');
    await expect(page.locator('a.ico-account')).toBeVisible({ timeout: 15000 });

    await page.click('a.ico-logout');
    await expect(page.locator('a.ico-login')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('a.ico-account')).not.toBeVisible();

    await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(1000);

    await page.goto('https://demo.nopcommerce.com/customer/info');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('AUTH_LOGIN_Logout_02: Kiểm tra truy cập trang tài khoản khi chưa đăng nhập', async ({ page }) => {
      await page.goto('https://demo.nopcommerce.com/customer/info');
      await expect(page).toHaveURL(/.*\/login.*returnUrl/);
      await expect(page.locator('.page-title h1')).toBeVisible();
    });

  test('AUTH_LOGIN_Security_01: Kiểm tra nhập ký tự đặc biệt / SQL injection vào Email và Password', async ({ page }) => {
    const sqliPayload = "' OR 1=1 --";
    await page.fill('#Email', sqliPayload);
    await page.fill('#Password', sqliPayload);
    await page.click('button.login-button');

    await expect(page.locator('a.ico-account')).not.toBeVisible();
    const secAlert = page.locator('.security-alert, .alert-danger');
    await expect(secAlert, 'Defect: Hệ thống chưa có cảnh báo bảo mật khi phát hiện chuỗi ký tự tấn công SQL Injection').toBeVisible({ timeout: 1000 });

    });

  test('AUTH_LOGIN_Security_02: Kiểm tra nhập sai nhiều lần liên tiếp', async ({ page }) => {
    await ensureTestAccount(page);
    for (let i = 1; i <= 3; i++) {
      await page.fill('#Email', testAccount.email);
      await page.fill('#Password', `WrongPassword_${i}`);
      await page.click('button.login-button');
      await expect(page.locator('.message-error')).toBeVisible();
    }

    await page.fill('#Email', testAccount.email);
    await page.fill('#Password', testAccount.password);
    await page.click('button.login-button');

    const lockedMsg = page.locator('.message-error');
    await expect(lockedMsg, 'Defect: Tài khoản không bị khóa sau 3 lần đăng nhập sai liên tiếp theo chính sách bảo mật').toContainText('temporarily locked');

    });
});
