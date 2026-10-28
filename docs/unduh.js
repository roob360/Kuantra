// Logika halaman unduh Kuantra: membaca rilis terbaru dari GitHub (hanya rilis resmi; Pre-release tidak dikembalikan endpoint /releases/latest)
// dan memilih berkas menurut pola nama. Murni dan dapat diuji di Node (tests/situsUnduh.test.js).
const REPO = 'roob360/Kuantra-rilis';
const POLA = {
  pemasang: /^Kuantra-Setup-.+\.exe$/i,
  revit2025: /^Kuantra-Revit-.+-Revit2025\.zip$/i,
  revit2026: /^Kuantra-Revit-.+-Revit2026\.zip$/i,
};

function ukuranTeks(byte) {
  if (!Number.isFinite(byte) || byte <= 0) return '';
  return byte >= 1048576 ? `${(byte / 1048576).toFixed(0)} MB` : `${Math.max(1, Math.round(byte / 1024))} KB`;
}

// rilis: objek JSON GitHub (tag_name, published_at, assets[{name, browser_download_url, size}]). Mengembalikan null bila bukan rilis yang dapat dipakai.
function ringkasRilis(rilis) {
  if (!rilis || typeof rilis !== 'object' || rilis.draft || rilis.prerelease) return null;
  const aset = Array.isArray(rilis.assets) ? rilis.assets : [];
  const cari = (pola) => aset.find((a) => pola.test(a.name ?? '') && typeof a.browser_download_url === 'string' && a.browser_download_url.startsWith('https://github.com/'));
  const bentuk = (a) => (a ? { nama: a.name, url: a.browser_download_url, ukuran: ukuranTeks(a.size) } : null);
  const pemasang = bentuk(cari(POLA.pemasang));
  if (!pemasang) return null;
  return {
    versi: String(rilis.tag_name ?? '').replace(/^v/i, ''),
    tanggal: rilis.published_at ? String(rilis.published_at).slice(0, 10) : '',
    pemasang, revit2025: bentuk(cari(POLA.revit2025)), revit2026: bentuk(cari(POLA.revit2026)),
    halaman: `https://github.com/${REPO}/releases/latest`,
  };
}

async function muatRilis(ambil = fetch) {
  const r = await ambil(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
  if (r.status === 404) return { status: 'belum' };
  if (!r.ok) return { status: 'galat' };
  const ringkas = ringkasRilis(await r.json());
  return ringkas ? { status: 'ada', rilis: ringkas } : { status: 'belum' };
}

if (typeof module !== 'undefined') module.exports = { ringkasRilis, ukuranTeks, muatRilis, POLA, REPO };
else globalThis.Unduh = { ringkasRilis, ukuranTeks, muatRilis, POLA, REPO };
