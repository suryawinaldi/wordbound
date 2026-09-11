# Implementation Plan: Mabar Tebak Hero ML (Co-op & Duel)

Permintaan ini akan membawa mode "Tebak Hero ML" ke tingkat selanjutnya dengan menambahkan sistem *Online Multiplayer* (Room Code) khusus untuk Hero MLBB.

## User Review Required
> [!IMPORTANT]
> Karena logika game *Solo* dan *Online* sangat berbeda, saya akan membuat sistem ini menjadi mode terpisah agar tidak merusak game Solo yang sudah stabil. Ada dua mode Online yang akan dibangun:

## Proposed Changes

### 1. Mode 1: Co-op (Kerja Sama Tim)
- **Konsep:** Host dan Guest bermain di layar masing-masing, tapi menggunakan **nyawa yang sama** dan **streak yang sama**.
- **Mekanik:** 
  - Host memilih tingkat kesulitan (Easy/Medium/Hard/Nightmare) saat membuat Room.
  - Jika pemain A menekan "Buka Clue", clue di layar pemain B juga akan terbuka.
  - Keduanya bisa mengetik jawaban. Siapa yang mengetik dengan benar, poin/streak tim akan bertambah.
  - Jika jawaban salah, nyawa tim berkurang.
- **Achievement Bersama:** Jika tim mencapai *Streak 30* atau *Perfect 133*, **kedua pemain** akan mendapatkan Medali (*Badge*) tersebut di Profil masing-masing! Persahabatan (atau percintaan) yang sesungguhnya!

### 2. Mode 2: Duel (Balapan Hero)
- **Konsep:** Adu mekanik murni. Siapa yang paling banyak dan paling cepat menebak hero dengan benar.
- **Mekanik:**
  - Tidak ada sistem nyawa (HP). Targetnya adalah: **Siapa yang mencapai 10 Poin pertama kali, dia menang.**
  - Kedua pemain melihat hero dan *clue* yang sama.
  - **Sistem Clue:** Siapapun bisa menekan tombol "Buka Clue" dan clue itu akan terbuka untuk keduanya.
  - **Sistem Penebakan:** Jika pemain A menebak benar, A dapat 1 poin, dan hero langsung berganti ke hero berikutnya untuk kedua pemain.
  - **Hukuman:** Jika menebak SALAH, pemain tersebut terkena efek *Stun* (layarnya beku/tidak bisa menebak selama 3 detik), memberikan kesempatan lawan untuk menebak!

### 3. Pembaruan Halaman Menu & Statistik
#### [MODIFY] `src/views/MLGuessPage.jsx`
- Merombak menu awal:
  - **Main Solo**
  - **Main Mabar (Online Room)** -> Cabang ke *Co-op Tim* atau *Duel Balapan*.

#### [MODIFY] `src/views/StatsPage.jsx`
- Menambahkan statistik baru di menu Mabar:
  - **Menang ML Duel** (Jumlah kemenangan di mode Balapan).
  - **Co-op Max Streak** (Rekor streak tertinggi saat bermain mode Tim).

## Verification Plan
1. Membuat antarmuka Lobby khusus untuk Mode Mabar ML.
2. Memverifikasi sinkronisasi state Firebase (Clue sinkron, Hero sinkron).
3. Menguji efek *Stun* (beku 3 detik) di Mode Duel jika tebakan salah.
4. Memverifikasi bahwa di mode Co-op, memenangkan *Streak 30* akan menembakkan perintah `awardAchievement` ke *database* kedua pemain sekaligus.
