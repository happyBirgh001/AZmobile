/* AZmobile — Admin Dashboard */
(function () {
  'use strict';
  var U = AZUI, D = AZDB;

  /* ---------- Kiểm tra quyền ---------- */
  if (!D.session() || D.session().role !== 'admin') {
    document.body.innerHTML = '<div style="display:grid;place-items:center;height:100vh;font-family:sans-serif;text-align:center;padding:24px">' +
      '<div><h2 style="color:#0a1120;margin-bottom:8px">Cần quyền quản trị</h2>' +
      '<p style="color:#64748b;margin-bottom:20px">Bạn phải đăng nhập bằng tài khoản admin để xem trang này.</p>' +
      '<a href="login.html?next=admin.html" style="display:inline-block;padding:11px 22px;border-radius:10px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700">Đăng nhập</a></div></div>';
    setTimeout(function () { location.href = 'login.html?next=admin.html'; }, 1400);
    return;
  }

  var admin = D.session();
  document.getElementById('ad-ava').textContent = admin.name.charAt(0).toUpperCase();
  document.getElementById('ad-uname').textContent = admin.name;
  document.getElementById('ad-uemail').textContent = admin.email;

  var STATUS = {
    pending: { label: 'Chờ xác nhận', cls: 'status--pending' },
    confirmed: { label: 'Đã xác nhận', cls: 'status--confirmed' },
    shipping: { label: 'Đang giao', cls: 'status--shipping' },
    completed: { label: 'Hoàn thành', cls: 'status--completed' },
    cancelled: { label: 'Đã huỷ', cls: 'status--cancelled' }
  };
  var BK_STATUS = {
    pending: { label: 'Chờ xác nhận', cls: 'status--pending' },
    confirmed: { label: 'Đã xác nhận', cls: 'status--confirmed' },
    done: { label: 'Hoàn thành', cls: 'status--completed' },
    cancelled: { label: 'Đã huỷ', cls: 'status--cancelled' }
  };

  /* ---------- Điều hướng ---------- */
  var TITLES = {
    dashboard: ['Bảng điều khiển', 'Tổng quan hoạt động kinh doanh của AZmobile'],
    products: ['Quản lý sản phẩm', 'Thêm, sửa và xoá sản phẩm trong cửa hàng'],
    categories: ['Quản lý danh mục', 'Tổ chức sản phẩm theo nhóm ngành hàng'],
    orders: ['Quản lý đơn hàng', 'Theo dõi và cập nhật trạng thái đơn'],
    services: ['Quản lý dịch vụ', 'Dịch vụ sửa chữa và gói bảo hành'],
    bookings: ['Lịch hẹn dịch vụ', 'Yêu cầu đặt lịch từ khách hàng'],
    customers: ['Khách hàng', 'Danh sách tài khoản đã đăng ký'],
    settings: ['Cài đặt hệ thống', 'Thông tin cửa hàng và quản lý dữ liệu']
  };

  var currentView = 'dashboard';
  var side = document.getElementById('ad-side');

  function go(view) {
    currentView = view;
    document.querySelectorAll('.ad__nav button').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.view === view);
    });
    document.querySelectorAll('.ad__view').forEach(function (v) {
      v.classList.toggle('is-active', v.id === 'view-' + view);
    });
    document.getElementById('ad-title').textContent = TITLES[view][0];
    document.getElementById('ad-sub').textContent = TITLES[view][1];
    side.classList.remove('is-open');
    location.hash = view;
    renderView(view);
  }

  document.querySelectorAll('.ad__nav button').forEach(function (b) {
    b.addEventListener('click', function () { go(b.dataset.view); });
  });
  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-goto]');
    if (g) go(g.getAttribute('data-goto'));
  });
  document.getElementById('ad-menu').addEventListener('click', function () {
    side.classList.toggle('is-open');
  });
  document.getElementById('ad-logout').addEventListener('click', function () {
    D.logout();
    location.href = 'login.html';
  });

  function renderView(v) {
    if (v === 'dashboard') renderDashboard();
    if (v === 'products') renderProducts();
    if (v === 'categories') renderCategories();
    if (v === 'orders') renderOrders();
    if (v === 'services') renderServices();
    if (v === 'bookings') renderBookings();
    if (v === 'customers') renderCustomers();
    if (v === 'settings') renderSettings();
    updateBadges();
  }

  function updateBadges() {
    var s = D.stats();
    document.getElementById('nav-orders').textContent = s.orderCount;
    document.getElementById('nav-products').textContent = s.productCount;
    document.getElementById('nav-cats').textContent = s.categoryCount;
    document.getElementById('nav-bookings').textContent = s.pendingBookings;
    document.getElementById('nav-users').textContent = s.customerCount;
  }

  /* ================= DASHBOARD ================= */
  function renderDashboard() {
    var s = D.stats();
    var kpis = [
      { label: 'Doanh thu', value: U.money(s.revenue), sub: s.validOrderCount + ' đơn hợp lệ', icon: 'chart', color: '#10b981' },
      { label: 'Đơn hàng', value: s.orderCount, sub: (s.statusCount.pending || 0) + ' đơn chờ xác nhận', icon: 'receipt', color: '#2563eb' },
      { label: 'Khách hàng', value: s.customerCount, sub: 'Tài khoản đã đăng ký', icon: 'users', color: '#8b5cf6' },
      { label: 'Sản phẩm', value: s.productCount, sub: s.lowStock + ' sản phẩm sắp hết', icon: 'box', color: '#f59e0b' }
    ];
    document.getElementById('kpis').innerHTML = kpis.map(function (k) {
      return '<div class="kpi" style="--k:' + k.color + '">' +
        '<div class="kpi__top"><span class="kpi__label">' + k.label + '</span>' +
          '<span class="kpi__ico">' + U.icon(k.icon, 17) + '</span></div>' +
        '<div class="kpi__value">' + k.value + '</div>' +
        '<div class="kpi__sub">' + k.sub + '</div></div>';
    }).join('');

    // Chart
    var months = s.months;
    var max = Math.max.apply(null, months.map(function (m) { return m.total; }).concat([1]));
    document.getElementById('chart').innerHTML = months.map(function (m) {
      var h = Math.max(2, Math.round((m.total / max) * 100));
      return '<div class="chart__col">' +
        '<div class="chart__bar-wrap"><div class="chart__bar" style="height:' + h + '%">' +
          '<span>' + (m.total ? U.shortMoney(m.total) : '0') + '</span></div></div>' +
        '<div class="chart__label">' + m.label + '</div></div>';
    }).join('');
    var total6 = months.reduce(function (a, b) { return a + b.total; }, 0);
    document.getElementById('chart-total').textContent = U.shortMoney(total6) + ' / 6 tháng';

    // Category bars
    var maxStock = Math.max.apply(null, s.byCat.map(function (c) { return c.stock; }).concat([1]));
    document.getElementById('catbars').innerHTML = s.byCat.map(function (c) {
      return '<div class="catbar">' +
        '<div class="catbar__top"><b>' + U.esc(c.name) + '</b>' +
          '<span>' + c.count + ' SP · ' + c.stock + ' máy</span></div>' +
        '<div class="catbar__track"><div class="catbar__fill" style="width:' +
          Math.max(3, (c.stock / maxStock) * 100) + '%;background:' + c.color + '"></div></div>' +
        '</div>';
    }).join('');

    // Recent orders
    var recent = D.orders().slice(0, 6);
    document.getElementById('recent-orders').innerHTML = recent.length ? '<table class="tb">' +
      '<thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>' +
      recent.map(function (o) {
        var st = STATUS[o.status] || STATUS.pending;
        return '<tr><td class="strong">#' + o.code + '</td>' +
          '<td>' + U.esc(o.customer.name) + '<div class="muted">' + U.date(o.createdAt) + '</div></td>' +
          '<td class="num strong">' + U.money(o.total) + '</td>' +
          '<td><span class="status ' + st.cls + '">' + st.label + '</span></td></tr>';
      }).join('') + '</tbody></table>' : '<div class="empty-mini">Chưa có đơn hàng</div>';

    // Top products
    var maxSold = Math.max.apply(null, s.topProducts.map(function (p) { return p.sold || 0; }).concat([1]));
    document.getElementById('top-products').innerHTML = s.topProducts.map(function (p) {
      return '<div class="catbar">' +
        '<div class="catbar__top"><b>' + U.esc(p.name) + '</b><span>' + (p.sold || 0) + ' đã bán</span></div>' +
        '<div class="catbar__track"><div class="catbar__fill" style="width:' +
          Math.max(3, ((p.sold || 0) / maxSold) * 100) + '%;background:linear-gradient(90deg,#3b82f6,#06b6d4)"></div></div>' +
        '</div>';
    }).join('') || '<div class="empty-mini">Chưa có dữ liệu</div>';

    // Low stock
    document.getElementById('low-stock').innerHTML = s.lowStockList.length ? '<table class="tb">' +
      '<thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Tồn kho</th><th>Giá bán</th></tr></thead><tbody>' +
      s.lowStockList.map(function (p) {
        var c = D.categoryById(p.categoryId);
        return '<tr><td><div class="tb__prod"><span class="tb__thumb">' + U.productArt(p) + '</span>' +
          '<div><b>' + U.esc(p.name) + '</b><small>' + U.esc(p.brand) + '</small></div></div></td>' +
          '<td>' + U.esc(c ? c.name : '—') + '</td>' +
          '<td><span class="chip ' + (p.stock === 0 ? 'chip--err' : 'chip--warn') + '">' + p.stock + ' chiếc</span></td>' +
          '<td class="num strong">' + U.money(p.price) + '</td></tr>';
      }).join('') + '</tbody></table>' : '<div class="empty-mini">Tất cả sản phẩm đều đủ hàng</div>';
  }

  /* ================= SẢN PHẨM ================= */
  var pQuery = '', pCat = '';

  function renderProducts() {
    var cats = D.categories();
    var sel = document.getElementById('p-cat');
    sel.innerHTML = '<option value="">Tất cả danh mục</option>' + cats.map(function (c) {
      return '<option value="' + c.id + '">' + U.esc(c.name) + '</option>';
    }).join('');
    sel.value = pCat;

    if (!sel.dataset.bound) {
      sel.dataset.bound = '1';
      sel.addEventListener('change', function () { pCat = sel.value; renderProducts(); });
      document.getElementById('p-search').addEventListener('input', function (e) {
        pQuery = e.target.value.toLowerCase().trim();
        renderProducts();
      });
    }

    var list = D.products().filter(function (p) {
      if (pCat && p.categoryId !== pCat) return false;
      if (pQuery && (p.name + ' ' + p.brand).toLowerCase().indexOf(pQuery) === -1) return false;
      return true;
    });

    document.getElementById('products-table').innerHTML = list.length ? '<table class="tb">' +
      '<thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Giá bán</th><th>Tồn kho</th><th>Đã bán</th><th style="text-align:right">Thao tác</th></tr></thead><tbody>' +
      list.map(function (p) {
        var c = D.categoryById(p.categoryId);
        return '<tr>' +
          '<td><div class="tb__prod"><span class="tb__thumb">' + U.productArt(p) + '</span>' +
            '<div><b>' + U.esc(p.name) + '</b><small>' + U.esc(p.brand || '—') +
            (p.featured ? ' · <span style="color:#2563eb">Nổi bật</span>' : '') + '</small></div></div></td>' +
          '<td>' + U.esc(c ? c.name : '—') + '</td>' +
          '<td class="num"><span class="strong">' + U.money(p.price) + '</span>' +
            (p.oldPrice > p.price ? '<div class="muted" style="text-decoration:line-through">' + U.money(p.oldPrice) + '</div>' : '') + '</td>' +
          '<td><span class="chip ' + (p.stock === 0 ? 'chip--err' : (p.stock <= 5 ? 'chip--warn' : 'chip--ok')) + '">' + p.stock + '</span></td>' +
          '<td class="num">' + (p.sold || 0) + '</td>' +
          '<td><div class="row-actions">' +
            '<button class="icon-btn" type="button" data-edit="' + p.id + '" title="Sửa">' + U.icon('edit', 15) + '</button>' +
            '<button class="icon-btn icon-btn--danger" type="button" data-del="' + p.id + '" title="Xoá">' + U.icon('trash', 15) + '</button>' +
          '</div></td></tr>';
      }).join('') + '</tbody></table>' : '<div class="empty-mini">Không có sản phẩm nào khớp bộ lọc</div>';
  }

  function openProductModal(id) {
    var cats = D.categories();
    document.getElementById('pf-cat').innerHTML = cats.map(function (c) {
      return '<option value="' + c.id + '">' + U.esc(c.name) + '</option>';
    }).join('');

    var p = id ? D.productById(id) : null;
    document.getElementById('pm-title').textContent = p ? 'Sửa sản phẩm' : 'Thêm sản phẩm';
    document.getElementById('pf-id').value = p ? p.id : '';
    document.getElementById('pf-name2').value = p ? p.name : '';
    document.getElementById('pf-cat').value = p ? p.categoryId : (cats[0] ? cats[0].id : '');
    document.getElementById('pf-brand').value = p ? p.brand : '';
    document.getElementById('pf-price').value = p ? p.price : '';
    document.getElementById('pf-old').value = p ? (p.oldPrice || '') : '';
    document.getElementById('pf-stock').value = p ? p.stock : 10;
    document.getElementById('pf-rating').value = p ? p.rating : 4.5;
    document.getElementById('pf-badge').value = p ? p.badge : '';
    document.getElementById('pf-color').value = p ? p.artColor : '#2563eb';
    document.getElementById('pf-image').value = p ? (p.image || '') : '';
    document.getElementById('pf-cpu').value = p ? p.specs.cpu : '';
    document.getElementById('pf-ram').value = p ? p.specs.ram : '';
    document.getElementById('pf-ssd').value = p ? p.specs.ssd : '';
    document.getElementById('pf-vga').value = p ? p.specs.vga : '';
    document.getElementById('pf-screen').value = p ? p.specs.screen : '';
    document.getElementById('pf-desc').value = p ? p.description : '';
    document.getElementById('pf-featured').checked = p ? !!p.featured : false;
    document.querySelectorAll('#product-form .field.has-err').forEach(function (f) { f.classList.remove('has-err'); });
    openModal('modal-product');
  }

  document.getElementById('p-add').addEventListener('click', function () {
    if (!D.categories().length) {
      U.toast('Hãy tạo danh mục trước khi thêm sản phẩm', 'error');
      go('categories');
      return;
    }
    openProductModal(null);
  });

  document.getElementById('products-table').addEventListener('click', function (e) {
    var ed = e.target.closest('[data-edit]');
    var dl = e.target.closest('[data-del]');
    if (ed) openProductModal(ed.getAttribute('data-edit'));
    if (dl) {
      var p = D.productById(dl.getAttribute('data-del'));
      askDelete('Xoá sản phẩm "' + p.name + '"? Hành động này không thể hoàn tác.', function () {
        D.deleteProduct(p.id);
        U.toast('Đã xoá sản phẩm');
        renderProducts();
        updateBadges();
      });
    }
  });

  document.getElementById('product-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var id = document.getElementById('pf-id').value;
    var nameEl = document.getElementById('pf-name2');
    var priceEl = document.getElementById('pf-price');
    var catEl = document.getElementById('pf-cat');
    var ok = true;

    var nameOk = nameEl.value.trim().length >= 2;
    nameEl.closest('.field').classList.toggle('has-err', !nameOk);
    if (!nameOk) ok = false;

    var priceOk = Number(priceEl.value) > 0;
    priceEl.closest('.field').classList.toggle('has-err', !priceOk);
    if (!priceOk) ok = false;

    var catOk = !!catEl.value;
    catEl.closest('.field').classList.toggle('has-err', !catOk);
    if (!catOk) ok = false;

    if (!ok) {
      U.toast('Vui lòng kiểm tra các trường bắt buộc', 'error');
      return;
    }

    var data = {
      name: nameEl.value,
      categoryId: catEl.value,
      brand: document.getElementById('pf-brand').value,
      price: priceEl.value,
      oldPrice: document.getElementById('pf-old').value,
      stock: document.getElementById('pf-stock').value,
      rating: document.getElementById('pf-rating').value,
      badge: document.getElementById('pf-badge').value,
      artColor: document.getElementById('pf-color').value,
      image: document.getElementById('pf-image').value,
      featured: document.getElementById('pf-featured').checked,
      description: document.getElementById('pf-desc').value,
      specs: {
        cpu: document.getElementById('pf-cpu').value,
        ram: document.getElementById('pf-ram').value,
        ssd: document.getElementById('pf-ssd').value,
        vga: document.getElementById('pf-vga').value,
        screen: document.getElementById('pf-screen').value
      }
    };

    try {
      if (id) {
        D.updateProduct(id, data);
        U.toast('Đã cập nhật sản phẩm');
      } else {
        D.addProduct(data);
        U.toast('Đã thêm sản phẩm mới');
      }
      closeModal('modal-product');
      renderProducts();
      updateBadges();
    } catch (err) {
      U.toast(err.message, 'error');
    }
  });

  /* ================= DANH MỤC ================= */
  function renderCategories() {
    var cats = D.categories();
    var products = D.products();

    document.getElementById('cat-list').innerHTML = cats.map(function (c) {
      var n = products.filter(function (p) { return p.categoryId === c.id; }).length;
      return '<div class="cat-row">' +
        '<span class="cat-row__ico" style="background:' + c.color + '18;color:' + c.color + '">' + U.icon(c.icon, 18) + '</span>' +
        '<div class="cat-row__meta"><b>' + U.esc(c.name) + '</b><small>' + U.esc(c.description || '—') + '</small></div>' +
        '<span class="cat-row__count">' + n + ' SP</span>' +
        '<div class="row-actions">' +
          '<button class="icon-btn icon-btn--danger" type="button" data-cdel="' + c.id + '" title="Xoá">' + U.icon('trash', 15) + '</button>' +
        '</div></div>';
    }).join('') || '<div class="empty-mini">Chưa có danh mục</div>';

    var total = products.length || 1;
    document.getElementById('cat-share').innerHTML = cats.map(function (c) {
      var n = products.filter(function (p) { return p.categoryId === c.id; }).length;
      return '<div class="catbar"><div class="catbar__top"><b>' + U.esc(c.name) + '</b>' +
        '<span>' + Math.round((n / total) * 100) + '%</span></div>' +
        '<div class="catbar__track"><div class="catbar__fill" style="width:' +
        Math.max(2, (n / total) * 100) + '%;background:' + c.color + '"></div></div></div>';
    }).join('');

    var totalStock = products.reduce(function (a, p) { return a + p.stock; }, 0);
    document.getElementById('cat-stats').innerHTML =
      '<div><b>' + cats.length + '</b><small>Danh mục</small></div>' +
      '<div><b>' + products.length + '</b><small>Sản phẩm</small></div>' +
      '<div><b>' + totalStock + '</b><small>Tồn kho</small></div>';
  }

  document.getElementById('c-add').addEventListener('click', function () {
    document.getElementById('category-form').reset();
    document.getElementById('cf-color').value = '#2563eb';
    document.querySelectorAll('#category-form .field.has-err').forEach(function (f) { f.classList.remove('has-err'); });
    openModal('modal-category');
  });

  document.getElementById('cat-list').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cdel]');
    if (!b) return;
    var c = D.categoryById(b.getAttribute('data-cdel'));
    var count = D.products().filter(function (p) { return p.categoryId === c.id; }).length;
    if (count > 0) {
      U.toast('Không thể xoá: danh mục còn ' + count + ' sản phẩm', 'error');
      return;
    }
    askDelete('Xoá danh mục "' + c.name + '"?', function () {
      try {
        D.deleteCategory(c.id);
        U.toast('Đã xoá danh mục');
        renderCategories();
        updateBadges();
      } catch (err) {
        U.toast(err.message, 'error');
      }
    });
  });

  document.getElementById('category-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('cf-name');
    if (name.value.trim().length < 2) {
      name.closest('.field').classList.add('has-err');
      U.toast('Tên danh mục quá ngắn', 'error');
      return;
    }
    try {
      D.addCategory({
        name: name.value,
        description: document.getElementById('cf-desc').value,
        icon: document.getElementById('cf-icon').value,
        color: document.getElementById('cf-color').value
      });
      U.toast('Đã tạo danh mục mới');
      closeModal('modal-category');
      renderCategories();
      updateBadges();
    } catch (err) {
      U.toast(err.message, 'error');
    }
  });

  /* ================= ĐƠN HÀNG ================= */
  var oQuery = '', oStatus = '';

  function renderOrders() {
    var list = D.orders().filter(function (o) {
      if (oStatus && o.status !== oStatus) return false;
      if (oQuery) {
        var hay = (o.code + ' ' + o.customer.name + ' ' + o.customer.phone).toLowerCase();
        if (hay.indexOf(oQuery) === -1) return false;
      }
      return true;
    });

    document.getElementById('o-count').textContent = list.length + ' đơn';
    document.getElementById('orders-table').innerHTML = list.length ? '<table class="tb">' +
      '<thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Ngày đặt</th><th>Trạng thái</th><th style="text-align:right">Xoá</th></tr></thead><tbody>' +
      list.map(function (o) {
        return '<tr>' +
          '<td class="strong">#' + o.code + '</td>' +
          '<td><div class="strong" style="font-size:.85rem">' + U.esc(o.customer.name) + '</div>' +
            '<div class="muted">' + U.esc(o.customer.phone) + '</div></td>' +
          '<td class="muted">' + o.items.reduce(function (a, i) { return a + i.qty; }, 0) + ' món<div class="muted" style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
            U.esc(o.items.map(function (i) { return i.name; }).join(', ')) + '</div></td>' +
          '<td class="num strong">' + U.money(o.total) + '</td>' +
          '<td class="muted">' + U.date(o.createdAt) + '</td>' +
          '<td><select class="select" data-ostatus="' + o.id + '" style="padding:6px 28px 6px 9px;font-size:.78rem;min-width:132px">' +
            Object.keys(STATUS).map(function (k) {
              return '<option value="' + k + '"' + (o.status === k ? ' selected' : '') + '>' + STATUS[k].label + '</option>';
            }).join('') + '</select></td>' +
          '<td><div class="row-actions"><button class="icon-btn icon-btn--danger" type="button" data-odel="' + o.id + '" title="Xoá">' + U.icon('trash', 15) + '</button></div></td>' +
          '</tr>';
      }).join('') + '</tbody></table>' : '<div class="empty-mini">Không có đơn hàng nào</div>';

    if (!document.getElementById('orders-table').dataset.bound) {
      document.getElementById('o-search').addEventListener('input', function (e) {
        oQuery = e.target.value.toLowerCase().trim();
        renderOrders();
      });
      document.getElementById('o-status').addEventListener('change', function (e) {
        oStatus = e.target.value;
        renderOrders();
      });
      document.getElementById('orders-table').dataset.bound = '1';
    }
  }

  document.getElementById('orders-table').addEventListener('change', function (e) {
    var s = e.target.closest('[data-ostatus]');
    if (!s) return;
    D.updateOrderStatus(s.getAttribute('data-ostatus'), s.value);
    U.toast('Đã cập nhật trạng thái đơn hàng');
    updateBadges();
  });

  document.getElementById('orders-table').addEventListener('click', function (e) {
    var b = e.target.closest('[data-odel]');
    if (!b) return;
    askDelete('Xoá đơn hàng này khỏi hệ thống?', function () {
      D.deleteOrder(b.getAttribute('data-odel'));
      U.toast('Đã xoá đơn hàng');
      renderOrders();
      updateBadges();
    });
  });

  /* ================= DỊCH VỤ ================= */
  function renderServices() {
    var list = D.services();
    document.getElementById('services-table').innerHTML = list.length ? '<table class="tb">' +
      '<thead><tr><th>Dịch vụ</th><th>Loại</th><th>Giá từ</th><th>Thời gian</th><th style="text-align:right">Thao tác</th></tr></thead><tbody>' +
      list.map(function (s) {
        return '<tr>' +
          '<td><div class="tb__prod"><span class="tb__thumb" style="display:grid;place-items:center;color:#2563eb;background:#eff6ff">' +
            U.icon(s.icon, 16) + '</span><div><b>' + U.esc(s.name) + '</b>' +
            '<small>' + U.esc(s.description).slice(0, 60) + (s.description.length > 60 ? '…' : '') + '</small></div></div></td>' +
          '<td><span class="chip ' + (s.type === 'warranty' ? 'chip--ok' : 'chip--info') + '">' +
            (s.type === 'warranty' ? 'Bảo hành' : 'Sửa chữa') + '</span></td>' +
          '<td class="num strong">' + U.money(s.price) + '</td>' +
          '<td class="muted">' + U.esc(s.duration) + '</td>' +
          '<td><div class="row-actions"><button class="icon-btn icon-btn--danger" type="button" data-sdel="' + s.id + '" title="Xoá">' + U.icon('trash', 15) + '</button></div></td>' +
          '</tr>';
      }).join('') + '</tbody></table>' : '<div class="empty-mini">Chưa có dịch vụ nào</div>';
  }

  document.getElementById('s-add').addEventListener('click', function () {
    document.getElementById('service-form').reset();
    document.querySelectorAll('#service-form .field.has-err').forEach(function (f) { f.classList.remove('has-err'); });
    openModal('modal-service');
  });

  document.getElementById('services-table').addEventListener('click', function (e) {
    var b = e.target.closest('[data-sdel]');
    if (!b) return;
    askDelete('Xoá dịch vụ này?', function () {
      D.deleteService(b.getAttribute('data-sdel'));
      U.toast('Đã xoá dịch vụ');
      renderServices();
    });
  });

  document.getElementById('service-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('sf-name');
    if (name.value.trim().length < 2) {
      name.closest('.field').classList.add('has-err');
      U.toast('Tên dịch vụ quá ngắn', 'error');
      return;
    }
    try {
      D.addService({
        name: name.value,
        type: document.getElementById('sf-type').value,
        price: document.getElementById('sf-price').value,
        duration: document.getElementById('sf-duration').value,
        icon: document.getElementById('sf-icon').value,
        description: document.getElementById('sf-desc').value
      });
      U.toast('Đã thêm dịch vụ mới');
      closeModal('modal-service');
      renderServices();
    } catch (err) {
      U.toast(err.message, 'error');
    }
  });

  /* ================= LỊCH HẸN ================= */
  var bStatus = '';

  function renderBookings() {
    var list = D.bookings().filter(function (b) { return !bStatus || b.status === bStatus; });
    var services = D.services();
    document.getElementById('b-count').textContent = list.length + ' lịch hẹn';
    document.getElementById('bookings-table').innerHTML = list.length ? '<table class="tb">' +
      '<thead><tr><th>Khách hàng</th><th>Dịch vụ</th><th>Thiết bị / Tình trạng</th><th>Ngày hẹn</th><th>Trạng thái</th><th style="text-align:right">Xoá</th></tr></thead><tbody>' +
      list.map(function (b) {
        var s = services.find(function (x) { return x.id === b.serviceId; });
        return '<tr>' +
          '<td><div class="strong" style="font-size:.85rem">' + U.esc(b.name) + '</div>' +
            '<div class="muted">' + U.esc(b.phone) + '</div></td>' +
          '<td>' + U.esc(s ? s.name : '—') + '</td>' +
          '<td><div style="font-size:.82rem;color:#0a1120">' + U.esc(b.device) + '</div>' +
            '<div class="muted" style="max-width:220px">' + U.esc(b.issue || '—') + '</div></td>' +
          '<td class="muted">' + U.date(b.date) + '</td>' +
          '<td><select class="select" data-bstatus="' + b.id + '" style="padding:6px 28px 6px 9px;font-size:.78rem;min-width:132px">' +
            Object.keys(BK_STATUS).map(function (k) {
              return '<option value="' + k + '"' + (b.status === k ? ' selected' : '') + '>' + BK_STATUS[k].label + '</option>';
            }).join('') + '</select></td>' +
          '<td><div class="row-actions"><button class="icon-btn icon-btn--danger" type="button" data-bdel="' + b.id + '" title="Xoá">' + U.icon('trash', 15) + '</button></div></td>' +
          '</tr>';
      }).join('') + '</tbody></table>' : '<div class="empty-mini">Chưa có lịch hẹn nào</div>';

    if (!document.getElementById('bookings-table').dataset.bound) {
      document.getElementById('b-status').addEventListener('change', function (e) {
        bStatus = e.target.value;
        renderBookings();
      });
      document.getElementById('bookings-table').dataset.bound = '1';
    }
  }

  document.getElementById('bookings-table').addEventListener('change', function (e) {
    var s = e.target.closest('[data-bstatus]');
    if (!s) return;
    D.updateBookingStatus(s.getAttribute('data-bstatus'), s.value);
    U.toast('Đã cập nhật trạng thái lịch hẹn');
    updateBadges();
  });

  document.getElementById('bookings-table').addEventListener('click', function (e) {
    var b = e.target.closest('[data-bdel]');
    if (!b) return;
    askDelete('Xoá lịch hẹn này?', function () {
      D.deleteBooking(b.getAttribute('data-bdel'));
      U.toast('Đã xoá lịch hẹn');
      renderBookings();
      updateBadges();
    });
  });

  /* ================= KHÁCH HÀNG ================= */
  var uQuery = '';

  function renderCustomers() {
    var users = D.users().filter(function (u) {
      if (!uQuery) return true;
      return (u.name + ' ' + u.email).toLowerCase().indexOf(uQuery) > -1;
    });
    var orders = D.orders();

    document.getElementById('u-count').textContent = users.length + ' tài khoản';
    document.getElementById('users-table').innerHTML = users.length ? '<table class="tb">' +
      '<thead><tr><th>Khách hàng</th><th>Điện thoại</th><th>Vai trò</th><th>Đơn hàng</th><th>Ngày tạo</th><th style="text-align:right">Xoá</th></tr></thead><tbody>' +
      users.map(function (u) {
        var cnt = orders.filter(function (o) { return o.userId === u.id; }).length;
        return '<tr>' +
          '<td><div style="display:flex;align-items:center;gap:10px">' +
            '<span style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#06b6d4);color:#fff;display:grid;place-items:center;font-weight:800;font-size:.78rem">' +
            U.esc(u.name.charAt(0).toUpperCase()) + '</span>' +
            '<div><div class="strong" style="font-size:.85rem">' + U.esc(u.name) + '</div>' +
            '<div class="muted">' + U.esc(u.email) + '</div></div></div></td>' +
          '<td class="muted">' + U.esc(u.phone || '—') + '</td>' +
          '<td><span class="status ' + (u.role === 'admin' ? 'status--admin' : 'status--customer') + '">' +
            (u.role === 'admin' ? 'Quản trị' : 'Khách hàng') + '</span></td>' +
          '<td class="num">' + cnt + '</td>' +
          '<td class="muted">' + U.date(u.createdAt) + '</td>' +
          '<td><div class="row-actions">' +
            (u.role === 'admin' ? '<span class="muted" style="font-size:.75rem">—</span>' :
              '<button class="icon-btn icon-btn--danger" type="button" data-udel="' + u.id + '" title="Xoá">' + U.icon('trash', 15) + '</button>') +
          '</div></td></tr>';
      }).join('') + '</tbody></table>' : '<div class="empty-mini">Không tìm thấy tài khoản</div>';

    if (!document.getElementById('users-table').dataset.bound) {
      document.getElementById('u-search').addEventListener('input', function (e) {
        uQuery = e.target.value.toLowerCase().trim();
        renderCustomers();
      });
      document.getElementById('users-table').dataset.bound = '1';
    }
  }

  document.getElementById('users-table').addEventListener('click', function (e) {
    var b = e.target.closest('[data-udel]');
    if (!b) return;
    askDelete('Xoá tài khoản khách hàng này?', function () {
      try {
        D.deleteUser(b.getAttribute('data-udel'));
        U.toast('Đã xoá tài khoản');
        renderCustomers();
        updateBadges();
      } catch (err) {
        U.toast(err.message, 'error');
      }
    });
  });

  /* ================= CÀI ĐẶT ================= */
  function renderSettings() {
    var st = D.settings();
    document.getElementById('st-name').value = st.siteName;
    document.getElementById('st-hotline').value = st.hotline;
    document.getElementById('st-email').value = st.email;
    document.getElementById('st-address').value = st.address;
    document.getElementById('st-hours').value = st.openHours;

    var s = D.stats();
    document.getElementById('data-stats').innerHTML =
      '<div><b>' + s.productCount + '</b><small>Sản phẩm</small></div>' +
      '<div><b>' + s.orderCount + '</b><small>Đơn hàng</small></div>' +
      '<div><b>' + (s.customerCount + 1) + '</b><small>Tài khoản</small></div>';
  }

  document.getElementById('settings-form').addEventListener('submit', function (e) {
    e.preventDefault();
    D.updateSettings({
      siteName: document.getElementById('st-name').value,
      hotline: document.getElementById('st-hotline').value,
      email: document.getElementById('st-email').value,
      address: document.getElementById('st-address').value,
      openHours: document.getElementById('st-hours').value
    });
    U.toast('Đã lưu cài đặt cửa hàng');
  });

  document.getElementById('export-data').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(D.db(), null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'azmobile-data-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
    U.toast('Đã xuất dữ liệu');
  });

  document.getElementById('reset-data').addEventListener('click', function () {
    askDelete('Khôi phục dữ liệu mẫu? Toàn bộ thay đổi của bạn sẽ bị mất.', function () {
      D.reset();
      U.toast('Đã khôi phục dữ liệu mẫu');
      setTimeout(function () { location.reload(); }, 700);
    });
  });

  /* ================= MODAL ================= */
  function openModal(id) {
    document.getElementById(id).classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    document.getElementById(id).classList.remove('is-open');
    document.body.style.overflow = '';
  }
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-close]');
    if (c) closeModal(c.getAttribute('data-close'));
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.is-open').forEach(function (m) { m.classList.remove('is-open'); });
      document.body.style.overflow = '';
    }
  });

  var confirmCb = null;
  function askDelete(text, cb) {
    document.getElementById('confirm-text').textContent = text;
    confirmCb = cb;
    openModal('modal-confirm');
  }
  document.getElementById('confirm-ok').addEventListener('click', function () {
    closeModal('modal-confirm');
    if (confirmCb) confirmCb();
    confirmCb = null;
  });

  /* ================= TÌM KIẾM TOPBAR ================= */
  document.getElementById('ad-search').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var q = e.target.value.trim();
    if (!q) return;
    go('products');
    document.getElementById('p-search').value = q;
    pQuery = q.toLowerCase();
    renderProducts();
  });

  /* ================= KHỞI ĐỘNG ================= */
  var initial = (location.hash || '#dashboard').slice(1);
  if (!TITLES[initial]) initial = 'dashboard';
  go(initial);
  updateBadges();
})();
