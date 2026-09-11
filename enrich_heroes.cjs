const fs = require('fs');

const CLUES_DB = {
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
  } else {
    // If we missed them, fallback slightly improved
    let clue1 = hero.clues[0];
    let clue2 = hero.clues[1];
    let trait = clue2.includes('berfokus pada ') ? clue2.split('berfokus pada ')[1] : "yang kuat";
    let clue3 = "Hero ini rilis di Mobile Legends dengan keunikan " + trait + ".";
    return {
      name: hero.name,
      clues: [clue1, clue2, clue3]
    };
  }
});

const contentStr = "// Auto-generated Detailed Heroes Data (Total: " + newHeroes.length + " Heroes)\nexport const ML_HEROES = " + JSON.stringify(newHeroes, null, 2) + ";\n";

fs.writeFileSync('src/data/ml-heroes.js', contentStr);
console.log("Injected detailed lore/skill clues batch 1 successfully!");
