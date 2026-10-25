# Hướng dẫn: Đăng ký tài khoản → tự động nhận email khuyến mãi (Brevo)

Website AZmobile nối với **Brevo** (dịch vụ email marketing, gói free: **không giới hạn  
contact, 300 email/ngày**). Khi khách tạo tài khoản và tick ô *"Tôi đồng ý nhận email  
khuyến mãi"*, email của khách được đẩy vào danh sách Brevo; sau đó **Brevo** gửi bài  
quảng cáo — website không tự gửi thư (site tĩnh, không có server).

---

## 1. Cách hoạt động

```
Khách bấm "Tạo tài khoản" (có tick ô nhận khuyến mãi)
        │
        ├─► db.js: lưu tài khoản vào localStorage (+ marketingOptIn = true)
        │
        └─► newsletter.js: POST email sang
            https://xxxxx.sibforms.com/serve/MUIFA...
                    │
                    ▼
            Danh sách (list) trong Brevo
                    │
                    └─► Automation "Contact added to a list"
                              → gửi bài quảng cáo tới hộp thư khách
```

**Vì sao không gọi API Brevo từ trình duyệt?** API cần `api-key` (dạng `xkeysib-...`),  
cấp toàn quyền tài khoản. Đặt vào JS công khai = mất tài khoản. Vì vậy module dùng  
**endpoint form nhúng** của Brevo — đúng cách Brevo thiết kế cho web tĩnh.

---

## 2. Tạo tài khoản Brevo

1. Vào <https://www.brevo.com> → **Sign up free** (không cần thẻ).
2. Xác nhận email, đăng nhập.
3. Brevo sẽ hỏi mục đích sử dụng → chọn **Email marketing / Marketing**.
4. Vào **Contacts → Lists → Create a list**, đặt tên ví dụ `AZmobile – Khách hàng`.

> Gói free: **300 email/ngày**, không giới hạn contact. Đủ cho đồ án / học tập.

---

## 3. Tạo fo*rm và lấy `action`* (2 phút)

1. Menu trái → **Contacts → Forms**.
2. Bấm **Create a form** → chọn **Subscription form** (hoặc "Create a subscription form").
3. Đặt tên, chọn **list** nhận contact (list ở bước 2) → **Save & continue**.
4. Chuyển sang tab **Share** (hoặc **Embed code** / **Mã nhúng**).
5. Trong khung code, tìm dòng đầu tiên:

```html
<form action="https://xxxxx.sibforms.com/serve/MUIFAbCdEf..." method="POST">
```

1. Copy **nguyên cả URL** trong `action` (bắt đầu bằng `https://` và kết thúc trước dấu `"`).

> Nếu form của bạn có thêm ô Họ tên / Số điện thoại thì tên trường lần lượt là  
> `FIRSTNAME`, `SMS` — đúng như mặc định trong config, không cần sửa.



---

## 4. Dán vào code

Mở `assets/js/newsletter-config.js`:

```js
window.AZNL_CONFIG = {
  enabled: true,
  action: 'https://xxxxx.sibforms.com/serve/MUIFAbCdEf...',  // ← dán vào đây
  fields: { email: 'EMAIL', firstName: 'FIRSTNAME', phone: 'SMS' },
  doubleOptIn: false,
  locale: 'vi',
  source: 'AZmobile web'
};
```

Xong. `enabled: false` thì website chạy y như cũ, không gửi gì.

---

## 5. Tạo bài quảng cáo tự động trong Brevo

Website chỉ thêm người vào danh sách — **nội dung thư do Brevo gửi**.

1. Menu trái → **Automations** → **Create a new automation**.
2. Chọn trigger: **A contact is added to a list** (hoặc "Contact added to a list").
3. Chọn đúng list ở bước 2 → **Save**.
4. Thêm bước **Send an email**:
   - **Subject**: `Chào {{contact.FIRSTNAME}}, tặng bạn 10% cho đơn đầu tiên 🎁`
   - Nội dung: ảnh/khối sản phẩm, mã giảm giá, nút **Mua ngay** trỏ về  
     `https://happybirgh001.github.io/AZmobile/shop.html`
5. Bật workflow (**Activate** / **Turn on**).

Từ lúc này: khách đăng ký → có trong list → automation chạy → nhận mail.

