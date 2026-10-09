/* Тиры и очки. Очки подобраны по вашим данным:
   HT1=10, HT2=8, HT3=6, HT4=2. Остальные можно менять свободно. */
window.MC = window.MC || {};

// От сильного к слабому
MC.TIER_ORDER = ['HT1', 'LT1', 'HT2', 'LT2', 'HT3', 'LT3', 'HT4', 'LT4', 'HT5', 'LT5'];

MC.TIER_POINTS = {
  HT1: 10, LT1: 9,
  HT2: 8,  LT2: 7,
  HT3: 6,  LT3: 4,
  HT4: 2,  LT4: 1,
  HT5: 1,  LT5: 0,
};

MC.TIER_LEVELS = [1, 2, 3, 4, 5];

MC.SERVER = { ip: 'mcpvp.club', discord: '#' };

// Скин по умолчанию (Steve) — показывается, пока у игрока не указан свой скин в players.js
MC.DEFAULT_SKIN = './images/steve.png';
