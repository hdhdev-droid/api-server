(function () {
  window.API_BASE = window.API_BASE || window.location.origin;
  window.api = function (path, options) {
    options = options || {};
    var url = window.API_BASE + (path.indexOf('/') === 0 ? path : '/api/' + path);
    return fetch(url, {
      method: options.method || 'GET',
      headers: options.headers || { 'Content-Type': 'application/json' },
      body: options.body
    });
  };
  window.escapeHtml = function (s) {
    if (s == null) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  };
})();
