# Hướng dẫn: Đăng ký tài khoản → tự động nhận email khuyến mãi

Tính năng này nối website AZmobile với **Mailchimp**: khi khách tạo tài khoản và tick ô
"Tôi đồng ý nhận email khuyến mãi", email của khách được đẩy vào **Audience** (danh sách)
trên Mailchimp. Sau đó **Mailchimp** — không phải website — gửi mail quảng cáo/chuỗi ưu đãi.

---

## 1. Cách hoạt động

```
Khách bấm "Tạo tài khoản"
        │
        ├─► db.js: lưu tài khoản vào localStorage (+ cờ marketingOptIn = true)
        │
        └─► mailchimp.js: POST email sang
            https://<dc>.list-manage.com/subscribe/post?u=...&id=...
                    │
                    ▼
            Mailchimp Audience "AZmobile khách hàng"
                    │
                    ├─► Gửi mail xác nhận (nếu bật double opt-in)
                    └─► Automation "Welcome" → gửi mail quảng cáo
```

**Vì sao không gọi thẳng API Mailchimp từ trình duyệt?**
Vì API cần `API key` — thứ cấp toàn quyền tài khoản. Website này là front-end thuần
(GitHub Pages), mọi thứ trong file JS đều công khai, nên đặt API key vào đó = trao tài khoản
cho bất kỳ ai mở F12. Vì vậy module dùng endpoint **Embedded form** công khai của Mailchimp
(`u` + `id`), đúng cách Mailchimp thiết kế cho web tĩnh.

---

## 2. Lấy `u` và `id` (2 phút)

1. Đăng nhập Mailchimp → chọn **Audience** → **Audience dashboard**.
2. Menu **Manage Audience** → **Signup forms**.
3. Chọn **Embedded forms**.
4. Trong khung code hiện ra, tìm dòng đầu tiên:

```html
<form action="https://xxx.us13.list-manage.com/subscribe/post?u=a1b2c3d4e5f6&amp;id=0123456789" ...>
```

- `u` = phần sau `u=` → `a1b2c3d4e5f6`
- `id` = phần sau `id=` → `0123456789`
- `dc` = phần `us13` trong tên miền (`us13.list-manage.com`)

> Chưa có Audience? Vào **Audience → All contacts → Create Audience**, đặt tên
> "AZmobile – Khách hàng", rồi làm lại bước trên.

---

## 3. Điền cấu hình

Mở `assets/js/mailchimp-config.js`, sửa 3 dòng:

```js
window.AZMC_CONFIG = {
  enabled: true,            // ← đổi false thành true
  dc: 'us13',               // ← data center của bạn
  u: 'a1b2c3d4e5f6',        // ← dán giá trị u
  id: '0123456789',         // ← dán giá trị id
  doubleOptIn: true,
  tags: ['azmobile', 'website'],
  source: 'AZmobile web'
};
```

Xong. Đăng ký thử một tài khoản mới → mở Mailchimp → **Audience → All contacts**, email mới
sẽ xuất hiện (kèm tag `azmobile`, `website`, `dang-ky-tai-khoan`).

> `enabled: false` thì website chạy y như cũ, không gửi gì cả — an toàn để deploy trước,
> cấu hình sau.

---

## 4. Tạo mail quảng cáo tự động (Automation)

Đây là phần **gửi mail**. Website chỉ thêm người vào danh sách; nội dung thư do Mailchimp gửi.

1. Menu trái → **Automations** → **Create** → chọn **Welcome new contacts**
   (hoặc **Customer Journeys** nếu muốn nhiều bước).
2. **Trigger**: *When a contact joins an audience* → chọn Audience của bạn.
3. Thêm email đầu tiên:
   - **Subject**: `Chào {FNAME|khách hàng}, đây là ưu đãi 10% cho bạn 🎁`
   - Nội dung: giới thiệu máy mới, mã giảm giá, nút "Mua ngay" trỏ về `shop.html`.
4. (Tuỳ chọn) Thêm bước chờ 3 ngày → email thứ 2 giới thiệu phụ kiện.
5. Bấm **Start** (Turn on).

**Muốn gửi một chiến dịch rời rạc thay vì chuỗi tự động?**
→ **Campaigns → Create → Email**, chọn Audience, soạn nội dung, **Send**.
Đây là "gửi quảng cáo cho cả danh sách" — khác với automation ở chỗ bạn bấm gửi thủ công.

---

## 5. Kiểm tra & xử lý sự cố

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Bấm đăng ký xong, Mailchimp không có contact | `enabled` còn `false`, hoặc `u`/`id` sai | Mở F12 → Console, tìm dòng `[AZMC]`; nếu thấy `chưa cấu hình` là chưa bật |
| Contact có nhưng ghi `Unsubscribed`/`Pending` | Audience đang bật **double opt-in** | Khách phải bấm link xác nhận trong email. Xem mục 6 |
| Khách không nhận được thư | Vào spam, hoặc automation chưa **Start** | Kiểm tra Automation dashboard + thư mục Spam |
| Console báo lỗi mạng `[AZMC] lỗi mạng` | Mất mạng / chặn quảng cáo | Module tự lưu hàng đợi, lần mở trang sau gửi tiếp |
| Gửi thử nhiều lần cùng 1 email nhưng chỉ 1 request | Cơ chế chống trùng 24h | Xoá `azmobile.mc.sent.v1` trong localStorage để test lại |

