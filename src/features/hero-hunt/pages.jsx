import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useBlocker, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  Crosshair,
  Flag,
  Heart,
  Lightbulb,
  LockKeyhole,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";
import { ConfirmDialog, MysteryArt, PageIntro } from "./components.jsx";
import { HEROES } from "./content.js";
import { DIFFICULTIES, normalizeAnswer, potentialPoints, summarize } from "./engine.js";
import { playTone, useHuntStore } from "./store.js";

function DifficultyPicker({ disabled = false }) {
  const difficulty = useHuntStore((s) => s.settings.difficulty);
  const update = useHuntStore((s) => s.updateSettings);
  return (
    <fieldset className="difficulty-picker" disabled={disabled}>
      <legend>Tingkat kesulitan</legend>
      <div className="difficulty-options">
        {Object.entries(DIFFICULTIES).map(([key, config]) => (
          <label className={difficulty === key ? "selected" : ""} key={key}>
            <input
              type="radio"
              name="difficulty"
              value={key}
              checked={difficulty === key}
              onChange={() => update({ difficulty: key })}
            />
            <span>{config.label}</span>
            <small>{config.hp} HP</small>
            {difficulty === key && <Check size={14} />}
          </label>
        ))}
      </div>
      <p>Salah −1 HP · Petunjuk tambahan −15 potensi poin · Tanpa koin</p>
    </fieldset>
  );
}

function StartButton({ className = "", label = "Mulai main" }) {
  const navigate = useNavigate();
  const session = useHuntStore((s) => s.session);
  const start = useHuntStore((s) => s.start);
  const active = session && session.phase !== "completed";
  return (
    <button
      className={`button primary ${className}`}
      onClick={() => {
        if (!active) start();
        navigate("/play/solo");
      }}
    >
      <Crosshair size={20} />
      {active ? "Lanjutkan sesi" : label}
      <ArrowRight size={19} />
    </button>
  );
}

function Modes() {
  return (
    <div className="mode-grid">
      <Link className="mode-card available" to="/play">
        <div className="mode-icon">
          <Crosshair size={23} />
        </div>
        <span className="mode-status">
          <span /> TERSEDIA
        </span>
        <h3>Solo Classic</h3>
        <p>
          Kamu, petunjuk, dan instingmu.
          <br />
          Seberapa banyak yang kamu kenali?
        </p>
        <span className="mode-action">
          Mulai perburuan <ArrowUpRight size={18} />
        </span>
      </Link>
      <article className="mode-card upcoming">
        <div className="mode-icon">
          <UsersRound size={23} />
        </div>
        <span className="mode-status">
          <LockKeyhole size={12} /> SEGERA HADIR
        </span>
        <h3>Gantian</h3>
        <p>
          Satu perangkat, dua pemburu.
          <br />
          Tantang teman di sebelahmu.
        </p>
        <span className="mode-footnote">Bermain bersama, tanpa akun pasangan</span>
      </article>
      <article className="mode-card upcoming">
        <div className="mode-icon">
          <Swords size={23} />
        </div>
        <span className="mode-status">
          <LockKeyhole size={12} /> SEGERA HADIR
        </span>
        <h3>Duel & Co-op</h3>
        <p>
          Adu insting atau satukan pengetahuan.
          <br />
          Temukan hero bersama temanmu.
        </p>
        <span className="mode-footnote">Pertandingan online dengan kode room</span>
      </article>
    </div>
  );
}

