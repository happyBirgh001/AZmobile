/* =========================================================
   AZmobile — Chi tiết bài viết
   URL: post.html?slug=<slug>  hoặc  post.html?id=<id>
   ========================================================= */
(function () {
  'use strict';

  var U = AZUI, D = AZDB;

  U.mountLayout('blog.html');

  var qs = new URLSearchParams(location.search);
  var slug = qs.get('slug');
  var id = qs.get('id');
  var post = slug ? D.postBySlug(slug) : (id ? D.postById(id) : null);

  var host = document.getElementById('article');

  if (!post || post.status !== 'published') {
    document.getElementById('crumb-title').textContent = 'Không tìm thấy';
    host.innerHTML = '<div class="empty-state" style="padding:80px 20px">' +
      '<h2>Không tìm thấy bài viết</h2>' +
      '<p>Bài viết có thể đã bị xoá hoặc đường dẫn không đúng.</p>' +
      '<a class="btn btn--primary" href="blog.html">Xem tất cả bài viết</a></div>';
    AZSEO.page({ title: 'Không tìm thấy bài viết', noindex: true });
    return;
  }

  document.getElementById('crumb-title').textContent = post.title;

  // Nội dung: mỗi khối cách nhau 1 dòng trống → 1 đoạn văn
  function paragraphs(text) {
    return String(text || '').split(/\n\s*\n/).map(function (p) {
      var t = p.trim();
      if (!t) return '';
      return '<p>' + U.esc(t).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  var shareUrl = encodeURIComponent(AZSEO.abs('post.html?slug=' + encodeURIComponent(post.slug)));
  var shareText = encodeURIComponent(post.title);
  var fbPage = (D.facebook() || {}).pageUrl || '';

  host.innerHTML =
    '<header class="article__head">' +
      '<span class="article__cat">' + U.esc(post.category) + '</span>' +
      '<h1>' + U.esc(post.title) + '</h1>' +
      '<div class="article__meta">' +
        '<span>' + U.esc(post.author || 'AZmobile') + '</span>' +
        '<span>·</span>' +
        '<time datetime="' + U.esc(post.publishedAt) + '">' + U.date(post.publishedAt) + '</time>' +
      '</div>' +
    '</header>' +
    (post.cover ? '<figure class="article__cover"><img src="' + U.esc(post.cover) + '" alt="' + U.esc(post.title) + '"></figure>' : '') +
    '<div class="article__body">' + paragraphs(post.content) + '</div>' +
    '<div class="article__share">' +
      '<span>Chia sẻ:</span>' +
      '<a class="share-btn" href="https://www.facebook.com/sharer/sharer.php?u=' + shareUrl + '" target="_blank" rel="noopener">Facebook</a>' +
      '<a class="share-btn" href="https://zalo.me/share?u=' + shareUrl + '" target="_blank" rel="noopener">Zalo</a>' +
      '<button class="share-btn" type="button" id="copy-link">Sao chép liên kết</button>' +
    '</div>';

  var copyBtn = document.getElementById('copy-link');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var link = decodeURIComponent(shareUrl);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(function () {
          U.toast('Đã sao chép liên kết bài viết', 'success');
        }, function () {
          U.toast('Không sao chép được, hãy copy thủ công', 'error');
        });
      } else {
        U.toast('Trình duyệt không hỗ trợ sao chép tự động', 'error');
      }
    });
  }

  // Bài viết liên quan (cùng chuyên mục, tối đa 3)
  var others = D.publishedPosts().filter(function (p) {
    return p.id !== post.id && p.category === post.category;
  }).slice(0, 3);
  if (others.length < 3) {
    D.publishedPosts().forEach(function (p) {
      if (others.length >= 3) return;
      if (p.id === post.id) return;
      if (others.some(function (x) { return x.id === p.id; })) return;
      others.push(p);
    });
  }

  var relWrap = document.getElementById('related-wrap');
  if (others.length) {
    relWrap.innerHTML = '<section class="related">' +
      '<h2>Bài viết liên quan</h2>' +
      '<div class="post-grid">' + others.map(function (p) {
        return '<article class="post-card">' +
          '<a class="post-card__media" href="post.html?slug=' + encodeURIComponent(p.slug) + '">' +
            (p.cover
              ? '<img src="' + U.esc(p.cover) + '" alt="' + U.esc(p.title) + '" loading="lazy">'
              : '<span class="post-card__ph"></span>') +
          '</a>' +
          '<div class="post-card__body">' +
            '<div class="post-card__meta"><span class="post-card__cat">' + U.esc(p.category) + '</span>' +
              '<span>' + U.date(p.publishedAt) + '</span></div>' +
            '<h3 class="post-card__title"><a href="post.html?slug=' + encodeURIComponent(p.slug) + '">' +
              U.esc(p.title) + '</a></h3>' +
          '</div></article>';
      }).join('') + '</div></section>';
  }

  /* SEO — dùng đúng bộ cấu hình SEO của bài viết */
  AZSEO.post(post);

  if (fbPage) {
    var like = document.createElement('div');
    like.className = 'article__fbpage';
    like.innerHTML = '<a href="' + U.esc(fbPage) + '" target="_blank" rel="noopener">Theo dõi AZmobile trên Facebook</a>';
    relWrap.appendChild(like);
  }
})();
