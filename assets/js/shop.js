/* AZmobile — Trang danh sách sản phẩm */
(function () {
  'use strict';
  var U = AZUI, D = AZDB;

  U.mountLayout('shop.html');

  var params = new URLSearchParams(location.search);
  var state = {
    cats: params.get('cat') ? [params.get('cat')] : [],
    brands: params.get('brand') ? [params.get('brand')] : [],
    min: Number(params.get('min')) || 0,
    max: Number(params.get('max')) || 0,
    q: (params.get('q') || '').trim(),
    inStock: false,
    onSale: false,
    sort: 'popular'
  };

  var all = D.products();
  var cats = D.categories();
  var brands = [];
  all.forEach(function (p) {
    if (p.brand && brands.indexOf(p.brand) === -1) brands.push(p.brand);
  });
  brands.sort();

  /* --- Tiêu đề theo danh mục --- */
  function syncTitle() {
    var titleEl = document.getElementById('page-title');
    var descEl = document.getElementById('page-desc');
    var crumb = document.getElementById('crumb-current');
    if (state.q) {
      titleEl.textContent = 'Kết quả cho “' + state.q + '”';
      descEl.textContent = 'Các sản phẩm khớp với từ khoá bạn tìm kiếm.';
      crumb.textContent = 'Tìm kiếm';
      return;
    }
    if (state.cats.length === 1) {
      var c = cats.find(function (x) { return x.id === state.cats[0]; });
      if (c) {
        titleEl.textContent = c.name;
        descEl.textContent = c.description;
        crumb.textContent = c.name;
        return;
      }
    }
    titleEl.textContent = 'Tất cả sản phẩm';
    descEl.textContent = 'Laptop, màn hình, phụ kiện và linh kiện — tất cả đều chính hãng, bảo hành đầy đủ.';
    crumb.textContent = 'Sản phẩm';
  }

  /* --- Dựng bộ lọc --- */
  function buildFilters() {
    document.getElementById('f-cats').innerHTML = cats.map(function (c) {
      var n = all.filter(function (p) { return p.categoryId === c.id; }).length;
      return '<li class="fopt"><input type="checkbox" id="fc_' + c.id + '" data-fcat="' + c.id + '"' +
        (state.cats.indexOf(c.id) > -1 ? ' checked' : '') + '>' +
        '<label for="fc_' + c.id + '" style="cursor:pointer;flex:1">' + U.esc(c.name) + '</label>' +
        '<span class="count">' + n + '</span></li>';
    }).join('');

    document.getElementById('f-brands').innerHTML = brands.map(function (b, i) {
      var n = all.filter(function (p) { return p.brand === b; }).length;
      return '<li class="fopt"><input type="checkbox" id="fb_' + i + '" data-fbrand="' + U.esc(b) + '"' +
        (state.brands.indexOf(b) > -1 ? ' checked' : '') + '>' +
        '<label for="fb_' + i + '" style="cursor:pointer;flex:1">' + U.esc(b) + '</label>' +
        '<span class="count">' + n + '</span></li>';
    }).join('');

    document.getElementById('f-min').value = state.min || '';
    document.getElementById('f-max').value = state.max || '';
    document.getElementById('f-stock').checked = state.inStock;
    document.getElementById('f-sale').checked = state.onSale;
  }

  /* --- Lọc + sắp xếp --- */
  function filtered() {
    var list = all.slice();
    if (state.cats.length) list = list.filter(function (p) { return state.cats.indexOf(p.categoryId) > -1; });
    if (state.brands.length) list = list.filter(function (p) { return state.brands.indexOf(p.brand) > -1; });
    if (state.min) list = list.filter(function (p) { return p.price >= state.min; });
    if (state.max) list = list.filter(function (p) { return p.price <= state.max; });
    if (state.inStock) list = list.filter(function (p) { return p.stock > 0; });
    if (state.onSale) list = list.filter(function (p) { return p.oldPrice > p.price; });
    if (state.q) {
      var q = state.q.toLowerCase();
      list = list.filter(function (p) {
        return (p.name + ' ' + p.brand + ' ' + p.specs.cpu + ' ' + p.specs.ram + ' ' + p.description)
          .toLowerCase().indexOf(q) > -1;
      });
    }
    switch (state.sort) {
      case 'price-asc': list.sort(function (a, b) { return a.price - b.price; }); break;
      case 'price-desc': list.sort(function (a, b) { return b.price - a.price; }); break;
      case 'rating': list.sort(function (a, b) { return b.rating - a.rating; }); break;
      case 'new': list.sort(function (a, b) { return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); }); break;
      default: list.sort(function (a, b) { return (b.sold || 0) - (a.sold || 0); });
    }
    return list;
  }

  /* --- Chip lọc đang bật --- */
  function renderChips() {
    var chips = [];
    state.cats.forEach(function (id) {
      var c = cats.find(function (x) { return x.id === id; });
      if (c) chips.push({ label: c.name, type: 'cat', value: id });
    });
    state.brands.forEach(function (b) { chips.push({ label: b, type: 'brand', value: b }); });
    if (state.min || state.max) {
      chips.push({ label: U.money(state.min || 0) + ' – ' + (state.max ? U.money(state.max) : '∞'), type: 'price' });
    }
    if (state.inStock) chips.push({ label: 'Còn hàng', type: 'stock' });
    if (state.onSale) chips.push({ label: 'Đang giảm giá', type: 'sale' });
    if (state.q) chips.push({ label: '“' + state.q + '”', type: 'q' });

    document.getElementById('active-chips').innerHTML = chips.map(function (c) {
      return '<button type="button" data-chip="' + c.type + '" data-value="' + U.esc(c.value || '') + '">' +
        U.esc(c.label) + U.icon('close', 12) + '</button>';
    }).join('');
  }

  /* --- Render --- */
  function render() {
    var list = filtered();
    document.getElementById('result-count').textContent = list.length;
    var grid = document.getElementById('shop-grid');
    var empty = document.getElementById('shop-empty');

    if (!list.length) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      empty.innerHTML = '<div class="empty">' + U.icon('search', 40) +
        '<h3>Không tìm thấy sản phẩm phù hợp</h3>' +
        '<p>Thử bỏ một vài bộ lọc hoặc tìm với từ khoá khác nhé.</p>' +
        '<button class="btn btn--primary" type="button" id="empty-reset">Xoá bộ lọc</button></div>';
      document.getElementById('empty-reset').addEventListener('click', resetAll);
    } else {
      empty.style.display = 'none';
      grid.innerHTML = list.map(function (p) { return U.productCard(p); }).join('');
    }
    renderChips();
    syncTitle();
  }

  function resetAll() {
    state = { cats: [], brands: [], min: 0, max: 0, q: '', inStock: false, onSale: false, sort: state.sort };
    history.replaceState(null, '', 'shop.html');
    buildFilters();
    render();
  }

  /* --- Sự kiện --- */
  document.getElementById('filters').addEventListener('change', function (e) {
    var t = e.target;
    if (t.dataset.fcat) {
      var id = t.dataset.fcat;
      if (t.checked) state.cats.push(id);
      else state.cats = state.cats.filter(function (x) { return x !== id; });
    }
    if (t.dataset.fbrand) {
      var b = t.dataset.fbrand;
      if (t.checked) state.brands.push(b);
      else state.brands = state.brands.filter(function (x) { return x !== b; });
    }
    if (t.id === 'f-stock') state.inStock = t.checked;
    if (t.id === 'f-sale') state.onSale = t.checked;
    render();
  });

  document.getElementById('apply-price').addEventListener('click', function () {
    state.min = Number(document.getElementById('f-min').value) || 0;
    state.max = Number(document.getElementById('f-max').value) || 0;
    if (state.max && state.min > state.max) {
      var t = state.min; state.min = state.max; state.max = t;
      document.getElementById('f-min').value = state.min;
      document.getElementById('f-max').value = state.max;
    }
    render();
  });

  document.getElementById('sort').addEventListener('change', function (e) {
    state.sort = e.target.value;
    render();
  });

  document.getElementById('reset-filters').addEventListener('click', resetAll);

  document.getElementById('active-chips').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-chip]');
    if (!btn) return;
    var type = btn.dataset.chip, val = btn.dataset.value;
    if (type === 'cat') state.cats = state.cats.filter(function (x) { return x !== val; });
    if (type === 'brand') state.brands = state.brands.filter(function (x) { return x !== val; });
    if (type === 'price') { state.min = 0; state.max = 0; }
    if (type === 'stock') state.inStock = false;
    if (type === 'sale') state.onSale = false;
    if (type === 'q') state.q = '';
    buildFilters();
    render();
  });

  /* Mobile: mở/đóng bộ lọc */
  var filtersEl = document.getElementById('filters');
  document.getElementById('open-filters').addEventListener('click', function () {
    filtersEl.classList.add('is-open');
  });
  document.addEventListener('click', function (e) {
    if (filtersEl.classList.contains('is-open') &&
        !e.target.closest('#filters') && !e.target.closest('#open-filters')) {
      filtersEl.classList.remove('is-open');
    }
  });

  buildFilters();
  render();
})();
