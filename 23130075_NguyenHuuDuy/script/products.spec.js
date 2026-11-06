

async function login(page) {
    // Nếu trình duyệt đã ở sẵn trong Admin từ test case trước thì bỏ qua, không load lại
    if (page.url().includes('/Admin') && !page.url().includes('/login')) {
        return;
    }

    await page.goto('https://localhost:8080/Admin');
    await handleCloudflare(page);

    // Kiểm tra xem đã thực sự vào được trang Admin chưa (có sidebar quản trị)
    const isDashboard = await page.locator('.main-sidebar, .brand-link, .nav-sidebar').isVisible({ timeout: 5000 }).catch(() => false);
    if (isDashboard) {
        return;
    }

    if (await page.locator('#Email').isVisible({ timeout: 3000 }).catch(() => false)) {
        await page.locator('#Email').fill('admin@yourstore.com');
        await page.locator('#Password').fill('admin');

        await page.locator('button[type="submit"]').click();

        await handleCloudflare(page);

        await page.waitForURL(/\/Admin/i, {
            timeout: 60000
        });
    }
}
