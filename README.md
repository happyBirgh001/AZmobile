# AZmobile — Website bán laptop, phụ kiện, sửa chữa &amp; bảo hành

Website thương mại điện tử hoàn chỉnh cho cửa hàng laptop **AZmobile**, viết bằng **HTML + CSS + JavaScript thuần** (không cần build, không cần server, không cần cài đặt gì). Toàn bộ dữ liệu được lưu trong **localStorage** của trình duyệt, nên có thể đưa lên **GitHub Pages** và chạy công khai ngay lập tức.

---

## 1. Tính năng

### Dành cho khách hàng
| Chức năng | Mô tả |
|---|---|
| Trang chủ | Hero, danh mục, sản phẩm nổi bật, dịch vụ, đánh giá khách hàng |
| Danh sách sản phẩm | Lọc theo danh mục, thương hiệu, khoảng giá, còn hàng, đang giảm giá; sắp xếp 5 kiểu; tìm kiếm |
| Chi tiết sản phẩm | Ảnh minh hoạ, thông số, giá/giảm giá, tồn kho, chọn số lượng, tab mô tả – thông số – bảo hành, sản phẩm tương tự |
| Giỏ hàng | **Bắt buộc đăng nhập mới mua được**; thêm/xoá/sửa số lượng, tính phí ship (miễn phí từ 5 triệu), đặt hàng |
| Thanh toán | Thông tin nhận hàng + 3 phương thức (COD, chuyển khoản, trả góp 0%), sinh mã đơn |
| Đăng ký / Đăng nhập | Validate đầy đủ, lưu tài khoản, phân quyền admin/khách |
| Email khuyến mãi | Tick ô đồng ý khi đăng ký → tự thêm email vào danh sách Brevo → Brevo gửi mail ưu đãi tự động. Khách tự bật/tắt trong trang tài khoản |
| Tài khoản | Sửa hồ sơ, đổi mật khẩu, xem đơn hàng, xem lịch hẹn dịch vụ |
| Sửa chữa & Bảo hành | Danh sách dịch vụ, quy trình 4 bước, form đặt lịch hẹn |
| Bài viết / Blog | Danh sách bài viết có lọc theo chuyên mục, trang chi tiết có mục lục nội dung, nút chia sẻ Facebook / Zalo / copy link, bài viết liên quan |

### Dành cho quản trị viên (`admin.html`)
| Chức năng | Mô tả |
|---|---|
| Bảng điều khiển | 4 thẻ KPI (doanh thu, đơn, khách, sản phẩm), biểu đồ doanh thu 6 tháng, tồn kho theo danh mục, đơn gần đây, top bán chạy, cảnh báo sắp hết hàng |
| Quản lý sản phẩm | **Thêm / sửa / xoá** sản phẩm, lọc theo danh mục, tìm kiếm; **cấu hình SEO riêng cho từng sản phẩm** (slug, title, description, keywords, ảnh chia sẻ, canonical, noindex) |
| Quản lý danh mục | **Thêm / xoá** danh mục, chặn xoá khi còn sản phẩm, biểu đồ phân bổ |
| Quản lý đơn hàng | Đổi trạng thái (chờ → xác nhận → đang giao → hoàn thành / huỷ), xoá đơn, tìm kiếm |
| Quản lý dịch vụ | Thêm / xoá dịch vụ sửa chữa & gói bảo hành |
| Lịch hẹn | Duyệt / cập nhật / xoá lịch hẹn khách gửi |
| **Quản lý bài viết** | **Thêm / sửa / xoá** bài viết, tự sinh slug, đặt lịch đăng (nháp / đã đăng), **cấu hình SEO riêng cho từng bài** |
| **Tối ưu SEO hệ thống** | Cấu hình tên miền canonical, mẫu tiêu đề, tiêu đề/mô tả/từ khoá mặc định, ảnh chia sẻ, robots; **xem trước kết quả trên Google**; **bảng tự kiểm tra SEO**; xem & tải `robots.txt` + `sitemap.xml` |
| **Cấu hình Facebook** | Fanpage, App ID, Pixel ID (bật/tắt), link Messenger, mã xác minh tên miền, `og:type`, `og:locale`; xem trước đúng các thẻ Open Graph sẽ in ra |
| Khách hàng | Danh sách tài khoản, xoá khách (không xoá được admin) |
| Cài đặt | Sửa hotline, email, địa chỉ, giờ mở cửa; xuất dữ liệu JSON; khôi phục dữ liệu mẫu |

### Tài khoản dùng thử
```
Quản trị:   admin@azmobile.vn  /  admin123
Khách hàng: khach@azmobile.vn  /  123456
```

