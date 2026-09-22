import { useState } from 'react';
import { PROVIDERS } from './clipart';

export default function ClipartPanel({ onPick }) {
  const [prov, setProv] = useState('iconify');
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [color, setColor] = useState('#111111');

  const search = async (e) => {
    e.preventDefault(); if (!q.trim()) return;
    setStatus('Searching…');
    try { const r = await PROVIDERS[prov].search(q.trim()); setItems(r); setStatus(r.length ? '' : 'No results. Try another word.'); }
    catch (err) { setItems([]); setStatus(`Could not reach ${PROVIDERS[prov].label} (${err.message}). Check your connection or try another source.`); }
  };
  const pick = async (it) => {
    setStatus('Adding…');
    try { await onPick(it, color); setStatus(''); }
    catch (err) { setStatus(`Could not add this image (${err.message}). Try another one.`); }
  };

  return (
    <section>
      <h3>Clipart and SVG</h3>
      <select value={prov} onChange={(e) => { setProv(e.target.value); setItems([]); setStatus(''); }}>
        {Object.entries(PROVIDERS).map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
      </select>
      <form className="row" onSubmit={search}>
        <input className="grow" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search e.g. heart, skull, cat" />
        <button type="submit">Search</button>
      </form>
      {PROVIDERS[prov].recolor && <label className="chk"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} /> Icon colour</label>}
      {status && <p className="hint">{status}</p>}
      <div className="clip-grid">
        {items.map((it) => <button key={it.id} title={it.title} onClick={() => pick(it)}><img src={it.thumb} alt={it.title} loading="lazy" /></button>)}
      </div>
      <p className="hint">Check each image's licence before printing it for sale.</p>
    </section>
  );
}
