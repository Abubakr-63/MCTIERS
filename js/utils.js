/* Логика: очки, места, доски по режимам. Без DOM. */
window.MC = window.MC || {};

MC.esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// 1 очко, 2 очка, 5 очков, 222 очка, 177 очков
MC.pointsText = (n) => {
  const a = Math.abs(n) % 100, b = a % 10;
  const w = a > 10 && a < 20 ? 'очков' : b === 1 ? 'очко' : b >= 2 && b <= 4 ? 'очка' : 'очков';
  return `${n} ${w}`;
};

MC.parseTier = (code) => {
  const m = /^(HT|LT)([1-5])$/.exec(code || '');
  if (!m) return null;
  return { code, high: m[1] === 'HT', level: Number(m[2]), points: MC.TIER_POINTS[code] ?? 0 };
};

MC.getTier = (player, modeId) => MC.parseTier(player.tiers && player.tiers[modeId]);

MC.calcPoints = (player) =>
  MC.MODES.reduce((sum, m) => sum + (MC.getTier(player, m.id)?.points || 0), 0);

// Общий рейтинг: сортировка по очкам, одинаковые очки = одинаковое место (1,1,2,3...)
MC.getRanked = (() => {
  let cache = null;
  return () => {
    if (cache) return cache;
    const list = MC.PLAYERS.map((p) => ({ ...p, points: MC.calcPoints(p) })).sort(
      (a, b) => b.points - a.points || a.username.localeCompare(b.username)
    );
    let rank = 0, prev = null;
    list.forEach((p) => {
      if (p.points !== prev) { rank++; prev = p.points; }
      p.rank = rank;
    });
    return (cache = list);
  };
})();

MC.getPlayer = (id) => MC.getRanked().find((p) => p.id === id) || null;

// Доска режима: у кого в этом режиме тир, от лучшего к худшему
MC.getModeBoard = (modeId) =>
  MC.getRanked()
    .map((p) => ({ player: p, tier: MC.getTier(p, modeId) }))
    .filter((e) => e.tier)
    .sort(
      (a, b) =>
        b.tier.points - a.tier.points ||
        MC.TIER_ORDER.indexOf(a.tier.code) - MC.TIER_ORDER.indexOf(b.tier.code) ||
        b.player.points - a.player.points ||
        a.player.username.localeCompare(b.player.username)
    )
    .map((e, i) => ({ ...e, position: i + 1 }));

// Колонки Tier 1..5 для страницы режима
MC.getTierColumns = (modeId, query = '') => {
  const q = query.trim().toLowerCase();
  const cols = {};
  MC.TIER_LEVELS.forEach((l) => (cols[l] = []));
  MC.getModeBoard(modeId).forEach((e) => {
    if (!q || e.player.username.toLowerCase().includes(q)) cols[e.tier.level].push(e);
  });
  return cols;
};

MC.getModePosition = (player, modeId) =>
  MC.getModeBoard(modeId).find((e) => e.player.id === player.id)?.position || null;
