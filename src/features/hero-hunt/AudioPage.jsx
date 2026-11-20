import { useEffect, useRef, useState } from "react";
import { Headphones, RotateCcw } from "lucide-react";
import { PageIntro } from "./components.jsx";
import { normalizeAnswer } from "./engine.js";
import { playTone, useHuntStore } from "./store.js";

import { AUDIO_REVIEWS, playableAudioHeroes } from "./audio-catalog.js";
import { ROSTER } from "./content.js";

function rounds() {
  const deck = playableAudioHeroes(ROSTER).map(hero => ({
    name: hero.name, src: AUDIO_REVIEWS[hero.id].localAssetPath,
  }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, 5);
}
export default function AudioPage() {
  const [deck, setDeck] = useState(rounds);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [heard, setHeard] = useState(false);
  const [failed, setFailed] = useState(false);
  const audio = useRef(null);
  const muted = useHuntStore(state => state.settings.muted);
  useEffect(() => { if (muted) audio.current?.pause(); }, [muted]);
  const done = index === deck.length;
  const clip = deck[index];
  const hero = clip?.name;
  useEffect(() => {
    const element = audio.current;
    return () => element?.pause();
  }, [index]);
  function advance() {
    audio.current?.pause();
    setIndex(index + 1); setAnswer(""); setResult(null);
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
    const correct = normalizeAnswer(answer) === normalizeAnswer(hero);
    setResult(correct); if (correct) setScore(score + 1);
    playTone(correct);
  }
  return <div className="page-width audio-page">
    <PageIntro eyebrow="TEBAK SUARA" title="Satu suara. Siapa heronya?">
      Dengarkan klip berbahasa Inggris, lalu tebak nama heronya.
    </PageIntro>
    <section className="party-panel audio-round">
      {deck.length === 0 ? <p>Rekaman asli draft pick belum tersedia.</p> : done ? <>
        <h2>{score} dari {deck.length} hero tertebak</h2>
        <button onClick={() => { setDeck(rounds()); setIndex(0); setScore(0); }}>Main lagi</button>
      </> : <>
        <p>Ronde {index + 1} / {deck.length} · Suara draft pick</p>
        <div aria-hidden="true" className={'audio-bars ' + (playing ? 'playing' : '')}>{[0,1,2,3,4,5,6,7,8].map(n => <i key={n} style={{'--beat': n}} />)}</div>
        <audio key={index} ref={audio} preload="none" src={clip.src}
          onPlaying={() => { setHeard(true); setPlaying(true); setFailed(false); }} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setFailed(true)} />
        {result === null ? <>
          <button onClick={listen}>{heard ? <RotateCcw size={17}/> : <Headphones size={17}/>} {muted ? 'Aktifkan dan putar suara' : heard ? 'Putar ulang' : 'Putar suara'}</button>
          {failed && <p role="alert">Audio gagal diputar. Coba putar lagi.</p>}
          <form onSubmit={submit}><label>Nama hero<input value={answer} autoComplete="off" onChange={e => setAnswer(e.target.value)} /></label>
            <button disabled={!heard || !answer.trim()}>Tebak</button></form>
        </> : <div className="reveal-content"><h2>{result ? 'Benar!' : 'Jawabannya'} {hero}</h2>
          <p><a className="text-link" href="https://mlbb.tools/audio" target="_blank" rel="noreferrer">Jelajahi suara hero di MLBB Tools ↗</a></p>
          <button onClick={advance}>{index + 1 === deck.length ? 'Lihat hasil' : 'Ronde berikutnya'}</button></div>}
      </>}
    </section>
  </div>;
}
