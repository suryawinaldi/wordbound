const fs = require('fs');

let content = fs.readFileSync('src/data/ml-heroes.js', 'utf8');

const jsonStart = content.indexOf('[');
const jsonEnd = content.lastIndexOf(']');
let heroes = JSON.parse(content.substring(jsonStart, jsonEnd + 1));

const paddedHeroes = heroes.map(hero => {
  while (hero.clues.length < 7) {
    if (hero.clues.length === 3) hero.clues.push(`Build Rekomendasi: Gunakan kombinasi item terbaik sesuai gaya bermain ${hero.name}.`);
    else if (hero.clues.length === 4) hero.clues.push(`Counter Hero: Hati-hati terhadap hero dengan crowd control atau burst damage yang tinggi.`);
    else if (hero.clues.length === 5) hero.clues.push(`Fakta: Hero ini memiliki basis penggemar tersendiri dan beberapa skin pilihan.`);
    else if (hero.clues.length === 6) hero.clues.push(`Suara Draft Pick: "I am ready for the battlefield!" (Suara pertarungan misterius)`);
  }
  return hero;
});

const contentStr = "// Auto-generated Detailed Heroes Data (Total: " + paddedHeroes.length + " Heroes)\nexport const ML_HEROES = " + JSON.stringify(paddedHeroes, null, 2) + ";\n";
fs.writeFileSync('src/data/ml-heroes.js', contentStr);
console.log("All heroes padded to exactly 7 clues!");
