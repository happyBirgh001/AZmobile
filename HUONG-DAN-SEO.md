# Hướng dẫn SEO & Facebook — AZmobile

Tài liệu này hướng dẫn cấu hình toàn bộ phần **SEO** và **Facebook** của website AZmobile,
cách kiểm tra kết quả, và những lỗi thường gặp.

> Website không có backend. Mọi thẻ SEO được sinh bằng JavaScript (`assets/js/seo.js`)
> từ cấu hình lưu trong `localStorage`. Vì vậy:
> - Thay đổi trong Admin **chỉ có tác dụng trên trình duyệt đang dùng**.
> - Muốn áp cho mọi người, phải sửa **giá trị mặc định** trong `assets/js/db.js` (`seedData()` → `settings.seo`, `settings.facebook`) rồi push lên GitHub.

---

## 1. Bốn nơi cấu hình

| # | Màn hình | Đường dẫn trong Admin | Phạm vi |
|---|---|---|---|
| 1 | SEO sản phẩm | **Sản phẩm** → biểu tượng bút chì → mục *Cấu hình SEO cho sản phẩm* | Từng sản phẩm |
| 2 | SEO bài viết | **Bài viết** → biểu tượng bút chì → mục *Cấu hình SEO cho bài viết* | Từng bài viết |
| 3 | Tối ưu SEO hệ thống | **Tối ưu SEO** | Toàn site |
| 4 | Facebook | **Facebook** | Toàn site |

Nguyên tắc chung: **ô nào để trống thì dùng giá trị tự động**. Chip ở góc phải mỗi khối SEO
hiển thị *Tự động* (chưa nhập gì) hoặc *Đã cấu hình* (đã nhập ít nhất tiêu đề hoặc mô tả).

---

## 2. SEO cho từng sản phẩm

Vào **Sản phẩm** → bấm nút bút chì ở dòng sản phẩm → cuộn xuống khối
**Cấu hình SEO cho sản phẩm**.

| Trường | Ý nghĩa | Nên điền |
|---|---|---|
| **Tiêu đề SEO** | Tiêu đề hiện trên kết quả Google và tiêu đề tab | 50–60 ký tự. Để trống → `Tên sản phẩm — Thương hiệu` |
| **Meta description** | Đoạn mô tả dưới tiêu đề trên Google | 140–160 ký tự, có lợi ích + giá/khuyến mãi. Để trống → dùng mô tả sản phẩm |
| **Đường dẫn (slug)** | Phần đuôi URL | Tự sinh từ tên sản phẩm. Có thể sửa, chỉ dùng chữ thường, số và dấu `-` |
| **Từ khoá** | `meta keywords` | 3–6 cụm, cách nhau dấu phẩy. Để trống → tên + thương hiệu + "laptop" |
| **Ảnh chia sẻ (OG image)** | Ảnh hiện khi share Facebook / Zalo | Tỉ lệ 1.91:1, tối thiểu 1200×630. Để trống → ảnh sản phẩm |
| **Canonical URL** | URL chuẩn của trang | Để trống → URL hiện tại |
| **Không cho Google index** | Thêm `noindex,nofollow` | Chỉ tick khi muốn ẩn sản phẩm khỏi Google |

Bộ đếm ký tự ngay dưới ô tiêu đề / mô tả chuyển **vàng** khi gần giới hạn và **đỏ** khi vượt.

---

## 3. SEO cho từng bài viết

Vào **Bài viết** → **Viết bài mới** (hoặc bút chì để sửa).

| Trường | Ghi chú |
|---|---|
| Tiêu đề | Bắt buộc |
| Đường dẫn (slug) | Tự sinh từ tiêu đề, **không được trùng** với bài khác (hệ thống sẽ báo lỗi) |
| Chuyên mục | Dùng cho bộ lọc ở `blog.html` và gợi ý bài liên quan. Gõ chuyên mục mới vào ô là tạo luôn |
| Ảnh đại diện | Đường dẫn ảnh, dùng cho thẻ card và `og:image` |
| Tóm tắt | Hiện ở danh sách bài và dùng làm `meta description` nếu ô SEO để trống |
| Nội dung | Cách nhau **một dòng trống** để tách đoạn văn |
| Trạng thái | `published` mới hiện ra ngoài site; `draft` chỉ thấy trong Admin |
| Ngày đăng | Dùng cho `datePublished` trong JSON-LD `Article` |

