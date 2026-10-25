/* =========================================================
   AZmobile — Cấu hình email marketing (Brevo)
   ---------------------------------------------------------
   ĐÂY LÀ FILE DUY NHẤT CẦN SỬA.

   Cách lấy `action` (2 phút):
     1. Tạo tài khoản miễn phí tại https://www.brevo.com
     2. Menu trái → Contacts → Forms → "Create a form" (chọn Subscription form)
     3. Đặt tên, chọn danh sách (list) nhận contact → Save & continue
     4. Vào tab "Share" (hoặc "Embed code" / "Mã nhúng")
     5. Trong code tìm dòng:
          <form action="https://xxxxx.sibforms.com/serve/MUIFAxxxxxxx" method="POST">
        → copy NGUYÊN cả URL trong action, dán vào `action` dưới đây
     6. Đổi enabled thành true.

   LƯU Ý BẢO MẬT: URL `sibforms.com/serve/...` là thông tin CÔNG KHAI
   (nằm sẵn trong mã HTML của form Brevo), KHÔNG phải API key.
   Tuyệt đối KHÔNG dán API key Brevo (dạng "xkeysib-...") vào file này.
   ========================================================= */
window.AZNL_CONFIG = {

  /* Bật/tắt toàn bộ tính năng. false = website chạy bình thường, không gửi gì. */
  enabled: true,

  /* URL trong action của form Brevo (xem hướng dẫn ở trên) */
  action: '',   // ví dụ: 'https://abc123.sibforms.com/serve/MUIFAXyz...'

  /* Tên trường trong form Brevo của bạn (mặc định là đúng, không cần sửa) */
  fields: {
    email: 'EMAIL',
    firstName: 'FIRSTNAME',
    phone: 'SMS'
  },

  /* Form Brevo có bật double opt-in không?
     true  → Brevo gửi 1 email xác nhận, khách bấm xong mới nhận mail quảng cáo
     false → khách vào danh sách ngay, nhận mail quảng cáo luôn */
  doubleOptIn: false,

  /* Ngôn ngữ trang cảm ơn của Brevo */
  locale: 'vi',

  /* Chỉ dùng để log trong console trình duyệt */
  source: 'AZmobile web'
};
