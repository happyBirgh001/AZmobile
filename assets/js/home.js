/* AZmobile — Trang chủ */
(function () {
  'use strict';
  var U = AZUI, D = AZDB;

  U.mountLayout('index.html');

  /* --- SEO trang chủ --- */
  if (window.AZSEO) {
    AZSEO.page({
      title: 'Laptop, phụ kiện & sửa chữa chính hãng',
      description: 'AZmobile bán laptop gaming, văn phòng, MacBook chính hãng, phụ kiện và dịch vụ sửa chữa — bảo hành 12–24 tháng, trả góp 0%, giao hàng toàn quốc.',
      keywords: 'laptop, laptop gaming, macbook, phụ kiện laptop, sửa chữa laptop, bảo hành laptop, AZmobile',
      url: AZSEO.abs('/')
    });
  }

  /* --- Hero art --- */
  var heroProduct = D.products().find(function (p) { return p.featured; }) || D.products()[0];
  var heroHost = document.getElementById('hero-art');
  if (heroHost && heroProduct) heroHost.innerHTML = U.productArt(heroProduct);

  /* --- Số liệu --- */
  var stats = D.stats();
  var elP = document.getElementById('stat-products');
  var elC = document.getElementById('stat-customers');
  if (elP) elP.textContent = stats.productCount + '+';
  if (elC) elC.textContent = (12000 + stats.customerCount).toLocaleString('vi-VN') + '+';

  /* --- Vì sao chọn AZmobile --- */
  var feats = [
    { icon: 'shield', title: 'Bảo hành chính hãng', text: 'Tem niêm phong, phiếu bảo hành đầy đủ, hỗ trợ 1 đổi 1 trong 30 ngày.' },
    { icon: 'truck', title: 'Giao nhanh toàn quốc', text: 'Nội thành TP.HCM trong 2 giờ, tỉnh thành khác 1–3 ngày làm việc.' },
    { icon: 'refresh', title: 'Trả góp 0% lãi suất', text: 'Duyệt hồ sơ trong 15 phút, chỉ cần CCCD, kỳ hạn đến 24 tháng.' },
    { icon: 'wrench', title: 'Sửa chữa tại cửa hàng', text: 'Kỹ thuật viên chuyên sâu, báo giá trước, linh kiện thay thế chính hãng.' }
  ];
  document.getElementById('feat-grid').innerHTML = feats.map(function (f) {
    return '<div class="feat reveal">' +
      '<span class="feat__ico">' + U.icon(f.icon, 21) + '</span>' +
      '<div><strong>' + f.title + '</strong><small>' + f.text + '</small></div>' +
      '</div>';
  }).join('');

  /* --- Danh mục --- */
  var cats = D.categories();
  var products = D.products();
  document.getElementById('cat-grid').innerHTML = cats.map(function (c) {
    var n = products.filter(function (p) { return p.categoryId === c.id; }).length;
    return '<a class="cat-card reveal" href="shop.html?cat=' + c.id + '" style="--c:' + c.color + '">' +
      '<span class="cat-card__ico">' + U.icon(c.icon, 22) + '</span>' +
      '<strong>' + U.esc(c.name) + '</strong>' +
      '<small>' + n + ' sản phẩm</small>' +
      '</a>';
  }).join('');

  /* --- Sản phẩm nổi bật --- */
  var featured = products.filter(function (p) { return p.featured; }).slice(0, 8);
  if (featured.length < 4) featured = products.slice(0, 8);
  document.getElementById('featured-grid').innerHTML = featured.map(function (p) {
    return U.productCard(p);
  }).join('');

  /* --- Dịch vụ --- */
  var svcs = D.services().slice(0, 6);
  document.getElementById('svc-grid').innerHTML = svcs.map(function (s) {
    return '<article class="svc reveal">' +
      '<div class="svc__top">' +
        '<span class="svc__ico">' + U.icon(s.icon, 22) + '</span>' +
        '<span class="chip ' + (s.type === 'warranty' ? 'chip--ok' : 'chip--info') + '">' +
          (s.type === 'warranty' ? 'Bảo hành' : 'Sửa chữa') + '</span>' +
      '</div>' +
      '<div>' +
        '<h3>' + U.esc(s.name) + '</h3>' +
        '<p>' + U.esc(s.description) + '</p>' +
      '</div>' +
      '<div class="svc__meta">' +
        U.icon('clock', 15) + '<span>' + U.esc(s.duration) + '</span>' +
        '<span class="svc__price">' + U.money(s.price) + '<small>từ</small></span>' +
      '</div>' +
      '</article>';
  }).join('');

  /* --- Đánh giá --- */
  var quotes = [
    { name: 'Nguyễn Văn An', role: 'Sinh viên CNTT', text: 'Mình mua Acer Nitro ở đây, bạn tư vấn rất kỹ và không hề chèo kéo lên máy đắt hơn. Máy về đúng hẹn, cấu hình đúng như mô tả.' },
    { name: 'Trần Thị Bích', role: 'Nhân viên văn phòng', text: 'MacBook Air mua cho công việc, được cài sẵn Office và hướng dẫn chuyển dữ liệu miễn phí. Dịch vụ sau bán rất ổn.' },
    { name: 'Lê Minh Quân', role: 'Designer tự do', text: 'Màn hình Dell 4K mua tại AZmobile rẻ hơn nơi khác gần 1 triệu. Bảo hành đổi mới nhanh, không phải chờ lâu.' }
  ];
  document.getElementById('quote-grid').innerHTML = quotes.map(function (q) {
    return '<div class="quote reveal">' +
      U.stars(5) +
      '<p>“' + q.text + '”</p>' +
      '<div class="quote__who">' +
        '<span class="quote__ava">' + q.name.charAt(0) + '</span>' +
        '<div><b>' + q.name + '</b><small>' + q.role + '</small></div>' +
      '</div>' +
      '</div>';
  }).join('');

  /* --- Ảnh minh họa phần giới thiệu --- */
  var aboutHost = document.getElementById('about-art');
  var showcase = products.find(function (p) { return p.id === 'p_macpro'; }) || products[0];
  if (aboutHost && showcase) aboutHost.innerHTML = U.productArt(showcase);

  /* --- Hiệu ứng xuất hiện khi cuộn --- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 60 + 'ms';
    io.observe(el);
  });
})();
