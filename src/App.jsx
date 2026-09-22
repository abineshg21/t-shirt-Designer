import { useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import Canvas, { measure } from './Canvas';
import ClipartPanel from './ClipartPanel';
import { loadSvgImage } from './clipart';
import { removeBackground } from './imageTools';
import { loadDefault, readImageFile, prepareShirt, nearestInside } from './mockups';
import { W, H, TYPES, COLORS, FONTS, presets, printSpec, surcharge } from './products';
import { FaInstagram, FaFacebook } from "react-icons/fa";

const uid = () => 'e' + Math.random().toString(36).slice(2, 9);
const isDark = (h) => 0.299 * parseInt(h.slice(1, 3), 16) + 0.587 * parseInt(h.slice(3, 5), 16) + 0.114 * parseInt(h.slice(5, 7), 16) < 128;
const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const save = (href, name) => { const a = document.createElement('a'); a.href = href; a.download = name; a.click(); };
const FULL = { x: 0, y: 0, w: W, h: H };
const GRADIENTS = [['Sunset', '#ff512f', '#f09819'], ['Ocean', '#00c6ff', '#0072ff'], ['Neon', '#f953c6', '#b91d73'],
  ['Gold', '#f7971e', '#ffd200'], ['Mint', '#11998e', '#38ef7d'], ['Fire', '#f12711', '#f5af19']];

export default function App() {
  const [type, setType] = useState('round');
  const [side, setSide] = useState('front');
  const [els, setEls] = useState({ front: [], back: [] });
  const [selectedId, setSelectedId] = useState(null);
  const [size, setSize] = useState('M');
  const [color, setColor] = useState(COLORS[0]);
  const [custom, setCustom] = useState({ front: null, back: null }); // uploaded T-shirt images
  const [tol, setTol] = useState(28);
  const [recolor, setRecolor] = useState(false);
  const [shading, setShading] = useState(true); // fabric fold shading on the shirt image (some clients want it off / flat)
  const [dpi, setDpi] = useState(300);
  const [shirts, setShirts] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0);
  const stageRef = useRef(), shirtRef = useRef(), guideRef = useRef(), trRef = useRef();

  const T = TYPES[type], S = T.sizes[size];
  const shirt = shirts[side], bb = shirt?.bbox || FULL;
  const spec = printSpec(bb, S.length, dpi), ppc = spec.ppc, cx = bb.x + bb.w / 2;
  const list = els[side], sel = list.find((e) => e.id === selectedId), dim = sel ? measure(sel) : null;
  const place = (x, y) => nearestInside(shirt, x, y);           // keeps a point on the T-shirt
  const pos = (fx, fy) => place(cx + fx * bb.w, bb.y + fy * bb.h);

  useEffect(() => {
    let dead = false; setLoading(true);
    const t = setTimeout(async () => {
      const out = {};
      for (const s of ['front', 'back']) {
        const c = custom[s], d = c ? null : await loadDefault(type, s, color.hex);
        out[s] = prepareShirt(c ? c.img : d.src, { tol, color: color.hex, shading, tint: (c ? recolor : d.photo) ? color.hex : null });
      }
      if (!dead) { setShirts(out); setLoading(false); }
    }, 150);
    return () => { dead = true; clearTimeout(t); };
  }, [type, color.hex, custom, tol, recolor, shading]);

  const update = (id, patch) => setEls((p) => ({ ...p, [side]: p[side].map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  const onChange = (id, patch) => update(id, 'x' in patch ? { ...patch, ...place(patch.x, patch.y) } : patch);
  const add = (el) => { setEls((p) => ({ ...p, [side]: [...p[side], el] })); setSelectedId(el.id); };
  const remove = () => { setEls((p) => ({ ...p, [side]: p[side].filter((e) => e.id !== selectedId) })); setSelectedId(null); };
  const switchSide = (s) => { setSide(s); setSelectedId(null); };
  const loadFont = (e) => document.fonts.load(`${e.fontStyle} 20px "${e.fontFamily}"`).then(() => setTick((t) => t + 1)).catch(() => {});

  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (selectedId && (e.key === 'Delete' || e.key === 'Backspace')) remove();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, side]);

  // Optional "make background transparent" for uploaded artwork (debounced, keeps the original)
  useEffect(() => {
    if (!sel || sel.kind !== 'upload') return;
    const key = `${sel.transparent}|${sel.bgTol}|${sel.everywhere}`;
    if (sel.appliedKey === key) return;
    const id = sel.id, t = setTimeout(() => update(id, { img: sel.transparent ? removeBackground(sel.orig, sel.bgTol, sel.everywhere) : sel.orig, appliedKey: key }), 200);
    return () => clearTimeout(t);
  }, [sel?.id, sel?.transparent, sel?.bgTol, sel?.everywhere]);

  const onShirtFile = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { const img = await readImageFile(f); setCustom((c) => ({ ...c, [side]: { img, name: f.name } })); setSelectedId(null); }
    catch { alert('That file could not be read. Use a PNG, JPG or WEBP image.'); }
    e.target.value = '';
  };
  const onArt = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const img = new window.Image();
      img.onload = () => add({ id: uid(), type: 'image', kind: 'upload', img, orig: img, w: img.width, h: img.height, transparent: false, bgTol: 30, everywhere: false,
        appliedKey: 'false|30|false', ...pos(0, 0.32), rotation: 0, scale: (0.4 * bb.w) / img.width });
      img.src = r.result;
    };
    r.readAsDataURL(f); e.target.value = '';
  };
  const addClipart = async (item, col) => {
    const { img, w, h } = await loadSvgImage(item.svg(col));
    add({ id: uid(), type: 'image', kind: 'clipart', img, w, h, item, color: col, ...pos(0, 0.32), rotation: 0, scale: (0.3 * bb.w) / w });
  };
  const recolorClipart = async (col) => {
    update(sel.id, { color: col });
    try { const { img } = await loadSvgImage(sel.item.svg(col)); update(sel.id, { img }); } catch { /* keep old image */ }
  };
  const addText = () => {
    const el = { id: uid(), type: 'text', text: 'Your text', fontFamily: 'Roboto', fontSize: 40, fontStyle: 'bold', deco: '',
      fillMode: 'solid', fill: isDark(color.hex) ? '#ffffff' : '#111111', g1: '#ff512f', g2: '#f09819', gAngle: 0, ...pos(0, 0.32), rotation: 0, scale: 1 };
    add(el); loadFont(el);
  };
  const patchText = (patch) => { update(sel.id, patch); loadFont({ ...sel, ...patch }); };
  const toggleStyle = (k) => {
    const b = sel.fontStyle.includes('bold') !== (k === 'bold'), i = sel.fontStyle.includes('italic') !== (k === 'italic');
    patchText({ fontStyle: [i && 'italic', b && 'bold'].filter(Boolean).join(' ') || 'normal' });
  };
  const cover = () => update(sel.id, { rotation: 0, scale: Math.max(bb.w / dim.w, bb.h / dim.h), ...pos(0, 0.5) });
  const fitWidth = () => update(sel.id, { rotation: 0, scale: bb.w / dim.w, ...pos(0, 0.5) });

  const xcm = sel ? (sel.x - cx) / ppc : 0, ycm = sel ? (sel.y - bb.y) / ppc : 0;
  const wcm = sel ? (dim.w * sel.scale) / ppc : 0, hcm = sel ? (dim.h * sel.scale) / ppc : 0;
  const halfW = Math.ceil(bb.w / 2 / ppc), totH = Math.ceil(bb.h / ppc);

  const capture = (kind, s = side) => {
    const st = stageRef.current, tr = trRef.current, gl = guideRef.current, sl = shirtRef.current;
    const b = shirts[s].bbox, sp = printSpec(b, S.length, dpi);
    tr.hide(); gl.hide(); if (kind === 'print') sl.hide();
    const url = kind === 'print'
      ? st.toDataURL({ x: b.x, y: b.y, width: b.w, height: b.h, pixelRatio: sp.ratio, mimeType: 'image/png' })
      : st.toDataURL({ pixelRatio: 3, mimeType: 'image/png' });
    tr.show(); gl.show(); sl.show(); st.batchDraw();
    return url;
  };
  const base = `${type}-${size}`;
  const downloadOne = (kind) => {
    if (loading || !shirt) return;
    save(capture(kind), kind === 'print' ? `${base}-${side}-print-full-shirt-${spec.dpi}dpi.png` : `${base}-${side}-preview.png`);
  };
  const downloadAll = async () => {
    const sides = ['front', 'back'].filter((s) => els[s].length);
    if (!sides.length) return alert('Add a design to at least one side first.');
    setBusy(true);
    const orig = side, zip = new JSZip();
    for (const s of sides) {
      setSide(s); setSelectedId(null); await frames();
      zip.file(`${base}-${s}-print-full-shirt.png`, capture('print', s).split(',')[1], { base64: true });
      zip.file(`${base}-${s}-preview.png`, capture('preview', s).split(',')[1], { base64: true });
    }
    zip.file('order-details.txt', [`Product: ${T.product}`, `Fabric: ${T.fabric}`, `Fit: ${T.fit}`, `Size: ${size} (chest ${S.chest} cm, length ${S.length} cm)`,
      `Color: ${color.name}`, `Price: Rs ${T.price + surcharge(size)}`, `Print area: inside the T-shirt, ${spec.cmW.toFixed(0)} x ${spec.cmH.toFixed(0)} cm (about ${spec.dpi} DPI)`,
      ...sides.map((s) => `${s}: ${els[s].length} design element(s)`)].join('\n'));
    setSide(orig);
    save(URL.createObjectURL(await zip.generateAsync({ type: 'blob' })), `${base}-design-files.zip`);
    setBusy(false);
  };

  return (
    <div className="app">
      <header>
        <h1>T-Shirt Design</h1>
        <div className="seg">
          {['front', 'back'].map((s) => <button key={s} className={side === s ? 'on' : ''} onClick={() => switchSide(s)}>{s === 'front' ? 'Front' : 'Back'}</button>)}
        </div>
        <button disabled={loading} onClick={() => downloadOne('preview')}>T-shirt preview PNG</button>
        <button disabled onClick={() => downloadOne('print')}>Printable PNG</button> 
        <button className="primary" disabled onClick={downloadAll}>{busy ? 'Preparing…' : 'Download front + back ZIP'}</button>
     {/* disabled={busy || loading} */}
      </header>

      <main>
        <aside>
          {/* <section>
            <h3>T-shirt image ({side})</h3>
            <label className="file">Upload T-shirt image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={onShirtFile} /></label>
            <p className="hint">PNG, JPG or WEBP. Designs stay inside the shirt.</p>
            {custom[side] && (
              <>
                <p className="hint"><b>{custom[side].name}</b></p>
                {shirt?.hasBg && <label>Background removal <span>{tol}</span><input type="range" min="5" max="90" value={tol} onChange={(e) => setTol(+e.target.value)} /></label>}
                {shirt?.mode === 'shade'
                  ? (
                    <>
                      <p className="hint">Shading-overlay PNG detected. The colour buttons recolor this shirt.</p>
                      <label className="chk"><input type="checkbox" checked={shading} onChange={(e) => setShading(e.target.checked)} /> Show fabric fold shading (off = flat, clean colour)</label>
                    </>
                  )
                  : <label className="chk"><input type="checkbox" checked={recolor} onChange={(e) => setRecolor(e.target.checked)} /> Recolor photo with the colour buttons</label>}
                <button onClick={() => setCustom((c) => ({ ...c, [side]: null }))}>Use default shirt</button>
              </>
            )}
          </section> */}

          <section>
            <h3>Artwork on {side}</h3>
            <label className="file">Upload image<input type="file" accept="image/*" onChange={onArt} /></label>
            <button onClick={addText}>Add text</button>
          </section>

          <ClipartPanel onPick={addClipart} />

          {sel?.type === 'text' && (
            <section>
              <h3>Text</h3>
              <textarea rows={2} value={sel.text} onChange={(e) => update(sel.id, { text: e.target.value })} />
              <label>Font
                <select value={sel.fontFamily} onChange={(e) => patchText({ fontFamily: e.target.value })}>
                  {FONTS.map((f) => <option key={f} style={{ fontFamily: f }}>{f}</option>)}
                </select>
              </label>
              <div className="row">
                <button className={sel.fontStyle.includes('bold') ? 'on' : ''} onClick={() => toggleStyle('bold')}><b>B</b></button>
                <button className={sel.fontStyle.includes('italic') ? 'on' : ''} onClick={() => toggleStyle('italic')}><i>I</i></button>
                <button className={sel.deco ? 'on' : ''} onClick={() => update(sel.id, { deco: sel.deco ? '' : 'underline' })}><u>U</u></button>
              </div>
              <label>Font size <span>{sel.fontSize}</span>
                <input type="range" min="12" max="200" value={sel.fontSize} onChange={(e) => patchText({ fontSize: +e.target.value })} />
              </label>
              <div className="seg">
                <button className={sel.fillMode === 'solid' ? 'on' : ''} onClick={() => update(sel.id, { fillMode: 'solid' })}>Solid color</button>
                <button className={sel.fillMode === 'gradient' ? 'on' : ''} onClick={() => update(sel.id, { fillMode: 'gradient' })}>Gradient</button>
              </div>
              {sel.fillMode === 'solid'
                ? <div className="row"><input type="color" value={sel.fill} onChange={(e) => update(sel.id, { fill: e.target.value })} title="Text color" /></div>
                : (
                  <>
                    <div className="row">
                      <input type="color" value={sel.g1} onChange={(e) => update(sel.id, { g1: e.target.value })} title="Start color" />
                      <input type="color" value={sel.g2} onChange={(e) => update(sel.id, { g2: e.target.value })} title="End color" />
                      <span className="grad-preview" style={{ background: `linear-gradient(${sel.gAngle + 90}deg, ${sel.g1}, ${sel.g2})` }} />
                    </div>
                    <label>Gradient angle <span>{sel.gAngle}°</span>
                      <input type="range" min="0" max="360" value={sel.gAngle} onChange={(e) => update(sel.id, { gAngle: +e.target.value })} />
                    </label>
                    <div className="row">{GRADIENTS.map(([n, a, b]) => (
                      <button key={n} className="grad" title={n} style={{ background: `linear-gradient(90deg, ${a}, ${b})` }} onClick={() => update(sel.id, { g1: a, g2: b })} />
                    ))}</div>
                  </>
                )}
            </section>
          )}

          {sel?.kind === 'upload' && (
            <section>
              <h3>Image background</h3>
              <button className={sel.transparent ? 'on' : ''} onClick={() => update(sel.id, { transparent: !sel.transparent })}>
                {sel.transparent ? 'Background is transparent (click to restore)' : 'Make background transparent'}
              </button>
              {sel.transparent && (
                <>
                  <label>Sensitivity <span>{sel.bgTol}</span><input type="range" min="5" max="90" value={sel.bgTol} onChange={(e) => update(sel.id, { bgTol: +e.target.value })} /></label>
                  <label className="chk"><input type="checkbox" checked={sel.everywhere} onChange={(e) => update(sel.id, { everywhere: e.target.checked })} /> Remove this color everywhere (inside letters too)</label>
                </>
              )}
            </section>
          )}
          {sel?.kind === 'clipart' && sel.item.recolor && (
            <section>
              <h3>Clipart color</h3>
              <div className="row"><input type="color" value={sel.color} onChange={(e) => recolorClipart(e.target.value)} /></div>
            </section>
          )}

          {sel && (
            <section>
              <h3>Size and rotation</h3>
              <label>Width <span>{wcm.toFixed(1)} cm</span>
                <input type="range" min="2" max={halfW * 2 + 20} step="0.5" value={Math.min(halfW * 2 + 20, Math.max(2, wcm))} onChange={(e) => update(sel.id, { scale: (+e.target.value * ppc) / dim.w })} />
              </label>
              <label>Rotation <span>{Math.round(sel.rotation)}°</span>
                <input type="range" min="-180" max="180" value={Math.round((((sel.rotation + 180) % 360) + 360) % 360 - 180)} onChange={(e) => update(sel.id, { rotation: +e.target.value })} />
              </label>
              <div className="chips"><button onClick={cover}>Cover entire shirt</button><button onClick={fitWidth}>Fit shirt width</button></div>
              <button className="danger" onClick={remove}>Delete</button>
            </section>
          )}
          {!sel && <p className="hint">Upload artwork, add text or pick clipart, then drag it on the shirt. Corner handles resize; the round handle rotates.</p>}
        </aside>

        <div className="center">
          {/* <div className="seg types">
            {Object.entries(TYPES).map(([k, t]) => <button key={k} className={type === k ? 'on' : ''} onClick={() => { setType(k); setSelectedId(null); }}>{t.label}</button>)}
          </div> */}
          <div className="stage">
            <Canvas {...{ elements: list, selectedId, shirt, bb, ppc, stageRef, shirtRef, guideRef, trRef }} onSelect={setSelectedId} onChange={onChange} />
            {loading && <div className="loading">Preparing T-shirt…</div>}
          </div>
        </div>

        <aside>
          <section>
            <h3>Product</h3>
            <div className="row">{Object.keys(T.sizes).map((k) => <button key={k} className={size === k ? 'on' : ''} onClick={() => setSize(k)}>{k}</button>)}</div>
            <div className="row">{COLORS.map((c) => <button key={c.name} className={'sw' + (color.name === c.name ? ' on' : '')} style={{ background: c.hex }} title={c.name} onClick={() => setColor(c)} />)}</div>
            <dl>
              <dt>Type</dt><dd>{T.label}</dd>
              <dt>Product</dt><dd>{T.product}</dd>
              {/* <dt>Fabric</dt><dd>{T.fabric}</dd>
              <dt>Fit</dt><dd>{T.fit}</dd>
              <dt>Size</dt><dd>{size}</dd> */}
              {/* <dt>Chest width</dt><dd>{S.chest} cm</dd>
              <dt>Length</dt><dd>{S.length} cm</dd>
              <dt>Color</dt><dd>{color.name}</dd>
              <dt>Print area</dt><dd>Inside the T-shirt</dd>
              <dt>Price</dt><dd>₹{T.price + surcharge(size)}</dd> */}
            </dl>
          </section>

          <section>
            <h3>Position on shirt</h3>
            {sel ? (
              <>
                <label>From center <span>{Math.abs(xcm).toFixed(1)} cm {xcm > 0.05 ? 'right' : xcm < -0.05 ? 'left' : ''}</span>
                  <input type="range" min={-halfW} max={halfW} step="0.5" value={Math.max(-halfW, Math.min(halfW, xcm))} onChange={(e) => update(sel.id, place(cx + +e.target.value * ppc, sel.y))} />
                </label>
                <label>From top of shirt <span>{ycm.toFixed(1)} cm</span>
                  <input type="range" min="0" max={totH} step="0.5" value={Math.max(0, Math.min(totH, ycm))} onChange={(e) => update(sel.id, place(sel.x, bb.y + +e.target.value * ppc))} />
                </label>
                <div className="chips">{presets(type, side).map(([n, fx, fy]) => <button key={n} onClick={() => update(sel.id, pos(fx, fy))}>{n}</button>)}</div>
                <p className="hint">Design is {wcm.toFixed(1)} × {hcm.toFixed(1)} cm. Anything past the shirt edge is trimmed.</p>
              </>
            ) : <p className="hint">Select a design to see its position.</p>}
          </section>

          <section>
            <h3>Print file</h3>
            <label>Print quality
              <select value={dpi} onChange={(e) => setDpi(+e.target.value)}>{[150, 200, 300].map((d) => <option key={d} value={d}>{d} DPI</option>)}</select>
            </label>
            <p className="hint"><b>Printable PNG:</b> the T-shirt area only, {spec.cmW.toFixed(0)} × {spec.cmH.toFixed(0)} cm, {spec.pxW} × {spec.pxH} px (about {spec.dpi} DPI), transparent outside the shirt.</p>
            <p className="hint"><b>T-shirt preview PNG:</b> design on the shirt, 1920 × 2160 px.</p>
            <p className="hint"><b>ZIP:</b> both files for front and back, plus order details.</p>
          </section>
        </aside>
        
      </main>
      <footer className="footer">
      <p>© 2026 RAMSAI VASTHIRALAYAM. All Rights Reserved.</p>

      <div className="social-links">
        <a
          href="https://www.instagram.com/ramsai_vashthiralayam/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>
{/* 
        <a
          href="https://www.facebook.com/your_facebook_page"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <FaFacebook />
        </a> */}
      </div>
    </footer>
    </div>
  );
}
