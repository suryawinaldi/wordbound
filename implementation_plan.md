# Rencana Implementasi: Sistem Undang Pasangan & Listen Duel

Karena permintaan ini membutuhkan perubahan mendasar pada sistem *Multiplayer* (agar bisa mengirim undangan langsung tanpa kode) dan penambahan game baru, maka saya membuat rencana teknisnya:

## 1. Sistem Undangan Pasangan (Direct Partner Invite)

Saat ini, bermain dengan pasangan mengharuskan Pemain 1 membuat Room, lalu mengirimkan 6 digit kode ke Pemain 2. Kita akan menyederhanakannya:
- **Di komponen `MultiplayerLobby.jsx`**: Saya akan menambahkan tombol "Ajak Pasangan".
- **Database (Firestore)**: Saat tombol diklik, sistem akan meng-update dokumen Firestore milik *pasangan* Anda dengan data undangan aktif (`invite: { roomId, gameName, hostName }`).
- **Global Listener (`AppShell.jsx`)**: Layar pasangan (yang sedang buka menu apa saja) akan langsung memunculkan *Pop-up/Toast* notifikasi: "Pasanganmu mengajak main [Nama Game]!".
- Pasangan tinggal menekan tombol **"Terima"** dan akan langsung diteleportasi masuk ke dalam *Room* tersebut tanpa perlu mengetik apapun!

## 2. Game Baru: Listen & Type Duel

Kita akan membuat `ListenDuelPage.jsx`.
- **Mekanik**: Kedua pemain mendengar audio bahasa Inggris yang sama secara serentak.
- **Tujuan**: Balapan mengetik ulang kalimat (*Sentence*) bahasa Inggris tersebut.
- **Kondisi Menang**: Siapa yang mengetik dengan benar paling cepat, akan mendapatkan 1 poin dan maju ke ronde/kalimat berikutnya. Yang mencapai 5 atau 10 poin duluan menang!

## 3. Ide-Ide Ekspansi Fitur Pasangan (Couple Features)

Karena Anda bertanya tentang fitur pasangan yang bagus (terutama terkait Pohon Kehidupan), berikut adalah ide-ide fitur yang bisa saya tambahkan nanti untuk membuat akun kalian lebih romantis & kompetitif:

1. **Pohon Cinta (Couple Shared Tree)** 🌳❤️
   - Saat ini Pohon Kehidupan tumbuh berdasarkan tabungan XP masing-masing.
   - Kita bisa membuat pohon kedua khusus di halaman "Couple" yang level dan bentuk buahnya tumbuh berdasarkan **Total XP Gabungan** Anda berdua, atau berdasarkan seberapa sering kalian menyelesaikan *Game Mabar* bersama!
2. **Misi Mingguan Pasangan (Couple Quests)** 📜
   - Misi khusus yang hanya bisa diselesaikan jika berdua. Misalnya: "Capai Streak 30 di ML Guess Co-op" atau "Mainkan 3x Wordle Duel hari ini". Hadiahnya adalah Koin Ekstra untuk berdua.
3. **Kirim Hadiah (Gift System)** 🎁
   - Anda bisa membelikan item dengan Koin Anda dan mengirimkannya ke pasangan (misalnya: Tiket Clue Gratis, atau sekadar Surat/Pesan lucu yang muncul saat dia buka aplikasi).
4. **Emoji Ping (Poke)** 👉👈
   - Tombol cepat di profil pasangan untuk mengirim "Ping" yang akan membunyikan suara notifikasi lucu (atau getar) di HP pasangan secara *real-time*.

---

### Persetujuan Pengguna

Bagaimana dengan rencana **Sistem Undang Pasangan** dan **Listen Duel** di atas? Serta dari ide-ide fitur pasangan (nomor 1-4), mana yang menurut Anda paling menarik untuk diimplementasikan setelah ini? Jika setuju, saya akan langsung kerjakan sistem undangannya!
