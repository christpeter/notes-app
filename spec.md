# Spec: Notes App

## Goal
Aplikasi catatan cepat untuk HP yang tetap bisa dipakai saat offline.

## Features

### Catatan
- Setiap catatan punya judul dan isi.
- Judul wajib diisi (spasi saja dianggap kosong). Isi boleh kosong.
- Jika judul kosong saat "Simpan" ditekan, catatan tidak tersimpan dan muncul pesan "Judul wajib diisi".
- Tidak ada batas panjang teks.
- Daftar diurutkan dari yang terakhir diubah (`updatedAt` terbesar di atas). Jika `updatedAt` sama, catatan yang lebih dulu muncul di array `notes` tampil lebih dulu.
- Catatan baru ditambahkan ke awal array.
- Jika belum ada catatan, tampilkan teks "Belum ada catatan".

### Tambah dan edit
- "Tambah catatan" membuka form kosong dengan input "Judul" dan "Isi".
- Mengetuk sebuah catatan di daftar membuka form yang sama, sudah terisi.
- "Simpan" selalu memperbarui `updatedAt` (meski isinya tidak berubah), menyimpan, lalu kembali ke daftar. Catatan itu pindah ke posisi teratas.
- "Batal" kembali ke daftar tanpa menyimpan perubahan.

### Hapus
- Tombol "Hapus" hanya muncul di form edit (bukan di form catatan baru).
- Sebelum menghapus, tampilkan konfirmasi dengan window.confirm().
- Jika dibatalkan, catatan tetap ada.

### Cari
- Input "Cari" memfilter daftar saat mengetik (tanpa tombol submit).
- Tidak peka huruf besar-kecil, cocok sebagian, memeriksa judul dan isi.
- Input kosong menampilkan semua catatan.
- Jika tidak ada yang cocok, tampilkan "Tidak ada catatan yang cocok".

### Offline dan PWA
- Setelah dibuka online satu kali, aplikasi harus bisa dibuka dan dipakai penuh saat offline (service worker menyimpan semua aset aplikasi).
- Kunjungan pertama saat offline tidak perlu didukung.
- Semua catatan tetap bisa dibaca, ditambah, diedit, dihapus, dan dicari saat offline, karena disimpan di localStorage.
- Punya web app manifest dengan nilai berikut:
  - `name` dan `short_name`: "Catatan"
  - `display`: `standalone`
  - `start_url`: `/`
  - `theme_color`: `#1a73e8`, `background_color`: `#ffffff`
  - `icons`: PNG 192x192 dan 512x512, ditambah satu ikon 512x512 dengan `purpose: "maskable"`
- Ikon boleh sederhana (placeholder), misalnya huruf "C" di atas warna solid, selama ukurannya benar.

## Mobile
- Rapi di layar selebar 360 px, tanpa horizontal scroll.
- Tombol dan area sentuh minimal 44 x 44 px.

## Data dan stack
- Disimpan di browser (localStorage) dengan satu key: `notes`. Tanpa server, tanpa login.
- Nilai `notes` adalah string JSON berisi array objek: `{ "id": string, "title": string, "content": string, "updatedAt": number }`.
  - `id`: dibuat dengan `crypto.randomUUID()`, unik dan tidak berubah.
  - `updatedAt`: milidetik dari `Date.now()`.
- Jika key `notes` tidak ada, JSON-nya rusak, atau isinya bukan array, aplikasi memperlakukannya sebagai daftar kosong dan tidak error. Data lama baru ditimpa saat pengguna menyimpan catatan.
- HTML, CSS, JavaScript murni + Vite. Tanpa UI framework.
- Tooling: ESLint (lint), Vitest (unit test), Playwright (e2e).
- Script di package.json: `lint`, `test`, `test:e2e`.

## UI contract (nama ini dipakai oleh tests)
- Heading halaman: "Catatan"
- Tombol: "Tambah catatan", "Simpan", "Batal", "Hapus"
- Input berlabel: "Judul", "Isi", "Cari"
- Teks status: "Belum ada catatan", "Tidak ada catatan yang cocok", "Judul wajib diisi"

## Done when
- npm run lint, npm test, dan npm run test:e2e lulus.
- Lighthouse diukur pada `http://localhost:4173/` (hasil `npm run build` lalu `npm run preview`), mode Mobile, pengaturan default (Simulated throttling), di jendela Chrome tanpa ekstensi.
- Kondisi data saat diuji: profil Chrome baru atau incognito, dengan localStorage kosong (tampilan "Belum ada catatan").
- Performance dan Accessibility >= 90 pada halaman utama.

## Out of scope
- Sync antar device, berbagi catatan, gambar
- Kunjungan pertama saat offline
- Batas panjang catatan, kategori/tag, dark mode