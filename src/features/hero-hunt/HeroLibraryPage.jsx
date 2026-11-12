import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Check, Clock3, Search, Shield } from "lucide-react";
import { PageIntro } from "./components.jsx";
import { HEROES, PENDING_HEROES, ROSTER } from "./content.js";
import { normalizeAnswer } from "./engine.js";

export default function HeroLibraryPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(
    () =>
      ROSTER.filter((hero) => {
        const matchesStatus =
          status === "all" || (status === "ready" ? hero.enabled : !hero.enabled);
        const needle = normalizeAnswer(query);
        return (
          matchesStatus &&
          [hero.name, ...hero.aliases].some((name) => normalizeAnswer(name).includes(needle))
        );
      }),
    [query, status],
  );

  return (
    <div className="page-width library-page">
      <Link to="/" className="text-link">
        <ArrowLeft size={17} /> Beranda
      </Link>
      <PageIntro eyebrow="ARSIP LAND OF DAWN" title="Kenali para legenda.">
        {HEROES.length} hero tersedia untuk dicoba. {PENDING_HEROES.length} lainnya menunggu
        peninjauan sebelum masuk perburuan.
      </PageIntro>
      <div className="library-note">
        <Shield size={19} />
        <p>
          Edisi preview. Petunjuk dan cakupan daftar masih diperiksa terhadap sumber resmi. Hero
          yang datanya belum cukup tidak akan muncul di sesi.
        </p>
      </div>
      <div className="library-controls">
        <div className="library-search">
          <Search size={18} />
          <input
            aria-label="Cari hero"
            type="search"
            placeholder="Cari nama hero…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <label>
          Status hero
          <select
            aria-label="Status hero"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">Semua ({ROSTER.length})</option>
            <option value="ready">Tersedia ({HEROES.length})</option>
            <option value="pending">Dalam peninjauan ({PENDING_HEROES.length})</option>
          </select>
        </label>
      </div>
      <p className="library-count" role="status">
        {filtered.length} hero ditemukan
      </p>
      <div className="library-grid">
        {filtered.map((hero) => (
          <article key={hero.id} className={`library-card ${hero.enabled ? "" : "pending"}`}>
            <div className="library-card-heading">
              <span className="hero-initials" aria-hidden="true">
                {hero.name
                  .split(/[ .-]/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("")}
              </span>
              <div>
                <h2>{hero.name}</h2>
                <p>{hero.role || "Detail sedang diperiksa"}</p>
              </div>
            </div>
            <span className="library-status">
              {hero.enabled ? (
                <>
                  <Check size={14} /> Tersedia · 5 petunjuk
                </>
              ) : (
                <>
                  <Clock3 size={14} /> Dalam peninjauan
                </>
              )}
            </span>
            {!hero.enabled && <p className="pending-reason">{hero.reason}</p>}
            <a className="library-source" href={hero.sourceUrl} target="_blank" rel="noreferrer">
              Referensi komunitas <ArrowUpRight size={14} />
              <span className="sr-only"> untuk {hero.name} (tab baru)</span>
            </a>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Search size={30} />
          <h2>Hero belum ditemukan.</h2>
          <p>Coba nama lain atau ubah filter status.</p>
          <button
            className="button secondary"
            onClick={() => {
              setQuery("");
              setStatus("all");
            }}
          >
            Reset pencarian
          </button>
        </div>
      )}
    </div>
  );
}
