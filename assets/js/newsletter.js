/* =========================================================
   AZmobile — Cầu nối email marketing (Brevo)
   ---------------------------------------------------------
   Website là front-end thuần (GitHub Pages) nên KHÔNG giữ API key.
   Module dùng endpoint "form nhúng" công khai của Brevo:
       https://xxxxx.sibforms.com/serve/MUIFA...

   Luồng:
     Khách đăng ký + tick "nhận email khuyến mãi"
        → AZNL.subscribe() đẩy email vào danh sách Brevo
        → Brevo tự gửi bài quảng cáo (Automation)

   Đặc điểm an toàn:
     • Không chặn luồng đăng ký: Brevo lỗi thì tài khoản vẫn được tạo.
     • Chống gửi trùng: mỗi email 1 lần / 24h / trình duyệt.
     • Có hàng đợi: mất mạng thì lưu lại, lần mở trang sau tự gửi tiếp.
   ========================================================= */
(function (global) {
  'use strict';

  var QUEUE_KEY = 'azmobile.nl.queue.v1';
  var SENT_KEY = 'azmobile.nl.sent.v1';
  var SENT_TTL = 24 * 60 * 60 * 1000;   // 24 giờ
  var QUEUE_MAX = 20;

  /* ---------------- Tiện ích ---------------- */
  function cfg() {
    return global.AZNL_CONFIG || {};
  }

  function isConfigured() {
    var c = cfg();
    return !!(c.enabled && c.action);
  }

  function log() {
    if (!global.console) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[AZNL]');
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
    var f = c.fields || {};
    var body = new URLSearchParams();

    body.set(f.email || 'EMAIL', data.email);
    if (data.name) body.set(f.firstName || 'FIRSTNAME', String(data.name).trim());
    if (data.phone) body.set(f.phone || 'SMS', String(data.phone).trim());

    // Trường chống bot của Brevo — BẮT BUỘC để rỗng
    body.set('email_address_check', '');
    if (c.locale) body.set('locale', c.locale);

    return body;
  }

  /* ---------------- Gửi request ---------------- */
  function send(body) {
    var url = cfg().action;

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
        var frameName = 'aznl_frame_' + Date.now();
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
   * Đăng ký 1 email vào danh sách Brevo.
   * @param {{email:string, name?:string, phone?:string}} data
   * @returns {Promise<{ok:boolean, reason?:string}>}
   */
  function subscribe(data) {
    data = data || {};
    var email = normalizeEmail(data.email);

    if (!email || email.indexOf('@') < 1) {
      return Promise.resolve({ ok: false, reason: 'invalid-email' });
    }
    if (!isConfigured()) {
      log('chưa cấu hình (newsletter-config.js) — bỏ qua', email);
      return Promise.resolve({ ok: false, reason: 'not-configured' });
    }
    if (recentlySent(email)) {
      log('đã gửi trong 24h qua — bỏ qua', email);
      return Promise.resolve({ ok: true, reason: 'duplicate' });
    }

    var item = {
      email: email,
      name: data.name || '',
      phone: data.phone || ''
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

  /** Thông báo phù hợp với chế độ double opt-in. */
  function confirmMessage() {
    return cfg().doubleOptIn
      ? 'Kiểm tra hộp thư để xác nhận đăng ký nhận ưu đãi nhé!'
      : 'Bạn sẽ nhận được ưu đãi qua email trong thời gian tới!';
  }

  global.AZNL = {
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