### Quy tắc mua hàng
Khách **chưa đăng nhập** vẫn xem được sản phẩm, dịch vụ, bảng giá, nhưng khi bấm **Thêm vào giỏ** / **Mua ngay** / mở **Giỏ hàng** sẽ được chuyển tới trang đăng nhập (kèm `?next=` để quay lại đúng trang cũ).

Mỗi tài khoản có **giỏ hàng riêng** (lưu theo `azmobile.cart.v2.<userId>`): đăng xuất sẽ không còn thấy giỏ của tài khoản trước, đăng nhập lại thì giỏ của mình được khôi phục. Khi đăng nhập, các món đang có trong giỏ khách (nếu có) sẽ được gộp vào giỏ tài khoản.

---

## 2. Cấu trúc thư mục

```
azmobile/
├── index.html          Trang chủ
├── shop.html           Danh sách sản phẩm + bộ lọc
├── product.html        Chi tiết sản phẩm
├── services.html       Sửa chữa & bảo hành + đặt lịch
├── blog.html           Danh sách bài viết
├── post.html           Chi tiết bài viết
├── cart.html           Giỏ hàng & thanh toán
├── login.html          Đăng nhập / Đăng ký
├── account.html        Tài khoản khách hàng
├── admin.html          Trang quản trị
├── robots.txt          Chỉ dẫn cho công cụ tìm kiếm
├── sitemap.xml         Danh sách URL cho Google
├── assets/
│   ├── css/
│   │   ├── style.css   Design system (toàn bộ giao diện)
│   │   └── admin.css   Giao diện dashboard
│   ├── js/
│   │   ├── db.js       Lớp dữ liệu + CRUD + xác thực (localStorage)
│   │   ├── ui.js       Header/Footer, icon, giỏ hàng, toast, thẻ sản phẩm
│   │   ├── seo.js      SEO engine: meta, Open Graph, Twitter Card, JSON-LD, Pixel
│   │   ├── home.js     Trang chủ
│   │   ├── shop.js     Bộ lọc & danh sách
│   │   ├── product.js  Chi tiết sản phẩm
│   │   ├── services.js Dịch vụ & đặt lịch
│   │   ├── blog.js     Danh sách bài viết
│   │   ├── post.js     Chi tiết bài viết
│   │   ├── cart.js     Giỏ hàng & thanh toán
│   │   ├── login.js    Đăng nhập / đăng ký
│   │   ├── account.js  Trang tài khoản
│   │   ├── newsletter-config.js Cấu hình Brevo (action, bật/tắt)
│   │   ├── newsletter.js        Gửi đăng ký nhận email khuyến mãi
│   │   └── admin.js    Dashboard quản trị
│   └── img/
│       ├── favicon.svg
│       ├── no-image.svg         Ảnh thay thế khi đường dẫn ảnh bị lỗi
│       └── products/            Ảnh 39 sản phẩm (<id>.jpg) + CREDITS.md
├── .nojekyll           Giúp GitHub Pages phục vụ file bắt đầu bằng "_"
├── .gitignore
├── HUONG-DAN-EMAIL.md   Hướng dẫn bật email khuyến mãi (Brevo)
├── HUONG-DAN-SEO.md     Hướng dẫn cấu hình SEO & Facebook
└── README.md
```

---

## 3. Chạy thử trên máy

Cách 1 — mở trực tiếp: nhấp đúp vào `index.html`.

Cách 2 — chạy server cục bộ (khuyến nghị, giống môi trường thật):
```bash
# Python 3
python -m http.server 8000
# rồi mở http://localhost:8000
```
```bash
# Hoặc Node.js
npx serve .
```

> Lần đầu mở, hệ thống tự tạo dữ liệu mẫu: 6 danh mục, **39 sản phẩm**, 8 dịch vụ, 6 đơn hàng, 2 lịch hẹn, **3 bài viết** và 2 tài khoản.
>
> Nếu trình duyệt đã có dữ liệu cũ, hệ thống tự **bổ sung sản phẩm mới** (theo `SEED_VERSION` trong `db.js`) mà **không xoá** đơn hàng, tài khoản hay sản phẩm bạn tự thêm.

---

## 4. Đưa lên GitHub Pages (công khai)

