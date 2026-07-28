/* ============ Knowledge Library — render video gallery + article list ============ */

(function () {
  const videos = window.KNOWLEDGE_VIDEOS || [];
  const articles = window.KNOWLEDGE_ARTICLES || [];

  function currentLang() {
    return localStorage.getItem("currenc-lang") || "en";
  }
  function t(key, fallback) {
    const dict = (window.I18N && window.I18N[currentLang()]) || null;
    if (dict && Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    return fallback;
  }
  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderVideos() {
    const grid = document.getElementById("klibVideoGrid");
    if (!grid) return;
    grid.innerHTML = videos
      .map(function (v) {
        return (
          '<a class="klib-video" href="https://www.youtube.com/watch?v=' + esc(v.youtubeId) + '" target="_blank" rel="noopener">' +
            '<span class="klib-thumb">' +
              '<img src="https://i.ytimg.com/vi/' + esc(v.youtubeId) + '/hqdefault.jpg" alt="" />' +
              '<span class="klib-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 7.5l9 4.5-9 4.5z" /></svg></span>' +
              '<span class="klib-dur">' + esc(v.duration) + "</span>" +
              (v.opinion ? '<span class="klib-opinion">' + esc(t("klib.card.opinion", "Opinion")) + "</span>" : "") +
            "</span>" +
            '<span class="klib-video-title">' + esc(v.title) + "</span>" +
            '<span class="klib-video-meta">' + esc(v.source) + "</span>" +
          "</a>"
        );
      })
      .join("");
  }

  function renderArticles() {
    const list = document.getElementById("klibArticleList");
    if (!list) return;
    list.innerHTML = articles
      .map(function (a) {
        return (
          '<li><a class="klib-article" href="' + esc(a.url) + '" target="_blank" rel="noopener">' +
            '<span class="klib-article-source">' + esc(a.source) + "</span>" +
            '<span class="klib-article-title">' + esc(a.title) + "</span>" +
            '<span class="klib-article-meta">' + esc(a.duration) + "</span>" +
            '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>' +
          "</a></li>"
        );
      })
      .join("");
  }

  function renderAll() {
    renderVideos();
    renderArticles();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderAll();
    document.querySelectorAll(".lang-select").forEach(function (sel) {
      sel.addEventListener("change", function () {
        setTimeout(renderAll, 0);
      });
    });
  });
})();
