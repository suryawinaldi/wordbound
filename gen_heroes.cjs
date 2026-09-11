const fs = require('fs');

const content = fs.readFileSync(String.raw`C:\Users\surya\.gemini\antigravity\brain\8bf64a64-776b-4617-b906-505fe312989a\.system_generated\steps\507\content.md`, 'utf-8');

// Regex for the heroes
const regex = /\[(.*?)\]\(https:\/\/mlbb\.io\/id\/hero\/([^/]+)\)/g;
const heroLinks = [];
let match;
while ((match = regex.exec(content)) !== null) {
    if (!match[2].includes('counter') && !match[2].includes('guide')) {
        heroLinks.push(match[2]);
    }
}

// deduplicate
const uniqueSlugs = [...new Set(heroLinks)];

// Now we need to find their Role, Lane, Speciality.
// They are usually listed below `## HeroName` or `[HeroNameRole...](link)`
const heroes = [];
const blocks = content.split('[Counter →]');

for (let block of blocks) {
    if (block.trim() === '') continue;
    
    // Attempt to extract from '## HeroName\nRole · Lane\nSpeciality'
    const nameMatch = block.match(/##\s+([^\n]+)/);
    let name = '';
    let roleLaneStr = '';
    let specStr = '';

    if (nameMatch) {
        name = nameMatch[1].trim();
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        const nameIdx = lines.findIndex(l => l.startsWith('## ' + name));
        if (nameIdx >= 0 && lines.length > nameIdx + 2) {
            roleLaneStr = lines[nameIdx + 1];
            specStr = lines[nameIdx + 2];
        }
    } else {
        // Fallback for Zilong bug at the end
        if (block.includes('ZilongFighter')) {
            name = 'Zilong';
            roleLaneStr = 'Fighter / Assassin · Exp Lane';
            specStr = 'Chase, Damage';
        }
    }

    if (name && roleLaneStr && specStr && roleLaneStr.includes('·')) {
        const parts = roleLaneStr.split('·');
        const role = parts[0].trim();
        const lane = parts[1].trim();
        
        let clue1 = `Bermain sebagai ${role} dan sering terlihat mendominasi di ${lane}.`;
        let clue2 = `Spesialisasi dan kekuatan utamanya berfokus pada ${specStr}.`;
        let clue3 = `Nama hero ini diawali dengan huruf '${name[0]}' dan berakhiran huruf '${name[name.length-1]}'.`;

        heroes.push({
            name,
            clues: [clue1, clue2, clue3]
        });
    }
}

// Dedup heroes by name
const uniqueHeroesMap = new Map();
for (let h of heroes) {
    uniqueHeroesMap.set(h.name, h);
}
const finalHeroes = Array.from(uniqueHeroesMap.values());

const jsContent = `// Auto-generated Mobile Legends Heroes Data (Total: ${finalHeroes.length} Heroes)
export const ML_HEROES = ${JSON.stringify(finalHeroes, null, 2)};
`;

fs.writeFileSync('src/data/ml-heroes.js', jsContent);
console.log(`Generated ${finalHeroes.length} heroes!`);
