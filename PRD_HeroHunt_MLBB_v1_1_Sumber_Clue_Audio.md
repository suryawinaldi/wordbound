# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## HERO HUNT — Tebak Hero MLBB (Judul Kerja)

| Informasi | Detail |
|---|---|
| Versi PRD | 1.1 (penambahan referensi clue & audio) |
| Tanggal | 11 November 2026 |
| Status | Draft untuk redesign dan implementasi |
| Platform | Web responsif / PWA opsional; mobile-first |
| Repository asal | https://github.com/suryawinaldi/wordbound |
| Model bisnis awal | Gratis, tanpa transaksi uang asli |
| Posisi merek | Game kuis penggemar Mobile Legends, tidak resmi / tidak berafiliasi dengan Moonton |

> **Visi:** Game browser singkat, seru, dan adil untuk menguji seberapa jauh pemain mengenal hero Mobile Legends: Bang Bang, sendirian atau bersama teman. **Satu game utama, beberapa mode main, dan progres yang berarti.**

## 1. Masalah, Peluang, dan Hipotesis

**Masalah pada produk asal:** Identitas Wordbound/DuoBloom dan katalog game non-MLBB mengalihkan fokus dari Tebak Hero. Kuis menggunakan clue yang panjang dengan tindakan utama di bawah daftar, hasil permainan kurang menonjolkan keseruan penemuan identitas hero, dan implementasi multiplayer perlu diperbaiki.

**Hipotesis nilai pengguna:** Penggemar MLBB akan lebih tertarik memulai dan mengulangi sesi jika game dapat dibuka dengan cepat, petunjuk bertahap menantang tetapi adil, jawaban diterima secara fleksibel, dan kemajuan atau hasil bisa dibagikan.

**Value proposition:** “Seberapa jago kamu kenal semua hero? Tebak dari petunjuk, kumpulkan skor, dan tantang teman.”

## 2. Target Pengguna dan Jobs-To-Be-Done

- **Pemain kasual:** ingin main 3–5 menit tanpa belajar aturan kompleks; perlu tombol langsung Main, mode santai, dan petunjuk mudah.
- **Pemain MLBB aktif:** ingin tantangan detail lore/skill/role; perlu pilihan kesulitan, validasi clue yang akurat, dan catatan rekor.
- **Duo/komunitas:** ingin saling menguji pengetahuan; perlu kode room, duel/co-op, hasil yang adil, dan mekanisme reconnect.

**JTBD:** “Ketika saya punya waktu singkat atau sedang berkumpul dengan teman sesama pemain MLBB, saya ingin menebak hero secara cepat dan seru, supaya bisa menguji pengetahuan, tertawa bersama, serta membandingkan hasil.”

## 3. Sasaran dan Non-Sasaran

**Sasaran v1:** satu produk khusus MLBB; time-to-first-guess rendah; sesi Solo stabil; pilihan kesulitan jelas; dataset hero terkurasi; hasil permainan yang bermakna; tampilan mobile nyaman; progres tersimpan bila pengguna memiliki akun; multiplayer dirilis hanya setelah lolos testing sinkronisasi.

**Non-sasaran v1:** game MLBB asli/MOBA, sistem matchmaking publik, sistem ranked kompetitif berhadiah, monetisasi, chat publik, gacha, koleksi skin, analitik hero meta real-time, dan menyalin aset resmi tanpa hak.

## 4. Lingkup Prioritas

| Tahap | Fitur | Prioritas |
|---|---|---|
| MVP / v1.0 | Rebranding, beranda MLBB, Solo Classic, difficulty, clue bertahap, input nama hero, normalisasi + alias, feedback dan hasil, statistik dasar, guest trial, validasi dataset, QA | P0 |
| v1.1 | Mode Gantian 1 Layar (tanpa harus menautkan akun pasangan), daily challenge, share result, riwayat singkat, perbaikan aksesibilitas lanjut | P1 |
| v1.2 | Co-op online dan Duel online dengan transaksi atomik, room lifecycle, koneksi ulang, anti-double score, security rules | P1 setelah lulus QA |
| Backlog | Siluet hero, tebakan lewat skill art/voice, koleksi lencana, turnamen komunitas, papan peringkat, PWA offline dan multilingual | P2; tergantung izin penggunaan aset |

