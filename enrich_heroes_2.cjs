const fs = require('fs');

const CLUES_DB = {
  // BATCH 2
  "Bane": [
    "Bajak laut yang awalnya manusia gurita, kemudian direvamp menjadi makhluk ikan hijau biru gemuk.",
    "Bisa menembakkan meriam jarak jauh dan menyemburkan air liur (Ale).",
    "Ultimate-nya memanggil kawanan ikan hiu untuk menerjang musuh atau menghancurkan turret."
  ],
  "Carmilla": [
    "Support berdarah vampir yang merupakan belahan jiwa Cecilion.",
    "Bisa berputar menggunakan bunga merah tua untuk mencuri physical dan magic defense musuh.",
    "Ultimate-nya merantai musuh sehingga jika satu terkena damage atau stun, yang lain akan ikut merasakannya."
  ],
  "Chang'e": [
    "Mage cilik imut penunggang bulan sabit peliharaan (kelinci).",
    "Sangat mengandalkan perisai bulan (Crescent Moon) untuk membuat serangannya menjadi sakit.",
    "Ultimate-nya adalah semburan hujan meteor jarak jauh seperti senapan mesin (Meteor Shower)."
  ],
  "Chip": [
    "Hero Support pengunyah keripik kentang.",
    "Memiliki hovercraft melayang sebagai kendaraannya.",
    "Sangat licin dengan portal ajaib yang bisa memindahkan teman-teman dari satu sisi map ke sisi lain."
  ],
  "Cici": [
    "Fighter ceria pengguna senjata Yo-yo.",
    "Sangat lincah melompat ke sana kemari sambil terus memukul.",
    "Ultimate-nya dapat menyambungkan dua musuh dengan tali, membuat keduanya menerima damage secara bersamaan."
  ],
  "Claude": [
    "Marksman pencuri terkenal yang selalu ditemani Dexter (monyetnya).",
    "Sangat ditakuti di late game jika sudah memakai item Demon Hunter Sword dan Golden Staff.",
    "Bisa bertukar posisi dengan hologram bayangan monyetnya."
  ],
  "Clint": [
    "Marksman koboi sheriff bersenjata revolver dan laras panjang.",
    "Setiap menggunakan skill, tembakan peluru dasarnya menembus musuh dengan critical sangat sakit.",
    "Ikonik dengan topi koboi dan jaket kulit tebalnya."
  ],
  "Cyclops": [
    "Mage mungil bermata satu penjaga bintang.",
    "Skill keduanya mengeluarkan sekumpulan bola bercahaya yang memutari tubuhnya dan melesat otomatis ke target terdekat.",
    "Ultimate-nya melemparkan bola planet raksasa pengunci pergerakan musuh (Immobilize)."
  ],
  "Diggie": [
    "Support burung hantu pengendali jam.",
    "Jika mati, ia bisa terus berjalan di map sebagai wujud telur kecil dan memata-matai musuh.",
    "Ultimate-nya adalah jam raksasa yang memberikan efek 'Purify' dan shield bagi seluruh tim (Time Journey)."
  ],
  "Dyrroth": [
    "Fighter Pangeran Kegelapan Abyss.",
    "Basic attack-nya akan memperkuat skill-skill tebasannya.",
    "Skill 2-nya bisa menancap ke dada target dan merusak Physical Defense mereka hingga sangat tipis."
  ],
  "Edith": [
    "Hero unik pertama di MLBB yang memiliki role Tank/Marksman murni.",
    "Berdiam dalam tubuh mecha raksasa Phylax, namun aslinya gadis mungil berambut pirang.",
    "Saat ultimate aktif, ia akan keluar dari mecha dan menembakkan serangan petir jarak jauh berturut-turut."
  ],
  "Esmeralda": [
    "Mage/Tank wanita cantik bertema Astrologer yang menggunakan kain selendang bintang.",
    "Satu-satunya hero yang sengaja 'memberi' shield ke musuh, lalu menghisapnya untuk dirinya sendiri.",
    "Semakin banyak shield musuh di dekatnya, ia akan semakin tebal (bahkan bar darahnya penuh dengan shield putih)."
  ],
  "Estes": [
    "Support Raja peri bulan.",
    "Kunci formasi berkerumun (UGD) yang dapat menyalurkan aliran penyembuhan deras tiada henti (Healing).",
    "Selalu dibanned dalam turnamen tier atas karena sangat merepotkan jika tim lawan mengandalkan damage cicilan (Poke)."
  ],
  "Eudora": [
    "Mage wanita penjaga petir asal Magic Academy.",
    "Dikenal dengan julukan 'Ratu Semak-semak' karena sering menciduk (one-shot kill) musuh lengah.",
    "Combo ikoniknya adalah stun bola petir disusul dengan sambaran halilintar dari atas."
  ],
  "Fanny": [
    "Assassin dengan julukan 'Hero Darat terbang' jika player-nya lincah.",
    "Mengandalkan kabel-kabel lempar mirip alat manuver 3D (ODM Gear) di anime Attack on Titan.",
    "Tingkat kesulitan penggunaannya paling maksimal (10/10) karena harus menghafal letak dinding dan titik pantulan."
  ],
  "Faramis": [
    "Mage penyihir ahli Necromancy pelindung Vexana yang tersakiti.",
    "Bisa masuk dalam mode roh untuk mengejar dan menarik musuh layaknya tali tambang.",
    "Ultimate-nya memberikan altar perlindungan dengan lapis darah putih tambahan bagi seluruh rekan setim yang sedang sekarat."
  ],
  "Floryn": [
    "Support gadis Oasis mungil bercahaya hijau.",
    "Mampu berbagi item rahasia (Lantern) dengan satu anggota tim dari awal permainan.",
    "Ultimate-nya me-restore (mengisi) HP teman satu tim seketika di mana pun posisi kawan tersebut di peta."
  ],
  "Franco": [
    "Tank dari laut utara (Northern Vale) bersenjatakan jangkar/kait.",
    "Sangat ikonik dengan kemampuannya memancing dan menarik core lawan dari jarak jauh (Iron Hook).",
    "Ultimate-nya (Supress) mencabik-cabik target di tempat, dan merupakan salah satu CC tertinggi yang tidak bisa dipurify."
  ],
  "Fredrinn": [
    "Fighter/Tank tank jungler meta andalan dengan pedang tajam merah (kristal muda).",
    "Darah abu-abunya menumpuk setiap ia dipukul, membuatnya sulit ditebak berapa sisa HP sebenarnya.",
    "Sangat terkenal dengan jurus pukulan area yang makin sakit jika HP-nya makin rendah (Taunting Appraiser)."
  ],
  "Freya": [
    "Fighter valkyrie bersayap biru/putih dari Northern Vale.",
    "Jika bar bulat (orb)-nya penuh, combo pukulan dan lompatannya (Valkyrie Descent) tidak ada cooldown.",
    "Ultimate-nya membuatnya melayang dengan jangkauan senjata yang makin lebar, plus shield sangat tebal."
  ],
  "Gatotkaca": [
    "Tank berkarakter ksatria otot kawat tulang besi dari legenda nusantara (Indonesia).",
    "Skill pertamanya membelah tanah, sementara skill duanya mengejek target terdekat (Taunt).",
    "Bisa melompat dan mendarat dari udara jauh dengan area pijakan besar yang mementalkan musuh (Avatar of Guardian)."
  ],
  "Gloo": [
    "Tank lendir makhluk ungu misterius.",
    "Saat ultimate aktif, dia akan hancur jadi sekumpulan lendir/ulat kecil dan bisa menempel permanen di atas tubuh satu musuh.",
    "Kalau ada target yang berhasil ditempeli, hero itu bakal menyerap porsi damage yang dialami oleh Tank ini."
  ],
  "Gord": [
    "Mage dosen terbang yang naik hoverboard layaknya Silver Surfer.",
    "Bisa melemparkan bola-bola magis pemantul.",
    "Tembakan ultimate-nya berbentuk laser energi mistis berdurasi lurus tanpa henti."
  ],
  "Granger": [
    "Marksman gothic pemain biola dengan satu koper alat musik (berisi pistol).",
    "Selalu hanya memiliki 6 peluru, di mana peluru ke-6 selalu memberikan damage kritikal pasti.",
    "Jurus andalannya (Death Sonata) menembakkan tiga super peluru eksplosif berdaya ledak sangat masif dari jarak jauh."
  ],
  "Grock": [
    "Tank raksasa benteng alam / golem bebatuan kuno.",
    "Kebal efek crowd control ketika ia merapat (menempel) di sekitar turret atau tembok alam mana pun.",
    "Kemampuan utamanya bisa membangun dinding bongkahan batu tiba-tiba yang menutup akses lorong di jungle."
  ],
  "Guinevere": [
    "Fighter/Mage penyihir muda dari keluarga Baroque (adik perempuan Lancelot).",
    "Bisa melompat dari semak (Spatial Migration) dan mementalkan target ke udara (Airborne) secara dadakan.",
    "Tarian (Ultimate) bunganya berantai dan sangat ditakuti sebelum hero support membawa item Purify."
  ],
  "Gusion": [
    "Assassin/Mage tampan pelempar berpuluh-puluh pedang belati tajam.",
    "Mekanik jarinya sering diuji untuk combo melempar belati - dasbor maju - tarik belati dengan cepat (Fast Hand).",
    "Sangat mendominasi pertempuran awal tapi rentan di fase late-game jika belatinya meleset semua."
  ],
  "Hanabi": [
    "Marksman ninja sekte Scarlet wanita dengan bunga merah.",
    "Satu-satunya MM yang tembakan panah kelopaknya bisa menjalar dari satu minion ke minion lain berulang-ulang tanpa cooldown.",
    "Jika tameng (shield) miliknya aktif, dia tidak akan terpengaruh sama sekali oleh stun/CC pertama (Ninjutsu: Equinox)."
  ],
  "Hanzo": [
    "Assassin berpenampilan iblis yang memegang pedang taring Ame no Habakiri.",
    "Bisa memakan monster buff utuh-utuh hanya dalam hitungan detik (Demon Feast).",
    "Jika ultimate-nya nyala, wujud darah aslinya bersembunyi aman sementara bayangan hantunya melesat menyerang bebas."
  ],
  "Harith": [
    "Mage Leonin kecil lincah yang sangat lincah karena spam dasbor.",
    "Memberikan pilar berbentuk pedang silang biru di atas tanah (Zaman Force) untuk mereset cooldown dasbornya berkali-kali.",
    "Serangannya bertipe burst dari pendaratan dasar usai melakukan lompatan dimensi."
  ],
  "Harley": [
    "Mage/Assassin tukang sulap kartu dengan topi ajaib.",
    "Bisa menembakkan rentetan tiga lapis kartu poker dari topinya.",
    "Ultimate-nya melemparkan lingkaran cincin api (Deadly Magic). Kerusakan yang dicicil akan diakumulasi saat cincin meledak di akhir."
  ],
  "Hayabusa": [
    "Assassin Ninja gelap penutup wajah dari klan Shadow.",
    "Bisa membelah diri (Quad Shadow) ke empat arah depan/belakang/kiri/kanan dan ber-teleport di antaranya.",
    "Ultimate-nya (Ougi: Shadow Kill) menebas target berulang kali tanpa bisa disentuh/dilihat sedikit pun (I-frame)."
  ],
  "Helcurt": [
    "Assassin siluman alien kegelapan dengan ekor capit kalajengking besar.",
    "Jika dipukul dengan CC musuh, pasifnya otomatis menyegel/silence skill target yang menyerangnya (Race Advantage).",
    "Membawa efek buta (gelap gulita) ke seluruh layar/map dan menyembunyikan posisi tim selama ultimate-nya dipencet."
  ],
  "Hilda": [
    "Fighter/Tank penjaga gurun kasar (Meglith) dengan kapak buatan batu.",
    "Daripada bolak-balik markas/base (Recall), ia akan memulihkan darahnya secara instan jika berdiri di dalam rerumputan/bush.",
    "Makin banyak ia mengeksekusi musuh, ultimate kapaknya akan bertambah maksimal (tumpukan 8x Max stack)."
  ],
  "Hylos": [
    "Tank Centaur dari ras mistis (manusia berbadan bagian bawah kuda).",
    "Memiliki kolam pasif pertahanan di sekitarnya yang memperlambat attack speed lawan secara gila-gilaan.",
    "Saat mana (bar biru)-nya habis, bar hijau (HP/Darah) akan otomatis digunakan sebagai pengganti biaya skill."
  ],
  "Irithel": [
    "Marksman pemburu liar, dibesarkan bersama makhluk sabertooth besar bernama Leo.",
    "Berbeda dari semua hero penembak jauh lainnya, panahnya ditembakkan sambil lari menunggangi tanpa harus berhenti (Move & Attack).",
    "Saat marah (Ulti), tembakannya pecah berubah menjadi panah berat dengan daya ledak AoE mematikan."
  ],
  "Ixia": [
    "Marksman saintis jenius berambut pelangi dari kota gurun pasir Eruditio.",
    "Setiap serangannya mengurangi bar nyawa dari senjata laser pipih (Starlium Scythe) bukan tembakan peluru kecil.",
    "Ultimate-nya membentangkan area segitiga prisma raksasa yang menyedot dan menembaki target sekaligus dari jangkauan tak tersentuh."
  ],
  "Jawhead": [
    "Fighter berwujud armor robot berat penolong, dengan anak kecil memanjat di kepalanya.",
    "Kemampuan melempar (Ejector) menjadi andalannya—sering dikonotasikan menyebalkan jika ia sengaja melemparkan (troll) temannya ke turet lawan.",
    "Punya tembakan rudal/roket kecil (Smart Missiles) pelacak yang terbang jika ia berada dalam radius lawan."
  ],
  "Johnson": [
    "Tank robot besi balap bertemakan Autobot atau Transformer biru.",
    "Makin tebal pertahanan fisiknya, maka semburan kunci pas elektrik yang ia hempaskan kian terasa sakit.",
    "Keahlian paling ikoniknya adalah berubah menjadi 'Mobil' lalu menyusuri map membawa boncengan sebelum akhirnya 'tabrak lari' menabrak musuh (Rapid Touchdown)."
  ],
  "Joy": [
    "Assassin/Mage berwujud manusia kucing Leonin beraliran Flash.",
    "Damage tertingginya (Rhythm of Lightning) bergantung pada pemain yang harus menekan ketukan ritme/musik layaknya game 'Dance/Osu'.",
    "Saat ia mengenai beat sempurna (Perfect), dirinya jadi tidak tertarget (Immune) plus ulti-nya terbuka lebar bersinar kuning/biru."
  ],
  "Julian": [
    "Fighter/Mage penyendiri dari Raven, menguasai 3 jenis senapan sabit/pedang/rantai sekaligus.",
    "Merupakan salah satu pengecualian di MLBB yang 'TIDAK PUNYA' level ultimate, semua max skill ada di level dasar dengan 3 varian kombinasi kombo berbeda.",
    "Punya pasif hisapan sihir (Magic Lifesteal) tingkat tinggi saat pukulan terakhir dari setiap kombinasinya pecah."
  ],
  "Kadita": [
    "Mage perwujudan mitos penguasa Pantai Selatan Nyi Roro Kidul.",
    "Kemampuannya mencakup terjun ke bawah tanah membentuk aliran gelombang (Tsunami) lalu mementalkan musuh di atas pusaran.",
    "Saat menyelam bebas, ultimate Ombaknya meledak dan menyebar mematikan (Ocean Oddity)."
  ],
  "Kagura": [
    "Mage elegan asal klan Onmyoji berbekal sebuah Payung Seimei (Seimei Umbrella).",
    "Payungnya merupakan perantara (Anchor) utama serangannya. Memainkan kombo melempar, berkedip maju menyusulnya, memutar (Yin Yang Overturn), dan meloloskan diri kembali.",
    "Tergolong hero anti-CC jika skill teleportnya mengenai payungnya kembali."
  ],
  "Kaja": [
    "Support/Fighter makhluk penjaga cahaya berwujud hibrida manusia dan burung berbulu emas.",
    "Jebakannya berupa tali sihir pecut/cambuk bercahaya.",
    "Kunci aslinya terletak pada (Divine Judgement), ultimatenya mengikat dan menculik paksa (menyeret) core utama lawan meskipun dibalut Purify (efek Suppress)."
  ],
  "Karina": [
    "Assassin Mage dari klan Elf dengan pedang pisau ganda (Twin Blade).",
    "Skill pertamanya bisa berputar dan menangkal semua pukulan mematikan dari Marksman (Immune Basic Attack).",
    "Skill ulti dan CD-nya me-reset (berulang secara instan) sesaat jika ia ikut serta meraih poin 'Kill' atau 'Assist' berturut-turut (Dance of Death)."
  ],
  "Karrie": [
    "Marksman pemecah rekor anti-Tank terbaik, melempar dua buah Shuriken/Roda Cahaya berulang.",
    "Karena pasif ikoniknya memberikan serapan (True Damage) per sekian tumpukan roda, tank setebal apapun baginya ibarat menembak kertas tisu.",
    "Saat ultimate-nya (Speedy Lightwheel) dipakai, kecepatannya berjalan bertambah sekaligus melempar piringan ganda di setiap basic attack."
  ],
  "Khaleed": [
    "Fighter klan perompak dan penguasa padang pasir Agelta Drylands.",
    "Senjatanya berbentuk bilah melengkung gurun. Pasif jalannya memperbolehkannya 'meluncur' di pasir di atas map tanpa repot (Sand Walk).",
    "Skill keduanya (Quicksand Guard) membenamkannya diri meregenasi perisai masif hingga nyaris tak tembus dengan damage fisik."
  ],
  "Khufra": [
    "Tank Firaun penyebar kutukan yang dibalut perban mumi (Bandages).",
    "Jagoan alami melawan segala hero lincah bertipe dash (Fanny, Lancelot, Ling) berkat kemampuannya berubah menjadi Bola Pantul yang melumpuhkan gerakan kelenturan (Bouncing Ball).",
    "Ulti tamparan/pukulan tirannya (Tyrant's Revenge) memaksa menghajar lawan masuk menempel jelek ke arah dinding/tembok luar."
  ],
  "Kimmy": [
    "Marksman sekaligus Mage penembak kimia yang menggunakan Joystick kembar layaknya game 'Contra'.",
    "Penembak peluru cipratan terus-menerus tiada henti namun kesulitan untuk lock target secara otomatis.",
    "Tembakan utamanya (Maximum Charge) sangat jauh jarak ledaknya meskipun bisa meleset."
  ],
  "Lancelot": [
    "Assassin tampan dengan pedang rapier, ahli menari dari keluarga ksatria Baroque.",
    "Gerakannya paling ditakuti (Puncture & Thorned Rose) karena merangkai formasi segitiga tajam dengan kondisi anti-diserang (Immune/Invincible).",
    "Gaya mainnya membutuhkan jari secepat kilat agar tusukan perdananya reset (tak ber-cooldown)."
  ],
  "Lapu-Lapu": [
    "Fighter pahlawan inspirasi riil, kemerdekaan dari Filipina.",
    "Senjata pedang kembarnya (Twin Blades) dipakai mencicil lawan di fase pertama.",
    "Bila amarah kepahlawanannya pecah, dua pedangnya tergabung jadi pedang godam raksasa dengan animasi tebas gempa keras dan durabilitas (Bravery) berlapis ganda."
  ],
  "Layla": [
    "Marksman paling bersejarah, sang pemandu tutorial game (Energy Gunner).",
    "Kelemahannya (tak punya satupun skill lari/escape) ditutupi oleh serangan tembak pasifnya yang semakin fatal jika ditembak makin jauh (Malefic Gun).",
    "Tembakan laser (Destruction Rush) raksasanya lurus melebarkan daya tembak sekaligus menambah jarak pasifnya secara signifikan di akhir game."
  ],
  "Leomord": [
    "Fighter ksatria kiamat (Undead Knight) berpedang gelap dari Fortress of Despair.",
    "Jika musuh punya nyawa/bar merah kritis di bawah setengah (50%), maka setiap pukulannya dipastikan jadi Critical mutlak.",
    "Begitu memanggil lalu menunggangi kuda barbielnya, serangannya langsung merambat jadi tebasan memutar."
  ],
  "Lesley": [
    "Marksman 'sniper' cantik dengan penutup satu mata.",
    "Kemampuan pasifnya (Lethal Tear) membuat dorongan tembakan jarak sangat jauh yang jika meledak adalah penembus mutlak (Critical True Damage).",
    "Ultimatenya (Ultimate Snipe) mendeteksi paksa dan mengunci semua musuh rahasia di area sekitar lalu melepaskan beruntut proyektil terkunci."
  ],
  "Ling": [
    "Assassin ahli Kung-fu muda pembawa pedang cyan dari klan Oriental (Finch).",
    "Kemampuan pasif absolutnya yakni melompat memanjat dan menyusuri tepian dinding/tembok/pilar map sesuka hati (Finch Poise).",
    "Ultimatenya menebas menyilang 4 penjuru angin dengan pisau jatuh ke tanah (Tempest of Blades). Jari 'Fast Hand' wajib mengambil semua 4 bilah pisau tersebut dalam satu kedipan mata."
  ],
  "Lolita": [
    "Support elf mungil pelindung baja yang dibekali Hammer Godam Raksasa.",
    "Telah di-revamp, perisainya (Guardian's Bulwark) bisa mencerminkan tembakan MM, dan mage dengan damage dan lintasan aslinya dibalik berbalik musuh.",
    "Ultimatenya mengumpulkan daya getaran lalu menghantam lantai mementalkan banyak musuh, tapi beresiko jika diinterupsi oleh musuh sebelum daya penuh."
  ],
  "Lunox": [
    "Mage cantik pengontrol dua kubu kosmik (Kekuatan Orde/Cahaya dan Kekacauan/Malam).",
    "Saat masuk pada mode kubu malam, proyektilnya menyedot bar tank sangat cepat tiada batas (tanpa CD).",
    "Sedangkan pada mode siang cahayanya (Brilliance), ia menjelma sekumpulan bulu pijar keemasan (I-frame) tak bisa diserang sedikitpun saat lari dari bahaya."
  ],
  "Luo Yi": [
    "Mage misterius oriental berwajah sendu yang merepresentasikan logo lingkaran keseimbangan.",
    "Serangan perdananya diwarnai marka simbol Yin & Yang (hitam/kuning emas), saat kedua marka tersebut dibenturkan musuh langsung melebur/meledak ke tengah menyatu secara fatal.",
    "Keistimewaan luar biasanya (Diversion) membuat portal lingkaran besar yang menteleportasikan teman secara tiba-tiba untuk menggerebek satu base lawan."
  ],
  "Lylia": [
    "Mage cilik gelap ahli sekolah sihir, dibuntuti makhluk rakus/boneka hidupnya (Gloom).",
    "Melontarkan ranjau mekar (Magic Shockwave) dalam tanah, yang bila diledakkan bersama Gloomnya beruntun dari level kecil menjadi ranjau raksasa membahayakan (Slow + Burst Damage).",
    "Saat dirinya tertekan dan darahnya menipis/sekarat, ia memiliki sepasang sepatu (Black Shoes) penunjuk masa lalunya untuk 'Undo' kembali bugar (nyawa utuh) ke lokasi 4 detik yang lampau."
  ],
  "Marcel": [
    "Hero Support pengontrol zona waktu/batas peredam (shield pasif pereduksi burst) (terkini).",
    "Sangat melindungi tim dari assassin pembunuh berkat barrier taktilnya.",
    "Pilihan bijak di saat Draft Pick turnamen tier atas di meta terkini."
  ],
  "Martis": [
    "Fighter bermata nyala sang Ashura penguasa seribu dunia.",
    "Menyapu barisan musuh pakai sabetan pedang ganda gerigi bersilang tanpa rasa takut sedikitpun terhadap efek pelumpuh gerak (Crowd Control Immunity) di jurus ke-2.",
    "Bila Ultimatenya/Eksekusinya ('Decimation') sukses membunuh musuh bertanda sekarat, kakinya langsung melesat kencang dan ultimatenya pun terbuka/tersedia kembali untuk mencincang mangsa lain."
  ],
  "Masha": [
    "Fighter berwujud gadis buas dengan gaya tarung pukulan cakar beruang tebal di kedua tangan.",
    "Keunikan terbesarnya adalah tiga buah bilah darah (HP bar merah tebal 3 lapis bertumpuk di atas namanya) menolak tumbang seketika.",
    "Berkat gaya tarungnya ia menjadi eksekutor nomor satu pencuri Menara Turet/Lord berkat kecepatan basic attack pasif yang tidak masuk akal (Roar)."
  ],
  "Mathilda": [
    "Support/Assassin dari suku bebas padang Agelta yang membangkitkan elang leluhur.",
    "Mampu menculik angin dengan melepaskan pusaran pendar yang melayang dan mencicil di dekat musuh.",
    "Salah satu keajaibannya, timnya bisa mengeklik satu tombol tambahan misterius (Guiding Wind) di atas layar untuk mendadak terbang bersatu lari ke pangkuannya."
  ],
  "Melissa": [
    "Marksman perempuan penjahit dengan jarum paku dari kota Moniyan.",
    "Berkomunikasi dengan boneka kutukan (Muddles) yang dijahit. Begitu lawannya dan boneka digabungkan berdekatan, menusuk si bonekalah jauh lebih menyakitkan tinimbang hero aslinya.",
    "Mencegah assassin penculik dengan jurus ulti jubah perlindungan mutlak (Go Away) yang mementalkan siapapun (kecuali tembakan peluru jarak jauh) menerobos."
  ],
  "Minotaur": [
    "Tank banteng ksatria dari kerajaan labirin Minoan pelayan dewa alam.",
    "Tak butuh bar mana hijau murni, sebab pasifnya bergantung penuh pada kemarahan merah memuncak/berkobar (Rage/Enrage State).",
    "Bila sedang merah meledak menyapu gempa lantai, pukulan palunya merentangkan pementalan area (Knockup Tiga Kali), seraya menabur regenerasi (Heal) bagi skuad (rekan/aliansinya)."
  ],
  "Minsitthar": [
    "Fighter jenderal pangeran berdarah kerajaan timur Mahar Pura berlapis emas bersenjatakan tombak (Spear).",
    "Sangat berbahaya dalam pertarungan tim lantaran pasif emas dan pengawalnya mampu memanggil pasukan tombak melingkar raksasa (King's Calling).",
    "Begitu formasi tamengnya terbuka di lantai, segala kemahiran kabur (Dash / Flicker / Lompat Lari) musuhnya digembok lumpuh secara utuh."
  ],
  "Miya": [
    "Marksman cantik berdarah Moon Elf putih perak melengkung pelindung bangsa Hutan.",
    "Hembusan memanahnya secepat kilat (Turbo Stealth) dengan anak panah menjalar membelah memecah 3 target usai melempar sinar bulan purnama biru.",
    "Andai dirinya ter-stun musuh atau terancam disergap dalam pertempuran rumput, tombol ketiga ultimatenya mencerahkannya memudar masuk siluman murni dari radar mini map dengan laju kilat tersembunyi (Hidden Moonlight)."
  ],
  "Moskov": [
    "Marksman pengendali jahanam hitam ungu, pelempar puluhan tombak javelin ganas.",
    "Setiap serpihan pasif tembus dari serangannya meluncur tajam ke belakang musuh (Penetration Hit).",
    "Ulti Spear of Destruction yang dimilikinya membelah ujung pangkal sampai perbatasan peta secara lurus memanjang, di mana (pasca revamp) sosoknya bisa terbang pindah diri langsung dari lokasi di baliknya bila ia menusuk mengenai punggung musuh incarannya."
  ]
};

const heroesSource = require('./src/data/ml-heroes.js').ML_HEROES;

const newHeroes = heroesSource.map(hero => {
  const custom = CLUES_DB[hero.name];
  if (custom) {
    return {
      name: hero.name,
      clues: custom
    };
  }
  return hero; // Leave as is if previously customized
});

const contentStr = "// Auto-generated Detailed Heroes Data (Total: " + newHeroes.length + " Heroes)\\nexport const ML_HEROES = " + JSON.stringify(newHeroes, null, 2) + ";\\n";

fs.writeFileSync('src/data/ml-heroes.js', contentStr);
console.log("Injected detailed lore/skill clues batch 2 successfully!");
