/* Отрисовка скинов Minecraft из обычных файлов скина (PNG 64x64 или старый 64x32).
   Вид 'bust'  — 3D-модель по пояс, повёрнутая боком (три четверти), как на превью скинов.
   Вид 'head'  — плоская голова спереди (маленькие аватарки).
   Нет скина / файл не найден -> рисуется Steve (MC.DEFAULT_SKIN). */
window.MC = window.MC || {};

MC.skin = (() => {
  /* ---- настройки вида (можно крутить) ---- */
  const YAW = 20 * Math.PI / 180;        // поворот тела и головы: плюс — смотрят вправо (виден их правый бок слева), минус — влево
  const HEAD_TURN = 0;                   // 0 — голова смотрит туда же, куда и тело
  const PITCH = 11 * Math.PI / 180;      // наклон камеры сверху (видно макушку)
  const ARM_SWING = 12 * Math.PI / 180;   // руки сверху прижаты к телу, книзу чуть разведены наружу
  const CAM_DIST = 42;                   // расстояние камеры в пикселях скина (меньше — сильнее перспектива)
  const K = 10;                          // пикселей холста на 1 пиксель скина (чёткость)
  const PAD = 0.6;                       // поля вокруг модели (в пикселях скина)
  const BLEED = 1.2;                     // небольшой «нахлёст» кусочков граней, чтобы не было щелей
  const CELL = 2;                        // грани режутся на кусочки 2x2 пикселя скина (точная перспектива)

  const cache = new Map(); // путь -> Promise<{ tex, slim }>

  /* ---------- загрузка и подготовка текстуры ---------- */
  // Alex (slim) определяем по прозрачным пикселям в области руки.
  // При открытии через file:// браузер не даёт читать пиксели — тогда считаем «классикой» (или задайте slim в players.js)
  function detectSlim(img) {
    if (img.height < 64) return false;
    try {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0);
      const d = x.getImageData(54, 20, 2, 12).data;
      for (let i = 3; i < d.length; i += 4) if (d[i] !== 0) return false;
      return true;
    } catch { return false; }
  }

  // Отразить коробку (рука/нога) из одной области текстуры в другую
  function mirrorBox(x, su, sv, du, dv, w, h, d) {
    const flip = (sx, sy, sw, sh, dx, dy) => {
      x.save();
      x.translate(dx + sw, dy);
      x.scale(-1, 1);
      x.drawImage(x.canvas, sx, sy, sw, sh, 0, 0, sw, sh);
      x.restore();
    };
    flip(su + d,         sv,     w, d, du + d,         dv);      // верх
    flip(su + d + w,     sv,     w, d, du + d + w,     dv);      // низ
    flip(su + d,         sv + d, w, h, du + d,         dv + d);  // перед
    flip(su + 2 * d + w, sv + d, w, h, du + 2 * d + w, dv + d);  // зад
    flip(su,             sv + d, d, h, du + d + w,     dv + d);  // правый бок -> левый
    flip(su + d + w,     sv + d, d, h, du,             dv + d);  // левый бок -> правый
  }

  // Приводим любой скин к формату 64x64 (у старых 64x32 левые руки/ноги берём зеркально)
  function toModern(img) {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(img, 0, 0);
    if (img.height < 64) {
      mirrorBox(x, 40, 16, 32, 48, 4, 12, 4); // левая рука
      mirrorBox(x, 0, 16, 16, 48, 4, 12, 4);  // левая нога
    }
    return c;
  }

  function load(src) {
    if (!cache.has(src)) {
      cache.set(src, new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ tex: toModern(img), slim: detectSlim(img) });
        img.onerror = () => reject(new Error('skin not found: ' + src));
        img.src = src;
      }));
    }
    return cache.get(src);
  }

  /* ---------- 3D-модель (по пояс) ---------- */
  // Грани куба: нормаль, углы (верх-лево, верх-право, низ-лево) и область в текстуре
  const FACES = [
    { n: [0, 0, 1],  tl: [-1, 1, 1],  tr: [1, 1, 1],   bl: [-1, -1, 1],  uv: (u, v, w, h, d) => [u + d,         v + d, w, h] }, // перед
    { n: [0, 0, -1], tl: [1, 1, -1],  tr: [-1, 1, -1], bl: [1, -1, -1],  uv: (u, v, w, h, d) => [u + 2 * d + w, v + d, w, h] }, // зад
    { n: [-1, 0, 0], tl: [-1, 1, -1], tr: [-1, 1, 1],  bl: [-1, -1, -1], uv: (u, v, w, h, d) => [u,             v + d, d, h] }, // правый бок
    { n: [1, 0, 0],  tl: [1, 1, 1],   tr: [1, 1, -1],  bl: [1, -1, 1],   uv: (u, v, w, h, d) => [u + d + w,     v + d, d, h] }, // левый бок
    { n: [0, 1, 0],  tl: [-1, 1, -1], tr: [1, 1, -1],  bl: [-1, 1, 1],   uv: (u, v, w, h, d) => [u + d,         v,     w, d] }, // верх
  ];

  // cx,cy,cz — центр; w,h,d — размер; u,v — начало в текстуре; grow — «раздутие» второго слоя;
  // head — часть головы; swing/px — поворот руки вокруг плеча (px — x плеча)
  const box = (cx, cy, cz, w, h, d, u, v, grow = 0, extra = {}) => ({ cx, cy, cz, w, h, d, u, v, grow, ...extra });

  const boxes = (slim) => {
    const aw = slim ? 3 : 4;
    const ax = 4 + aw / 2;
    const R = { swing: -ARM_SWING, px: -ax }, L = { swing: ARM_SWING, px: ax };
    return [
      box(0, 6, 0, 8, 12, 4, 16, 16),         box(0, 6, 0, 8, 12, 4, 16, 32, 0.25),         // тело + куртка
      box(-ax, 6, 0, aw, 12, 4, 40, 16, 0, R), box(-ax, 6, 0, aw, 12, 4, 40, 32, 0.25, R),   // правая рука + рукав
      box(ax, 6, 0, aw, 12, 4, 32, 48, 0, L),  box(ax, 6, 0, aw, 12, 4, 48, 48, 0.25, L),    // левая рука + рукав
      box(0, 16, 0, 8, 8, 8, 0, 0, 0, { head: true }), box(0, 16, 0, 8, 8, 8, 32, 0, 0.5, { head: true }), // голова + шапка/волосы
    ];
  };

  const cy_ = Math.cos(YAW), sy_ = Math.sin(YAW), cp = Math.cos(PITCH), sp = Math.sin(PITCH);
  const ct = Math.cos(HEAD_TURN), st = Math.sin(HEAD_TURN);
  const YC = 9.5;                       // высота, на которую смотрит камера
  const CAM = [0, YC, CAM_DIST];

  // точка (или вектор) модели -> координаты камеры: x вправо, y вверх, z к зрителю
  function view(p, b, vec = false) {
    let [x, y, z] = p;
    if (b.swing) {                                       // рука качнулась вокруг плеча
      const px = vec ? 0 : b.px, py = vec ? 0 : 12, c = Math.cos(b.swing), s = Math.sin(b.swing);
      const dx = x - px, dy = y - py;
      x = px + dx * c - dy * s; y = py + dx * s + dy * c;
    }
    if (b.head && HEAD_TURN) [x, z] = [x * ct + z * st, -x * st + z * ct];
    const x1 = x * cy_ + z * sy_, z1 = -x * sy_ + z * cy_;
    return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
  }

  // координаты камеры -> экран (x вправо, y вниз) с перспективой
  const proj = (v) => { const k = CAM_DIST / (CAM_DIST - v[2]); return [v[0] * k, -(YC + (v[1] - YC) * k)]; };

  // Размер холста и линия обрезки по поясу считаются один раз по «классической» модели
  const FIT = (() => {
    let minX = 1e9, maxX = -1e9, minY = 1e9;
    const bottoms = [];
    for (const b of boxes(false)) {
      const hw = b.w / 2 + b.grow, hh = b.h / 2 + b.grow, hd = b.d / 2 + b.grow;
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
        const q = proj(view([b.cx + sx * hw, b.cy + sy * hh, b.cz + sz * hd], b));
        minX = Math.min(minX, q[0]); maxX = Math.max(maxX, q[0]); minY = Math.min(minY, q[1]);
        if (!b.head && !b.grow && sy < 0) bottoms.push(q[1]);
      }
    }
    // обрезаем по пояс по середине между самой высокой и самой низкой точкой пояса
    const cut = (Math.min(...bottoms) + Math.max(...bottoms)) / 2;
    return { minX: minX - PAD, minY: minY - PAD, cut, w: Math.ceil((maxX - minX + 2 * PAD) * K), h: Math.ceil((cut - minY + PAD) * K) };
  })();

  // Копия текстуры, затемнённая под освещение грани
  function shaded(tex, b) {
    const key = Math.round(b * 100);
    tex._sh = tex._sh || new Map();
    if (!tex._sh.has(key)) {
      const c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      const x = c.getContext('2d');
      x.drawImage(tex, 0, 0);
      x.globalCompositeOperation = 'source-atop';
      x.fillStyle = `rgba(0,0,0,${(1 - b).toFixed(3)})`;
      x.fillRect(0, 0, 64, 64);
      tex._sh.set(key, c);
    }
    return tex._sh.get(key);
  }

  // свет спереди-справа-сверху: левые (в кадре) боковые грани получаются темнее
  const LIGHT = (() => { const l = [0.3, 0.6, 0.75], n = Math.hypot(...l); return l.map((v) => v / n); })();

  function draw3D(cv, tex, slim) {
    cv.width = FIT.w; cv.height = FIT.h;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, cv.width, cv.height); ctx.clip();

    const toCanvas = (q) => [(q[0] - FIT.minX) * K, (q[1] - FIT.minY) * K];
    const faces = [];

    for (const b of boxes(slim)) {
      const hw = b.w / 2 + b.grow, hh = b.h / 2 + b.grow, hd = b.d / 2 + b.grow;
      for (const f of FACES) {
        const n = view(f.n, b, true);
        const corner = (c) => view([b.cx + c[0] * hw, b.cy + c[1] * hh, b.cz + c[2] * hd], b);
        const TL = corner(f.tl), TR = corner(f.tr), BL = corner(f.bl);
        const mid = [0, 1, 2].map((i) => TL[i] + (TR[i] - TL[i]) / 2 + (BL[i] - TL[i]) / 2);
        const toCam = [CAM[0] - mid[0], CAM[1] - mid[1], CAM[2] - mid[2]];
        if (n[0] * toCam[0] + n[1] * toCam[1] + n[2] * toCam[2] <= 0.01) continue;   // грань смотрит от камеры
        faces.push({ b, f, TL, TR, BL, n, dist: Math.hypot(...toCam) - (b.grow ? 0.05 : 0) });
      }
    }
    faces.sort((a, b) => b.dist - a.dist);   // сначала дальние

    for (const { b, f, TL, TR, BL, n } of faces) {
      const dot = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];
      const img = shaded(tex, 0.5 + 0.5 * Math.max(0, Math.min(1, dot)));
      const [sx, sy, sw, sh] = f.uv(b.u, b.v, b.w, b.h, b.d);

      // точка на грани по параметрам u,v (0..1) -> холст (перспектива считается для каждой точки)
      const P = (u, v) => toCanvas(proj([0, 1, 2].map((i) => TL[i] + (TR[i] - TL[i]) * u + (BL[i] - TL[i]) * v)));

      for (let j = 0; j < sh; j += CELL) for (let i = 0; i < sw; i += CELL) {
        const cw = Math.min(CELL, sw - i), ch = Math.min(CELL, sh - j);
        const A = P(i / sw, j / sh), B = P((i + cw) / sw, j / sh), C = P(i / sw, (j + ch) / sh);
        let ux = B[0] - A[0], uy = B[1] - A[1], vx = C[0] - A[0], vy = C[1] - A[1];
        const su = 1 + BLEED / Math.max(Math.hypot(ux, uy), 1), sv = 1 + BLEED / Math.max(Math.hypot(vx, vy), 1);
        const mx = A[0] + ux / 2 + vx / 2, my = A[1] + uy / 2 + vy / 2;
        ux *= su; uy *= su; vx *= sv; vy *= sv;
        ctx.setTransform(ux / cw, uy / cw, vx / ch, vy / ch, mx - ux / 2 - vx / 2, my - uy / 2 - vy / 2);
        ctx.drawImage(img, sx + i, sy + j, cw, ch, 0, 0, cw, ch);
      }
    }
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // Плоская голова (для маленьких аватарок)
  function drawHead(cv, tex) {
    cv.width = 8; cv.height = 8;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 8, 8);
    ctx.drawImage(tex, 8, 8, 8, 8, 0, 0, 8, 8);
    ctx.drawImage(tex, 40, 8, 8, 8, 0, 0, 8, 8);
  }

  async function paint(cv) {
    const want = cv.dataset.skin || MC.DEFAULT_SKIN;
    let t = null;
    try { t = await load(want); }
    catch { try { t = await load(MC.DEFAULT_SKIN); } catch { /* нет даже Steve */ } }
    if (!t) return;
    if (cv.dataset.part === 'head') { drawHead(cv, t.tex); return; }
    const s = cv.dataset.slim;
    draw3D(cv, t.tex, s === '1' ? true : s === '0' ? false : t.slim);
  }

  // Найти все <canvas data-skin> внутри контейнера и нарисовать
  const hydrate = (root = document) => root.querySelectorAll('canvas[data-skin]').forEach(paint);

  load(MC.DEFAULT_SKIN).catch(() => {}); // заранее грузим Steve

  return { hydrate, load };
})();