### Cấu trúc JSON-LD của bài viết

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "…",
  "description": "…",
  "image": ["https://toiecdn.id.vn/assets/img/products/p_rog.jpg"],
  "datePublished": "2026-10-18T08:00:00.000Z",
  "dateModified": "2026-10-18T08:00:00.000Z",
  "author": { "@type": "Organization", "name": "AZmobile" },
  "publisher": { "@type": "Organization", "name": "AZmobile" },
  "mainEntityOfPage": "https://toiecdn.id.vn/post.html?slug=…"
}
```

---

## 4. Tối ưu SEO hệ thống

Vào **Tối ưu SEO**.

### 4.1 Cột trái — các trường cấu hình

| Trường | Mặc định | Ý nghĩa |
|---|---|---|
| **Tên miền website** | `https://toiecdn.id.vn` | Gốc để tạo URL tuyệt đối cho `canonical` và `og:url` / `og:image`. **Open Graph bắt buộc URL tuyệt đối**, thiếu là Facebook không hiện ảnh |
| **Mẫu tiêu đề** | `{page} \| {site}` | `{page}` = tiêu đề trang, `{site}` = tên website. Ví dụ ra: `Sản phẩm \| AZmobile` |
| **Tiêu đề mặc định** | 59 ký tự | Dùng cho trang không đặt tiêu đề riêng |
| **Mô tả mặc định** | 147 ký tự | Dùng cho trang không đặt mô tả riêng |
| **Từ khoá mặc định** | `laptop, laptop gaming, …` | `meta keywords` toàn site |
| **Ảnh chia sẻ mặc định** | `assets/img/products/p_rog.jpg` | Ảnh OG khi trang không có ảnh riêng |
| **Robots mặc định** | `index,follow` | Chỉ đổi khi muốn chặn toàn site |
| **Twitter / X handle** | trống | Điền `@ten` để có `twitter:site` |
| **Đưa sản phẩm / bài viết vào sitemap** | bật | Tắt để sitemap chỉ còn 4 trang tĩnh |

### 4.2 Cột phải — kiểm tra & xuất tệp

- **Xem trước trên Google** — mô phỏng đúng kết quả tìm kiếm (URL, tiêu đề, mô tả).
- **Tình trạng tối ưu** — 6 dòng tự kiểm tra:
  - Tiêu đề mặc định 30–60 ký tự
  - Mô tả mặc định 100–160 ký tự
  - Tên miền canonical có `https://`
  - Số sản phẩm / bài viết đã có SEO (bao gồm cả dạng tự động)
  - Facebook Pixel đã bật hay chưa
- **robots.txt & sitemap.xml** — xem nội dung thực tế và tải về.

### 4.3 Cập nhật sitemap sau khi thêm sản phẩm / bài viết

