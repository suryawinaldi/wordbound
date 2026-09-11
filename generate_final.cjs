const fs = require('fs');

const content = fs.readFileSync('src/data/ml-heroes.js', 'utf8');

// The file is currently broken with literal \n
const jsonStart = content.indexOf('[');
const jsonEnd = content.lastIndexOf(']');
let heroes;
try {
  heroes = JSON.parse(content.substring(jsonStart, jsonEnd + 1));
} catch(e) {
  console.log("Failed to parse", e);
  process.exit(1);
}

const DB3 = {
  // N - Z
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

const newHeroes = heroes.map(hero => {
  const custom = DB3[hero.name];
  if (custom) {
    return { name: hero.name, clues: custom };
  }
  // Let's remove initial/ending clues for ANY hero that hasn't been customized, per user request.
  // Instead of "awal/akhir", just replace with a dummy generic text that is more mysterious.
  if (hero.clues && hero.clues.length >= 3 && hero.clues[2].includes('diawali dengan huruf')) {
    let trait = hero.clues[1].includes('berfokus pada ') ? hero.clues[1].split('berfokus pada ')[1] : "serangannya";
    hero.clues[2] = `Tergolong ke dalam spesialis yang mahir mengendalikan ritme ` + trait + ` tanpa harus mengandalkan kombinasi inisial nama.`;
  }
  return hero;
});

const contentStr = "// Auto-generated Detailed Heroes Data (Total: " + newHeroes.length + " Heroes)\nexport const ML_HEROES = " + JSON.stringify(newHeroes, null, 2) + ";\n";
fs.writeFileSync('src/data/ml-heroes.js', contentStr);
console.log("Applied Batch 3 correctly. Database is now fully enriched.");
