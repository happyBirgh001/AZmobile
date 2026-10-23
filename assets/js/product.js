/* AZmobile — Trang chi tiết sản phẩm */
(function () {
  'use strict';
  var U = AZUI, D = AZDB;

  U.mountLayout('shop.html');

  var id = new URLSearchParams(location.search).get('id');
  var p = id ? D.productById(id) : null;
  var root = document.getElementById('pdp-root');

  if (!p) {
    document.title = 'Không tìm thấy sản phẩm — AZmobile';
    root.innerHTML = '<div class="empty" style="margin:40px 0 60px">' + U.icon('search', 44) +
      '<h3>Sản phẩm không tồn tại</h3>' +
      '<p>Có thể sản phẩm đã bị xoá hoặc đường dẫn không đúng.</p>' +
      '<a class="btn btn--primary" href="shop.html">Xem tất cả sản phẩm</a></div>';
    document.getElementById('related-section').style.display = 'none';
    return;
  }

  document.title = p.name + ' — AZmobile';
  document.getElementById('crumb-name').textContent = p.name;

  var cat = D.categoryById(p.categoryId);
  var off = p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  var saved = p.oldPrice > p.price ? p.oldPrice - p.price : 0;
  var soldOut = p.stock <= 0;
  var lowStock = p.stock > 0 && p.stock <= 5;

  var specRows = [
    { k: 'CPU', v: p.specs.cpu },
    { k: 'RAM', v: p.specs.ram },
    { k: 'Lưu trữ', v: p.specs.ssd },
    { k: 'Đồ hoạ', v: p.specs.vga },
    { k: 'Màn hình', v: p.specs.screen }
  ].filter(function (r) { return r.v && r.v !== '—'; });

  root.innerHTML = '' +
    '<div class="pdp">' +
      '<div>' +
        '<div class="pdp__gallery">' +
          '<div id="pdp-art">' + U.productArt(p, { eager: true }) + '</div>' +
          (p.image ? '' :
            '<div class="pdp__thumbs" id="pdp-thumbs">' +
              '<span class="is-active">' + U.icon('laptop', 20) + '</span>' +
              '<span>' + U.icon('grid', 20) + '</span>' +
              '<span>' + U.icon('shield', 20) + '</span>' +
              '<span>' + U.icon('box', 20) + '</span>' +
            '</div>') +
        '</div>' +
      '</div>' +

      '<div class="pdp__info">' +
        '<div class="pdp__brandline">' +
          (cat ? U.esc(cat.name) : '') + ' <span style="opacity:.4">/</span> ' + U.esc(p.brand || 'AZmobile') +
          (p.badge ? '<span class="tag tag--badge" style="margin-left:6px">' + U.esc(p.badge) + '</span>' : '') +
        '</div>' +
        '<h1>' + U.esc(p.name) + '</h1>' +
        '<div class="pdp__meta">' +
          U.stars(p.rating) + '<b style="color:#0a1120">' + Number(p.rating).toFixed(1) + '</b>' +
          '<span class="sep"></span>' +
          '<span>' + (p.sold || 0) + ' đã bán</span>' +
          '<span class="sep"></span>' +
          '<span class="chip ' + (soldOut ? 'chip--err' : (lowStock ? 'chip--warn' : 'chip--ok')) + '">' +
            (soldOut ? 'Hết hàng' : (lowStock ? 'Chỉ còn ' + p.stock + ' sản phẩm' : 'Còn ' + p.stock + ' sản phẩm')) +
          '</span>' +
        '</div>' +

        '<div class="pdp__pricebox">' +
          '<div class="pdp__price">' +
            '<strong>' + U.money(p.price) + '</strong>' +
            (p.oldPrice > p.price ? '<del>' + U.money(p.oldPrice) + '</del><span class="tag tag--off">-' + off + '%</span>' : '') +
          '</div>' +
          (saved ? '<div class="pdp__save">Bạn tiết kiệm ' + U.money(saved) + ' so với giá niêm yết</div>' : '') +
          '<div style="margin-top:12px;font-size:.83rem;color:#64748b">Trả góp 0% từ ' +
            U.money(Math.round(p.price / 12)) + '/tháng trong 12 tháng</div>' +
        '</div>' +

        '<ul class="pdp__specs">' +
          specRows.map(function (r) {
            return '<li><b>' + r.k + '</b><span>' + U.esc(r.v) + '</span></li>';
          }).join('') +
        '</ul>' +

        '<div class="pdp__buy">' +
          '<div class="qty">' +
            '<button type="button" id="qty-minus" aria-label="Giảm">−</button>' +
            '<input type="number" id="qty-input" value="1" min="1" max="' + Math.max(1, p.stock) + '" aria-label="Số lượng">' +
            '<button type="button" id="qty-plus" aria-label="Tăng">+</button>' +
          '</div>' +
          '<button class="btn btn--ghost btn--lg" type="button" id="add-to-cart"' + (soldOut ? ' disabled' : '') + '>' +
            U.icon('cart', 19) + 'Thêm vào giỏ</button>' +
          '<button class="btn btn--primary btn--lg" type="button" id="buy-now"' + (soldOut ? ' disabled' : '') + '>' +
            'Mua ngay</button>' +
        '</div>' +

        '<ul class="pdp__policies">' +
          '<li>' + U.icon('shield', 17) + '<span>Bảo hành chính hãng 12–24 tháng, 1 đổi 1 trong 30 ngày đầu.</span></li>' +
          '<li>' + U.icon('truck', 17) + '<span>Miễn phí giao hàng toàn quốc cho đơn từ 5 triệu. Nội thành 2h.</span></li>' +
          '<li>' + U.icon('refresh', 17) + '<span>Hỗ trợ trả góp 0% qua thẻ tín dụng, kỳ hạn 3–24 tháng.</span></li>' +
          '<li>' + U.icon('wrench', 17) + '<span>Miễn phí vệ sinh máy 1 lần/năm tại trung tâm AZmobile.</span></li>' +
        '</ul>' +
      '</div>' +
    '</div>' +

    '<div class="pdp__desc">' +
      '<div class="tabs-line" id="pdp-tabs">' +
        '<button type="button" class="is-active" data-tab="desc">Mô tả sản phẩm</button>' +
        '<button type="button" data-tab="specs">Thông số kỹ thuật</button>' +
        '<button type="button" data-tab="warranty">Bảo hành &amp; đổi trả</button>' +
      '</div>' +
      '<div id="tab-desc">' +
        '<p>' + U.esc(p.description) + '</p>' +
        '<p style="color:#64748b;font-size:.9rem">Sản phẩm được nhập khẩu chính hãng, có tem niêm phong và phiếu bảo hành của nhà sản xuất. ' +
        'Mọi thông tin cấu hình trên website đều được AZmobile kiểm tra thực tế trước khi đăng bán.</p>' +
      '</div>' +
      '<div id="tab-specs" style="display:none">' +
        '<ul class="pdp__specs" style="max-width:640px">' +
          '<li><b>Danh mục</b><span>' + (cat ? U.esc(cat.name) : '—') + '</span></li>' +
          '<li><b>Thương hiệu</b><span>' + U.esc(p.brand || '—') + '</span></li>' +
          specRows.map(function (r) { return '<li><b>' + r.k + '</b><span>' + U.esc(r.v) + '</span></li>'; }).join('') +
          '<li><b>Tình trạng</b><span>Mới 100%, nguyên seal</span></li>' +
          '<li><b>Xuất xứ</b><span>Chính hãng</span></li>' +
        '</ul>' +
      '</div>' +
      '<div id="tab-warranty" style="display:none">' +
        '<ul class="checklist" style="max-width:720px">' +
          '<li>' + U.icon('check', 22) + '<span><strong>Bảo hành 12 tháng</strong> cho lỗi phần cứng theo tiêu chuẩn nhà sản xuất.</span></li>' +
          '<li>' + U.icon('check', 22) + '<span><strong>1 đổi 1 trong 30 ngày</strong> nếu phát sinh lỗi từ nhà sản xuất.</span></li>' +
          '<li>' + U.icon('check', 22) + '<span><strong>Hỗ trợ kỹ thuật trọn đời</strong> — cài đặt phần mềm, driver miễn phí.</span></li>' +
          '<li>' + U.icon('check', 22) + '<span><strong>Không bảo hành</strong> các trường hợp: rơi vỡ, vào nước, cháy nổ do điện, tự tháo tem.</span></li>' +
        '</ul>' +
      '</div>' +
    '</div>';

  /* --- Số lượng --- */
  var qtyInput = document.getElementById('qty-input');
  var maxQty = Math.max(1, p.stock);
  document.getElementById('qty-minus').addEventListener('click', function () {
    qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
  });
  document.getElementById('qty-plus').addEventListener('click', function () {
    qtyInput.value = Math.min(maxQty, Number(qtyInput.value) + 1);
  });
  qtyInput.addEventListener('change', function () {
    var v = Number(qtyInput.value) || 1;
    qtyInput.value = Math.min(maxQty, Math.max(1, v));
  });

  /* --- Thêm giỏ / mua ngay --- */
  function requireLoginForBuy() {
    if (D.session()) return true;
    U.toast('Vui lòng đăng nhập để mua hàng', 'info');
    setTimeout(function () {
      location.href = 'login.html?next=' + encodeURIComponent('product.html?id=' + p.id);
    }, 700);
    return false;
  }

  document.getElementById('add-to-cart').addEventListener('click', function () {
    if (!requireLoginForBuy()) return;
    AZCART.add(p.id, Number(qtyInput.value) || 1);
    U.toast('Đã thêm ' + (qtyInput.value) + ' sản phẩm vào giỏ');
  });
  document.getElementById('buy-now').addEventListener('click', function () {
    if (!requireLoginForBuy()) return;
    AZCART.add(p.id, Number(qtyInput.value) || 1);
    location.href = 'cart.html';
  });

  /* --- Tab --- */
  var tabs = document.getElementById('pdp-tabs');
  tabs.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-tab]');
    if (!btn) return;
    tabs.querySelectorAll('button').forEach(function (b) { b.classList.remove('is-active'); });
    btn.classList.add('is-active');
    ['desc', 'specs', 'warranty'].forEach(function (k) {
      document.getElementById('tab-' + k).style.display = (k === btn.dataset.tab) ? 'block' : 'none';
    });
  });

  /* --- Thumbnail (chỉ đổi trạng thái) --- */
  var thumbsEl = document.getElementById('pdp-thumbs');
  if (thumbsEl) thumbsEl.addEventListener('click', function (e) {
    var s = e.target.closest('span');
    if (!s) return;
    this.querySelectorAll('span').forEach(function (x) { x.classList.remove('is-active'); });
    s.classList.add('is-active');
  });

  /* --- Sản phẩm tương tự --- */
  var related = D.products().filter(function (x) {
    return x.id !== p.id && (x.categoryId === p.categoryId || x.brand === p.brand);
  }).slice(0, 4);
  if (related.length < 4) {
    D.products().forEach(function (x) {
      if (related.length < 4 && x.id !== p.id && !related.some(function (r) { return r.id === x.id; })) {
        related.push(x);
      }
    });
  }
  document.getElementById('related-grid').innerHTML = related.map(function (x) {
    return U.productCard(x);
  }).join('');
})();
