// ---- Theme toggle (applied immediately to avoid a flash of the wrong theme) ----
(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('rc-theme'); } catch (e) {}
  var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', saved || (systemDark ? 'dark' : 'light'));
})();

document.addEventListener('DOMContentLoaded', function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  function syncToggle() {
    btn.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
  }
  syncToggle();
  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('rc-theme', next); } catch (e) {}
    syncToggle();
  });

  // ---- Category icons (simple inline SVGs, matched by the "icon" key in content.json) ----
  var ICONS = {
    mechanik: '<path d="M14 3l7 7-9 9-7-7z"/><path d="M8 15l-4 4"/>',
    elektro: '<path d="M4 14a4 4 0 014-4h8a4 4 0 010 8H8a4 4 0 01-4-4z"/><circle cx="8" cy="14" r="1.5"/>',
    elektronik: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 18h6"/>'
  };

  function svgIcon(name) {
    var inner = ICONS[name] || ICONS.mechanik;
    return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' + inner + '</svg>';
  }

  // ---- Load content.json and render categories + news ----
  // (Uses XMLHttpRequest rather than fetch for the widest possible browser support.)
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'content.json', true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status !== 200 && xhr.status !== 0) {
      showLoadError();
      return;
    }
    try {
      var data = JSON.parse(xhr.responseText);
      renderCategories(data.categories || []);
      renderNews(data.news || []);
    } catch (err) {
      showLoadError();
    }
  };
  xhr.send();

  function showLoadError() {
    document.getElementById('categoryCards').innerHTML =
      '<p class="news-empty">Inhalte konnten nicht geladen werden.</p>';
    document.getElementById('newsList').innerHTML =
      '<p class="news-empty">Keine Neuigkeiten verfügbar.</p>';
  }

  function renderCategories(categories) {
    var el = document.getElementById('categoryCards');
    if (!categories.length) {
      el.innerHTML = '<p class="news-empty">Noch keine Kategorien hinterlegt.</p>';
      return;
    }
    el.innerHTML = categories.map(function (c) {
      return '<div class="card">' +
        svgIcon(c.icon) +
        '<h3>' + escapeHtml(c.name) + '</h3>' +
        '<p>' + escapeHtml(c.text) + '</p>' +
        '</div>';
    }).join('');
  }

  function renderNews(news) {
    var el = document.getElementById('newsList');
    if (!news.length) {
      el.innerHTML = '<p class="news-empty">Aktuell keine Neuigkeiten.</p>';
      return;
    }
    var sorted = news.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    el.innerHTML = sorted.map(function (n) {
      var d = new Date(n.date + 'T00:00:00');
      var formatted = isNaN(d) ? n.date : d.toLocaleDateString('de-CH', { year: 'numeric', month: 'long', day: 'numeric' });
      return '<div class="news-item">' +
        '<span class="date">' + escapeHtml(formatted) + '</span>' +
        '<div><h3>' + escapeHtml(n.title) + '</h3><p>' + escapeHtml(n.text) + '</p></div>' +
        '</div>';
    }).join('');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }
});