### Bước 1 — Tạo repository
1. Đăng nhập [github.com](https://github.com) → bấm **New repository**.
2. Đặt tên, ví dụ: `azmobile`.
3. Chọn **Public** → **Create repository**.

### Bước 2 — Đưa code lên (chọn 1 trong 2 cách)

**Cách A — Dùng dòng lệnh (nhanh nhất)**
```bash
cd "đường/dẫn/tới/thư/mục/azmobile"
git init
git add .
git commit -m "AZmobile website"
git branch -M main
git remote add origin https://github.com/<TÊN_TÀI_KHOẢN>/azmobile.git
git push -u origin main
```

**Cách B — Kéo thả trên web**
1. Trong repo vừa tạo, bấm **Add file → Upload files**.
2. Kéo **toàn bộ file và thư mục** (`index.html`, `assets/`, …) vào.
3. Bấm **Commit changes**.

### Bước 3 — Bật GitHub Pages
1. Vào repo → **Settings** → mục **Pages** (menu trái).
2. **Source**: chọn `Deploy from a branch`.
3. **Branch**: chọn `main` và thư mục `/ (root)` → **Save**.
4. Chờ 1–2 phút, tải lại trang Settings → Pages, bạn sẽ thấy link:

```
https://<TÊN_TÀI_KHOẢN>.github.io/azmobile/
```

Đó là địa chỉ công khai của website. Mọi người đều truy cập được.

### Bước 4 — Cập nhật sau này
```bash
git add .
git commit -m "Cập nhật nội dung"
git push
```
GitHub Pages tự build lại sau khoảng 1 phút.

---

## 5. Lưu ý quan trọng về dữ liệu

Website là **front-end thuần**, dữ liệu lưu bằng `localStorage`:

- Dữ liệu nằm **trên trình duyệt của từng người dùng**, không dùng chung giữa các máy.
- Xoá dữ liệu trình duyệt (hoặc dùng chế độ ẩn danh) sẽ **mất dữ liệu đã tạo**.
- Mật khẩu được băm đơn giản — **chỉ phù hợp cho demo / đồ án / học tập**, không dùng cho hệ thống thật có giao dịch tiền.
- Muốn nhiều người dùng chung một cơ sở dữ liệu (đơn hàng thật, khách thật) thì cần backend. Có thể nâng cấp sau bằng Supabase / Firebase / Node.js mà **không phải viết lại giao diện**: chỉ cần thay các hàm trong `assets/js/db.js` bằng lời gọi API.

Sao lưu dữ liệu: vào **Admin → Cài đặt → Xuất dữ liệu (JSON)**.

---

## 6. Tuỳ biến nhanh

| Muốn đổi gì | Sửa ở đâu |
|---|---|
| Màu chủ đạo | `assets/css/style.css` → biến `--accent`, `--cyan` trong `:root` |
| Tên cửa hàng, hotline, địa chỉ | Admin → Cài đặt (hoặc `assets/js/db.js` → `settings`) |
| Dữ liệu mẫu (sản phẩm, danh mục…) | `assets/js/db.js` → hàm `seedData()` |
| Số sản phẩm mỗi trang chủ | `assets/js/home.js` → `.slice(0, 8)` |
| Phí ship / ngưỡng miễn phí | `assets/js/db.js` → `createOrder` (biến `ship`) |
| Logo, favicon | `assets/img/favicon.svg` và hàm `logoMark()` trong `ui.js` |
| Ảnh sản phẩm | Thay tệp trong `assets/img/products/` (giữ nguyên tên `<id>.jpg`), hoặc nhập đường dẫn ảnh ở Admin → Sản phẩm → **Ảnh sản phẩm** |
| Bật email khuyến mãi, đổi danh sách Brevo | `assets/js/newsletter-config.js` (xem mục 7) |
| Tiêu đề / mô tả / từ khoá mặc định, tên miền canonical | Admin → **Tối ưu SEO hệ thống** (xem mục 8) |
| Facebook Fanpage, App ID, Pixel | Admin → **Facebook** (xem mục 8) |
| Bài viết blog | Admin → **Bài viết** |

---

## 7. Email khuyến mãi (Brevo)

Khi khách tạo tài khoản và tick ô *"Tôi đồng ý nhận email khuyến mãi"*, email được đẩy vào
**danh sách (list)** trên Brevo; sau đó Brevo gửi thư ưu đãi qua automation.

**Bật trong 3 bước:**

1. Tạo tài khoản free tại https://www.brevo.com (300 email/ngày, không giới hạn contact).
2. **Contacts → Forms → Create a form** → chọn list → tab **Share / Embed code** → copy URL
   trong `action="https://xxxxx.sibforms.com/serve/MUIFA..."`.
3. Dán URL đó vào `assets/js/newsletter-config.js` (`action`), đặt `enabled: true`.
4. Trong Brevo: **Automations → Create → trigger "A contact is added to a list"** → thêm
   bước **Send an email** → **Activate**.
5. **Bắt buộc để thư không vào Spam:** xác thực tên miền riêng ở **Senders & Domains → Domains**
   rồi đặt sender là `khuyenmai@<tên-miền-của-bạn>`. Gửi bằng địa chỉ `@gmail.com` sẽ bị Gmail
   chặn vì không ký được DKIM cho gmail.com. Xem **mục 7b** trong HUONG-DAN-EMAIL.md.

> Shop đang dùng: tên miền `toiecdn.id.vn` (đã **Authenticated**), sender
> `AZmobile <khuyenmai@toiecdn.id.vn>`, automation *Welcome message* gắn với list *Your first list #2*.

Chi tiết đầy đủ, cách test, xử lý sự cố, lưu ý pháp lý (Nghị định 91/2020) và cách nâng cấp
lên Brevo API khi có backend: xem **[HUONG-DAN-EMAIL.md](HUONG-DAN-EMAIL.md)**.

> Mặc định `action` để trống — website chạy y như cũ, không gửi gì. URL `sibforms.com/serve/...`
> là thông tin công khai của form, **không phải API key**; tuyệt đối không đặt API key vào JS.

---

## 8. SEO & Facebook

Toàn bộ thẻ SEO của website được sinh **tự động ở phía trình duyệt** bởi `assets/js/seo.js`,
đọc cấu hình trong `localStorage`. Nhờ vậy mỗi trang đều có `title`, `description`,
`canonical`, Open Graph, Twitter Card và JSON-LD riêng mà **không phải sửa HTML thủ công**.

### 8.1 Bốn nơi cấu hình

| Nơi cấu hình | Đường dẫn | Dùng để |
|---|---|---|
| SEO từng sản phẩm | Admin → **Sản phẩm** → Sửa → mục *Cấu hình SEO cho sản phẩm* | Slug, title, description, keywords, ảnh chia sẻ, canonical, `noindex` |
| SEO từng bài viết | Admin → **Bài viết** → Sửa → mục *Cấu hình SEO cho bài viết* | Như trên, cộng thêm `datePublished` cho JSON-LD Article |
| SEO hệ thống | Admin → **Tối ưu SEO** | Tên miền, mẫu tiêu đề, tiêu đề/mô tả/từ khoá mặc định, ảnh mặc định, robots, bật/tắt sitemap cho sản phẩm & bài viết |
| Facebook | Admin → **Facebook** | Fanpage URL, App ID, Pixel ID, Messenger, mã xác minh tên miền, `og:type`, `og:locale` |

Để trống một ô nghĩa là **dùng giá trị tự động** — ví dụ bỏ trống *Tiêu đề SEO* của sản phẩm thì
tiêu đề sẽ lấy theo tên sản phẩm + thương hiệu. Chip **Tự động / Đã cấu hình** trong hộp thoại
cho biết mục đó đang ở trạng thái nào.

### 8.2 Thẻ được sinh ra

Mỗi trang nhận:

- `title`, `meta[name=description]`, `meta[name=keywords]`, `meta[name=robots]`
- `link[rel=canonical]`
- Open Graph: `og:site_name`, `og:locale`, `og:type`, `og:title`, `og:description`, `og:url`, `og:image`, `og:image:alt` (+ `fb:app_id` nếu đã đặt)
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- JSON-LD `Organization` (mọi trang) + `Product` (trang sản phẩm), `Article` (bài viết), `Blog` (danh sách bài viết)

Trang riêng tư (`cart.html`, `login.html`, `account.html`, `admin.html`) tự động nhận
`robots = noindex,nofollow`; trang tìm kiếm `shop.html?q=...` cũng `noindex` để tránh nội dung trùng lặp.

### 8.3 robots.txt & sitemap.xml

Hai tệp nằm ngay **thư mục gốc** của website:

- `robots.txt` — cho phép crawl toàn bộ, chặn `/admin.html`, `/account.html`, `/cart.html`, `/login.html`, trỏ tới sitemap.
- `sitemap.xml` — 46 URL: trang chủ, sản phẩm, dịch vụ, blog + 39 sản phẩm + 3 bài viết.

Khi thêm/sửa sản phẩm hoặc bài viết, vào **Admin → Tối ưu SEO → Tải sitemap.xml** rồi ghi đè
tệp trên GitHub. Sau khi deploy, khai báo sitemap với Google tại
[Google Search Console](https://search.google.com/search-console) → **Sitemaps** → nhập `sitemap.xml`.

### 8.4 Facebook Pixel

Nhập **Pixel ID** và tick *Bật Facebook Pixel trên toàn website* → mọi trang tự nạp
`fbevents.js` và bắn sự kiện `PageView`. Để tắt, bỏ tick (không cần xoá Pixel ID).

> Pixel chỉ hoạt động khi đã deploy lên tên miền thật, không hoạt động khi mở bằng `file://`.

Hướng dẫn chi tiết từng bước, cách kiểm tra bằng Facebook Sharing Debugger và Google Rich Results
Test: xem **[HUONG-DAN-SEO.md](HUONG-DAN-SEO.md)**.

---

## 9. Trình duyệt hỗ trợ

Chrome, Edge, Firefox, Safari phiên bản mới (2022+). Giao diện responsive từ 360px đến 4K.

---

© 2026 AZmobile. Dự án demo phục vụ học tập và trình diễn.
