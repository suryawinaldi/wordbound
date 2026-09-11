const fs = require('fs');
const https = require('https');

let content = fs.readFileSync('src/data/ml-heroes.js', 'utf8');
const jsonStart = content.indexOf('[');
const jsonEnd = content.lastIndexOf(']');
let heroes = JSON.parse(content.substring(jsonStart, jsonEnd + 1));

const chunkArray = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));

async function fetchUrls(titles) {
  const url = `https://mobile-legends.fandom.com/api.php?action=query&prop=imageinfo&iiprop=url&titles=${titles.join('|')}&format=json`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

// Some heroes have slightly different audio file names, but `.select.ogg` is standard.
// If there's a space, usually Fandom replaces with underscore or leaves it.
async function run() {
  const titles = heroes.map(h => `File:${h.name.replace(/ /g, '_')}.select.ogg`);
  const chunks = chunkArray(titles, 40);
  
  let urlMap = {};

  for (const chunk of chunks) {
    const data = await fetchUrls(chunk);
    if (data && data.query && data.query.pages) {
      for (const pageId in data.query.pages) {
        const page = data.query.pages[pageId];
        if (page.imageinfo && page.imageinfo[0].url) {
          urlMap[page.title.toLowerCase()] = page.imageinfo[0].url;
        }
      }
    }
  }

  // Update heroes
  const updatedHeroes = heroes.map(hero => {
    const expectedTitle = `File:${hero.name.replace(/ /g, '_')}.select.ogg`.toLowerCase();
    if (urlMap[expectedTitle]) {
      hero.audioUrl = urlMap[expectedTitle];
    } else {
      hero.audioUrl = null; // fallback
    }
    return hero;
  });

  const contentStr = "// Auto-generated Detailed Heroes Data (Total: " + updatedHeroes.length + " Heroes)\nexport const ML_HEROES = " + JSON.stringify(updatedHeroes, null, 2) + ";\n";
  fs.writeFileSync('src/data/ml-heroes.js', contentStr);
  console.log("Audio URLs fetched and added!");
}

run();
