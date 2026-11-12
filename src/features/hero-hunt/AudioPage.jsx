import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Headphones, Volume2 } from "lucide-react";
import { PageIntro } from "./components.jsx";

export default function AudioPage() {
  return (
    <div className="page-width audio-page">
      <Link className="text-link" to="/play">
        <ArrowLeft size={17} /> Pilihan permainan
      </Link>
      <PageIntro eyebrow="TEBAK SUARA · DALAM PERSIAPAN" title="Satu suara. Siapa heronya?">
        Tantangan khusus voice selection hero, terpisah dari petunjuk teks Solo Classic.
      </PageIntro>
      <section className="audio-preview-panel">
        <div className="audio-emblem">
          <Headphones size={50} strokeWidth={1.2} />
        </div>
        <h2>Voice draft pick sedang disiapkan.</h2>
        <p>
          Belum ada cuplikan yang siap diputar. Kamu tetap bisa menebak hero melalui role, mekanik,
          dan ciri khas di Solo Classic.
        </p>
        <span className="audio-language">
          <Volume2 size={16} /> Bahasa awal: Inggris · Default skin
        </span>
        <Link className="button primary" to="/play">
          Main Solo Classic <ArrowRight size={18} />
        </Link>
      </section>
      <section className="audio-rules">
        <h2>Cara main yang sedang disiapkan</h2>
        <ul>
          {[
            "Dengarkan cuplikan dan putar ulang saat perlu.",
            "Ketik nama hero; alias dan variasi tanda baca tetap diterima.",
            "Cuplikan yang menyebut nama hero tidak digunakan.",
            "Audio gagal dimuat? Ronde diganti tanpa mengurangi HP.",
          ].map((rule) => (
            <li key={rule}>
              <Check size={16} />
              {rule}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
