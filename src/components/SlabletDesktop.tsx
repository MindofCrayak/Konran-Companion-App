import { useEffect, useRef, useState } from 'react';
import {
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

// 36-hour Konran time calculation to hand angles
const getKonranAngles = (timestamp: number) => {
  const now = new Date(timestamp);
  const earthSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  
  // 36h Konran day scaled from 24h Earth day
  const konranSeconds = Math.floor(earthSeconds * (36 / 24));
  const s = konranSeconds % 60;
  const totalMinutes = Math.floor(konranSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);

  const passHour = h % 18; // 18 hours per dial pass

  return {
    hourAngle: passHour * 20 + (m / 60) * 20,
    minuteAngle: m * 6 + (s / 60) * 6,
    secondAngle: s * 6,
    isNightwatch: h >= 18,
  };
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

  const { hourAngle, minuteAngle, secondAngle, isNightwatch } = getKonranAngles(now);

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

        {/* TOP-RIGHT MINI ANALOG CHRONOMETRON HUD TRIGGER */}
        <div 
          className="flex items-center gap-3.5 cursor-pointer group bg-black/60 px-3 py-1.5 rounded-xl border border-[#5e3b1c]/80 hover:border-[#ffd700] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
          onClick={() => {
            playKeyClick();
            setShowChronometron(true);
          }}
          title="Grand Chronometron // Click to expand horologium"
        >
          {/* Luminous Analog Dial */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full border-[3px] border-[#8b6508] bg-[#030804] shadow-[0_0_15px_rgba(57,255,20,0.45)] group-hover:border-[#ffd700] group-hover:shadow-[0_0_25px_#ffd700] transition-all flex items-center justify-center overflow-hidden select-none">
            {/* Illuminated Clock Face */}
            <img 
              src="/assests/clock-face.png" 
              alt="Konran Chronometer"
              className="absolute inset-0 w-full h-full object-cover filter contrast-150 brightness-110"
            />

            {/* Hour Spade Hand (High Contrast Gold) */}
            <div 
              className="absolute pointer-events-none transition-transform duration-75 z-10"
              style={{ 
                width: '46%',
                height: '46%',
                left: '27%',
                top: '13.5%',
                transformOrigin: '50% 79.36%',
                transform: `rotate(${hourAngle}deg)`
              }}
            >
              <img 
                src="/assests/hand-hour.png" 
                alt="Hour Hand" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_4px_#000] brightness-125" 
              />
            </div>

            {/* Minute Lance (Silver Lance) */}
            <div 
              className="absolute pointer-events-none transition-transform duration-75 z-20"
              style={{ 
                width: '56%',
                height: '56%',
                left: '22%',
                top: '4.2%',
                transformOrigin: '49.84% 81.84%',
                transform: `rotate(${minuteAngle}deg)`
              }}
            >
              <img 
                src="/assests/hour-minute.png" 
                alt="Minute Hand" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_4px_#000] brightness-125" 
              />
            </div>

            {/* Ruby Second Needle */}
            <div 
              className="absolute pointer-events-none transition-transform duration-75 z-30"
              style={{ 
                width: '58%',
                height: '58%',
                left: '21%',
                top: '2.8%',
                transformOrigin: '50% 81.30%',
                transform: `rotate(${secondAngle}deg)`
              }}
            >
              <img 
                src="/assests/hand-second.png" 
                alt="Second Hand" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_4px_#ff0000]" 
              />
            </div>

            {/* Center Gem Pivot */}
            <div className="absolute w-2.5 h-2.5 rounded-full bg-[#ffd700] border border-white z-40 shadow-[0_0_6px_#ffd700] flex items-center justify-center pointer-events-none">
              <div className="w-1 h-1 rounded-full bg-[#39ff14]" />
            </div>
          </div>

          {/* Telemetry Badge */}
          <div className="flex flex-col text-left font-mono leading-tight">
            <span className="text-[10px] text-[#a78b54] tracking-widest uppercase group-hover:text-[#ffd700] transition-colors">
              Chronometron
            </span>
            <span className="text-xs text-[#39ff14] font-bold">
              {isNightwatch ? 'PASS II // NIGHT' : 'PASS I // DAY'}
            </span>
            <span className="text-[10px] text-[#ffdf79] opacity-80">
              CLICK TO EXPAND
            </span>
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

      {/* FULL CHRONOMETRON MODAL */}
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