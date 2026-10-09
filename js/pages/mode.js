/* Страница: рейтинг режима (mode.html?mode=sword) — колонки Tier 1..5 */
(() => {
  const mode = MC.getMode(new URLSearchParams(location.search).get('mode'));
  if (!mode) { location.replace('Permisson.html'); return; }

  document.title = `${mode.name} — MCTIERS`;
  const { searchInput } = MC.layout.mount(document.getElementById('app-header'), { activeMode: mode.id });
  const root = document.getElementById('mode-root');

  function render(query = '') {
    const cols = MC.getTierColumns(mode.id, query);
    const total = MC.TIER_LEVELS.reduce((n, l) => n + cols[l].length, 0);

    root.innerHTML = `
      <div class="mode-title">
        ${MC.ui.modeIcon(mode, 'mode-title-icon')}
        <h2>${MC.esc(mode.name)}</h2>
        <span class="mode-count">${total} players</span>
      </div>
      <div class="tier-columns">
        ${MC.TIER_LEVELS.map((l) => `
          <section class="tier-col t-${l}">
            <header class="tier-col-head"><i class="fa-solid fa-trophy"></i> Tier ${l}
              <span class="col-count">${cols[l].length}</span></header>
            <div class="tier-col-body">
              ${cols[l].length ? cols[l].map(MC.ui.tierEntry).join('') : '<p class="empty small">Пусто</p>'}
            </div>
          </section>`).join('')}
      </div>`;
    MC.skin.hydrate(root);
  }

  MC.ui.bindPlayerOpen(root);
  searchInput.addEventListener('input', () => render(searchInput.value));
  render();
})();
