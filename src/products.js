export const W = 640, H = 720; // stage size in px

const TEE = { S: { chest: 48, length: 69 }, M: { chest: 52, length: 72 }, L: { chest: 55, length: 74 }, XL: { chest: 58, length: 76 }, XXL: { chest: 61, length: 78 } };
const POLO = { S: { chest: 49, length: 68 }, M: { chest: 53, length: 70 }, L: { chest: 56, length: 72 }, XL: { chest: 59, length: 74 }, XXL: { chest: 62, length: 76 } };
const HOOD = { S: { chest: 54, length: 66 }, M: { chest: 58, length: 69 }, L: { chest: 61, length: 71 }, XL: { chest: 64, length: 73 }, XXL: { chest: 67, length: 75 } };

export const TYPES = {
 // polo: { label: 'Polo', product: 'Pique Polo Shirt', fabric: '100% cotton pique, 220 GSM', fit: 'Regular fit, 3-button placket', price: 649, sizes: POLO },
 // round: { label: '', product: 'Classic Round-Neck Tee', fabric: '100% combed cotton, 180 GSM', fit: 'Regular fit, short sleeve', price: 449, sizes: TEE },
  round: { label: '', product: 'Round-Neck', fabric: '100% combed cotton, 180 GSM', fit: 'Regular fit, short sleeve', price: 449, sizes: TEE },
 // vneck: { label: 'V-Neck', product: 'Classic V-Neck Tee', fabric: '100% combed cotton, 180 GSM', fit: 'Regular fit, short sleeve', price: 479, sizes: TEE },
 // hoodie: { label: 'Hoodie', product: 'Fleece Pullover Hoodie', fabric: '80% cotton / 20% polyester fleece, 320 GSM', fit: 'Relaxed fit, kangaroo pocket, drawstring hood', price: 999, sizes: HOOD },
};
export const surcharge = (size) => (size === 'XL' || size === 'XXL' ? 50 : 0);
export const COLORS = [
  { name: 'White', hex: '#f4f4f2' }, { name: 'Black', hex: '#1d1d1f' }, { name: 'Navy', hex: '#1f2a52' },
  { name: 'Red', hex: '#b92b2b' }, { name: 'Heather Grey', hex: '#a9adb3' }, { name: 'Forest Green', hex: '#2e6b3f' },
];
export const FONTS = ['Roboto', 'Montserrat', 'Oswald', 'Bebas Neue', 'Playfair Display', 'Pacifico', 'Lobster',
  'Dancing Script', 'Permanent Marker', 'Arial', 'Impact', 'Courier New'];

// The print area is the ENTIRE T-shirt: its bounding box, found from the shirt image (sleeves included).
// Real size: the shirt image height is matched to the garment length of the chosen size.
export const printSpec = (bb, length, dpi) => {
  const ppc = bb.h / length; // stage px per cm
  const ratio = Math.min(dpi / (2.54 * ppc), 8192 / Math.max(bb.w, bb.h), Math.sqrt(40e6 / (bb.w * bb.h))); // capped for browser canvas limits
  return { ppc, ratio, cmW: bb.w / ppc, cmH: bb.h / ppc, pxW: Math.round(bb.w * ratio), pxH: Math.round(bb.h * ratio), dpi: Math.round(ratio * 2.54 * ppc) };
};

// [label, x as fraction of shirt width from centre (+ = viewer's right), y as fraction of shirt height from top]
export const presets = (type, side) => {
  if (side === 'back') return [['Upper back', 0, 0.22], ['Center back', 0, 0.38], ['Lower back', 0, 0.62]];
  if (type === 'polo') return [['Left chest', 0.15, 0.26], ['Right chest', -0.15, 0.26], ['Lower center', 0, 0.62]];
  if (type === 'hoodie') return [['Center chest', 0, 0.34], ['Left chest', 0.15, 0.28], ['Right chest', -0.15, 0.28], ['Lower center', 0, 0.62]];
  return [['Center chest', 0, 0.3], ['Left chest', 0.15, 0.26], ['Right chest', -0.15, 0.26], ['Lower center', 0, 0.62]];
};
