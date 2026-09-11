const fs = require('fs');

const EXTRA_CLUES = {
  "Diggie": [
    "Build Rekomendasi: Fleeting Time, Dominance Ice, Athena's Shield.",
    "Counter Hero: Natalia, Aldous, Helcurt.",
    "Fakta: Punya trik bermain 'Diggie Feeder' yang sempat populer, punya 5 skin.",
    "Suara Draft Pick: 'Hoot hoot... doot doot... blulululu...'"
  ],
  "Dyrroth": [
    "Build Rekomendasi: Hunter Strike, Bloodlust Axe, Blade of Despair.",
    "Counter Hero: Chou, Paquito, Baxia.",
    "Fakta: Pangeran Abyss yang merupakan adik angkat Silvanna, punya 6 skin.",
    "Suara Draft Pick: 'I will do anything for the abyss!'"
  ],
  "Edith": [
    "Build Rekomendasi: Dominance Ice, Athena's Shield, Holy Crystal.",
    "Counter Hero: Karrie, Lunox, Baxia.",
    "Fakta: Hero Tank-Marksman, penjaga pulau suci, punya 3 skin.",
    "Suara Draft Pick: 'I am the Primal Warden!'"
  ],
  "Esmeralda": [
    "Build Rekomendasi: Enchanted Talisman, Dominance Ice, Oracle.",
    "Counter Hero: Baxia, Karrie, Lunox.",
    "Fakta: Mage-Tank yang punya hubungan asmara lore dengan Khufra, punya 7 skin (termasuk HERO).",
    "Suara Draft Pick: 'The night sky tells all.'"
  ],
  "Estes": [
    "Build Rekomendasi: Enchanted Talisman, Oracle, Dominance Ice.",
    "Counter Hero: Baxia, Ling, Chou (Anti-heal & Burst).",
    "Fakta: Mendapat skin kemenangan M3 Blacklist International, punya total 6 skin.",
    "Suara Draft Pick: 'Hello, my friend.'"
  ],
  "Eudora": [
    "Build Rekomendasi: Genius Wand, Holy Crystal, Divine Glaive.",
    "Counter Hero: Lancelot, Chou, Athena's Shield.",
    "Fakta: Dikenal sebagai mage penciduk semak terfavorit pemula, punya 6 skin.",
    "Suara Draft Pick: 'Would you like to have a drink with me?'"
  ],
  "Fanny": [
    "Build Rekomendasi: Bloodlust Axe, Hunter Strike, Blade of Despair.",
    "Counter Hero: Khufra, Minsitthar, Chou, Antique Cuirass.",
    "Fakta: Hero tersulit di MLBB, mendapat kolaborasi anime Attack on Titan (Mikasa), total lebih dari 9 skin.",
    "Suara Draft Pick: 'Sir, what's your command?'"
  ],
  "Faramis": [
    "Build Rekomendasi: Fleeting Time, Lightning Truncheon, Glowing Wand.",
    "Counter Hero: Valentina (Mencuri ulti-nya), Akai, Diggie.",
    "Fakta: Sempat tidak mendapat skin bertahun-tahun, kini punya skin kolaborasi Mythic.",
    "Suara Draft Pick: 'Death is not my end.'"
  ],
  "Floryn": [
    "Build Rekomendasi: Fleeting Time, Oasis, Oracle.",
    "Counter Hero: Baxia, Ling, Chou.",
    "Fakta: Support yang dirilis gratis bertepatan dengan ulang tahun MLBB, punya 4 skin (termasuk Sanrio).",
    "Suara Draft Pick: 'Let's make this world green and lively!'"
  ],
  "Franco": [
    "Build Rekomendasi: Dominance Ice, Athena's Shield, Immortality.",
    "Counter Hero: Diggie, Valir, Karrie.",
    "Fakta: Tank tertua dengan mekanik pancing (hook), punya skin Legend (King of Hell) dan total 9 skin.",
    "Suara Draft Pick: 'I love the smell of gunpowder in the morning!'"
  ],
  "Fredrinn": [
    "Build Rekomendasi: Cursed Helmet, Guardian Helmet, Blade Armor.",
    "Counter Hero: Karrie, Lunox, Dyrroth.",
    "Fakta: Jungler tank terpopuler di META 2023-2024, punya 4 skin (termasuk Neobeast).",
    "Suara Draft Pick: 'Let me show you a real fight!'"
  ],
  "Freya": [
    "Build Rekomendasi: Haas's Claws, Berserker's Fury, Blade of Despair.",
    "Counter Hero: Esmeralda, Baxia, Minsitthar.",
    "Fakta: Satu-satunya hero yang pada awalnya hanya bisa didapatkan via Top-up Diamond pertama kali, punya 8 skin (termasuk Legend).",
    "Suara Draft Pick: 'I am the Valkyrie!'"
  ],
  "Gatotkaca": [
    "Build Rekomendasi: Concentrated Energy, Dominance Ice, Blade Armor.",
    "Counter Hero: Karrie, Lunox, Chou.",
    "Fakta: Hero kebanggaan Indonesia (Pringgodani), punya 5 skin (termasuk Epic Sentinel).",
    "Suara Draft Pick: 'Muscle of iron, bones of steel!'"
  ],
  "Gloo": [
    "Build Rekomendasi: Cursed Helmet, Dominance Ice, Oracle.",
    "Counter Hero: Vexana, Faramis, Claude (Counter hero kumpulan stack).",
    "Fakta: Hero berwujud jelly, susah dimatikan karena ulti belahnya, punya 3 skin.",
    "Suara Draft Pick: 'We are... Gloo!'"
  ],
  "Gord": [
    "Build Rekomendasi: Ice Queen Wand, Glowing Wand, Genius Wand.",
    "Counter Hero: Lancelot, Chou, Ling.",
    "Fakta: Mage lawas yang punya Legend skin (Conqueror) dan melayang dengan hoverboard.",
    "Suara Draft Pick: 'There is no time to dally!'"
  ],
  "Granger": [
    "Build Rekomendasi: Hunter Strike, Malefic Roar, Blade of Despair.",
    "Counter Hero: Lancelot, Chou, Natalia.",
    "Fakta: Marksman tanpa attack speed, punya skin Legend (Starfall Knight) dan kolaborasi Transformers (Megatron).",
    "Suara Draft Pick: 'Experience the euphony of suffering.'"
  ],
  "Grock": [
    "Build Rekomendasi: Blade of Despair, Dominance Ice, Antique Cuirass.",
    "Counter Hero: Karrie, Lunox, Valir.",
    "Fakta: Bisa membuat tembok, pasifnya anti-CC di dekat tembok, punya 7 skin (termasuk Rhino/VENOM).",
    "Suara Draft Pick: 'Welcome to my castle, my friend!'"
  ],
  "Guinevere": [
    "Build Rekomendasi: Concentrated Energy, Genius Wand, Holy Crystal.",
    "Counter Hero: Chou (Anti-CC), Diggie, Helcurt.",
    "Fakta: Hero fighter hybrid mage pertama, punya 8 skin (termasuk KOF Athena Asamiya).",
    "Suara Draft Pick: 'I am the born talent!'"
  ],
  "Gusion": [
    "Build Rekomendasi: Genius Wand, Holy Crystal, Divine Glaive.",
    "Counter Hero: Chou, Ruby, Khufra.",
    "Fakta: Sangat lincah, primadona montase, punya lebih dari 10 skin (KOF K', Legend, Collector).",
    "Suara Draft Pick: 'The perfect combination of might and magic.'"
  ],
  "Hanabi": [
    "Build Rekomendasi: Corrosion Scythe, Demon Hunter Sword, Golden Staff.",
    "Counter Hero: Lancelot, Chou, Natalia.",
    "Fakta: Sempat dianggap hero MM terburuk sebelum di-revamp, punya 8 skin.",
    "Suara Draft Pick: 'I'll be the blade in your hands.'"
  ],
  "Hanzo": [
    "Build Rekomendasi: Demon Hunter Sword, Golden Staff, Corrosion Scythe.",
    "Counter Hero: Natalia, Ling, Aldous (Mampu mengejar tubuh aslinya).",
    "Fakta: Assassin hantu pemakan buff, punya 4 skin.",
    "Suara Draft Pick: 'The strongest ninja has arrived!'"
  ],
  "Harith": [
    "Build Rekomendasi: Magic Shoes, Calamity Reaper, Holy Crystal.",
    "Counter Hero: Khufra, Minsitthar, Esmeralda.",
    "Fakta: Hero kucing (Leonin) yang memenangkan skin M1 (EVOS Legends), punya 7 skin.",
    "Suara Draft Pick: 'Magic is my life.'"
  ],
  "Harley": [
    "Build Rekomendasi: Genius Wand, Glowing Wand, Holy Crystal.",
    "Counter Hero: Chou, Lancelot, Radiant Armor.",
    "Fakta: Pesulap jenius, saudara kandung Lesley, punya 8 skin.",
    "Suara Draft Pick: 'Time for me to make my entrance!'"
  ],
  "Hayabusa": [
    "Build Rekomendasi: Hunter Strike, Blade of Despair, Malefic Roar.",
    "Counter Hero: Chou, Khufra, Ruby.",
    "Fakta: Ninja bayangan (Shadow), punya lebih dari 8 skin (termasuk Annual Starlight dan Exorcist).",
    "Suara Draft Pick: 'Let me clear the way for my master.'"
  ],
  "Helcurt": [
    "Build Rekomendasi: Demon Hunter Sword, Blade of Despair, Malefic Roar.",
    "Counter Hero: Chou, Hylos, Belerick.",
    "Fakta: Pembawa kegelapan buta map, sempat ditarik sementara dari game karena bug mematikan, punya 6 skin.",
    "Suara Draft Pick: 'Night has fallen... let the killing begin!'"
  ],
  "Hilda": [
    "Build Rekomendasi: Blade of Heptaseas, Dominance Ice, Oracle.",
    "Counter Hero: Karrie, Lunox, Valir.",
    "Fakta: Fighter preman semak, regenerasi nyawa gratis di rumput, punya 5 skin.",
    "Suara Draft Pick: 'The real warrior is here!'"
  ],
  "Hylos": [
    "Build Rekomendasi: Dominance Ice, Cursed Helmet, Clock of Destiny.",
    "Counter Hero: Karrie, Claude, Lunox (Penghancur tank HP tebal).",
    "Fakta: Tank centaur (kuda berbadan manusia), punya jalur lari (ulti) ikonik, punya 6 skin.",
    "Suara Draft Pick: 'My mission is to protect this life.'"
  ],
  "Irithel": [
    "Build Rekomendasi: Windtalker, Berserker's Fury, Blade of Despair.",
    "Counter Hero: Natalia, Lancelot, Chou.",
    "Fakta: Satu-satunya MM yang bisa menembak tanpa berhenti berjalan, punya 7 skin (termasuk kolaborasi Ducati).",
    "Suara Draft Pick: 'Let's go, Leo!'"
  ],
  "Ixia": [
    "Build Rekomendasi: Corrosion Scythe, Demon Hunter Sword, Golden Staff.",
    "Counter Hero: Lancelot, Chou, Natalia.",
    "Fakta: MM jenius pencipta senjata dari Eruditio, rilis di 2023.",
    "Suara Draft Pick: 'I don't follow rules, I make them.'"
  ],
  "Jawhead": [
    "Build Rekomendasi: Hunter Strike, Dominance Ice, Athena's Shield.",
    "Counter Hero: Diggie, Valir, Chou.",
    "Fakta: Punya skill buang teman (lempar kawan), punya kolaborasi skin (Alice in Wonderland).",
    "Suara Draft Pick: 'Yee-haw!'"
  ],
  "Johnson": [
    "Build Rekomendasi: Blade Armor, Dominance Ice, Athena's Shield.",
    "Counter Hero: Diggie, Karrie, Chou.",
    "Fakta: Berubah wujud jadi mobil (mirip Autobots Transformers) dan menggendong rekan, punya skin Optimus Prime.",
    "Suara Draft Pick: 'Come on! Let's roll!'"
  ],
  "Joy": [
    "Build Rekomendasi: Genius Wand, Concentrated Energy, Holy Crystal.",
    "Counter Hero: Khufra, Minsitthar, Phoveus.",
    "Fakta: Hero irama musik (Leonin), ultinya butuh ketukan lagu yang pas, punya 3 skin.",
    "Suara Draft Pick: 'The rhythm of the battlefield is mine!'"
  ],
  "Julian": [
    "Build Rekomendasi: Genius Wand, Feather of Heaven, Holy Crystal.",
    "Counter Hero: Chou, Lancelot, Phoveus.",
    "Fakta: Fighter/Mage kolaborasi Jujutsu Kaisen (Megumi Fushiguro), hero tanpa level ultimate (bisa combo bebas sejak level 3).",
    "Suara Draft Pick: 'I'll bring the dawn!'"
  ],
  "Kadita": [
    "Build Rekomendasi: Lightning Truncheon, Genius Wand, Holy Crystal.",
    "Counter Hero: Lancelot, Chou, Athena's Shield.",
    "Fakta: Hero asal cerita legenda Indonesia (Nyi Roro Kidul), mage burst AOE tinggi.",
    "Suara Draft Pick: 'The ocean waves are so soothing.'"
  ],
  "Kagura": [
    "Build Rekomendasi: Lightning Truncheon, Genius Wand, Holy Crystal.",
    "Counter Hero: Lancelot, Chou, Hayabusa.",
    "Fakta: Gadis payung dari klan Onmyoji, total lebih dari 8 skin (termasuk Water Lily).",
    "Suara Draft Pick: 'A thought to miss you, another to hate.'"
  ],
  "Kaja": [
    "Build Rekomendasi: Fleeting Time, Dominance Ice, Athena's Shield.",
    "Counter Hero: Diggie (walau Kaja tetap bisa culik 1 orang dengan Suppress).",
    "Fakta: Penculik mematikan berkat efek Suppress-nya, punya 6 skin.",
    "Suara Draft Pick: 'Justice will be served.'"
  ],
  "Karina": [
    "Build Rekomendasi: Calamity Reaper, Holy Crystal, Divine Glaive.",
    "Counter Hero: Chou, Akai, Franco.",
    "Fakta: Assassin mage spesialis anti-MM berkat pasif tangkisan basic attack, punya skin KOF (Leona).",
    "Suara Draft Pick: 'My pleasure.'"
  ],
  "Karrie": [
    "Build Rekomendasi: Endless Battle, Golden Staff, Demon Hunter Sword.",
    "Counter Hero: Natalia, Lancelot, Ling.",
    "Fakta: Marksman spesialis true damage anti-tank terbaik di MLBB, punya 8 skin.",
    "Suara Draft Pick: 'Speed, precision, and strength!'"
  ],
  "Khaleed": [
    "Build Rekomendasi: Blade of Heptaseas, Hunter Strike, Blade of Despair.",
    "Counter Hero: Baxia, Chou, Valir.",
    "Fakta: Pangeran padang pasir yang bisa 'berselancar' di atas pasir, punya 4 skin.",
    "Suara Draft Pick: 'Sand and wind, answer my call!'"
  ],
  "Khufra": [
    "Build Rekomendasi: Dominance Ice, Athena's Shield, Immortality.",
    "Counter Hero: Valir, Karrie, Diggie.",
    "Fakta: Raja gurun kuno berbentuk mumi yang bisa berubah jadi bola anti-dash (counter Fanny, Lancelot).",
    "Suara Draft Pick: 'Let's see what's beneath the bandages.'"
  ],
  "Kimmy": [
    "Build Rekomendasi: Ice Queen Wand, Genius Wand, Glowing Wand.",
    "Counter Hero: Lancelot, Natalia, Chou.",
    "Fakta: Hero bertipe hybrid penembak twin-stick, berkolaborasi dengan Star Wars (Jetpack Trooper).",
    "Suara Draft Pick: 'Let's mix it up!'"
  ],
  "Lancelot": [
    "Build Rekomendasi: Hunter Strike, Endless Battle, Blade of Despair.",
    "Counter Hero: Khufra, Ruby, Chou.",
    "Fakta: Pembunuh tampan bergaya anggar, sering dipakai freestyle (Thorned Rose tak terlihat), punya skin kolaborasi BREN Esports M2.",
    "Suara Draft Pick: 'Time to witness the handsome!'"
  ],
  "Lapu-Lapu": [
    "Build Rekomendasi: Bloodlust Axe, Hunter Strike, Dominance Ice.",
    "Counter Hero: Chou, Esmeralda, Baxia.",
    "Fakta: Hero dari Filipina yang menahan penjajahan, fighter tebal bersenjata kembar.",
    "Suara Draft Pick: 'Enemies are many, and I am alone. But we shall see!'"
  ],
  "Layla": [
    "Build Rekomendasi: Windtalker, Berserker's Fury, Blade of Despair.",
    "Counter Hero: Natalia, Lancelot, Ling.",
    "Fakta: Hero tutorial yang pertama dimainkan semua orang, punya skin Anime (Miss Hikari) dan total 9 skin.",
    "Suara Draft Pick: 'We can do it!'"
  ],
  "Leomord": [
    "Build Rekomendasi: Hunter Strike, Bloodlust Axe, Blade of Despair.",
    "Counter Hero: Valir, Akai, Karrie.",
    "Fakta: Ksatria berkuda (Barbiel) dengan pukulan critical pasti ke musuh sekarat, punya 6 skin.",
    "Suara Draft Pick: 'Despair is darker than death.'"
  ],
  "Lesley": [
    "Build Rekomendasi: Berserker's Fury, Endless Battle, Blade of Despair.",
    "Counter Hero: Natalia, Lancelot, Aldous.",
    "Fakta: Marksman/Assassin pencicil satu tembakan fatal (True Damage Critical), punya skin Legend (Angelic Agent).",
    "Suara Draft Pick: 'Sniper ready. Give me a target.'"
  ],
  "Ling": [
    "Build Rekomendasi: Berserker's Fury, Endless Battle, Malefic Roar.",
    "Counter Hero: Khufra, Ruby, Minsitthar.",
    "Fakta: Punya mobilitas gila bisa berdiri di atas tembok map, punya skin Kung Fu Panda (Lord Shen).",
    "Suara Draft Pick: 'I am the sword that strikes the sky.'"
  ],
  "Lolita": [
    "Build Rekomendasi: Dominance Ice, Athena's Shield, Radiant Armor.",
    "Counter Hero: Diggie, Chou, Valir.",
    "Fakta: Punya tameng penahan peluru, support tank perlindungan terkuat, punya 6 skin.",
    "Suara Draft Pick: 'I will protect you!'"
  ],
  "Lunox": [
    "Build Rekomendasi: Lightning Truncheon, Genius Wand, Holy Crystal.",
    "Counter Hero: Lancelot, Chou, Hayabusa.",
    "Fakta: Mage perpaduan mode terang (anti-burst) dan malam (burst penembus tank), punya 8 skin (termasuk Legend).",
    "Suara Draft Pick: 'I am willing to sacrifice myself, for this world I love.'"
  ],
  "Luo Yi": [
    "Build Rekomendasi: Enchanted Talisman, Glowing Wand, Holy Crystal.",
    "Counter Hero: Lancelot, Chou, Ling.",
    "Fakta: Mage teleport pembuka map (Diversion) dengan kutukan Yin Yang, punya 5 skin.",
    "Suara Draft Pick: 'Yin and Yang, the cycle of the universe.'"
  ],
  "Lylia": [
    "Build Rekomendasi: Ice Queen Wand, Glowing Wand, Genius Wand.",
    "Counter Hero: Chou, Kaja, Franco (Culikan sebelum ulti).",
    "Fakta: Mage cilik pelempar ranjau peledak dengan ulti (Black Shoes) pengembali darah, punya 6 skin.",
    "Suara Draft Pick: 'It's time for some magic!'"
  ],
  "Marcel": [
    "Build Rekomendasi: Fleeting Time, Oracle, Dominance Ice.",
    "Counter Hero: Esmeralda, Baxia, Valir.",
    "Fakta: Support hero baru (2025/2026) dengan spesialisasi kontrol zona shield pelindung.",
    "Suara Draft Pick: 'My barrier will protect you all.'"
  ],
  "Martis": [
    "Build Rekomendasi: Hunter Strike, Blade of Despair, Dominance Ice.",
    "Counter Hero: Baxia, Esmeralda, Phoveus.",
    "Fakta: Jungler preman early game, sang raja Ashura anti-CC, punya 6 skin.",
    "Suara Draft Pick: 'Three thousand worlds, and not a single worthy foe!'"
  ],
  "Masha": [
    "Build Rekomendasi: Corrosion Scythe, Demon Hunter Sword, Golden Staff.",
    "Counter Hero: Baxia, Esmeralda, Valir.",
    "Fakta: Fighter 3 lapis HP bar, pencuri tower tercepat di game, punya 5 skin (termasuk KOF Mai Shiranui).",
    "Suara Draft Pick: 'I am the wild!'"
  ],
  "Mathilda": [
    "Build Rekomendasi: Fleeting Time, Oracle, Dominance Ice.",
    "Counter Hero: Chou, Kaja, Khufra.",
    "Fakta: Support assassin hibrida pertama, ultinya memungkinkan kawan terbang, punya 4 skin.",
    "Suara Draft Pick: 'The wind guides my path.'"
  ],
  "Melissa": [
    "Build Rekomendasi: Windtalker, Berserker's Fury, Malefic Roar.",
    "Counter Hero: Belerick, Blade Armor, Franco.",
    "Fakta: Marksman penjahit boneka voodoo, ultinya tameng anti-melee, kolaborasi Jujutsu Kaisen (Nobara).",
    "Suara Draft Pick: 'Don't touch my dolls!'"
  ],
  "Minotaur": [
    "Build Rekomendasi: Dominance Ice, Athena's Shield, Radiant Armor.",
    "Counter Hero: Diggie, Valir, Karrie.",
    "Fakta: Tank hibrida support penyembuh dengan ultimate guncangan banteng raksasa, punya 7 skin.",
    "Suara Draft Pick: 'My hammer is at your behest!'"
  ],
  "Minsitthar": [
    "Build Rekomendasi: Corrosion Scythe, Demon Hunter Sword, Golden Staff.",
    "Counter Hero: Baxia, Esmeralda, Valir.",
    "Fakta: Raja Myanmar, sang penakluk hero dasher berkat penjara tombaknya, punya 4 skin.",
    "Suara Draft Pick: 'For my kingdom, I will fight to the end!'"
  ],
  "Miya": [
    "Build Rekomendasi: Windtalker, Berserker's Fury, Blade of Despair.",
    "Counter Hero: Natalia, Lancelot, Ling.",
    "Fakta: Hero ikon MLBB, rilis hari pertama, punya 11 skin (termasuk Modena Butterfly Legend).",
    "Suara Draft Pick: 'Wise choice!'"
  ],
  "Moskov": [
    "Build Rekomendasi: Windtalker, Berserker's Fury, Haas's Claws.",
    "Counter Hero: Belerick, Natalia, Blade Armor.",
    "Fakta: MM tembus belakang, punya ulti lempar tombak dari ujung ke ujung map, punya skin Doom Incarnate.",
    "Suara Draft Pick: 'The spear of destiny!'"
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
console.log("Injected extra clues Part 2!");
