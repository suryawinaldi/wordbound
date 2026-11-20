import { recordActivity } from "./activity.js";
import portraits from "./hero-portraits.json";
import { useEffect, useRef, useState } from "react";
import { Headphones, RotateCcw } from "lucide-react";
import { PageIntro } from "./components.jsx";
import { normalizeAnswer } from "./engine.js";
import { playTone, useHuntStore } from "./store.js";

import { AUDIO_REVIEWS, playableAudioHeroes } from "./audio-catalog.js";
import selectionClips from "./selection-clips.json";
import { ROSTER } from "./content.js";

function rounds() {
  const deck = playableAudioHeroes(ROSTER).map(hero => ({
    name: hero.name, src: AUDIO_REVIEWS[hero.id].localAssetPath,
  }));
  const names = new Set(deck.map(clip => clip.name));
  deck.push(...selectionClips.filter(clip => !names.has(clip.name)));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, 5);
}
export default function AudioPage() {
  const [saved] = useState(() => {
    try {
      const data = JSON.parse(sessionStorage.getItem("hunt.audio.session"));
      if (data && Array.isArray(data.deck) && data.deck.length === 5 && data.deck.every(c => selectionClips.some(x => x.name === c.name && x.src === c.src)) && Number.isInteger(data.index) && data.index >= 0 && data.index <= 5 && Number.isInteger(data.score)) return data;
    } catch {}
    return null;
  });
  const [sessionId, setSessionId] = useState(() => saved?.id || crypto.randomUUID());
  const [deck, setDeck] = useState(() => saved?.deck || rounds());
  const [attempts, setAttempts] = useState(saved?.attempts || 0);
  const [index, setIndex] = useState(saved?.index || 0);
  const [score, setScore] = useState(saved?.score || 0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(saved?.result ?? null);
  const [playing, setPlaying] = useState(false);
  const [heard, setHeard] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    try { sessionStorage.setItem("hunt.audio.session", JSON.stringify({ id: sessionId, deck, index, score, attempts, result })); } catch {}
  }, [sessionId, deck, index, score, attempts, result]);
  const audio = useRef(null);
  const muted = useHuntStore(state => state.settings.muted);
  useEffect(() => { if (muted) audio.current?.pause(); }, [muted]);
  const done = index === deck.length;
  useEffect(() => {
    if (done) recordActivity({ id: sessionId, mode: "audio", correct: score, total: deck.length, date: Date.now() });
  }, [done, sessionId, score, deck.length]);
  const clip = deck[index];
  const hero = clip?.name;
  useEffect(() => {
    const element = audio.current;
    return () => element?.pause();
  }, [index]);
  function advance() {
    audio.current?.pause();
    setAttempts(0); setIndex(index + 1); setAnswer(""); setResult(null);
    setHeard(false); setFailed(false); setPlaying(false);
  }
  async function listen() {
    const el = audio.current;
    try {
      if (muted) useHuntStore.getState().updateSettings({ muted: false });
      if (failed) el.load();
      el.currentTime = 0;
      await el.play();
    } catch {
      if (audio.current === el) setFailed(true);
    }
  }
  function submit(e) {
    e.preventDefault();
    if (!heard || result !== null || !answer.trim()) return;
    audio.current.pause();
    const accepted = [hero, ...(ROSTER.find(item => item.name === hero)?.aliases || [])];
    const correct = accepted.some(name => normalizeAnswer(answer) === normalizeAnswer(name));
    setAttempts(attempts + 1);
    if (correct || attempts >= 2) setResult(correct);
    if (correct) setScore(score + 1);
    playTone(correct);
  }
  return <div className="page-width audio-page">
    <PageIntro eyebrow="TEBAK SUARA" title="Satu suara. Siapa heronya?">
      Dengarkan klip berbahasa Inggris, lalu tebak nama heronya.
    </PageIntro>
    <section key={index} className="party-panel audio-round">
      {done ? <>
        <h2>{score} dari {deck.length} hero tertebak</h2>
        <button onClick={() => { setSessionId(crypto.randomUUID()); setDeck(rounds()); setIndex(0); setScore(0); setResult(null); setAnswer(""); setHeard(false); setFailed(false); setAttempts(0); }}>Main lagi</button>
      </> : <>
        <p>Ronde {index + 1} / {deck.length} · {clip.kind === "voice" ? "Dialog hero" : clip.kind === "showcase" ? "Suara showcase" : "Suara draft pick"}</p>
        <div aria-hidden="true" className={'audio-bars ' + (playing ? 'playing' : '')}>{[0,1,2,3,4,5,6,7,8].map(n => <i key={n} style={{'--beat': n}} />)}</div>
        <audio key={index} ref={audio} preload="none" src={clip.src}
          onPlaying={() => { setHeard(true); setPlaying(true); setFailed(false); }} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setFailed(true)} />
        {result === null ? <>
          <button onClick={listen}>{heard ? <RotateCcw size={17}/> : <Headphones size={17}/>} {muted ? 'Aktifkan dan putar suara' : heard ? 'Putar ulang' : 'Putar suara'}</button>
          {failed && <p role="alert">Audio gagal dimuat. Coba putar lagi atau <button type="button" onClick={advance}>Lewati ronde</button>.</p>}
          {attempts > 0 && <p role="status">Tersisa {3 - attempts} kesempatan.</p>}
          <form onSubmit={submit}><label>Nama hero<input value={answer} autoComplete="off" onChange={e => setAnswer(e.target.value)} /></label>
            <button disabled={!heard || !answer.trim()}>Tebak</button></form>
          <button className="quiet" onClick={() => { audio.current?.pause(); setResult(false); }}>Lewati hero</button>
        </> : <div className="reveal-content">{portraits[hero === "Hirara" ? "Hiara" : hero] && <img className="active-player-card" src={"/assets/party/splash/" + portraits[hero === "Hirara" ? "Hiara" : hero] + ".webp"} alt={hero} />}<h2>{result ? 'Benar!' : 'Jawabannya'} {hero}</h2>
          <p><a className="text-link" href="https://mlbb.tools/audio" target="_blank" rel="noreferrer">Jelajahi suara hero di MLBB Tools ↗</a></p>
          <button onClick={advance}>{index + 1 === deck.length ? 'Lihat hasil' : 'Ronde berikutnya'}</button></div>}
      </>}
    </section>
  </div>;
}
