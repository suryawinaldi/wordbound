// Editorial preview: rewritten clues, NOT externally verified. See README.md.
// Source URLs are review references, not evidence of completed verification.
import { EXPANDED_ENTRIES } from "./expanded-content.js";
const entries = [
  [
    "franco",
    "Franco",
    "Tank",
    [],
    [
      ["Asal", "Lautan dingin di utara menjadi bagian dari kisahnya."],
      ["Gaya main", "Ia berbahaya ketika berhasil memisahkan satu lawan dari kelompoknya."],
      ["Kemampuan", "Ultimate-nya menahan satu target dengan efek suppression."],
      ["Senjata", "Sebuah kait berantai menjadi alat andalannya untuk menangkap lawan."],
      ["Ciri khas", "Iron Hook menarik musuh mendekat sebelum Bloody Hunt menguncinya."],
    ],
  ],
  [
    "fanny",
    "Fanny",
    "Assassin",
    [],
    [
      ["Asal", "Ia adalah seorang pejuang manusia dari Moniyan."],
      ["Sumber daya", "Kemampuannya menggunakan energi, bukan mana."],
      ["Gaya main", "Dinding di arena menjadi bagian penting dari jalur pergerakannya."],
      ["Senjata", "Ia melesat di udara sambil menyerang dengan sepasang pedang."],
      ["Ciri khas", "Steel Cable mengait dinding dan membuatnya terbang melintasi arena."],
    ],
  ],
  [
    "angela",
    "Angela",
    "Support",
    [],
    [
      ["Kisah", "Ia merupakan makhluk buatan yang memiliki kepedulian terhadap orang lain."],
      ["Gaya main", "Ia dapat membantu rekan meskipun berada sangat jauh darinya."],
      ["Kemampuan", "Serangan berbentuk hati bisa memulihkan rekan dan melukai lawan."],
      ["Kemampuan", "Benang yang terhubung ke lawan dapat menahannya jika tidak terputus."],
      ["Ciri khas", "Heartguard membuat boneka ini masuk ke tubuh rekan dan memberinya perisai."],
    ],
  ],
  [
    "johnson",
    "Johnson",
    "Tank",
    [],
    [
      ["Kisah", "Masa lalunya berkaitan dengan olahraga sebelum tubuhnya berubah."],
      ["Pertahanan", "Saat HP-nya menipis, sebuah perisai membantu melindunginya."],
      ["Kemampuan", "Ia dapat membawa seorang rekan dalam perjalanan melintasi peta."],
      ["Gaya main", "Tabrakan yang tepat dapat membuka pertempuran untuk timnya."],
      ["Ciri khas", "Tubuh robot ini berubah menjadi mobil yang bisa dikemudikan."],
    ],
  ],
  [
    "gusion",
    "Gusion",
    "Assassin",
    [],
    [
      ["Asal", "Ia berasal dari keluarga bangsawan yang memiliki tradisi sihir."],
      ["Kisah", "Ia memilih menggabungkan kemampuan sihir dengan pertarungan jarak dekat."],
      ["Kemampuan", "Sebuah proyektil dapat menandai lawan untuk didekati kembali."],
      ["Senjata", "Ia melempar banyak belati dan menariknya kembali untuk menyerang."],
      ["Ciri khas", "Incandescence menyegarkan kemampuannya untuk melanjutkan kombo belati."],
    ],
  ],
  [
    "nana",
    "Nana",
    "Mage",
    [],
    [
      ["Asal", "Ia berasal dari ras Leonin yang tinggal di wilayah peri."],
      ["Pertahanan", "Pasifnya dapat memberinya kesempatan lolos dari serangan mematikan."],
      ["Senjata", "Ia melempar bumerang yang kembali lagi kepadanya."],
      ["Kemampuan", "Rekan kecilnya bisa mengubah wujud lawan dan membatasi gerak mereka."],
      ["Ciri khas", "Molina menjadi nama rekan sekaligus ciri khas kemampuan transformasinya."],
    ],
  ],
  [
    "tigreal",
    "Tigreal",
    "Tank",
    [],
    [
      ["Asal", "Ia adalah sosok militer dari Kekaisaran Moniyan."],
      ["Gaya main", "Ia berdiri di garis depan dan membuka kesempatan bagi rekan setim."],
      ["Kemampuan", "Ia dapat mendorong lawan, lalu mengangkat mereka ke udara."],
      ["Perlengkapan", "Armor berat, pedang besar, dan perisai menjadi ciri penampilannya."],
      ["Ciri khas", "Implosion mengumpulkan lawan di sekitarnya untuk mengunci mereka bersama."],
    ],
  ],
  [
    "chou",
    "Chou",
    "Fighter",
    [],
    [
      ["Kisah", "Ia tumbuh di lingkungan miskin dan belajar membela orang lain."],
      ["Gaya main", "Ia mengandalkan pertarungan jarak dekat dan gerakan bela diri."],
      ["Kemampuan", "Gerakan Shunpo membantunya berpindah posisi dalam pertempuran."],
      ["Kemampuan", "Jeet Kune Do menyerang bertahap dan dapat mengangkat lawan."],
      [
        "Ciri khas",
        "The Way of Dragon menendang satu lawan menjauh, lalu bisa diikuti serangan lanjutan.",
      ],
    ],
  ],
  [
    "x-borg",
    "X.Borg",
    "Fighter",
    ["X Borg"],
    [
      ["Kisah", "Kebakaran dan teknologi menjadi bagian dari masa lalunya."],
      ["Pertahanan", "Ia memiliki armor yang dapat hancur sebelum tubuhnya benar-benar kalah."],
      ["Kemampuan", "Panas yang menumpuk pada lawan memperkuat ancaman serangannya."],
      ["Senjata", "Ia menyemburkan api sambil bergerak untuk menjaga jarak dari lawan."],
      [
        "Ciri khas",
        "Firaga Armor dan ledakan Last Insanity menjadi ciri khas petarung berapi ini.",
      ],
    ],
  ],
  [
    "yi-sun-shin",
    "Yi Sun-shin",
    "Assassin / Marksman",
    ["YSS"],
    [
      ["Kisah", "Ia adalah seorang pemimpin armada yang melindungi tanah kelahirannya."],
      ["Gaya main", "Ia bisa berganti antara serangan jarak dekat dan jarak jauh."],
      ["Senjata", "Busur dan pedang digunakan bergantian sesuai jarak lawan."],
      ["Kemampuan", "Ultimate-nya menyerang lokasi seluruh hero lawan dari jauh."],
      ["Ciri khas", "Mountain Shocker dan kapal kura-kura menjadi ciri khas sang laksamana."],
    ],
  ],
  [
    "chang-e",
    "Chang'e",
    "Mage",
    [],
    [
      ["Asal", "Kisahnya berkaitan dengan seorang murid muda di wilayah timur."],
      ["Gaya main", "Ia menyerang dari jauh dan mengandalkan rentetan proyektil."],
      ["Kemampuan", "Sebuah perisai dapat memperkuat serangan-serangannya."],
      ["Penampilan", "Ia melayang di atas bulan sabit dan memiliki kaitan dengan kelinci."],
      ["Ciri khas", "Meteor Shower menghujani area di depannya dengan banyak meteor kecil."],
    ],
  ],
  [
    "popol-and-kupa",
    "Popol and Kupa",
    "Marksman",
    ["Popol & Kupa"],
    [
      ["Asal", "Petualangannya bermula di wilayah utara yang dingin."],
      ["Gaya main", "Ia tidak bertarung sendirian, tetapi bersama sahabat hewannya."],
      ["Kemampuan", "Perangkap membantu mengawasi area dan menghentikan lawan."],
      ["Senjata", "Seorang anak melempar tombak sementara seekor serigala menyerang targetnya."],
      [
        "Ciri khas",
        "Ultimate We Are Angry! memperkuat kerja sama anak pemburu dan serigala putihnya.",
      ],
    ],
  ],
];

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const kinds = ["Jejak", "Gaya main", "Kemampuan", "Ciri khas", "Signature"];
const expanded = EXPANDED_ENTRIES.map(([name, role, ...clues]) => [
  slug(name),
  name,
  role,
  [],
  clues.map((text, index) => [kinds[index], text]),
]);

