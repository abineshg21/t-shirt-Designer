// Built-in vector mockups (used until a T-shirt image is uploaded). Front/back for polo, round, vneck, hoodie.
const load = (src) => new Promise((res, rej) => { const i = new window.Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
const both = (s) => s + `<g transform="translate(640 0) scale(-1 1)">${s}</g>`;
const ln = (d, o = 0.25, w = 2, x = '') => `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${x}/>`;
const blur = (d, o, w, c = '#000') => `<path d="${d}" fill="none" stroke="${c}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round" filter="url(#b)"/>`;

function buildSvg(type, side, hex) {
  const front = side === 'front', hood = type === 'hoodie';
  const S = 'stroke="rgba(0,0,0,.42)" stroke-width="2" stroke-linejoin="round"';
  const fill = (d, extra = '') => `<path d="${d}" fill="${hex}" ${S} ${extra}/>`;
  const tone = (d, o, c = '#000') => `<path d="${d}" fill="${c}" fill-opacity="${o}"/>`;
  let body, sleeves = '', behind = '', over = '', clipExtra = '', folds = '';

  if (!hood) {
    const V = type === 'vneck' && front;
    const d = front ? (type === 'round' ? 174 : 138) : 98;
    const neck = V ? 'L320 165 L252 62' : `Q320 ${d} 252 62`;
    body = `M252 62 L172 88 L62 172 L96 238 L162 208 L166 640 L474 640 L478 208 L544 238 L578 172 L468 88 L388 62 ${neck}Z`;
    const seam = both(ln('M172 88 L162 208', 0.25, 2) + ln('M78 160 L112 226', 0.28, 1.6, 'stroke-dasharray="5 4"'));
    folds = both(blur('M176 215 Q238 265 208 345', 0.12, 16) + blur('M230 540 Q290 565 262 625', 0.1, 14)) + blur('M300 150 Q335 300 312 500', 0.1, 34, '#fff');
    const rib = V ? 'M252 62 L320 165 L388 62' : `M252 62 Q320 ${d} 388 62`;
    over += seam + ln('M170 622 L470 622', 0.22, 1.6, 'stroke-dasharray="6 4"');
    if (type === 'polo' && front) {
      const flap = 'M246 52 L318 72 L320 136 L266 112Z';
      over += tone(`M252 62 Q320 38 388 62 Q320 ${d} 252 62Z`, 0.5)
        + `<rect x="306" y="118" width="28" height="152" fill="${hex}" ${S}/>` + tone('M306 118 h28 v152 h-28Z', 0.06)
        + both(`<path d="${flap}" fill="${hex}" ${S}/>` + tone(flap, 0.12, '#fff'))
        + [150, 192, 234].map((y) => `<circle cx="320" cy="${y}" r="5" fill="#fff" fill-opacity=".85" stroke="rgba(0,0,0,.5)"/>`).join('');
    } else if (type === 'polo') {
      over += ln(rib, 0.22, 24) + ln(rib, 0.35, 1.5);
    } else {
      if (front) over += `<path d="M252 62 Q320 38 388 62 ${V ? 'L320 165' : `Q320 ${d} 252 62`}Z" fill="${hex}"/>` + tone(`M252 62 Q320 38 388 62 ${V ? 'L320 165' : `Q320 ${d} 252 62`}Z`, 0.4);
      over += ln(rib, 0.14, 15) + ln(rib, 0.3, 1.5);
    }
    if (type === 'polo') over += both(ln('M78 160 L112 226', 0.3, 12));
  } else {
    body = `M250 84 L192 104 L158 250 L158 640 L482 640 L482 250 L448 104 L390 84 Q320 ${front ? 150 : 100} 250 84Z`;
    const sl = 'M192 104 L116 152 L74 330 L50 560 L114 574 L140 420 L158 250Z';
    sleeves = both(fill(sl) + tone('M50 560 L114 574 L120 536 L54 522Z', 0.12) + ln('M54 522 L120 536', 0.3, 1.6) + ln('M158 250 L140 420 L114 574', 0.25, 2));
    clipExtra = sl + ' ' + sl.replace(/(\d+) (\d+)/g, (m, x, y) => `${640 - x} ${y}`);
    folds = both(blur('M120 200 Q100 330 88 470', 0.14, 18) + blur('M212 280 Q232 330 196 420', 0.08, 14)) + blur('M320 160 L320 470', 0.08, 26, '#fff');
    over += tone('M158 604 H482 V640 H158Z', 0.12) + ln('M158 604 H482', 0.3, 1.6);
    if (front) {
      behind = fill('M228 112 C180 -14 460 -14 412 112Z') + '<ellipse cx="320" cy="92" rx="64" ry="46" fill="#000" fill-opacity=".5"/>';
      over += ln('M250 84 Q320 150 390 84', 0.15, 16) + ln('M250 84 Q320 150 390 84', 0.3, 1.5) + ln('M258 96 C260 40 380 40 382 96', 0.3, 3)
        + ln('M320 152 L320 470', 0.12, 2)
        + '<path d="M300 132 L296 252 M340 132 L344 252" stroke="#f1f1f1" stroke-width="5" stroke-linecap="round"/>'
        + '<path d="M296 252 v14 M344 252 v14" stroke="#777" stroke-width="5" stroke-linecap="round"/>'
        + tone('M204 470 L436 470 L468 590 L172 590Z', 0.07) + ln('M204 470 L436 470 L468 590 L172 590Z', 0.3, 2)
        + both(ln('M204 470 L180 548', 0.28, 2));
    } else {
      over += fill('M232 104 C176 -40 464 -40 408 104 Q320 134 232 104Z') + tone('M232 104 C176 -40 464 -40 408 104 Q320 134 232 104Z', 0.08, '#fff') + ln('M320 -2 L320 118', 0.25, 2);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="2160" viewBox="0 0 640 720">
<defs>
<filter id="b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
<linearGradient id="sh" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".24"/><stop offset=".22" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".1"/><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient>
<linearGradient id="sv" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
<clipPath id="c"><path d="${body}"/><path d="${clipExtra || 'M0 0'}"/></clipPath>
</defs>
<ellipse cx="320" cy="652" rx="175" ry="10" fill="#000" fill-opacity=".14" filter="url(#b)"/>
${behind}${fill(body)}${sleeves}
<g clip-path="url(#c)"><rect width="640" height="720" fill="url(#sh)"/><rect width="640" height="720" fill="url(#sv)"/>${folds}</g>
${over}</svg>`;
}

// Default T-shirt for each type/side: a real photo from /public/mockups/{type}-{side}.png if it exists
// (round-front.png and round-back.png are included), otherwise the generated vector mockup.
export async function loadDefault(type, side, hex) {
  try { return { src: await load(`${import.meta.env.BASE_URL}mockups/${type}-${side}.png`), photo: true }; }
  catch { return { src: await load('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(buildSvg(type, side, hex))), photo: false }; }
}
export const readImageFile = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => load(r.result).then(res, rej);
  r.onerror = rej; r.readAsDataURL(file);
});

const K = 3, CW = 640 * K, CH = 720 * K; // shirt images are rendered 3x the stage size for sharp exports
const mk = (w = CW, h = CH) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

/**
 * Turns a T-shirt image into:
 *  img  - the shirt cut-out, fitted into the 640x720 stage
 *  mask - the shirt silhouette (used to clip the design to the shirt)
 *  bbox - the entire-shirt print area in stage px (sleeves included)
 * Three kinds of PNG/JPG/WEBP are recognised automatically:
 *  cutout - transparent background, opaque shirt
 *  shade  - opaque (white) background with a semi-transparent black shading shirt (common mockup format)
 *  photo  - JPG/WEBP or opaque PNG on a plain background (removed by flood fill, see tol)
 */
export function prepareShirt(src, { tol = 28, tint = null, color = '#f4f4f2', shading = true } = {}) {
  const sw = src.naturalWidth || src.width, sh = src.naturalHeight || src.height;
  const P = 128, pc = mk(P, P).getContext('2d', { willReadFrequently: true });
  pc.drawImage(src, 0, 0, P, P);
  const pd = pc.getImageData(0, 0, P, P).data;
  const px = (x, y) => { const i = (y * P + x) * 4; return [pd[i], pd[i + 1], pd[i + 2], pd[i + 3]]; };
  const corners = [px(0, 0), px(P - 1, 0), px(0, P - 1), px(P - 1, P - 1)];
  let low = 0; for (let i = 3; i < pd.length; i += 4) if (pd[i] < 230) low++;
  const mode = corners.every((c) => c[3] < 128) ? 'cutout' : low / (P * P) > 0.08 ? 'shade' : 'photo';
  const bg = [0, 1, 2].map((k) => corners.reduce((s, c) => s + c[k], 0) / 4);

  const base = mk(), ctx = base.getContext('2d', { willReadFrequently: true });
  const s = Math.min(CW / sw, CH / sh), w = sw * s, h = sh * s, l = (CW - w) / 2, t = (CH - h) / 2;
  ctx.drawImage(src, l, t, w, h);
  const { data } = ctx.getImageData(0, 0, CW, CH);
  const N = CW * CH, isBg = new Uint8Array(N);

  if (mode === 'cutout') {
    for (let i = 0; i < N; i++) isBg[i] = data[i * 4 + 3] < 128 ? 1 : 0;
  } else { // opaque background: flood-fill inwards from the border
    const outside = (i) => { const x = i % CW, y = (i / CW) | 0; return x < l + 2 || x >= l + w - 2 || y < t + 2 || y >= t + h - 2; }; // 2px inset: edge pixels are only partly covered
    const match = mode === 'shade'
      ? (i) => outside(i) || data[i * 4 + 3] >= 230
      : (i) => { const p = i * 4; return outside(i) || data[p + 3] < 128 || (Math.abs(data[p] - bg[0]) <= tol && Math.abs(data[p + 1] - bg[1]) <= tol && Math.abs(data[p + 2] - bg[2]) <= tol); };
    const stack = new Int32Array(N); let sp = 0;
    const push = (i) => { if (!isBg[i] && match(i)) { isBg[i] = 1; stack[sp++] = i; } };
    for (let x = 0; x < CW; x++) { push(x); push((CH - 1) * CW + x); }
    for (let y = 0; y < CH; y++) { push(y * CW); push(y * CW + CW - 1); }
    while (sp) {
      const i = stack[--sp], x = i % CW;
      if (x > 0) push(i - 1); if (x < CW - 1) push(i + 1); if (i >= CW) push(i - CW); if (i < N - CW) push(i + CW);
    }
  }

  const raw = mk(), rctx = raw.getContext('2d'), md = rctx.createImageData(CW, CH);
  let x0 = CW, y0 = CH, x1 = -1, y1 = -1, cnt = 0, sum = 0;
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
    const i = y * CW + x;
    if (!isBg[i]) { md.data[i * 4 + 3] = 255; cnt++; sum += data[i * 4 + 3]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  rctx.putImageData(md, 0, 0);
  const mask = mk(), mctx = mask.getContext('2d');
  if ('filter' in mctx) mctx.filter = 'blur(1.5px)'; // soften the edge
  mctx.drawImage(raw, 0, 0);

  if (mode === 'shade') {
    // The alpha channel IS the shading (fabric folds). Rebuild the shirt as a flat, clean colour fill,
    // with the fold shading blended in very lightly (or not at all) so the shirt does not look grey/faded.
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = color; ctx.fillRect(0, 0, CW, CH);
    ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    if (shading) {
      // Soft, low-contrast fold shading, built from the SOURCE alpha (the real fold data), not the flat silhouette.
      const origA = mk(), oac = origA.getContext('2d'), oad = oac.createImageData(CW, CH);
      for (let i = 0; i < N; i++) if (!isBg[i]) oad.data[i * 4 + 3] = data[i * 4 + 3];
      oac.putImageData(oad, 0, 0);
      const soft = mk(), sfc = soft.getContext('2d'); sfc.filter = 'blur(3px)'; sfc.drawImage(origA, 0, 0);
      sfc.globalCompositeOperation = 'destination-in'; sfc.filter = 'none'; sfc.drawImage(mask, 0, 0);
      const mean = cnt ? sum / cnt / 255 : 0, sd0 = sfc.getImageData(0, 0, CW, CH);
      const shade = mk(), sc = shade.getContext('2d'), sd = sc.createImageData(CW, CH);
      for (let i = 0; i < N; i++) {
        if (isBg[i]) continue;
        const d = sd0.data[i * 4 + 3] / 255 - mean, p = i * 4;
        if (d >= 0) sd.data[p + 3] = Math.min(140, d * 255 * 0.7);
        else { sd.data[p] = sd.data[p + 1] = sd.data[p + 2] = 255; sd.data[p + 3] = Math.min(90, -d * 255 * 0.55); }
      }
      sc.putImageData(sd, 0, 0);
      ctx.drawImage(shade, 0, 0);
    }
  } else if (tint) { // multiply-tint, keep only the shirt
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = tint; ctx.fillRect(0, 0, CW, CH);
    ctx.globalCompositeOperation = 'destination-in';
    if (mode === 'cutout') ctx.drawImage(src, l, t, w, h); else ctx.drawImage(mask, 0, 0);
  } else if (mode === 'photo') { ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(mask, 0, 0); }
  ctx.globalCompositeOperation = 'source-over';

  const bbox = x1 < 0 ? { x: 0, y: 0, w: 640, h: 720 } : { x: x0 / K, y: y0 / K, w: (x1 - x0 + 1) / K, h: (y1 - y0 + 1) / K };
  // Print area = the shirt itself. `outline` draws its edge, `inside(x,y)` tells whether a stage point is on the shirt.
  const er = mk(), ec = er.getContext('2d'); ec.drawImage(raw, 0, 0); ec.globalCompositeOperation = 'destination-in';
  for (const [dx, dy] of [[-6, 0], [6, 0], [0, -6], [0, 6], [-5, -5], [5, -5], [-5, 5], [5, 5]]) ec.drawImage(raw, dx, dy);
  const outline = mk(), oc = outline.getContext('2d');
  oc.fillStyle = '#ff5a1f'; oc.fillRect(0, 0, CW, CH);
  oc.globalCompositeOperation = 'destination-in'; oc.drawImage(raw, 0, 0);
  oc.globalCompositeOperation = 'destination-out'; oc.drawImage(er, 0, 0);
  const hit = new Uint8Array(640 * 720);
  for (let y = 0; y < 720; y++) for (let x = 0; x < 640; x++) hit[y * 640 + x] = isBg[(y * K + 1) * CW + x * K + 1] ? 0 : 1;
  const inside = (x, y) => { x = Math.round(x); y = Math.round(y); return x >= 0 && y >= 0 && x < 640 && y < 720 && hit[y * 640 + x] === 1; };
  return { img: base, mask, outline, inside, bbox, mode, hasBg: mode === 'photo' };
}
export { buildSvg };

// Nearest point on the shirt: if (x,y) is off the shirt, slide it back towards the middle of the shirt
export const nearestInside = (sh, x, y) => {
  if (!sh || sh.inside(x, y)) return { x, y };
  let a = { x: sh.bbox.x + sh.bbox.w / 2, y: sh.bbox.y + sh.bbox.h * 0.45 }, b = { x, y };
  for (let i = 0; i < 14; i++) { const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; if (sh.inside(m.x, m.y)) a = m; else b = m; }
  return a;
};
