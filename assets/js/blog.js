/* =========================================================
   AZmobile — Danh sách bài viết
   ========================================================= */
(function () {
  'use strict';

  var U = AZUI, D = AZDB;

  U.mountLayout('blog.html');

  var all = D.publishedPosts();
  var activeCat = 'all';

  function coverOf(p) {
    if (p.cover) {
      return '<img src="' + U.esc(p.cover) + '" alt="' + U.esc(p.title) + '" loading="lazy">';
    }
    // Ảnh minh hoạ tự động khi bài viết chưa có ảnh bìa
    return '<span class="post-card__ph" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/></svg></span>';
  }

  function card(p) {
    return '<article class="post-card">' +
      '<a class="post-card__media" href="post.html?slug=' + encodeURIComponent(p.slug) + '">' + coverOf(p) + '</a>' +
      '<div class="post-card__body">' +
        '<div class="post-card__meta">' +
          '<span class="post-card__cat">' + U.esc(p.category) + '</span>' +
          '<span>' + U.date(p.publishedAt) + '</span>' +
        '</div>' +
        '<h2 class="post-card__title"><a href="post.html?slug=' + encodeURIComponent(p.slug) + '">' +
          U.esc(p.title) + '</a></h2>' +
        '<p class="post-card__excerpt">' + U.esc(p.excerpt || '') + '</p>' +
        '<a class="post-card__more" href="post.html?slug=' + encodeURIComponent(p.slug) + '">Đọc tiếp →</a>' +
      '</div>' +
    '</article>';
  }

  function renderFilter() {
    var cats = [];
    all.forEach(function (p) {
      if (cats.indexOf(p.category) === -1) cats.push(p.category);
    });
    if (cats.length < 2) { document.getElementById('post-filter').innerHTML = ''; return; }
    var chips = [{ key: 'all', label: 'Tất cả' }].concat(cats.map(function (c) {
      return { key: c, label: c };
    }));
    document.getElementById('post-filter').innerHTML = chips.map(function (c) {
      return '<button type="button" class="chip' + (activeCat === c.key ? ' is-active' : '') +
        '" data-cat="' + U.esc(c.key) + '">' + U.esc(c.label) + '</button>';
    }).join('');
  }

  function renderList() {
    var list = activeCat === 'all' ? all : all.filter(function (p) { return p.category === activeCat; });
    var grid = document.getElementById('post-grid');
    var empty = document.getElementById('post-empty');

    if (!list.length) {
      grid.innerHTML = '';
      empty.style.display = '';
      empty.innerHTML = '<div class="empty-state"><h3>Chưa có bài viết nào</h3>' +
        '<p>Nội dung sẽ xuất hiện ở đây khi được đăng từ trang quản trị.</p></div>';
      return;
    }
    empty.style.display = 'none';
    grid.innerHTML = list.map(card).join('');
  }

  document.getElementById('post-filter').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]');
    if (!b) return;
    activeCat = b.getAttribute('data-cat');
    renderFilter();
    renderList();
  });

  renderFilter();
  renderList();

  /* SEO */
  var seoTitle = 'Bài viết & tư vấn';
  AZSEO.page({
    title: seoTitle,
    description: 'Tin tức, tư vấn chọn laptop, thủ thuật và kinh nghiệm bảo hành từ AZmobile.',
    keywords: 'tin tức laptop, tư vấn laptop, thủ thuật laptop, AZmobile'
  });

  // Schema cho trang danh sách: danh sách bài viết
  if (all.length) {
    AZSEO.apply({
      type: 'website',
      title: seoTitle,
      description: 'Tin tức, tư vấn chọn laptop, thủ thuật và kinh nghiệm bảo hành từ AZmobile.',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: seoTitle,
        blogPost: all.slice(0, 10).map(function (p) {
          return {
            '@type': 'BlogPosting',
            headline: p.title,
            datePublished: p.publishedAt,
            url: AZSEO.abs('post.html?slug=' + encodeURIComponent(p.slug))
          };
        })
      }
    });
  }
})();