export const HEROES = [...entries, ...expanded].map(([id, name, role, aliases, clues]) => {
  const sourceUrl = `https://mobile-legends.fandom.com/wiki/${encodeURIComponent(name.replaceAll(" ", "_"))}`;
  return {
    id,
    name,
    role,
    aliases,
    enabled: true,
    reviewStatus: "needs_review",
    verifiedAt: null,
    sourceUrl,
    clues: clues.map(([type, text], index) => ({
      order: index + 1,
      type,
      text,
      sourceUrl,
      sourceKind: "community_wiki_reference",
      reviewStatus: "needs_review",
      verifiedAt: null,
      reviewer: null,
      patch: null,
      evidence: null,
    })),
  };
});

// These legacy rows contain placeholders or unsupported release/skill claims.
// Preserve coverage without inventing five clues or treating them as verified.
export const PENDING_HEROES = [
  ["Hirara", "Roster dan kemampuan belum dapat dikonfirmasi; data lama berupa placeholder."],
  ["Kalea", "Petunjuk lama berupa placeholder; lima fakta spesifik perlu dikonfirmasi."],
  ["Lukas", "Petunjuk lama berupa placeholder; lima fakta spesifik perlu dikonfirmasi."],
  ["Marcel", "Klaim rilis dan kemampuan dalam data lama belum memiliki bukti sumber."],
  ["Obsidia", "Klaim rilis dan kemampuan dalam data lama belum memiliki bukti sumber."],
  ["Sora", "Klaim rilis dan kemampuan dalam data lama belum memiliki bukti sumber."],
  ["Zetian", "Deskripsi kemampuan dalam data lama perlu dicocokkan dengan sumber resmi."],
].map(([name, reason]) => ({
  id: slug(name),
  name,
  role: null,
  aliases: [],
  enabled: false,
  clues: [],
  reviewStatus: "blocked",
  verifiedAt: null,
  reason,
  sourceUrl: `https://mobile-legends.fandom.com/wiki/${encodeURIComponent(name)}`,
}));

export const ROSTER = [...HEROES, ...PENDING_HEROES].sort((a, b) => a.name.localeCompare(b.name));
export const CONTENT_VERSION = "editorial-preview-2";
export const COMPATIBLE_CONTENT_VERSIONS = ["editorial-preview-1", CONTENT_VERSION];
