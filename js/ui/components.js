/* Шаблоны (HTML-строки) для карточек, бейджей и иконок. */
window.MC = window.MC || {};
MC.ui = MC.ui || {};

// <canvas> со скином игрока. Рисуется в MC.skin.hydrate(); нет skin -> Steve
MC.ui.skin = (p, part = 'bust', cls = '') =>
  `<canvas class="skin skin-${part} ${cls}" data-skin="${MC.esc(p.skin || '')}" data-part="${part}" data-slim="${p.slim === true ? 1 : p.slim === false ? 0 : ''}" width="16" height="20" role="img" aria-label="Skin"></canvas>`;

MC.ui.modeIcon = (mode, cls = 'icon') =>
  `<img class="${cls}" src="${MC.esc(mode.icon)}" data-fa="${mode.fa}" alt="${MC.esc(mode.name)}">`;

MC.ui.tierTag = (tier) =>
  tier
    ? `<span class="tier-tag t-${tier.level} ${tier.high ? 'ht' : 'lt'}">${tier.code}</span>`
    : `<span class="tier-tag t-none">-</span>`;

MC.ui.playerCard = (p) => {
  const tiers = MC.MODES.map(
    (m) => `
      <div class="tier-badge" title="${MC.esc(m.name)}">
        <div class="tier-icon-circle">${MC.ui.modeIcon(m)}</div>
        ${MC.ui.tierTag(MC.getTier(p, m.id))}
      </div>`
  ).join('');

  return `
  <div class="player-card" data-player="${MC.esc(p.id)}" tabindex="0" role="button" aria-label="Подробности: ${MC.esc(p.username)}">
    <div class="player-top-mobile">
      <div class="player-left">
        <div class="rank-banner rank-${p.rank <= 3 ? p.rank : 'other'}">
          <span class="rank-number">${p.rank}.</span>
          ${MC.ui.skin(p, 'bust', 'player-skin')}
        </div>
        <div class="player-details">
          <div class="player-name">${MC.esc(p.username)}</div>
          <div class="player-points">${MC.pointsText(p.points)}</div>
        </div>
      </div>
      <div class="region-badge mobile-region">${MC.esc(p.region)}</div>
    </div>
    <div class="player-right">
      <div class="region-badge desktop-region">${MC.esc(p.region)}</div>
      <div class="tiers-wrapper">
        <div class="tiers-title">TIERS</div>
        <div class="tiers-container">${tiers}</div>
      </div>
    </div>
  </div>`;
};

// Элемент в колонке тира на странице режима
MC.ui.tierEntry = (e) => `
  <div class="tier-entry" data-player="${MC.esc(e.player.id)}" tabindex="0" role="button">
    ${MC.ui.skin(e.player, 'head', 'entry-avatar')}
    <div class="entry-info">
      <span class="entry-name">${MC.esc(e.player.username)}</span>
      <span class="entry-sub">${MC.esc(e.player.region)} · ${MC.pointsText(e.player.points)}</span>
    </div>
    <span class="entry-code t-${e.tier.level} ${e.tier.high ? 'ht' : 'lt'}">
      <i class="fa-solid ${e.tier.high ? 'fa-angles-up' : 'fa-angles-down'}"></i> ${e.tier.code}
    </span>
  </div>`;

// Клик/Enter по любому элементу с data-player внутри контейнера открывает модалку
MC.ui.bindPlayerOpen = (container) => {
  const open = (el) => {
    const card = el.target.closest('[data-player]');
    if (card) MC.modal.openPlayer(card.dataset.player);
  };
  container.addEventListener('click', open);
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.target.closest('[data-player]')) { e.preventDefault(); open(e); }
    }
  });
};