**Aturan scope:** Solo dan Gantian bukan game berbeda; Co-op/Duel juga variasi dari game Tebak Hero. Tidak ada English Quiz, Wordle, RPS, XOXO, Connect 4, Listen & Type, Memory Match, maupun mini-game non-MLBB lain.

## 5. Experience dan Information Architecture

**Alur baru:**

`Landing / Beranda → Main Sekarang → Pilih Mode (Solo / Gantian / Co-op / Duel) → Pilih Kesulitan (jika relevan) → Sesi Tebak Hero → Ringkasan Hasil → Main Lagi / Beranda`

**Navigasi utama (desktop):** Beranda · Main · Statistik · Profil. Di mobile gunakan bottom navigation 3–4 item atau navigasi sederhana yang tidak bertabrakan dengan keyboard. Bagian multiplayer di dalam pemilihan mode, bukan katalog game terpisah.

**Pertama kali datang:** Landing menjelaskan cara main maksimal 3 langkah, menyediakan CTA “Main Sekarang”, pilihan “Coba sebagai tamu”, dan “Masuk Google untuk simpan progres”. Jangan memaksa penautan pasangan untuk bermain lokal.

**Beranda:** hero-banner visual orisinal, CTA “Tebak Hero”, ringkasan rekor/pencapaian yang relevan, akses mode, tantangan harian (jika tersedia). Hilangkan Pohon Kehidupan, tabungan rupiah, dan CEFR.

## 6. Persyaratan Fungsional & Kriteria Penerimaan

| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-01 | Pemain masuk ke sesi Solo dari beranda | Maksimal 3 langkah interaksi dari beranda ke tebakan pertama bagi guest yang memilih default. |
| FR-02 | Pilihan kesulitan | Easy, Normal, Hard; deskripsi menyebut HP, penalti tebakan, serta aturan hint; Nightmare boleh menjadi unlock/backlog. |
| FR-03 | Pemilihan hero | Pilih acak tanpa pengulangan dalam satu sesi, gunakan shuffle Fisher–Yates/seeded untuk testing; replikasi bisa diuji. |
| FR-04 | Clue bertahap | Masing-masing hero memiliki 5 petunjuk inti yang terkurasi dari struktur 7 clue yang ada; clue hanya dibuka satu per satu, clue awal lebih samar dan akhir lebih jelas; isi clue tidak mengandung jawaban. |
| FR-05 | Input jawaban | Normalisasi case, spasi ganda, tanda baca, aksen standar dan alias resmi/terkurasi (contoh `X.Borg`, `Yi Sun-shin`, `Chang'e`); kesalahan ketik tak dikenal tetap dihitung salah. |
| FR-06 | Feedback | Salah: tampil informasi singkat dan update HP; benar: tampil nama hero, poin, info ringkas, tombol “Hero Berikutnya”; UI tidak lompat/scroll tiba-tiba. |
| FR-07 | Aturan sesi | Default 5 hero per sesi dan total 5 HP di Normal; salah mengurangi 1 HP; hint mengurangi potensi skor, bukan uang asli; habis HP mengakhiri sesi. Skema final dapat disetel setelah playtest. |
| FR-08 | Poin & XP | Contoh formula skor per hero: `max(10, 100 − 15 × (hintDibuka) − 10 × (salahPadaHero))`; reward hanya sekali per hero; total dan rekor ditampilkan jelas. |
| FR-09 | Hasil akhir | Tampilkan hero benar, jumlah benar/total, akurasi, skor, petunjuk digunakan, rekor, aksi “Main Lagi”, “Bagikan” jika tersedia. |
| FR-10 | Simpan progres | Akun: hasil disimpan ke Firestore atomik + idempotency; tamu: dapat mencoba, dengan penjelasan progres mungkin tidak lintas perangkat. |
| FR-11 | Mode Gantian | Dua pemain dapat memilih nama dan bergantian pada satu perangkat tanpa menghubungkan akun pasangan. |
| FR-12 | Online Co-op / Duel | Room 6 karakter, buat/gabung/keluar; dua browser melihat game state dan skor konsisten; tidak ada skor ganda ketika input bersamaan; status disconnect/reconnect jelas. |
| FR-13 | Kelola konten | Data hero memiliki ID unik, nama, alias, role, 5+ clues, sumber/verifikasi, status audio/gambar opsional, status aktif; kegagalan aset tidak menghentikan permainan. |
| FR-14 | Pengaturan | Suara on/off, reduced motion, tampilan terang/gelap bila disediakan, serta pengaturan privasi/keluar. |
| FR-15 | Responsif & aksesibel | Bisa dimainkan dengan keyboard, tombol sentuh minimal 44px, teks terbaca pada lebar 360px, focus ring terlihat, kontras memadai, dan tidak ada clue yang terbuka hanya lewat hover. |

