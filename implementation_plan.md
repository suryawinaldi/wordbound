# Implementation Plan: Real-Time Multiplayer & New Games

Misi kali ini adalah mengubah DuoQuest menjadi platform mabar sejati dengan fitur Multiplayer Real-Time dan memperluas game menjadi 6, serta menambahkan detail Bintang Mythic di Profil.

## User Review Required
> [!IMPORTANT]
> Penambahan fitur *Real-Time Multiplayer* membutuhkan koleksi *database* baru di Firestore.
> Kita akan membuat sistem **Room Code** (Kode Ruangan) di mana pemain bisa membuat ruang (*Host*) dan pemain lain bisa masuk dengan kode tersebut (*Join*). Ini akan menjadi pondasi untuk game Gunting Batu Kertas, XOXO (Tic-Tac-Toe), dan Duel Listen & Type.

## Proposed Changes

### 1. Pembaruan Profil (Bintang Mythic)
#### [MODIFY] `src/views/ProfilePage.jsx`
- Tambahkan logika *conditional*: Jika *dropdown* Rank ML dipilih mengandung kata "Mythic", munculkan *input* angka untuk "Jumlah Bintang".
- Tambahkan teks bantuan rentang bintang (Mythic 1-24, Honor 25-49, Glory 50-99, Immortal 100+).
- Simpan data `mlbbStars` ke Firestore.

### 2. Arsitektur Multiplayer Real-Time
#### [NEW] `src/stores/room.js`
- *State manager* untuk Multiplayer. Akan menggunakan `onSnapshot` ke koleksi Firestore `rooms`.
- Fungsi: `createRoom(gameId)`, `joinRoom(code)`, `leaveRoom()`, `updateRoomState(patch)`.
- Struktur Dokumen `rooms/{roomCode}`:
  - `gameId`: string (contoh: 'rps', 'xoxo')
  - `host`: { uid, displayName, photoURL }
  - `guest`: { uid, displayName, photoURL } | null
  - `status`: 'waiting' | 'playing' | 'finished'
  - `gameData`: objek kustom setiap game.

#### [NEW] `src/components/MultiplayerLobby.jsx`
- Komponen antarmuka (UI) untuk menunggu pemain masuk (*Host*) atau form memasukkan kode (*Guest*).
- Menampilkan status koneksi dan tombol "Mulai Game" untuk Host.

### 3. Penambahan Game Baru (Total 6 Game)
#### [MODIFY] `src/views/GamesPage.jsx`
- Update daftar game menjadi 6:
  1. English Quiz (Solo/Duo)
  2. Listen & Type Duel (Real-Time Duo)
  3. Tebak Hero ML (Solo/Duo)
  4. Gunting Batu Kertas (Real-Time Duo)
  5. XOXO Gomoku 10x10 (Real-Time Duo)
  6. Tebak Kata / Wordle Duel (Real-Time Duo)

#### [NEW] `src/views/RPSGamePage.jsx` (Game 4)
- Gunting Batu Kertas. Mode *Best of 3, 5, atau 7* (diatur oleh Host).
- Status disembunyikan sampai kedua pemain memilih.

#### [NEW] `src/views/XOXOGamePage.jsx` (Game 5)
- Papan 10x10. Pemenang adalah yang berhasil menderetkan 5 lambang (X atau O) secara vertikal, horizontal, atau diagonal (aturan *Gomoku* atau *Five-in-a-Row*).

#### [NEW] `src/views/WordleDuelPage.jsx` (Game 6)
- Balapan menebak kata rahasia 5 huruf. Siapa yang berhasil menebak lebih cepat/dalam percobaan paling sedikit menang.

### 4. Merombak Listen & Type Menjadi Duel
#### [MODIFY] `src/views/ListenGamePage.jsx`
- Gabungkan dengan `room.js`. Jika masuk lewat *room*, game berubah menjadi mode *Race* (Balapan).
- Siapa yang pertama kali mengirim jawaban benar mendapat poin.

## Verification Plan
### Manual Verification
- Deploy ke Vercel (otomatis)
- Uji fitur Edit Profil untuk Rank Mythic + Bintang.
- Buka dua *tab browser* yang berbeda (sebagai akun A dan akun B), buat Room di salah satu akun, lalu gabung pakai kode Room di akun satunya.
- Mainkan Gunting Batu Kertas dan XOXO hingga layar kemenangan muncul.
