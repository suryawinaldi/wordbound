import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageIntro } from "./components.jsx";
import "./party.css";

async function request(token, body) {
  const response = await fetch("/api/party", { method: "POST", headers: {
    Authorization: "Bearer " + token, "Content-Type": "application/json",
  }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}
function sessionToken() {
  let token = sessionStorage.getItem("party.token");
  if (!token) {
    token = Array.from(crypto.getRandomValues(new Uint8Array(24)), n => n.toString(16).padStart(2, "0")).join("");
    sessionStorage.setItem("party.token", token);
  }
  return token;
}
export default function PartyPage() {
  const [code, setCode] = useState(() => sessionStorage.getItem("party.room") || "");
  const [room, setRoom] = useState(null);
  const [name, setName] = useState("");
  const [entry, setEntry] = useState("");
  const [question, setQuestion] = useState("");
  const [guess, setGuess] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [time, setTime] = useState(Date.now);
  const generation = useRef(0);
  useEffect(() => {
    if (!code) return;
    let stopped = false, timer;
    async function poll() {
      const version = generation.current;
      try {
        const snapshot = await request(sessionToken(), { code, action: "read" });
        if (!stopped && version === generation.current) { setRoom(snapshot); setError(""); }
      } catch (e) { if (!stopped && version === generation.current) setError(e.message); }
      if (!stopped) timer = setTimeout(poll, 2000);
    }
    poll();
    return () => { stopped = true; clearTimeout(timer); };
  }, [code]);
  useEffect(() => {
    if (!room?.deadline) return;
    const timer = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [room?.deadline]);
  useEffect(() => { setGuess(""); setQuestion(""); }, [room?.turn]);
  async function send(action, value) {
    setBusy(true); setError(""); generation.current++;
    try {
      const snapshot = await request(sessionToken(), { action, value, code: code || entry, name, turn: room?.turn });
      if (snapshot.left) { reset(); return; }
      sessionStorage.setItem("party.room", snapshot.code);
      setRoom(snapshot); setCode(snapshot.code);
    } catch (e) { setError(e.message); }
    finally { generation.current++; setBusy(false); }
  }
  function reset() {
    generation.current++;
    sessionStorage.removeItem("party.room");
    setCode(""); setRoom(null); setError("");
  }
  const active = room?.players.find(p => p.id === room.active);
  const mine = room && room.me === room.active;
  const host = room && room.me === room.players[0].id;
  const play = room && !["lobi", "selesai"].includes(room.phase);
  const latest = room?.log.at(-1);
  return <main className="page-width party-page">
    <PageIntro eyebrow="MULTIPLAYER · 2–9 PEMAIN" title="Siapa hero gue?">Temanmu melihat kartumu. Cari tahu isinya dengan pertanyaan ya atau tidak.</PageIntro>
    {error && <p role="alert" className="party-error">{error}</p>}
    {!room && !code && <section className="party-panel">
      <label>Nama panggilan<input maxLength="24" value={name} onChange={e => setName(e.target.value)} autoComplete="nickname" /></label>
      <button disabled={busy || !name.trim()} onClick={() => send("create")}>Buat room</button>
      <label>Kode room teman<input inputMode="numeric" maxLength="6" value={entry} onChange={e => setEntry(e.target.value.replace(/\D/g, ""))} /></label>
      <button disabled={busy || !name.trim() || entry.length !== 6} onClick={() => send("join")}>Gabung room</button>
      <Link className="text-link" to="/play">Sendirian? Main Solo Classic →</Link>
    </section>}
    {!room && code && <section className="party-panel">Menghubungkan ke room {code}… <button onClick={reset}>Kembali ke lobi</button></section>}
    {room && <>
      <section className="party-panel">
        <h2>{room.phase === "lobi" ? "Lobi" : room.phase === "selesai" ? "Semua kartu terbuka" : "Meja permainan"} · {code}</h2>
        {room.phase === "lobi" && <p>Bagikan kode enam digit ini ke temanmu. {room.players.length}/9 pemain sudah bergabung.</p>}
        <div className="party-cards">{room.players.map(p => <article key={p.id} className={play && p.id === room.active ? "current" : ""}>
          {room.phase !== "lobi" && (p.image ? <img src={p.image} alt={"Kartu milik " + p.name} /> : <div className="party-back" aria-label="Kartumu tertutup">?</div>)}
          {p.reference && <details><summary>Potret pembanding</summary><img src={p.reference} alt="Hero yang sama pada gambar lain" /></details>}
          <strong>{p.name}{p.id === room.me && " (kamu)"}</strong>
          {p.hero && <span>{p.hero} · {p.skin}</span>}
          {room.phase !== "lobi" && <small>{p.status === "main" ? p.lives + " nyawa" : p.status === "benar" ? "Berhasil" : "Nyawa habis"}</small>}
        </article>)}</div>
        {room.phase === "lobi" && (host ? <button disabled={busy || room.players.length < 2} onClick={() => send("start")}>Mulai permainan</button> : <p>Menunggu host memulai.</p>)}
        {room.phase === "lobi" && <button className="quiet" disabled={busy} onClick={() => send("leave")}>Keluar dari lobi</button>}
        {room.phase === "selesai" && <button onClick={reset}>Kembali ke lobi</button>}
      </section>
      {play && <section className="party-panel">
        <h2>{mine ? "Giliranmu" : "Giliran " + active.name} · {Math.max(0, Math.ceil((room.deadline - time) / 1000))} dtk</h2>
        {mine && room.phase === "tanya" && <form onSubmit={e => { e.preventDefault(); send("ask", question); }}>
          <label>Pertanyaan ya/tidak<input maxLength="180" placeholder="Apakah hero gue seorang Mage?" value={question} onChange={e => setQuestion(e.target.value)} /></label>
          <button disabled={busy || !question.trim()}>Tanya teman</button>
        </form>}
        {room.phase === "voting" && <>
          <strong>{latest.question}</strong>
          <p>Jawab berdasarkan kemampuan dasar hero. Skin hanya tampilan.</p>
          {mine || room.voted ? <p>{room.voted ? "Suaramu masuk." : "Menunggu suara teman."}</p> : <div className="party-actions">{["Ya", "Tidak", "Ragu"].map(v => <button key={v} disabled={busy} onClick={() => send("vote", v)}>{v}</button>)}</div>}
        </>}
        {mine && room.canClarify && <button disabled={busy} onClick={() => send("clarify")}>Perjelas pertanyaan sekali</button>}
        {mine && room.phase !== "voting" && <form onSubmit={e => { e.preventDefault(); send("guess", guess); }}>
          <label>Tebakanmu<select value={guess} onChange={e => setGuess(e.target.value)}><option value="">Pilih hero…</option>{room.choices.slice().sort().map(h => <option key={h}>{h}</option>)}</select></label>
          <div className="party-actions"><button disabled={busy || !guess}>Tebak hero</button><button type="button" className="quiet" disabled={busy} onClick={() => send("pass")}>Lewati giliran</button></div>
        </form>}
      </section>}
      {room.log.length > 0 && <section className="party-panel"><h2>Riwayat room</h2><ol>{room.log.slice().reverse().map((e,i) => <li key={room.log.length-i}><strong>{room.players.find(p => p.id === e.id)?.name}</strong> · {e.question || e.result}{e.counts && <small>{Object.entries(e.counts).map(([v,n]) => v + " " + n).join(" · ")}</small>}</li>)}</ol></section>}
    </>}
  </main>;
}
