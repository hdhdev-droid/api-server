(function () {
  var statusDot = document.getElementById('statusDot');
  var statusText = document.getElementById('statusText');
  var content = document.getElementById('content');
  var envContent = document.getElementById('envContent');

  function renderEnvTable(env) {
    var rows = Object.keys(env).map(function (k) {
      var val = window.escapeHtml(env[k]);
      var cls = env[k] === '(미설정)' ? ' class="value-empty"' : '';
      return '<tr><th>' + window.escapeHtml(k) + '</th><td' + cls + '>' + val + '</td></tr>';
    }).join('');
    return '<table class="env-table"><tbody>' + rows + '</tbody></table>';
  }

  function run() {
    window.api('/api/config')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        envContent.innerHTML = renderEnvTable(data.env || {});
      })
      .catch(function (e) {
        envContent.innerHTML = '<p class="error-msg">' + window.escapeHtml(e.message) + '</p>';
      });

    window.api('/api/tables')
      .then(function (res) { return res.text(); })
      .then(function (text) {
        var data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (err) {}
        if (data.error && !data.tables) {
          statusDot.className = 'status-dot error';
          statusText.textContent = 'DB 미설정 또는 오류';
          content.innerHTML = '<p class="error-msg">' + window.escapeHtml(data.error) + '</p>';
          return;
        }
        statusDot.className = 'status-dot ok';
        statusText.textContent = '연결됨';
        if (data.tables && data.tables.length > 0) {
          content.innerHTML = '<ul class="tables">' +
            data.tables.map(function (name) { return '<li>' + window.escapeHtml(name) + '</li>'; }).join('') +
            '</ul>';
        } else {
          content.innerHTML = '<p class="message">테이블이 없습니다.</p>';
        }
      })
      .catch(function (e) {
        statusDot.className = 'status-dot error';
        statusText.textContent = '오류';
        content.innerHTML = '<p class="error-msg">' + window.escapeHtml(e.message) + '</p>';
      });
  }
  run();
})();