export function HomePage() {
  const history = useHuntStore((s) => s.history);
  const session = useHuntStore((s) => s.session);
  const name = useHuntStore((s) => s.settings.name);
  const best = history.length ? Math.max(...history.map((item) => summarize(item).score)) : null;
  return (
    <div className="home-page page-width">
      <div className="home-hero">
        <div className="hero-copy">
          <div className="edition-badge">
            <span /> FAN-MADE MLBB TRIVIA <span className="badge-divider">/</span> PREVIEW
          </div>
          {name && <p className="welcome">Selamat berburu lagi, {name}.</p>}
          <h1>
            Kenali petunjuknya.
            <br />
            Temukan <span>heronya.</span>
          </h1>
          <p className="hero-description">
            Seberapa dalam kamu mengenal Land of Dawn?
            <br className="desktop-only" /> Uji instingmu, buka petunjuk, dan ungkap hero yang
            tersembunyi.
          </p>
          <div className="hero-cta">
            <StartButton />
            <a className="text-link" href="#cara-main">
              Cara main <ArrowUpRight size={17} />
            </a>
          </div>
          <p className="guest-note">
            <Shield size={14} /> Langsung main. Tanpa login, tanpa unduh.
          </p>
          <div className="hero-facts">
            <span>
              <strong>05</strong> hero per sesi
            </span>
            <i />
            <span>
              <strong>05</strong> petunjuk bertahap
            </span>
            <i />
            <span>
              <Clock3 size={17} />
              <strong>3–5</strong> menit
            </span>
          </div>
        </div>
        <MysteryArt />
      </div>
      <div className="home-divider">
        <span>SEDIKIT PETUNJUK. BANYAK KEMUNGKINAN.</span>
        <Link className="roster-link" to="/heroes">
          <Sparkles size={14} /> {HEROES.length} hero tersedia <ArrowUpRight size={14} />
        </Link>
      </div>
      <section className="home-modes" aria-labelledby="mode-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PILIH CARA BERBURUMU</p>
            <h2 id="mode-heading">Satu arena. Beragam tantangan.</h2>
          </div>
          <Link className="text-link" to="/stats">
            <Trophy size={16} />
            {best === null ? "Buat rekor pertamamu" : `Rekor pribadi: ${best}`}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <Modes />
      </section>
      <section id="cara-main" className="how-section" aria-labelledby="how-heading">
        <div>
          <p className="eyebrow">INSTINGMU ADALAH SENJATANYA</p>
          <h2 id="how-heading">
            Mudah dimulai.
            <br />
            Seru untuk dikuasai.
          </h2>
        </div>
        <ol className="how-steps">
          <li>
            <span>01</span>
            <div>
              <h3>Baca jejaknya</h3>
              <p>Mulai dari satu petunjuk. Hubungkan kisah, kemampuan, dan ciri khas hero.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Percayai tebakanmu</h3>
              <p>
                Ketik nama hero. Butuh bantuan? Buka clue berikutnya dengan pengurangan potensi
                poin.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Tuntaskan perburuan</h3>
              <p>Temukan lima hero, lihat hasilmu, lalu coba kalahkan rekor sendiri.</p>
            </div>
          </li>
        </ol>
      </section>
      <section className="quick-settings">
        <div>
          <p className="eyebrow">ATUR TANTANGAN</p>
          <h2>Mulai dengan ritmemu.</h2>
          <p>Normal jadi pilihan awal. Kamu bisa mengubahnya sebelum sesi baru.</p>
        </div>
        <DifficultyPicker disabled={!!session && session.phase !== "completed"} />
      </section>
    </div>
  );
}

export function PlaySetupPage() {
  const session = useHuntStore((s) => s.session);
  return (
    <div className="page-width setup-page">
      <PageIntro eyebrow="SOLO CLASSIC" title="Perburuan dimulai di sini.">
        Lima hero. Lima petunjuk. Seberapa cepat kamu mengenalinya?
      </PageIntro>
      <div className="setup-panel">
        <div className="setup-art">
          <MysteryArt compact />
          <span className="eyebrow">IKUTI JEJAKNYA</span>
        </div>
        <div className="setup-options">
          <h2>Siapkan insting terbaikmu.</h2>
          <p>Petunjuk pertama terbuka otomatis. Semakin sedikit bantuan, semakin besar poinmu.</p>
          <DifficultyPicker disabled={!!session && session.phase !== "completed"} />
          <StartButton label="Mulai Solo" />
          <p className="guest-note">
            <Shield size={14} /> Progres tersimpan di browser ini.
          </p>
        </div>
      </div>
      <p className="preview-note">
        Edisi preview: {HEROES.length} hero. Petunjuk masih dalam peninjauan.{" "}
        <Link className="inline-link" to="/heroes">
          Lihat daftar hero
        </Link>
        .
      </p>
    </div>
  );
}

