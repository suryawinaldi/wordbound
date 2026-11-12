import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  BarChart3,
  Compass,
  Crosshair,
  Home,
  Shield,
  UserRound,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useHuntStore } from "./store.js";

export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Hero Hunt — Beranda">
      <span className="brand-mark">
        <Crosshair size={25} strokeWidth={1.5} />
      </span>
      <span>
        HERO<span className="gold">HUNT</span>
        <small>THE MLBB GUESSING GAME</small>
      </span>
    </Link>
  );
}

export function SoundButton() {
  const muted = useHuntStore((s) => s.settings.muted);
  const update = useHuntStore((s) => s.updateSettings);
  return (
    <button
      className="icon-button"
      aria-label={muted ? "Aktifkan suara" : "Matikan suara"}
      aria-pressed={!muted}
      onClick={() => update({ muted: !muted })}
    >
      {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
    </button>
  );
}

export function Shell() {
  const { pathname } = useLocation();
  const inGame = pathname === "/play/solo";
  const warning = useHuntStore((s) => s.storageWarning);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className={`hunt-app ${inGame ? "in-game" : ""}`}>
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <header className="site-header">
        <Brand />
        {!inGame && (
          <nav className="desktop-nav" aria-label="Navigasi utama">
            <NavLink to="/" end>
              Beranda
            </NavLink>
            <NavLink to="/play">Main</NavLink>
            <NavLink to="/stats">Statistik</NavLink>
          </nav>
        )}
        <div className="header-actions">
          <SoundButton />
          {!inGame && (
            <Link className="guest-button" to="/profile">
              <UserRound size={16} />
              <span>Pemain tamu</span>
            </Link>
          )}
        </div>
      </header>
      {warning && (
        <div className="storage-warning" role="status">
          Penyimpanan browser tidak tersedia. Kamu tetap bisa main, tetapi progres dapat hilang saat
          halaman ditutup.
        </div>
      )}
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      {!inGame && (
        <>
          <footer className="site-footer">
            <span>
              <Crosshair size={14} /> Dibuat untuk penggemar, oleh penggemar.
            </span>
            <span>Fan-made. Tidak berafiliasi dengan MOONTON Games.</span>
          </footer>
          <nav className="mobile-nav" aria-label="Navigasi ponsel">
            {[
              ["/", "Beranda", Home],
              ["/play", "Main", Compass],
              ["/stats", "Statistik", BarChart3],
              ["/profile", "Profil", UserRound],
            ].map(([to, label, Icon]) => (
              <NavLink key={to} to={to} end={to === "/"}>
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, onConfirm }) {
  const cancel = useRef(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="confirm-dialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancel.current?.focus();
          }}
        >
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
          <div className="dialog-actions">
            <Dialog.Close ref={cancel} className="button secondary">
              Batal
            </Dialog.Close>
            <button className="button primary" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
          <Dialog.Close className="dialog-close icon-button" aria-label="Tutup dialog">
            <X size={18} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function MysteryArt({ compact = false, revealed = false }) {
  return (
    <div
      className={`mystery-art ${compact ? "compact" : ""} ${revealed ? "revealed" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 440 440" fill="none">
        <defs>
          <radialGradient id={compact ? "aura-small" : "aura"}>
            <stop stopColor="#D9B467" stopOpacity=".13" />
            <stop offset="1" stopColor="#D9B467" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="220" cy="220" r="210" fill={`url(#${compact ? "aura-small" : "aura"})`} />
        <g stroke="#C8AA70">
          <circle cx="220" cy="220" r="185" opacity=".13" />
          <circle cx="220" cy="220" r="154" opacity=".25" strokeDasharray="2 10" />
          <circle cx="220" cy="220" r="138" opacity=".2" />
          <path
            d="M220 18v40m0 324v40M18 220h40m324 0h40M78 78l27 27m230 230 27 27M78 362l27-27m230-230 27-27"
            opacity=".35"
          />
          <path d="m220 52 168 168-168 168L52 220Z" opacity=".1" />
        </g>
        <path
          d="m220 104 82 38v100c0 58-82 98-82 98s-82-40-82-98V142Z"
          fill="#111F29"
          stroke="#C1A16A"
          strokeWidth="1.4"
        />
        <path
          d="m220 117 70 32v92c0 48-70 85-70 85s-70-37-70-85v-92Z"
          stroke="#C1A16A"
          opacity=".25"
        />
        <path
          d="m220 143 48 26v44l-48 44-48-44v-44Z"
          fill="#20323B"
          stroke="#C1A16A"
          opacity=".6"
        />
        <path d="m189 182 31-19 31 19-10 33-21 15-21-15Z" fill="#C1A16A" fillOpacity=".12" />
        <path d="m194 195 17 5-8 8-9-13Zm52 0-17 5 8 8 9-13Z" fill="#E8C681" />
        <path d="m220 178-7 43 7 10 7-10-7-43Z" fill="#D8B676" />
        <path d="m186 264 68 26m-68 0 68-26M220 248v55" stroke="#C1A16A" opacity=".45" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`m${192 + i * 14} 355 4 4-4 4-4-4Z`}
            fill="#C1A16A"
            opacity={i === 0 ? 1 : 0.3}
          />
        ))}
      </svg>
      {!compact && (
        <>
          <div className="art-tag art-tag-top">
            <span className="tag-dot" /> IDENTITAS TERSEMBUNYI
            <Shield size={14} />
          </div>
          <div className="art-clue">
            <span>01 / PETUNJUK PERTAMA</span>
            <p>
              Setiap legenda
              <br />
              meninggalkan jejak.
            </p>
            <ArrowUpRight size={18} />
          </div>
          <div className="art-caption">BACA PETUNJUK. TEMUKAN SANG HERO.</div>
        </>
      )}
    </div>
  );
}

export function PageIntro({ eyebrow, title, children }) {
  return (
    <div className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
