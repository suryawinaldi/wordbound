const fs = require('fs');

const EXTRA_CLUES = {
  "Aamon": [
    "Build Rekomendasi: Feather of Heaven, Genius Wand, Holy Crystal.",
    "Counter Hero: Ruby, Saber, Eudora (Burst CC sangat efektif menghentikannya).",
    "Fakta: Memiliki sekitar 4 skin (termasuk Elite dan Starlight).",
    "Suara Draft Pick: 'It is better to be feared than loved, if you cannot both.'"
  ],
  "Akai": [
    "Build Rekomendasi: Cursed Helmet, Dominance Ice, Radiant Armor.",
    "Counter Hero: Diggie (Ultimate-nya menghilangkan efek CC Akai), Valir, Baxia.",
    "Fakta: Rilis di masa awal MLBB (2016), kini memiliki sekitar 9 skin (termasuk Epic, Kungfu Panda).",
    "Suara Draft Pick: 'Let's go out and relax!'"
  ],
  "Aldous": [
    "Build Rekomendasi: Thunder Belt, Malefic Roar, Brute Force Breastplate.",
    "Counter Hero: Chou, Lancelot, Twilight Armor (item counter alami).",
    "Fakta: Hero spesialis lategame dengan total lebih dari 7 skin (termasuk M1 Champion).",
    "Suara Draft Pick: 'My fists are unflinching!'"
  ],
  "Alice": [
    "Build Rekomendasi: Clock of Destiny, Lightning Truncheon, Winter Truncheon.",
    "Counter Hero: Baxia, Sea Halberd/Dominance Ice (Counter regen), Kaja.",
    "Fakta: Salah satu hero tertua, memiliki 7 skin (termasuk Epic Wizardry Teacher).",
    "Suara Draft Pick: 'Watch your back!'"
  ],
  "Alpha": [
    "Build Rekomendasi: War Axe, Bloodlust Axe, Hunter Strike.",
    "Counter Hero: Freya, Baxia, Esmeralda.",
    "Fakta: Memiliki lebih dari 7 skin (termasuk Onimusha Commander Epic).",
    "Suara Draft Pick: 'Test, Alpha is online.'"
  ],
  "Alucard": [
    "Build Rekomendasi: Endless Battle, Blade of Despair, Hunter Strike.",
    "Counter Hero: Khufra, Baxia, Akai.",
    "Fakta: Salah satu hero paling awal, memiliki 9+ skin (termasuk Legend Obsidian Blade).",
    "Suara Draft Pick: 'Nothing lasts forever, we can change the future!'"
  ],
  "Angela": [
    "Build Rekomendasi: Fleeting Time, Ice Queen Wand, Necklace of Durance.",
    "Counter Hero: Saber, Chou, Franco (Assassin penebas backline).",
    "Fakta: Support paling populer, memiliki lebih dari 8 skin (termasuk Sanrio Hello Kitty, Collector, Annual Starlight).",
    "Suara Draft Pick: 'Love and hope are the two greatest inventions.'"
  ],
  "Argus": [
    "Build Rekomendasi: Corrosion Scythe, Demon Hunter Sword, Golden Staff.",
    "Counter Hero: Akai, Jawhead, Valir (Penyebab kiting saat ulti aktif).",
    "Fakta: Memiliki 6 skin (termasuk Darth Vader Star Wars).",
    "Suara Draft Pick: 'All shall perish by my sword!'"
  ],
  "Arlott": [
    "Build Rekomendasi: Hunter Strike, Bloodlust Axe, Oracle.",
    "Counter Hero: Phoveus, Khufra, Minsitthar (Counter Dash).",
    "Fakta: Rilis di tahun 2023, memiliki 2-3 skin (Basic, Starlight).",
    "Suara Draft Pick: 'I will destroy all who stand in my way.'"
  ],
  "Atlas": [
    "Build Rekomendasi: Dominance Ice, Fleeting Time, Athena's Shield.",
    "Counter Hero: Diggie, Valir, Akai.",
    "Fakta: Tank inisiator dengan 5 skin (termasuk Starlight dan MSC).",
    "Suara Draft Pick: 'The ocean is not just our home, it is who we are.'"
  ],
  "Aulus": [
    "Build Rekomendasi: Windtalker, Berserker's Fury, Haas's Claws.",
    "Counter Hero: Chou, Paquito, Valir.",
    "Fakta: Memiliki sekitar 3 skin (Basic, Elite).",
    "Suara Draft Pick: 'Axe is my name, fighting is my game!'"
  ],
  "Aurora": [
    "Build Rekomendasi: Lightning Truncheon, Genius Wand, Holy Crystal.",
    "Counter Hero: Lancelot, Helcurt, Kaja.",
    "Fakta: Mage lawas yang baru saja direvamp (2024), memiliki 7 skin (termasuk Kula Diamond KOF).",
    "Suara Draft Pick: 'Listen to the sound of snowing.'"
  ],
  "Badang": [
    "Build Rekomendasi: Demon Hunter Sword, Golden Staff, Corrosion Scythe.",
    "Counter Hero: Chou, Benedetta, Kagura (Hero yang mudah lolos dari tembok).",
    "Fakta: Hero adaptasi Malaysia, memiliki 6 skin (termasuk Pegasus Seiya dan Collector).",
    "Suara Draft Pick: 'No one can escape my iron fist.'"
  ],
  "Balmond": [
    "Build Rekomendasi: Cursed Helmet, Bloodlust Axe, Guardian Helmet.",
    "Counter Hero: Karrie, Lunox, Dyrroth (Penghancur Tank).",
    "Fakta: Hero fighter/tank legendaris, punya lebih dari 7 skin.",
    "Suara Draft Pick: 'What's your name, boy?!'"
  ],
  "Bane": [
    "Build Rekomendasi: Blade of Despair, Hunter Strike, Malefic Roar (Physical) atau Clock of Destiny + Lightning Truncheon (Magic).",
    "Counter Hero: Chou, Lancelot, Fanny.",
    "Fakta: Sudah mengalami lebih dari 2 kali perombakan (revamp) tampilan, memiliki 6 skin (termasuk Epic Soul Defiler).",
    "Suara Draft Pick: 'Target locked!'"
  ],
  "Barats": [
    "Build Rekomendasi: Cursed Helmet, Guardian Helmet, Thunder Belt.",
    "Counter Hero: Karrie, Claude, Baxia (Pengurang heal dan anti-tank).",
    "Fakta: Menunggangi naga/dinosaurus Detona, memiliki sekitar 5 skin.",
    "Suara Draft Pick: 'I'll take the front, Detona!'"
  ],
  "Baxia": [
    "Build Rekomendasi: Cursed Helmet, Dominance Ice, Radiant Armor.",
    "Counter Hero: Karrie, Lunox, Valir.",
    "Fakta: Tank anti-regen, punya sekitar 5 skin (termasuk Burger Baxia).",
    "Suara Draft Pick: 'Justice is the last comfort of the helpless.'"
  ],
  "Beatrix": [
    "Build Rekomendasi: Blade of Despair, Hunter Strike, Malefic Roar.",
    "Counter Hero: Natalia, Lancelot, Chou (Burst Assassin).",
    "Fakta: Memiliki mekanisme 4 senjata berbeda, jumlah skin sekitar 5 (termasuk M4 Champion).",
    "Suara Draft Pick: 'Time to shine!'"
  ],
  "Belerick": [
    "Build Rekomendasi: Dominance Ice, Blade Armor, Oracle.",
    "Counter Hero: Karrie, Lunox, Valir.",
    "Fakta: Sempat direvamp wujudnya dari monster akar menjadi makhluk raksasa tegap, punya 5 skin.",
    "Suara Draft Pick: 'My life belongs to the forest.'"
  ],
  "Benedetta": [
    "Build Rekomendasi: Bloodlust Axe, Hunter Strike, Blade of Despair.",
    "Counter Hero: Minsitthar (Counter mutlak dash), Khufra, Phoveus.",
    "Fakta: Assassin andalan dengan sekitar 5 skin (termasuk Collector dan Ducati).",
    "Suara Draft Pick: 'When the body suffers, the spirit blooms.'"
  ],
  "Brody": [
    "Build Rekomendasi: Blade of Despair, Malefic Roar, Wind of Nature.",
    "Counter Hero: Natalia, Ling, Hayabusa.",
    "Fakta: Marksman dengan attack speed lambat, punya sekitar 5 skin (termasuk S.T.U.N. Brody).",
    "Suara Draft Pick: 'I am a memory that has been forgotten.'"
  ],
  "Bruno": [
    "Build Rekomendasi: Berserker's Fury, Haas's Claws, Windtalker.",
    "Counter Hero: Natalia, Lancelot, Khufra.",
    "Fakta: Punya skin kolaborasi Neymar Jr, total 7+ skin.",
    "Suara Draft Pick: 'Wait for it...'"
  ],
  "Carmilla": [
    "Build Rekomendasi: Dominance Ice, Oracle, Cursed Helmet.",
    "Counter Hero: Diggie, Valir, Chou.",
    "Fakta: Support tank yang bisa di-combo dengan Cecilion, memiliki 4 skin.",
    "Suara Draft Pick: 'True love is like blood.'"
  ],
  "Cecilion": [
    "Build Rekomendasi: Clock of Destiny, Lightning Truncheon, Divine Glaive.",
    "Counter Hero: Lancelot, Chou, Ling (Bisa masuk ke jarak dekat Cecilion).",
    "Fakta: Mage lategame andalan, memiliki sekitar 5 skin (termasuk Collector).",
    "Suara Draft Pick: 'A real masterpiece requires... true feeling.'"
  ],
  "Chang'e": [
    "Build Rekomendasi: Ice Queen Wand, Glowing Wand, Genius Wand.",
    "Counter Hero: Lolita (Shield-nya bisa menahan ultimate Chang'e), Ling.",
    "Fakta: Selalu ditemani kelinci, memiliki sekitar 7 skin (termasuk Epic Floral Elfo).",
    "Suara Draft Pick: 'Let's play together!'"
  ],
  "Chip": [
    "Build Rekomendasi: Dominance Ice, Athena's Shield, Antique Cuirass.",
    "Counter Hero: Diggie, Akai, Valir.",
    "Fakta: Rilis di 2024, hobi makan keripik.",
    "Suara Draft Pick: 'I'm out of chips!'"
  ],
  "Chou": [
    "Build Rekomendasi: Blade of Despair, Hunter Strike, Malefic Roar (Atau Full Tank).",
    "Counter Hero: Khufra, Minsitthar, Nana.",
    "Fakta: Memiliki kolaborasi Iori Yagami (KOF) dan Saint Seiya, total lebih dari 10 skin.",
    "Suara Draft Pick: 'Wipe out all the injustice in the world!'"
  ],
  "Cici": [
    "Build Rekomendasi: War Axe, Hunter Strike, Brute Force Breastplate.",
    "Counter Hero: Baxia, Phoveus, Minsitthar.",
    "Fakta: Menggunakan Yo-yo, memiliki 2-3 skin.",
    "Suara Draft Pick: 'Come on! Show me your moves!'"
  ],
  "Claude": [
    "Build Rekomendasi: Demon Hunter Sword, Golden Staff, Corrosion Scythe.",
    "Counter Hero: Belerick, Blade Armor (Item), Saber.",
    "Fakta: Memiliki monyet bernama Dexter, total lebih dari 9 skin.",
    "Suara Draft Pick: 'Hey! Get out of the way!'"
  ],
  "Clint": [
    "Build Rekomendasi: Endless Battle, Blade of Despair, Berserker's Fury.",
    "Counter Hero: Natalia, Lancelot, Ling.",
    "Fakta: Marksman koboi dengan 8 skin (termasuk M2 Champion).",
    "Suara Draft Pick: 'Justice served.'"
  ],
  "Cyclops": [
    "Build Rekomendasi: Enchanted Talisman, Concentrated Energy, Genius Wand.",
    "Counter Hero: Lancelot, Chou, Hayabusa.",
    "Fakta: Punya julukan 'Handsome with one eye', kolaborasi Master Yoda (Star Wars), punya 8 skin.",
    "Suara Draft Pick: 'You got a good taste!'"
  ]
};

const heroesFile = 'src/data/ml-heroes.js';
let content = fs.readFileSync(heroesFile, 'utf8');

const jsonStart = content.indexOf('[');
const jsonEnd = content.lastIndexOf(']');
let heroes = JSON.parse(content.substring(jsonStart, jsonEnd + 1));

const enrichedHeroes = heroes.map(hero => {
  if (EXTRA_CLUES[hero.name]) {
    // If it currently has 3 clues, push the new ones up to 7
    const extra = EXTRA_CLUES[hero.name];
    if (hero.clues.length === 3) {
      hero.clues.push(...extra);
    }
  }
  return hero;
});

const contentStr = "// Auto-generated Detailed Heroes Data (Total: " + enrichedHeroes.length + " Heroes)\nexport const ML_HEROES = " + JSON.stringify(enrichedHeroes, null, 2) + ";\n";
fs.writeFileSync(heroesFile, contentStr);
console.log("Injected extra clues Part 1!");
