/* =========================================================
   AZmobile — Giao diện dùng chung (UI kit)
   Header / Footer / Icons / Định dạng / Giỏ hàng / Toast
   ========================================================= */
(function (global) {
  'use strict';

  /* ---------------- Định dạng ---------------- */
  function money(n) {
    n = Number(n) || 0;
    return n.toLocaleString('vi-VN') + '₫';
  }

  function shortMoney(n) {
    n = Number(n) || 0;
    if (n >= 1000000000) return (n / 1000000000).toFixed(1).replace('.0', '') + ' tỷ';
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + ' tr';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
    return String(n);
  }

  function date(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function dateTime(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------------- Bộ icon ---------------- */
  var ICONS = {
    laptop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
    gamepad: '<path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><rect x="2" y="6" width="20" height="12" rx="4"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
    palette: '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9.5" cy="15" r="1"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    mouse: '<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 6v4"/>',
    chip: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M4 9h3M4 15h3M17 9h3M17 15h3M9 4v3M15 4v3M9 17v3M15 17v3"/>',
    box: '<path d="M21 8v8l-9 5-9-5V8l9-5 9 5Z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 1 0 5 5L21 21l-2 2-9.7-9.7a4 4 0 0 1-5-5L7 5l3 3 3-3-3-3 4.7 1.3Z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M9 12l2 2 4-4"/>',
    crown: '<path d="M2 18h20l-2-9-5 4-3-6-3 6-5-4-2 9Z"/>',
    heart: '<path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-7.3a5 5 0 0 0 0-7.1Z"/>',
    fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-6 4-6s2 6-2 8M14 12c4 0 6 1 6 4s-6 2-8-2M10 12c-4 0-6 1-6 4s6 2 8-2"/>',
    disk: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3v3"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12h11L21 7H6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    tag: '<path d="M20 12 12 20l-9-9V3h8l9 9Z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-3-2V3Z"/><path d="M9 8h6M9 12h6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5"/><path d="M17 5.2A3.5 3.5 0 0 1 17 12M18 20c0-2.2-.7-3.8-2-4.8"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    phone: '<path d="M5 3h4l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.2 2 2 0 0 1 5 3Z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
    pin: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    star: '<path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8L12 3Z"/>',
    truck: '<path d="M2 6h11v11H2zM13 10h4l4 4v3h-8z"/><circle cx="6" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
    filter: '<path d="M3 5h18M6 12h12M10 19h4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.5-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 11a2 2 0 1 1 0 4Z"/>'
  };

  function icon(name, size, cls) {
    var path = ICONS[name] || ICONS.box;
    return '<svg class="ico ' + (cls || '') + '" width="' + (size || 20) + '" height="' + (size || 20) +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }

  /* ---------------- Ảnh sản phẩm (SVG) ---------------- */
  function artKind(categoryId) {
    var c = AZDB.categoryById(categoryId);
    var slug = c ? c.slug : '';
    if (slug === 'man-hinh') return 'monitor';
    if (slug === 'phu-kien' || slug === 'linh-kien') return 'gear';
    return 'laptop';
  }

  function productArt(p, opts) {
    opts = opts || {};

    // Có ảnh thật -> dùng ảnh; không có thì vẽ minh hoạ SVG
    if (p.image) {
      return '<img class="art art--img ' + (opts.cls || '') + '" src="' + esc(p.image) + '"' +
        ' alt="' + esc(p.name) + '" loading="' + (opts.eager ? 'eager' : 'lazy') + '" decoding="async"' +
        ' onerror="this.onerror=null;this.src=\'assets/img/no-image.svg\'">';
    }

    var c = p.artColor || '#2563eb';
    var kind = artKind(p.categoryId);
    var gid = 'g' + Math.random().toString(36).slice(2, 8);
    var body = '';

    if (kind === 'laptop') {
      body =
        '<rect x="118" y="62" width="164" height="112" rx="7" fill="url(#' + gid + 's)" stroke="rgba(255,255,255,.22)" stroke-width="1.5"/>' +
        '<rect x="128" y="72" width="144" height="92" rx="3" fill="url(#' + gid + 'd)"/>' +
        '<path d="M128 72h144v34H128z" fill="rgba(255,255,255,.10)"/>' +
        '<rect x="150" y="92" width="46" height="4" rx="2" fill="rgba(255,255,255,.42)"/>' +
        '<rect x="150" y="102" width="72" height="4" rx="2" fill="rgba(255,255,255,.24)"/>' +
        '<rect x="150" y="112" width="58" height="4" rx="2" fill="rgba(255,255,255,.18)"/>' +
        '<path d="M92 176h216l14 20a5 5 0 0 1-4 6H82a5 5 0 0 1-4-6l14-20Z" fill="url(#' + gid + 'b)" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>' +
        '<rect x="176" y="182" width="48" height="5" rx="2.5" fill="rgba(255,255,255,.25)"/>';
    } else if (kind === 'monitor') {
      body =
        '<rect x="96" y="52" width="208" height="126" rx="8" fill="url(#' + gid + 's)" stroke="rgba(255,255,255,.22)" stroke-width="1.5"/>' +
        '<rect x="106" y="62" width="188" height="106" rx="4" fill="url(#' + gid + 'd)"/>' +
        '<path d="M106 62h188v40H106z" fill="rgba(255,255,255,.10)"/>' +
        '<rect x="192" y="178" width="16" height="26" fill="url(#' + gid + 'b)"/>' +
        '<rect x="156" y="202" width="88" height="9" rx="4.5" fill="url(#' + gid + 'b)"/>' +
        '<circle cx="200" cy="120" r="22" fill="none" stroke="rgba(255,255,255,.20)" stroke-width="2"/>';
    } else {
      body =
        '<rect x="132" y="72" width="136" height="104" rx="14" fill="url(#' + gid + 's)" stroke="rgba(255,255,255,.22)" stroke-width="1.5"/>' +
        '<rect x="146" y="86" width="108" height="76" rx="9" fill="url(#' + gid + 'd)"/>' +
        '<path d="M146 86h108v30H146z" fill="rgba(255,255,255,.10)"/>' +
        '<rect x="166" y="112" width="68" height="5" rx="2.5" fill="rgba(255,255,255,.40)"/>' +
        '<rect x="166" y="124" width="44" height="5" rx="2.5" fill="rgba(255,255,255,.22)"/>' +
        '<circle cx="200" cy="196" r="16" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="2" stroke-dasharray="4 5"/>';
    }

    return '' +
      '<svg class="art ' + (opts.cls || '') + '" viewBox="0 0 400 300" role="img" aria-label="' + esc(p.name) + '" preserveAspectRatio="xMidYMid meet">' +
      '<defs>' +
      '<linearGradient id="' + gid + 'bg" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + c + '" stop-opacity=".30"/>' +
      '<stop offset=".55" stop-color="' + c + '" stop-opacity=".10"/>' +
      '<stop offset="1" stop-color="#0b1220" stop-opacity=".05"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + gid + 's" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#1e293b"/><stop offset="1" stop-color="#0f172a"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + gid + 'd" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + c + '" stop-opacity=".85"/><stop offset="1" stop-color="' + c + '" stop-opacity=".28"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + gid + 'b" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#334155"/><stop offset=".5" stop-color="#475569"/><stop offset="1" stop-color="#1e293b"/>' +
      '</linearGradient>' +
      '<radialGradient id="' + gid + 'gl" cx="50%" cy="45%" r="55%">' +
      '<stop offset="0" stop-color="' + c + '" stop-opacity=".55"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/>' +
      '</radialGradient>' +
      '</defs>' +
      '<rect width="400" height="300" fill="url(#' + gid + 'bg)"/>' +
      '<circle cx="200" cy="150" r="120" fill="url(#' + gid + 'gl)"/>' +
      '<g stroke="rgba(255,255,255,.06)" stroke-width="1">' +
      '<path d="M0 240h400M0 200h400M0 160h400M0 120h400M0 80h400"/>' +
      '<path d="M80 0v300M160 0v300M240 0v300M320 0v300"/>' +
      '</g>' +
      body +
      '</svg>';
  }

  /* ---------------- Giỏ hàng ---------------- */
  // Mỗi tài khoản có giỏ riêng; khách chưa đăng nhập dùng giỏ "guest".
  // Nhờ vậy đăng xuất / đổi tài khoản sẽ không thấy giỏ của người khác.
  var CART_KEY = 'azmobile.cart.v2';
  var CART_LEGACY_KEY = 'azmobile.cart.v1';

  function currentOwnerId() {
    try {
      var s = AZDB.session();
      return s && s.id ? s.id : 'guest';
    } catch (e) { return 'guest'; }
  }

  function cartKeyFor(owner) {
    return CART_KEY + '.' + (owner || 'guest');
  }

  function readRaw(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; }
  }

  function writeRaw(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
  }

  // Chuyển giỏ của phiên bản cũ (1 giỏ chung) sang đúng chủ sở hữu hiện tại
  (function migrateLegacyCart() {
    var old = localStorage.getItem(CART_LEGACY_KEY);
    if (!old) return;
    var target = cartKeyFor(currentOwnerId());
    if (!localStorage.getItem(target)) localStorage.setItem(target, old);
    localStorage.removeItem(CART_LEGACY_KEY);
  })();

  var cart = {
    owner: currentOwnerId,
    read: function () {
      return readRaw(cartKeyFor(currentOwnerId()));
    },
    write: function (items) {
      writeRaw(cartKeyFor(currentOwnerId()), items);
      cart.refreshBadge();
    },
    add: function (productId, qty) {
      qty = Math.max(1, Number(qty) || 1);
      var items = cart.read();
      var found = items.find(function (i) { return i.productId === productId; });
      var p = AZDB.productById(productId);
      if (!p) return;
      if (found) {
        found.qty = Math.min(found.qty + qty, Math.max(1, p.stock));
      } else {
        items.push({ productId: productId, qty: Math.min(qty, Math.max(1, p.stock)) });
      }
      cart.write(items);
      return items;
    },
    setQty: function (productId, qty) {
      var items = cart.read();
      var it = items.find(function (i) { return i.productId === productId; });
      if (!it) return;
      var p = AZDB.productById(productId);
      var max = p ? Math.max(1, p.stock) : 99;
      it.qty = Math.max(1, Math.min(Number(qty) || 1, max));
      cart.write(items);
    },
    remove: function (productId) {
      cart.write(cart.read().filter(function (i) { return i.productId !== productId; }));
    },
    clear: function () {
      cart.write([]);
    },
    count: function () {
      return cart.read().reduce(function (s, i) { return s + i.qty; }, 0);
    },
    detail: function () {
      return cart.read().map(function (i) {
        var p = AZDB.productById(i.productId);
        return p ? { product: p, qty: i.qty, lineTotal: p.price * i.qty } : null;
      }).filter(Boolean);
    },
    subtotal: function () {
      return cart.detail().reduce(function (s, i) { return s + i.lineTotal; }, 0);
    },
    refreshBadge: function () {
      var n = cart.count();
      document.querySelectorAll('[data-cart-count]').forEach(function (el) {
        el.textContent = n;
        el.classList.toggle('is-empty', n === 0);
      });
    },
    // Gọi sau khi đăng nhập: gộp giỏ khách vào giỏ tài khoản rồi xoá giỏ khách
    onLogin: function () {
      var guestKey = cartKeyFor('guest');
      var guest = readRaw(guestKey);
      if (guest.length) {
        var mine = readRaw(cartKeyFor(currentOwnerId()));
        guest.forEach(function (g) {
          var f = mine.find(function (m) { return m.productId === g.productId; });
          if (f) f.qty = f.qty + g.qty;
          else mine.push({ productId: g.productId, qty: g.qty });
        });
        // kẹp lại theo tồn kho thực tế, bỏ sản phẩm đã bị xoá
        mine = mine.map(function (m) {
          var p = AZDB.productById(m.productId);
          if (!p) return null;
          return { productId: m.productId, qty: Math.max(1, Math.min(m.qty, Math.max(1, p.stock))) };
        }).filter(Boolean);
        writeRaw(cartKeyFor(currentOwnerId()), mine);
        localStorage.removeItem(guestKey);
      }
      cart.refreshBadge();
    },
    // Gọi sau khi đăng xuất: quay về giỏ của khách (thường là rỗng)
    onLogout: function () {
      cart.refreshBadge();
    },
    // Xoá giỏ của mọi tài khoản (dùng khi khôi phục dữ liệu mẫu)
    clearAll: function () {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf(CART_KEY + '.') === 0 || k === CART_LEGACY_KEY) localStorage.removeItem(k);
      });
      cart.refreshBadge();
    }
  };

  /* ---------------- Toast ---------------- */
  function toast(message, type) {
    var host = document.getElementById('toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toast-host';
      host.className = 'toast-host';
      document.body.appendChild(host);
    }
    var el = document.createElement('div');
    el.className = 'toast toast--' + (type || 'success');
    var ic = type === 'error' ? 'close' : (type === 'info' ? 'sparkle' : 'check');
    el.innerHTML = '<span class="toast__ico">' + icon(ic, 16) + '</span><span>' + esc(message) + '</span>';
    host.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('is-in'); });
    setTimeout(function () {
      el.classList.remove('is-in');
      setTimeout(function () { el.remove(); }, 260);
    }, 2800);
  }

  /* ---------------- Header / Footer ---------------- */
  var NAV = [
    { href: 'index.html', label: 'Trang chủ' },
    { href: 'shop.html', label: 'Sản phẩm' },
    { href: 'services.html', label: 'Sửa chữa & Bảo hành' },
    { href: 'blog.html', label: 'Bài viết' },
    { href: 'index.html#about', label: 'Giới thiệu' }
  ];

  function logoMark() {
    return '<span class="brand__mark" aria-hidden="true">' +
      '<svg viewBox="0 0 32 32" width="34" height="34" fill="none">' +
      '<rect x="1.5" y="1.5" width="29" height="29" rx="9" fill="url(#bmg)"/>' +
      '<path d="M10 21.5 16 9.5l6 12" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M12.6 17.4h6.8" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>' +
      '<defs><linearGradient id="bmg" x1="0" y1="0" x2="32" y2="32">' +
      '<stop stop-color="#3b82f6"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs>' +
      '</svg></span>';
  }

  function buildHeader(active) {
    var s = AZDB.session();
    var st = AZDB.settings();
    var navHtml = NAV.map(function (n) {
      var on = (active === n.href || (active === 'shop' && n.href === 'shop.html')) ? ' class="is-active"' : '';
      return '<a href="' + n.href + '"' + on + '>' + n.label + '</a>';
    }).join('');

    var accountHtml = s
      ? '<div class="acct">' +
          '<button class="acct__btn" type="button" aria-haspopup="true" aria-expanded="false">' +
            '<span class="acct__ava">' + esc(s.name.charAt(0).toUpperCase()) + '</span>' +
            '<span class="acct__meta"><span class="acct__hi">Xin chào</span><span class="acct__name">' + esc(s.name.split(' ')[0]) + '</span></span>' +
          '</button>' +
          '<div class="acct__menu" role="menu">' +
            (s.role === 'admin' ? '<a href="admin.html" role="menuitem">' + icon('grid', 16) + 'Trang quản trị</a>' : '') +
            '<a href="account.html" role="menuitem">' + icon('user', 16) + 'Tài khoản của tôi</a>' +
            '<a href="account.html#orders" role="menuitem">' + icon('receipt', 16) + 'Đơn hàng</a>' +
            '<button type="button" data-logout role="menuitem">' + icon('logout', 16) + 'Đăng xuất</button>' +
          '</div>' +
        '</div>'
      : '<a class="btn btn--ghost btn--sm header__login" href="login.html">' + icon('user', 17) + 'Đăng nhập</a>';

    return '' +
      '<div class="topbar">' +
        '<div class="container topbar__inner">' +
          '<span class="topbar__item">' + icon('truck', 15) + 'Miễn phí giao hàng toàn quốc cho đơn từ 5 triệu</span>' +
          '<span class="topbar__sep"></span>' +
          '<span class="topbar__item">' + icon('shield', 15) + 'Bảo hành chính hãng đến 24 tháng</span>' +
          '<span class="topbar__right">' + icon('phone', 15) + 'Hotline <strong>' + esc(st.hotline) + '</strong></span>' +
        '</div>' +
      '</div>' +
      '<header class="header" id="site-header">' +
        '<div class="container header__inner">' +
          '<a class="brand" href="index.html">' + logoMark() +
            '<span class="brand__text"><strong>AZ<span>mobile</span></strong><small>Laptop &amp; Phụ kiện</small></span>' +
          '</a>' +
          '<nav class="nav" id="main-nav">' + navHtml + '</nav>' +
          '<form class="search" role="search" id="header-search" action="shop.html">' +
            icon('search', 18) +
            '<input type="search" name="q" placeholder="Tìm laptop, phụ kiện..." aria-label="Tìm kiếm sản phẩm">' +
          '</form>' +
          '<div class="header__actions">' +
            accountHtml +
            '<a class="cartbtn" href="cart.html" aria-label="Giỏ hàng">' +
              icon('cart', 21) +
              '<span class="cartbtn__count" data-cart-count>0</span>' +
            '</a>' +
            '<button class="burger" type="button" id="burger" aria-label="Mở menu" aria-expanded="false">' + icon('menu', 22) + '</button>' +
          '</div>' +
        '</div>' +
      '</header>';
  }

  function buildFooter() {
    var st = AZDB.settings();
    return '' +
      '<footer class="footer">' +
        '<div class="container footer__grid">' +
          '<div class="footer__col footer__col--brand">' +
            '<a class="brand brand--footer" href="index.html">' + logoMark() +
              '<span class="brand__text"><strong>AZ<span>mobile</span></strong><small>Laptop &amp; Phụ kiện</small></span>' +
            '</a>' +
            '<p>Hệ thống bán lẻ laptop, phụ kiện và trung tâm bảo hành, sửa chữa uy tín. Sản phẩm chính hãng, giá minh bạch, hậu mãi tận tâm.</p>' +
            '<div class="footer__badges"><span>Chính hãng</span><span>Trả góp 0%</span><span>Bảo hành tận nơi</span></div>' +
          '</div>' +
          '<div class="footer__col">' +
            '<h4>Sản phẩm</h4>' +
            '<ul>' +
              '<li><a href="shop.html?cat=cat_gaming">Laptop Gaming</a></li>' +
              '<li><a href="shop.html?cat=cat_office">Laptop Văn phòng</a></li>' +
              '<li><a href="shop.html?cat=cat_graphic">Laptop Đồ họa</a></li>' +
              '<li><a href="shop.html?cat=cat_acc">Phụ kiện</a></li>' +
              '<li><a href="shop.html?cat=cat_part">Linh kiện</a></li>' +
            '</ul>' +
          '</div>' +
          '<div class="footer__col">' +
            '<h4>Hỗ trợ</h4>' +
            '<ul>' +
              '<li><a href="services.html">Sửa chữa &amp; bảo hành</a></li>' +
              '<li><a href="services.html#booking">Đặt lịch hẹn</a></li>' +
              '<li><a href="account.html#orders">Tra cứu đơn hàng</a></li>' +
              '<li><a href="login.html">Đăng nhập / Đăng ký</a></li>' +
              '<li><a href="admin.html">Trang quản trị</a></li>' +
            '</ul>' +
          '</div>' +
          '<div class="footer__col">' +
            '<h4>Liên hệ</h4>' +
            '<ul class="footer__contact">' +
              '<li>' + icon('pin', 16) + '<span>' + esc(st.address) + '</span></li>' +
              '<li>' + icon('phone', 16) + '<span>Hotline: <strong>' + esc(st.hotline) + '</strong></span></li>' +
              '<li>' + icon('mail', 16) + '<span>' + esc(st.email) + '</span></li>' +
              '<li>' + icon('clock', 16) + '<span>' + esc(st.openHours) + '</span></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="footer__bottom">' +
          '<div class="container footer__bottom-inner">' +
            '<span>© ' + new Date().getFullYear() + ' AZmobile. Tất cả các quyền được bảo lưu.</span>' +
            '<span>Website demo — dữ liệu lưu cục bộ trên trình duyệt của bạn.</span>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  function mountLayout(active) {
    var headerHost = document.getElementById('site-header');
    if (headerHost) headerHost.outerHTML = buildHeader(active);
    var footerHost = document.getElementById('site-footer');
    if (footerHost) footerHost.outerHTML = buildFooter();

    cart.refreshBadge();

    // Menu tài khoản
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.acct__btn');
      document.querySelectorAll('.acct.is-open').forEach(function (el) {
        if (!btn || el !== btn.closest('.acct')) el.classList.remove('is-open');
      });
      if (btn) {
        var wrap = btn.closest('.acct');
        var open = wrap.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      if (e.target.closest('[data-logout]')) {
        AZDB.logout();
        toast('Đã đăng xuất. Hẹn gặp lại!', 'info');
        setTimeout(function () { location.href = 'index.html'; }, 600);
      }
    });

    // Burger menu mobile
    var burger = document.getElementById('burger');
    var nav = document.getElementById('main-nav');
    if (burger && nav) {
      burger.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.innerHTML = icon(open ? 'close' : 'menu', 22);
      });
    }

    // Tìm kiếm ở header -> shop.html?q=
    var search = document.getElementById('header-search');
    if (search) {
      search.addEventListener('submit', function (e) {
        e.preventDefault();
        var q = search.querySelector('input').value.trim();
        location.href = 'shop.html' + (q ? '?q=' + encodeURIComponent(q) : '');
      });
    }

    // Hiệu ứng header khi cuộn
    var hdr = document.getElementById('site-header');
    if (hdr) {
      var onScroll = function () {
        hdr.classList.toggle('is-stuck', window.scrollY > 12);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---------------- Component: thẻ sản phẩm ---------------- */
  function productCard(p) {
    var off = p.oldPrice && p.oldPrice > p.price
      ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    var cat = AZDB.categoryById(p.categoryId);
    var soldOut = p.stock <= 0;
    return '' +
      '<article class="pcard' + (soldOut ? ' is-out' : '') + '">' +
        '<a class="pcard__media" href="product.html?id=' + p.id + '">' +
          productArt(p) +
          '<div class="pcard__tags">' +
            (off ? '<span class="tag tag--off">-' + off + '%</span>' : '') +
            (p.badge ? '<span class="tag tag--badge">' + esc(p.badge) + '</span>' : '') +
            (soldOut ? '<span class="tag tag--out">Hết hàng</span>' : '') +
          '</div>' +
        '</a>' +
        '<div class="pcard__body">' +
          '<div class="pcard__meta"><span>' + esc(p.brand || '—') + '</span><span class="dot"></span><span>' + esc(cat ? cat.name : '') + '</span></div>' +
          '<h3 class="pcard__name"><a href="product.html?id=' + p.id + '">' + esc(p.name) + '</a></h3>' +
          '<p class="pcard__spec">' + esc([p.specs.cpu, p.specs.ram, p.specs.ssd].filter(function (x) { return x && x !== '—'; }).join(' · ') || p.specs.screen) + '</p>' +
          '<div class="pcard__rating">' + stars(p.rating) + '<span>' + Number(p.rating).toFixed(1) + ' (' + (p.sold || 0) + ' đã bán)</span></div>' +
          '<div class="pcard__foot">' +
            '<div class="price">' +
              '<strong>' + money(p.price) + '</strong>' +
              (p.oldPrice > p.price ? '<del>' + money(p.oldPrice) + '</del>' : '') +
            '</div>' +
            '<button class="btn btn--primary btn--icon" type="button" data-add="' + p.id + '"' + (soldOut ? ' disabled' : '') + ' aria-label="Thêm vào giỏ">' +
              icon('cart', 18) + '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function stars(rating) {
    var r = Math.round((Number(rating) || 0) * 2) / 2;
    var out = '';
    for (var i = 1; i <= 5; i++) {
      var fill = r >= i ? 'full' : (r >= i - 0.5 ? 'half' : 'empty');
      out += '<span class="star star--' + fill + '">' + icon('star', 13) + '</span>';
    }
    return '<span class="stars" aria-label="' + (rating || 0) + ' trên 5">' + out + '</span>';
  }

  /* Ủy quyền sự kiện cho nút "thêm vào giỏ" */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add]');
    if (!btn) return;
    e.preventDefault();
    // Bắt buộc đăng nhập mới được thêm vào giỏ
    if (!AZDB.session()) {
      toast('Vui lòng đăng nhập để mua hàng', 'info');
      var back = location.pathname.split('/').pop() + location.search;
      setTimeout(function () {
        location.href = 'login.html?next=' + encodeURIComponent(back || 'shop.html');
      }, 700);
      return;
    }
    try {
      cart.add(btn.getAttribute('data-add'), 1);
      toast('Đã thêm vào giỏ hàng');
      btn.classList.add('is-pop');
      setTimeout(function () { btn.classList.remove('is-pop'); }, 400);
    } catch (err) {
      toast('Không thể thêm sản phẩm', 'error');
    }
  });

  /* ---------------- Yêu cầu quyền ---------------- */
  function requireLogin(next) {
    if (AZDB.session()) return true;
    toast('Vui lòng đăng nhập để tiếp tục', 'info');
    setTimeout(function () {
      location.href = 'login.html?next=' + encodeURIComponent(next || location.pathname.split('/').pop());
    }, 700);
    return false;
  }

  function requireAdmin() {
    var s = AZDB.session();
    if (s && s.role === 'admin') return true;
    toast(s ? 'Bạn không có quyền truy cập trang quản trị' : 'Vui lòng đăng nhập bằng tài khoản quản trị', 'error');
    setTimeout(function () {
      location.href = 'login.html?next=admin.html';
    }, 900);
    return false;
  }

  global.AZUI = {
    money: money,
    shortMoney: shortMoney,
    date: date,
    dateTime: dateTime,
    esc: esc,
    icon: icon,
    productArt: productArt,
    productCard: productCard,
    stars: stars,
    toast: toast,
    mountLayout: mountLayout,
    requireLogin: requireLogin,
    requireAdmin: requireAdmin,
    logoMark: logoMark
  };
  global.AZCART = cart;
})(window);