export function GamePage() {
  const session = useHuntStore((s) => s.session);
  const start = useHuntStore((s) => s.start);
  const act = useHuntStore((s) => s.act);
  const abandon = useHuntStore((s) => s.abandon);
  const navigate = useNavigate();
  const [guess, setGuess] = useState("");
  const [skip, setSkip] = useState(false);
  const input = useRef(null);
  const revealTitle = useRef(null);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !!session &&
      session.phase !== "completed" &&
      currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    // Initialize only on route entry. Clearing a session during confirmed exit
    // must not create another session before the router unmounts this page.
    if (!useHuntStore.getState().session) start();
  }, [start]);
  useEffect(() => {
    if (session?.phase === "completed") navigate(`/results/${session.id}`, { replace: true });
  }, [session?.phase, session?.id, navigate]);
  useEffect(() => {
    if (session?.phase !== "wrong") return;
    const timeout = setTimeout(() => act({ type: "retry", revision: session.revision }), 450);
    return () => clearTimeout(timeout);
  }, [session?.phase, session?.revision, act]);
  useEffect(() => {
    setGuess("");
    if (session?.round > 0) input.current?.focus({ preventScroll: true });
  }, [session?.round]);
  useEffect(() => {
    if (session?.phase === "reveal") revealTitle.current?.focus({ preventScroll: true });
  }, [session?.phase]);
  if (!session || session.phase === "completed")
    return (
      <div className="empty-state" role="status">
        Jejak sedang disiapkan…
      </div>
    );
  const hero = HEROES.find((item) => item.id === session.heroIds[session.round]);
  const config = DIFFICULTIES[session.difficulty];
  const clue = hero.clues[session.clueIndex];
  const reveal = session.phase === "reveal";
  const score = summarize(session).score;
  const points = potentialPoints(session);
  const send = (type) => act({ type, revision: session.revision });
  const guessHero = (event) => {
    event.preventDefault();
    if (session.phase !== "guessing" || !normalizeAnswer(guess)) return;
    act({ type: "guess", answer: guess, revision: session.revision });
    const next = useHuntStore.getState().session;
    playTone(next.feedback === "correct");
    setGuess("");
  };
  return (
    <div className="game-page">
      <div className="game-toolbar">
        <button className="text-link" onClick={() => navigate("/")}>
          <ArrowLeft size={18} /> Keluar
        </button>
        <span>
          SOLO CLASSIC <i /> {config.label.toUpperCase()}
        </span>
        <span className="game-preview">PREVIEW</span>
      </div>
      <div className="game-hud">
        <div>
          <span className="eyebrow">PERBURUAN</span>
          <strong>
            Hero {String(session.round + 1).padStart(2, "0")}{" "}
            <span>/ {String(session.heroIds.length).padStart(2, "0")}</span>
          </strong>
        </div>
        <div className="lives" aria-label={`${session.hp} dari ${config.hp} HP`}>
          <span className="hp-icons" aria-hidden="true">
            {Array.from({ length: config.hp }, (_, index) => (
              <Heart key={index} size={17} className={index < session.hp ? "alive" : ""} />
            ))}
          </span>
          <span>{session.hp} HP</span>
        </div>
        <div className="hud-score">
          <span className="eyebrow">SKOR</span>
          <strong>{score}</strong>
        </div>
      </div>
      <div
        className="round-progress"
        aria-label={`Ronde ${session.round + 1} dari ${session.heroIds.length}`}
      >
        {session.heroIds.map((id, i) => (
          <span
            key={id}
            className={i < session.round ? "done" : i === session.round ? "current" : ""}
          />
        ))}
      </div>
      <div className={`game-content ${reveal ? "is-revealed" : ""}`}>
        <aside className="game-mystery">
          <MysteryArt compact revealed={reveal} />
          <p className="eyebrow">{reveal ? "JEJAK TERUNGKAP" : "IDENTITAS TERSEMBUNYI"}</p>
          <h2>{reveal ? hero.name : "Siapa hero ini?"}</h2>
          <p>{reveal ? hero.role : "Setiap petunjuk membawamu lebih dekat."}</p>
          <span className="mystery-number">
            {String(session.round + 1).padStart(2, "0")}
            <span> / {String(session.heroIds.length).padStart(2, "0")}</span>
          </span>
        </aside>
        <section
          className="guess-panel"
          aria-label={reveal ? "Identitas hero terungkap" : "Tebak hero"}
        >
          {reveal ? (
            <div className="reveal-content">
              <div
                className={`reveal-icon ${session.feedback === "correct" ? "correct" : "skipped"}`}
              >
                {session.feedback === "correct" ? <Check size={30} /> : <Flag size={28} />}
              </div>
              <p className="eyebrow">
                {session.feedback === "correct" ? "INSTINGMU TEPAT!" : "JEJAK UNTUK DIINGAT"}
              </p>
              <h1 ref={revealTitle} tabIndex={-1}>
                {hero.name}
              </h1>
              <span className="role-tag">{hero.role}</span>
              <p className="reveal-fact">{hero.clues[4].text}</p>
              <div className="score-breakdown">
                <span>{session.feedback === "correct" ? "Poin diperoleh" : "Hero dilewati"}</span>
                <strong>+{session.rounds.at(-1).points}</strong>
              </div>
              {session.feedback === "correct" && (
                <p className="score-explanation">
                  {config.base} poin dasar − {session.clueIndex * 15} petunjuk −{" "}
                  {session.wrongOnHero * 10} salah{points === 10 ? " · minimum 10 poin" : ""}
                </p>
              )}
              <button className="button primary full-width" onClick={() => send("next")}>
                {session.round === session.heroIds.length - 1
                  ? "Lihat hasil perburuan"
                  : "Hero berikutnya"}
                <ArrowRight size={19} />
              </button>
            </div>
          ) : (
            <>
              <div className="clue-heading">
                <span className="eyebrow">
                  <Lightbulb size={15} /> PETUNJUK {session.clueIndex + 1} DARI 5
                </span>
                <span className="clue-type">{clue.type}</span>
              </div>
              <div className="clue-dots" aria-hidden="true">
                {hero.clues.map((_, i) => (
                  <span key={i} className={i <= session.clueIndex ? "open" : ""} />
                ))}
              </div>
              <h1 className="active-clue" key={`${hero.id}-${session.clueIndex}`}>
                {clue.text}
              </h1>
              {session.clueIndex > 0 && (
                <details className="clue-history" key={hero.id}>
                  <summary>
                    Petunjuk sebelumnya ({session.clueIndex}) <ChevronDown size={15} />
                  </summary>
                  <ol>
                    {hero.clues.slice(0, session.clueIndex).map((item, i) => (
                      <li key={i}>
                        <span>{i + 1}</span>
                        {item.text}
                      </li>
                    ))}
                  </ol>
                </details>
              )}
              <form className="guess-form" onSubmit={guessHero}>
                <div className="input-label">
                  <label htmlFor="hero-guess">Siapa tebakanmu?</label>
                  <span>
                    Potensi <strong>{points}</strong> poin
                  </span>
                </div>
                <div className={`guess-input ${session.feedback === "wrong" ? "has-error" : ""}`}>
                  <SearchIcon />
                  <input
                    ref={input}
                    id="hero-guess"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Ketik nama hero…"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={60}
                    aria-describedby="guess-feedback"
                    aria-invalid={session.feedback === "wrong"}
                  />
                </div>
                <div
                  id="guess-feedback"
                  className={`guess-feedback ${session.feedback === "wrong" ? "wrong" : ""}`}
                  aria-live="polite"
                >
                  {session.feedback === "wrong" ? (
                    <>
                      <X size={15} /> Belum tepat. −1 HP. Coba pikirkan lagi.
                    </>
                  ) : (
                    "Huruf besar, spasi, dan tanda baca tidak masalah."
                  )}
                </div>
                <button
                  className="button primary full-width"
                  disabled={session.phase !== "guessing" || !normalizeAnswer(guess)}
                  type="submit"
                >
                  <Crosshair size={19} />
                  {session.phase === "wrong" ? "Coba lagi sebentar…" : "Tebak hero"}
                  <ArrowRight size={18} />
                </button>
              </form>
              <button
                className="hint-button"
                disabled={session.phase !== "guessing" || session.clueIndex === 4}
                onClick={() => send("hint")}
              >
                <Lightbulb size={17} />
                <span>
                  {session.clueIndex === 4
                    ? "Semua petunjuk sudah terbuka"
                    : "Buka petunjuk berikutnya"}
                </span>
                {session.clueIndex < 4 && <small>−{points - Math.max(10, points - 15)} poin</small>}
              </button>
              <button
                className="skip-hero"
                disabled={session.phase !== "guessing"}
                onClick={() => setSkip(true)}
              >
                Lewati hero ini <ArrowRight size={14} />
              </button>
            </>
          )}
        </section>
      </div>
      <p className="game-bottom-note">
        <Shield size={13} /> Sesi tersimpan di tab ini. Tak perlu terburu-buru, tidak ada timer.
      </p>
      <ConfirmDialog
        open={skip}
        onOpenChange={setSkip}
        title="Lewati hero ini?"
        description="Identitas hero akan dibuka. Kamu mendapat 0 poin untuk hero ini; HP tidak berkurang."
        confirmLabel="Ya, lewati"
        onConfirm={() => {
          setSkip(false);
          send("skip");
        }}
      />
      <ConfirmDialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => {
          if (!open && blocker.state === "blocked") blocker.reset();
        }}
        title="Akhiri perburuan?"
        description="Sesi ini belum selesai. Jika keluar, progres sesi ini tidak masuk ke statistik."
        confirmLabel="Keluar dari sesi"
        onConfirm={() => {
          abandon();
          if (blocker.state === "blocked") blocker.proceed();
        }}
      />
    </div>
  );
}

