import { useEffect, useRef, useState } from "react";
import { Headphones, RotateCcw } from "lucide-react";
import { PageIntro } from "./components.jsx";
import { normalizeAnswer } from "./engine.js";
import { playTone, useHuntStore } from "./store.js";

const heroes = ["Franco", "Fanny", "Johnson", "Angela", "Cyclops", "Kagura", "Diggie", "Lolita", "Akai", "Odette"];
function rounds() {
  const deck = heroes.map((_, i) => i);
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
  const hero = heroes[deck[index]];
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
      Dengarkan petunjuk suara berbahasa Inggris yang dibuat untuk Hero Hunt. Tebak satu hero per ronde.
    </PageIntro>
    <section className="party-panel audio-round">
      {done ? <>
        <h2>{score} dari 5 hero tertebak</h2>
        <button onClick={() => { setDeck(rounds()); setIndex(0); setScore(0); }}>Main lagi</button>
      </> : <>
        <p>Ronde {index + 1} / 5</p>
        <div aria-hidden="true" className={'audio-bars ' + (playing ? 'playing' : '')}>{[0,1,2,3,4,5,6,7,8].map(n => <i key={n} style={{'--beat': n}} />)}</div>
        <audio key={index} ref={audio} preload="none" src={'/audio/hunt/' + String(deck[index]+1).padStart(2,'0') + '.mp3'}
          onPlaying={() => { setHeard(true); setPlaying(true); setFailed(false); }} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setFailed(true)} />
        {result === null ? <>
          <button onClick={listen}>{heard ? <RotateCcw size={17}/> : <Headphones size={17}/>} {muted ? 'Aktifkan dan putar suara' : heard ? 'Putar ulang' : 'Putar suara'}</button>
          {failed && <p role="alert">Audio gagal diputar. Coba putar lagi.</p>}
          <form onSubmit={submit}><label>Nama hero<input value={answer} autoComplete="off" onChange={e => setAnswer(e.target.value)} /></label>
            <button disabled={!heard || !answer.trim()}>Tebak</button></form>
        </> : <div className="reveal-content"><h2>{result ? 'Benar!' : 'Jawabannya'} {hero}</h2>
          <button onClick={advance}>{index === 4 ? 'Lihat hasil' : 'Ronde berikutnya'}</button></div>}
      </>}
    </section>
  </div>;
}
