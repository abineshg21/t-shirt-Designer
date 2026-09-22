// Makes the background of an uploaded artwork transparent (the "Make background transparent" button).
// Colour = average of the four corners. everywhere=false only removes background connected to the border.
export function removeBackground(img, tol = 30, everywhere = false) {
  const s = Math.min(1, 2000 / Math.max(img.width, img.height)), w = Math.round(img.width * s), h = Math.round(img.height * s);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
  const im = x.getImageData(0, 0, w, h), d = im.data, N = w * h;
  const corners = [0, w - 1, (h - 1) * w, N - 1].map((i) => i * 4);
  const bg = [0, 1, 2].map((k) => corners.reduce((a, p) => a + d[p + k], 0) / 4);
  const match = (i) => { const p = i * 4; return d[p + 3] < 20 || (Math.abs(d[p] - bg[0]) <= tol && Math.abs(d[p + 1] - bg[1]) <= tol && Math.abs(d[p + 2] - bg[2]) <= tol); };
  const seen = new Uint8Array(N);
  if (everywhere) { for (let i = 0; i < N; i++) if (match(i)) seen[i] = 1; }
  else {
    const stack = new Int32Array(N); let sp = 0;
    const push = (i) => { if (!seen[i] && match(i)) { seen[i] = 1; stack[sp++] = i; } };
    for (let i = 0; i < w; i++) { push(i); push((h - 1) * w + i); }
    for (let j = 0; j < h; j++) { push(j * w); push(j * w + w - 1); }
    while (sp) { const i = stack[--sp], px = i % w; if (px > 0) push(i - 1); if (px < w - 1) push(i + 1); if (i >= w) push(i - w); if (i < N - w) push(i + w); }
  }
  for (let i = 0; i < N; i++) if (seen[i]) d[i * 4 + 3] = 0;
  x.putImageData(im, 0, 0);
  return c;
}
