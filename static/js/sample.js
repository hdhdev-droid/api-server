(function () {
  var base = window.API_BASE;

  document.getElementById('btnHealth').onclick = function () {
    var el = document.getElementById('outHealth');
    el.textContent = '요청 중...';
    window.api('/api/health')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        el.textContent = JSON.stringify(data, null, 2);
      })
      .catch(function (e) {
        el.textContent = 'Error: ' + e.message;
      });
  };

  document.getElementById('btnItems').onclick = function () {
    var el = document.getElementById('outItems');
    el.textContent = '요청 중...';
    window.api('/api/items')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        el.textContent = JSON.stringify(data, null, 2);
      })
      .catch(function (e) {
        el.textContent = 'Error: ' + e.message;
      });
  };

  document.getElementById('formItem').onsubmit = function (e) {
    e.preventDefault();
    var el = document.getElementById('outPost');
    var name = e.target.name.value.trim();
    el.textContent = '요청 중...';
    window.api('/api/items', {
      method: 'POST',
      body: JSON.stringify({ name: name })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        el.textContent = JSON.stringify(data, null, 2);
        e.target.name.value = '';
      })
      .catch(function (err) {
        el.textContent = 'Error: ' + err.message;
      });
  };
})();
