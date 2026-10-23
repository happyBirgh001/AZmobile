/* AZmobile — Giỏ hàng & thanh toán */
(function () {
  'use strict';
  var U = AZUI, D = AZDB;

  U.mountLayout('cart.html');

  var root = document.getElementById('cart-root');
  var session = D.session();

  function render() {
    var items = AZCART.detail();
    var sub = document.getElementById('cart-sub');

    if (!items.length) {
      sub.textContent = 'Giỏ hàng đang trống.';
      root.innerHTML = '<div class="empty" style="margin:36px 0 80px">' + U.icon('cart', 44) +
        '<h3>Giỏ hàng của bạn đang trống</h3>' +
        '<p>Hãy thêm vài sản phẩm rồi quay lại nhé.</p>' +
        '<a class="btn btn--primary" href="shop.html">Khám phá sản phẩm</a></div>';
      return;
    }

    sub.textContent = items.length + ' sản phẩm trong giỏ hàng.';
    var subtotal = AZCART.subtotal();
    var ship = subtotal >= 5000000 ? 0 : 50000;
    var total = subtotal + ship;

    root.innerHTML = '' +
      '<div class="cart-layout">' +
        '<div>' +
          '<div class="panel">' +
            '<div class="panel__head">' +
              '<h3>Sản phẩm (' + items.length + ')</h3>' +
              '<button class="btn btn--ghost btn--sm" type="button" id="clear-cart">Xoá tất cả</button>' +
            '</div>' +
            items.map(function (it) {
              var p = it.product;
              return '<div class="citem">' +
                '<a class="citem__img" href="product.html?id=' + p.id + '">' + U.productArt(p) + '</a>' +
                '<div>' +
                  '<a class="citem__name" href="product.html?id=' + p.id + '">' + U.esc(p.name) + '</a>' +
                  '<p class="citem__spec">' + U.esc([p.brand, p.specs.cpu, p.specs.ram, p.specs.ssd].filter(function (x) { return x && x !== '—'; }).join(' · ')) + '</p>' +
                  '<div class="citem__tools">' +
                    '<div class="qty">' +
                      '<button type="button" data-dec="' + p.id + '" aria-label="Giảm">−</button>' +
                      '<input type="number" value="' + it.qty + '" min="1" max="' + Math.max(1, p.stock) + '" data-qty="' + p.id + '" aria-label="Số lượng">' +
                      '<button type="button" data-inc="' + p.id + '" aria-label="Tăng">+</button>' +
                    '</div>' +
                    '<button class="citem__del" type="button" data-del="' + p.id + '" aria-label="Xoá">' + U.icon('trash', 17) + '</button>' +
                  '</div>' +
                '</div>' +
                '<div class="citem__price">' +
                  '<strong>' + U.money(it.lineTotal) + '</strong>' +
                  (p.oldPrice > p.price ? '<del>' + U.money(p.oldPrice * it.qty) + '</del>' : '') +
                '</div>' +
                '</div>';
            }).join('') +
          '</div>' +

          '<div class="panel" style="margin-top:18px">' +
            '<div class="panel__head"><h3>Thông tin nhận hàng</h3></div>' +
            '<div class="panel__body">' +
              '<form id="checkout-form" novalidate>' +
                '<div class="form-row">' +
                  '<div class="field"><label for="co-name">Họ và tên <span class="req">*</span></label>' +
                    '<input class="input" id="co-name" type="text" placeholder="Nguyễn Văn A" required>' +
                    '<span class="field__err">Vui lòng nhập họ tên.</span></div>' +
                  '<div class="field"><label for="co-phone">Số điện thoại <span class="req">*</span></label>' +
                    '<input class="input" id="co-phone" type="tel" placeholder="0912 345 678" required>' +
                    '<span class="field__err">Số điện thoại chưa hợp lệ.</span></div>' +
                '</div>' +
                '<div class="field"><label for="co-address">Địa chỉ nhận hàng <span class="req">*</span></label>' +
                  '<input class="input" id="co-address" type="text" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" required>' +
                  '<span class="field__err">Vui lòng nhập địa chỉ.</span></div>' +
                '<div class="field"><label for="co-note">Ghi chú đơn hàng</label>' +
                  '<textarea class="textarea" id="co-note" placeholder="VD: Giao giờ hành chính, xuất hoá đơn công ty..."></textarea></div>' +
                '<div class="field" style="margin-bottom:0">' +
                  '<label>Phương thức thanh toán</label>' +
                  '<div class="pay-methods" id="pay-methods">' +
                    '<label class="pay-opt is-sel"><input type="radio" name="pay" value="cod" checked>' +
                      '<span><b>Thanh toán khi nhận hàng (COD)</b><small>Kiểm tra máy trước khi trả tiền</small></span></label>' +
                    '<label class="pay-opt"><input type="radio" name="pay" value="bank">' +
                      '<span><b>Chuyển khoản ngân hàng</b><small>Nhận thông tin tài khoản sau khi đặt</small></span></label>' +
                    '<label class="pay-opt"><input type="radio" name="pay" value="installment">' +
                      '<span><b>Trả góp 0% qua thẻ</b><small>Nhân viên gọi tư vấn hồ sơ</small></span></label>' +
                  '</div>' +
                '</div>' +
              '</form>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<aside class="summary">' +
          '<div class="panel">' +
            '<div class="panel__head"><h3>Tóm tắt đơn hàng</h3></div>' +
            '<div class="panel__body">' +
              '<div class="summary__row"><span>Tạm tính</span><b>' + U.money(subtotal) + '</b></div>' +
              '<div class="summary__row"><span>Phí vận chuyển</span><b>' + (ship ? U.money(ship) : 'Miễn phí') + '</b></div>' +
              '<div class="summary__row"><span>Giảm giá</span><b>—</b></div>' +
              '<div class="summary__total"><span>Tổng cộng</span><b>' + U.money(total) + '</b></div>' +
              (ship ? '<div class="ship-note">Mua thêm ' + U.money(5000000 - subtotal) + ' để được miễn phí giao hàng.</div>'
                    : '<div class="ship-note">Đơn hàng của bạn được miễn phí giao hàng toàn quốc.</div>') +
              '<button class="btn btn--primary btn--block btn--lg" type="button" id="place-order" style="margin-top:18px">Đặt hàng ngay</button>' +
              '<a class="btn btn--ghost btn--block" href="shop.html" style="margin-top:9px">Tiếp tục mua sắm</a>' +
              '<p style="font-size:.75rem;color:#94a3b8;margin:14px 0 0;text-align:center">Bằng việc đặt hàng, bạn đồng ý với chính sách bán hàng của AZmobile.</p>' +
            '</div>' +
          '</div>' +
        '</aside>' +
      '</div>';

    // Prefill
    if (session) {
      document.getElementById('co-name').value = session.name || '';
      var raw = D.rawUser(session.id);
      if (raw) document.getElementById('co-phone').value = raw.phone || '';
    }

    bind();
  }

  function bind() {
    if (root.dataset.bound) return;
    root.dataset.bound = '1';

    root.addEventListener('click', function (e) {
      var t = e.target;
      var inc = t.closest('[data-inc]');
      var dec = t.closest('[data-dec]');
      var del = t.closest('[data-del]');

      if (inc) {
        var id = inc.getAttribute('data-inc');
        var cur = AZCART.read().find(function (i) { return i.productId === id; });
        AZCART.setQty(id, (cur ? cur.qty : 1) + 1);
        render();
      }
      if (dec) {
        var id2 = dec.getAttribute('data-dec');
        var cur2 = AZCART.read().find(function (i) { return i.productId === id2; });
        if (cur2 && cur2.qty <= 1) {
          AZCART.remove(id2);
          U.toast('Đã xoá sản phẩm khỏi giỏ', 'info');
        } else {
          AZCART.setQty(id2, (cur2 ? cur2.qty : 1) - 1);
        }
        render();
      }
      if (del) {
        AZCART.remove(del.getAttribute('data-del'));
        U.toast('Đã xoá sản phẩm khỏi giỏ', 'info');
        render();
      }
      if (t.id === 'clear-cart') {
        if (confirm('Xoá toàn bộ sản phẩm trong giỏ hàng?')) {
          AZCART.clear();
          render();
        }
      }
      if (t.id === 'place-order') placeOrder();
    });

    root.addEventListener('change', function (e) {
      if (e.target.dataset.qty) {
        AZCART.setQty(e.target.dataset.qty, e.target.value);
        render();
      }
      if (e.target.name === 'pay') {
        root.querySelectorAll('.pay-opt').forEach(function (el) {
          el.classList.toggle('is-sel', el.querySelector('input').checked);
        });
      }
    });
  }

  function placeOrder() {
    var name = document.getElementById('co-name');
    var phone = document.getElementById('co-phone');
    var addr = document.getElementById('co-address');
    var ok = true;

    [[name, name.value.trim().length >= 2],
     [phone, /^[0-9+\s.\-]{9,15}$/.test(phone.value.trim())],
     [addr, addr.value.trim().length >= 8]].forEach(function (pair) {
      var el = pair[0], valid = pair[1];
      el.closest('.field').classList.toggle('has-err', !valid);
      if (!valid) ok = false;
    });

    if (!ok) {
      U.toast('Vui lòng kiểm tra lại thông tin nhận hàng', 'error');
      var firstErr = root.querySelector('.field.has-err');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    var pay = root.querySelector('input[name="pay"]:checked').value;
    var items = AZCART.detail().map(function (i) {
      return { productId: i.product.id, name: i.product.name, price: i.product.price, qty: i.qty };
    });

    var btn = document.getElementById('place-order');
    btn.disabled = true;
    btn.textContent = 'Đang xử lý...';

    try {
      var order = D.createOrder({
        userId: session ? session.id : null,
        customer: { name: name.value.trim(), phone: phone.value.trim(), address: addr.value.trim(), note: document.getElementById('co-note').value.trim() },
        items: items,
        payment: pay
      });
      AZCART.clear();
      showSuccess(order);
    } catch (err) {
      U.toast(err.message || 'Không thể đặt hàng', 'error');
      btn.disabled = false;
      btn.textContent = 'Đặt hàng ngay';
    }
  }

  function showSuccess(order) {
    document.getElementById('cart-sub').textContent = 'Đặt hàng thành công.';
    var payLabel = { cod: 'Thanh toán khi nhận hàng (COD)', bank: 'Chuyển khoản ngân hàng', installment: 'Trả góp 0% qua thẻ' }[order.payment];
    root.innerHTML = '<div class="success-box">' +
      '<div class="success-box__ico">' + U.icon('check', 30) + '</div>' +
      '<h2>Cảm ơn bạn đã đặt hàng!</h2>' +
      '<p>Đơn hàng đã được ghi nhận. Nhân viên AZmobile sẽ gọi xác nhận trong vòng 15 phút (giờ hành chính).</p>' +
      '<div class="success-box__code">' + order.code + '</div>' +
      '<div style="display:grid;gap:8px;text-align:left;max-width:380px;margin:0 auto 24px;font-size:.87rem">' +
        '<div class="summary__row"><span>Người nhận</span><b>' + U.esc(order.customer.name) + '</b></div>' +
        '<div class="summary__row"><span>Điện thoại</span><b>' + U.esc(order.customer.phone) + '</b></div>' +
        '<div class="summary__row"><span>Thanh toán</span><b>' + payLabel + '</b></div>' +
        '<div class="summary__row"><span>Tổng tiền</span><b style="color:#e11d48;font-size:1.05rem">' + U.money(order.total) + '</b></div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
        '<a class="btn btn--primary" href="account.html#orders">Xem đơn hàng của tôi</a>' +
        '<a class="btn btn--ghost" href="shop.html">Tiếp tục mua sắm</a>' +
      '</div>' +
      '</div>';
    U.toast('Đặt hàng thành công!');
  }

  render();
})();