### Detail mekanik kesulitan yang diusulkan

| Mode | HP per sesi | Hint | Penalti salah | Catatan |
|---|---:|---|---|---|
| Easy | 8 | 5 clue, gratis | −1 HP | Fokus kasual, reward score lebih rendah |
| Normal | 5 | 5 clue, pengurangan potensi skor | −1 HP | Default |
| Hard | 3 | 5 clue, pengurangan potensi skor lebih besar | −1 HP | Clue awal lebih samar, tanpa paywall koin |

*Jangan menggabungkan game difficulty dengan mode sosial. Difficulty adalah aturan permainan, bukan aplikasi terpisah. Ubah angka hanya setelah playtest.*

### State game minimum

`idle → ready → guessing → submitted(correct|wrong) → reveal → nextHero → completed/gameOver`.

Transisi harus eksplisit agar tombol tidak melakukan submit dua kali dan reward tidak dihitung ganda. Timer animasi harus dibersihkan saat unmount. Untuk online, server dipercaya menentukan hasil dan skor; klien mengirim aksi, bukan mengubah scoreboard semaunya.

## 7. Desain UI/UX

**Arah visual:** **fantasy esports premium, bukan tiruan UI resmi MLBB**. Gunakan warna dasar `#0B1225` (midnight), surface `#17213A`, border `#2A3855`, emas `#F4C66A` untuk CTA/progres, aksen elektrik `#55B9F7`, sukses `#41CFA7`, gagal `#F06C79`, teks `#F8FAFF`, muted `#AAB7D1`. Nilai ini usulan awal dan harus lolos uji kontras.

**Typografi:** heading tegas seperti Plus Jakarta Sans/Sora dengan body 15–16px; jangan gunakan teks label penting di bawah 12px. Gunakan whitespace, shadow lembut, dan 1 CTA dominan per layar. Microanimation 150–300 ms dan non-esensial dihentikan ketika reduced motion aktif.

**Komponen utama:**
- `HeroMysteryCard`: ilustrasi/siluet orisinal atau kartu simbol misterius tanpa melanggar hak cipta; jangan mengungkap wajah/nama sebelum benar.
- `CluePanel`: petunjuk aktif dominan; petunjuk sebelumnya dipadatkan atau dapat dibuka ulang; status `Clue 2 dari 5`.
- `GuessInput`: label yang nyata, autocapitalize off bila perlu, Enter submit, bantuan contoh format nama tanpa spoiler.
- `GameHUD`: HP, progres `Hero 3/5`, skor total dan mode, selalu terbaca.
- `RevealCard`: nama hero, penjelasan singkat, perubahan skor, CTA berikutnya.
- `RoomLobby`: kode room besar, tombol Salin, daftar pemain, status tunggu, tombol Keluar.

**Rancangan low-fidelity layar permainan:**

```text
┌──────────────────────────────────────┐
│ ← Keluar      SOLO · NORMAL     ⚙    │
│ Hero 03/05       ♥♥♥♡♡       240 XP │
│                                      │
│       [?]  SIAPA HERO INI?           │
│        Mystery card / artwork        │
│                                      │
│ PETUNJUK 2 DARI 5                   │
│ “Memiliki mekanik mobilitas ...”     │
│ [ Lihat petunjuk sebelumnya ▾ ]      │
│                                      │
│ [ Ketik nama hero...            ]    │
│ [          TEBAK HERO          ]     │
│ [ Buka petunjuk berikutnya −15 ]     │
└──────────────────────────────────────┘
```

**Perilaku khusus mobile:** area input dan tindakan utama harus tetap terjangkau tanpa menutupi clue; jika soft keyboard aktif, sesuaikan area viewport (jangan semata-mata sticky di bawah yang menabrak keyboard). Validasi pada layar 360×800 dan 390×844 sebelum desktop polish.

