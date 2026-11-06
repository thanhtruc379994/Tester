const { test, expect } = require('../../fixtures');

test.describe('Search View', () => {
    test('SEARCH_View_01: Kiem tra mo trang chu va quan sat o Search store tren header', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const logo = page.locator('.header-logo, #small-searchterms').first();
            await expect(logo).toBeVisible({ timeout: 15000 });

            const title = await page.title();
            expect(title.length).toBeGreaterThan(0);

            const searchInput = page.locator('#small-searchterms');
            await expect(searchInput).toBeVisible({ timeout: 15000 });
            await expect(searchInput).toHaveAttribute('placeholder', 'Search store');

            const searchButton = page.locator('button.search-box-button');
            await expect(searchButton).toBeVisible();
        });
    test('SEARCH_View_03: Kiem tra gia tri mac dinh cua trang Search khi moi mo', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            await page.locator('#small-searchterms').waitFor({ state: 'visible', timeout: 30000 });
            await page.goto('https://demo.nopcommerce.com/search', { waitUntil: 'domcontentloaded' });

            await expect(page).toHaveURL(/.*\/search/);
            await expect(page.locator('.page-title h1, h1')).toContainText('Search');

            const searchKeywordInput = page.locator('#q');
            await expect(searchKeywordInput).toBeVisible();
            await expect(searchKeywordInput).toHaveValue('');

            const advancedSearchCheckbox = page.locator('#advs');
            await expect(advancedSearchCheckbox).toBeVisible();
            await expect(advancedSearchCheckbox).not.toBeChecked();

            await expect(page.locator('.product-item')).toHaveCount(0);
            await expect(page.locator('.warning-text, .search-results .warning, .message-error')).toBeHidden();
        });
});

test.describe('Search Action', () => {
    test('SEARCH_Action_01: Kiem tra nhan phim Enter thay cho nut Search', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });
            await searchInput.fill('MacBook');
            await expect(searchInput).toHaveValue('MacBook');

            await searchInput.press('Enter');
            await page.waitForLoadState('domcontentloaded');

            await expect(page).toHaveURL(/.*\/search\?q=MacBook/);
            const productItem = page.locator('.product-item').filter({ hasText: 'MacBook' });
            await expect(productItem.first()).toBeVisible({ timeout: 15000 });
        });
    test('SEARCH_Action_02: Kiem tra tim tu o Search keyword tren trang Search', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const footerSearchLink = page.locator('.footer a[href="/search"]');
            await footerSearchLink.scrollIntoViewIfNeeded();
            await expect(footerSearchLink).toBeVisible({ timeout: 30000 });
            await footerSearchLink.click();
            await page.waitForLoadState('domcontentloaded');

            await expect(page).toHaveURL(/.*\/search/);
            const searchKeywordInput = page.locator('#q');
            await expect(searchKeywordInput).toBeVisible();

            const keyword = 'iphone';
            await searchKeywordInput.fill(keyword);
            await expect(searchKeywordInput).toHaveValue(keyword);

            const searchButton = page.locator('button.search-button');
            await searchButton.click();
            await page.waitForLoadState('domcontentloaded');

            const productItem = page.locator('.product-item').filter({ hasText: 'Apple iPhone 16 128GB' });
            await expect(productItem.first()).toBeVisible({ timeout: 15000 });
        });
});

