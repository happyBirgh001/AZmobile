/* =========================================================
   AZmobile — Cấu hình email marketing (Brevo)
   ---------------------------------------------------------
   ĐÂY LÀ FILE DUY NHẤT CẦN SỬA.

   Thông số dưới đây lấy từ mã nhúng form Brevo:
     Brevo → Contacts → Forms → chọn form → bước "Share" → Embed code
     <form action="https://xxxxx.sibforms.com/serve/MUIFA..." method="POST">

   LƯU Ý BẢO MẬT: URL `sibforms.com/serve/...` là thông tin CÔNG KHAI
   (nằm sẵn trong mã HTML của form), KHÔNG phải API key.
   Tuyệt đối KHÔNG dán API key Brevo (dạng "xkeysib-...") vào file này.
   ========================================================= */
window.AZNL_CONFIG = {

  /* Bật/tắt toàn bộ tính năng. false = website chạy bình thường, không gửi gì. */
  enabled: true,

  /* URL trong action của form Brevo (form "AZmobile" của bạn) */
  action: 'https://303c309e.sibforms.com/serve/MUIFAAXVnK-1GaMy1MeOpZ0NUoIwvL9YDhVc0qoXlP_0iGPR_7hMvFqpuEXIuvkI4lWFoGnL0eb_GCse0cBcA56exdtA3OuNJQfzMyHyk1YQ1sIxl7Lv4PIr7_AmSQtSMgzxlTO5oe7nPksmaHo2-tJsalbNhoICD2ASSLFWS2jNzrtb4UHmfj8PptuGMpN-khYPSAY0ui3w23k1QQ==',

  /* Tên trường trong form Brevo.
     Form hiện tại CHỈ có ô Email → để '' cho họ tên/SĐT (không gửi 2 trường đó).
     Nếu sau này bạn thêm ô Họ tên / SĐT vào form Brevo thì đổi thành
     firstName: 'FIRSTNAME', phone: 'SMS'. */
  fields: {
    email: 'EMAIL',
    firstName: '',
    phone: ''
  },

  /* Form Brevo có bật double opt-in không?
     Form hiện tại: "Sign-up confirmation: No confirmation email" → false
     false → khách vào danh sách ngay, nhận mail quảng cáo luôn
     true  → Brevo gửi email xác nhận, khách bấm xong mới nhận mail */
  doubleOptIn: false,

  /* Ngôn ngữ trang cảm ơn của Brevo (form đang để 'en') */
  locale: 'en',

  /* Chỉ dùng để log trong console trình duyệt */
  source: 'AZmobile web'
};
