/* =========================================================
   AZmobile — Cấu hình Mailchimp
   ---------------------------------------------------------
   ĐÂY LÀ FILE DUY NHẤT BẠN CẦN SỬA ĐỂ BẬT TÍNH NĂNG
   "Đăng ký tài khoản = nhận email khuyến mãi".

   Cách lấy `u` và `id` (2 phút):
     1. Đăng nhập Mailchimp → Audience (Audience dashboard)
     2. Menu "Manage Audience" → Signup forms → Embedded forms
     3. Ở khung code hiện ra, tìm dòng:
          <form action="https://xxx.us13.list-manage.com/subscribe/post?u=abc123&id=def456" ...>
        → `u` = phần sau "u=", `id` = phần sau "id="
     4. Dán vào dưới đây, đổi enabled thành true.

   LƯU Ý BẢO MẬT: `u` và `id` là thông tin CÔNG KHAI (nằm sẵn trong mã
   HTML của form Mailchimp), KHÔNG phải API key. Tuyệt đối KHÔNG dán
   API key (dạng "abc123-us13") vào file này — API key cấp toàn quyền
   tài khoản, chỉ được dùng ở server.
   ========================================================= */
window.AZMC_CONFIG = {
  /* Bật/tắt toàn bộ tính năng. false = website chạy bình thường, không gửi gì. */
  enabled: false,

  /* Data center của tài khoản: us13, us14, us21... (xem trong URL admin.mailchimp.com) */
  dc: 'us13',

  /* Lấy từ action URL của Embedded form (xem hướng dẫn ở trên) */
  u: '',   // ví dụ: 'a1b2c3d4e5f6a7b8c9d0e1f2a'
  id: '',  // ví dụ: '0123456789'

  /* Audience của bạn có bật double opt-in không?
     true  → Mailchimp gửi 1 email xác nhận, khách bấm xong mới vào danh sách (an toàn hơn, ít spam hơn)
     false → khách vào danh sách ngay, nhận mail quảng cáo luôn */
  doubleOptIn: true,

  /* Nhãn gắn cho mọi liên hệ đăng ký từ website (dùng để lọc/segment trong Mailchimp) */
  tags: ['azmobile', 'website'],

  /* Ghi chú nguồn, chỉ dùng để log trong console trình duyệt */
  source: 'AZmobile web'
};