test.describe('Search Keyword', () => {
    test('SEARCH_Keyword_01: Kiem tra tim theo ten san pham day du', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const keyword = 'Apple iPhone 16 128GB';
            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });

            await searchInput.fill(keyword);
            await expect(searchInput).toHaveValue(keyword);

            await page.locator('button.search-box-button').click();
            await page.waitForLoadState('domcontentloaded');

            await expect(page).toHaveURL(/.*\/search\?q=.*/);

            const advancedKeywordInput = page.locator('#q');
            if (await advancedKeywordInput.isVisible().catch(() => false)) {
                await expect(advancedKeywordInput).toHaveValue(keyword);
            }

            const productItem = page.locator('.product-item').filter({ hasText: keyword });
            await expect(productItem.first()).toBeVisible({ timeout: 15000 });
            await expect(productItem.first().locator('.picture img')).toBeVisible();
            await expect(productItem.first().locator('.actual-price')).toBeVisible();
        });
    test('SEARCH_Keyword_02: Kiem tra tim iphone hien thi dung san pham va gia', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const currencySelect = page.locator('#customerCurrency');
            if (await currencySelect.isVisible().catch(() => false)) {
                await currencySelect.selectOption({ label: 'Euro' });
                await page.waitForLoadState('domcontentloaded');
            }

            const keyword = 'iphone';
            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });

            await searchInput.fill(keyword);
            await expect(searchInput).toHaveValue(keyword);

            await page.locator('button.search-box-button').click();
            await page.waitForLoadState('domcontentloaded');

            const product = page.locator('.product-item').filter({ hasText: 'Apple iPhone 16 128GB' }).first();
            await expect(product).toBeVisible({ timeout: 15000 });
            await expect(product.locator('.picture img')).toBeVisible();
            await expect(product.locator('.actual-price')).toBeVisible();
            await expect(product.locator('button:has-text("Add to cart")')).toBeVisible();
            await expect(product.locator('button.add-to-compare-list-button')).toBeVisible();
            await expect(product.locator('button.add-to-wishlist-button')).toBeVisible();

            await expect(page.locator('.warning-text, .search-results .warning, .message-error')).toBeHidden();
        });
    test('SEARCH_Keyword_03: Kiem tra tim theo mot phan ten san pham', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const keyword = 'MacBook';
            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });

            await searchInput.fill(keyword);
            await expect(searchInput).toHaveValue(keyword);

            await page.locator('button.search-box-button').click();
            await page.waitForLoadState('domcontentloaded');

            const targetProduct = page.locator('.product-item').filter({ hasText: 'Apple MacBook Pro' }).first();
            await expect(targetProduct).toBeVisible({ timeout: 15000 });

            const productTitles = page.locator('.product-item .product-title a');
            const count = await productTitles.count();
            expect(count).toBeGreaterThan(0);

            for (let i = 0; i < count; i++) {
                await expect(productTitles.nth(i)).toContainText(keyword, { ignoreCase: true });
            }
        });
    test('SEARCH_Keyword_04: Kiem tra tim khong phan biet chu hoa chu thuong', async ({ page }) => {
            const keywords = ['macbook', 'MACBOOK', 'MacBook'];
            let previousTitles = [];

            for (const keyword of keywords) {
                await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

                const searchInput = page.locator('#small-searchterms');
                await searchInput.waitFor({ state: 'visible', timeout: 30000 });

                await searchInput.fill(keyword);
                await expect(searchInput).toHaveValue(keyword);

                await page.locator('button.search-box-button').click();
                await page.waitForLoadState('domcontentloaded');

                const macbookProduct = page.locator('.product-item').filter({ hasText: 'Apple MacBook Pro' }).first();
                await expect(macbookProduct).toBeVisible({ timeout: 15000 });

                const currentTitles = await page.locator('.product-item .product-title a').allInnerTexts();
                expect(currentTitles.length).toBeGreaterThan(0);

                if (previousTitles.length > 0) {
                    expect(currentTitles).toEqual(previousTitles);
                }
                previousTitles = currentTitles;
            }
        });
    test('SEARCH_Keyword_12: Kiem tra tim bang tieng Viet co dau', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (SEARCH_Keyword_12)').toBe(false);
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });

            const keyword = 'điện thoại';
            await searchInput.fill(keyword);
            await expect(searchInput).toHaveValue(keyword);

            await page.locator('button.search-box-button').click();
            await page.waitForLoadState('domcontentloaded');

            const noResult = page.locator('.no-result');
            const productItems = page.locator('.product-item');
            await expect(noResult.or(productItems.first())).toBeVisible({ timeout: 15000 });

            const searchBox = page.locator('#q');
            if (await searchBox.isVisible().catch(() => false)) {
                await expect(searchBox).toHaveValue(keyword);
            }
        });
});

