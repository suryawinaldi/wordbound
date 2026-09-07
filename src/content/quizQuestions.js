// AUTO-MIGRATED from src/data/quiz-bank.js's QUIZ_BANK (Step 24).
// The original file is untouched and still used by existing game views —
// this is a purely additive new content layer.
//
// Kept as a distinct, curated QuizQuestion type rather than force-merged
// into LexicalItem/ExampleSentence: per the Frontend Architecture
// Blueprint's Database Strategy (Part 6), grammar questions genuinely
// need human-written content, unlike vocabulary questions which the
// Question Engine can generate automatically from LexicalItem data. This
// is a deliberate, documented refinement of the original Step 24 file-
// mapping shorthand ("merge into lexicalItems/exampleSentences"), not a
// deviation from the Blueprint's actual reasoning — see this step's
// CHANGELOG for the full explanation.

/** @type {import('./schema').QuizQuestion[]} */
export const QUIZ_QUESTIONS = [
  {
    "id": "quiz-apa-arti-kata-cat",
    "cefr": "A1",
    "tag": "vocab",
    "prompt": "Apa arti kata 'cat'?",
    "options": [
      "Anjing",
      "Kucing",
      "Burung",
      "Ikan"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-apa-arti-book",
    "cefr": "A1",
    "tag": "vocab",
    "prompt": "Apa arti 'book'?",
    "options": [
      "Buku",
      "Meja",
      "Kursi",
      "Pintu"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-she-a-teacher",
    "cefr": "A1",
    "tag": "grammar",
    "prompt": "She ___ a teacher.",
    "options": [
      "am",
      "is",
      "are",
      "be"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-i-from-indonesia",
    "cefr": "A1",
    "tag": "grammar",
    "prompt": "I ___ from Indonesia.",
    "options": [
      "is",
      "am",
      "are",
      "be"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-big-lawan-katanya-adalah",
    "cefr": "A1",
    "tag": "vocab",
    "prompt": "'Big' lawan katanya adalah...",
    "options": [
      "Small",
      "Tall",
      "Fast",
      "Long"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-they-students",
    "cefr": "A1",
    "tag": "grammar",
    "prompt": "They ___ students.",
    "options": [
      "is",
      "am",
      "are",
      "be"
    ],
    "correctIndex": 2
  },
  {
    "id": "quiz-apa-arti-water",
    "cefr": "A1",
    "tag": "vocab",
    "prompt": "Apa arti 'water'?",
    "options": [
      "Api",
      "Air",
      "Tanah",
      "Udara"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-this-is-apple",
    "cefr": "A1",
    "tag": "grammar",
    "prompt": "This is ___ apple.",
    "options": [
      "a",
      "an",
      "the",
      "-"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-happy-artinya",
    "cefr": "A1",
    "tag": "vocab",
    "prompt": "'Happy' artinya...",
    "options": [
      "Sedih",
      "Senang",
      "Marah",
      "Takut"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-he-to-school-every-day",
    "cefr": "A1",
    "tag": "grammar",
    "prompt": "He ___ to school every day.",
    "options": [
      "go",
      "goes",
      "going",
      "went"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-apa-arti-to-borrow",
    "cefr": "A2",
    "tag": "vocab",
    "prompt": "Apa arti 'to borrow'?",
    "options": [
      "Meminjam",
      "Meminjamkan",
      "Membeli",
      "Menjual"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-she-to-the-market-yesterda",
    "cefr": "A2",
    "tag": "grammar",
    "prompt": "She ___ to the market yesterday.",
    "options": [
      "go",
      "goes",
      "went",
      "going"
    ],
    "correctIndex": 2
  },
  {
    "id": "quiz-crowded-artinya",
    "cefr": "A2",
    "tag": "vocab",
    "prompt": "'Crowded' artinya...",
    "options": [
      "Sepi",
      "Ramai",
      "Bersih",
      "Kotor"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-we-watching-a-movie-now",
    "cefr": "A2",
    "tag": "grammar",
    "prompt": "We ___ watching a movie now.",
    "options": [
      "is",
      "are",
      "am",
      "be"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-sinonim-dari-fast-adalah",
    "cefr": "A2",
    "tag": "synonym",
    "prompt": "Sinonim dari 'fast' adalah...",
    "options": [
      "Slow",
      "Quick",
      "Heavy",
      "Loud"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-expensive-lawan-katanya",
    "cefr": "A2",
    "tag": "vocab",
    "prompt": "'Expensive' lawan katanya...",
    "options": [
      "Cheap",
      "Costly",
      "Rare",
      "Old"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-i-have-two",
    "cefr": "A2",
    "tag": "grammar",
    "prompt": "I have two ___.",
    "options": [
      "child",
      "childs",
      "children",
      "childrens"
    ],
    "correctIndex": 2
  },
  {
    "id": "quiz-nervous-artinya-perasaan",
    "cefr": "A2",
    "tag": "vocab",
    "prompt": "'Nervous' artinya perasaan...",
    "options": [
      "Tenang",
      "Gugup",
      "Senang",
      "Lapar"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-can-you-me-the-salt",
    "cefr": "A2",
    "tag": "grammar",
    "prompt": "Can you ___ me the salt?",
    "options": [
      "pass",
      "passed",
      "passing",
      "to pass"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-apa-arti-to-arrive",
    "cefr": "A2",
    "tag": "vocab",
    "prompt": "Apa arti 'to arrive'?",
    "options": [
      "Berangkat",
      "Tiba",
      "Menunggu",
      "Pulang"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-apa-arti-kata-generous",
    "cefr": "B1",
    "tag": "vocab",
    "prompt": "Apa arti kata 'generous'?",
    "options": [
      "Pelit",
      "Murah hati",
      "Pemalu",
      "Cepat"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-sinonim-dari-happy-adalah",
    "cefr": "B1",
    "tag": "synonym",
    "prompt": "Sinonim dari 'happy' adalah...",
    "options": [
      "Sad",
      "Angry",
      "Joyful",
      "Tired"
    ],
    "correctIndex": 2
  },
  {
    "id": "quiz-she-to-the-market-every-mo",
    "cefr": "B1",
    "tag": "grammar",
    "prompt": "She ___ to the market every morning.",
    "options": [
      "go",
      "goes",
      "going",
      "gone"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-reluctant-paling-dekat-artin",
    "cefr": "B1",
    "tag": "vocab",
    "prompt": "'Reluctant' paling dekat artinya dengan...",
    "options": [
      "Enggan",
      "Bersemangat",
      "Yakin",
      "Cepat"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-i-have-finished-my-homewor",
    "cefr": "B1",
    "tag": "grammar",
    "prompt": "I have ___ finished my homework.",
    "options": [
      "already",
      "yet",
      "still",
      "never mind"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-sinonim-dari-difficult-adala",
    "cefr": "B1",
    "tag": "synonym",
    "prompt": "Sinonim dari 'difficult' adalah...",
    "options": [
      "Easy",
      "Simple",
      "Challenging",
      "Boring"
    ],
    "correctIndex": 2
  },
  {
    "id": "quiz-apa-arti-to-procrastinate",
    "cefr": "B1",
    "tag": "vocab",
    "prompt": "Apa arti 'to procrastinate'?",
    "options": [
      "Menunda-nunda",
      "Bergegas",
      "Merencanakan",
      "Menyelesaikan"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-they-dinner-when-i-arrived",
    "cefr": "B1",
    "tag": "grammar",
    "prompt": "They ___ dinner when I arrived.",
    "options": [
      "cook",
      "were cooking",
      "cooked yesterday",
      "cooking"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-sinonim-dari-beautiful-adala",
    "cefr": "B1",
    "tag": "synonym",
    "prompt": "Sinonim dari 'beautiful' adalah...",
    "options": [
      "Ugly",
      "Gorgeous",
      "Plain",
      "Dull"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-curious-artinya-orang-yang",
    "cefr": "B1",
    "tag": "vocab",
    "prompt": "'Curious' artinya orang yang...",
    "options": [
      "Malas",
      "Ingin tahu",
      "Marah",
      "Takut"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-if-it-rains-i-stay-home",
    "cefr": "B1",
    "tag": "grammar",
    "prompt": "If it rains, I ___ stay home.",
    "options": [
      "will",
      "would",
      "was",
      "am"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-grateful-artinya",
    "cefr": "B1",
    "tag": "vocab",
    "prompt": "'Grateful' artinya...",
    "options": [
      "Bersyukur",
      "Kecewa",
      "Bingung",
      "Sombong"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-sinonim-dari-begin-adalah",
    "cefr": "B2",
    "tag": "synonym",
    "prompt": "Sinonim dari 'begin' adalah...",
    "options": [
      "End",
      "Start",
      "Stop",
      "Pause"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-he-doesn-t-like-coffee",
    "cefr": "B2",
    "tag": "grammar",
    "prompt": "He doesn't like coffee, ___?",
    "options": [
      "does he",
      "doesn't he",
      "is he",
      "isn't he"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-sinonim-dari-huge-adalah",
    "cefr": "B2",
    "tag": "synonym",
    "prompt": "Sinonim dari 'huge' adalah...",
    "options": [
      "Tiny",
      "Enormous",
      "Narrow",
      "Short"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-ambitious-berarti-seseorang",
    "cefr": "B2",
    "tag": "vocab",
    "prompt": "'Ambitious' berarti seseorang yang...",
    "options": [
      "Berambisi tinggi",
      "Pemalas",
      "Rendah hati",
      "Pelupa"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-this-is-the-book-i-told-yo",
    "cefr": "B2",
    "tag": "grammar",
    "prompt": "This is the book ___ I told you about.",
    "options": [
      "who",
      "which",
      "whose",
      "where"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-diligent-artinya-orang-yang",
    "cefr": "B2",
    "tag": "vocab",
    "prompt": "'Diligent' artinya orang yang...",
    "options": [
      "Rajin",
      "Malas",
      "Ceroboh",
      "Cerewet"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-neither-of-them-ready",
    "cefr": "B2",
    "tag": "grammar",
    "prompt": "Neither of them ___ ready.",
    "options": [
      "is",
      "are",
      "were",
      "have been"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-sinonim-dari-angry-adalah",
    "cefr": "B2",
    "tag": "synonym",
    "prompt": "Sinonim dari 'angry' adalah...",
    "options": [
      "Calm",
      "Furious",
      "Happy",
      "Sleepy"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-humble-artinya",
    "cefr": "B2",
    "tag": "vocab",
    "prompt": "'Humble' artinya...",
    "options": [
      "Sombong",
      "Rendah hati",
      "Kasar",
      "Pemarah"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-i-wish-i-more-time",
    "cefr": "B2",
    "tag": "grammar",
    "prompt": "I wish I ___ more time.",
    "options": [
      "have",
      "had",
      "has",
      "having"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-to-give-up-artinya",
    "cefr": "B2",
    "tag": "vocab",
    "prompt": "'To give up' artinya...",
    "options": [
      "Menyerah",
      "Berjuang",
      "Merayakan",
      "Menunda"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-by-next-year-i-graduated",
    "cefr": "B2",
    "tag": "grammar",
    "prompt": "By next year, I ___ graduated.",
    "options": [
      "will have",
      "will",
      "have",
      "had"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-meticulous-paling-dekat-arti",
    "cefr": "C1",
    "tag": "vocab",
    "prompt": "'Meticulous' paling dekat artinya...",
    "options": [
      "Ceroboh",
      "Sangat teliti",
      "Malas",
      "Cepat"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-ubiquitous-artinya",
    "cefr": "C1",
    "tag": "vocab",
    "prompt": "'Ubiquitous' artinya...",
    "options": [
      "Langka",
      "Ada di mana-mana",
      "Berbahaya",
      "Kecil"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-rarely-such-dedication",
    "cefr": "C1",
    "tag": "grammar",
    "prompt": "Rarely ___ such dedication.",
    "options": [
      "I have seen",
      "have I seen",
      "I saw",
      "I did see"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-ambiguous-artinya",
    "cefr": "C1",
    "tag": "vocab",
    "prompt": "'Ambiguous' artinya...",
    "options": [
      "Jelas",
      "Bermakna ganda",
      "Sederhana",
      "Pasti"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-sinonim-dari-inevitable-adal",
    "cefr": "C1",
    "tag": "synonym",
    "prompt": "Sinonim dari 'inevitable' adalah...",
    "options": [
      "Avoidable",
      "Unavoidable",
      "Optional",
      "Unlikely"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-had-i-known-earlier-i-dif",
    "cefr": "C1",
    "tag": "grammar",
    "prompt": "Had I known earlier, I ___ differently.",
    "options": [
      "would act",
      "would have acted",
      "act",
      "acted"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-candid-artinya-seseorang-yan",
    "cefr": "C1",
    "tag": "vocab",
    "prompt": "'Candid' artinya seseorang yang...",
    "options": [
      "Berterus terang",
      "Tertutup",
      "Pembohong",
      "Pemalu"
    ],
    "correctIndex": 0
  },
  {
    "id": "quiz-redundant-dalam-konteks-kerj",
    "cefr": "C1",
    "tag": "vocab",
    "prompt": "'Redundant' dalam konteks kerja berarti...",
    "options": [
      "Dipromosikan",
      "Diberhentikan (berlebih)",
      "Ditransfer",
      "Dinaikkan gaji"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-ephemeral-artinya-sesuatu-ya",
    "cefr": "C2",
    "tag": "vocab",
    "prompt": "'Ephemeral' artinya sesuatu yang...",
    "options": [
      "Abadi",
      "Sementara/cepat hilang",
      "Kuat",
      "Berat"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-ostensibly-paling-dekat-arti",
    "cefr": "C2",
    "tag": "vocab",
    "prompt": "'Ostensibly' paling dekat artinya...",
    "options": [
      "Sebenarnya",
      "Kelihatannya (padahal belum tentu)",
      "Selamanya",
      "Sama sekali tidak"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-not-only-late-but-he-also",
    "cefr": "C2",
    "tag": "grammar",
    "prompt": "Not only ___ late, but he also forgot the documents.",
    "options": [
      "he was",
      "was he",
      "he is",
      "is he"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-vindicate-artinya",
    "cefr": "C2",
    "tag": "vocab",
    "prompt": "'Vindicate' artinya...",
    "options": [
      "Menyalahkan",
      "Membuktikan tidak bersalah",
      "Menghukum",
      "Mengabaikan"
    ],
    "correctIndex": 1
  },
  {
    "id": "quiz-cognizant-artinya",
    "cefr": "C2",
    "tag": "vocab",
    "prompt": "'Cognizant' artinya...",
    "options": [
      "Tidak sadar",
      "Menyadari/mengetahui",
      "Bingung",
      "Lupa"
    ],
    "correctIndex": 1
  }
]
