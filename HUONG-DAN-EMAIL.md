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

1. Vào https://www.brevo.com → **Sign up free** (không cần thẻ).
2. Xác nhận email, đăng nhập.
3. Brevo sẽ hỏi mục đích sử dụng → chọn **Email marketing / Marketing**.
4. Vào **Contacts → Lists → Create a list**, đặt tên ví dụ `AZmobile – Khách hàng`.

> Gói free: **300 email/ngày**, không giới hạn contact. Đủ cho đồ án / học tập.

---

## 3. Tạo form và lấy `action` (2 phút)

1. Menu trái → **Contacts → Forms**.
2. Bấm **Create a form** → chọn **Subscription form** (hoặc "Create a subscription form").
3. Đặt tên, chọn **list** nhận contact (list ở bước 2) → **Save & continue**.
4. Chuyển sang tab **Share** (hoặc **Embed code** / **Mã nhúng**).
5. Trong khung code, tìm dòng đầu tiên:

```html
<form action="https://xxxxx.sibforms.com/serve/MUIFAbCdEf..." method="POST">
```

6. Copy **nguyên cả URL** trong `action` (bắt đầu bằng `https://` và kết thúc trước dấu `"`).

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

| | Bật (`doubleOptIn: true`) | Tắt (`false`) |
|---|---|---|
| Khách nhận mail quảng cáo | Sau khi bấm link xác nhận | **Ngay lập tức** |
| Danh sách sạch, ít bị spam | Tốt hơn | Kém hơn |
| Phù hợp | Làm thật, thu lead chất lượng | Học tập / demo |

Cấu hình ở **2 nơi phải khớp nhau**: trong `newsletter-config.js` và trong Brevo
(form → **Settings → Double opt-in**). Lệch nhau thì câu thông báo trên web sẽ sai.

---

## 7. Kiểm tra & xử lý sự cố

| Hiện tượng | Nguyên nhân | Cách xử lý |
|---|---|---|
| Đăng ký xong, Brevo không có contact | `action` còn rỗng / `enabled` = false | F12 → Console, xem dòng `[AZNL]`; thấy `chưa cấu hình` là chưa bật |
| Contact có nhưng không nhận mail | Automation chưa **Activate**, hoặc sai list | Kiểm tra workflow + đúng list chưa |
| Không thấy mail | Vào Spam / Promotions | Đánh dấu "Not spam"; xác minh domain gửi ở **Senders & Domains** |
| Console: `lỗi mạng, đã xếp hàng đợi` | Mất mạng / chặn quảng cáo | Module tự lưu, mở lại trang sẽ gửi tiếp |
| Gửi thử nhiều lần chỉ thấy 1 request | Chống trùng 24h | Xoá key `azmobile.nl.sent.v1` trong localStorage |

**Test nhanh bằng Console (F12):**

```js
AZNL.isConfigured()                                              // → true nếu đã cấu hình
AZNL.subscribe({ email: 'ban@example.com', name: 'Test' })       // → {ok:true}
```

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

| File | Vai trò |
|---|---|
| `assets/js/newsletter-config.js` | **Nơi duy nhất cần sửa**: `action`, `enabled`, `doubleOptIn` |
| `assets/js/newsletter.js` | Module `AZNL`: gửi đăng ký, chống trùng, hàng đợi khi mất mạng |
| `login.html` | Ô tick "nhận email khuyến mãi" (mặc định không tick) |
| `assets/js/login.js` | Gọi `AZNL.subscribe()` sau khi tạo tài khoản |
| `assets/js/db.js` | Lưu cờ `marketingOptIn` + `marketingOptInAt` |
| `assets/js/account.js` | Khối "Email khuyến mãi" cho khách tự bật/tắt |
