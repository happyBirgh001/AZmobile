/* =========================================================
   AZmobile — SEO Engine
   Áp thẻ meta / Open Graph / Twitter Card / JSON-LD / Facebook Pixel
   cho mọi trang, dựa trên cấu hình lưu trong localStorage.

   Cách dùng ở cuối mỗi trang:
     AZSEO.page({ title, description, image, keywords })
     AZSEO.product(sanPham)
     AZSEO.post(baiViet)
   ========================================================= */
(function (global) {
  'use strict';

  var D = global.AZDB;
  if (!D) return;

  var MARK = 'data-azseo';

  /* ---------------- Tiện ích ---------------- */

  function baseUrl() {
    var seo = D.seo() || {};
    return String(seo.baseUrl || '').replace(/\/+$/, '');
  }

  // Ghép đường dẫn tương đối thành URL tuyệt đối (Open Graph bắt buộc phải tuyệt đối)
  function abs(u) {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    var b = baseUrl();
    if (!b) {
      b = location.origin + location.pathname.replace(/[^/]*$/, '');
      b = b.replace(/\/+$/, '');
    }
    return b + '/' + String(u).replace(/^\/+/, '');
  }

  // URL chuẩn của trang hiện tại (bỏ hash, giữ query)
  function currentUrl() {
    var b = baseUrl();
    if (!b) return location.origin + location.pathname + location.search;
    return b + '/' + location.pathname.replace(/^\/+/, '') + location.search;
  }

  function clip(s, n) {
    s = String(s || '').replace(/\s+/g, ' ').trim();
    if (s.length <= n) return s;
    return s.slice(0, n - 1).replace(/[\s,;.]+\S*$/, '') + '…';
  }

  /* ---------------- Ghi thẻ ---------------- */

  function clearManaged() {
    document.head.querySelectorAll('[' + MARK + ']').forEach(function (el) {
      el.parentNode.removeChild(el);
    });
  }

  function meta(attr, key, val) {
    if (val === '' || val == null) return;
    var el = document.head.querySelector('meta[' + attr + '="' + key + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute(MARK, '1');
    el.setAttribute('content', String(val));
  }

  function link(rel, href) {
    if (!href) return;
    var el = document.head.querySelector('link[rel="' + rel + '"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute(MARK, '1');
    el.setAttribute('href', href);
  }

  function jsonLd(obj) {
    if (!obj) return;
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute(MARK, '1');
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  }

  /* ---------------- Facebook Pixel ---------------- */

  function injectPixel() {
    var fb = D.facebook() || {};
    if (!fb.pixelEnabled || !fb.pixelId) return;
    if (global.__azPixelLoaded) return;
    global.__azPixelLoaded = true;

    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(global, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    global.fbq('init', fb.pixelId);
    global.fbq('track', 'PageView');
  }

  /* ---------------- Áp dụng ---------------- */

  /**
   * @param {Object} o
   *   type        'website' | 'product' | 'article'
   *   title       tiêu đề trang (chưa ghép template)
   *   description meta description
   *   keywords    meta keywords
   *   image       ảnh chia sẻ (tương đối hoặc tuyệt đối)
   *   url         canonical (mặc định: URL hiện tại)
   *   noindex     true → noindex,nofollow
   *   siteName    tên site (mặc định lấy từ cài đặt)
   *   schema      object JSON-LD bổ sung
   */
  function apply(o) {
    o = o || {};
    var seo = D.seo() || {};
    var fb = D.facebook() || {};
    var st = D.settings() || {};
    var site = st.siteName || 'AZmobile';

    var rawTitle = (o.title || seo.defaultTitle || site).trim();
    var title = rawTitle;
    if (o.title && seo.titleTemplate) {
      title = seo.titleTemplate
        .replace(/\{page\}/g, rawTitle)
        .replace(/\{site\}/g, site);
    }

    var desc = clip(o.description || seo.defaultDescription || '', 300);
    var keywords = o.keywords || seo.defaultKeywords || '';
    var image = abs(o.image || seo.defaultImage || '');
    var url = o.url || currentUrl();
    var robots = o.noindex ? 'noindex,nofollow' : (seo.robots || 'index,follow');

    clearManaged();

    document.title = title;

    meta('name', 'description', desc);
    meta('name', 'keywords', keywords);
    meta('name', 'robots', robots);

    // Open Graph
    meta('property', 'og:site_name', site);
    meta('property', 'og:locale', fb.locale || 'vi_VN');
    meta('property', 'og:type', o.type || fb.ogType || 'website');
    meta('property', 'og:title', title);
    meta('property', 'og:description', desc);
    meta('property', 'og:url', url);
    meta('property', 'og:image', image);
    if (image) {
      meta('property', 'og:image:alt', rawTitle);
    }
    if (fb.appId) meta('property', 'fb:app_id', fb.appId);

    // Twitter Card
    meta('name', 'twitter:card', 'summary_large_image');
    meta('name', 'twitter:title', title);
    meta('name', 'twitter:description', desc);
    meta('name', 'twitter:image', image);
    if (seo.twitterHandle) meta('name', 'twitter:site', seo.twitterHandle);

    link('canonical', url);

    // JSON-LD: tổ chức (luôn có) + schema riêng của trang
    var org = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: site,
      url: baseUrl() || location.origin,
      description: seo.defaultDescription || '',
      telephone: st.hotline || '',
      email: st.email || '',
      address: st.address ? { '@type': 'PostalAddress', streetAddress: st.address, addressCountry: 'VN' } : undefined
    };
    if (image) org.logo = image;
    if (fb.pageUrl) org.sameAs = [fb.pageUrl];
    jsonLd(org);

    if (o.schema) jsonLd(o.schema);

    injectPixel();
  }

  /* ---------------- API theo loại trang ---------------- */

  function page(o) {
    o = o || {};
    apply({
      type: 'website',
      title: o.title || '',
      description: o.description,
      keywords: o.keywords,
      image: o.image,
      url: o.url,
      noindex: o.noindex
    });
  }

  function product(p) {
    if (!p) return page({});
    var s = p.seo || {};
    var seo = D.seo() || {};
    var st = D.settings() || {};
    var img = s.image || p.image || seo.defaultImage;
    var desc = s.description || p.description || (p.name + ' chính hãng tại ' + (st.siteName || 'AZmobile') + '.');
    var title = s.title || (p.name + (p.brand ? ' — ' + p.brand : ''));

    apply({
      type: 'product',
      title: title,
      description: desc,
      keywords: s.keywords || ([p.name, p.brand, 'laptop'].filter(Boolean).join(', ')),
      image: img,
      url: s.canonical || currentUrl(),
      noindex: s.noindex,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        description: clip(desc, 500),
        sku: p.id,
        brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
        image: img ? [abs(img)] : undefined,
        aggregateRating: p.rating ? {
          '@type': 'AggregateRating',
          ratingValue: p.rating,
          reviewCount: Math.max(1, p.sold || 1)
        } : undefined,
        offers: {
          '@type': 'Offer',
          price: p.price,
          priceCurrency: 'VND',
          availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          url: s.canonical || currentUrl()
        }
      }
    });
  }

  function post(p) {
    if (!p) return page({});
    var s = p.seo || {};
    var seo = D.seo() || {};
    var st = D.settings() || {};
    var img = s.image || p.cover || seo.defaultImage;
    var desc = s.description || p.excerpt || '';
    var title = s.title || p.title;

    apply({
      type: 'article',
      title: title,
      description: desc,
      keywords: s.keywords || ([p.title, p.category, 'AZmobile'].filter(Boolean).join(', ')),
      image: img,
      url: s.canonical || currentUrl(),
      noindex: s.noindex,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: clip(p.title, 110),
        description: clip(desc, 300),
        image: img ? [abs(img)] : undefined,
        datePublished: p.publishedAt,
        dateModified: p.updatedAt || p.publishedAt,
        author: { '@type': 'Organization', name: p.author || st.siteName || 'AZmobile' },
        publisher: { '@type': 'Organization', name: st.siteName || 'AZmobile' },
        mainEntityOfPage: s.canonical || currentUrl()
      }
    });
  }

  /* ---------------- Xem trước (dùng cho trang admin) ---------------- */

  function preview(o) {
    o = o || {};
    var seo = D.seo() || {};
    var site = (D.settings() || {}).siteName || 'AZmobile';
    var rawTitle = (o.title || seo.defaultTitle || site).trim();
    var title = rawTitle;
    if (o.title && seo.titleTemplate) {
      title = seo.titleTemplate.replace(/\{page\}/g, rawTitle).replace(/\{site\}/g, site);
    }
    return {
      title: title,
      titleLength: title.length,
      description: clip(o.description || seo.defaultDescription || '', 300),
      url: o.url || currentUrl(),
      image: abs(o.image || seo.defaultImage || '')
    };
  }

  global.AZSEO = {
    apply: apply,
    page: page,
    product: product,
    post: post,
    preview: preview,
    abs: abs
  };
})(window);
