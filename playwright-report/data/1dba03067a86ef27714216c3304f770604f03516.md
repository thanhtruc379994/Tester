# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 23130075_NguyenHuuDuy/script/create-products.spec.js >> Admin - Create Product >> Create_product_category_multiple_20 - Chọn nhiều Category rồi lưu
- Location: 23130075_NguyenHuuDuy/script/create-products.spec.js:295:9

# Error details

```
TypeError: items.map is not a function
```

# Page snapshot

```yaml
- generic [ref=f4e2]:
  - navigation [ref=f4e3]:
    - list [ref=f4e4]:
      - listitem [ref=f4e5]:
        - link [ref=f4e6] [cursor=pointer]:
          - /url: "#"
    - link [ref=f4e8] [cursor=pointer]:
      - /url: /Admin
    - list [ref=f4e10]:
      - listitem [ref=f4e11]:
        - generic [ref=f4e12]:
          - combobox [aria-hidden] [ref=f4e13]
          - combobox [ref=f4e16] [cursor=pointer]:
            - textbox "English" [ref=f4e17]
      - listitem [ref=f4e18]:
        - link "John Smith":
          - /url: "#"
      - listitem [ref=f4e19]:
        - link "Logout" [ref=f4e20] [cursor=pointer]:
          - /url: /logout
      - listitem
      - listitem [ref=f4e21]:
        - link "Public store" [ref=f4e22] [cursor=pointer]:
          - /url: /
      - listitem [ref=f4e23]:
        - link [ref=f4e24] [cursor=pointer]:
          - /url: "#"
  - complementary [ref=f4e26]:
    - link [ref=f4e27] [cursor=pointer]:
      - /url: /Admin
      - img "logo.png" [ref=f4e28]
    - generic [ref=f4e29]:
      - textbox "Search" [ref=f4e33]
      - navigation [ref=f4e34]:
        - menu [ref=f4e35]:
          - listitem [ref=f4e36]:
            - link [ref=f4e37] [cursor=pointer]:
              - /url: /Admin
              - paragraph [ref=f4e39]: Dashboard
          - listitem [ref=f4e40]:
            - link [ref=f4e41] [cursor=pointer]:
              - /url: "#"
              - paragraph [ref=f4e43]: Catalog
            - list [ref=f4e45]:
              - listitem [ref=f4e46]:
                - link [ref=f4e47] [cursor=pointer]:
                  - /url: /Admin/Product/List
                  - paragraph [ref=f4e49]: Products
              - listitem [ref=f4e50]:
                - link [ref=f4e51] [cursor=pointer]:
                  - /url: /Admin/Category/List
                  - paragraph [ref=f4e53]: Categories
              - listitem [ref=f4e54]:
                - link [ref=f4e55] [cursor=pointer]:
                  - /url: /Admin/Manufacturer/List
                  - paragraph [ref=f4e57]: Manufacturers
              - listitem [ref=f4e58]:
                - link [ref=f4e59] [cursor=pointer]:
                  - /url: /Admin/ProductReview/List
                  - paragraph [ref=f4e61]: Product reviews
              - listitem [ref=f4e62]:
                - link [ref=f4e63] [cursor=pointer]:
                  - /url: /Admin/Product/ProductTags
                  - paragraph [ref=f4e65]: Product tags
              - listitem [ref=f4e66]:
                - link [ref=f4e67] [cursor=pointer]:
                  - /url: "#"
                  - paragraph [ref=f4e69]: Attributes
              - listitem [ref=f4e71]:
                - link [ref=f4e72] [cursor=pointer]:
                  - /url: /Admin/PriceList/List
                  - paragraph [ref=f4e74]: Price lists
          - listitem [ref=f4e75]:
            - link [ref=f4e76] [cursor=pointer]:
              - /url: "#"
              - paragraph [ref=f4e78]: Sales
          - listitem [ref=f4e80]:
            - link [ref=f4e81] [cursor=pointer]:
              - /url: "#"
              - paragraph [ref=f4e83]: Customers
          - listitem [ref=f4e85]:
            - link [ref=f4e86] [cursor=pointer]:
              - /url: "#"
              - paragraph [ref=f4e88]: Promotions
          - listitem [ref=f4e90]:
            - link [ref=f4e91] [cursor=pointer]:
              - /url: "#"
              - paragraph [ref=f4e93]: Content management
          - listitem [ref=f4e95]:
            - link [ref=f4e96] [cursor=pointer]:
              - /url: "#"
              - paragraph [ref=f4e98]: Configuration
          - listitem [ref=f4e100]:
            - link [ref=f4e101] [cursor=pointer]:
              - /url: "#"
              - paragraph [ref=f4e103]: System
          - listitem [ref=f4e105]:
            - link [ref=f4e106] [cursor=pointer]:
              - /url: "#"
              - paragraph [ref=f4e108]: Reports
          - listitem [ref=f4e110]:
            - link [ref=f4e111] [cursor=pointer]:
              - /url: "#"
              - paragraph [ref=f4e113]: Help
  - generic [ref=f4e115]:
    - generic [ref=f4e117]:
      - button [aria-hidden] [ref=f4e118] [cursor=pointer]: ×
      - text: The new product has been added successfully.
    - generic [ref=f4e119]:
      - generic [ref=f4e120]:
        - heading [level=1] [ref=f4e121]:
          - text: Edit product details - CatMulti_1793341885117_819
          - link "back to product list" [ref=f4e124] [cursor=pointer]:
            - /url: /Admin/Product/List
        - generic [ref=f4e125]:
          - button "Preview" [ref=f4e126] [cursor=pointer]
          - button "Save" [ref=f4e128] [cursor=pointer]
          - button "Save and Continue Edit" [ref=f4e130] [cursor=pointer]
          - button "Copy product" [ref=f4e132] [cursor=pointer]
          - generic [ref=f4e134] [cursor=pointer]: Delete
      - generic:
        - list
      - generic [ref=f4e138]:
        - generic [ref=f4e140]:
          - generic [ref=f4e141]: Advanced Basic
          - button "Settings" [ref=f4e147] [cursor=pointer]
        - generic [ref=f4e149]:
          - generic [ref=f4e151]:
            - generic [ref=f4e152] [cursor=pointer]:
              - generic [ref=f4e153]: Product info
              - button [ref=f4e156]
            - generic [ref=f4e158]:
              - generic [ref=f4e159]:
                - generic [ref=f4e161]:
                  - tablist [ref=f4e163]:
                    - listitem [ref=f4e164]:
                      - tab "Standard" [ref=f4e165] [cursor=pointer]
                    - listitem [ref=f4e166]:
                      - tab "English" [ref=f4e167] [cursor=pointer]
                    - listitem [ref=f4e168]:
                      - tab "Tiếng Việt" [ref=f4e169] [cursor=pointer]
                  - tabpanel [ref=f4e172]:
                    - generic [ref=f4e173]:
                      - generic [ref=f4e174]:
                        - generic [ref=f4e175]: Product name
                        - generic [ref=f4e181]:
                          - textbox "Product name" [ref=f4e182]: CatMulti_1793341885117_819
                          - generic [ref=f4e183]: "*"
                      - generic [ref=f4e184]:
                        - generic [ref=f4e185]: Short description
                        - textbox "Short description" [ref=f4e191]
                      - generic [ref=f4e192]:
                        - generic [ref=f4e193]: Full description
                        - generic [ref=f4e199]:
                          - toolbar [ref=f4e200]:
                            - generic [ref=f4e201]:
                              - button "Undo (CTRL+Z)" [ref=f4e202] [cursor=pointer]:
                                - generic [ref=f4e203]: 
                              - button "Redo (CTRL+Y)" [ref=f4e204] [cursor=pointer]:
                                - generic [ref=f4e205]: 
                            - button "Style" [ref=f4e208] [cursor=pointer]:
                              - generic [ref=f4e209]: 
                            - generic [ref=f4e210]:
                              - button "Bold (CTRL+B)" [ref=f4e211] [cursor=pointer]:
                                - generic [ref=f4e212]: 
                              - button "Italic (CTRL+I)" [ref=f4e213] [cursor=pointer]:
                                - generic [ref=f4e214]: 
                              - button "Underline (CTRL+U)" [ref=f4e215] [cursor=pointer]:
                                - generic [ref=f4e216]: 
                              - button "Remove Font Style (CTRL+\\)" [ref=f4e217] [cursor=pointer]:
                                - generic [ref=f4e218]: 
                            - generic [ref=f4e220]:
                              - button "Font Family" [ref=f4e221] [cursor=pointer]: Source Sans Pro
                              - text: 
                            - generic [ref=f4e223]:
                              - button "Font Size" [ref=f4e224] [cursor=pointer]: "16"
                              - text: 
                            - generic [ref=f4e226]:
                              - button "Recent Color" [ref=f4e227] [cursor=pointer]:
                                - generic [ref=f4e228]: 
                              - button "More Color" [ref=f4e229] [cursor=pointer]
                            - generic [ref=f4e230]:
                              - button "Unordered list (CTRL+SHIFT+NUM7)" [ref=f4e231] [cursor=pointer]:
                                - generic [ref=f4e232]: 
                              - button "Ordered list (CTRL+SHIFT+NUM8)" [ref=f4e233] [cursor=pointer]:
                                - generic [ref=f4e234]: 
                              - generic [ref=f4e235]:
                                - button "Paragraph" [ref=f4e236] [cursor=pointer]:
                                  - generic [ref=f4e237]: 
                                - text:      
                            - button "Table" [ref=f4e240] [cursor=pointer]:
                              - generic [ref=f4e241]: 
                            - generic [ref=f4e242]:
                              - button "Link (CTRL+K)" [ref=f4e243] [cursor=pointer]:
                                - generic [ref=f4e244]: 
                              - button "Insert image" [ref=f4e245] [cursor=pointer]
                              - button "Video" [ref=f4e247] [cursor=pointer]:
                                - generic [ref=f4e248]: 
                              - button "Insert Horizontal Rule (CTRL+ENTER)" [ref=f4e249] [cursor=pointer]:
                                - generic [ref=f4e250]: 
                            - generic [ref=f4e251]:
                              - button "Full Screen" [ref=f4e252] [cursor=pointer]:
                                - generic [ref=f4e253]: 
                              - button "Code View" [ref=f4e254] [cursor=pointer]:
                                - generic [ref=f4e255]: 
                              - button "Help" [ref=f4e256] [cursor=pointer]:
                                - generic [ref=f4e257]: 
                          - textbox [ref=f4e259]:
                            - paragraph [ref=f4e260]
                          - status
                          - status [ref=f4e261]:
                            - generic "Resize" [ref=f4e262]
                          - text:     
                - generic [ref=f4e266]:
                  - generic [ref=f4e267]: SKU
                  - textbox "SKU" [ref=f4e273]
              - generic [ref=f4e274]:
                - generic [ref=f4e275]: Categories
                - generic [ref=f4e283]:
                  - listbox [aria-hidden] [ref=f4e284]:
                    - option [selected] [ref=f4e285]: Computers
                    - option [ref=f4e286]: Computers >> Desktops
                    - option [ref=f4e287]: Computers >> Notebooks
                    - option [ref=f4e288]: Computers >> Software
                    - option [ref=f4e289]: Electronics
                    - option [ref=f4e290]: Electronics >> Camera & photo
                    - option [ref=f4e291]: Electronics >> Cell phones
                    - option [ref=f4e292]: Electronics >> Others
                    - option [ref=f4e293]: Apparel
                    - option [ref=f4e294]: Apparel >> Shoes
                    - option [ref=f4e295]: Apparel >> Clothing
                    - option [ref=f4e296]: Apparel >> Accessories
                    - option [ref=f4e297]: Digital downloads
                    - option [selected] [ref=f4e298]: Books
                    - option [ref=f4e299]: Jewelry
                    - option [ref=f4e300]: Gift Cards
                  - combobox [ref=f4e303]:
                    - list [ref=f4e304]:
                      - listitem "Computers" [ref=f4e305]: × Computers
                      - listitem "Books" [ref=f4e306]: × Books
                      - listitem [ref=f4e307]:
                        - searchbox [ref=f4e308]
          - generic [ref=f4e310]:
            - generic [ref=f4e311] [cursor=pointer]:
              - generic [ref=f4e312]: Prices
              - button [ref=f4e315]
            - generic [ref=f4e317]:
              - generic [ref=f4e318]:
                - generic [ref=f4e319]: Price
                - generic [ref=f4e325]:
                  - spinbutton "Price" [ref=f4e326]: "0.0000"
                  - text: USD
              - text: USD USD
              - generic [ref=f4e327]:
                - generic [ref=f4e328]: Price lists
                - generic [ref=f4e336]:
                  - listbox [disabled] [aria-hidden] [ref=f4e337]
                  - combobox [disabled] [ref=f4e340]:
                    - list [ref=f4e341]:
                      - listitem [ref=f4e342]:
                        - searchbox "admin.catalog.products.fields.pricelists.nopricelist" [disabled] [ref=f4e343]
              - text: USD USD
              - generic [ref=f4e344]:
                - generic [ref=f4e345]:
                  - generic [ref=f4e346]: Tax exempt
                  - checkbox "Tax exempt" [ref=f4e352]
                - generic [ref=f4e353]:
                  - generic [ref=f4e354]: Tax category
                  - generic [ref=f4e360]:
                    - combobox [aria-hidden] [ref=f4e361]
                    - combobox [ref=f4e364] [cursor=pointer]:
                      - textbox "[None]" [ref=f4e365]
          - generic [ref=f4e367]:
            - generic [ref=f4e368] [cursor=pointer]:
              - generic [ref=f4e369]: Shipping
              - button [ref=f4e372]
            - generic [ref=f4e375]:
              - generic [ref=f4e376]:
                - generic [ref=f4e377]: Shipping enabled
                - checkbox "Shipping enabled" [checked] [ref=f4e383]
              - generic [ref=f4e384]:
                - generic [ref=f4e385]:
                  - generic [ref=f4e386]: Weight
                  - generic [ref=f4e392]:
                    - spinbutton "Weight" [ref=f4e393]: "0.0000"
                    - text: kg(s)
                - generic [ref=f4e394]:
                  - generic [ref=f4e395]: Length
                  - generic [ref=f4e401]:
                    - spinbutton "Length" [ref=f4e402]: "0.0000"
                    - text: meter(s)
                - generic [ref=f4e403]:
                  - generic [ref=f4e404]: Width
                  - generic [ref=f4e410]:
                    - spinbutton "Width" [ref=f4e411]: "0.0000"
                    - text: meter(s)
                - generic [ref=f4e412]:
                  - generic [ref=f4e413]: Height
                  - generic [ref=f4e419]:
                    - spinbutton "Height" [ref=f4e420]: "0.0000"
                    - text: meter(s)
                - text: USD
          - generic [ref=f4e422]:
            - generic [ref=f4e423] [cursor=pointer]:
              - generic [ref=f4e424]: Inventory
              - button [ref=f4e427]
            - generic [ref=f4e431]:
              - generic [ref=f4e432]: Inventory method
              - generic [ref=f4e438]:
                - combobox [aria-hidden] [ref=f4e439]
                - combobox [ref=f4e442] [cursor=pointer]:
                  - textbox "Don't track inventory" [ref=f4e443]
          - generic [ref=f4e445]:
            - generic [ref=f4e446] [cursor=pointer]:
              - generic [ref=f4e447]: Multimedia
              - button [ref=f4e450]
            - generic [ref=f4e453]:
              - tablist [ref=f4e455]:
                - listitem [ref=f4e456]:
                  - tab "Pictures" [ref=f4e457] [cursor=pointer]
                - listitem [ref=f4e458]:
                  - tab "Videos" [ref=f4e459] [cursor=pointer]
                - listitem [ref=f4e460]:
                  - tab "3D model" [ref=f4e461] [cursor=pointer]
              - tabpanel [ref=f4e464]:
                - generic [ref=f4e465]:
                  - generic [ref=f4e466]:
                    - generic [ref=f4e469]:
                      - table [ref=f4e472]:
                        - rowgroup [ref=f4e473]:
                          - row [ref=f4e474]:
                            - columnheader "Picture" [ref=f4e475]
                            - columnheader "Display order" [ref=f4e476]
                            - columnheader "Alt" [ref=f4e477]
                            - columnheader "Title" [ref=f4e478]
                            - columnheader "Edit" [ref=f4e479]
                            - columnheader "Delete" [ref=f4e480]
                      - table [ref=f4e489]:
                        - rowgroup:
                          - row "Picture Display order Alt Title Edit Delete":
                            - columnheader "Picture"
                            - columnheader "Display order"
                            - columnheader "Alt"
                            - columnheader "Title"
                            - columnheader "Edit"
                            - columnheader "Delete"
                        - rowgroup [ref=f4e497]:
                          - row [ref=f4e498]:
                            - cell "No data available in table" [ref=f4e499]
                      - generic:
                        - generic:
                          - table
                    - generic [ref=f4e501]:
                      - navigation "pagination" [ref=f4e503]:
                        - list [ref=f4e504]:
                          - listitem [ref=f4e505]:
                            - generic "Previous"
                          - listitem [ref=f4e506]:
                            - generic "Next"
                      - generic [ref=f4e508]:
                        - text: Show
                        - combobox "Show items" [ref=f4e509]:
                          - option "7"
                          - option "15" [selected]
                          - option "20"
                          - option "50"
                          - option "100"
                        - text: items
                      - status [ref=f4e510]: No records
                      - button [ref=f4e512] [cursor=pointer]
                  - generic [ref=f4e515]:
                    - generic [ref=f4e516]: Add a new picture
                    - generic [ref=f4e518]:
                      - generic [ref=f4e519]: Picture
                      - generic [ref=f4e525]:
                        - button "Drop files here to upload / Browse" [ref=f4e526]
                        - generic [ref=f4e527]: Drop files here to upload / Browse
                        - generic:
                          - list
                        - alert [ref=f4e529]
          - generic [ref=f4e531]:
            - generic [ref=f4e532] [cursor=pointer]:
              - generic [ref=f4e533]: Product attributes
              - button [ref=f4e536]
            - generic [ref=f4e538]:
              - paragraph [ref=f4e539]: Product attributes are quantifiable or descriptive aspects of a product (such as, color). For example, if you were to create an attribute for color, with the values of blue, green, yellow, and so on, you may want to apply this attribute to shirts, which you sell in various colors (you can adjust a price or weight for any of existing attribute values). You can add attribute for your product using existing list of attributes, or if you need to create a new one go to Catalog > Attributes > Product attributes. Please notice that if you want to manage inventory by product attributes (e.g. 5 green shirts and 3 blue ones), then ensure that "Inventory method" is set to "Track inventory by product attributes".
              - generic [ref=f4e541]:
                - generic [ref=f4e543]:
                  - generic [ref=f4e546]:
                    - table [ref=f4e549]:
                      - rowgroup [ref=f4e550]:
                        - row [ref=f4e551]:
                          - columnheader "Attribute" [ref=f4e552]
                          - columnheader "Text prompt" [ref=f4e553]
                          - columnheader "Is Required" [ref=f4e554]
                          - columnheader "Control type" [ref=f4e555]
                          - columnheader "Display order" [ref=f4e556]
                          - columnheader "Validation rules" [ref=f4e557]
                          - columnheader "Condition" [ref=f4e558]
                          - columnheader "Edit" [ref=f4e559]
                    - table [ref=f4e570]:
                      - rowgroup:
                        - row "Attribute Text prompt Is Required Control type Display order Validation rules Condition Edit":
                          - columnheader "Attribute"
                          - columnheader "Text prompt"
                          - columnheader "Is Required"
                          - columnheader "Control type"
                          - columnheader "Display order"
                          - columnheader "Validation rules"
                          - columnheader "Condition"
                          - columnheader "Edit"
                      - rowgroup [ref=f4e580]:
                        - row [ref=f4e581]:
                          - cell "No data available in table" [ref=f4e582]
                    - generic:
                      - generic:
                        - table
                  - generic [ref=f4e584]:
                    - navigation "pagination" [ref=f4e586]:
                      - list [ref=f4e587]:
                        - listitem [ref=f4e588]:
                          - generic "Previous"
                        - listitem [ref=f4e589]:
                          - generic "Next"
                    - generic [ref=f4e591]:
                      - text: Show
                      - combobox "Show items" [ref=f4e592]:
                        - option "7"
                        - option "15" [selected]
                        - option "20"
                        - option "50"
                        - option "100"
                      - text: items
                    - status [ref=f4e593]: No records
                    - button [ref=f4e595] [cursor=pointer]
                - link "Add a new attribute" [ref=f4e599] [cursor=pointer]:
                  - /url: /Admin/Product/ProductAttributeMappingCreate?productId=1060
          - generic [ref=f4e602]:
            - generic [ref=f4e603] [cursor=pointer]:
              - generic [ref=f4e604]: Specification attributes
              - button [ref=f4e607]
            - generic [ref=f4e609]:
              - paragraph [ref=f4e610]: Specification attributes are product features i.e, screen size, number of USB-ports, visible on product details page. Specification attributes can be used for filtering products on the category details page. Unlike product attributes, specification attributes are used for information purposes only. You can add attribute for your product using existing list of attributes, or if you need to create a new one go to Catalog > Attributes > Specification attributes.
              - generic [ref=f4e611]:
                - generic [ref=f4e613]:
                  - generic [ref=f4e616]:
                    - table [ref=f4e619]:
                      - rowgroup [ref=f4e620]:
                        - row [ref=f4e621]:
                          - columnheader "Attribute type" [ref=f4e622]
                          - columnheader "Attribute" [ref=f4e623]
                          - columnheader "Value" [ref=f4e624]
                          - columnheader "Allow filtering" [ref=f4e625]
                          - columnheader "Show on product page" [ref=f4e626]
                          - columnheader "Display order" [ref=f4e627]
                          - columnheader "Edit" [ref=f4e628]
                    - table [ref=f4e638]:
                      - rowgroup:
                        - row "Attribute type Attribute Value Allow filtering Show on product page Display order Edit":
                          - columnheader "Attribute type"
                          - columnheader "Attribute"
                          - columnheader "Value"
                          - columnheader "Allow filtering"
                          - columnheader "Show on product page"
                          - columnheader "Display order"
                          - columnheader "Edit"
                      - rowgroup [ref=f4e647]:
                        - row [ref=f4e648]:
                          - cell "No data available in table" [ref=f4e649]
                    - generic:
                      - generic:
                        - table
                  - generic [ref=f4e651]:
                    - navigation "pagination" [ref=f4e653]:
                      - list [ref=f4e654]:
                        - listitem [ref=f4e655]:
                          - generic "Previous"
                        - listitem [ref=f4e656]:
                          - generic "Next"
                    - generic [ref=f4e658]:
                      - text: Show
                      - combobox "Show items" [ref=f4e659]:
                        - option "7"
                        - option "15" [selected]
                        - option "20"
                        - option "50"
                        - option "100"
                      - text: items
                    - status [ref=f4e660]: No records
                    - button [ref=f4e662] [cursor=pointer]
                - link "Add attribute" [ref=f4e666] [cursor=pointer]:
                  - /url: /Admin/Product/ProductSpecAttributeAddOrEdit?productId=1060
  - generic [ref=f4e671]:
    - generic [ref=f4e672]:
      - text: Powered by
      - link "nopCommerce" [ref=f4e673] [cursor=pointer]:
        - /url: https://www.nopcommerce.com/?utm_source=admin-panel&utm_medium=footer&utm_campaign=admin-panel
    - generic [ref=f4e674]: Friday, October 30, 2026 6:31 AM
    - generic [ref=f4e675]: nopCommerce version 5.00.0
```

