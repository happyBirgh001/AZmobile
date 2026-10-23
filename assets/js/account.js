/* AZmobile — Trang tài khoản khách hàng */
(function () {
  'use strict';
  var U = AZUI, D = AZDB;

  U.mountLayout('account.html');

  if (!D.session()) {
    U.requireLogin('account.html');
    return;
  }

  var session = D.session();
  var raw = D.rawUser(session.id);
  if (!raw) {
    D.logout();
    location.href = 'login.html';
    return;
  }

  document.getElementById('acct-ava').textContent = raw.name.charAt(0).toUpperCase();
  document.getElementById('acct-name').textContent = raw.name;
  document.getElementById('acct-email').textContent = raw.email;
  if (raw.role === 'admin') document.getElementById('admin-link').style.display = 'inline-flex';

  var content = document.getElementById('acct-content');
  var menu = document.getElementById('acct-menu');

  var STATUS = {
    pending: { label: 'Chờ xác nhận', cls: 'status--pending' },
    confirmed: { label: 'Đã xác nhận', cls: 'status--confirmed' },
    shipping: { label: 'Đang giao', cls: 'status--shipping' },
    completed: { label: 'Hoàn thành', cls: 'status--completed' },
    cancelled: { label: 'Đã huỷ', cls: 'status--cancelled' }
  };

  function statusChip(s) {
    var st = STATUS[s] || { label: s, cls: 'status--pending' };
    return '<span class="status ' + st.cls + '">' + st.label + '</span>';
  }

  /* ---------------- Hồ sơ ---------------- */
  function viewProfile() {
    var orders = D.ordersByUser(raw.id);
    var bookings = D.bookings().filter(function (b) { return b.userId === raw.id; });
    var spent = orders.filter(function (o) { return o.status !== 'cancelled'; })
      .reduce(function (s, o) { return s + o.total; }, 0);

    content.innerHTML = '' +
      '<div class="panel" style="margin-bottom:18px">' +
        '<div class="panel__head"><h3>Thông tin cá nhân</h3>' +
          '<span class="chip chip--info">' + (raw.role === 'admin' ? 'Quản trị viên' : 'Khách hàng') + '</span></div>' +
        '<div class="panel__body">' +
          '<form id="profile-form" novalidate>' +
            '<div class="form-row">' +
              '<div class="field"><label for="pf-name">Họ và tên <span class="req">*</span></label>' +
                '<input class="input" id="pf-name" type="text" value="' + U.esc(raw.name) + '">' +
                '<span class="field__err">Tên tối thiểu 2 ký tự.</span></div>' +
              '<div class="field"><label for="pf-phone">Số điện thoại</label>' +
                '<input class="input" id="pf-phone" type="tel" value="' + U.esc(raw.phone || '') + '" placeholder="0912 345 678"></div>' +
            '</div>' +
            '<div class="field"><label for="pf-email">Email</label>' +
              '<input class="input" id="pf-email" type="email" value="' + U.esc(raw.email) + '" disabled>' +
              '<span class="field__hint">Email dùng để đăng nhập, không thể thay đổi.</span></div>' +
            '<div class="form-row">' +
              '<div class="field"><label for="pf-pass">Mật khẩu mới</label>' +
                '<input class="input" id="pf-pass" type="password" placeholder="Để trống nếu không đổi">' +
                '<span class="field__err">Mật khẩu tối thiểu 6 ký tự.</span></div>' +
              '<div class="field"><label for="pf-pass2">Nhập lại mật khẩu mới</label>' +
                '<input class="input" id="pf-pass2" type="password" placeholder="Nhập lại">' +
                '<span class="field__err">Mật khẩu nhập lại không khớp.</span></div>' +
            '</div>' +
            '<button class="btn btn--primary" type="submit">Lưu thay đổi</button>' +
          '</form>' +
        '</div>' +
      '</div>' +

      '<div class="panel">' +
        '<div class="panel__head"><h3>Tổng quan hoạt động</h3></div>' +
        '<div class="panel__body">' +
          '<div class="stat-mini">' +
            '<div><b>' + orders.length + '</b><small>Đơn hàng</small></div>' +
            '<div><b>' + bookings.length + '</b><small>Lịch hẹn dịch vụ</small></div>' +
            '<div><b>' + U.money(spent) + '</b><small>Tổng chi tiêu</small></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.getElementById('profile-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('pf-name');
      var phone = document.getElementById('pf-phone');
      var pass = document.getElementById('pf-pass');
      var pass2 = document.getElementById('pf-pass2');
      var ok = true;

      name.closest('.field').classList.toggle('has-err', name.value.trim().length < 2);
      if (name.value.trim().length < 2) ok = false;

      if (pass.value) {
        var bad = pass.value.length < 6 || pass.value !== pass2.value;
        pass.closest('.field').classList.toggle('has-err', pass.value.length < 6);
        pass2.closest('.field').classList.toggle('has-err', pass.value !== pass2.value);
        if (bad) ok = false;
      }

      if (!ok) {
        U.toast('Vui lòng kiểm tra lại thông tin', 'error');
        return;
      }

      try {
        D.updateProfile(raw.id, {
          name: name.value,
          phone: phone.value,
          password: pass.value || undefined
        });
        raw = D.rawUser(raw.id);
        document.getElementById('acct-name').textContent = raw.name;
        U.toast('Đã cập nhật thông tin cá nhân');
        viewProfile();
      } catch (err) {
        U.toast(err.message, 'error');
      }
    });
  }

  /* ---------------- Đơn hàng ---------------- */
  function viewOrders() {
    var orders = D.ordersByUser(raw.id);
    if (!orders.length) {
      content.innerHTML = '<div class="panel"><div class="panel__head"><h3>Đơn hàng của tôi</h3></div>' +
        '<div class="empty-mini">' + U.icon('receipt', 34) +
        '<div>Bạn chưa có đơn hàng nào.</div>' +
        '<a class="btn btn--primary btn--sm" href="shop.html" style="margin-top:14px">Mua sắm ngay</a></div></div>';
      return;
    }

    content.innerHTML = '<div class="panel"><div class="panel__head"><h3>Đơn hàng của tôi</h3>' +
      '<small>' + orders.length + ' đơn</small></div><div class="panel__body">' +
      orders.map(function (o) {
        var payLabel = { cod: 'COD', bank: 'Chuyển khoản', installment: 'Trả góp 0%' }[o.payment] || o.payment;
        return '<div class="order-card">' +
          '<div class="order-card__head">' +
            '<span class="order-card__code">#' + o.code + '</span>' +
            '<span class="order-card__date">' + U.dateTime(o.createdAt) + '</span>' +
            '<span class="chip">' + payLabel + '</span>' +
            '<span style="margin-left:auto">' + statusChip(o.status) + '</span>' +
          '</div>' +
          '<div class="order-card__body">' +
            o.items.map(function (i) {
              var p = D.productById(i.productId);
              return '<div class="order-line">' +
                '<span class="order-line__thumb">' + (p ? U.productArt(p) : '') + '</span>' +
                '<span class="order-line__name">' + U.esc(i.name) + '</span>' +
                '<span class="order-line__qty">×' + i.qty + '</span>' +
                '<span style="font-weight:700;color:#0a1120">' + U.money(i.price * i.qty) + '</span>' +
                '</div>';
            }).join('') +
          '</div>' +
          '<div class="order-card__foot">' +
            '<span style="color:#64748b;font-size:.82rem">' + U.esc(o.customer.address) + '</span>' +
            '<span>Tổng: <b>' + U.money(o.total) + '</b></span>' +
          '</div>' +
        '</div>';
      }).join('') + '</div></div>';
  }

  /* ---------------- Lịch hẹn ---------------- */
  function viewBookings() {
    var list = D.bookings().filter(function (b) { return b.userId === raw.id; });
    var services = D.services();
    var BK = {
      pending: { label: 'Chờ xác nhận', cls: 'status--pending' },
      confirmed: { label: 'Đã xác nhận', cls: 'status--confirmed' },
      done: { label: 'Đã hoàn thành', cls: 'status--completed' },
      cancelled: { label: 'Đã huỷ', cls: 'status--cancelled' }
    };

    content.innerHTML = '<div class="panel"><div class="panel__head"><h3>Lịch hẹn dịch vụ</h3>' +
      '<a class="btn btn--ghost btn--sm" href="services.html#booking">Đặt lịch mới</a></div><div class="panel__body">' +
      (list.length ? list.map(function (b) {
        var s = services.find(function (x) { return x.id === b.serviceId; });
        var st = BK[b.status] || BK.pending;
        return '<div class="order-card">' +
          '<div class="order-card__head">' +
            '<span class="order-card__code">' + U.esc(s ? s.name : 'Dịch vụ') + '</span>' +
            '<span class="order-card__date">Hẹn: ' + U.date(b.date) + '</span>' +
            '<span style="margin-left:auto"><span class="status ' + st.cls + '">' + st.label + '</span></span>' +
          '</div>' +
          '<div class="panel__body" style="padding:14px 16px">' +
            '<div style="font-size:.86rem;color:#475569;line-height:1.7">' +
              '<div><b style="color:#0a1120">Thiết bị:</b> ' + U.esc(b.device) + '</div>' +
              (b.issue ? '<div><b style="color:#0a1120">Tình trạng:</b> ' + U.esc(b.issue) + '</div>' : '') +
              '<div><b style="color:#0a1120">Liên hệ:</b> ' + U.esc(b.phone) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('') : '<div class="empty-mini">' + U.icon('wrench', 34) +
        '<div>Bạn chưa có lịch hẹn nào.</div>' +
        '<a class="btn btn--primary btn--sm" href="services.html#booking" style="margin-top:14px">Đặt lịch ngay</a></div>') +
      '</div></div>';
  }

  /* ---------------- Điều hướng ---------------- */
  var views = { profile: viewProfile, orders: viewOrders, bookings: viewBookings };
  var current = (location.hash || '#profile').slice(1);
  if (!views[current]) current = 'profile';

  function show(v) {
    current = v;
    menu.querySelectorAll('[data-view]').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.view === v);
    });
    views[v]();
    history.replaceState(null, '', '#' + v);
  }

  menu.addEventListener('click', function (e) {
    var b = e.target.closest('[data-view]');
    if (b) show(b.dataset.view);
  });

  document.getElementById('acct-logout').addEventListener('click', function () {
    D.logout();
    U.toast('Đã đăng xuất', 'info');
    setTimeout(function () { location.href = 'index.html'; }, 500);
  });

  show(current);
})();