**Test nhanh bằng Console (F12):**

```js
AZMC.isConfigured()                                  // → true nếu đã cấu hình đúng
AZMC.subscribe({ email: 'ban@example.com', name: 'Test' })   // → {ok:true}
```

---

## 6. Double opt-in — nên bật hay tắt?

| | Bật (`doubleOptIn: true`) | Tắt (`false`) |
|---|---|---|
| Khách nhận mail quảng cáo | Sau khi bấm link xác nhận | Ngay lập tức |
| Tỉ lệ mở/click | Cao hơn (danh sách sạch) | Thấp hơn |
| Rủi ro bị đánh dấu spam | Thấp | Cao hơn |
| Khuyến nghị | **Nên dùng** cho shop thật | Chỉ dùng khi cần thử nhanh |

Bật/tắt tại: **Audience → Settings → Audience name and defaults → Enable double opt-in**.
Nhớ sửa `doubleOptIn` trong `mailchimp-config.js` cho khớp, để câu thông báo hiện đúng.

---

## 7. Pháp lý — đừng bỏ qua

- **Ô đồng ý phải do khách tự tick**, mặc định để trống (đã làm sẵn trong `login.html`).
  Không tick sẵn, không gộp chung với "điều khoản sử dụng".
- **Nghị định 91/2020/NĐ-CP** (Việt Nam): chỉ được gửi thư quảng cáo khi người nhận đã
  đồng ý trước; mỗi thư phải có thông tin người gửi và **cách từ chối** rõ ràng; phải
  xử lý yêu cầu từ chối trong **24 giờ**.
- Mailchimp tự chèn link **Unsubscribe** ở cuối mỗi email (bắt buộc theo chính sách của họ)
  và tự xử lý khi khách bấm → đây là cách huỷ hợp pháp.
- Trang **Tài khoản → Email khuyến mãi** cho khách tự bật/tắt. Khi tắt, website chỉ ghi nhận
  lựa chọn; việc xoá hẳn khỏi danh sách thực hiện qua link Unsubscribe trong email
  (hoặc Admin xoá trong Mailchimp). Đây là giới hạn của site tĩnh — xem mục 8 để khắc phục.
- Trang web demo dùng `localStorage`, dữ liệu khách **không** nằm trên server. Khi làm thật,
  cần thay `db.js` bằng backend và có chính sách bảo mật dữ liệu cá nhân.

---

## 8. Nâng cấp: đồng bộ 2 chiều bằng API (khi cần)

Khi website có backend, nên chuyển sang **Marketing API v3** để: xoá hẳn contact khi khách
tắt nhận mail, đọc thống kê open/click, đồng bộ trạng thái. API key chỉ nằm ở server.

Ví dụ Cloudflare Worker (miễn phí, không cần server riêng):

```js
export default {
  async fetch(request, env) {
    const { email, name, optIn } = await request.json();
    const res = await fetch(
      `https://${env.MC_DC}.api.mailchimp.com/3.0/lists/${env.MC_LIST}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa('azmobile:' + env.MC_KEY)}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_address: email,
          status_if_new: optIn ? 'pending' : 'unsubscribed',
          merge_fields: { FNAME: name }
        })
      }
    );
    return new Response(JSON.stringify({ ok: res.ok }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
```

Biến môi trường: `MC_DC` (`us13`), `MC_LIST` (Audience ID), `MC_KEY` (API key dạng
`abc123-us13` — **tạo Secrets, không commit vào Git**).

Lúc đó chỉ cần đổi hàm `send()` trong `mailchimp.js` thành `fetch('/api/subscribe', ...)`,
phần còn lại giữ nguyên.

---

## 9. File liên quan

| File | Vai trò |
|---|---|
| `assets/js/mailchimp-config.js` | **Nơi duy nhất cần sửa**: bật/tắt + `u`, `id`, `dc`, tags |
| `assets/js/mailchimp.js` | Module `AZMC`: gửi đăng ký, chống trùng, hàng đợi khi mất mạng |
| `login.html` | Ô tick "nhận email khuyến mãi" (mặc định không tick) |
| `assets/js/login.js` | Gọi `AZMC.subscribe()` sau khi tạo tài khoản thành công |
| `assets/js/db.js` | Lưu cờ `marketingOptIn` + `marketingOptInAt` vào tài khoản |
| `assets/js/account.js` | Khối "Email khuyến mãi" cho khách tự bật/tắt |