function SearchIcon() {
  return <Crosshair size={19} aria-hidden="true" />;
}

export function ResultsPage() {
  const { sessionId } = useParams();
  const session = useHuntStore((s) => s.session);
  const history = useHuntStore((s) => s.history);
  const start = useHuntStore((s) => s.start);
  const update = useHuntStore((s) => s.updateSettings);
  const navigate = useNavigate();
  const result =
    history.find((item) => item.id === sessionId) ||
    (session?.id === sessionId && session.phase === "completed" ? session : null);
  if (!result)
    return (
      <div className="page-width empty-state">
        <CompassIcon />
        <h1>Hasil belum ditemukan.</h1>
        <p>Hasil tersimpan di browser tempat kamu bermain. Mulai sesi untuk membuat jejak baru.</p>
        <Link to="/" className="button primary">
          Kembali ke beranda <ArrowRight size={18} />
        </Link>
      </div>
    );
  const summary = summarize(result);
  const config = DIFFICULTIES[result.difficulty];
  const previousBest = Math.max(
    0,
    ...history
      .filter((item) => item.id !== result.id && item.difficulty === result.difficulty)
      .map((item) => summarize(item).score),
  );
  const newBest = summary.score > previousBest;
  return (
    <div className="results-page page-width">
      <Link to="/" className="text-link">
        <ArrowLeft size={17} /> Beranda
      </Link>
      <div className="result-heading">
        <div className="trophy-emblem">
          <Trophy size={36} strokeWidth={1.4} />
        </div>
        <p className="eyebrow">SOLO CLASSIC · {config.label.toUpperCase()}</p>
        <h1>
          {result.hp === 0
            ? "Perburuan belum usai."
            : summary.correct === summary.total
              ? "Insting seorang legenda."
              : "Jejak berhasil terungkap."}
        </h1>
        <p>
          {result.hp === 0
            ? "HP habis, tapi setiap petunjuk membuatmu lebih mengenal hero."
            : `${summary.correct} dari ${summary.total} hero berhasil kamu temukan. Siap mencoba lagi?`}
        </p>
      </div>
      <section className="result-score-card">
        <div>
          <span className="eyebrow">TOTAL SKOR</span>
          <strong>
            {summary.score}
            <small> poin</small>
          </strong>
          {newBest ? (
            <span className="record-tag">
              <Sparkles size={14} /> Rekor baru · {config.label}
            </span>
          ) : (
            <span className="muted">
              Rekor {config.label}: {Math.max(previousBest, summary.score)}
            </span>
          )}
        </div>
        <div className="result-metrics">
          <div>
            <Target size={19} />
            <strong>
              {summary.correct}/{summary.total}
            </strong>
            <span>Hero ditemukan</span>
          </div>
          <div>
            <Crosshair size={19} />
            <strong>{summary.accuracy}%</strong>
            <span>Akurasi tebakan</span>
          </div>
          <div>
            <Lightbulb size={19} />
            <strong>{summary.hints}</strong>
            <span>Petunjuk tambahan</span>
          </div>
        </div>
      </section>
      <div className="results-actions">
        <button
          className="button primary"
          onClick={() => {
            update({ difficulty: result.difficulty });
            start();
            navigate("/play/solo");
          }}
        >
          <RotateCcw size={18} /> Main lagi <ArrowRight size={18} />
        </button>
        <Link className="button secondary" to="/stats">
          Lihat statistik <ArrowUpRight size={17} />
        </Link>
      </div>
      <section className="round-summary">
        <div className="section-heading">
          <h2>Jejak perburuanmu</h2>
          <span>
            {summary.skipped} dilewati · {summary.wrong} tebakan salah
          </span>
        </div>
        {result.heroIds.map((id, index) => {
          const hero = HEROES.find((item) => item.id === id);
          const round = result.rounds[index];
          return (
            <div className="summary-row" key={id}>
              <span className={`round-outcome ${round?.outcome || ""}`}>
                {round?.outcome === "correct" ? (
                  <Check size={18} />
                ) : round?.outcome === "skipped" ? (
                  <Flag size={17} />
                ) : round ? (
                  <X size={18} />
                ) : (
                  <span>—</span>
                )}
              </span>
              <div>
                <h3>{round ? hero.name : "Belum dimainkan"}</h3>
                <p>
                  {round
                    ? `${round.extraClues + 1} petunjuk · ${round.wrong} salah${round.outcome === "skipped" ? " · Dilewati" : round.outcome === "unanswered" ? " · HP habis" : ""}`
                    : "Perburuan berakhir sebelum ronde ini."}
                </p>
              </div>
              <strong>
                +{round?.points || 0}
                <small> poin</small>
              </strong>
            </div>
          );
        })}
      </section>
      <p className="preview-note">
        Tersimpan di browser ini · Skor preview, belum tersinkron lintas perangkat.
      </p>
    </div>
  );
}