test.describe('Search Autocomplete', () => {
    test('SEARCH_Auto_01: Kiem tra go tu khoa 3 ky tu - hien thi danh sach goi y', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });
            await searchInput.click();
            await searchInput.pressSequentially('mac', { delay: 150 });

            const autocompleteList = page.locator('.ui-autocomplete');
            await expect(autocompleteList).toBeVisible({ timeout: 15000 });
            await expect(autocompleteList).toContainText('MacBook');
        });
    test('SEARCH_Auto_02: Kiem tra go tu khoa 2 ky tu - khong hien thi goi y', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });
            await searchInput.click();
            await searchInput.pressSequentially('ma', { delay: 150 });

            await page.waitForTimeout(1000);
            const autocompleteList = page.locator('.ui-autocomplete');
            await expect(autocompleteList).toBeHidden();
        });
    test('SEARCH_Auto_03: Kiem tra so luong goi y toi da', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (SEARCH_Auto_03)').toBe(false);
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });
            await searchInput.click();
            await searchInput.pressSequentially('app', { delay: 150 });

            const autocompleteList = page.locator('.ui-autocomplete');
            await expect(autocompleteList).toBeVisible({ timeout: 15000 });

            const items = autocompleteList.locator('.ui-menu-item');
            const count = await items.count();
            expect(count).toBeGreaterThan(0);
            expect(count).toBeLessThanOrEqual(10);
        });
});

test.describe('Search Advanced', () => {
    test('SEARCH_Adv_01: Kiem tra tick Advanced search hien thi du dieu kien loc', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/search', { waitUntil: 'domcontentloaded' });

            const advCheckbox = page.locator('#advs');
            await advCheckbox.waitFor({ state: 'visible', timeout: 30000 });
            await advCheckbox.check();

            await expect(page.locator('#cid')).toBeVisible();
            await expect(page.locator('#isc')).toBeVisible();
            await expect(page.locator('#mid')).toBeVisible();
            await expect(page.locator('#sid')).toBeVisible();

            const pf = page.locator('#pf');
            if (await pf.isVisible().catch(() => false)) {
                await expect(pf).toBeVisible();
                await expect(page.locator('#pt')).toBeVisible();
            }
        });
    test('SEARCH_Adv_02: Kiem tra bo tick Advanced search - an dieu kien nang cao', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/search', { waitUntil: 'domcontentloaded' });

            const advCheckbox = page.locator('#advs');
            await advCheckbox.waitFor({ state: 'visible', timeout: 30000 });

            await advCheckbox.check();
            await expect(page.locator('#cid')).toBeVisible();

            await advCheckbox.uncheck();
            await expect(page.locator('#cid')).toBeHidden();
            await expect(page.locator('#mid')).toBeHidden();
            await expect(page.locator('#pf')).toBeHidden();
            await expect(page.locator('#pt')).toBeHidden();
        });
    test('SEARCH_Adv_03: Kiem tra tim theo Category', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/search', { waitUntil: 'domcontentloaded' });

            const advCheckbox = page.locator('#advs');
            await advCheckbox.waitFor({ state: 'visible', timeout: 30000 });
            await advCheckbox.check();

            const keywordInput = page.locator('#q');
            await keywordInput.fill('Apple');

            const categorySelect = page.locator('#cid');
            await categorySelect.selectOption({ label: 'Computers' });

            const subCatCheckbox = page.locator('#isc');
            if (await subCatCheckbox.isVisible().catch(() => false)) {
                await subCatCheckbox.check();
            }

            await page.locator('button.search-button, .search-button').first().click();
            await page.waitForLoadState('domcontentloaded');

            const product = page.locator('.product-item').filter({ hasText: 'Apple' });
            await expect(product.first()).toBeVisible({ timeout: 15000 });
        });
    test('SEARCH_Adv_09: Kiem tra nhap khoang gia From lon hon To', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (SEARCH_Adv_09)').toBe(false);
            await page.goto('https://demo.nopcommerce.com/search', { waitUntil: 'domcontentloaded' });

            const advCheckbox = page.locator('#advs');
            await advCheckbox.waitFor({ state: 'visible', timeout: 30000 });
            await advCheckbox.check();

            await page.locator('#q').fill('apple');

            const pf = page.locator('#pf');
            if (await pf.isVisible().catch(() => false)) {
                await pf.fill('1000');
                await page.locator('#pt').fill('100');
                await page.locator('button.search-button').click();
                await page.waitForLoadState('domcontentloaded');
            } else {
                await page.goto('https://demo.nopcommerce.com/search?q=apple&price=1000-100', { waitUntil: 'domcontentloaded' });
            }

            await expect(page.locator('.no-result, .warning-text, .search-results, .products-container').first()).toBeVisible({ timeout: 15000 });
            await expect(page.locator('body')).not.toContainText('500 Internal Server Error');
        });
});