> Nếu gói free không cho bật automation, dùng **Campaigns → Create a campaign**,  
> chọn list rồi bấm **Send** — vẫn gửi được cho toàn bộ danh sách, chỉ là thủ công.

---

## 6. Double opt-in — nên bật hay tắt?

|                            | Bật (`doubleOptIn: true`)     | Tắt (`false`)    |
| -------------------------- | ----------------------------- | ---------------- |
| Khách nhận mail quảng cáo  | Sau khi bấm link xác nhận     | **Ngay lập tức** |
| Danh sách sạch, ít bị spam | Tốt hơn                       | Kém hơn          |
| Phù hợp                    | Làm thật, thu lead chất lượng | Học tập / demo   |

Cấu hình ở **2 nơi phải khớp nhau**: trong `newsletter-config.js` và trong Brevo  
(form → **Settings → Double opt-in**). Lệch nhau thì câu thông báo trên web sẽ sai.

---

## 7. Kiểm tra & xử lý sự cố

| Hiện tượng                           | Nguyên nhân                                 | Cách xử lý                                                         |
| ------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------ |
| Đăng ký xong, Brevo không có contact | `action` còn rỗng / `enabled` = false       | F12 → Console, xem dòng `[AZNL]`; thấy `chưa cấu hình` là chưa bật |
| Contact có nhưng không nhận mail     | Automation chưa **Activate**, hoặc sai list | Kiểm tra workflow + đúng list chưa                                 |
| Không thấy mail                      | Sender là `@gmail.com` → trượt DMARC        | Xác thực tên miền riêng + đổi sender — xem **mục 7b**             |
| Console: `lỗi mạng, đã xếp hàng đợi` | Mất mạng / chặn quảng cáo                   | Module tự lưu, mở lại trang sẽ gửi tiếp                            |
| Gửi thử nhiều lần chỉ thấy 1 request | Chống trùng 24h                             | Xoá key `azmobile.nl.sent.v1` trong localStorage                   |

**Test nhanh bằng Console (F12):**

```js
AZNL.isConfigured()                                              // → true nếu đã cấu hình
AZNL.subscribe({ email: 'ban@example.com' })                     // → {ok:true}
AZNL.subscribe({ email: 'sai@localhost' })                       // → {ok:false, reason:'rejected', message:'...'}
```

---

## 7b. Xác thực tên miền gửi — bước quyết định để mail không vào Spam

> **Đây là lý do phổ biến nhất khiến "Brevo báo đã gửi nhưng Gmail không thấy mail".**

Nếu để **From Email** là một địa chỉ `@gmail.com`, thư gần như chắc chắn bị Gmail chặn hoặc đẩy
vào Spam. Lý do: `gmail.com` có bản ghi DMARC `p=quarantine`, mà Brevo **không thể ký DKIM**
cho tên miền `gmail.com` (họ không giữ private key của Google). Thiếu chữ ký hợp lệ → trượt
DMARC → thư bị xử lý như thư giả mạo.

Cách đúng: dùng **tên miền riêng của shop** (ở đây là `toiecdn.id.vn`, mua tại Mắt Bão).

### Các bước đã làm (làm lại được bất cứ lúc nào)

1. Brevo → **Senders & Domains → Domains → Add a new domain** → nhập `toiecdn.id.vn`.
2. Bỏ trống **Branded subdomain** (có thể bật sau, cần thêm 2 bản ghi CNAME nữa).
3. Chọn **Manual** (Mắt Bão không nằm trong danh sách tự kết nối của Brevo).
4. Mở Mắt Bão → tên miền → tab **Bản ghi DNS** → **Tạo bản ghi**, thêm đúng 4 bản ghi dưới đây.
5. Chờ DNS lan truyền (thường 5–30 phút), bấm **Verify records** → cả 4 dòng phải hiện `success`.
6. Bấm **Authenticate domain** → trạng thái đổi thành **Authenticated**.

### 4 bản ghi DNS

