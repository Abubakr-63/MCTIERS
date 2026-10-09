/* Только данные. Очки и места считаются автоматически (см. utils.js).
   tiers: { id_режима: 'HT1' | 'LT3' | ... }  — нет записи = нет тира.

   СКИНЫ
   skin: путь к файлу скина Minecraft (PNG 64x64, тот самый, что скачивается с сайта скинов).
         1) положи файл в папку ./skins/  (например ./skins/pkasteve4283.png)
         2) впиши путь:  skin: './skins/pkasteve4283.png'
         Пока skin пустой ('') — у игрока показывается Steve. Как только путь указан — сайт сам
         нарисует его настоящий скин (голова, торс, руки) везде: в рейтинге, в режимах, в окне игрока.
   slim: необязательно. true — тонкие руки (модель Alex), false — обычные (Steve).
         Если не указывать, сайт попробует определить сам. */
window.MC = window.MC || {};

MC.PLAYERS = [
  { id: 'pkasteve4283',   username: 'Pkasteve4283',   region: 'TJ', title: 'Combat Player', skin: '../../skins/pkasteve.png', tiers: { sword: 'HT1', mace: 'HT3' } },
  { id: 'zayniddin6837',  username: 'Zayniddin6837',  region: 'TJ', title: 'Combat Player', skin: '', tiers: { sword: 'HT2', mace: 'HT2' } },
  { id: 'emomali67',      username: 'Emomali67',      region: 'TJ', title: 'Combat Player', skin: '../../skins/emomali.png', tiers: { mace: 'HT1', sword: 'LT5' } },
  { id: 'suslik6484',     username: 'Suslik6484',     region: 'TJ', title: 'Combat Player', skin: '../../skins/suslik.png', tiers: { sword: 'HT3' } },
  { id: 'qurbonov-remy',  username: 'QURBONOV REMY',  region: 'TJ', title: 'Combat Player', skin: '', tiers: { sword: 'HT4', mace: 'HT4' } },
  { id: 'zaydanraja2165', username: 'ZaydanRaja2165', region: 'TJ', title: 'Combat Player', skin: '', tiers: { mace: 'LT5' } },
];
