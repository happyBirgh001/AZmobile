/* =========================================================
   AZmobile — Lớp dữ liệu (Data Layer)
   Toàn bộ dữ liệu được lưu bền trong localStorage của trình duyệt.
   Không cần server, chạy tốt trên GitHub Pages.
   ========================================================= */
(function (global) {
  'use strict';

  var DB_KEY = 'azmobile.db.v2';
  var SESSION_KEY = 'azmobile.session.v2';
  // Tăng số này mỗi khi thêm sản phẩm/danh mục mẫu mới.
  // Dữ liệu cũ trong localStorage sẽ được BỔ SUNG mục mới, không bị xoá.
  var SEED_VERSION = 3;

  /* ---------------- Tiện ích ---------------- */
  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function nowISO() {
    return new Date().toISOString();
  }

  // Băm mật khẩu đơn giản (chỉ mang tính che giấu, KHÔNG dùng cho hệ thống thật)
  function hash(str) {
    var h = 5381, i;
    for (i = 0; i < str.length; i++) {
      h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    }
    return 'h' + Math.abs(h).toString(36) + '_' + str.length;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /* ---------------- Dữ liệu mẫu ---------------- */
  function seedData() {
    var t = nowISO();

    var categories = [
      { id: 'cat_gaming',  name: 'Laptop Gaming',      slug: 'gaming',     icon: 'gamepad', color: '#6366f1', description: 'Cấu hình mạnh, màn hình tần số quét cao cho game thủ.' },
      { id: 'cat_office',  name: 'Laptop Văn phòng',   slug: 'van-phong',  icon: 'briefcase', color: '#0ea5e9', description: 'Mỏng nhẹ, pin lâu, bàn phím êm cho công việc hàng ngày.' },
      { id: 'cat_graphic', name: 'Laptop Đồ họa',     slug: 'do-hoa',     icon: 'palette', color: '#f43f5e', description: 'Màn hình chuẩn màu, GPU rời cho thiết kế và dựng phim.' },
      { id: 'cat_monitor', name: 'Màn hình',           slug: 'man-hinh',   icon: 'monitor', color: '#14b8a6', description: 'Màn hình văn phòng, gaming, đồ họa chính hãng.' },
      { id: 'cat_acc',     name: 'Phụ kiện',           slug: 'phu-kien',   icon: 'mouse', color: '#f59e0b', description: 'Chuột, bàn phím, tai nghe, sạc, balo, đế tản nhiệt.' },
      { id: 'cat_part',    name: 'Linh kiện',          slug: 'linh-kien',  icon: 'chip', color: '#8b5cf6', description: 'SSD, RAM, tản nhiệt, keo tản nhiệt, pin thay thế.' }
    ];

    var products = [
      {
        id: 'p_rog', name: 'ASUS ROG Strix G16 (2024)', categoryId: 'cat_gaming', brand: 'ASUS',
        price: 32990000, oldPrice: 36990000, stock: 8, rating: 4.8, sold: 124, featured: true,
        artColor: '#6366f1', badge: 'Hot',
        image: 'assets/img/products/p_rog.jpg',
        specs: { cpu: 'Intel Core i7-13650HX', ram: '16GB DDR5 4800MHz', ssd: '512GB PCIe 4.0', vga: 'RTX 4060 8GB', screen: '16" FHD+ 165Hz' },
        description: 'Chiến mọi tựa game AAA với RTX 4060 và màn hình 165Hz. Hệ thống tản nhiệt buồng hơi kép giữ máy luôn mát trong các trận đấu dài.'
      },
      {
        id: 'p_nitro', name: 'Acer Nitro V15', categoryId: 'cat_gaming', brand: 'Acer',
        price: 21490000, oldPrice: 23990000, stock: 14, rating: 4.6, sold: 210, featured: true,
        artColor: '#f43f5e', badge: 'Giá tốt',
        image: 'assets/img/products/p_nitro.jpg',
        specs: { cpu: 'Intel Core i5-13420H', ram: '16GB DDR5', ssd: '512GB NVMe', vga: 'RTX 4050 6GB', screen: '15.6" FHD 144Hz' },
        description: 'Lựa chọn gaming quốc dân trong tầm giá 20 triệu. Hiệu năng ổn định, nâng cấp RAM và SSD dễ dàng.'
      },
      {
        id: 'p_loq', name: 'Lenovo LOQ 15IRX9', categoryId: 'cat_gaming', brand: 'Lenovo',
        price: 24990000, oldPrice: 27490000, stock: 9, rating: 4.5, sold: 96, featured: false,
        artColor: '#0ea5e9', badge: '',
        image: 'assets/img/products/p_loq.jpg',
        specs: { cpu: 'Intel Core i5-13450HX', ram: '16GB DDR5', ssd: '512GB NVMe', vga: 'RTX 4050 6GB', screen: '15.6" FHD 144Hz' },
        description: 'Thiết kế tối giản, hiệu năng cao, phù hợp cả học tập và giải trí. Bàn phím full-size có numpad.'
      },
      {
        id: 'p_macair', name: 'MacBook Air 13 M3', categoryId: 'cat_office', brand: 'Apple',
        price: 27990000, oldPrice: 29990000, stock: 12, rating: 4.9, sold: 305, featured: true,
        artColor: '#94a3b8', badge: 'Bán chạy',
        image: 'assets/img/products/p_macair.jpg',
        specs: { cpu: 'Apple M3 8-core', ram: '8GB Unified', ssd: '256GB SSD', vga: 'GPU 10-core', screen: '13.6" Liquid Retina' },
        description: 'Mỏng nhẹ 1.24kg, pin tới 18 giờ, hoàn toàn không quạt nên tuyệt đối yên tĩnh. Chuẩn mực laptop văn phòng.'
      },
      {
        id: 'p_xps', name: 'Dell XPS 13 9340', categoryId: 'cat_office', brand: 'Dell',
        price: 38990000, oldPrice: 42990000, stock: 5, rating: 4.7, sold: 64, featured: true,
        artColor: '#64748b', badge: 'Cao cấp',
        image: 'assets/img/products/p_xps.jpg',
        specs: { cpu: 'Intel Core Ultra 7 155H', ram: '16GB LPDDR5x', ssd: '512GB NVMe', vga: 'Intel Arc', screen: '13.4" FHD+ IPS' },
        description: 'Khung máy nhôm CNC nguyên khối, viền màn hình siêu mỏng, cảm giác cầm nắm đẳng cấp.'
      },
      {
        id: 'p_thinkpad', name: 'Lenovo ThinkPad X1 Carbon Gen 12', categoryId: 'cat_office', brand: 'Lenovo',
        price: 41990000, oldPrice: 0, stock: 4, rating: 4.8, sold: 41, featured: false,
        artColor: '#1e293b', badge: '',
        image: 'assets/img/products/p_thinkpad.jpg',
        specs: { cpu: 'Intel Core Ultra 7 165U', ram: '32GB LPDDR5x', ssd: '1TB NVMe', vga: 'Intel Graphics', screen: '14" WUXGA' },
        description: 'Bàn phím tốt nhất phân khúc, độ bền chuẩn quân đội, bảo mật vân tay và camera hồng ngoại.'
      },
      {
        id: 'p_macpro', name: 'MacBook Pro 14 M3 Pro', categoryId: 'cat_graphic', brand: 'Apple',
        price: 52990000, oldPrice: 56990000, stock: 6, rating: 4.9, sold: 88, featured: true,
        artColor: '#8b5cf6', badge: 'Pro',
        image: 'assets/img/products/p_macpro.jpg',
        specs: { cpu: 'Apple M3 Pro 11-core', ram: '18GB Unified', ssd: '512GB SSD', vga: 'GPU 14-core', screen: '14.2" Liquid Retina XDR' },
        description: 'Màn hình XDR 1600 nits, dựng phim 4K mượt mà, cổng HDMI và khe SD tiện dụng cho nhà sáng tạo.'
      },
      {
        id: 'p_zenbook', name: 'ASUS Zenbook 14 OLED', categoryId: 'cat_graphic', brand: 'ASUS',
        price: 26490000, oldPrice: 28990000, stock: 10, rating: 4.6, sold: 132, featured: false,
        artColor: '#14b8a6', badge: '',
        image: 'assets/img/products/p_zenbook.jpg',
        specs: { cpu: 'Intel Core Ultra 5 125H', ram: '16GB LPDDR5x', ssd: '512GB NVMe', vga: 'Intel Arc', screen: '14" 3K OLED 120Hz' },
        description: 'Màn hình OLED 3K rực rỡ, đạt 100% DCI-P3 — lựa chọn tuyệt vời cho thiết kế đồ họa tầm trung.'
      },
      {
        id: 'p_katana', name: 'MSI Katana 15 B13V', categoryId: 'cat_gaming', brand: 'MSI',
        price: 22990000, oldPrice: 25490000, stock: 11, rating: 4.4, sold: 78, featured: false,
        artColor: '#ef4444', badge: '',
        image: 'assets/img/products/p_katana.jpg',
        specs: { cpu: 'Intel Core i7-13620H', ram: '16GB DDR5', ssd: '512GB NVMe', vga: 'RTX 4060 8GB', screen: '15.6" FHD 144Hz' },
        description: 'RTX 4060 trong tầm giá 23 triệu, tản nhiệt Cooler Boost 5 với 2 quạt và 6 ống đồng.'
      },
      {
        id: 'p_u2723', name: 'Dell UltraSharp U2723QE 27" 4K', categoryId: 'cat_monitor', brand: 'Dell',
        price: 13990000, oldPrice: 15990000, stock: 7, rating: 4.8, sold: 57, featured: true,
        artColor: '#0ea5e9', badge: '',
        image: 'assets/img/products/p_u2723.jpg',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: 'IPS Black', screen: '27" 4K 60Hz, 98% DCI-P3' },
        description: 'Tấm nền IPS Black cho độ tương phản 2000:1, tích hợp hub USB-C 90W — chuẩn màn hình cho designer.'
      },
      {
        id: 'p_mxmaster', name: 'Logitech MX Master 3S', categoryId: 'cat_acc', brand: 'Logitech',
        price: 2490000, oldPrice: 2990000, stock: 25, rating: 4.9, sold: 412, featured: true,
        artColor: '#f59e0b', badge: 'Bán chạy',
        image: 'assets/img/products/p_mxmaster.jpg',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: '—', screen: 'Chuột không dây 8000 DPI' },
        description: 'Cảm biến 8000 DPI, cuộn MagSpeed siêu nhanh, kết nối 3 thiết bị. Chuột dành cho người làm việc chuyên nghiệp.'
      },
      {
        id: 'p_keychron', name: 'Keychron K8 Pro (Hot-swap)', categoryId: 'cat_acc', brand: 'Keychron',
        price: 2190000, oldPrice: 0, stock: 18, rating: 4.7, sold: 165, featured: false,
        artColor: '#8b5cf6', badge: '',
        image: 'assets/img/products/p_keychron.jpg',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: '—', screen: 'Bàn phím cơ TKL không dây' },
        description: 'Layout TKL, hot-swap thay switch không cần hàn, kết nối Bluetooth 5.1 và USB-C.'
      },
      {
        id: 'p_xm5', name: 'Sony WH-1000XM5', categoryId: 'cat_acc', brand: 'Sony',
        price: 6490000, oldPrice: 7990000, stock: 9, rating: 4.8, sold: 143, featured: false,
        artColor: '#334155', badge: 'Giảm giá',
        image: 'assets/img/products/p_xm5.jpg',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: '—', screen: 'Tai nghe chống ồn 30h pin' },
        description: 'Chống ồn chủ động hàng đầu, 8 micro, pin 30 giờ. Bạn đồng hành cho những chuyến bay dài.'
      },
      {
        id: 'p_990pro', name: 'Samsung 990 PRO 1TB NVMe', categoryId: 'cat_part', brand: 'Samsung',
        price: 2790000, oldPrice: 3290000, stock: 30, rating: 4.9, sold: 268, featured: false,
        artColor: '#22c55e', badge: '',
        image: 'assets/img/products/p_990pro.jpg',
        specs: { cpu: '—', ram: '—', ssd: '1TB PCIe 4.0, 7450MB/s', vga: '—', screen: '—' },
        description: 'Tốc độ đọc 7450MB/s, bảo hành 5 năm chính hãng. Nâng cấp ổ cứng nhanh nhất cho laptop của bạn.'
      },
      {
        id: 'p_anker', name: 'Anker 737 Power Bank 24000mAh 140W', categoryId: 'cat_acc', brand: 'Anker',
        price: 3290000, oldPrice: 3790000, stock: 16, rating: 4.7, sold: 91, featured: false,
        artColor: '#06b6d4', badge: '',
        image: 'assets/img/products/p_anker.jpg',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: '—', screen: 'Pin dự phòng 140W, màn hình LCD' },
        description: 'Sạc được cả MacBook Pro 14 ở công suất 140W, màn hình hiển thị công suất thời gian thực.'
      },
      {
        id: 'p_ram', name: 'Kingston Fury 16GB DDR5 5600', categoryId: 'cat_part', brand: 'Kingston',
        price: 1590000, oldPrice: 1890000, stock: 40, rating: 4.6, sold: 187, featured: false,
        artColor: '#f97316', badge: '',
        image: 'assets/img/products/p_ram.jpg',
        specs: { cpu: '—', ram: '16GB DDR5 5600MHz SO-DIMM', ssd: '—', vga: '—', screen: '—' },
        description: 'Nâng cấp RAM cho laptop gaming và workstation. Tương thích DDR5 SO-DIMM, bảo hành 3 năm.'
      },

      /* ---------- Bổ sung 2026: Laptop gaming ---------- */
      {
        id: 'p_helios', name: 'Acer Predator Helios Neo 16', categoryId: 'cat_gaming', brand: 'Acer',
        price: 38990000, oldPrice: 42990000, stock: 7, rating: 4.8, sold: 58, featured: true,
        artColor: '#6366f1', badge: 'Mới',
        image: 'assets/img/products/p_helios.jpg',
        specs: { cpu: 'Intel Core i7-14700HX', ram: '16GB DDR5 5600MHz', ssd: '1TB PCIe 4.0', vga: 'RTX 4060 8GB', screen: '16" WQXGA 165Hz' },
        description: 'Màn hình 2.5K 165Hz phủ 100% sRGB, tản nhiệt AeroBlade 3D thế hệ 5 với hai quạt kim loại mỏng 0.08mm.'
      },
      {
        id: 'p_victus', name: 'HP Victus 16 (16-r0078TX)', categoryId: 'cat_gaming', brand: 'HP',
        price: 23490000, oldPrice: 25990000, stock: 18, rating: 4.4, sold: 176, featured: false,
        artColor: '#0ea5e9', badge: 'Giá tốt',
        image: 'assets/img/products/p_victus.jpg',
        specs: { cpu: 'Intel Core i7-13620H', ram: '16GB DDR5 5200MHz', ssd: '512GB NVMe', vga: 'RTX 4050 6GB', screen: '16.1" FHD 144Hz' },
        description: 'Bàn phím full-size có numpad, tản nhiệt 4 ống đồng. Cân bằng tốt giữa hiệu năng và giá thành cho sinh viên.'
      },
      {
        id: 'p_aorus', name: 'Gigabyte AORUS 15X (BXF)', categoryId: 'cat_gaming', brand: 'Gigabyte',
        price: 45990000, oldPrice: 49990000, stock: 3, rating: 4.7, sold: 27, featured: false,
        artColor: '#f43f5e', badge: 'Cao cấp',
        image: 'assets/img/products/p_aorus.jpg',
        specs: { cpu: 'Intel Core i7-13700HX', ram: '16GB DDR5 4800MHz', ssd: '1TB PCIe 4.0', vga: 'RTX 4070 8GB', screen: '15.6" QHD 165Hz' },
        description: 'RTX 4070 full power 140W, màn hình QHD 165Hz chuẩn màu, hỗ trợ MUX Switch chuyển chế độ GPU trực tiếp.'
      },
      {
        id: 'p_g15', name: 'Dell G15 5530', categoryId: 'cat_gaming', brand: 'Dell',
        price: 26990000, oldPrice: 29490000, stock: 11, rating: 4.5, sold: 143, featured: false,
        artColor: '#22c55e', badge: '',
        image: 'assets/img/products/p_g15.jpg',
        specs: { cpu: 'Intel Core i7-13650HX', ram: '16GB DDR5 4800MHz', ssd: '512GB NVMe', vga: 'RTX 4050 6GB', screen: '15.6" FHD 120Hz' },
        description: 'Thiết kế Alienware-inspired, hệ thống tản nhiệt buồng hơi kép, bảo hành chính hãng 24 tháng.'
      },

      /* ---------- Bổ sung 2026: Laptop văn phòng ---------- */
      {
        id: 'p_pavilion', name: 'HP Pavilion 15 (eg2045TU)', categoryId: 'cat_office', brand: 'HP',
        price: 15990000, oldPrice: 17490000, stock: 22, rating: 4.3, sold: 264, featured: false,
        artColor: '#0ea5e9', badge: 'Bán chạy',
        image: 'assets/img/products/p_pavilion.jpg',
        specs: { cpu: 'Intel Core i5-1235U', ram: '16GB DDR4 3200MHz', ssd: '512GB NVMe', vga: 'Intel Iris Xe', screen: '15.6" FHD IPS' },
        description: 'Vỏ nhôm sang trọng, bàn phím có đèn nền, pin 41Wh dùng thoải mái một ngày làm việc.'
      },
      {
        id: 'p_vivobook', name: 'ASUS Vivobook 15 OLED (A1505VA)', categoryId: 'cat_office', brand: 'ASUS',
        price: 18490000, oldPrice: 20490000, stock: 15, rating: 4.6, sold: 198, featured: true,
        artColor: '#14b8a6', badge: 'OLED',
        image: 'assets/img/products/p_vivobook.jpg',
        specs: { cpu: 'Intel Core i5-13500H', ram: '16GB DDR4 3200MHz', ssd: '512GB NVMe', vga: 'Intel Iris Xe', screen: '15.6" FHD OLED' },
        description: 'Màn hình OLED 600 nits chuẩn màu Pantone, bản lề 180 độ, bàn phím êm phù hợp gõ văn bản dài.'
      },
      {
        id: 'p_aspire', name: 'Acer Aspire 3 (A315-59)', categoryId: 'cat_office', brand: 'Acer',
        price: 11290000, oldPrice: 12990000, stock: 30, rating: 4.2, sold: 412, featured: false,
        artColor: '#f59e0b', badge: 'Rẻ nhất',
        image: 'assets/img/products/p_aspire.jpg',
        specs: { cpu: 'Intel Core i3-1215U', ram: '8GB DDR4 3200MHz', ssd: '256GB NVMe', vga: 'Intel UHD', screen: '15.6" FHD' },
        description: 'Lựa chọn tiết kiệm cho học sinh – sinh viên: đủ dùng Office, học online, giải trí nhẹ. Dễ nâng cấp RAM và SSD.'
      },
      {
        id: 'p_surface', name: 'Microsoft Surface Laptop 7 (13.8")', categoryId: 'cat_office', brand: 'Microsoft',
        price: 34990000, oldPrice: 37990000, stock: 6, rating: 4.7, sold: 73, featured: true,
        artColor: '#64748b', badge: 'Mỏng nhẹ',
        image: 'assets/img/products/p_surface.jpg',
        specs: { cpu: 'Snapdragon X Elite', ram: '16GB LPDDR5x', ssd: '512GB NVMe', vga: 'Adreno GPU', screen: '13.8" PixelSense 120Hz' },
        description: 'Màn hình cảm ứng 120Hz, pin lên tới 20 giờ, hoàn toàn không quạt. Bản lề mở bằng một tay rất chắc chắn.'
      },

      /* ---------- Bổ sung 2026: Laptop đồ họa ---------- */
      {
        id: 'p_creator', name: 'MSI Creator Z16 HX Studio', categoryId: 'cat_graphic', brand: 'MSI',
        price: 62990000, oldPrice: 68990000, stock: 2, rating: 4.8, sold: 19, featured: false,
        artColor: '#8b5cf6', badge: 'Workstation',
        image: 'assets/img/products/p_creator.jpg',
        specs: { cpu: 'Intel Core i9-13980HX', ram: '32GB DDR5 5600MHz', ssd: '1TB PCIe 4.0', vga: 'RTX 4070 8GB', screen: '16" QHD+ 120Hz' },
        description: 'Chuẩn màu 100% DCI-P3 đã hiệu chuẩn từ nhà máy, kèm bút cảm ứng MSI Pen 2. Dành cho dựng phim và 3D chuyên nghiệp.'
      },
      {
        id: 'p_proart', name: 'ASUS ProArt Studiobook 16 OLED', categoryId: 'cat_graphic', brand: 'ASUS',
        price: 47990000, oldPrice: 52990000, stock: 4, rating: 4.7, sold: 34, featured: true,
        artColor: '#f43f5e', badge: 'Đồ họa',
        image: 'assets/img/products/p_proart.jpg',
        specs: { cpu: 'Intel Core i9-13980HX', ram: '32GB DDR5', ssd: '1TB PCIe 4.0', vga: 'RTX 4070 8GB', screen: '16" 3.2K OLED 120Hz' },
        description: 'Núm xoay ASUS Dial vật lý điều khiển trực tiếp Photoshop, màn hình OLED 3.2K chuẩn màu Delta-E < 1.'
      },

      /* ---------- Bổ sung 2026: Màn hình ---------- */
      {
        id: 'p_ultragear', name: 'LG UltraGear 27GP850-B', categoryId: 'cat_monitor', brand: 'LG',
        price: 8990000, oldPrice: 10490000, stock: 12, rating: 4.8, sold: 96, featured: true,
        artColor: '#f43f5e', badge: 'Gaming',
        image: 'assets/img/products/p_ultragear.jpg',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: '—', screen: '27" QHD Nano IPS 165Hz 1ms' },
        description: 'Tấm nền Nano IPS phủ 98% DCI-P3, tương thích G-Sync & FreeSync Premium. Chân đế xoay dọc, nâng hạ linh hoạt.'
      },
      {
        id: 'p_odyssey', name: 'Samsung Odyssey G5 27" (G55C)', categoryId: 'cat_monitor', brand: 'Samsung',
        price: 6290000, oldPrice: 7490000, stock: 16, rating: 4.5, sold: 187, featured: false,
        artColor: '#0ea5e9', badge: '',
        image: 'assets/img/products/p_odyssey.jpg',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: '—', screen: '27" QHD VA cong 1000R 165Hz' },
        description: 'Màn hình cong 1000R ôm tầm mắt, độ tương phản 2500:1 cho màu đen sâu, hỗ trợ HDR10.'
      },
      {
        id: 'p_pa278qv', name: 'ASUS ProArt PA278QV 27"', categoryId: 'cat_monitor', brand: 'ASUS',
        price: 7490000, oldPrice: 8290000, stock: 9, rating: 4.7, sold: 61, featured: false,
        artColor: '#14b8a6', badge: 'Chuẩn màu',
        image: 'assets/img/products/p_pa278qv.jpg',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: '—', screen: '27" WQHD IPS 75Hz 100% sRGB' },
        description: 'Hiệu chuẩn Delta-E < 2, phủ 100% sRGB và Rec.709. Có cổng USB hub và chân đế xoay dọc cho dân thiết kế.'
      },

      /* ---------- Bổ sung 2026: Phụ kiện ---------- */
      {
        id: 'p_g502', name: 'Logitech G502 X Plus', categoryId: 'cat_acc', brand: 'Logitech',
        price: 3290000, oldPrice: 3690000, stock: 20, rating: 4.8, sold: 154, featured: true,
        artColor: '#6366f1', badge: 'Hot',
        image: 'assets/img/products/p_g502.jpg',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: '—', screen: 'Chuột không dây, cảm biến HERO 25K' },
        description: 'Cảm biến HERO 25K, switch lai quang-cơ, đèn RGB LIGHTSYNC. Pin dùng liên tục 120 giờ khi tắt đèn.'
      },
      {
        id: 'p_blackwidow', name: 'Razer BlackWidow V4 Pro', categoryId: 'cat_acc', brand: 'Razer',
        price: 4490000, oldPrice: 4990000, stock: 10, rating: 4.6, sold: 88, featured: false,
        artColor: '#22c55e', badge: '',
        image: 'assets/img/products/p_blackwidow.jpg',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: '—', screen: 'Bàn phím cơ full-size, switch Green' },
        description: 'Núm xoay đa năng, 8 phím macro, kê tay nam châm có đèn nền. Switch Razer Green gõ giòn, bền 80 triệu lần nhấn.'
      },
      {
        id: 'p_airpods', name: 'Apple AirPods Pro 2 (USB-C)', categoryId: 'cat_acc', brand: 'Apple',
        price: 5490000, oldPrice: 6190000, stock: 25, rating: 4.9, sold: 327, featured: true,
        artColor: '#94a3b8', badge: 'Bán chạy',
        image: 'assets/img/products/p_airpods.jpg',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: '—', screen: 'Tai nghe TWS, chống ồn chủ động' },
        description: 'Chip H2, chống ồn chủ động gấp đôi thế hệ trước, xuyên âm thích ứng, chống nước IP54. Hộp sạc USB-C.'
      },
      {
        id: 'p_jbl', name: 'JBL Tune 770NC', categoryId: 'cat_acc', brand: 'JBL',
        price: 2190000, oldPrice: 2590000, stock: 28, rating: 4.5, sold: 213, featured: false,
        artColor: '#f59e0b', badge: '',
        image: 'assets/img/products/p_jbl.jpg',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: '—', screen: 'Tai nghe over-ear, chống ồn chủ động' },
        description: 'Pin 70 giờ, sạc nhanh 5 phút dùng 3 giờ. Âm bass JBL Pure Bass đặc trưng, gập gọn tiện mang theo.'
      },
      {
        id: 'p_charger', name: 'Anker 67W GaN 3 cổng', categoryId: 'cat_acc', brand: 'Anker',
        price: 890000, oldPrice: 1090000, stock: 45, rating: 4.7, sold: 386, featured: false,
        artColor: '#06b6d4', badge: 'Nhỏ gọn',
        image: 'assets/img/products/p_charger.jpg',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: '—', screen: 'Củ sạc GaN 67W, 2×USB-C + 1×USB-A' },
        description: 'Công nghệ GaN II nhỏ hơn 40% so với sạc thường. Sạc được laptop, điện thoại và tai nghe cùng lúc.'
      },
      {
        id: 'p_stand', name: 'Đế tản nhiệt laptop 6 quạt RGB', categoryId: 'cat_acc', brand: 'CoolCold',
        price: 450000, oldPrice: 590000, stock: 60, rating: 4.3, sold: 512, featured: false,
        artColor: '#8b5cf6', badge: '',
        image: 'assets/img/products/p_stand.jpg',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: '—', screen: 'Đế tản nhiệt 6 quạt, 5 mức độ cao' },
        description: '6 quạt gió 70mm, đèn LED RGB, 5 nấc điều chỉnh độ cao. Phù hợp laptop 14" – 17.3", giảm 5–8°C khi chơi game.'
      },

      /* ---------- Bổ sung 2026: Linh kiện ---------- */
      {
        id: 'p_sn850x', name: 'WD Black SN850X 2TB', categoryId: 'cat_part', brand: 'Western Digital',
        price: 4290000, oldPrice: 4890000, stock: 14, rating: 4.9, sold: 142, featured: true,
        artColor: '#1e293b', badge: 'Tốc độ cao',
        image: 'assets/img/products/p_sn850x.jpg',
        specs: { cpu: '—', ram: '—', ssd: '2TB PCIe 4.0 NVMe, 7300MB/s', vga: '—', screen: '—' },
        description: 'Đọc tuần tự 7300MB/s, chuẩn PCIe 4.0, tản nhiệt tích hợp. Chuẩn mực SSD cho máy trạm và PS5.'
      },
      {
        id: 'p_crucial', name: 'Crucial P3 Plus 1TB', categoryId: 'cat_part', brand: 'Crucial',
        price: 1590000, oldPrice: 1890000, stock: 35, rating: 4.6, sold: 298, featured: false,
        artColor: '#0ea5e9', badge: 'Giá tốt',
        image: 'assets/img/products/p_crucial.jpg',
        specs: { cpu: '—', ram: '—', ssd: '1TB PCIe 4.0 NVMe, 5000MB/s', vga: '—', screen: '—' },
        description: 'Hiệu năng PCIe 4.0 với mức giá phổ thông, bảo hành 5 năm. Nâng cấp dễ dàng cho mọi laptop có khe M.2.'
      },
      {
        id: 'p_vengeance', name: 'Corsair Vengeance 32GB DDR5 6000', categoryId: 'cat_part', brand: 'Corsair',
        price: 2890000, oldPrice: 3290000, stock: 18, rating: 4.7, sold: 117, featured: false,
        artColor: '#f97316', badge: '',
        image: 'assets/img/products/p_vengeance.jpg',
        specs: { cpu: '—', ram: '32GB (2×16GB) DDR5 6000MHz', ssd: '—', vga: '—', screen: '—' },
        description: 'Kit 2 thanh, hỗ trợ Intel XMP 3.0 và AMD EXPO. Tản nhiệt nhôm thấp, không vướng tản nhiệt CPU.'
      },
      {
        id: 'p_kryonaut', name: 'Thermal Grizzly Kryonaut 1g', categoryId: 'cat_part', brand: 'Thermal Grizzly',
        price: 320000, oldPrice: 390000, stock: 80, rating: 4.8, sold: 74, featured: false,
        artColor: '#8b5cf6', badge: '',
        image: '',
        specs: { cpu: '—', ram: '—', ssd: '—', vga: '—', screen: 'Keo tản nhiệt, 12.5 W/mK' },
        description: 'Độ dẫn nhiệt 12.5 W/mK, không dẫn điện nên an toàn tuyệt đối. Tuýp 1g dùng được 4–6 lần tra cho laptop.'
      }
    ];

    var services = [
      { id: 's_vs', name: 'Vệ sinh & tra keo tản nhiệt', type: 'repair', price: 250000, duration: '45 phút', icon: 'fan', description: 'Tháo máy, vệ sinh quạt và lá tản nhiệt, tra keo tản nhiệt cao cấp. Giảm 5–10°C nhiệt độ CPU.' },
      { id: 's_win', name: 'Cài đặt Windows & driver', type: 'repair', price: 200000, duration: '60 phút', icon: 'disk', description: 'Cài Windows bản quyền, driver chính hãng, phần mềm văn phòng cơ bản. Giữ nguyên dữ liệu ổ D.' },
      { id: 's_ssd', name: 'Nâng cấp SSD / RAM', type: 'repair', price: 150000, duration: '30 phút', icon: 'chip', description: 'Tư vấn và lắp đặt SSD, RAM tương thích. Miễn phí công lắp khi mua linh kiện tại AZmobile.' },
      { id: 's_screen', name: 'Thay màn hình laptop', type: 'repair', price: 1200000, duration: '1–2 ngày', icon: 'monitor', description: 'Thay panel chính hãng, đúng độ phân giải và tần số quét. Báo giá trước khi thực hiện.' },
      { id: 's_keyboard', name: 'Thay bàn phím / pin', type: 'repair', price: 850000, duration: '1–2 ngày', icon: 'keyboard', description: 'Linh kiện chính hãng, bảo hành 6 tháng cho linh kiện thay thế.' },
      { id: 's_bh', name: 'Gói bảo hành 12 tháng', type: 'warranty', price: 990000, duration: '12 tháng', icon: 'shield', description: 'Bảo hành mở rộng 12 tháng: lỗi phần cứng, hỗ trợ 1 đổi 1 trong 30 ngày đầu, không giới hạn số lần.' },
      { id: 's_bh24', name: 'Gói bảo hành 24 tháng VIP', type: 'warranty', price: 1690000, duration: '24 tháng', icon: 'crown', description: 'Bảo hành 24 tháng, thu máy tận nơi nội thành, máy dự phòng miễn phí khi sửa trên 3 ngày.' },
      { id: 's_care', name: 'Gói chăm sóc toàn diện', type: 'warranty', price: 1290000, duration: '12 tháng', icon: 'heart', description: 'Bảo hành + 4 lần vệ sinh máy miễn phí/năm + cứu dữ liệu cơ bản + ưu tiên xử lý trong 24h.' }
    ];

    var users = [
      {
        id: 'u_admin', name: 'Quản trị viên', email: 'admin@azmobile.vn', phone: '0901234567',
        password: hash('admin123'), role: 'admin', createdAt: t
      },
      {
        id: 'u_demo', name: 'Nguyễn Văn An', email: 'khach@azmobile.vn', phone: '0912345678',
        password: hash('123456'), role: 'customer', createdAt: t
      }
    ];

    var orders = [
      {
        id: 'o_1', code: 'AZM1024', userId: 'u_demo', customer: { name: 'Nguyễn Văn An', phone: '0912345678', address: '12 Nguyễn Huệ, Q.1, TP.HCM', note: '' },
        items: [{ productId: 'p_macair', name: 'MacBook Air 13 M3', price: 27990000, qty: 1 }],
        subtotal: 27990000, ship: 0, total: 27990000, payment: 'cod', status: 'completed', createdAt: '2026-08-14T09:20:00.000Z'
      },
      {
        id: 'o_2', code: 'AZM1025', userId: 'u_demo', customer: { name: 'Nguyễn Văn An', phone: '0912345678', address: '12 Nguyễn Huệ, Q.1, TP.HCM', note: 'Giao giờ hành chính' },
        items: [
          { productId: 'p_mxmaster', name: 'Logitech MX Master 3S', price: 2490000, qty: 1 },
          { productId: 'p_keychron', name: 'Keychron K8 Pro (Hot-swap)', price: 2190000, qty: 1 }
        ],
        subtotal: 4680000, ship: 0, total: 4680000, payment: 'bank', status: 'shipping', createdAt: '2026-09-02T14:05:00.000Z'
      },
      {
        id: 'o_3', code: 'AZM1026', userId: null, customer: { name: 'Trần Thị Bích', phone: '0987654321', address: '45 Lê Lợi, Hải Châu, Đà Nẵng', note: '' },
        items: [{ productId: 'p_rog', name: 'ASUS ROG Strix G16 (2024)', price: 32990000, qty: 1 }],
        subtotal: 32990000, ship: 0, total: 32990000, payment: 'cod', status: 'pending', createdAt: '2026-09-21T10:41:00.000Z'
      },
      {
        id: 'o_4', code: 'AZM1027', userId: null, customer: { name: 'Lê Minh Quân', phone: '0938111222', address: '88 Trần Duy Hưng, Cầu Giấy, Hà Nội', note: 'Xuất hóa đơn công ty' },
        items: [{ productId: 'p_990pro', name: 'Samsung 990 PRO 1TB NVMe', price: 2790000, qty: 2 }],
        subtotal: 5580000, ship: 0, total: 5580000, payment: 'bank', status: 'completed', createdAt: '2026-10-03T08:15:00.000Z'
      },
      {
        id: 'o_5', code: 'AZM1028', userId: null, customer: { name: 'Phạm Thu Hà', phone: '0905556677', address: '3 Pasteur, Q.3, TP.HCM', note: '' },
        items: [{ productId: 'p_zenbook', name: 'ASUS Zenbook 14 OLED', price: 26490000, qty: 1 }],
        subtotal: 26490000, ship: 0, total: 26490000, payment: 'cod', status: 'cancelled', createdAt: '2026-10-11T16:30:00.000Z'
      },
      {
        id: 'o_6', code: 'AZM1029', userId: null, customer: { name: 'Đỗ Hoàng Nam', phone: '0977223344', address: '21 Hùng Vương, Ninh Kiều, Cần Thơ', note: '' },
        items: [{ productId: 'p_nitro', name: 'Acer Nitro V15', price: 21490000, qty: 1 }],
        subtotal: 21490000, ship: 0, total: 21490000, payment: 'bank', status: 'completed', createdAt: '2026-10-18T11:00:00.000Z'
      }
    ];

    var bookings = [
      { id: 'b_1', userId: 'u_demo', serviceId: 's_vs', name: 'Nguyễn Văn An', phone: '0912345678', device: 'MacBook Air M3', issue: 'Máy nóng và quạt kêu to', date: '2026-10-25', status: 'confirmed', createdAt: '2026-10-20T09:00:00.000Z' },
      { id: 'b_2', userId: null, serviceId: 's_screen', name: 'Vũ Thanh Tùng', phone: '0966778899', device: 'Dell XPS 13', issue: 'Màn hình bị sọc dọc', date: '2026-10-24', status: 'pending', createdAt: '2026-10-21T15:20:00.000Z' }
    ];

    var posts = [
      {
        id: 'post_gaming',
        title: 'Cách chọn laptop gaming phù hợp ngân sách',
        slug: 'cach-chon-laptop-gaming-phu-hop-ngan-sach',
        category: 'Tư vấn',
        author: 'AZmobile',
        cover: 'assets/img/products/p_rog.jpg',
        excerpt: 'Card đồ hoạ, CPU hay màn hình — đâu mới là thứ quyết định trải nghiệm chơi game? Bài viết chia ngân sách thành 3 nhóm để bạn chọn đúng ngay từ đầu.',
        content: 'Khi mua laptop gaming, rất nhiều người chỉ nhìn vào card đồ hoạ rồi bỏ qua hai yếu tố quan trọng không kém là tản nhiệt và màn hình.\n\nVới ngân sách dưới 25 triệu, bạn nên ưu tiên RTX 4050 cùng một bộ tản nhiệt tốt thay vì cố lấy RTX 4060 trên một thân máy mỏng manh. Hiệu năng thực tế khi chơi lâu sẽ do khả năng giữ xung nhịp quyết định, không phải thông số trên giấy.\n\nTừ 25 đến 35 triệu là khoảng ngọt nhất. Ở tầm này bạn có RTX 4060, màn hình 165Hz và bộ nhớ DDR5 — đủ thoải mái cho cả game AAA lẫn dựng video cơ bản.\n\nTrên 35 triệu, hãy chú ý đến chất lượng màn hình: độ phủ màu, độ sáng và tần số quét. Đây là phần bạn nhìn thấy mỗi ngày, nâng cấp sau gần như không thể.',
        status: 'published',
        publishedAt: '2026-10-18T08:00:00.000Z',
        createdAt: '2026-10-18T08:00:00.000Z',
        seo: { title: '', description: '', keywords: 'laptop gaming, chọn laptop gaming, RTX 4060', image: '', canonical: '', noindex: false }
      },
      {
        id: 'post-ssd',
        title: 'Nên nâng RAM hay SSD trước để máy nhanh hơn?',
        slug: 'nen-nang-ram-hay-ssd-truoc',
        category: 'Thủ thuật',
        author: 'AZmobile',
        cover: 'assets/img/products/p_macair.jpg',
        excerpt: 'Máy chậm, mở ứng dụng lâu, hay giật khi mở nhiều tab? Hai nâng cấp phổ biến nhất có tác dụng rất khác nhau — chọn sai là tiền mất mà máy vẫn chậm.',
        content: 'Nếu máy bạn khởi động chậm, mở phần mềm mất vài chục giây, sao chép file lớn rất lâu thì nút thắt nằm ở ổ cứng. Nâng lên SSD NVMe là thay đổi rõ rệt nhất, thường nhanh hơn 5 đến 10 lần so với ổ cơ.\n\nNgược lại, nếu máy chạy ổn nhưng cứ mở trên 10 tab trình duyệt là đơ, hoặc chuyển qua lại giữa Photoshop và Chrome là giật, thì bạn đang thiếu RAM. Máy chỉ có 8GB mà dùng Windows 11 thì gần như chắc chắn phải nâng.\n\nThứ tự ưu tiên thực tế: SSD trước nếu máy còn dùng ổ cơ, RAM trước nếu máy đã có SSD nhưng chỉ 8GB.\n\nLưu ý khi nâng cấp: kiểm tra máy có khe RAM trống hay không, và bộ nhớ đã hàn chết chưa. Nhiều mẫu laptop mỏng nhẹ hiện nay hàn cứng cả RAM lẫn SSD nên không nâng được.',
        status: 'published',
        publishedAt: '2026-10-12T08:00:00.000Z',
        createdAt: '2026-10-12T08:00:00.000Z',
        seo: { title: '', description: '', keywords: 'nâng RAM, nâng SSD, laptop chậm', image: '', canonical: '', noindex: false }
      },
      {
        id: 'post-baohanh',
        title: 'Bảo hành laptop: 5 điều cần kiểm tra trước khi ký nhận',
        slug: 'bao-hanh-laptop-5-dieu-can-kiem-tra',
        category: 'Bảo hành',
        author: 'AZmobile',
        cover: 'assets/img/products/p_xps.jpg',
        excerpt: 'Nhận máy về sau bảo hành mà vẫn lỗi? Phần lớn xuất phát từ việc không kiểm tra kỹ ngay tại cửa hàng. Đây là danh sách 5 bước nên làm.',
        content: 'Thứ nhất, yêu cầu ghi rõ tình trạng máy trước khi nhận: tem niêm phong, số serial và các vết trầy đã có sẵn. Chụp ảnh lại ngay tại quầy.\n\nThứ hai, bật máy và kiểm tra đủ cổng: USB, HDMI, tai nghe, sạc. Lỗi cổng thường không lộ ra khi chỉ nhìn bề ngoài.\n\nThứ ba, chạy thử màn hình bằng một ảnh nền trắng và một ảnh nền đen để phát hiện điểm chết và ám màu.\n\nThứ tư, kiểm tra pin: xem dung lượng thiết kế còn bao nhiêu so với ban đầu. Pin chai là bộ phận hay bị từ chối bảo hành nhất.\n\nThứ năm, giữ lại phiếu bảo hành có dấu và ngày rõ ràng. Đây là căn cứ duy nhất khi phát sinh tranh chấp.',
        status: 'published',
        publishedAt: '2026-10-05T08:00:00.000Z',
        createdAt: '2026-10-05T08:00:00.000Z',
        seo: { title: '', description: '', keywords: 'bảo hành laptop, kiểm tra laptop', image: '', canonical: '', noindex: false }
      }
    ];

    return {
      version: 2,
      seedVersion: SEED_VERSION,
      users: users,
      categories: categories,
      products: products,
      services: services,
      orders: orders,
      bookings: bookings,
      posts: posts,
      settings: {
        siteName: 'AZmobile',
        hotline: '1900 6868',
        email: 'hotro@azmobile.vn',
        address: '123 Nguyễn Trãi, Q.5, TP.HCM',
        openHours: '08:00 – 21:00 (T2 – CN)',
        seo: {
          baseUrl: 'https://toiecdn.id.vn',
          titleTemplate: '{page} | {site}',
          defaultTitle: 'AZmobile — Laptop, phụ kiện, sửa chữa & bảo hành chính hãng',
          defaultDescription: 'AZmobile - hệ thống bán lẻ laptop gaming, văn phòng, đồ họa và phụ kiện chính hãng. Trung tâm sửa chữa, bảo hành uy tín, giá minh bạch, trả góp 0%.',
          defaultKeywords: 'laptop, laptop gaming, laptop văn phòng, laptop đồ họa, phụ kiện laptop, sửa chữa laptop, bảo hành laptop',
          defaultImage: 'assets/img/products/p_rog.jpg',
          robots: 'index,follow',
          twitterHandle: '',
          sitemapProducts: true,
          sitemapPosts: true
        },
        facebook: {
          appId: '',
          pageUrl: 'https://www.facebook.com/azmobile',
          pixelId: '',
          messengerUrl: '',
          domainVerification: '',
          ogType: 'website',
          locale: 'vi_VN',
          pixelEnabled: false
        }
      },
      createdAt: t
    };
  }

  /* ---------------- Đọc / Ghi ---------------- */
  var state = null;

  function load() {
    try {
      var raw = localStorage.getItem(DB_KEY);
      if (!raw) {
        state = seedData();
        persist();
        return state;
      }
      var parsed = JSON.parse(raw);
      // Bổ sung các khoá còn thiếu (an toàn khi nâng cấp phiên bản)
      // Lưu ý: KHÔNG điền seedVersion ở đây, nếu không migrateSeed() sẽ tưởng
      // dữ liệu đã mới nhất và bỏ qua việc bổ sung sản phẩm mới.
      var base = seedData();
      Object.keys(base).forEach(function (k) {
        if (k === 'seedVersion') return;
        if (parsed[k] === undefined) parsed[k] = base[k];
      });
      state = parsed;
      return state;
    } catch (e) {
      console.warn('[AZmobile] Không đọc được dữ liệu, khởi tạo lại.', e);
      state = seedData();
      persist();
      return state;
    }
  }

  /* Bổ sung cấu trúc SEO / Facebook cho dữ liệu được tạo từ phiên bản cũ.
     Chạy mỗi lần tải trang nhưng chỉ ghi lại khi thực sự có thay đổi. */
  function ensureSeoShape() {
    if (!state || !state.settings) return;
    var base = seedData().settings;
    var changed = false;

    ['seo', 'facebook'].forEach(function (key) {
      if (!state.settings[key]) {
        state.settings[key] = clone(base[key]);
        changed = true;
        return;
      }
      Object.keys(base[key]).forEach(function (k) {
        if (state.settings[key][k] === undefined) {
          state.settings[key][k] = base[key][k];
          changed = true;
        }
      });
    });

    (state.products || []).forEach(function (p) {
      if (!p.seo) {
        p.seo = { title: '', description: '', keywords: '', image: '', canonical: '', noindex: false };
        changed = true;
      }
      if (!p.slug) { p.slug = slugify(p.name || ''); changed = true; }
    });

    if (changed) persist();
  }

  /* Bổ sung danh mục / sản phẩm mẫu mới vào dữ liệu đã có (giữ nguyên đơn hàng, user…) */
  function migrateSeed() {
    if (!state) return;
    ensureSeoShape();
    if (state.seedVersion === SEED_VERSION) return;
    var base = seedData();
    var added = 0;

    (base.categories || []).forEach(function (c) {
      if (!state.categories.some(function (x) { return x.id === c.id; })) {
        state.categories.push(c);
        added++;
      }
    });
    (base.products || []).forEach(function (p) {
      if (!state.products.some(function (x) { return x.id === p.id; })) {
        state.products.push(p);
        added++;
      }
    });
    // Điền ảnh cho sản phẩm mẫu cũ chưa có ảnh (chỉ khi người dùng chưa tự đặt ảnh)
    (base.products || []).forEach(function (bp) {
      var mine = state.products.find(function (x) { return x.id === bp.id; });
      if (mine && !mine.image && bp.image) mine.image = bp.image;
    });

    state.seedVersion = SEED_VERSION;
    persist();
    if (added) console.info('[AZmobile] Đã bổ sung ' + added + ' mục mới từ dữ liệu mẫu.');
  }

  function persist() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('[AZmobile] Không ghi được dữ liệu (có thể bộ nhớ đầy).', e);
    }
  }

  function db() {
    if (!state) { load(); migrateSeed(); }
    return state;
  }

  function save() {
    persist();
  }

  /* ---------------- Truy vấn ---------------- */
  var api = {
    uid: uid,
    nowISO: nowISO,
    hash: hash,
    db: db,
    save: save,
    reset: function () {
      localStorage.removeItem(DB_KEY);
      localStorage.removeItem(SESSION_KEY);
      if (global.AZCART && AZCART.clearAll) AZCART.clearAll();
      state = null;
      load();
    },

    /* --- Danh mục --- */
    categories: function () {
      return clone(db().categories);
    },
    categoryById: function (id) {
      return clone(db().categories.find(function (c) { return c.id === id; }) || null);
    },
    addCategory: function (data) {
      var c = {
        id: uid('cat'),
        name: (data.name || '').trim(),
        slug: (data.slug || '').trim() || slugify(data.name || ''),
        icon: data.icon || 'box',
        color: data.color || '#2563eb',
        description: (data.description || '').trim()
      };
      if (!c.name) throw new Error('Tên danh mục không được để trống.');
      var dup = db().categories.some(function (x) { return x.name.toLowerCase() === c.name.toLowerCase(); });
      if (dup) throw new Error('Danh mục "' + c.name + '" đã tồn tại.');
      db().categories.push(c);
      save();
      return clone(c);
    },
    updateCategory: function (id, data) {
      var c = db().categories.find(function (x) { return x.id === id; });
      if (!c) throw new Error('Không tìm thấy danh mục.');
      if (data.name !== undefined) c.name = data.name.trim();
      if (data.description !== undefined) c.description = data.description.trim();
      if (data.icon !== undefined) c.icon = data.icon;
      if (data.color !== undefined) c.color = data.color;
      save();
      return clone(c);
    },
    deleteCategory: function (id) {
      var used = db().products.filter(function (p) { return p.categoryId === id; }).length;
      if (used > 0) throw new Error('Không thể xóa: danh mục đang chứa ' + used + ' sản phẩm. Hãy chuyển hoặc xóa sản phẩm trước.');
      db().categories = db().categories.filter(function (c) { return c.id !== id; });
      save();
      return true;
    },

    /* --- Sản phẩm --- */
    products: function () {
      return clone(db().products);
    },
    productById: function (id) {
      return clone(db().products.find(function (p) { return p.id === id; }) || null);
    },
    addProduct: function (data) {
      var p = normalizeProduct(data);
      p.id = uid('p');
      p.sold = 0;
      p.createdAt = nowISO();
      db().products.unshift(p);
      save();
      return clone(p);
    },
    updateProduct: function (id, data) {
      var p = db().products.find(function (x) { return x.id === id; });
      if (!p) throw new Error('Không tìm thấy sản phẩm.');
      var n = normalizeProduct(data);
      Object.keys(n).forEach(function (k) { p[k] = n[k]; });
      save();
      return clone(p);
    },
    deleteProduct: function (id) {
      db().products = db().products.filter(function (p) { return p.id !== id; });
      save();
      return true;
    },
    adjustStock: function (id, delta) {
      var p = db().products.find(function (x) { return x.id === id; });
      if (!p) return;
      p.stock = Math.max(0, (p.stock || 0) + delta);
      save();
    },

    /* --- Dịch vụ --- */
    services: function () {
      return clone(db().services);
    },
    addService: function (data) {
      var s = {
        id: uid('s'),
        name: (data.name || '').trim(),
        type: data.type === 'warranty' ? 'warranty' : 'repair',
        price: Number(data.price) || 0,
        duration: (data.duration || '').trim(),
        icon: data.icon || 'wrench',
        description: (data.description || '').trim()
      };
      if (!s.name) throw new Error('Tên dịch vụ không được để trống.');
      db().services.push(s);
      save();
      return clone(s);
    },
    deleteService: function (id) {
      db().services = db().services.filter(function (s) { return s.id !== id; });
      save();
      return true;
    },

    /* --- Người dùng --- */
    users: function () {
      return clone(db().users).map(function (u) {
        return { id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, createdAt: u.createdAt };
      });
    },
    rawUser: function (id) {
      return clone(db().users.find(function (u) { return u.id === id; }) || null);
    },
    register: function (data) {
      var name = (data.name || '').trim();
      var email = (data.email || '').trim().toLowerCase();
      var phone = (data.phone || '').trim();
      var password = data.password || '';
      if (name.length < 2) throw new Error('Vui lòng nhập họ tên (ít nhất 2 ký tự).');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email không hợp lệ.');
      if (password.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
      if (db().users.some(function (u) { return u.email === email; })) throw new Error('Email này đã được đăng ký.');
      var user = {
        id: uid('u'), name: name, email: email, phone: phone, password: hash(password),
        role: 'customer', createdAt: nowISO(),
        // Đồng ý nhận email khuyến mãi (lưu lại làm bằng chứng consent + hiển thị ở trang tài khoản)
        marketingOptIn: !!data.marketingOptIn,
        marketingOptInAt: data.marketingOptIn ? nowISO() : null
      };
      db().users.push(user);
      save();
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    },
    login: function (email, password) {
      var e = (email || '').trim().toLowerCase();
      var u = db().users.find(function (x) { return x.email === e; });
      if (!u) throw new Error('Email chưa được đăng ký.');
      if (u.password !== hash(password || '')) throw new Error('Mật khẩu không đúng.');
      var session = { id: u.id, name: u.name, email: u.email, role: u.role, at: nowISO() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      // Giỏ hàng tách theo tài khoản: gộp giỏ khách vào giỏ của user vừa đăng nhập
      if (global.AZCART && AZCART.onLogin) AZCART.onLogin();
      return session;
    },
    logout: function () {
      localStorage.removeItem(SESSION_KEY);
      // Quay về giỏ của khách, không còn thấy giỏ của tài khoản vừa đăng xuất
      if (global.AZCART && AZCART.onLogout) AZCART.onLogout();
    },
    session: function () {
      try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      } catch (e) { return null; }
    },
    updateProfile: function (id, data) {
      var u = db().users.find(function (x) { return x.id === id; });
      if (!u) throw new Error('Không tìm thấy tài khoản.');
      if (data.name !== undefined) u.name = data.name.trim();
      if (data.phone !== undefined) u.phone = data.phone.trim();
      if (data.password) {
        if (data.password.length < 6) throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
        u.password = hash(data.password);
      }
      save();
      var s = api.session();
      if (s && s.id === id) {
        s.name = u.name;
        localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      }
      return true;
    },
    deleteUser: function (id) {
      var u = db().users.find(function (x) { return x.id === id; });
      if (u && u.role === 'admin') throw new Error('Không thể xóa tài khoản quản trị.');
      db().users = db().users.filter(function (x) { return x.id !== id; });
      save();
      return true;
    },
    /* Bật/tắt đồng ý nhận email khuyến mãi */
    setMarketingOptIn: function (id, on) {
      var u = db().users.find(function (x) { return x.id === id; });
      if (!u) throw new Error('Không tìm thấy tài khoản.');
      u.marketingOptIn = !!on;
      u.marketingOptInAt = on ? nowISO() : null;
      save();
      return true;
    },

    /* --- Đơn hàng --- */
    orders: function () {
      return clone(db().orders).sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    },
    ordersByUser: function (userId) {
      return api.orders().filter(function (o) { return o.userId === userId; });
    },
    createOrder: function (payload) {
      var items = payload.items || [];
      if (!items.length) throw new Error('Giỏ hàng đang trống.');
      var subtotal = items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
      var ship = subtotal >= 5000000 ? 0 : 50000;
      var order = {
        id: uid('o'),
        code: 'AZM' + String(Math.floor(1000 + Math.random() * 9000)),
        userId: payload.userId || null,
        customer: payload.customer,
        items: items,
        subtotal: subtotal,
        ship: ship,
        total: subtotal + ship,
        payment: payload.payment || 'cod',
        status: 'pending',
        createdAt: nowISO()
      };
      db().orders.unshift(order);
      // Trừ tồn kho + tăng số đã bán
      items.forEach(function (i) {
        var p = db().products.find(function (x) { return x.id === i.productId; });
        if (p) {
          p.stock = Math.max(0, (p.stock || 0) - i.qty);
          p.sold = (p.sold || 0) + i.qty;
        }
      });
      save();
      return clone(order);
    },
    updateOrderStatus: function (id, status) {
      var o = db().orders.find(function (x) { return x.id === id; });
      if (!o) throw new Error('Không tìm thấy đơn hàng.');
      o.status = status;
      save();
      return clone(o);
    },
    deleteOrder: function (id) {
      db().orders = db().orders.filter(function (o) { return o.id !== id; });
      save();
      return true;
    },

    /* --- Lịch hẹn dịch vụ --- */
    bookings: function () {
      return clone(db().bookings).sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    },
    createBooking: function (data) {
      var b = {
        id: uid('b'),
        userId: (api.session() || {}).id || null,
        serviceId: data.serviceId,
        name: (data.name || '').trim(),
        phone: (data.phone || '').trim(),
        device: (data.device || '').trim(),
        issue: (data.issue || '').trim(),
        date: data.date || '',
        status: 'pending',
        createdAt: nowISO()
      };
      if (!b.name) throw new Error('Vui lòng nhập họ tên.');
      if (!/^[0-9+\s.\-]{9,15}$/.test(b.phone)) throw new Error('Số điện thoại không hợp lệ.');
      if (!b.device) throw new Error('Vui lòng nhập tên thiết bị.');
      db().bookings.unshift(b);
      save();
      return clone(b);
    },
    updateBookingStatus: function (id, status) {
      var b = db().bookings.find(function (x) { return x.id === id; });
      if (!b) return;
      b.status = status;
      save();
    },
    deleteBooking: function (id) {
      db().bookings = db().bookings.filter(function (b) { return b.id !== id; });
      save();
      return true;
    },

    /* --- Cài đặt --- */
    settings: function () {
      return clone(db().settings);
    },
    updateSettings: function (data) {
      Object.keys(data).forEach(function (k) { db().settings[k] = data[k]; });
      save();
      return api.settings();
    },

    /* --- SEO hệ thống --- */
    seo: function () {
      return clone(db().settings.seo || {});
    },
    updateSeo: function (data) {
      var cur = db().settings.seo || {};
      Object.keys(data).forEach(function (k) { cur[k] = data[k]; });
      db().settings.seo = cur;
      save();
      return api.seo();
    },

    /* --- Cấu hình Facebook --- */
    facebook: function () {
      return clone(db().settings.facebook || {});
    },
    updateFacebook: function (data) {
      var cur = db().settings.facebook || {};
      Object.keys(data).forEach(function (k) { cur[k] = data[k]; });
      db().settings.facebook = cur;
      save();
      return api.facebook();
    },

    /* --- Bài viết --- */
    posts: function () {
      return clone(db().posts || []).sort(function (a, b) {
        return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
      });
    },
    publishedPosts: function () {
      return api.posts().filter(function (p) { return p.status === 'published'; });
    },
    postById: function (id) {
      return clone((db().posts || []).find(function (p) { return p.id === id; }) || null);
    },
    postBySlug: function (slug) {
      return clone((db().posts || []).find(function (p) { return p.slug === slug; }) || null);
    },
    addPost: function (data) {
      var p = normalizePost(data);
      p.id = uid('post');
      p.createdAt = nowISO();
      db().posts.unshift(p);
      save();
      return clone(p);
    },
    updatePost: function (id, data) {
      var p = (db().posts || []).find(function (x) { return x.id === id; });
      if (!p) throw new Error('Không tìm thấy bài viết.');
      var n = normalizePost(Object.assign({}, p, data, { id: id }));
      Object.keys(n).forEach(function (k) { p[k] = n[k]; });
      save();
      return clone(p);
    },
    deletePost: function (id) {
      db().posts = (db().posts || []).filter(function (p) { return p.id !== id; });
      save();
      return true;
    },

    /* --- Thống kê cho dashboard --- */
    stats: function () {
      var orders = db().orders;
      var valid = orders.filter(function (o) { return o.status !== 'cancelled'; });
      var revenue = valid.reduce(function (s, o) { return s + o.total; }, 0);
      var products = db().products;
      var lowStock = products.filter(function (p) { return p.stock <= 5; });
      var byCat = db().categories.map(function (c) {
        var list = products.filter(function (p) { return p.categoryId === c.id; });
        return {
          id: c.id, name: c.name, color: c.color,
          count: list.length,
          stock: list.reduce(function (s, p) { return s + p.stock; }, 0)
        };
      });
      var statusCount = {};
      orders.forEach(function (o) { statusCount[o.status] = (statusCount[o.status] || 0) + 1; });

      // Doanh thu 6 tháng gần nhất
      var months = [];
      var d = new Date();
      for (var i = 5; i >= 0; i--) {
        var m = new Date(d.getFullYear(), d.getMonth() - i, 1);
        var key = m.getFullYear() + '-' + String(m.getMonth() + 1).padStart(2, '0');
        var total = valid.filter(function (o) {
          var od = new Date(o.createdAt);
          return od.getFullYear() === m.getFullYear() && od.getMonth() === m.getMonth();
        }).reduce(function (s, o) { return s + o.total; }, 0);
        months.push({ key: key, label: 'T' + (m.getMonth() + 1), total: total });
      }

      return {
        revenue: revenue,
        orderCount: orders.length,
        validOrderCount: valid.length,
        customerCount: db().users.filter(function (u) { return u.role === 'customer'; }).length,
        productCount: products.length,
        categoryCount: db().categories.length,
        lowStock: lowStock.length,
        lowStockList: clone(lowStock).sort(function (a, b) { return a.stock - b.stock; }).slice(0, 5),
        bookingCount: db().bookings.length,
        pendingBookings: db().bookings.filter(function (b) { return b.status === 'pending'; }).length,
        byCat: byCat,
        statusCount: statusCount,
        months: months,
        avgOrder: valid.length ? Math.round(revenue / valid.length) : 0,
        topProducts: clone(products).sort(function (a, b) { return (b.sold || 0) - (a.sold || 0); }).slice(0, 5)
      };
    }
  };

  function normalizeProduct(data) {
    var name = (data.name || '').trim();
    if (!name) throw new Error('Tên sản phẩm không được để trống.');
    if (!data.categoryId) throw new Error('Vui lòng chọn danh mục.');
    var price = Number(data.price);
    if (!price || price <= 0) throw new Error('Giá bán phải lớn hơn 0.');
    var specs = data.specs || {};
    return {
      name: name,
      categoryId: data.categoryId,
      brand: (data.brand || '').trim(),
      price: price,
      oldPrice: Number(data.oldPrice) || 0,
      stock: Math.max(0, Number(data.stock) || 0),
      rating: Math.min(5, Math.max(0, Number(data.rating) || 4.5)),
      badge: (data.badge || '').trim(),
      featured: !!data.featured,
      artColor: data.artColor || '#2563eb',
      image: (data.image || '').trim(),
      specs: {
        cpu: (specs.cpu || '').trim(),
        ram: (specs.ram || '').trim(),
        ssd: (specs.ssd || '').trim(),
        vga: (specs.vga || '').trim(),
        screen: (specs.screen || '').trim()
      },
      description: (data.description || '').trim(),
      slug: (data.slug || '').trim() || slugify(name),
      seo: {
        title: ((data.seo && data.seo.title) || '').trim(),
        description: ((data.seo && data.seo.description) || '').trim(),
        keywords: ((data.seo && data.seo.keywords) || '').trim(),
        image: ((data.seo && data.seo.image) || '').trim(),
        canonical: ((data.seo && data.seo.canonical) || '').trim(),
        noindex: !!(data.seo && data.seo.noindex)
      }
    };
  }

  function normalizePost(data) {
    var title = (data.title || '').trim();
    if (!title) throw new Error('Tiêu đề bài viết không được để trống.');
    var slug = (data.slug || '').trim() || slugify(title);
    if (db().posts.some(function (p) { return p.slug === slug && p.id !== data.id; })) {
      throw new Error('Đường dẫn (slug) này đã được dùng cho bài viết khác.');
    }
    return {
      title: title,
      slug: slug,
      category: (data.category || 'Tin tức').trim(),
      author: (data.author || 'AZmobile').trim(),
      cover: (data.cover || '').trim(),
      excerpt: (data.excerpt || '').trim(),
      content: (data.content || '').trim(),
      status: data.status === 'draft' ? 'draft' : 'published',
      publishedAt: data.publishedAt || nowISO(),
      seo: {
        title: ((data.seo && data.seo.title) || '').trim(),
        description: ((data.seo && data.seo.description) || '').trim(),
        keywords: ((data.seo && data.seo.keywords) || '').trim(),
        image: ((data.seo && data.seo.image) || '').trim(),
        canonical: ((data.seo && data.seo.canonical) || '').trim(),
        noindex: !!(data.seo && data.seo.noindex)
      }
    };
  }

  function slugify(s) {
    return String(s).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  api.slugify = slugify;
  global.AZDB = api;
})(window);
