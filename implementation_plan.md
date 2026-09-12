# Rencana Implementasi: Connect 4 & Memory Match Duel

## 1. Persiapan Routing & Menu
- Update `src/router.jsx` untuk mendaftarkan rute `/connect4` dan `/memory-match`.
- Update `src/views/GamesPage.jsx` untuk menampilkan 2 game ini (total menjadi 8 game).
- Update `src/views/StatsPage.jsx` untuk menampilkan statistik kemenangan mabar `connect4Wins` dan `memoryMatchWins`.

## 2. Pembuatan Connect 4 (`src/views/games/Connect4Page.jsx`)
- **Grid:** Papan biru dengan lubang 7 kolom x 6 baris.
- **State Sinkronisasi:** `turn` (host/guest), `board` (flat array 42 kotak), `winner`.
- **Mekanik:** Saat pemain mengklik sebuah kolom, kepingan warna mereka (Merah untuk Host, Kuning untuk Guest) akan "jatuh" ke baris terbawah yang masih kosong di kolom tersebut.
- **Deteksi Menang:** Cek horizontal, vertikal, dan diagonal untuk 4 keping yang berjejer.

## 3. Pembuatan Memory Match (`src/views/games/MemoryMatchPage.jsx`)
- **Konsep:** Papan berisi 16 kartu tertutup (4x4 grid).
- **Tema:** Mencocokkan Kosakata Bahasa Inggris dengan Arti Bahasa Indonesianya (agar sejalan dengan tema edukasi Wordbound).
- **State Sinkronisasi:** `cards` (kumpulan ID kartu, isFlipped, isMatched), `turn`, `hostScore`, `guestScore`, `lockBoard` (mencegah klik saat kartu salah sedang ditutup).
- **Mekanik:** 
  - Host menginisialisasi 16 kartu acak secara tersembunyi (dikirim ke Firebase Room State).
  - Pemain bergantian membalik 2 kartu.
  - Jika cocok: Dapat 1 poin, kartu tetap terbuka, dan **giliran tetap miliknya** (Combo berlanjut).
  - Jika salah: Kartu ditutup kembali setelah 1 detik, giliran pindah ke lawan.
  - Game selesai jika semua pasangan (8 pasang) telah ditemukan. Pemenang adalah yang poinnya terbanyak.