# Test source

```ts
  199 |     test('Create_product_trim_name_09 - Product name có khoảng trắng đầu/cuối được tự động trim', async ({page}) => {
  200 |         const name = uniq('TrimTest');
  201 |         await createAndEdit(page, `  ${name}  `);
  202 |         await expect(page.locator('#Name')).toHaveValue(name);
  203 |     });
  204 | 
  205 |     test('Create_product_special_chars_name_10 - Product name chứa ký tự đặc biệt', async ({page}) => {
  206 |         const name = uniq('Spec') + ' @#$%&\'"';
  207 |         await createAndEdit(page, name);
  208 |         await expect(page.locator('#Name')).toHaveValue(name);
  209 |     });
  210 | 
  211 |     test('Create_product_html_name_11 - Product name chứa mã HTML/script không bị thực thi', async ({page}) => {
  212 |         let dialogShown = false;
  213 |         page.on('dialog', async d => { dialogShown = true; await d.dismiss(); });
  214 |         const name = uniq('Html') + '<script>alert(1)</script>';
  215 |         await openCreate(page);
  216 |         await page.locator('#Name').fill(name);
  217 |         await save(page);
  218 |         await expect(page).toHaveURL(/\/Admin\/Product\/List/i, {timeout: 30000});
  219 |         await page.waitForLoadState('networkidle');
  220 |         expect(dialogShown).toBeFalsy();
  221 |     });
  222 | 
  223 |     test('Create_product_unicode_name_12 - Product name chứa tiếng Việt có dấu / Unicode', async ({page}) => {
  224 |         const name = uniq('Điện thoại thông minh');
  225 |         await createAndEdit(page, name);
  226 |         await expect(page.locator('#Name')).toHaveValue(name);
  227 |     });
  228 | 
  229 |     test('Create_product_max_length_name_13 - Product name có độ dài tối đa cho phép (400 ký tự)', async ({page}) => {
  230 |         const name = 'N' + Date.now() + 'a'.repeat(400 - String(Date.now()).length - 1);
  231 |         await openCreate(page);
  232 |         await page.locator('#Name').fill(name);
  233 |         await save(page);
  234 |         await expect(page).toHaveURL(/\/Admin\/Product\/List/i, {timeout: 30000});
  235 |         await expectSaved(page);
  236 |     });
  237 | 
  238 |     test('Create_product_over_length_name_14 - Product name vượt quá độ dài tối đa (401 ký tự)', async ({page}) => {
  239 |         await openCreate(page);
  240 |         await page.locator('#Name').fill('b'.repeat(401));
  241 |         await save(page);
  242 |         // Hệ thống phải xử lý có kiểm soát: báo lỗi hoặc lưu theo quy định, không lỗi 500
  243 |         await expect(page.locator('.alert-success, .field-validation-error, .validation-summary-errors, .alert-danger, .input-validation-error').first()).toBeVisible({timeout: 30000});
  244 |         await expect(page.locator('body')).not.toContainText(/Server Error|Internal Server Error|Exception/i);
  245 |     });
  246 | 
  247 |     // ---------- Descriptions / SKU ----------
  248 | 
  249 |     test('Create_product_short_description_15 - Nhập Short description hợp lệ và lưu', async ({page}) => {
  250 |         const name = uniq('ShortDesc');
  251 |         await createAndEdit(page, name, async () => {
  252 |             await page.locator('#ShortDescription').fill('Mô tả ngắn của sản phẩm');
  253 |         });
  254 |         await expect(page.locator('#ShortDescription')).toHaveValue('Mô tả ngắn của sản phẩm');
  255 |     });
  256 | 
  257 |     test('Create_product_sku_valid_16 - Nhập SKU hợp lệ', async ({page}) => {
  258 |         const sku = uniq('SKU');
  259 |         await createAndEdit(page, uniq('SkuValid'), async () => {
  260 |             await page.locator('#Sku').fill(sku);
  261 |         });
  262 |         await expect(page.locator('#Sku')).toHaveValue(sku);
  263 |     });
  264 | 
  265 |     test('Create_product_sku_empty_17 - Lưu sản phẩm để trống SKU', async ({page}) => {
  266 |         await openCreate(page);
  267 |         await page.locator('#Name').fill(uniq('SkuEmpty'));
  268 |         await save(page);
  269 |         await expectSaved(page);
  270 |     });
  271 | 
  272 |     test('Create_product_sku_duplicate_18 - SKU trùng với sản phẩm đã tồn tại', async ({page}) => {
  273 |         const sku = uniq('DUP');
  274 |         await createAndEdit(page, uniq('SkuDupA'), async () => {
  275 |             await page.locator('#Sku').fill(sku);
  276 |         });
  277 |         await openCreate(page);
  278 |         await page.locator('#Name').fill(uniq('SkuDupB'));
  279 |         await page.locator('#Sku').fill(sku);
  280 |         await save(page);
  281 |         // Xác nhận theo hành vi thực tế: cho phép lưu hoặc báo lỗi trùng, không lỗi hệ thống
  282 |         await expect(page.locator('.alert-success, .field-validation-error, .validation-summary-errors, .alert-danger').first()).toBeVisible({timeout: 30000});
  283 |         await expect(page.locator('body')).not.toContainText(/Server Error|Internal Server Error/i);
  284 |     });
  285 | 
  286 |     // ---------- Categories ----------
  287 | 
  288 |     test('Create_product_category_single_19 - Chọn 1 Category rồi lưu', async ({page}) => {
  289 |         await createAndEdit(page, uniq('Cat1'), async () => {
  290 |             await page.locator('#SelectedCategoryIds').selectOption(['1']);   // Computers
  291 |         });
  292 |         await expect(page.locator('#SelectedCategoryIds')).toHaveValues(['1']);
  293 |     });
  294 | 
  295 |     test('Create_product_category_multiple_20 - Chọn nhiều Category rồi lưu', async ({page}) => {
  296 |         await createAndEdit(page, uniq('CatMulti'), async () => {
  297 |             await page.locator('#SelectedCategoryIds').selectOption(['1', '14']);   // Computers, Books
  298 |         });
> 299 |         await expect(page.locator('#SelectedCategoryIds')).toHaveValues(expect.arrayContaining(['1', '14']));
      |                                                            ^ TypeError: items.map is not a function
  300 |     });
  301 | 
  302 |     // ---------- Prices ----------
  303 | 
  304 |     test('Create_product_price_valid_21 - Nhập Price hợp lệ (số dương, có phần thập phân)', async ({page}) => {
  305 |         await createAndEdit(page, uniq('PriceOk'), async () => {
  306 |             await fillNum(page, 'Price', '99.99');
  307 |         });
  308 |         expect(await numValue(page, 'Price')).toBeCloseTo(99.99, 2);
  309 |     });
  310 | 
  311 |     test('Create_product_price_negative_22 - Nhập Price âm', async ({page}) => {
  312 |         await openCreate(page);
  313 |         await page.locator('#Name').fill(uniq('PriceNeg'));
  314 |         await fillNum(page, 'Price', '-10');
  315 |         await save(page);
  316 |         await expectRejected(page);
  317 |     });
  318 | 
  319 |     test('Create_product_price_text_23 - Nhập Price là chữ / ký tự đặc biệt', async ({page}) => {
  320 |         await openCreate(page);
  321 |         await numField(page, 'Price').click();
  322 |         await numField(page, 'Price').pressSequentially('abc');
  323 |         await numField(page, 'Price').press('Tab');
  324 |         // Ô số không chấp nhận chữ: giá trị không thể là 'abc'
  325 |         expect(await numField(page, 'Price').inputValue()).not.toMatch(/abc/i);
  326 |     });
  327 | 
  328 |     test('Create_product_tax_exempt_24 - Tick Tax exempt rồi lưu', async ({page}) => {
  329 |         await createAndEdit(page, uniq('TaxExempt'), async () => {
  330 |             await page.locator('#IsTaxExempt').check();
  331 |         });
  332 |         await expect(page.locator('#IsTaxExempt')).toBeChecked();
  333 |     });
  334 | 
  335 |     test('Create_product_tax_category_25 - Chọn Tax category khác [None]', async ({page}) => {
  336 |         let chosen = '0';
  337 |         await createAndEdit(page, uniq('TaxCat'), async () => {
  338 |             await page.locator('#TaxCategoryId').selectOption({index: 1});
  339 |             chosen = await page.locator('#TaxCategoryId').inputValue();
  340 |         });
  341 |         expect(chosen).not.toBe('0');
  342 |         await expect(page.locator('#TaxCategoryId')).toHaveValue(chosen);
  343 |     });
  344 | 
  345 |     // ---------- Shipping / Inventory ----------
  346 | 
  347 |     test('Create_product_shipping_disabled_26 - Bỏ tick Shipping enabled thì các trường kích thước/trọng lượng được ẩn', async ({page}) => {
  348 |         await openCreate(page);
  349 |         await page.locator('#IsShipEnabled').uncheck();
  350 |         await expect(page.locator('.form-group:has(#Weight)')).toBeHidden();
  351 |         await page.locator('#IsShipEnabled').check();
  352 |         await expect(page.locator('.form-group:has(#Weight)')).toBeVisible();
  353 |     });
  354 | 
  355 |     test('Create_product_dimensions_valid_27 - Nhập Weight, Length, Width, Height hợp lệ', async ({page}) => {
  356 |         await createAndEdit(page, uniq('Dims'), async () => {
  357 |             await fillNum(page, 'Weight', '2.5');
  358 |             await fillNum(page, 'Length', '10');
  359 |             await fillNum(page, 'Width', '20');
  360 |             await fillNum(page, 'Height', '30');
  361 |         });
  362 |         expect(await numValue(page, 'Weight')).toBeCloseTo(2.5, 2);
  363 |         expect(await numValue(page, 'Length')).toBeCloseTo(10, 2);
  364 |         expect(await numValue(page, 'Width')).toBeCloseTo(20, 2);
  365 |         expect(await numValue(page, 'Height')).toBeCloseTo(30, 2);
  366 |     });
  367 | 
  368 |     test('Create_product_inventory_track_28 - Chọn Inventory method = Track inventory hiển thị trường số lượng tồn kho', async ({page}) => {
  369 |         await openCreate(page);
  370 |         await page.locator('#ManageInventoryMethodId').selectOption({label: 'Track inventory'});
  371 |         await expect(page.locator('.form-group:has(#StockQuantity)')).toBeVisible();
  372 |     });
  373 | 
  374 |     // ---------- Lưu sản phẩm ----------
  375 | 
  376 |     test('Create_product_save_continue_29 - Click Save and Continue Edit với dữ liệu hợp lệ', async ({page}) => {
  377 |         const name = uniq('SaveContinue');
  378 |         await createAndEdit(page, name);
  379 |         await expectSaved(page);
  380 |         await expect(page.locator('#Name')).toHaveValue(name);
  381 |         // Sau khi lưu, panel Multimedia và Product attributes không còn thông báo "cần lưu trước"
  382 |         await expect(page.getByText(/You need to save the product before you can upload pictures or videos/i)).toHaveCount(0);
  383 |     });
  384 | 
  385 |     test('Create_product_full_data_30 - Lưu sản phẩm khi nhập đầy đủ các trường và dữ liệu khớp sau khi lưu', async ({page}) => {
  386 |         const name = uniq('FullData');
  387 |         const sku = uniq('FULL');
  388 |         await createAndEdit(page, name, async () => {
  389 |             await page.locator('#ShortDescription').fill('Mô tả ngắn đầy đủ');
  390 |             await page.locator('#Sku').fill(sku);
  391 |             await page.locator('#SelectedCategoryIds').selectOption(['1']);
  392 |             await fillNum(page, 'Price', '150.5');
  393 |             await page.locator('#IsTaxExempt').check();
  394 |             await fillNum(page, 'Weight', '1.5');
  395 |         });
  396 |         await expect(page.locator('#Name')).toHaveValue(name);
  397 |         await expect(page.locator('#ShortDescription')).toHaveValue('Mô tả ngắn đầy đủ');
  398 |         await expect(page.locator('#Sku')).toHaveValue(sku);
  399 |         await expect(page.locator('#SelectedCategoryIds')).toHaveValues(['1']);
```