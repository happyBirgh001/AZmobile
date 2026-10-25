/* =========================================================
   AZmobile — Cấu hình Mailchimp
   ---------------------------------------------------------
   ĐÂY LÀ FILE DUY NHẤT BẠN CẦN SỬA ĐỂ BẬT TÍNH NĂNG
   "Đăng ký tài khoản = nhận email khuyến mãi".

   Cách lấy `u`, `id`, `f_id` (2 phút):
     1. Mailchimp → menu trái "Forms" → khung "Embedded form" → "Create embedded form"
     2. Chọn audience → lưu → mở phần "Embed code" (mã nhúng)
     3. Trong code tìm dòng:
          <form action="https://xxx.us13.list-manage.com/subscribe/post?u=abc123&id=def456&f_id=..." ...>
        → `u`, `id`, `f_id` là phần sau mỗi dấu "=", còn `host` là tên miền trong action
     4. Dán vào dưới đây, đặt enabled: true.

   LƯU Ý BẢO MẬT: `u` và `id` là thông tin CÔNG KHAI (nằm sẵn trong mã
   HTML của form Mailchimp), KHÔNG phải API key. Tuyệt đối KHÔNG dán
   API key (dạng "abc123-us13") vào file này — API key cấp toàn quyền
   tài khoản, chỉ được dùng ở server.
   ========================================================= */
window.AZMC_CONFIG = {
  /* Bật/tắt toàn bộ tính năng. false = website chạy bình thường, không gửi gì. */
  enabled: true,

  /* Data center của tài khoản: us13, us14, us21... (xem trong URL admin.mailchimp.com) */
  dc: 'us13',

  /* Host đầy đủ lấy từ action URL của Embedded form.
     Một số tài khoản có tiền tố tên account (ví dụ "gmail.us13.list-manage.com").
     Để trống '' thì module tự dùng "<dc>.list-manage.com". */
  host: 'gmail.us13.list-manage.com',

  /* Lấy từ action URL của Embedded form */
  u: '2f99b106f90b0a0b510670b13',
  id: 'bd72b945e7',
  f_id: '00b38eeaf0',

  /* Audience của bạn có bật double opt-in không?
     true  → Mailchimp gửi 1 email xác nhận, khách bấm xong mới vào danh sách (an toàn hơn, ít spam hơn)
     false → khách vào danh sách ngay, nhận mail quảng cáo luôn */
  doubleOptIn: true,

  /* Nhãn gắn cho mọi liên hệ đăng ký từ website (dùng để lọc/segment trong Mailchimp) */
  tags: ['azmobile', 'website'],

  /* Ghi chú nguồn, chỉ dùng để log trong console trình duyệt */
  source: 'AZmobile web'
};
