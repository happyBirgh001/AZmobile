/* AZmobile — Trang sửa chữa & bảo hành */
(function () {
  'use strict';
  var U = AZUI, D = AZDB;

  U.mountLayout('services.html');

  /* --- SEO --- */
  if (window.AZSEO) {
    AZSEO.page({
      title: 'Sửa chữa, bảo hành & nâng cấp laptop',
      description: 'Trung tâm bảo hành AZmobile: sửa mainboard, thay bàn phím, nâng cấp SSD/RAM, vệ sinh tản nhiệt, cứu dữ liệu. Báo giá trước, bảo hành 6 tháng, lấy ngay trong ngày.',
      keywords: 'sửa chữa laptop, bảo hành laptop, nâng cấp SSD, thay RAM, vệ sinh tản nhiệt, cứu dữ liệu, AZmobile',
      url: AZSEO.abs('services.html')
    });
  }

  var services = D.services();
  var settings = D.settings();
  document.getElementById('booking-hotline').textContent = settings.hotline + ' · ' + settings.openHours;

  /* --- Vì sao chọn trung tâm --- */
  var feats = [
    { icon: 'wrench', title: 'Kỹ thuật viên 8+ năm', text: 'Chuyên sâu mainboard, nguồn, tản nhiệt cho mọi thương hiệu.' },
    { icon: 'shield', title: 'Linh kiện chính hãng', text: 'Nhập trực tiếp, có tem bảo hành, không dùng hàng trôi nổi.' },
    { icon: 'clock', title: 'Xử lý trong 24 giờ', text: 'Các lỗi thông thường hoàn thành trong ngày, có máy dự phòng.' },
    { icon: 'receipt', title: 'Báo giá trước', text: 'Không đồng ý thì không sửa, miễn phí công kiểm tra.' }
  ];
  document.getElementById('svc-feats').innerHTML = feats.map(function (f) {
    return '<div class="feat"><span class="feat__ico">' + U.icon(f.icon, 21) + '</span>' +
      '<div><strong>' + f.title + '</strong><small>' + f.text + '</small></div></div>';
  }).join('');

  /* --- Thẻ dịch vụ --- */
  function svcCard(s) {
    return '<article class="svc">' +
      '<div class="svc__top">' +
        '<span class="svc__ico">' + U.icon(s.icon, 22) + '</span>' +
        '<span class="chip ' + (s.type === 'warranty' ? 'chip--ok' : 'chip--info') + '">' +
          (s.type === 'warranty' ? 'Bảo hành' : 'Sửa chữa') + '</span>' +
      '</div>' +
      '<div><h3>' + U.esc(s.name) + '</h3><p>' + U.esc(s.description) + '</p></div>' +
      '<div class="svc__meta">' + U.icon('clock', 15) + '<span>' + U.esc(s.duration) + '</span>' +
        '<span class="svc__price">' + U.money(s.price) + '<small>từ</small></span></div>' +
      '<button class="btn btn--ghost btn--sm" type="button" data-book="' + s.id + '">Đặt lịch dịch vụ này</button>' +
      '</article>';
  }

  document.getElementById('repair-grid').innerHTML =
    services.filter(function (s) { return s.type === 'repair'; }).map(svcCard).join('') ||
    '<p style="color:#64748b">Chưa có dịch vụ sửa chữa.</p>';

  document.getElementById('warranty-grid').innerHTML =
    services.filter(function (s) { return s.type === 'warranty'; }).map(svcCard).join('') ||
    '<p style="color:#64748b">Chưa có gói bảo hành.</p>';

  /* --- Quy trình --- */
  var steps = [
    { icon: 'phone', title: '1. Đặt lịch', text: 'Điền form hoặc gọi hotline. Xác nhận trong 15 phút.' },
    { icon: 'search', title: '2. Kiểm tra', text: 'Kỹ thuật viên kiểm tra, báo lỗi và giá cụ thể.' },
    { icon: 'wrench', title: '3. Sửa chữa', text: 'Thực hiện sau khi bạn đồng ý, cập nhật tiến độ.' },
    { icon: 'check', title: '4. Bàn giao', text: 'Test máy cùng bạn, xuất phiếu bảo hành linh kiện.' }
  ];
  document.getElementById('steps-grid').innerHTML = steps.map(function (s) {
    return '<div class="feat"><span class="feat__ico">' + U.icon(s.icon, 21) + '</span>' +
      '<div><strong>' + s.title + '</strong><small>' + s.text + '</small></div></div>';
  }).join('');

  /* --- Form đặt lịch --- */
  var sel = document.getElementById('bk-service');
  sel.innerHTML = '<option value="">— Chọn dịch vụ —</option>' +
    services.map(function (s) {
      return '<option value="' + s.id + '">' + U.esc(s.name) + ' · từ ' + U.money(s.price) + '</option>';
    }).join('');

  var session = D.session();
  if (session) {
    var raw = D.rawUser(session.id);
    document.getElementById('bk-name').value = session.name || '';
    if (raw) document.getElementById('bk-phone').value = raw.phone || '';
  }

  // Ngày mặc định: mai
  var tomorrow = new Date(Date.now() + 86400000);
  document.getElementById('bk-date').value = tomorrow.toISOString().slice(0, 10);
  document.getElementById('bk-date').min = new Date().toISOString().slice(0, 10);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-book]');
    if (!btn) return;
    sel.value = btn.getAttribute('data-book');
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function () { document.getElementById('bk-name').focus({ preventScroll: true }); }, 480);
  });

  var form = document.getElementById('booking-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('bk-name');
    var phone = document.getElementById('bk-phone');
    var device = document.getElementById('bk-device');
    var ok = true;

    [[name, name.value.trim().length >= 2],
     [phone, /^[0-9+\s.\-]{9,15}$/.test(phone.value.trim())],
     [device, device.value.trim().length >= 2],
     [sel, !!sel.value]].forEach(function (pair) {
      var el = pair[0], valid = pair[1];
      var field = el.closest('.field');
      field.classList.toggle('has-err', !valid);
      if (!valid) ok = false;
    });

    if (!ok) {
      U.toast('Vui lòng kiểm tra lại thông tin', 'error');
      return;
    }

    var btn = document.getElementById('bk-submit');
    btn.disabled = true;
    btn.textContent = 'Đang gửi...';

    try {
      var booking = D.createBooking({
        serviceId: sel.value,
        name: name.value,
        phone: phone.value,
        device: device.value,
        issue: document.getElementById('bk-issue').value,
        date: document.getElementById('bk-date').value
      });
      U.toast('Đặt lịch thành công! Chúng tôi sẽ gọi xác nhận.');
      form.reset();
      document.getElementById('bk-date').value = tomorrow.toISOString().slice(0, 10);
      var svc = services.find(function (s) { return s.id === booking.serviceId; });
      var host = document.getElementById('booking');
      var box = document.createElement('div');
      box.className = 'success-box';
      box.style.cssText = 'margin:22px 0 0;padding:26px;max-width:none;text-align:left';
      box.innerHTML = '<div style="display:flex;gap:14px;align-items:flex-start">' +
        '<span class="success-box__ico" style="margin:0;width:46px;height:46px;flex:0 0 auto">' + U.icon('check', 22) + '</span>' +
        '<div><h3 style="margin:0 0 4px">Đã ghi nhận lịch hẹn</h3>' +
        '<p style="margin:0;font-size:.87rem;color:#64748b">Mã lịch hẹn <b style="color:#0a1120">' + booking.id.slice(-6).toUpperCase() + '</b> · ' +
        U.esc(svc ? svc.name : 'Dịch vụ') + ' · ' + U.date(booking.date) + '<br>Chúng tôi sẽ liên hệ số ' + U.esc(booking.phone) + ' để xác nhận.</p></div></div>';
      host.appendChild(box);
    } catch (err) {
      U.toast(err.message || 'Không thể đặt lịch', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Xác nhận đặt lịch';
    }
  });
})();
