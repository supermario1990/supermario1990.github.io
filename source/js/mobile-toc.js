/* 窄屏下 Fluid 会隐藏侧边栏目录，这里把目录复制成正文顶部的折叠块 */
(function () {
  function isNarrow() {
    return window.matchMedia('(max-width: 991px)').matches;
  }

  function buildToc(tries) {
    if (!isNarrow()) return;

    var body = document.getElementById('toc-body');
    var article = document.querySelector('.markdown-body');
    if (!body || !article) return;

    if (!body.children.length) {
      if (tries > 0) setTimeout(function () { buildToc(tries - 1); }, 300);
      return;
    }

    if (article.querySelector('.mobile-toc')) return;

    var details = document.createElement('details');
    details.className = 'mobile-toc';

    var summary = document.createElement('summary');
    summary.textContent = '目录';
    details.appendChild(summary);

    var wrap = document.createElement('div');
    wrap.className = 'toc-list';
    wrap.innerHTML = body.innerHTML;
    details.appendChild(wrap);

    article.insertBefore(details, article.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { buildToc(20); });
  } else {
    buildToc(20);
  }
})();
