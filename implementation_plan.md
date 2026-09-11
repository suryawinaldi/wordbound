# Implementation Plan: Sistem Kesulitan & Achievement (ML Guess + Multiplayer)

Misi ini akan merombak game "Tebak Hero ML" menjadi 4 tingkat kesulitan yang menantang, serta menambahkan sistem Papan Prestasi (Achievements) dan Statistik Mabar untuk game lainnya.

## User Review Required
> [!IMPORTANT]
> **Masukan Desain: Sistem "Kartu" vs "Pasif"**
> Memilih kartu di tengah permainan yang cepat (seperti kuis) bisa membuat laju game menjadi lambat dan mengganggu fokus. 
> **Usulan Saya:** Kita jadikan efek kartu tersebut sebagai **"Kemampuan Pasif" (Passive Buff/Debuff)** yang otomatis aktif berdasarkan tingkat kesulitan yang dipilih.

## Proposed Changes

### 1. Merombak Aturan Tebak Hero ML (Difficulty Rules)
#### [MODIFY] `src/views/MLGuessPage.jsx`
Sebelum mulai, pemain akan memilih 1 dari 4 tingkat kesulitan:
1. **🟢 Easy (Santai):** Modal **10 HP**. Semua Clue gratis. *Pasif: "Fast Learner"* (Jika menebak benar di Clue 1, 2, atau 3, dapat +1 HP. Maksimal HP 10).
2. **🟡 Medium (Menantang):** Modal **7 HP**. Semua Clue gratis. *Pasif: "Fast Learner"* (+1 HP jika tebak cepat, Maksimal HP 10).
3. **🔴 Hard (Keras):** Modal **5 HP**. Clue 6 & 7 **bayar 1 HP** untuk membukanya. *Pasif: "Fast Learner"* (+1 HP jika tebak cepat).
4. **💀 Nightmare (Neraka):** Modal **5 HP**. Clue 6 & 7 **bayar 1 HP**. **TIDAK ADA HEALING** (Tidak bisa nambah nyawa sama sekali). Sekali salah, nyawa melayang permanen.

- Jika HP habis (0), game berakhir (Game Over), dan *Streak* (rentetan benar beruntun) akan dievaluasi untuk mendapatkan *Achievement*.

### 2. Sistem Database Statistik & Achievement
#### [MODIFY] `src/stores/player.js`
Menambahkan data baru di Firestore pengguna:
- `stats`: `{ mlGuessMaxStreak: { easy: 0, medium: 0, hard: 0, nightmare: 0 }, rpsWins: 0, xoxoWins: 0, wordleWins: 0 }`
- `achievements`: Objek yang menghitung berapa kali sebuah medali didapatkan. Contoh: `{ 'ml-streak30-easy': 2, 'ml-perfect-nightmare': 1, 'xoxo-win10': 1 }`
- Membuat fungsi `addAchievement(badgeId)` dan `incrementStat(statId)`.

### 3. Evaluasi Achievement (Penghargaan)
#### [NEW LOGIC] Evaluasi di setiap akhir game:
**Tebak Hero ML:**
- Jika mati di atas/sama dengan *Streak 30*: Dapat medali **"30-Streak [Difficulty]"**.
- Jika berhasil menebak 133 hero tanpa mati: Dapat medali tertinggi **"Perfect 133 [Difficulty]"**.
*Catatan: Medali Nightmare akan dibuat dengan warna efek api hitam/merah yang sangat sangar.*

**Multiplayer (RPS, XOXO, Wordle):**
- Menambahkan pemanggilan `incrementStat('xoxoWins')` dsb di layar kemenangan `XOXOGamePage`, `RPSGamePage`, dan `WordleDuelPage` untuk pemain yang menang.
- Jika mencapai 10/50 Kemenangan, berikan medali Mabar.

### 4. Halaman Profil / Statistik (Hall of Fame)
#### [MODIFY] `src/views/StatsPage.jsx`
Merombak halaman statistik agar menampilkan:
1. **Statistik Mabar:** Jumlah kemenangan RPS, XOXO, dan Wordle.
2. **Rekor Tebak Hero ML:** Menampilkan *High Score* / *Max Streak* untuk masing-masing kesulitan.
3. **Papan Prestasi (Badges):** Menampilkan medali-medali yang sudah dikoleksi (dan jumlah tumpukannya, misal `x2`, `x5`). Medali yang belum didapatkan akan dibuat abu-abu (*silhouetted*).

## Verification Plan
1. Menguji *Difficulty Select Screen* di ML Guess.
2. Sengaja menebak di Clue 1 untuk melihat apakah nyawa bertambah (di Easy/Med/Hard) dan tidak bertambah di Nightmare.
3. Sengaja mengklik Clue 6 di Hard/Nightmare untuk melihat nyawa berkurang.
4. Membuat *script* curang untuk menang 30x agar bisa memverifikasi *Badge* masuk ke `StatsPage`.
5. Memenangkan game XOXO untuk melihat jumlah `xoxoWins` bertambah di `StatsPage`.