| Host (Tên)         | Loại  | Giá trị                                              |
| ------------------ | ----- | ---------------------------------------------------- |
| `@`                | TXT   | `brevo-code:441c8ced4064d6bf40e24321311f8330`        |
| `brevo1._domainkey`| CNAME | `b1.toiecdn-id-vn.dkim.brevo.com`                    |
| `brevo2._domainkey`| CNAME | `b2.toiecdn-id-vn.dkim.brevo.com`                    |
| `_dmarc`           | TXT   | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com`   |

> ⚠️ Giá trị DKIM chứa tên miền viết bằng dấu gạch: `toiecdn.id.vn` → `toiecdn-id-vn`.
> Gõ sai một ký tự (ví dụ `toicdn-id-vn`) là Verify sẽ báo đỏ dù bản ghi "trông có vẻ đúng".

**Mẹo nhập ở Mắt Bão:** giá trị TXT nằm trong ô `textarea` (placeholder "Text"), giá trị CNAME
nằm trong ô `input` (placeholder "Tên miền."). Nếu form "Tạo bản ghi" không hiện, cuộn trang
lên đầu rồi bấm lại.

### Sau khi xác thực: đổi người gửi

Brevo → **Senders & Domains → Senders → Add sender**:

- From Name: `AZmobile`
- From Email: `khuyenmai@toiecdn.id.vn`

Tên miền đã xác thực nên sender được duyệt **ngay**, không cần bấm link xác nhận trong hộp thư.
Sau đó vào Automation → bấm vào node **Send an email** → mục **Sender** → chọn
`khuyenmai@toiecdn.id.vn` → **Save**.

### Kiểm chứng kết quả (đã chạy thật)

| Bước                                        | Kết quả                                   |
| ------------------------------------------- | ----------------------------------------- |
| Gửi test từ Automation                      | Vào thẳng **Hộp thư đến**, không Spam     |
| Header thư                                  | `AZmobile <khuyenmai@toiecdn.id.vn>`      |
| Đăng ký mới bằng `...@gmail.com`            | Automation `Started 1 / Finished 1 (100%)`|
| Thời gian từ lúc đăng ký đến khi nhận mail  | ~2 phút (delay 1 phút + thời gian xử lý)  |

> Lưu ý: nếu tên miền **hết hạn** (03/07/2028) hoặc bạn đổi DNS, DKIM sẽ mất và thư lại bị
> đánh spam. Gia hạn tên miền đúng hạn và **không xoá** 4 bản ghi trên.

---

## 8. Pháp lý — đừng bỏ qua

- Ô đồng ý phải do khách **tự tick**, mặc định để trống (đã làm sẵn trong `login.html`).
- **Nghị định 91/2020/NĐ-CP**: chỉ gửi thư quảng cáo khi người nhận đã đồng ý trước; mỗi  
  thư phải có thông tin người gửi và cách từ chối; xử lý yêu cầu từ chối trong **24 giờ**.
- Brevo tự chèn link **Unsubscribe** cuối mỗi email và tự xử lý khi khách bấm.
- Trang **Tài khoản → Email khuyến mãi** cho khách tự bật/tắt (lưu trên trình duyệt);  
  muốn xoá hẳn khỏi danh sách thì dùng link Unsubscribe trong email hoặc xoá trong Brevo.

---

## 9. Nâng cấp: dùng API Brevo (khi có backend)

Khi cần đồng bộ 2 chiều (xoá hẳn contact khi khách tắt nhận mail, đọc thống kê open/click),  
chuyển sang **Brevo API v3**, key chỉ nằm ở server. Ví dụ Cloudflare Worker:

```js
export default {
  async fetch(request, env) {
    const { email, name } = await request.json();
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email,
        attributes: { FIRSTNAME: name },
        listIds: [Number(env.BREVO_LIST_ID)],
        updateEnabled: true
      })
    });
    return new Response(JSON.stringify({ ok: res.ok }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
```

Lúc đó chỉ cần đổi hàm `send()` trong `newsletter.js` thành `fetch('/api/subscribe', ...)`.

---

## 10. File liên quan

| File                             | Vai trò                                                        |
| -------------------------------- | -------------------------------------------------------------- |
| `assets/js/newsletter-config.js` | **Nơi duy nhất cần sửa**: `action`, `enabled`, `doubleOptIn`   |
| `assets/js/newsletter.js`        | Module `AZNL`: gửi đăng ký, chống trùng, hàng đợi khi mất mạng |
| `login.html`                     | Ô tick "nhận email khuyến mãi" (mặc định không tick)           |
| `assets/js/login.js`             | Gọi `AZNL.subscribe()` sau khi tạo tài khoản                   |
| `assets/js/db.js`                | Lưu cờ `marketingOptIn` + `marketingOptInAt`                   |
| `assets/js/account.js`           | Khối "Email khuyến mãi" cho khách tự bật/tắt                   |
