/* Модальное окно на нативном <dialog>: подробности игрока и информация о очках. */
window.MC = window.MC || {};

MC.modal = (() => {
  let dlg;

  function ensure() {
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.className = 'modal';
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // клик по фону
    dlg.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) dlg.close(); });
    document.body.append(dlg);
    return dlg;
  }

  function show(html) {
    const d = ensure();
    d.innerHTML = html;
    MC.skin.hydrate(d);
    if (!d.open) d.showModal();
    d.scrollTop = 0;
  }

  function openPlayer(id) {
    const p = MC.getPlayer(id);
    if (!p) return;

    const rows = MC.MODES.map((m) => {
      const tier = MC.getTier(p, m.id);
      const pos = tier ? MC.getModePosition(p, m.id) : null;
      return `
        <a class="mode-row ${tier ? '' : 'is-empty'}" href="mode.html?mode=${m.id}">
          <span class="mode-row-icon">${MC.ui.modeIcon(m)}</span>
          <span class="mode-row-name">${MC.esc(m.name)}</span>
          <span class="mode-row-pos">${pos ? '#' + pos + ' в режиме' : 'Нет тира'}</span>
          ${MC.ui.tierTag(tier)}
        </a>`;
    }).join('');

    const ranked = MC.MODES.filter((m) => MC.getTier(p, m.id)).length;

    show(`
      <button class="modal-close" data-close aria-label="Закрыть"><i class="fa-solid fa-xmark"></i></button>
      <div class="modal-head">
        <div class="modal-avatar rank-${p.rank <= 3 ? p.rank : 'other'}">
          ${MC.ui.skin(p, 'bust')}
        </div>
        <h2 class="modal-title">${MC.esc(p.username)}</h2>
        <div class="player-rank-sub modal-sub">
          <i class="fa-solid fa-crown"></i>
          <span class="rank-title">${MC.esc(p.title)}</span>
        </div>
        <span class="region-badge">${MC.esc(p.region)}</span>
      </div>

      <div class="modal-stats">
        <div class="stat"><span class="stat-value">#${p.rank}</span><span class="stat-label">Overall</span></div>
        <div class="stat"><span class="stat-value">${p.points}</span><span class="stat-label">Очки</span></div>
        <div class="stat"><span class="stat-value">${ranked}/${MC.MODES.length}</span><span class="stat-label">Modes</span></div>
      </div>

      <h3 class="modal-section">Tiers</h3>
      <div class="mode-rows">${rows}</div>
    `);
  }

  function openInfo() {
    const pts = MC.TIER_ORDER.map(
      (code) => `<div class="pts-cell"><span class="tier-tag t-${code.slice(2)} ${code[0] === 'H' ? 'ht' : 'lt'}">${code}</span><b>${MC.TIER_POINTS[code]}</b></div>`
    ).join('');

    show(`
      <button class="modal-close" data-close aria-label="Закрыть"><i class="fa-solid fa-xmark"></i></button>
      <div class="modal-head"><h2 class="modal-title">Information</h2></div>
      <p class="modal-text">
        Каждый тир в режиме даёт очки. Сумма очков по всем режимам определяет место в общем рейтинге.
        HT — High Tier (верх тира), LT — Low Tier (низ тира).
      </p>
      <h3 class="modal-section">Очки за тиры</h3>
      <div class="pts-grid">${pts}</div>
      <h3 class="modal-section">Сервер</h3>
      <p class="modal-text">IP: <b>${MC.esc(MC.SERVER.ip)}</b></p>
    `);
  }

  return { openPlayer, openInfo, close: () => dlg && dlg.close() };
})();
