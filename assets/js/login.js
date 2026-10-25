/* AZmobile — Đăng nhập / Đăng ký */
(function () {
  'use strict';
  var U = AZUI, D = AZDB;

  var params = new URLSearchParams(location.search);
  var next = params.get('next') || '';

  var tabs = document.getElementById('auth-tabs');
  var loginForm = document.getElementById('login-form');
  var regForm = document.getElementById('register-form');
  var title = document.getElementById('auth-title');
  var subtitle = document.getElementById('auth-sub');
  var foot = document.getElementById('auth-foot');

  function setMode(mode) {
    tabs.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.mode === mode);
    });
    if (mode === 'login') {
      loginForm.style.display = 'block';
      regForm.style.display = 'none';
      title.textContent = 'Đăng nhập';
      subtitle.textContent = 'Chào mừng bạn trở lại AZmobile.';
      foot.innerHTML = 'Bạn chưa có tài khoản? <a href="#" data-switch="register">Đăng ký ngay</a>';
    } else {
      loginForm.style.display = 'none';
      regForm.style.display = 'block';
      title.textContent = 'Tạo tài khoản';
      subtitle.textContent = 'Chỉ mất 30 giây để bắt đầu mua sắm.';
      foot.innerHTML = 'Đã có tài khoản? <a href="#" data-switch="login">Đăng nhập</a>';
    }
    document.querySelectorAll('.field.has-err').forEach(function (f) { f.classList.remove('has-err'); });
  }

  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]');
    if (b) setMode(b.dataset.mode);
  });

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-switch]');
    if (a) {
      e.preventDefault();
      setMode(a.getAttribute('data-switch'));
    }
  });

  function mark(el, valid) {
    var f = el.closest('.field');
    if (f) f.classList.toggle('has-err', !valid);
    return valid;
  }

  function go(session) {
    var dest = next;
    if (!dest) dest = session.role === 'admin' ? 'admin.html' : 'account.html';
    setTimeout(function () { location.href = dest; }, 650);
  }

  /* --- Đăng nhập --- */
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('lg-email');
    var pass = document.getElementById('lg-pass');
    var ok = true;
    if (!mark(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))) ok = false;
    if (!mark(pass, pass.value.length >= 6)) ok = false;
    if (!ok) return;

    var btn = loginForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Đang đăng nhập...';
    try {
      var s = D.login(email.value, pass.value);
      U.toast('Đăng nhập thành công. Chào ' + s.name.split(' ').slice(-1)[0] + '!');
      go(s);
    } catch (err) {
      U.toast(err.message, 'error');
      mark(pass, false);
      btn.disabled = false;
      btn.textContent = 'Đăng nhập';
    }
  });

  /* --- Đăng ký --- */
  regForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('rg-name');
    var email = document.getElementById('rg-email');
    var phone = document.getElementById('rg-phone');
    var pass = document.getElementById('rg-pass');
    var pass2 = document.getElementById('rg-pass2');
    var agree = document.getElementById('rg-agree');
    var news = document.getElementById('rg-news');

    var ok = true;
    if (!mark(name, name.value.trim().length >= 2)) ok = false;
    if (!mark(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))) ok = false;
    if (!mark(pass, pass.value.length >= 6)) ok = false;
    if (!mark(pass2, pass2.value === pass.value && pass2.value.length >= 6)) ok = false;
    if (!ok) return;
    if (!agree.checked) {
      U.toast('Vui lòng đồng ý điều khoản sử dụng', 'error');
      return;
    }

    var btn = regForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Đang tạo...';
    var wantsNews = !!(news && news.checked);

    try {
      var user = D.register({
        name: name.value, email: email.value, phone: phone.value, password: pass.value,
        marketingOptIn: wantsNews
      });
      var s = D.login(email.value, pass.value);

      // Đồng ý nhận email khuyến mãi → đẩy email sang Mailchimp.
      // Chạy nền, không chặn việc tạo tài khoản nếu Mailchimp lỗi.
      if (wantsNews && window.AZMC) {
        AZMC.subscribe({
          email: email.value,
          name: name.value,
          phone: phone.value,
          tags: ['dang-ky-tai-khoan']
        });
      }

      var extra = (wantsNews && window.AZMC && AZMC.isConfigured()) ? ' ' + AZMC.confirmMessage() : '';
      U.toast('Tạo tài khoản thành công!' + extra);
      go(s);
    } catch (err) {
      U.toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Tạo tài khoản';
    }
  });

  /* Đã đăng nhập sẵn → chuyển hướng */
  var existing = D.session();
  if (existing) {
    if (next) {
      location.replace(next);
    } else {
      subtitle.textContent = 'Bạn đang đăng nhập với ' + existing.email + '. Tiếp tục đến trang của bạn.';
      title.textContent = 'Xin chào, ' + existing.name.split(' ').slice(-1)[0];
      var box = document.createElement('a');
      box.className = 'btn btn--primary btn--block btn--lg';
      box.href = existing.role === 'admin' ? 'admin.html' : 'account.html';
      box.textContent = existing.role === 'admin' ? 'Vào trang quản trị' : 'Vào tài khoản của tôi';
      box.style.marginBottom = '12px';
      tabs.parentNode.insertBefore(box, tabs);
      tabs.style.display = 'none';
      loginForm.style.display = 'none';
      var demo = document.querySelector('.auth__demo');
      if (demo) demo.style.display = 'none';
      foot.innerHTML = '<a href="index.html">Về trang chủ</a> · <a href="#" id="logout-now">Đăng xuất</a>';
      document.getElementById('logout-now').addEventListener('click', function (ev) {
        ev.preventDefault();
        D.logout();
        location.reload();
      });
    }
  } else if (next === 'admin.html') {
    U.toast('Vui lòng đăng nhập bằng tài khoản quản trị', 'info');
  }
})();
