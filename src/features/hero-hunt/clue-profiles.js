export const CLUE_PROFILES = {
  mixed: { label: "Campuran", description: "Jejak → role → mekanik → ciri khas → signature." },
  story: {
    label: "Kisah & mekanik",
    description: "Lima petunjuk asli tanpa membuka role lebih awal.",
  },
};

// Keep the authored clue and its provenance intact; role is a separate fact.
export function getSessionClues(hero, profile = "story") {
  if (profile !== "mixed") return hero.clues;
  return hero.clues.map((clue, index) =>
    index === 1
      ? {
          ...hero.roleFact,
          order: 2,
          type: "Role",
          text: `Role hero ini: ${hero.roles.join(" / ")}.`,
        }
      : clue,
  );
}

export function clueCategory(clue) {
  if (clue.type === "Role") return "Role";
  if (clue.order === 5) return "Signature";
  return (
    {
      Asal: "Kisah",
      Jejak: "Jejak",
      Kisah: "Kisah",
      "Gaya main": "Gaya main",
      Kemampuan: "Skill",
      "Sumber daya": "Mekanik",
      Pertahanan: "Mekanik",
      Senjata: "Senjata",
      Perlengkapan: "Penampilan",
      "Ciri khas": "Ciri khas",
      Signature: "Signature",
    }[clue.type] || clue.type
  );
}