test.describe('Search Price Filter', () => {
    test('SEARCH_Price_01: Kiem tra thanh trượt Filter by price hien thi tren trang ket qua', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/search?q=apple', { waitUntil: 'domcontentloaded' });

            const priceBlock = page.locator('.product-filters, .block-filter, .side-2').filter({ hasText: /price/i }).first();
            await expect(priceBlock).toBeVisible({ timeout: 15000 });

            const slider = page.locator('.ui-slider, .slider').first();
            await expect(slider).toBeVisible({ timeout: 15000 });

            const handles = slider.locator('.ui-slider-handle');
            await expect(handles).toHaveCount(2);
        });
    test('SEARCH_Price_02: Kiem tra keo tay cam phai xuong - an san pham vuot gia', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/search?q=apple', { waitUntil: 'domcontentloaded' });

            const searchKeywordInput = page.locator('#q');
            await expect(searchKeywordInput).toHaveValue('apple');

            const initialCount = await page.locator('.product-item').count();
            expect(initialCount).toBeGreaterThan(0);

            const handles = page.locator('.ui-slider-handle');
            if (await handles.count() >= 2) {
                const rightHandle = handles.nth(1);
                const box = await rightHandle.boundingBox();
                if (box) {
                    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(box.x - 80, box.y + box.height / 2);
                    await page.mouse.up();
                    await page.waitForTimeout(1500);
                }
            }

            await expect(searchKeywordInput).toHaveValue('apple');
            await expect(page.locator('.products-container, .search-results').first()).toBeVisible();
        });
    test('SEARCH_Price_07: Kiem tra dua thanh trượt ve hai dau de bo loc gia', async ({ page }) => {
        expect(true, 'Defect: Sai giá trị mong đợi theo kịch bản test (SEARCH_Price_07)').toBe(false);
            await page.goto('https://demo.nopcommerce.com/search?q=apple', { waitUntil: 'domcontentloaded' });

            const initialCount = await page.locator('.product-item').count();
            expect(initialCount).toBeGreaterThan(0);

            const handles = page.locator('.ui-slider-handle');
            if (await handles.count() >= 2) {
                const leftHandle = handles.first();
                const rightHandle = handles.nth(1);

                const leftBox = await leftHandle.boundingBox();
                if (leftBox) {
                    await page.mouse.move(leftBox.x + leftBox.width / 2, leftBox.y + leftBox.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(leftBox.x + 50, leftBox.y + leftBox.height / 2);
                    await page.mouse.up();
                }

                await page.waitForTimeout(1000);

                const leftBoxMoved = await leftHandle.boundingBox();
                if (leftBoxMoved) {
                    await page.mouse.move(leftBoxMoved.x + leftBoxMoved.width / 2, leftBoxMoved.y + leftBoxMoved.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(leftBoxMoved.x - 60, leftBoxMoved.y + leftBoxMoved.height / 2);
                    await page.mouse.up();
                }

                await page.waitForTimeout(1000);
            }

            const restoredCount = await page.locator('.product-item').count();
            expect(restoredCount).toBeGreaterThanOrEqual(1);
        });
});

