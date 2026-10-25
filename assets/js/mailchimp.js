/* =========================================================
   AZmobile — Cầu nối Mailchimp (đăng ký nhận email khuyến mãi)
   ---------------------------------------------------------
   Vì website là front-end thuần (GitHub Pages), module này dùng
   endpoint "Embedded form" công khai của Mailchimp:
       https://<dc>.list-manage.com/subscribe/post?u=...&id=...
   → Không cần API key, không cần server, không lộ bí mật gì.

   Luồng hoạt động:
     Khách đăng ký tài khoản (tick ô "nhận email khuyến mãi")
        → AZMC.subscribe() gửi email sang Audience
        → Mailchimp tự gửi mail quảng cáo / chuỗi welcome (Automation)

   Đặc điểm an toàn:
     • Không chặn luồng đăng ký: Mailchimp lỗi thì tài khoản vẫn được tạo.
     • Chống gửi trùng: mỗi email chỉ gửi 1 lần / 24h / trình duyệt.
     • Có hàng đợi: mất mạng thì lưu lại, lần mở trang sau tự gửi tiếp.
   ========================================================= */
(function (global) {
  'use strict';

  var QUEUE_KEY = 'azmobile.mc.queue.v1';
  var SENT_KEY = 'azmobile.mc.sent.v1';
  var SENT_TTL = 24 * 60 * 60 * 1000;   // 24 giờ
  var QUEUE_MAX = 20;

  /* ---------------- Tiện ích ---------------- */
  function cfg() {
    return global.AZMC_CONFIG || {};
  }

  function isConfigured() {
    var c = cfg();
    return !!(c.enabled && c.dc && c.u && c.id);
  }

  function host() {
    var c = cfg();
    return c.host || (c.dc + '.list-manage.com');
  }

  function endpoint() {
    var c = cfg();
    var url = 'https://' + host() + '/subscribe/post' +
      '?u=' + encodeURIComponent(c.u) +
      '&id=' + encodeURIComponent(c.id);
    if (c.f_id) url += '&f_id=' + encodeURIComponent(c.f_id);
    return url;
  }

  function log() {
    if (!global.console) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[AZMC]');
    console.info.apply(console, args);
  }

  function readJSON(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function writeJSON(key, value) {
    try { global.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* bỏ qua */ }
  }

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  /* ---------------- Chống gửi trùng ---------------- */
  function sentMap() {
    var m = readJSON(SENT_KEY, {});
    var now = Date.now();
    var clean = {};
    Object.keys(m).forEach(function (k) {
      if (now - m[k] < SENT_TTL) clean[k] = m[k];
    });
    return clean;
  }

  function recentlySent(email) {
    return !!sentMap()[normalizeEmail(email)];
  }

  function markSent(email) {
    var m = sentMap();
    m[normalizeEmail(email)] = Date.now();
    writeJSON(SENT_KEY, m);
  }

  /* ---------------- Hàng đợi khi mất mạng ---------------- */
  function queue() {
    var q = readJSON(QUEUE_KEY, []);
    return Array.isArray(q) ? q : [];
  }

  function queuePush(item) {
    var q = queue().filter(function (x) { return x.email !== item.email; });
    q.push(item);
    if (q.length > QUEUE_MAX) q = q.slice(q.length - QUEUE_MAX);
    writeJSON(QUEUE_KEY, q);
  }

  function queueRemove(email) {
    writeJSON(QUEUE_KEY, queue().filter(function (x) { return x.email !== email; }));
  }

  /* ---------------- Dựng dữ liệu gửi đi ---------------- */
  function buildBody(data) {
    var c = cfg();
    var body = new URLSearchParams();

    body.set('EMAIL', data.email);
    if (data.name) body.set('FNAME', String(data.name).trim());
    if (data.phone) body.set('PHONE', String(data.phone).trim());

    // Trường "honeypot" chống bot của Mailchimp — BẮT BUỘC để rỗng
    body.set('b_' + c.u + '_' + c.id, '');

    // Gắn tag để lọc trong Mailchimp (khách từ website, từ trang đăng ký...)
    var tags = [].concat(c.tags || [], data.tags || [])
      .map(function (t) { return String(t || '').trim(); })
      .filter(Boolean);
    if (tags.length) body.set('tags', tags.join(','));

    return body;
  }

  /* ---------------- Gửi request ---------------- */
  function send(body) {
    var url = endpoint();

    // Cách 1: fetch no-cors (request kiểu "simple" nên không bị preflight chặn)
    if (global.fetch) {
      return global.fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        keepalive: true,   // request vẫn chạy tiếp dù trang chuyển hướng
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
    }

    // Cách 2 (dự phòng, trình duyệt rất cũ): form ẩn + iframe
    return new Promise(function (resolve, reject) {
      try {
        var frameName = 'azmc_frame_' + Date.now();
        var iframe = document.createElement('iframe');
        iframe.name = frameName;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        var form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        form.target = frameName;
        form.style.display = 'none';

        body.forEach(function (value, key) {
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        setTimeout(function () {
          form.remove();
          iframe.remove();
        }, 4000);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /* ---------------- API công khai ---------------- */

  /**
   * Đăng ký 1 email vào Audience.
   * @param {{email:string, name?:string, phone?:string, tags?:string[]}} data
   * @returns {Promise<{ok:boolean, reason?:string}>}
   */
  function subscribe(data) {
    data = data || {};
    var email = normalizeEmail(data.email);

    if (!email || email.indexOf('@') < 1) {
      return Promise.resolve({ ok: false, reason: 'invalid-email' });
    }
    if (!isConfigured()) {
      log('chưa cấu hình (mailchimp-config.js) — bỏ qua', email);
      return Promise.resolve({ ok: false, reason: 'not-configured' });
    }
    if (recentlySent(email)) {
      log('đã gửi trong 24h qua — bỏ qua', email);
      return Promise.resolve({ ok: true, reason: 'duplicate' });
    }

    var item = {
      email: email,
      name: data.name || '',
      phone: data.phone || '',
      tags: data.tags || []
    };

    return send(buildBody(item))
      .then(function () {
        markSent(email);
        queueRemove(email);
        log('đã đăng ký', email);
        return { ok: true };
      })
      .catch(function (err) {
        queuePush(item);
        log('lỗi mạng, đã xếp hàng đợi', email, err);
        return { ok: false, reason: 'network' };
      });
  }

  /** Gửi lại các email còn nằm trong hàng đợi (gọi khi mở trang). */
  function flushQueue() {
    if (!isConfigured()) return;
    var q = queue();
    if (!q.length) return;

    q.forEach(function (item) {
      if (recentlySent(item.email)) {
        queueRemove(item.email);
        return;
      }
      send(buildBody(item)).then(function () {
        markSent(item.email);
        queueRemove(item.email);
        log('đã gửi lại từ hàng đợi', item.email);
      }).catch(function () { /* để lần sau */ });
    });
  }

  /** Thông báo phù hợp với chế độ double opt-in của Audience. */
  function confirmMessage() {
    return cfg().doubleOptIn
      ? 'Kiểm tra hộp thư để xác nhận đăng ký nhận ưu đãi nhé!'
      : 'Bạn sẽ nhận được ưu đãi qua email trong thời gian tới!';
  }

  global.AZMC = {
    isConfigured: isConfigured,
    subscribe: subscribe,
    flushQueue: flushQueue,
    confirmMessage: confirmMessage,
    recentlySent: recentlySent
  };

  /* Tự gửi bù khi trang vừa tải xong */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', flushQueue);
  } else {
    flushQueue();
  }
})(window);
