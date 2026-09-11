const fs = require('fs');

const EXTRA_CLUES = {
  "Nana": [
    "Build Rekomendasi: Lightning Truncheon, Genius Wand, Holy Crystal.",
    "Counter Hero: Lancelot, Chou, Natalia.",
    "Fakta: Mage menyebalkan paling ikonik, punya 9 skin (termasuk Mecha Baby).",
    "Suara Draft Pick: 'Do you want to make friends with Nana?'"
  ],
  "Natalia": [
    "Build Rekomendasi: Blade of Heptaseas, Hunter Strike, Blade of Despair.",
    "Counter Hero: Kaja, Aldous, Hylos (Yang bisa mendeteksi atau membuka map).",
    "Fakta: Assassin spesialis push dan culik MM, punya 7 skin (termasuk Cyber Spectre).",
    "Suara Draft Pick: 'Where is my target?'"
  ],
  "Natan": [
    "Build Rekomendasi: Feather of Heaven, Golden Staff, Divine Glaive.",
    "Counter Hero: Lolita, Chou, Natalia.",
    "Fakta: MM penyihir waktu dari Eruditio, punya kolaborasi skin (Tidal Lord).",
    "Suara Draft Pick: 'By the time you see this, I'll be gone.'"
  ],
  "Nolan": [
    "Build Rekomendasi: Hunter Strike, Bloodlust Axe, Blade of Despair.",
    "Counter Hero: Khufra, Phoveus, Ruby.",
    "Fakta: Sang Ayah dari Layla (Penjelajah dimensi), assassin yang sangat gesit.",
    "Suara Draft Pick: 'The universe is but a fragile mirror.'"
  ],
  "Novaria": [
    "Build Rekomendasi: Enchanted Talisman, Lightning Truncheon, Divine Glaive.",
    "Counter Hero: Lancelot, Ling, Natalia.",
    "Fakta: Mage sniper penembus dinding dari bangsa astral, rilis 2023.",
    "Suara Draft Pick: 'Starlight, guide my path.'"
  ],
  "Obsidia": [
    "Build Rekomendasi: Demon Hunter Sword, Corrosion Scythe, Golden Staff.",
    "Counter Hero: Belerick, Lolita, Natalia.",
    "Fakta: Hero rilis tahun 2026, Marksman ahli Dual-stance taktis.",
    "Suara Draft Pick: 'Shadows or light, both obey me.'"
  ],
  "Odette": [
    "Build Rekomendasi: Glowing Wand, Ice Queen Wand, Genius Wand.",
    "Counter Hero: Chou, Jawhead, Kaja (Pembatal ulti).",
    "Fakta: Putri angsa, sering diduetkan dengan Johnson, pacar dari Lancelot.",
    "Suara Draft Pick: 'The sword is a gift... from Lancelot.'"
  ],
  "Paquito": [
    "Build Rekomendasi: Bloodlust Axe, Hunter Strike, Brute Force Breastplate.",
    "Counter Hero: Baxia, Esmeralda, Phoveus.",
    "Fakta: Fighter yang menjadi tribute kepada petinju Manny Pacquiao, punya skin kolaborasi asli.",
    "Suara Draft Pick: 'I am a champion!'"
  ],
  "Pharsa": [
    "Build Rekomendasi: Lightning Truncheon, Genius Wand, Holy Crystal.",
    "Counter Hero: Lancelot, Chou, Ling.",
    "Fakta: Putri bangsa gagak yang kehilangan penglihatan aslinya, punya lebih dari 6 skin.",
    "Suara Draft Pick: 'Payback time!'"
  ],
  "Phoveus": [
    "Build Rekomendasi: Clock of Destiny, Lightning Truncheon, Holy Crystal.",
    "Counter Hero: Esmeralda, Baxia, Minsitthar.",
    "Fakta: Counter alami bagi semua assassin/MM yang suka lari dan dash, punya senjata bernama Astaros.",
    "Suara Draft Pick: 'No one escapes my Astaros!'"
  ],
  "Popol and Kupa": [
    "Build Rekomendasi: Windtalker, Berserker's Fury, Blade of Despair.",
    "Counter Hero: Lancelot, Chou, Natalia.",
    "Fakta: MM ganda (bocah Eskimo dan serigalanya), punya 5 skin (termasuk Transformers Soundwave).",
    "Suara Draft Pick: 'Popol and Kupa are the best partners in the world!'"
  ],
  "Rafaela": [
    "Build Rekomendasi: Fleeting Time, Enchanted Talisman, Dominance Ice.",
    "Counter Hero: Chou, Lancelot, Natalia.",
    "Fakta: Malaikat Support dari Moniyan Empire, saudara dari Argus, punya 6 skin.",
    "Suara Draft Pick: 'Healing for everyone!'"
  ],
  "Roger": [
    "Build Rekomendasi: Windtalker, Endless Battle, Blade of Despair.",
    "Counter Hero: Gatotkaca, Belerick, Khufra.",
    "Fakta: Manusia pemburu serigala yang terkutuk menjadi siluman serigala (Lycan), punya skin Transformer Megatron dan M3.",
    "Suara Draft Pick: 'I detect the scent of prey!'"
  ],
  "Ruby": [
    "Build Rekomendasi: Bloodlust Axe, Haas's Claws, Dominance Ice.",
    "Counter Hero: Baxia, Valir, Diggie.",
    "Fakta: Terinspirasi dongeng Gadis Bertudung Merah yang kini membawa Sabit, Ratu Lifesteal, punya 6 skin (termasuk kolaborasi The Aspirants).",
    "Suara Draft Pick: 'The wolf is coming!'"
  ],
  "Saber": [
    "Build Rekomendasi: Hunter Strike, Blade of Despair, Malefic Roar.",
    "Counter Hero: Diggie, Khufra, Argus.",
    "Fakta: Assassin robot pertama, punya skin Legend (Codename - Storm), total lebih dari 8 skin.",
    "Suara Draft Pick: 'Kill all at once!'"
  ],
  "Selena": [
    "Build Rekomendasi: Calamity Reaper, Holy Crystal, Divine Glaive.",
    "Counter Hero: Diggie, Khufra, Lancelot.",
    "Fakta: Assassin mage pelepas ikan lele (lele abyssal) peng-stun terlama, punya skin S.T.U.N dan Virus.",
    "Suara Draft Pick: 'When you gaze into the abyss, the abyss gazes into you.'"
  ],
  "Silvanna": [
    "Build Rekomendasi: Concentrated Energy, Feather of Heaven, Holy Crystal.",
    "Counter Hero: Diggie, Chou, Akai.",
    "Fakta: Putri dari Moniyan Empire (kakak Dyrroth), fighter dengan magic damage, dibagikan gratis saat rilis.",
    "Suara Draft Pick: 'I will fight for the light!'"
  ],
  "Sora": [
    "Build Rekomendasi: Hunter Strike, Blade of Despair, Dominance Ice.",
    "Counter Hero: Khufra, Phoveus, Ruby.",
    "Fakta: Assassin angkasa rilis tahun 2026 yang bersenjatakan elemen udara/langit.",
    "Suara Draft Pick: 'The sky is my limit, and my domain.'"
  ],
  "Sun": [
    "Build Rekomendasi: Corrosion Scythe, Demon Hunter Sword, Golden Staff.",
    "Counter Hero: Ruby, Balmond, X.Borg (Hero AoE/Spell vamp tebal).",
    "Fakta: Sang kera sakti, raja push turret, punya lebih dari 6 skin (termasuk Spring Festival).",
    "Suara Draft Pick: 'Show me some real opponents!'"
  ],
  "Suyou": [
    "Build Rekomendasi: Hunter Strike, Blade of Despair, Rose Gold Meteor.",
    "Counter Hero: Khufra, Minsitthar, Chou.",
    "Fakta: Immortal assassin dari akhir tahun 2024, mekanik tekan (hold) skill yang fleksibel.",
    "Suara Draft Pick: 'A blade in the dark, a master of none.'"
  ],
  "Terizla": [
    "Build Rekomendasi: Bloodlust Axe, Dominance Ice, Oracle.",
    "Counter Hero: Valir, Karrie, Lunox.",
    "Fakta: Mantan pandai besi berbadan tank (fighter ter-tanky di lane), punya 5 skin.",
    "Suara Draft Pick: '10 years of imprisonment!'"
  ],
  "Thamuz": [
    "Build Rekomendasi: Corrosion Scythe, Demon Hunter Sword, Dominance Ice.",
    "Counter Hero: Baxia, Dyrroth, Karrie.",
    "Fakta: Fighter lava (Raja Abyss), berjuluk 'Lord Lava', punya kolaborasi Kungfu Panda (Jenderal Kai).",
    "Suara Draft Pick: 'Burn them all!'"
  ],
  "Tigreal": [
    "Build Rekomendasi: Dominance Ice, Athena's Shield, Immortality.",
    "Counter Hero: Diggie, Valir, Akai (Pembalik inisiasi).",
    "Fakta: Tank tertua dan ter-klasik di game, komandan Knight, punya lebih dari 7 skin.",
    "Suara Draft Pick: 'For honor and glory!'"
  ],
  "Uranus": [
    "Build Rekomendasi: Enchanted Talisman, Oracle, Dominance Ice.",
    "Counter Hero: Baxia, Esmeralda, Karrie.",
    "Fakta: Tank regen yang bisa memutus wave minion di belakang turret sejak menit pertama.",
    "Suara Draft Pick: 'Uranus... has awakened!'"
  ],
  "Vale": [
    "Build Rekomendasi: Lightning Truncheon, Genius Wand, Holy Crystal.",
    "Counter Hero: Lancelot, Chou, Ling.",
    "Fakta: Sahabat Valir, pengendali angin badai, punya mekanisme upgrade 2 gaya skill, punya skin Superhero (Blizzard).",
    "Suara Draft Pick: 'The boy who's like wind.'"
  ],
  "Valentina": [
    "Build Rekomendasi: Enchanted Talisman, Lightning Truncheon, Divine Glaive.",
    "Counter Hero: Chou, Lancelot (Atau draf tanpa hero ultimate menakutkan).",
    "Fakta: Mage pencuri ultimate tersohor, leluhur keluarga Paxley (Gusion/Aamon).",
    "Suara Draft Pick: 'I am you!'"
  ],
  "Valir": [
    "Build Rekomendasi: Ice Queen Wand, Glowing Wand, Genius Wand.",
    "Counter Hero: Lancelot, Ling, Baxia.",
    "Fakta: Pengendali api yang selalu dipakai untuk mencegah tabrakan hero tebal/fighter, punya skin Legend dan Saint Seiya (Ikki).",
    "Suara Draft Pick: 'Feel the heat of the inferno!'"
  ],
  "Vexana": [
    "Build Rekomendasi: Fleeting Time, Glowing Wand, Lightning Truncheon.",
    "Counter Hero: Lancelot, Chou, Ling.",
    "Fakta: Ratu Necrokeep yang mendapat revamp total dari hantu nenek sihir menjadi putri cantik, punya 6 skin (termasuk Zenith).",
    "Suara Draft Pick: 'From the looks of you, you seem scared.'"
  ],
  "Wanwan": [
    "Build Rekomendasi: Corrosion Scythe, Demon Hunter Sword, Wind of Nature.",
    "Counter Hero: Phoveus, Khufra, Belerick.",
    "Fakta: Hero tersulit ditangkap dengan pasif melompat tanpa henti, punya M-World dan skin 11.11.",
    "Suara Draft Pick: 'To me, fun is all that matters!'"
  ],
  "X.Borg": [
    "Build Rekomendasi: Bloodlust Axe, Immortality, War Axe.",
    "Counter Hero: Esmeralda, Baxia, Karrie.",
    "Fakta: Fighter yang bisa membakar tanpa terkena damage ke tubuh aslinya (berkat armor Firaga), punya skin Transformers (Bumblebee).",
    "Suara Draft Pick: 'Huh, set me on fire, and I'll play along!'"
  ],
  "Xavier": [
    "Build Rekomendasi: Enchanted Talisman, Lightning Truncheon, Divine Glaive.",
    "Counter Hero: Lancelot, Ling, Natalia (Penciduk garis belakang).",
    "Fakta: Mage laser dari kejauhan kolaborasi Jujutsu Kaisen (Gojo Satoru).",
    "Suara Draft Pick: 'Let there be light!'"
  ],
  "Yi Sun-shin": [
    "Build Rekomendasi: War Axe, Endless Battle, Blade of Despair.",
    "Counter Hero: Natalia, Chou, Lancelot.",
    "Fakta: Jenderal Korea, kapal markasnya bisa dinaiki di awal respawn, bisa menebas dan menembak dari dua jarak berbeda.",
    "Suara Draft Pick: 'Oceans are my domain!'"
  ],
  "Yin": [
    "Build Rekomendasi: Hunter Strike, Bloodlust Axe, Blade of Despair.",
    "Counter Hero: Wanwan, Argus, Khufra (Hero yang sulit dibunuh saat duel 1vs1).",
    "Fakta: Penculik arena 1vs1, punya skin kolaborasi Jujutsu Kaisen (Yuji Itadori / Sukuna) dan Attack on Titan (Eren Yeager).",
    "Suara Draft Pick: 'I am Yin, and always will be!'"
  ],
  "Yu Zhong": [
    "Build Rekomendasi: Bloodlust Axe, Hunter Strike, Oracle.",
    "Counter Hero: Baxia, Esmeralda, Dyrroth.",
    "Fakta: Perwujudan naga hitam terhebat di EXP lane, punya skin M4 Champion dan Exorcist.",
    "Suara Draft Pick: 'I would rather betray the world, than let the world betray me!'"
  ],
  "Yve": [
    "Build Rekomendasi: Ice Queen Wand, Glowing Wand, Enchanted Talisman.",
    "Counter Hero: Kaja, Franco (Penarik pembatal area ultimatenya).",
    "Fakta: Musuh bebuyutan Zhask dari galaksi lain, ultimatenya menekan ubin catur area raksasa.",
    "Suara Draft Pick: 'I shall bring the end!'"
  ],
  "Zetian": [
    "Build Rekomendasi: Enchanted Talisman, Lightning Truncheon, Holy Crystal.",
    "Counter Hero: Lancelot, Ling, Natalia.",
    "Fakta: Ratu kekaisaran naga (rilis baru), menguasai sihir kontrol permaisuri mutlak.",
    "Suara Draft Pick: 'All shall bow before the Empress!'"
  ],
  "Zhask": [
    "Build Rekomendasi: Feather of Heaven, Windtalker, Divine Glaive.",
    "Counter Hero: Claude, Lancelot (Penghancur pion secara instan).",
    "Fakta: Alien perusak tower pertama yang menelurkan pion monster berwujud turret (Nightmaric Spawn), punya skin Zodiak Cancer.",
    "Suara Draft Pick: 'The universe will be mine!'"
  ],
  "Zhuxin": [
    "Build Rekomendasi: Enchanted Talisman, Ice Queen Wand, Genius Wand.",
    "Counter Hero: Lancelot, Ling, Fanny.",
    "Fakta: Mage oriental dengan lentera merah yang membakar Mana secara beruntun dan menerbangkan musuh.",
    "Suara Draft Pick: 'The lantern guides the lost souls.'"
  ],
  "Zilong": [
    "Build Rekomendasi: Windtalker, Berserker's Fury, Blade of Despair.",
    "Counter Hero: Chou, Khufra, Ruby.",
    "Fakta: Salah satu jenderal tombak tertua (Yun Zhao), maskot hero push tower, punya 10+ skin.",
    "Suara Draft Pick: 'Zhao Zilong is here!'"
  ]
};

let content = fs.readFileSync('src/data/ml-heroes.js', 'utf8');

const jsonStart = content.indexOf('[');
const jsonEnd = content.lastIndexOf(']');
let heroes = JSON.parse(content.substring(jsonStart, jsonEnd + 1));

const enrichedHeroes = heroes.map(hero => {
  if (EXTRA_CLUES[hero.name]) {
    const extra = EXTRA_CLUES[hero.name];
    if (hero.clues.length === 3) {
      hero.clues.push(...extra);
    }
  }
  return hero;
});

const contentStr = "// Auto-generated Detailed Heroes Data (Total: " + enrichedHeroes.length + " Heroes)\nexport const ML_HEROES = " + JSON.stringify(enrichedHeroes, null, 2) + ";\n";
fs.writeFileSync('src/data/ml-heroes.js', contentStr);
console.log("Injected extra clues Part 3!");