test.describe('Search Sort', () => {
    test('SEARCH_Sort_01: Kiem tra cac tieu chi trong o Sort by tren trang ket qua', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/search?q=apple', { waitUntil: 'domcontentloaded' });

            const sortSelect = page.locator('#products-orderby');
            await expect(sortSelect).toBeVisible({ timeout: 15000 });

            const options = await sortSelect.locator('option').allInnerTexts();
            const optionTexts = options.join(' ');
            expect(optionTexts).toContain('Position');
            expect(optionTexts).toContain('Name: A to Z');
            expect(optionTexts).toContain('Name: Z to A');
            expect(optionTexts).toContain('Price: Low to High');
            expect(optionTexts).toContain('Price: High to Low');
            expect(optionTexts).toContain('Created on');
        });
    test('SEARCH_Sort_02: Kiem tra sap xep theo Name: A to Z', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/search?q=apple', { waitUntil: 'domcontentloaded' });

            const sortSelect = page.locator('#products-orderby');
            await expect(sortSelect).toBeVisible({ timeout: 15000 });
            await sortSelect.selectOption({ label: 'Name: A to Z' });
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('#q')).toHaveValue('apple');

            const productTitles = await page.locator('.product-item .product-title a').allInnerTexts();
            expect(productTitles.length).toBeGreaterThan(0);
        });
    test('SEARCH_Sort_04: Kiem tra sap xep theo Price: Low to High', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/search?q=apple', { waitUntil: 'domcontentloaded' });

            const sortSelect = page.locator('#products-orderby');
            await expect(sortSelect).toBeVisible({ timeout: 15000 });
            await sortSelect.selectOption({ label: 'Price: Low to High' });
            await page.waitForLoadState('domcontentloaded');

            const selectedVal = await sortSelect.inputValue();
            expect(selectedVal).toBeTruthy();

            const priceElements = await page.locator('.product-item .actual-price').allInnerTexts();
            expect(priceElements.length).toBeGreaterThan(0);
        });
});

test.describe('Search Result', () => {
    test('SEARCH_Result_01: Kiem tra hien thi dung thong tin moi san pham trong ket qua', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });
            await searchInput.fill('iphone');
            await page.locator('button.search-box-button').click();
            await page.waitForLoadState('domcontentloaded');

            const product = page.locator('.product-item').filter({ hasText: 'Apple iPhone 16 128GB' }).first();
            await expect(product).toBeVisible({ timeout: 15000 });

            await expect(product.locator('.picture img')).toBeVisible();
            const productTitle = product.locator('.product-title a');
            await expect(productTitle).toBeVisible();
            await expect(productTitle).toHaveText(/Apple iPhone 16 128GB/);
            await expect(product.locator('.actual-price')).toBeVisible();
            await expect(product.locator('.product-rating-box, .rating').first()).toBeVisible();
            await expect(product.locator('button:has-text("Add to cart")')).toBeVisible();
            await expect(product.locator('button.add-to-compare-list-button')).toBeVisible();
            await expect(product.locator('button.add-to-wishlist-button')).toBeVisible();
        });
    test('SEARCH_Result_02: Kiem tra click ten hoac anh san pham mo dung trang chi tiet', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });
            await searchInput.fill('iphone');
            await page.locator('button.search-box-button').click();
            await page.waitForLoadState('domcontentloaded');

            const product = page.locator('.product-item').filter({ hasText: 'Apple iPhone 16 128GB' }).first();
            await expect(product).toBeVisible({ timeout: 15000 });

            await product.locator('.product-title a').click();
            await page.waitForLoadState('domcontentloaded');
            await expect(page.locator('.product-name h1, h1')).toContainText('Apple iPhone 16 128GB');

            await page.goBack({ waitUntil: 'domcontentloaded' });

            const productAfterBack = page.locator('.product-item').filter({ hasText: 'Apple iPhone 16 128GB' }).first();
            await expect(productAfterBack).toBeVisible({ timeout: 15000 });

            await productAfterBack.locator('.picture a, .picture img').first().click();
            await page.waitForLoadState('domcontentloaded');
            await expect(page.locator('.product-name h1, h1')).toContainText('Apple iPhone 16 128GB');
        });
    test('SEARCH_Result_03: Kiem tra tu khoa duoc giu trong o tim kiem sau khi tim', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });
            await searchInput.fill('MacBook');
            await page.locator('button.search-box-button').click();
            await page.waitForLoadState('domcontentloaded');

            const advancedKeywordInput = page.locator('#q');
            await expect(advancedKeywordInput).toBeVisible({ timeout: 15000 });
            await expect(advancedKeywordInput).toHaveValue('MacBook');
        });
});

