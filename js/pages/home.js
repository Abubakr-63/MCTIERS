/* Страница: общий рейтинг (index.html) */
(() => {
  const { searchInput } = MC.layout.mount(document.getElementById('app-header'));
  const box = document.querySelector('.box');

  function render(query = '') {
    const q = query.trim().toLowerCase();
    const list = MC.getRanked().filter((p) => p.username.toLowerCase().includes(q));
    box.innerHTML = list.length ? list.map(MC.ui.playerCard).join('') : '<p class="empty">Игроки не найдены</p>';
    MC.skin.hydrate(box);
  }

  MC.ui.bindPlayerOpen(box);
  searchInput.addEventListener('input', () => render(searchInput.value));
  render();
})();
