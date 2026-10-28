// Menghubungkan hasil Unduh.muatRilis ke tombol di index.html dan menyalakan gerak masuk. Tanpa JavaScript halaman tetap utuh:
// tombol menaut ke halaman rilis terbaru dan semua bagian terlihat.
(async () => {
  const $ = (id) => document.getElementById(id);
  // Gerak masuk saat bagian terlihat, kecuali pengguna meminta gerak dikurangi.
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('js');
    const io = new IntersectionObserver((daftar) => { for (const d of daftar) if (d.isIntersecting) { d.target.classList.add('tampak'); io.unobserve(d.target); } }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (const el of document.querySelectorAll('.muncul')) io.observe(el);
  }
  const aktifkan = (el, url, teks) => { el.href = url; el.removeAttribute('aria-disabled'); if (teks) el.textContent = teks; };
  let hasil;
  try { hasil = await Unduh.muatRilis(); } catch { hasil = { status: 'galat' }; }
  const halamanRilis = `https://github.com/${Unduh.REPO}/releases/latest`;
  if (hasil.status === 'ada') {
    const r = hasil.rilis;
    aktifkan($('unduh-tombol'), r.pemasang.url, `Unduh Kuantra ${r.versi}`);
    $('info').textContent = `${r.pemasang.ukuran ? `${r.pemasang.ukuran}. ` : ''}${r.tanggal ? `Dirilis ${r.tanggal}.` : ''}`;
    for (const k of ['revit2026', 'revit2025']) {
      if (r[k]) aktifkan($(k), r[k].url, `${$(k).textContent} (${r[k].ukuran})`);
      else $(k).textContent = `${$(k).textContent} (belum tersedia)`;
    }
  } else {
    const belum = hasil.status === 'belum';
    aktifkan($('unduh-tombol'), halamanRilis, belum ? 'Rilis publik pertama segera hadir' : 'Buka halaman rilis');
    if (belum) $('unduh-tombol').setAttribute('aria-disabled', 'true');
    $('info').textContent = belum ? 'Belum ada rilis resmi. Tombol unduh akan aktif begitu rilis pertama terbit.' : 'Daftar rilis tidak dapat dimuat sekarang. Gunakan halaman rilis di GitHub.';
    for (const k of ['revit2026', 'revit2025']) aktifkan($(k), halamanRilis);
  }
})();
