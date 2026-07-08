/* ============ Language switch (English / 繁體 / 简体) ============ */

(function () {
  const STORAGE_KEY = "currenc-lang";
  const DEFAULT_LANG = "en";
  const originalHtml = new Map();
  const originalPlaceholder = new Map();

  function captureOriginals() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      if (!originalHtml.has(el)) originalHtml.set(el, el.innerHTML);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      if (!originalPlaceholder.has(el)) originalPlaceholder.set(el, el.getAttribute("placeholder"));
    });
  }

  function applyLang(lang) {
    const dict = (window.I18N && window.I18N[lang]) || null;

    document.documentElement.setAttribute("lang", lang === "en" ? "en" : lang);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict && Object.prototype.hasOwnProperty.call(dict, key)) {
        el.innerHTML = dict[key];
      } else {
        el.innerHTML = originalHtml.get(el);
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict && Object.prototype.hasOwnProperty.call(dict, key)) {
        el.setAttribute("placeholder", dict[key]);
      } else {
        el.setAttribute("placeholder", originalPlaceholder.get(el));
      }
    });
  }

  function syncSelects(lang) {
    document.querySelectorAll(".lang-select").forEach((sel) => {
      sel.value = lang;
    });
  }

  captureOriginals();
  const savedLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  syncSelects(savedLang);
  applyLang(savedLang);

  document.querySelectorAll(".lang-select").forEach((sel) => {
    sel.addEventListener("change", (event) => {
      const lang = event.target.value;
      localStorage.setItem(STORAGE_KEY, lang);
      syncSelects(lang);
      applyLang(lang);
    });
  });
})();
