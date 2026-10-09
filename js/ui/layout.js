/* Общая шапка: навбар, вкладки режимов, панель Information/IP. */
window.MC = window.MC || {};

MC.layout = (() => {
  function mount(target, { activeMode = null } = {}) {
    const tabs = [
      `<a class="tab-btn ${activeMode ? '' : 'active'}" href="index.html"><i class="fa-solid fa-trophy"></i> Overall</a>`,
      ...MC.MODES.map(
        (m) => `<a class="tab-btn ${activeMode === m.id ? 'active' : ''}" href="mode.html?mode=${m.id}">${MC.ui.modeIcon(m, 'svg')} ${MC.esc(m.name)}</a>`
      ),
    ].join('');

    target.innerHTML = `
      <nav class="navbar">
        <a class="logo" href="index.html"><h1><span>MC</span>TIERS</h1></a>
        <ul class="nav-links">
          <li><a href="index.html" class="nav-item"><i class="fa-solid fa-house"></i> Home</a></li>
          <li><a href="index.html" class="nav-item"><i class="fa-solid fa-trophy"></i> Rankings</a></li>
          <li><a href="${MC.SERVER.discord}" class="nav-item"><i class="fa-brands fa-discord"></i> Discords</a></li>
          <li><a href="Permisson.html" class="nav-item"><i class="fa-solid fa-code"></i> API Docs</a></li>
        </ul>
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input class="searchInp" type="text" placeholder="Search player..." autocomplete="off">
          <span class="slash-shortcut">/</span>
        </div>
        <button class="menu-toggle" aria-label="Меню"><i class="fa-solid fa-bars"></i></button>
      </nav>

      <div class="tabs-container">${tabs}</div>

      <div class="sub-bar">
        <button class="info-btn" data-info><i class="fa-solid fa-circle-info"></i> Information</button>
        <div class="server-ip-box">
          <span class="server-ip-label">SERVER IP</span>
          <div class="ip-badge" data-copy-ip>
            <span>${MC.esc(MC.SERVER.ip)}</span> <i class="fa-regular fa-copy" style="font-size:10px"></i>
          </div>
          <a href="${MC.SERVER.discord}" aria-label="Discord"><i class="fa-brands fa-discord" style="color:#5865F2;font-size:15px"></i></a>
        </div>
      </div>`;

    // ширина шапки «ТИРЫ» подстраивается под число режимов
    document.documentElement.style.setProperty('--modes', MC.MODES.length);

    const input = target.querySelector('.searchInp');

    target.querySelector('[data-info]').addEventListener('click', MC.modal.openInfo);
    target.querySelector('.menu-toggle').addEventListener('click', () =>
      target.querySelector('.nav-links').classList.toggle('open')
    );
    target.querySelector('[data-copy-ip]').addEventListener('click', async (e) => {
      const label = e.currentTarget.querySelector('span');
      try { await navigator.clipboard.writeText(MC.SERVER.ip); label.textContent = 'Copied!'; }
      catch { label.textContent = 'Copy failed'; }
      setTimeout(() => (label.textContent = MC.SERVER.ip), 1200);
    });

    // «/» фокусирует поиск
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        e.preventDefault();
        input.focus();
      }
    });

    // Картинка не загрузилась -> иконка Font Awesome / заглушка скина
    document.addEventListener('error', (e) => {
      const img = e.target;
      if (img.tagName !== 'IMG') return;
      if (img.dataset.fa) {
        const i = document.createElement('i');
        i.className = `fa-solid ${img.dataset.fa} ${img.className}`;
        img.replaceWith(i);
      }
    }, true);

    return { searchInput: input };
  }

  return { mount };
})();
