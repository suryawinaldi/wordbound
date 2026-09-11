const fs = require('fs');

const BATCH_1_2_3 = {
  "Aamon": [
    "Masuk ke mode kamuflase (menghilang) dan memulihkan HP setelah mengenai musuh dengan skill.",
    "Melemparkan 'shard' atau belati sihir yang berjatuhan di tanah dan bisa ditarik kembali.",
    "Merupakan kakak laki-laki dari Gusion dalam cerita lore keluarga Paxley."
  ],
  "Akai": [
    "Berwujud panda besar yang membawa tongkat bambu dan sangat menyukai makanan.",
    "Ultimate-nya membuatnya berputar seperti gasing, mementalkan musuh yang kena.",
    "Sering dipasangkan dengan spell Petrify untuk menjepit musuh ke tembok."
  ],
  "Aldous": [
    "Hero late-game yang damage pukulannya bergantung pada jumlah 'Stack' yang ia kumpulkan.",
    "Pukulan tangannya membesar dan bisa menghancurkan turret maupun musuh dengan cepat.",
    "Ultimate-nya bisa membuka vision semua musuh dan terbang melintasi map untuk menabrak target."
  ],
  "Alice": [
    "Mage/Tank penghisap darah yang sangat tebal jika memiliki cukup mana dan stack.",
    "Bisa berteleportasi dengan melemparkan bola darah merah (Flowing Blood).",
    "Ultimate-nya menciptakan lingkaran sihir yang menyedot HP musuh di sekitarnya secara terus menerus."
  ],
  "Alpha": [
    "Manusia buatan (cyborg) dari Laboratorium 1718.",
    "Selalu ditemani oleh robot kecil pendampingnya yang bernama Beta.",
    "Ultimate-nya (Spear of Alpha) menyeret musuh ke depan dengan tombaknya."
  ],
  "Alucard": [
    "Fighter/Assassin spesialis Lifesteal tanpa menggunakan Mana.",
    "Pedang besarnya memberikan regen HP masif saat Ultimate-nya diaktifkan.",
    "Punya julukan lawas 'Feeder' namun sangat mematikan di tangan yang tepat."
  ],
  "Angela": [
    "Support berwujud boneka mekanik perempuan.",
    "Bisa menembakkan benang (Puppet-on-a-String) untuk mengikat dan men-stun musuh.",
    "Ultimate-nya (Heartguard) memungkinkannya merasuki tubuh rekan setim dari ujung map manapun."
  ],
  "Argus": [
    "Fighter yang dikenal sebagai 'Malaikat Jatuh' (Fallen Angel).",
    "Punya pasif menebas beberapa kali dengan cepat saat bar merahnya penuh.",
    "Ultimate-nya membuatnya kebal kematian selama beberapa detik, mengubah damage yang diterima menjadi HP."
  ],
  "Arlott": [
    "Fighter/Assassin yang menggunakan tombak dan memiliki mata iblis.",
    "Skill 2-nya (Vengeance) mereset cooldown jika mengenai musuh yang terkena 'Mark' (tanda).",
    "Ultimate-nya menyapu musuh ke satu sisi secara bersamaan."
  ],
  "Atlas": [
    "Tank berupa gurita kosmik yang mengendalikan mecha besar.",
    "Bisa keluar dari mecha-nya (Perfect Match) untuk bergerak cepat dan membekukan musuh.",
    "Ultimate-nya (Fatal Links) menarik banyak musuh menggunakan rantai dan membanting mereka."
  ],
  "Aulus": [
    "Fighter bertubuh kerdil (Leonin) yang memegang kapak raksasa.",
    "Kapaknya akan terus membesar dan bertambah kuat seiring peningkatan level Ultimate-nya.",
    "Berfokus pada basic attack yang cepat dan lifesteal tinggi di late game."
  ],
  "Aurora": [
    "Mage pengendali es dari Northern Vale yang tubuhnya melayang.",
    "Telah di-revamp: kini bisa membekukan musuh bahkan dengan serangan areanya.",
    "Punya pasif mirip item Winter Truncheon, ia akan membeku (kebal) alih-alih mati sesaat."
  ],
  "Badang": [
    "Fighter asal Malaysia yang mengandalkan pukulan tangan kosong.",
    "Bisa menciptakan dinding batu untuk menjebak musuh.",
    "Ultimate-nya (Fist Crack) melontarkan pukulan bertubi-tubi seperti senapan mesin."
  ],
  "Balmond": [
    "Fighter/Tank dari ras Orc bersenjata kapak raksasa.",
    "Bisa berputar (Cyclone Sweep) untuk mencicil musuh secara terus-menerus.",
    "Ultimate-nya (Lethal Counter) menghempaskan kapak ke tanah untuk mengeksekusi musuh yang sekarat."
  ],
  "Bane": [
    "Bajak laut yang awalnya manusia gurita, kemudian direvamp menjadi makhluk ikan hijau biru gemuk.",
    "Bisa menembakkan meriam jarak jauh dan menyemburkan air liur (Ale).",
    "Ultimate-nya memanggil kawanan ikan hiu untuk menerjang musuh atau menghancurkan turret."
  ],
  "Barats": [
    "Bocah kecil yang menunggangi dinosaurus besar bernama Detona.",
    "Semakin banyak skillnya mengenai musuh, dinosaurusnya akan tumbuh semakin raksasa.",
    "Ultimate-nya menelan satu musuh dan memuntahkannya ke dinding atau teman setim."
  ],
  "Baxia": [
    "Tank yang bergerak meluncur menggunakan perisai roda ganda.",
    "Terkenal sebagai natural counter bagi hero-hero lifesteal/regen berkat pasif anti-heal miliknya.",
    "Berubah menjadi roda api (Tortoise's Puissance) sambil meninggalkan jejak lava."
  ],
  "Beatrix": [
    "Marksman unik yang membawa 4 senjata berbeda (Nibiru, Renner, Bennett, Wesker).",
    "Pemain harus jago membidik karena dia memiliki senapan sniper untuk jarak jauh.",
    "Tidak menggunakan sistem Mana, melainkan sistem reload peluru."
  ],
  "Belerick": [
    "Tank berwujud pohon/makhluk alam raksasa yang ramah.",
    "Memiliki pasif duri yang memantulkan serangan musuh (sering pakai item Blade Armor).",
    "Ultimate-nya menjalar (taunt) memaksa musuh di area sekitarnya menyerang dirinya."
  ],
  "Benedetta": [
    "Assassin wanita mandiri yang selalu bergerak menggunakan 'dash' dari tombol serangannya.",
    "Sangat lincah berkat pasif menahan tombol attack untuk melesat ke depan.",
    "Ultimate-nya (Alecto: Final Blow) menebas area secara berulang dalam garis panjang."
  ],
  "Brody": [
    "Marksman berkulit gelap yang serangannya sangat lambat namun menghasilkan burst damage tinggi.",
    "Bisa mengunci (lock-on) musuh sambil berjalan.",
    "Ultimate-nya (Torn-Apart Memory) memanggil sambaran energi ke semua target yang punya 'Abyss Mark'."
  ],
  "Bruno": [
    "Marksman yang bertemakan olahraga sepak bola.",
    "Serangan utamanya adalah menendang bola terbang yang bisa memantul atau ditangkap kembali untuk buff.",
    "Ultimate-nya menendang bola energi yang memantul antar musuh di area sempit."
  ],
  "Carmilla": [
    "Support berdarah vampir yang merupakan belahan jiwa Cecilion.",
    "Bisa berputar menggunakan bunga merah tua untuk mencuri physical dan magic defense musuh.",
    "Ultimate-nya merantai musuh sehingga jika satu terkena damage atau stun, yang lain akan ikut merasakannya."
  ],
  "Cecilion": [
    "Mage vampir pemegang tongkat yang damage-nya sangat bergantung pada stack mana maksimal.",
    "Bisa menyembunyikan Carmilla di dalam tubuhnya (skill Moonlit Waltz).",
    "Serangannya sangat sakit di late game, menembakkan kelelawar raksasa lurus ke depan."
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
  "Chou": [
    "Fighter bela diri ahli Jeet Kune Do.",
    "Ultimate-nya The Way of Dragon sering disalahgunakan untuk pamer 'Freestyle' sebelum menendang core musuh.",
    "Mempunyai imunitas luar biasa terhadap Crowd Control saat menggunakan skill dash-nya (Shunpo)."
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
    "Telah di-revamp, perisainya (Guardian's Bulwark) bisa membalikkan peluru musuh ke arah si penembak dengan damage aslinya.",
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
  ],
  "Nana": [
    "Mage Leonin kecil melempar boomerang merah jambu raksasa (Magic Dart).",
    "Paling dibenci karena boneka Molina (Skill 2) yang merubah wujud hero musuh secara menyebalkan.",
    "Pasifnya menyelamatkan nyawanya satu kali, membuatnya berubah bentuk menjadi kelinci transparan yang kebal dari maut sementara waktu (Molina's Gift)."
  ],
  "Natalia": [
    "Assassin wanita yang beroperasi secara diam-diam dan tak terdeteksi.",
    "Jika berdiri cukup lama di semak-semak, dia akan menghilang ke mode Stealth dan tidak terlihat di peta sama sekali.",
    "Bisa melempar bom asap merah jambu/ungu yang membuatnya kebal (Immune) terhadap serangan basic attack musuh di dalamnya."
  ],
  "Natan": [
    "Marksman berjubah panjang abu-abu dari Eruditio, bergelar Spacetime Walker.",
    "Sebagian besar serangannya menembus lawan berkat kecepatan dasar, lalu seluruh physical-nya dikonversi menjadi murni Magic Damage.",
    "Punya jurus pamungkas yang membentangkan portal hitam besar di ujung map, dan melahirkan kloning yang menirukan gerakan/serangannya."
  ],
  "Nolan": [
    "Assassin penjelajah alam semesta berkacamata, yang tak lain adalah ayah kandung Layla.",
    "Semua skill menebasnya meninggalkan sayatan cahaya ruang hampa (Rift) di lantai tanah.",
    "Bila kedua sayatan Rift tersebut saling berpotongan, akan menyedot musuh di tengahnya dan langsung meledak menghasilkan damage instan."
  ],
  "Novaria": [
    "Mage astronom berselimut debu bintang biru, spesialis sniper udara jarak jauh.",
    "Jurus utamanya (Astral Recall) melempar dan menarik kembali bola kosmik menembus tembok, makin jauh ditarik makin menyakitkan layaknya Franco Hook.",
    "Ulti-nya membentangkan layar pelacak raksasa yang menerangi jalan (vision) dan menambah batas luar (hitbox) tubuh musuh dari kejauhan."
  ],
  "Obsidia": [
    "Marksman ahli dual-stance yang menguasai pertempuran taktis dua mode jarak jauh-dekat.",
    "Kemampuan pasifnya memungkinkan pergantian senjata dinamis sesuai kedekatan musuh.",
    "Merupakan hero Marksman rilis baru (2026) dengan spesialisasi kombinasi Finisher mematikan."
  ],
  "Odette": [
    "Mage balerina angsa bergaun putih asal Kastil Swan, kekasih sejatinya Lancelot.",
    "Sihir pantulannya (Blue Nova) sangat mengganggu ritme bertani (laning phase) musuh sejak awal.",
    "Tarian lagu perpisahan (Swan Song) memancarkan aura musik lingkaran besar, amat sangat sinergi dikombo dalam perut tumpangan mobil Johnson."
  ],
  "Paquito": [
    "Fighter murni petinju tak menggunakan Mana, hero tribut ikon Manny Pacquiao.",
    "Hanya bergantung kepada kombinasi Jab dan Uppercut untuk memecahkan kombo 3 lapisan stance (Champ Stance).",
    "Sangat lincah di jalur atas dengan pertahanan kebal luar biasa ketika spam shield tinjunya tak henti-henti diulangi."
  ],
  "Pharsa": [
    "Mage buta pengguna penutup mata asal kaum Crow (Gagak).",
    "Bisa seketika berganti wujud secara utuh menjadi seekor burung (Verri) lalu melarikan diri melintasi dinding dan bukit rintangan apapaun tanpa repot.",
    "Tembakan misil ultimatenya (Feathered Air Strike) dijuluki hujan mortir luar angkasa dengan cakrawala serangan super jauh."
  ],
  "Phoveus": [
    "Fighter botak bertubuh raksasa pembawa palu godam ungu bertutup paku (Astaros).",
    "Satu-satunya hero dengan takdir natural meng-counter seluruh champion lincah (Assassin/Marksman Dasher).",
    "Apabila ada musuh memakai teleport, lompat, lari, atau dasbor; ultinya spontan terbuka lalu ia akan lompat menumbuk tepat ke wajah lawannya secepat kilat."
  ],
  "Popol and Kupa": [
    "Marksman ganda; anak kecil Eskimo bertombak panjang ditemani serigala kutub peliharaannya.",
    "Sang anjing (Kupa) dapat maju sebagai tank penerima tembakan perlindungan bahkan berani menghajar Turet untuk waktu yang lama.",
    "Ahli memasang ranjau jebakan tak kasatmata (Popol's Surprise) di rumput dan menggigit keras (Bite 'em Kupa!)."
  ],
  "Rafaela": [
    "Support sayap malaikat perwakilan dari sisi kebaikan klan surgawi Moniyan.",
    "Skill keduanya menaburkan serbuk pemberkahan ringan untuk menambah laju jalan (Sprint) ke semua aliansinya.",
    "Ultimatenya (Holy Baptism) melepaskan seberkas gelombang dinding suci kuning yang merambat lurus men-stun segaris depan."
  ],
  "Roger": [
    "Fighter hibrida MM berwajah bapak tua pemburu serigala dengan cerutu.",
    "Pada mode dasarnya dia hanya menembak peluru sihir/jaring kelambanan.",
    "Akan tetapi mampu berubah menjadi siluman Lycan (Serigala Berbulu) untuk melompat memburu kerongkongan musuh langsung dengan cakar maut."
  ],
  "Ruby": [
    "Fighter bergaun merah membawa sabit penuai raksasa (Scythe) ala dongeng Si Kerudung Merah.",
    "Bukan mengandalkan pengeroyokan Basic Attack, namun seluruh porsi kemampuan regen-nya berlipat dari sihir/Lifesteal pada tiap putaran sabitnya.",
    "Mampu menarik mengayun kumpulan hero berbarengan sekilas ke belakang kepalanya lewat jurus pamungkas mematikan (I'm Offended!)."
  ],
  "Saber": [
    "Assassin manusia setengah mesin pertama di seri lawas dengan pedang cahaya biru (Laser).",
    "Skill andalannya berputar melempar 5 serpih shuriken baling-baling otomatis di sekitar pinggang terbangnya.",
    "Tergolong tipe pengunci maut satu jiwa instan (Triple Sweep); ia mencungkil satu orang ke atas udara lalu mencincangnya tiga tebasan tajam."
  ],
  "Selena": [
    "Assassin Mage iblis pembunuh dengan kepribadian ganda terang dan gelap lele (Abyssal Devil).",
    "Andalannya memancing lemparan ikan/lele panjang magis merah/hitam lurus dari kejauhan (Abyssal Arrow).",
    "Makin jauh jarak lempar panahnya kena ke tubuh target, makin lama target itu dibuat terdiam batu (Stun) hingga durasi abnormal hampir 3 detik."
  ],
  "Silvanna": [
    "Fighter bangsawan kekaisaran bermahkota, Ksatria perempuan berkuda (Knight).",
    "Sabetan tombaknya bertipe Magic mutlak dengan putaran bor spiral maut di jurus kedua (Spiral Strangling).",
    "Bila ia melompat turun dengan tebasan cahaya ultimatenya (Imperial Justice), target yang terkurung dalam lingkarannya mustahil mampu menerobos dindingnya sekeras apapun kabur."
  ],
  "Sora": [
    "Fighter/Assassin baru bersenjatakan sihir elemen langit/udara.",
    "Menyerang menukik layaknya elang dengan rentetan tebasan kecepatan tinggi.",
    "Jurus-jurusnya dirancang untuk menarget garis belakang (backline) musuh tanpa ampun (rilis 2026)."
  ],
  "Sun": [
    "Fighter dewa kera penguasa pegunungan batu terinspirasi Sun Wukong.",
    "Spesialis 'Push Turet' tercepat di land of dawn berkat tongkat kebenarannya.",
    "Tak pernah bertarung sendiri, di mana dia selalu memanggil (Clone) bayangan gandanya untuk menghancurkan bar HP musuh dengan pengeroyokan."
  ],
  "Suyou": [
    "Assassin abadi ahli bela diri pedang ganda yang rilis sejak 2024 akhir.",
    "Uniknya bisa menentukan sendiri mode serang (Hold Tap atau Quick Tap) pada layar untuk melahirkan jarak damage bervariatif.",
    "Gaya lincah siluman pemburunya menebas musuh hingga tiada titik celah tersisa di medan laga."
  ],
  "Terizla": [
    "Fighter mantan pengrajin pandai besi dengan wajah suram memegang palu meteor godam.",
    "Sangat sangat lambat, namun setiap tumbukan lantai palunya (Execution Strike) meluluhlantakkan tulang.",
    "Darah tebalnya sulit dibunuh karena ia memiliki bakat alami mengubah pengurangan darah seketika perlindungan perisai permanen."
  ],
  "Thamuz": [
    "Fighter wujud monster api neraka penguasa kaum iblis bawah tanah.",
    "Senjatanya (cincin roda gigi larva panas) bisa dilempar dan ditarik lagi ke dada sambil mengeluarkan lahar lahar menyakitkan di pijakannya.",
    "Bila bertarung 1 vs 1, regen ultimatenya saat terbakar api murka membuatnya ditakuti di lorong Exp."
  ],
  "Tigreal": [
    "Tank pelindung paladin kekaisaran klasik paling tangguh di garis depan berbekal Pedang lebar dan Perisai berat.",
    "Mampu menyeruduk semua formasi menggunakan jurus Dorong suci berlanjut lemparan tusuk udara (Knock-up).",
    "Jika pedang besar dipalu sedot ke dasar tanah (Implosion), kelima musuh sekaligus akan tersedot paksa masuk mendekapnya disusul hantaman melumpuhkan total."
  ],
  "Uranus": [
    "Tank mesin mengambang berselimut aurum (emas magis kuno).",
    "Semakin ia dipukuli atau ditembak terus, semakin tinggi pula tumpukan pilar penyembuhan otomatis (Regen) per detiknya yang membuat ia seakan tak bisa mati.",
    "Tergolong sebagai pengganggu (Cutter Minion) terhebat di belakang garis pertahanan lawan sedari menit awal."
  ],
  "Vale": [
    "Mage pengendali angin tornado, sahabat masa kecil Valir dari padang angin.",
    "Pilihan kekuatannya berevolusi otomatis di level 4/6/8, mengizinkan pemain memilih jalur Badai merah (Burst) atau Badai Biru (CC-Crowd control).",
    "Kombinasi angkat topannya (Knockup) lalu hempasan puting beliung besar adalah malapetaka sapu bersih di peperangan kelompok 5 vs 5."
  ],
  "Valentina": [
    "Mage bangsawan vampir tetua keluarga Paxley.",
    "Kekuatan paling mengerikannya bukanlah skill dasarnya yang melemparkan aura menakutkan, melainkan ultimatenya (I Am You).",
    "Dia sanggup menyalin (Copy) bulat-bulat semua wujud ultimate musuhnya, menjadikan senjata pamungkas lawan menyerang mereka balik secara identik."
  ],
  "Valir": [
    "Mage penguasa pilar lidah api (Hellfire) si pembangkang akademi sihir.",
    "Tembakan bola apinya secara instan terisi (reset peluru) apabila persis menyentuh badan Hero musuh tanpa henti.",
    "Ultimatenya menjadi penyelamat diri mutlak (Purify alami) sembari merubah pancaran dorongan apinya membakar meluas tak berujung (Vengeance Flame)."
  ],
  "Vexana": [
    "Mage Ratu mumi undead dari kaum Necrokeep.",
    "Satu persatu senjatanya kini tampil berkelas elegan; melemparkan teror cakar tengkorak lalu meledakkan ranjau energi jiwa maut di dada musuh.",
    "Bila dipanggil (Eternal Guard), akan menerjunkan Raksasa Golem Besar turun mementalkan area sambil menjaga Vexana terus meninju turret dan markas."
  ],
  "Wanwan": [
    "Marksman gesit penembak sumpit terbang klan Oriental berpakaian harimau.",
    "Serangannya beruntun dan memantul-mantulkan diri lompat terbang usai melepaskan satu panah (Tiger Pace).",
    "Memerlukan pemecahan piringan titik (Weakness) keliling. Jika seluruh titik musuh terbuka retak, barulah tembakan pamungkas seribu jarumnya (Crossbow of Tang) yang tak tersentuh di udara terbuka lebar."
  ],
  "X.Borg": [
    "Fighter api Cyborg berbaju mecha kuning dengan penyembur obor las Firaga (Flamethrower).",
    "Sistem tubuhnya bergantung pada zirah armor mekanik yang memisah apabila nyawanya terkuras, meloloskannya selamat sebelum diledakkan.",
    "Lompatan berputarnya menembakkan semburan lava api maut di atas udara dan ditutup dentuman penghangusan di detik ke-3 (Last Insanity)."
  ],
  "Xavier": [
    "Mage pengendali cahaya mistis (Mystic Light) anggota ksatria gereja Forsaken Light.",
    "Penembak garis terang lurus berjarak pendek-menengah, bila menyentuh dinding pantulan ia mekar merantai ikatan lumpuh pergerakan.",
    "Jurang laser besar Ultimatenya menembus segala dinding map dari pangkal hulu ke pangkal bilik tak berbatas (Dawning Light) memungut pembunuhan mencuri (Steal) musuh lengah di ujung benua."
  ],
  "Yi Sun-shin": [
    "Assassin sekaligus Marksman wujud Jenderal kapten angkatan laut bersenjata lengkap dua arah.",
    "Dapat memanah di garis aman lalu mendadak memotong tebas gladiator jarak mepet menggunakan parangnya untuk pasif pendorong daya rusak tinggi.",
    "Senjata rahasianya berupa Tiga Gelombang tembakan meriam armada bahari kapal kura-kura dari langit jatuh meruntuhkan tepat ke atas kepala 5 hero musuh se-map utuh (Mountain Shocker)."
  ],
  "Yin": [
    "Fighter pria jenius pelindung bersabuk lengan cincin mematikan di kedua tangannya.",
    "Dapat mendobrak maju memukul kejut melingkar disusul tebasan maut (Frenzy Strike).",
    "Mengurung dan menculik paksa musuhnya ke alam arena gladiator iblis miliknya (My Turn!), bersalin rupa ke wujud Lieh, menutup perdebatan dengan sabetan cincin gila tanpa gangguan keroyokan."
  ],
  "Yu Zhong": [
    "Fighter jubah panjang reinkarnasi jelmaan mutlak Naga Hitam mistik oriental (Black Dragon).",
    "Sedotan pasif aura birunya yang tertinggal membuncahkan meledak per detik menambal darah nyawanya (Sha Residue).",
    "Bila dipicu, seluruh badannya mencuat dan merasuk terbang menjelma naga bersisik raksasa yang tidak terhalang tembok apapun dan memukul mental semua musuh sebelum turun kembali jadi wujud Hibrida naga berkuku tajam."
  ],
  "Yve": [
    "Mage makhluk kosmik antariksa transparan penjaga keseimbangan Galaksi ungu.",
    "Gaya laningnya sekedar memotong irisan balok magis di depan layar dengan pelambatan yang konsisten (Void Blast/Crystal).",
    "Tersebar luasnya kotak caturnya (Real World Manipulation) di lapangan memaksamu untuk menggaris dan menekan 15 ubin luar angkasa bak pianika merusak dan melemaskan semua kawanmu dari area jangkauan aman."
  ],
  "Zetian": [
    "Mage permaisuri penguasa yang dirilis belakangan, menunggangi manifestasi energi mahkota kekuasaan mutlak.",
    "Keahliannya sangat ditakuti lantaran bisa mendepak memukul mudur pasukan lawan dengan kipas aura magis.",
    "Dapat memaksa (Dominate) wilayah kekuasaannya sendiri, memaksa siapapun merayap lemas dalam pengawasannya bertempur (Skill AoE)."
  ],
  "Zhask": [
    "Mage monster alien kejam empat mata penakluk daratan Galaksi asing bermoncong lancip.",
    "Ia tidak mau menembak tangan kosong, senantiasa membuahkan telur benih iblis meriam hidup/turret berjalan (Nightmaric Spawn) di tanah merangsek melaser musuh sejajar.",
    "Dengan masuknya ia melebur nyawa dengan sang Turret, ukuran moncong monsternya menggajah merusak formasi benteng, menghujam beruntun laser berdaya kelumpuhan mematikan berlimpah nyawa kedua."
  ],
  "Zhuxin": [
    "Mage wanita oriental anggun pembawa pusaka lentera terbang kemerahan.",
    "Satu tangannya memegang lentera, merembeskan tenaga (Mana) biru dengan membakar pelan demi mengayun angin (Crimson Beacons).",
    "Puncak ketakutannya tiba kala musuhnya diseret berayun lalu mementalkannya memukul terhempas kencang di angkasa (Airborne Susulan) layaknya bermain layang-layang maut, nyaris mustahil dilepas begitu dihisap."
  ],
  "Zilong": [
    "Fighter Jenderal tombak legenda sejati naga petarung lurus (Tombak Menusuk Pantat) paling digemari pemula.",
    "Kombo lari lalu mencungkil jengkang melempar lawan ke balik punggung pelukannya adalah momok mematikan (Spear Flip).",
    "Lekas api jingga amarah ultimatenya membakar ujung panji tombaknya (Supreme Warrior), langkahnya lari secepat kilat meremukkan pertahanan lawan dan kabur bagaikan tiupan angin ribut di lorong sunyi."
  ]
};

// We will read the file manually using fs.readFileSync to avoid require() caching issues
// because the file was corrupted with \n previously.
// Let's just generate the whole file again using the old JSON data that I parsed in gen_heroes.js.

// Actually, I can just use my gen_heroes output.
const content = fs.readFileSync('gen_heroes.cjs', 'utf-8');
// But I can also just run it to generate a fresh src/data/ml-heroes.js
// Wait, I will just require the data from a temporary json file.
