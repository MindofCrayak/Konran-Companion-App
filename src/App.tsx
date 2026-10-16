/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, BookOpen, Users, ArrowLeft, Sparkles } from 'lucide-react';
import { BrandDecorations } from './components/BrandDecorations';
import { CharacterSwitcherBar } from './components/CharacterSwitcherBar';
import { CodexModal } from './components/CodexModal';
import { PartyVaultModal } from './components/PartyVaultModal';
import { CrossroadsModal } from './components/CrossroadsModal';
import { DossierView } from './components/DossierView';
import { FatedCharacterBadge } from './components/FatedCharacterBadge';
import { QUESTIONS } from './data/questions';
import { QuizScores, PartyCharacterResult, NyneDeityId } from './types';
import { useCharacter } from './context/CharacterContext';
import { 
  toggleAudio, 
  getAudioEnabled, 
  playKeyClick, 
  playOptionSelect, 
  playCrossroadsAlert, 
  playDivineReveal 
} from './utils/audio';

type QuizStep = 'intro' | 'quiz' | 'tiebreaker' | 'result';

export default function App() {
  const { account, activeCharacter, recordDeityTrial, resetDeityTrial } = useCharacter();
  const [step, setStep] = useState<QuizStep>('intro');
  const [playerName, setPlayerName] = useState(account.displayName || '');
  const [charName, setCharName] = useState(activeCharacter?.name || '');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [showGuestForm, setShowGuestForm] = useState(false);
  
  // Track answer history for back navigation: array of selected deity IDs per question
  const [answersHistory, setAnswersHistory] = useState<string[][]>([]);

  // Scores for all 9 deities
  const [scores, setScores] = useState<QuizScores>({
    Lyricia: 0,
    Oray: 0,
    Ousava: 0,
    Ay: 0,
    Kayzoku: 0,
    Celeste: 0,
    Psyon: 0,
    Krayvuk: 0,
    Slavyna: 0,
  });

  // Tied deities for Crossroads step
  const [tiedDeities, setTiedDeities] = useState<string[]>([]);

  // Modals
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [codexDeityId, setCodexDeityId] = useState<string | undefined>(undefined);
  const [isPartyVaultOpen, setIsPartyVaultOpen] = useState(false);
  const [audioActive, setAudioActive] = useState<boolean>(getAudioEnabled());

  const handleToggleSound = () => {
    const next = toggleAudio();
    setAudioActive(next);
    if (next) playKeyClick();
  };

  const handleOpenCodex = (deityId?: string) => {
    playKeyClick();
    setCodexDeityId(deityId);
    setIsCodexOpen(true);
  };

  const startTrialsForActiveCharacter = () => {
    if (activeCharacter) {
      setPlayerName(account.displayName);
      setCharName(activeCharacter.name);
    }
    playOptionSelect();
    setCurrentQIndex(0);
    setAnswersHistory([]);
    setScores({
      Lyricia: 0,
      Oray: 0,
      Ousava: 0,
      Ay: 0,
      Kayzoku: 0,
      Celeste: 0,
      Psyon: 0,
      Krayvuk: 0,
      Slavyna: 0,
    });
    setStep('quiz');
  };

  const handleStartTrials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !charName.trim()) {
      return;
    }
    playOptionSelect();
    setCurrentQIndex(0);
    setAnswersHistory([]);
    setScores({
      Lyricia: 0,
      Oray: 0,
      Ousava: 0,
      Ay: 0,
      Kayzoku: 0,
      Celeste: 0,
      Psyon: 0,
      Krayvuk: 0,
      Slavyna: 0,
    });
    setStep('quiz');
  };

  const handleSelectOption = (deities: string[]) => {
    playOptionSelect();

    // Calculate score increment: primary (+2), secondary (+1)
    const newScores = { ...scores };
    if (deities.length === 1) {
      newScores[deities[0]] = (newScores[deities[0]] || 0) + 2;
    } else if (deities.length >= 2) {
      newScores[deities[0]] = (newScores[deities[0]] || 0) + 2;
      newScores[deities[1]] = (newScores[deities[1]] || 0) + 1;
    }

    setScores(newScores);
    setAnswersHistory([...answersHistory, deities]);

    const nextQ = currentQIndex + 1;
    if (nextQ < QUESTIONS.length) {
      setCurrentQIndex(nextQ);
    } else {
      // Evaluate results or trigger Crossroads tie-breaker
      checkTieBreaker(newScores);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQIndex === 0 || answersHistory.length === 0) return;
    playKeyClick();

    // Revert the last answer's score
    const lastAnswer = answersHistory[answersHistory.length - 1];
    const newScores = { ...scores };
    if (lastAnswer.length === 1) {
      newScores[lastAnswer[0]] = Math.max(0, (newScores[lastAnswer[0]] || 0) - 2);
    } else if (lastAnswer.length >= 2) {
      newScores[lastAnswer[0]] = Math.max(0, (newScores[lastAnswer[0]] || 0) - 2);
      newScores[lastAnswer[1]] = Math.max(0, (newScores[lastAnswer[1]] || 0) - 1);
    }

    setScores(newScores);
    setAnswersHistory(answersHistory.slice(0, -1));
    setCurrentQIndex(currentQIndex - 1);
  };

  const checkTieBreaker = (finalScores: QuizScores) => {
    let maxScore = -1;
    for (const pts of Object.values(finalScores)) {
      if (pts > maxScore) maxScore = pts;
    }

    const tied = Object.keys(finalScores).filter(g => finalScores[g] === maxScore);

    if (tied.length > 1) {
      playCrossroadsAlert();
      setTiedDeities(tied);
      setStep('tiebreaker');
    } else {
      finishQuiz(finalScores);
    }
  };

  const handleResolveTie = (chosenGod: string) => {
    const updated = {
      ...scores,
      [chosenGod]: (scores[chosenGod] || 0) + 1
    };
    setScores(updated);
    finishQuiz(updated);
  };

    const finishQuiz = (finalScores: QuizScores) => {
    setStep('result');
    playDivineReveal();

    if (activeCharacter) {
      const sorted = Object.entries(finalScores).sort((a, b) => b[1] - a[1]);
      const topGod = (sorted[0] ? sorted[0][0] : undefined) as NyneDeityId | undefined;
      recordDeityTrial(activeCharacter.id, finalScores, topGod);
    }

    // Trigger celestial golden celebration particles
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#ffcc00', '#39ff14', '#ea32ca', '#9900ff', '#ffffff']
      });
    } catch {
      // Ignore
    }
  };

  const handleRetake = () => {
    setStep('intro');
    setCurrentQIndex(0);
    setAnswersHistory([]);
  };

  const handleInspectHistoricalResult = (record: PartyCharacterResult) => {
    setPlayerName(record.playerName);
    setCharName(record.characterName);
    setScores(record.scores);
    setStep('result');
  };

  const currentQ = QUESTIONS[currentQIndex];
  const progressPercent = ((currentQIndex) / QUESTIONS.length) * 100;

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-between pb-10 bg-[#020205] relative overflow-x-hidden"
      style={{
        backgroundImage: `radial-gradient(ellipse at 50% 20%, rgba(18, 55, 30, 0.45) 0%, rgba(2, 2, 5, 0.95) 75%), url('https://i.imgur.com/rbA1bPE.png')`,
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Subtle CRT Overlay */}
      <div className="fixed inset-0 crt-overlay z-40 pointer-events-none opacity-40" />

      {/* Top Magitech Active Character HUD */}
      <CharacterSwitcherBar />

      {/* Top Floating Control Bar */}
      <div className="pt-6 px-4 w-full">
        <header className="relative z-30 max-w-[820px] w-full mx-auto flex items-center justify-between pb-4 border-b border-[#ffcc00]/20 text-[#ffcc00]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse" />
            <span className="font-mono text-xs tracking-wider text-[#ffcc00]/80 uppercase">
              Konran // Pilgrimage Interface
            </span>
          </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenCodex()}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#ffcc00]/10 hover:bg-[#ffcc00]/20 border border-[#ffcc00]/30 rounded-sm text-xs font-mono tracking-wider transition-all cursor-pointer"
            title="Browse all 9 Gods and their Factions"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pantheon Codex</span>
          </button>

          <button
            onClick={() => {
              playKeyClick();
              setIsPartyVaultOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#ffcc00]/10 hover:bg-[#ffcc00]/20 border border-[#ffcc00]/30 rounded-sm text-xs font-mono tracking-wider transition-all cursor-pointer"
            title="Inspect Adventuring Party Roster"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Party Roster</span>
          </button>

          <button
            onClick={handleToggleSound}
            className="p-1.5 text-[#ffcc00]/70 hover:text-[#ffcc00] hover:bg-[#ffcc00]/10 rounded border border-[#ffcc00]/20 cursor-pointer"
            title={audioActive ? "Mute Synthesizer" : "Enable Magitech Audio"}
          >
            {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>
      </div>

      {/* Main Terminal Frame */}
      <main className="relative z-20 w-full max-w-[760px] mx-auto my-6">
        <div 
          className="relative w-full rounded-sm p-6 sm:p-10 backdrop-blur-md border border-[#ffcc00]/40 magitech-glow-box"
          style={{
            background: 'linear-gradient(145deg, var(--screen-green-top), var(--screen-green-bottom))',
          }}
        >
          {/* Aesthetic Brand Borders */}
          <BrandDecorations />

          {/* STEP 1: INTRO / FATED CHARACTER BADGE / REGISTRATION */}
          {step === 'intro' && (
            <div className="space-y-6">
              {activeCharacter && !showGuestForm ? (
                <div className="space-y-5 animate-fadeIn">
                  <div className="text-center space-y-1.5">
                    <h1 className="text-3xl sm:text-4xl font-totally-gothic text-[#ffcc00] tracking-wider drop-shadow-[0_0_15px_rgba(255,204,0,0.6)]">
                      The Fated Deity Quiz
                    </h1>
                    <div className="text-xs sm:text-sm font-tema-cantante text-[#ffcc00]/90 tracking-wide">
                      Konran System Chronometer & Covenant Registry
                    </div>
                  </div>

                  <FatedCharacterBadge
                    character={activeCharacter}
                    account={account}
                    onStartTrial={startTrialsForActiveCharacter}
                    onViewDossier={() => {
                      playOptionSelect();
                      setPlayerName(account.displayName);
                      setCharName(activeCharacter.name);
                      setScores(activeCharacter.quizScores || scores);
                      setStep('result');
                    }}
                    onResetTrial={() => resetDeityTrial(activeCharacter.id)}
                  />

                  <div className="pt-2 text-center">
                    <button
                      onClick={() => {
                        playKeyClick();
                        setShowGuestForm(true);
                      }}
                      className="text-xs font-mono text-[#ded7f0]/70 hover:text-[#ffcc00] underline cursor-pointer"
                    >
                      Or test an unlinked guest adventurer persona →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center space-y-2">
                    <h1 className="text-4xl sm:text-5xl font-totally-gothic text-[#ffcc00] tracking-wider drop-shadow-[0_0_15px_rgba(255,204,0,0.6)]">
                      The Fated Deity Quiz
                    </h1>
                    <div className="text-lg font-tema-cantante text-[#ffcc00] tracking-wide drop-shadow-[0_0_8px_rgba(255,204,0,0.4)]">
                      Konran System Pilgrim Ledger
                    </div>
                    <p className="text-sm sm:text-base text-[#ffcc00]/95 leading-relaxed max-w-xl mx-auto pt-2 font-serif">
                      Welcome, traveler. Discover which of <span className="nyne-glitch text-lg px-1">The Nyne</span> gods 
                      you most align with while navigating your perilous adventures as a Fated of Konran.
                    </p>
                  </div>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-[#ffcc00] to-transparent my-4" />

                  <form onSubmit={handleStartTrials} className="space-y-4 max-w-md mx-auto">
                    <div className="space-y-1.5">
                      <label htmlFor="playerName" className="block text-xs font-mono font-bold tracking-widest text-[#ffcc00] uppercase">
                        Player Designation
                      </label>
                      <input
                        type="text"
                        id="playerName"
                        required
                        placeholder="Enter your name / player handle..."
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#ffcc00]/5 border border-[#ffcc00]/40 rounded-sm text-[#ffcc00] placeholder-[#ffcc00]/30 focus:outline-none focus:border-[#ffcc00] focus:ring-1 focus:ring-[#ffcc00] transition-all font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="charName" className="block text-xs font-mono font-bold tracking-widest text-[#ffcc00] uppercase">
                        Avatar Designation
                      </label>
                      <input
                        type="text"
                        id="charName"
                        required
                        placeholder="Enter D&D character name & class..."
                        value={charName}
                        onChange={(e) => setCharName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#ffcc00]/5 border border-[#ffcc00]/40 rounded-sm text-[#ffcc00] placeholder-[#ffcc00]/30 focus:outline-none focus:border-[#ffcc00] focus:ring-1 focus:ring-[#ffcc00] transition-all font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 py-3.5 px-6 bg-[#ffcc00]/15 hover:bg-[#ffcc00]/30 text-[#ffcc00] hover:text-white border border-[#ffcc00] rounded-sm font-template-gothic uppercase tracking-widest text-base transition-all duration-200 shadow-[0_0_15px_rgba(255,204,0,0.3)] hover:shadow-[0_0_25px_rgba(255,204,0,0.6)] cursor-pointer flex items-center justify-center gap-2 group"
                    >
                      <Sparkles className="w-4 h-4 text-[#ffcc00] group-hover:rotate-12 transition-transform" />
                      <span>Initialize Trials</span>
                    </button>
                  </form>

                  {activeCharacter && (
                    <div className="pt-2 text-center">
                      <button
                        onClick={() => {
                          playKeyClick();
                          setShowGuestForm(false);
                        }}
                        className="text-xs font-mono text-[#39ff14] hover:underline cursor-pointer"
                      >
                        ← Return to active alias: {activeCharacter.name}
                      </button>
                    </div>
                  )}

                  {/* Quick Summary Pill */}
                  <div className="pt-2 text-center text-xs text-[#ded7f0]/70 font-mono">
                    20 Deep Philosophical Queries • Crossroads Tie-Breaker Engine • PDF Dossier Export
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: INTERACTIVE QUIZ */}
          {step === 'quiz' && currentQ && (
            <div className="space-y-6 animate-fadeIn">
              {/* Progress and Counter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#ffcc00] drop-shadow-[0_0_5px_rgba(255,204,0,0.4)]">
                  <span>QUERY {currentQ.id} OF {QUESTIONS.length}</span>
                  {currentQ.category && (
                    <span className="text-[#ded7f0]/70 uppercase tracking-wider hidden sm:inline">
                      {currentQ.category}
                    </span>
                  )}
                  <span>{Math.round(((currentQIndex) / QUESTIONS.length) * 100)}% COMPLETE</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#ffcc00]/10 border border-[#ffcc00]/30 rounded-xs overflow-hidden">
                  <div
                    className="h-full bg-[#ffcc00] shadow-[0_0_12px_#ffcc00] transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="py-2">
                <h2 className="text-xl sm:text-2xl text-[#ffcc00] font-serif leading-relaxed drop-shadow-[0_0_8px_rgba(255,204,0,0.4)]">
                  {currentQ.id}. {currentQ.title}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(option.deities)}
                    className="w-full text-left p-4 rounded-sm bg-[#ffcc00]/5 hover:bg-[#ffcc00]/15 border border-[#ffcc00]/30 hover:border-[#ffcc00] text-[#ffcc00] hover:text-white transition-all duration-200 cursor-pointer group shadow-[0_0_8px_rgba(255,204,0,0.05)] hover:shadow-[inset_0_0_15px_rgba(255,204,0,0.2)] hover:translate-x-1"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-sm text-[#ffcc00] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5">
                        &gt;
                      </span>
                      <span className="text-base font-sans leading-relaxed text-[#ffcc00]/95 group-hover:text-white">
                        {option.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Back Navigation Button */}
              {currentQIndex > 0 && (
                <div className="pt-2 flex justify-start">
                  <button
                    onClick={handlePreviousQuestion}
                    className="flex items-center gap-1.5 text-xs font-mono text-[#ffcc00]/70 hover:text-[#ffcc00] px-3 py-1.5 rounded hover:bg-[#ffcc00]/10 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous Question</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: TIEBREAKER */}
          {step === 'tiebreaker' && (
            <CrossroadsModal
              tiedDeities={tiedDeities}
              onSelect={handleResolveTie}
            />
          )}

          {/* STEP 4: RESULT DOSSIER */}
          {step === 'result' && (
            <DossierView
              player={playerName}
              character={charName}
              scores={scores}
              onRetake={handleRetake}
              onOpenCodex={handleOpenCodex}
            />
          )}

        </div>
      </main>

      {/* Footer Branding Notice */}
      <footer className="relative z-20 text-center py-4 text-xs font-mono text-[#ffcc00]/60 space-y-1">
        <div>Konran Homebrew D&D 5e Setting • Created by GM Drake / Game Master on Demand</div>
        <div className="text-[11px] text-[#ded7f0]/50">
          Crafted with Magitech Terminal telemetry & The Nyne Celestial Matrix
        </div>
      </footer>

      {/* Codex Modal */}
      <CodexModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
        initialDeityId={codexDeityId}
      />

      {/* Party Vault Modal */}
      <PartyVaultModal
        isOpen={isPartyVaultOpen}
        onClose={() => setIsPartyVaultOpen(false)}
        onSelectResult={handleInspectHistoricalResult}
      />

    </div>
  );
}
