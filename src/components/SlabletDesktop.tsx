import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CircleUserRound,
  Compass,
  Orbit,
  Radio,
  Shield,
  Sparkles,
  TerminalSquare,
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { playKeyClick } from '../utils/audio';
import { KonranGlobe } from './KonranGlobe';
import { GrandChronometronModal } from './GrandChronometronModal';
import './SlabletDesktop.css';

interface SlabletDesktopProps {
  onOpenCodex: () => void;
  onOpenTrials: () => void;
  onOpenReputation: () => void;
}

const getKonranTime = (timestamp: number) => {
  const now = new Date(timestamp);
  const earthSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  // 36-hour Konran day scaled from 24-hour Earth day
  const konranSeconds = Math.floor(earthSeconds * (36 / 24));
  const hours = Math.floor(konranSeconds / 3600);
  const minutes = Math.floor((konranSeconds % 3600) / 60);
  const seconds = konranSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
};

export const SlabletDesktop = ({
  onOpenCodex,
  onOpenTrials,
  onOpenReputation,
}: SlabletDesktopProps) => {
  const { account, activeCharacter } = useCharacter();
  const [now, setNow] = useState(() => Date.now());
  const [notice, setNotice] = useState('');
  const [showChronometron, setShowChronometron] = useState(false);
  const noticeTimer = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => () => {
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
  }, []);

  const showUnlinkedNotice = (module: string) => {
    playKeyClick();
    setNotice(`${module} // NO ACTIVE LINK`);
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => {
      setNotice('');
      noticeTimer.current = null;
    }, 2600);
  };

  return (
    <main className="slablet-desktop">
      <div className="slablet-grid" aria-hidden="true" />
      <div className="slablet-vignette" aria-hidden="true" />
      <div className="slablet-crt" aria-hidden="true" />

      <header className="slablet-hud">
        <div className="slablet-brand">
          <span className="slablet-status-light" />
          <div>
            <p className="slablet-eyebrow">Konran Spatial OS</p>
            <p className="slablet-system-name">SLABLET // CELESTIAL ARRAY</p>
          </div>
        </div>

        <div className="slablet-character">
          <CircleUserRound aria-hidden="true" />
          <span>
            <small>ACTIVE CHARACTER</small>
            <strong>{activeCharacter?.name || account.displayName || 'Undeclared Persona'}</strong>
          </span>
        </div>

        {/* CLICKABLE CHRONOMETRON HUD TRIGGER */}
        <div 
          className="slablet-clock cursor-pointer hover:brightness-125 transition-all"
          onClick={() => {
            playKeyClick();
            setShowChronometron(true);
          }}
          title="Click to engage Grand Chronometron"
        >
          <span className="slablet-clock-icon"><Activity aria-hidden="true" /></span>
          <span>
            <small>KONRAN ROTATION // 36H</small>
            <strong>{getKonranTime(now)}</strong>
          </span>
        </div>
      </header>

      <section className="slablet-orbit-stage" aria-label="Konran planetary desktop">
        <div className="slablet-orbit slablet-orbit--outer" aria-hidden="true" />
        <div className="slablet-orbit slablet-orbit--inner" aria-hidden="true" />
        <div className="slablet-globe-frame">
          <div className="slablet-globe-label">
            <span className="slablet-status-light" />
            KONRAN // LIVE ORBIT
          </div>
          <KonranGlobe />
          <div className="slablet-moon-labels" aria-label="Orbiting moons">
            <span><i className="moon-dot moon-dot--amber" /> OLYSPHERE</span>
            <span><i className="moon-dot moon-dot--violet" /> AYANATH</span>
          </div>
        </div>

        <button
          className="slablet-module slablet-module--codex"
          onClick={onOpenCodex}
        >
          <BookOpen aria-hidden="true" />
          <span><small>ARCHIVE 01</small><strong>Pantheon Codex</strong></span>
          <ArrowUpRight aria-hidden="true" className="module-arrow" />
        </button>

        <button
          className="slablet-module slablet-module--kamp"
          onClick={() => showUnlinkedNotice('K.A.M.P. TERMINAL')}
        >
          <TerminalSquare aria-hidden="true" />
          <span><small>ACADEMIC NETWORK</small><strong>K.A.M.P. Terminal</strong></span>
          <ArrowUpRight aria-hidden="true" className="module-arrow" />
        </button>

        <button
          className="slablet-module slablet-module--exchange"
          onClick={() => showUnlinkedNotice('OBSYDIAN EXCHANGE')}
        >
          <Orbit aria-hidden="true" />
          <span><small>MARKET UPLINK</small><strong>Obsydian Exchange</strong></span>
          <ArrowUpRight aria-hidden="true" className="module-arrow" />
        </button>

        <button
          className="slablet-module slablet-module--fated"
          onClick={() => { playKeyClick(); onOpenTrials(); }}
        >
          <Sparkles aria-hidden="true" />
          <span><small>IDENTITY &amp; TRIALS</small><strong>Fated Badge &amp; Trials</strong></span>
          <ArrowUpRight aria-hidden="true" className="module-arrow" />
        </button>

        {notice && <div className="slablet-notice" role="status">{notice}</div>}
      </section>

      {/* CHRONOMETRON OVERLAY */}
      <GrandChronometronModal 
        isOpen={showChronometron} 
        onClose={() => setShowChronometron(false)} 
      />

      <footer className="slablet-footer">
        <div className="slablet-coordinates">
          <Compass aria-hidden="true" />
          <span><small>PLANETARY FIX</small><strong>47° 12′ N&nbsp; / &nbsp;08° 44′ E</strong></span>
        </div>
        <div className="slablet-moons-footer">
          <span><i className="moon-dot moon-dot--amber" /> Olysphere <small>sentinel</small></span>
          <span><i className="moon-dot moon-dot--violet" /> Ayanath <small>watchtower</small></span>
        </div>
        <button className="slablet-ledger-button" onClick={onOpenReputation}>
          <Shield aria-hidden="true" />
          <span>Faction Standings Ledger</span>
          <ArrowUpRight aria-hidden="true" />
        </button>
      </footer>
      <div className="slablet-signal"><Radio aria-hidden="true" /> MAGITECH SIGNAL STABLE</div>
    </main>
  );
};