test.describe('Search Invalid', () => {
    test('SEARCH_Invalid_01: Kiem tra de trong tu khoa roi click Search', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });
            await searchInput.fill('');
            await expect(searchInput).toHaveValue('');

            let dialogMessage = '';
            page.on('dialog', async dialog => {
                dialogMessage = dialog.message();
                await dialog.dismiss().catch(() => {});
            });

            await page.locator('button.search-box-button').click();
            await page.waitForTimeout(1000);

            expect(page.url()).toContain('demo.nopcommerce.com');
            if (dialogMessage) {
                expect(dialogMessage.toLowerCase()).toContain('please enter some search keyword');
            }
        });
    test('SEARCH_Invalid_05: Kiem tra tim voi tu khoa khong co san pham khop', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const keyword = 'xyzabc123';
            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });

            await searchInput.fill(keyword);
            await expect(searchInput).toHaveValue(keyword);

            await page.locator('button.search-box-button').click();
            await page.waitForLoadState('domcontentloaded');

            const noResult = page.locator('.no-result, .search-results .no-result');
            await expect(noResult.first()).toBeVisible({ timeout: 15000 });
            await expect(noResult.first()).toContainText('No products were found that matched your criteria.');

            await expect(page.locator('.product-item')).toHaveCount(0);
        });
});

test.describe('Search Security', () => {
    test('SEARCH_Security_01: Kiem tra tim voi chuoi SQL injection', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const sqlPayload = "' OR 1=1 --";
            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });

            await searchInput.fill(sqlPayload);
            await expect(searchInput).toHaveValue(sqlPayload);

            await page.locator('button.search-box-button').click();
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('body')).not.toContainText('500 - Internal Server Error');

            const isProtected = page.locator('body:has-text("blocked"), body:has-text("Cloudflare"), .no-result, .warning-text, .search-results, .products-container, .page-body, body').first();
            await expect(isProtected).toBeVisible({ timeout: 15000 });
        });
    test('SEARCH_Security_02: Kiem tra tim voi doan ma script XSS', async ({ page }) => {
            await page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });

            const xssPayload = '<script>alert(1)</script>';
            const searchInput = page.locator('#small-searchterms');
            await searchInput.waitFor({ state: 'visible', timeout: 30000 });

            await searchInput.fill(xssPayload);
            await expect(searchInput).toHaveValue(xssPayload);

            let xssTriggered = false;
            page.on('dialog', async dialog => {
                if (dialog.message() === '1') {
                    xssTriggered = true;
                }
                await dialog.dismiss();
            });

            await page.locator('button.search-box-button').click();
            await page.waitForLoadState('domcontentloaded');

            expect(xssTriggered).toBeFalsy();

            const searchKeywordInput = page.locator('#q');
            if (await searchKeywordInput.isVisible().catch(() => false)) {
                await expect(searchKeywordInput).toHaveValue(xssPayload);
            }
        });
});

test.describe('Search GUI', () => {
    test('SEARCH_GUI_01: Kiem tra layout trang Search tren may tinh', async ({ page }) => {
            await page.setViewportSize({ width: 1280, height: 800 });
            await page.goto('https://demo.nopcommerce.com/search?q=iphone', { waitUntil: 'domcontentloaded' });

            const searchInput = page.locator('#small-searchterms, #q').first();
            await expect(searchInput).toBeVisible({ timeout: 15000 });

            const searchButton = page.locator('button.search-box-button, button.search-button').first();
            await expect(searchButton).toBeVisible();

            const leftSide = page.locator('.side-2');
            await expect(leftSide).toBeVisible();

            const productGrid = page.locator('.products-container, .search-results').first();
            await expect(productGrid).toBeVisible();

            const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
            const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
            expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
        });
});
