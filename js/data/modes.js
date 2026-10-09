/* Игровые режимы. Чтобы добавить режим — просто добавьте объект сюда
   и укажите тир игрокам в js/data/players.js (поле tiers). */
window.MC = window.MC || {};

MC.MODES = [
  { id: 'sword',   name: 'Sword',   fa: 'fa-khanda',       icon: 'https://www.pngall.com/wp-content/uploads/15/Minecraft-Sword.png' },
  { id: 'mace',    name: 'Mace',    fa: 'fa-hammer',       icon: 'https://cdn.modrinth.com/data/C36CZGrl/ccb43d9360360c188d0cc029f5b421d9fe8b7d77.png' },
  { id: 'axe',     name: 'Axe',     fa: 'fa-axe',          icon: 'https://minecraft-max.net/upload/iblock/082/082473104a0c707b3b0738701c5cb812.png' },
  { id: 'vanilla', name: 'Vanilla', fa: 'fa-cube',         icon: 'https://mctiers.com/tier_icons/vanilla.svg' },
  { id: 'pot',     name: 'Pot',     fa: 'fa-flask',        icon: 'https://mctiers.com/tier_icons/pot.svg' },
  { id: 'nethpot', name: 'NethPot', fa: 'fa-fire',         icon: 'https://mctiers.com/tier_icons/nethop.svg' },
  { id: 'smp',     name: 'SMP',     fa: 'fa-earth-europe', icon: 'https://mctiers.com/tier_icons/smp.svg' },
  { id: 'uhc',     name: 'UHC',     fa: 'fa-heart',        icon: 'https://mctiers.com/tier_icons/uhc.svg' },
];

MC.getMode = (id) => MC.MODES.find((m) => m.id === id) || null;