## 8. Konten & Kualitas Data

**Dataset awal yang diperiksa:** `src/data/ml-heroes.js` berisi 133 nama unik, setiap entry 7 clue; **26 entry tidak memiliki `audioUrl`**. Ini adalah cakupan file, **bukan** jaminan roster MLBB terbaru atau kebenaran isi clue. Audit tiap clue terhadap sumber otoritatif, khususnya build, counter, jumlah skin, dan meta yang mudah berubah.

**Schema yang diusulkan:**

```json
{
  "id": "hero_stable_slug",
  "name": "Nama Hero",
  "aliases": ["variasi ejaan yang disetujui"],
  "roles": ["Mage"],
  "clues": [
    {"level": 1, "type": "lore", "text": "...", "source": "..."},
    {"level": 2, "type": "mechanic", "text": "...", "source": "..."}
  ],
  "portrait": null,
  "audio": null,
  "verifiedAt": "2026-11-11",
  "enabled": true
}
```

**Aturan editorial:** pertanyaan tidak ambigu, progresif dari sulit ke mudah, tidak membocorkan nama target, tidak mengandung placeholder `...`, cocok secara bahasa Indonesia, dan selalu punya fallback jika audio/gambar tidak ada. Pisahkan clue relatif stabil (lore/skill signature) dari data patch-dependent (build/counter/meta) yang perlu versi patch.

**Hak cipta:** nama/tema karakter dipakai sebagai rujukan trivia, tetapi gambar, logo, suara, model, dan audio resmi dilindungi hak cipta. Sebelum memakai atau mendistribusikan aset MLBB, periksa izin tertulis/kebijakan lisensi. Buat visual orisinal bila belum ada izin. Tambahkan disclaimer “Proyek fan-made, bukan produk resmi dan tidak berafiliasi dengan MOONTON Games”.

## 8A. Riset Sumber Clue dan Voice Line (11 November 2026)

**Tujuan:** setiap clue hero harus bisa ditelusuri ke rujukan yang sesuai, terutama data skill, lane, dan meta yang dapat berubah. Link audio di bawah adalah **halaman penelusuran/referensi**, bukan izin penggunaan file dalam game.

### A. Katalog sumber yang direkomendasikan