1. **Tối ưu SEO** → **Tải sitemap.xml**
2. Mở repo GitHub → thay thế `sitemap.xml` ở thư mục gốc → Commit
3. (Lần đầu) [Google Search Console](https://search.google.com/search-console) → **Sitemaps** → nhập `sitemap.xml` → Submit

`robots.txt` chỉ cần tải lại khi đổi tên miền hoặc đổi danh sách trang bị chặn.

---

## 5. Cấu hình Facebook

Vào **Facebook**.

| Trường | Lấy ở đâu | Bắt buộc |
|---|---|---|
| **Fanpage URL** | Địa chỉ trang Facebook của shop | Không (dùng cho `sameAs` trong JSON-LD và nút CTA cuối bài viết) |
| **App ID** | [developers.facebook.com](https://developers.facebook.com) → App → Settings → Basic | Không (thêm `fb:app_id`, hữu ích khi dùng Insights) |
| **Pixel ID** | [business.facebook.com/events_manager](https://business.facebook.com/events_manager) → Data sources → chọn Pixel → Settings | Có, nếu muốn chạy quảng cáo |
| **Link Messenger** | `https://m.me/<tên-page>` | Không |
| **Mã xác minh tên miền** | Business Manager → Brand safety → Domains → Meta-tag verification | Không (cần khi muốn xác minh domain) |
| **og:type mặc định** | `website` / `article` / `product` | Có giá trị mặc định |
| **og:locale** | `vi_VN` | Có giá trị mặc định |
| **Bật Facebook Pixel** | Tick để bật | — |

### 5.1 Thẻ Open Graph thực tế sẽ in ra

Khung **Thẻ Open Graph đang phát ra** hiển thị đúng những dòng sẽ nằm trong `<head>`:

```html
<meta property="og:type" content="website">
<meta property="og:site_name" content="AZmobile">
<meta property="og:locale" content="vi_VN">
<meta property="og:title" content="AZmobile — Laptop, phụ kiện, sửa chữa & bảo hành chính hãng">
<meta property="og:description" content="…">
<meta property="og:image" content="https://toiecdn.id.vn/assets/img/products/p_rog.jpg">
```

### 5.2 Bật Pixel

1. Nhập **Pixel ID** (dãy số 15–16 chữ số).
2. Tick **Bật Facebook Pixel trên toàn website**.
3. **Lưu cấu hình Facebook**.
4. Mở site ở tab mới → F12 → Console gõ `fbq` → phải thấy hàm; Network lọc `fbevents.js` → phải có request `200`.

> Pixel **không chạy** khi mở bằng `file://` hay `localhost` chưa cấu hình trong Events Manager.
> Để kiểm tra thật, dùng **Facebook Pixel Helper** (extension Chrome) trên tên miền đã deploy.

### 5.3 Kiểm tra ảnh và tiêu đề khi share

Dùng **[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)**:

1. Dán URL trang cần kiểm tra → **Debug**
2. Xem mục *When and how Facebook was last scraped*
3. Nếu vẫn là dữ liệu cũ → bấm **Scrape Again**

Facebook cache dữ liệu share khá lâu, nên sau khi đổi `og:image` phải Scrape Again mới thấy.

---

## 6. Kiểm tra JSON-LD

Dùng **[Google Rich Results Test](https://search.google.com/test/rich-results)**:

| Trang | Kết quả mong đợi |
|---|---|
| `product.html?id=p_rog` | 2 khối: `Organization` + `Product` (có giá, tồn kho, đánh giá) |
| `post.html?slug=…` | 2 khối: `Organization` + `Article` |
| `blog.html` | 2 khối: `Organization` + `Blog` |
| Các trang khác | 1 khối: `Organization` |

Kiểm tra nhanh bằng DevTools Console:

```js
document.querySelectorAll('script[type="application/ld+json"]').length
[...document.querySelectorAll('script[type="application/ld+json"]')]
  .map(s => JSON.parse(s.textContent)['@type'])
```

---

## 7. Bảng trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| Tên miền canonical | `https://toiecdn.id.vn` |
| Mẫu tiêu đề | `{page} \| {site}` |
| Tiêu đề mặc định | 59/60 ký tự ✔ |
| Mô tả mặc định | 147/160 ký tự ✔ |
| Sản phẩm có SEO | 39/39 (dạng tự động) ✔ |
| Bài viết có SEO | 3/3 (dạng tự động) ✔ |
| `robots.txt` | có, ở thư mục gốc ✔ |
| `sitemap.xml` | 46 URL ✔ |
| Facebook Pixel | chưa bật — cần Pixel ID |

---

## 8. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Share Facebook không có ảnh | `og:image` là đường dẫn tương đối, hoặc **Tên miền website** để trống | Điền `https://toiecdn.id.vn` ở **Tối ưu SEO** |
| Tiêu đề tab không đổi | Trình duyệt cache | Ctrl+Shift+R (hard reload) |
| Đã sửa SEO nhưng máy khác không thấy | Cấu hình nằm trong `localStorage` của máy đó | Sửa giá trị mặc định trong `db.js` → `seedData()` → `settings.seo` |
| Google chưa thấy sản phẩm mới | `sitemap.xml` chưa cập nhật | Tải lại sitemap ở Admin → ghi đè trên GitHub → Submit lại Search Console |
| Trang lọc `shop.html?cat=…` bị Google index trùng | Bình thường, đã có `canonical` về `shop.html` | Không cần làm gì |
| Pixel báo "không hoạt động" | Đang mở `file://` hoặc `localhost` | Test trên tên miền thật + Pixel Helper |
| Slug bài viết báo trùng | Hai bài cùng slug | Đổi slug bài mới |
| Sửa `settings.seo` trong `db.js` nhưng không thấy đổi | Dữ liệu cũ đã có trong `localStorage`, `migrateSeed()` không ghi đè | Admin → **Cài đặt** → **Khôi phục dữ liệu mẫu** (mất dữ liệu tự thêm) hoặc sửa trực tiếp trong Admin |

---

## 9. Ghi chú kỹ thuật

- `assets/js/seo.js` gắn thuộc tính `data-azseo` lên mọi thẻ nó tạo ra. Mỗi lần áp dụng, nó
  **xoá hết thẻ cũ do chính nó tạo** rồi ghi lại — nhờ vậy gọi nhiều lần (ví dụ khi đổi bộ lọc
  ở `shop.html`) không bị trùng thẻ.
- Thứ tự nạp bắt buộc: `db.js` → `seo.js` → script của trang.
- API công khai:

```js
AZSEO.page({ title, description, keywords, image, url, noindex })
AZSEO.product(sanPham)   // og:type=product + JSON-LD Product
AZSEO.post(baiViet)      // og:type=article + JSON-LD Article
AZSEO.apply({ ... })     // tuỳ biến đầy đủ
AZSEO.preview({ ... })   // dùng cho trang admin, không ghi vào <head>
AZSEO.abs('shop.html')   // → https://toiecdn.id.vn/shop.html
```

- Trang riêng tư tự nhận `noindex,nofollow`: `cart.html`, `login.html`, `account.html`, `admin.html`.
- `shop.html?q=…` (trang tìm kiếm) cũng `noindex` để tránh Google index hàng nghìn trang rỗng.