function CompassIcon() {
  return <Crosshair size={42} strokeWidth={1} className="gold" />;
}

export function StatsPage() {
  const history = useHuntStore((s) => s.history);
  const totals = history.map(summarize);
  const correct = totals.reduce((sum, item) => sum + item.correct, 0);
  const wrong = totals.reduce((sum, item) => sum + item.wrong, 0);
  return (
    <div className="page-width stats-page">
      <PageIntro eyebrow="CATATAN SANG PEMBURU" title="Setiap jejak berarti.">
        Rekor dan perjalananmu, tersimpan di browser ini.
      </PageIntro>
      <div className="stats-overview">
        <div>
          <Flag size={21} />
          <strong>{history.length}</strong>
          <span>Sesi selesai</span>
        </div>
        <div>
          <Target size={21} />
          <strong>{correct}</strong>
          <span>Hero ditemukan</span>
        </div>
        <div>
          <Crosshair size={21} />
          <strong>{correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : 0}%</strong>
          <span>Akurasi tebakan</span>
        </div>
      </div>
      <h2 className="stats-subheading">Rekor per kesulitan</h2>
      <div className="best-grid">
        {Object.entries(DIFFICULTIES).map(([key, value]) => (
          <div key={key}>
            <span>{value.label}</span>
            <strong>
              {Math.max(
                0,
                ...history
                  .filter((item) => item.difficulty === key)
                  .map((item) => summarize(item).score),
              )}
              <small> poin</small>
            </strong>
            <span>
              {value.hp} HP awal · {value.base} poin dasar/hero
            </span>
          </div>
        ))}
      </div>
      <div className="section-heading history-heading">
        <h2>Riwayat perburuan</h2>
        <span>Hingga 50 sesi terakhir</span>
      </div>
      {!history.length ? (
        <div className="empty-state">
          <CompassIcon />
          <h3>Jejak pertamamu menunggu.</h3>
          <p>Selesaikan satu sesi untuk melihat hasil dan rekor di sini.</p>
          <StartButton />
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const stats = summarize(item);
            return (
              <Link to={`/results/${item.id}`} className="history-row" key={item.id}>
                <span className="history-icon">
                  <Trophy size={20} />
                </span>
                <div>
                  <h3>Solo · {DIFFICULTIES[item.difficulty].label}</h3>
                  <p>
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(item.completedAt)}{" "}
                    · {stats.correct}/{stats.total} hero
                  </p>
                </div>
                <strong>
                  {stats.score}
                  <small> poin</small>
                </strong>
                <ArrowUpRight size={17} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ProfilePage() {
  const settings = useHuntStore((s) => s.settings);
  const update = useHuntStore((s) => s.updateSettings);
  const [name, setName] = useState(settings.name);
  const [saved, setSaved] = useState(false);
  return (
    <div className="page-width profile-page">
      <PageIntro eyebrow="PROFIL PEMBURU" title="Buat dirimu nyaman.">
        Tidak perlu akun untuk menikmati perburuan.
      </PageIntro>
      <section className="profile-panel">
        <div className="profile-avatar">
          <Shield size={32} />
        </div>
        <div className="profile-status">
          <h2>{settings.name || "Pemburu baru"}</h2>
          <span>Pemain tamu · Perangkat ini</span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ name: name.trim() });
            setSaved(true);
          }}
        >
          <label htmlFor="player-name">Nama panggilan</label>
          <input
            id="player-name"
            value={name}
            maxLength={24}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            placeholder="Ingin dipanggil siapa?"
          />
          <button className="button primary" type="submit">
            Simpan nama <Check size={17} />
          </button>
          <span role="status">{saved ? "Nama diperbarui." : ""}</span>
        </form>
        <div className="profile-setting">
          <div>
            <h3>Efek suara</h3>
            <p>Suara singkat untuk jawaban benar dan salah.</p>
          </div>
          <button
            className="sound-switch"
            role="switch"
            aria-checked={!settings.muted}
            aria-label="Efek suara"
            onClick={() => update({ muted: !settings.muted })}
          >
            <span />
          </button>
        </div>
        <div className="local-note">
          <Shield size={19} />
          <p>
            Nama, pengaturan, dan hasil permainan disimpan di browser ini. Progres belum tersinkron
            ke perangkat lain.
          </p>
        </div>
      </section>
    </div>
  );
}

export function LegacyRedirect() {
  return <Navigate to="/" replace />;
}