| Sumber | Link | Untuk apa | Catatan |
|---|---|---|---|
| Website resmi MLBB — daftar hero | [Buka sumber](https://www.mobilelegends.com/hero/list) | Roster, role, lane, informasi hero; prioritas pertama untuk fakta yang dipengaruhi patch | Resmi |
| Website resmi MLBB — hero dan skill | [Buka sumber](https://www.mobilelegends.com/id/home) | Deskripsi kemampuan dan informasi gameplay, pilih hero yang ingin dicek | Resmi |
| MLBB Wiki — contoh hero Aamon | [Buka sumber](https://mobile-legends.fandom.com/wiki/Aamon) | Lore, relasi karakter, profil, deskripsi ability, riwayat patch | Wiki komunitas |
| ONE Esports — kompilasi hero guides | [Buka sumber](https://www.oneesports.gg/mobile-legends/full-mobile-legends-hero-guides/) | Counter, combo, synergy dan build; tanggal artikel harus dicek | Media sekunder |
| MLBB Tools — Lore | [Buka sumber](https://mlbb.tools/lore) | Latar dunia, wilayah, lore dan koneksi antarhero | Fan reference |
| MLBB Tools — Hubungan hero | [Buka sumber](https://mlbb.tools/lore/relationships) | Relasi keluarga, rivalitas, cerita; cocok untuk clue trivia | Fan reference |
| MLBB Tools — Patch notes | [Buka sumber](https://mlbb.tools/patch-notes) | Pengecekan ulang informasi skill, item, dan pembaruan | Fan reference |
| MLBB Tools — Audio Browser | [Buka sumber](https://mlbb.tools/audio) | Preview voice line & pencarian teks audio | Fan reference, bukan lisensi |
| MLBB Wiki — kategori hero audio | [Buka sumber](https://mobile-legends.fandom.com/wiki/Category:Hero_audio) | Indeks halaman audio hero dan variasi bahasa | Wiki komunitas |
| MLBB Wiki — Aamon Audio EN | [Buka sumber](https://mobile-legends.fandom.com/wiki/Aamon/Audio) | Contoh halaman voice selection, movement, skill | Wiki komunitas |
| MLBB Wiki — Aamon Audio ID | [Buka sumber](https://mobile-legends.fandom.com/wiki/Aamon/Audio/id) | Contoh voice line versi Bahasa Indonesia | Wiki komunitas |
| Moonton Games — Terms of Service | [Buka sumber](https://mlbbesports.com/legal/terms) | Ketentuan hak cipta artwork, dialog, efek, musik dan pemanfaatan konten | Kebijakan resmi |

### B. Standar penerapan sumber pada setiap clue

1. **Role/lane:** mulai dari roster resmi MLBB, kemudian cek dalam game pada patch target. Jangan campur role dengan lane tanpa konfirmasi.
2. **Lore/relasi:** gunakan halaman cerita hero di Wiki sebagai referensi awal dan cek silang dengan cerita resmi/in-game. Tulis clue dengan kata sendiri; hindari menyalin paragraf.
3. **Skill/mekanik:** utamakan deskripsi kemampuan resmi dan catat patch/tanggal review. Hindari angka damage atau cooldown jika tidak diperlukan untuk tebakan.
4. **Build/counter/sinergi:** panduan ONE Esports hanya referensi tambahan; ini tidak selalu abadi, bergantung patch, lineup, item, dan skill pemain. Untuk MVP lebih baik utamakan clue skill/lore.
5. **Fakta skin/tahun rilis:** data mudah kedaluwarsa, wajib menyertakan tanggal dan sumber. Jika tidak terkonfirmasi, hilangkan, jangan menulis perkiraan jumlah skin.
6. **Audio:** prioritaskan voice selection **default skin**; jangan keliru mengambil suara skin kolaborasi, voice move, atau audio dalam bahasa berbeda. Sediakan teks/fallback jika audio tidak tersedia.
7. **QA:** setiap hero punya lima petunjuk progresif, masing-masing status `verified/unverified/deprecated`, URL sumber, jenis sumber, patch, waktu diverifikasi, reviewer, dan catatan perubahan.

### C. Contoh konkret: Aamon

- **Halaman profil & kemampuan:** https://mobile-legends.fandom.com/wiki/Aamon
- **Audio bahasa Inggris:** https://mobile-legends.fandom.com/wiki/Aamon/Audio
- **Halaman file selection Inggris:** https://mobile-legends.fandom.com/wiki/File:Aamon.select.ogg
- **Audio bahasa Indonesia:** https://mobile-legends.fandom.com/wiki/Aamon/Audio/id
- **Halaman file selection Indonesia:** https://mobile-legends.fandom.com/wiki/File:Aamon.id.select.ogg
- **Contoh clue ditulis ulang:** "Hero ini berasal dari keluarga bangsawan Paxley" (lore); "Memiliki kemampuan menyamarkan diri setelah mengenai lawan dengan skill" (mekanik). Clue akhir boleh menyebut serpihan/shard tetapi tidak menyebut nama hero.

### D. Hasil audit audio dari repository

Pada `src/data/ml-heroes.js` terdapat **133 entri hero**. Sebanyak **26 hero** belum mempunyai `audioUrl`. Penelusuran kali ini menemukan halaman sumber audio terindeks untuk **25 dari 26** entri: **24** memiliki referensi file audio dalam halaman wiki (belum dites playback) dan **1** (Sora) mempunyai halaman wiki tetapi isi audio belum tersedia; **1** (Hirara) belum dapat diverifikasi. Jumlah ini adalah audit kelengkapan metadata, bukan bukti bahwa seluruh file dapat diputar atau boleh di-host.

| Hero | Halaman audio | Contoh halaman file | Status |
|---|---|---|---|
| Arlott | [Wiki audio](https://mobile-legends.fandom.com/wiki/Arlott/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio1201-select.ogg) | Ditemukan, belum uji playback |
| Chip | [Wiki audio](https://mobile-legends.fandom.com/wiki/Chip/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio1241-select.ogg) | Ditemukan, belum uji playback |
| Cici | [Wiki audio](https://mobile-legends.fandom.com/wiki/Cici/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio1231-select.ogg) | Ditemukan, belum uji playback |
| Clint | [Wiki audio](https://mobile-legends.fandom.com/wiki/Clint/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Clint.new.select.ogg) | Ditemukan, belum uji playback |
| Fredrinn | [Wiki audio](https://mobile-legends.fandom.com/wiki/Fredrinn/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio1171-select.ogg) | Ditemukan, belum uji playback |
| Hirara | Belum terverifikasi | — | Belum terverifikasi |
| Ixia | [Wiki audio](https://mobile-legends.fandom.com/wiki/Ixia/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio1211-select.ogg) | Ditemukan, belum uji playback |
| Joy | [Wiki audio](https://mobile-legends.fandom.com/wiki/Joy/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio1181-select.ogg) | Ditemukan, belum uji playback |
| Kalea | [Wiki audio](https://mobile-legends.fandom.com/wiki/Kalea/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio1281-select.ogg) | Ditemukan, belum uji playback |
| Kimmy | [Wiki audio](https://mobile-legends.fandom.com/wiki/Kimmy/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio711-select.ogg) | Ditemukan, belum uji playback |
| Lolita | [Wiki audio](https://mobile-legends.fandom.com/wiki/Lolita/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio201-select.ogg) | Ditemukan, belum uji playback |
| Lukas | [Wiki audio](https://mobile-legends.fandom.com/wiki/Lukas/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio1271-select.ogg) | Ditemukan, belum uji playback |
| Luo Yi | [Wiki audio](https://mobile-legends.fandom.com/wiki/Luo_Yi/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Luoyi.select01.ogg) | Ditemukan, belum uji playback |
| Marcel | [Wiki audio](https://mobile-legends.fandom.com/wiki/Marcel/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Hero1321.selection.ogg) | Ditemukan, belum uji playback |
| Nolan | [Wiki audio](https://mobile-legends.fandom.com/wiki/Nolan/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio1221-select.ogg) | Ditemukan, belum uji playback |
| Novaria | [Wiki audio](https://mobile-legends.fandom.com/wiki/Novaria/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio1191-move06.ogg) | Ada, cek jenis voice |
| Obsidia | [Wiki audio](https://mobile-legends.fandom.com/wiki/Obsidia/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio1301-select.ogg) | Ditemukan, belum uji playback |
| Popol and Kupa | [Wiki audio](https://mobile-legends.fandom.com/wiki/Popol_and_Kupa/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Popolandkupa.select.ogg) | Ditemukan, belum uji playback |
| Silvanna | [Wiki audio](https://mobile-legends.fandom.com/wiki/Silvanna/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Silvanna.select01.ogg) | Ditemukan, belum uji playback |
| Sora | [Wiki audio](https://mobile-legends.fandom.com/wiki/Sora/Audio) | — | Halaman masih kosong |
| Suyou | [Wiki audio](https://mobile-legends.fandom.com/wiki/Suyou/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio1261-select.ogg) | Ditemukan, belum uji playback |
| X.Borg | [Wiki audio](https://mobile-legends.fandom.com/wiki/X.Borg/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio831-select.ogg) | Ditemukan, belum uji playback |
| Yi Sun-shin | [Wiki audio](https://mobile-legends.fandom.com/wiki/Yi_Sun-shin/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Yss.id.select.ogg) | Ditemukan, belum uji playback |
| Yu Zhong | [Wiki audio](https://mobile-legends.fandom.com/wiki/Yu_Zhong/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio951-select.ogg) | Ditemukan, belum uji playback |
| Zetian | [Wiki audio](https://mobile-legends.fandom.com/wiki/Zetian/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio1291-select.ogg) | Ditemukan, belum uji playback |
| Zhuxin | [Wiki audio](https://mobile-legends.fandom.com/wiki/Zhuxin/Audio) | [File .ogg](https://mobile-legends.fandom.com/wiki/File:Audio1251-select.ogg) | Ditemukan, belum uji playback |

**Penting:** halaman `File:` menampilkan informasi berkas audio, bukan jaminan hak untuk mengunduh, me-rehost, membuat proxy, atau memakai dalam game publik. Jangan menjadikan hasil pencarian otomatis sebagai lisensi.

### E. Integrasi sumber dalam schema data

```json
{
  "id": "aamon",
  "name": "Aamon",
  "clues": [
    {
      "level": 1,
      "type": "lore",
      "text": "Hero ini berasal dari keluarga bangsawan Paxley.",
      "sourceUrl": "https://mobile-legends.fandom.com/wiki/Aamon",
      "verifiedAt": "2026-11-11",
      "verifiedForPatch": null,
      "reviewStatus": "needs_editor_review"
    }
  ],
  "audio": {
    "language": "en",
    "type": "hero_selection_default",
    "referencePage": "https://mobile-legends.fandom.com/wiki/Aamon/Audio",
    "fileInfoPage": "https://mobile-legends.fandom.com/wiki/File:Aamon.select.ogg",
    "localAssetPath": null,
    "licenseStatus": "not_verified",
    "playbackStatus": "not_tested",
    "enabled": false
  }
}
```

**Catatan teknis:** contoh di atas adalah desain schema, bukan file siap produksi. Simpan URL sumber referensi untuk audit, tetapi jangan mengisi `audio.src` dengan URL pihak ketiga tanpa verifikasi akses, izin, dan kebijakan host. Revisi komponen agar audio opsional, tombol nonaktif jika belum siap, dan jawaban tetap dapat ditebak melalui clue teks.

### F. Persyaratan legal dan operasional

- Hak cipta atas karakter, suara, musik, efek, dan karya visual MLBB berada pada pemilik kontennya menurut ketentuan Moonton: https://mlbbesports.com/legal/terms (lihat *Ownership of Games and Game Content*).
- Fandom merupakan situs yang **memuat** dan mengindeks media, bukan otomatis pemegang lisensi yang bisa mengizinkan penggunaan aset audio MLBB. Atribusi saja tidak menggantikan izin.
- Utamakan membangun game **tebak berbasis teks + UI orisinal** terlebih dahulu. Audio merupakan fitur opsional setelah izin/ketentuan penggunaan jelas.
- Jika tidak ada izin atau sumber audio stabil, gunakan voice cue teks hasil parafrasa dan jangan meng-host ulang voice line asli.

### G. Acceptance criteria konten

- Setiap clue aktif mempunyai URL sumber yang benar dan tipe fakta yang teridentifikasi.
- Clue patch-dependent mempunyai label patch/tanggal verifikasi, tidak diterbitkan bila belum diverifikasi.
- Data audio mempunyai `language`, `type`, `referencePage`, `licenseStatus`, `playbackStatus`, dan fallback teks.
- `audio.enabled` tidak aktif sebelum hak pakai dan pemutaran diuji.
- Checklist 26 audio kosong diselesaikan atau diberi fallback yang eksplisit, tanpa mengisi URL asal.

## 9. Arsitektur Teknis & Migrasi

**Tetap gunakan:** React + Vite, Tailwind, Zustand, Firebase Auth/Firestore, Framer Motion seperlunya. Pertimbangkan PWA setelah rilis stabil. Hilangkan dependensi tak terpakai setelah tree-shaking/lint dan review import.

**Usulan domain structure:**

```text
src/
  app/             # router, providers, layout
  features/
    hero-guess/    # logic, components, pages, tests
    multiplayer/   # lobby, room transactions, reconnect
    progression/   # profile, stats, achievements
  data/            # hero dataset and validation
  shared/          # UI primitives, theme, analytics
  styles/          # tokens
```

**Online fix prioritas:** Perbaiki mismatch write `room.state.*` dengan `updateDoc` root; evaluasi `customSettings` co-op sebelum menulis ke Firestore; gunakan transaksi untuk create/join room, update skor, dan penyelesaian pertandingan; tetapkan room TTL, disconnect UX, player-only authorization dan validasi event. Untuk ranking kompetitif, server wajib mengotorisasi jawaban; dataset dalam browser dapat diinspeksi pengguna.

**Keamanan:** hentikan `api/proxy-audio` yang mengambil URL arbitrer. Jika audio berizin diperlukan, gunakan daftar aset/host tepercaya, pembatasan URL, redirect, ukuran, MIME, timeout, cache, dan rate-limit. Audit Firestore Security Rules (tidak terlihat dalam repo) dan hindari penyimpanan profil lebih dari yang diperlukan. Jangan menganggap Firebase client API key sebagai password; keamanan akses ditentukan Auth/Rules.

**Migrasi repo:**
1. Buat branch `refactor/mlbb-only` dan tag/backup keadaan lama; inventarisasi Firestore sebelum perubahan.
2. Pindahkan/arsipkan bank soal Inggris, mode game non-MLBB, pohon/tabungan/CEFR, routing lama. Jangan hapus data server sebelum disetujui.
3. Rebrand package, app shell, SEO, favicon, README, design tokens, dan domain bila perlu.
4. Refaktor hero data dan Solo; tes unit normalizer, scoring, shuffle, state machine, dan happy/error paths.
5. Tambahkan Gantian; rilis multiplayer setelah tes dua klien dan security review.
6. Deploy staging, ukur error dan UX, lalu lakukan rilis bertahap.

## 10. Pengukuran Keberhasilan

Semua angka berikut merupakan **target rancangan**, bukan hasil aktual; validasi dengan data setelah instrumentasi dan playtest.

| Metrik | Definisi | Target awal untuk diuji |
|---|---|---|
| Start conversion | Pengunjung landing yang mulai satu ronde | ≥ 55% |
| Time-to-first-guess | Waktu dari landing sampai submit tebakan pertama | median ≤ 45 detik |
| Session completion | Sesi yang mencapai result/game over dari sesi dimulai | ≥ 75% |
| Repeat play | Pemain yang memulai sesi kedua pada hari sama | ≥ 25% |
| Unrecognized answer errors | Jawaban sah yang keliru dinilai salah berdasarkan laporan/QA | 0 dalam tes alias resmi |
| Online state divergence | Mismatch scoreboard di dua klien setelah sinkronisasi | 0 pada suite end-to-end |
| Mobile blocking usability defects | Defect yang menghalangi aksi utama di 360px | 0 sebelum release |

**Event analitik minimal:** `game_open`, `mode_selected`, `session_started`, `hero_guess_submitted` (jangan log teks mentah jika tidak perlu), `clue_opened`, `hero_revealed`, `session_completed`, `session_abandoned`, `room_created`, `room_joined`, `room_disconnected`, `error_occurred`.

## 11. Kriteria Rilis (Definition of Done)

- Tidak ada game non-MLBB di UI, route publik, navigasi, deskripsi produk, ataupun konten beranda.
- Seluruh flow Solo dan Gantian terselesaikan pada ponsel dan desktop; back, restart, result, dan persisted stats konsisten.
- Dataset punya validasi otomatis, tidak ada nama duplikat, semua clue aktif terisi, dan fallback aset.
- Tidak ada klaim bahwa karya ini game resmi MLBB; aset pihak ketiga berlisensi sesuai penggunaan.
- Tidak ada SSRF endpoint, kebijakan Firebase telah direview, dan reward atomik/idempotent.
- E2E multi-tab/multi-device lulus sebelum Co-op/Duel tersedia publik.
- README, environment setup, deploy instructions, cara menguji, dan changelog sesuai struktur baru.

## 12. Keputusan Produk yang Direkomendasikan

**Pertahankan 1 core game:** Tebak Hero dari petunjuk. Jadikan Solo default dan Gantian opsi sosial sederhana; kemudian Co-op/Duel menjadi opsi online setelah state sync selesai. **Buang** seluruh kategori game umum dan konteks DuoBloom. Gunakan nama **Hero Hunt** sebagai placeholder; bisa diganti setelah validasi nama/identitas. Bangun visual khas fan-game tanpa mengambil aset resmi di luar hak penggunaannya.

## Lampiran: Rujukan

**Repository:** https://github.com/suryawinaldi/wordbound

**Sumber kode yang diperiksa:** `src/router.jsx`, `src/views/MLGuessPage.jsx`, `src/views/games/MLCoopPage.jsx`, `src/views/games/MLDuelPage.jsx`, `src/data/ml-heroes.js`, `src/stores/room.js`, `src/stores/player.js`, `src/components/GameLayout.jsx`, `src/components/MultiplayerLobby.jsx`, `src/views/SplashPage.jsx`, `src/views/DashboardPage.jsx`, `src/views/StatsPage.jsx`, `api/proxy-audio.js`, `index.html`, `package.json`.

**Ketentuan kepemilikan dan pemanfaatan konten MLBB:** https://mlbbesports.com/legal/terms

**Katalog hero resmi:** https://www.mobilelegends.com/hero/list

**Daftar sumber clue/audio dan temuan 26 audio kosong:** lihat §8A. Versi tracker data: `MLBB_Tracker_26_Audio_Belum_Ada.csv`.
