// Clipart / open-SVG sources. All are free, keyless, browser-callable (CORS) APIs.
//  Iconify     https://api.iconify.design      open-source icon sets (SVG, recolorable)
//  Openclipart https://openclipart.org         public-domain clipart
//  Wikimedia   https://commons.wikimedia.org   SVG drawings from Wikimedia Commons
const enc = encodeURIComponent;
const getJson = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };

export const PROVIDERS = {
  iconify: {
    label: 'Open SVG icons (Iconify)', recolor: true,
    async search(q) {
      const d = await getJson(`https://api.iconify.design/search?query=${enc(q)}&limit=48`);
      return (d.icons || []).map((id) => {
        const [p, n] = id.split(':');
        return { id, title: id, recolor: true, thumb: `https://api.iconify.design/${p}/${n}.svg?height=64`,
          svg: (color) => `https://api.iconify.design/${p}/${n}.svg?height=512${color ? '&color=' + enc(color) : ''}` };
      });
    },
  },
  // openclipart: {
  //   label: 'Openclipart (public domain)',
  //   async search(q) {
  //     const d = await getJson(`https://openclipart.org/api/v2@beta/search/?q=${enc(q)}&per_page=2500`);
  //     return (d.payload || []).map((it) => ({ id: String(it.id || it.title), title: it.title, thumb: it.svg?.png_thumb || it.svg?.url, svg: () => it.svg?.url })).filter((x) => x.svg());
  //   },
  // },
  // wikimedia: {
  //   label: 'Wikimedia Commons (SVG)',
  //   async search(q) {
  //     const d = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${enc(q + ' filetype:drawing')}&gsrnamespace=6&gsrlimit=36&prop=imageinfo&iiprop=url&iiurlwidth=128&format=json&origin=*`);
  //     return Object.values(d.query?.pages || {}).map((p) => {
  //       const i = p.imageinfo?.[0];
  //       return i && /\.svg$/i.test(i.url) ? { id: String(p.pageid), title: p.title.replace(/^File:/, ''), thumb: i.thumburl || i.url, svg: () => i.url } : null;
  //     }).filter(Boolean);
  //   },
  // },
};

// Fetch an SVG and turn it into an image Konva can draw (fetched, so the canvas stays exportable)
export async function loadSvgImage(url) {
  const res = await fetch(url); if (!res.ok) throw new Error('HTTP ' + res.status);
  const svg = new DOMParser().parseFromString(await res.text(), 'image/svg+xml').documentElement;
  if (svg.nodeName.toLowerCase() !== 'svg') throw new Error('not an SVG');
  svg.querySelectorAll('script,foreignObject').forEach((n) => n.remove());
  let vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  if (vb.length !== 4 || vb.some(isNaN)) { vb = [0, 0, parseFloat(svg.getAttribute('width')) || 512, parseFloat(svg.getAttribute('height')) || 512]; svg.setAttribute('viewBox', vb.join(' ')); }
  const w = 1024, h = Math.round((w * vb[3]) / vb[2]);
  svg.setAttribute('width', w); svg.setAttribute('height', h);
  const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
  const img = await new Promise((ok, no) => { const i = new window.Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('could not draw this SVG')); i.src = URL.createObjectURL(blob); });
  return { img, w, h };
}
