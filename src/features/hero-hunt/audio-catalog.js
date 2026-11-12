// URLs are retained only for a Node audit script; raw URLs never enter this manifest.
// Enabling a voice requires explicit source, language, rights and playback evidence.
export const AUDIO_REVIEWS = {};

export function audioEligibility(audio, language = "en") {
  if (!audio) return { ready: false, reason: "Belum ada audio terverifikasi." };
  if (audio.kind !== "hero_selection_default" || audio.skin !== "default")
    return { ready: false, reason: "Jenis voice atau skin belum sesuai." };
  if (audio.language !== language) return { ready: false, reason: "Bahasa voice belum sesuai." };
  if (
    !audio.sourceUrl?.startsWith("https://") ||
    audio.sourceStatus !== "verified" ||
    !audio.sourceEvidence
  )
    return { ready: false, reason: "Sumber audio belum diperiksa." };
  if (audio.licenseStatus !== "licensed" || !audio.licenseEvidence)
    return { ready: false, reason: "Hak penggunaan belum dikonfirmasi." };
  if (audio.playbackStatus !== "tested" || !audio.playbackTestedAt || !audio.reviewer)
    return { ready: false, reason: "Playback belum diuji." };
  if (audio.spoilerStatus !== "clear" || !audio.spoilerEvidence)
    return { ready: false, reason: "Cuplikan belum diperiksa dari kebocoran nama." };
  // Only reviewed bundled assets. No URL forwarding, redirects or remote playback.
  if (!/^\/audio\/hero-hunt\/[a-z0-9_-]+\.(ogg|mp3|wav|webm)$/.test(audio.localAssetPath || ""))
    return { ready: false, reason: "Berkas lokal belum tersedia." };
  return { ready: true, reason: null };
}

export function playableAudioHeroes(heroes, language = "en") {
  return heroes.filter((hero) => audioEligibility(AUDIO_REVIEWS[hero.id], language).ready);
}
