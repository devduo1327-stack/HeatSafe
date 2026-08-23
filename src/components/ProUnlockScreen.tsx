import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Sparkles,
  BellRing,
  Bot,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Scan,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ActiveTab } from '../types';

interface ProUnlockScreenProps {
  isProUnlocked: boolean;
  onUnlock: (password: string) => boolean;
  onLock: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  targetFeature?: 'water_reminder' | 'heatsafe_ai' | 'skyscan_ai' | 'general';
}

export const ProUnlockScreen: React.FC<ProUnlockScreenProps> = ({
  isProUnlocked,
  onUnlock,
  onLock,
  setActiveTab,
  targetFeature = 'general',
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const success = onUnlock(passwordInput.trim());
    if (success) {
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error(err);
      }
      setTimeout(() => {
        if (targetFeature === 'heatsafe_ai') {
          setActiveTab('heatsafe_ai');
        } else if (targetFeature === 'skyscan_ai') {
          setActiveTab('skyscan_ai');
        } else {
          setActiveTab('today');
        }
      }, 1200);
    } else {
      setErrorMessage('Incorrect password. Please enter the valid HeatSafe Pro access code.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200 py-4">
      {/* Return back button */}
      <button
        onClick={() => setActiveTab('today')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>

      {/* Main Card */}
      <div className="bg-white/5 rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {isProUnlocked ? (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Status</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">HeatSafe Pro is Unlocked</h2>
              <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed">
                All premium thermal health protections, SkyScan AI computer vision, personalized AI safety intelligence, and automated water reminders are fully enabled.
              </p>
            </div>

            {/* Quick links to unlocked features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2">
              <button
                onClick={() => setActiveTab('today')}
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                      Water Reminder
                    </div>
                    <div className="text-[11px] text-white/40">Active under Today</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('heatsafe_ai')}
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                      HeatSafe AI
                    </div>
                    <div className="text-[11px] text-white/40">Clinical Advisor</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('skyscan_ai')}
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Scan className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                      SkyScan AI
                    </div>
                    <div className="text-[11px] text-white/40">Sky Photo Vision</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-2">
              <button
                onClick={onLock}
                className="py-2 px-4 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-300 border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>Cancel Pro Upgrade &amp; Return to Basic</span>
              </button>
              <span className="text-[11px] text-white/40">
                You can upgrade back to Pro anytime using your Pro access passkey.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header / Lock badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      HeatSafe Pro
                    </h2>
                    <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      Locked
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/50 font-medium mt-0.5">
                    Enter the password to activate HeatSafe Pro
                  </p>
                </div>
              </div>
            </div>

            {/* Targeted Feature Notice */}
            {targetFeature === 'water_reminder' && (
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs font-medium flex items-start gap-3">
                <BellRing className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Water Reminder is Locked</span>
                  Automated hydration interval alarms and smart notifications require HeatSafe Pro password verification.
                </div>
              </div>
            )}

            {targetFeature === 'heatsafe_ai' && (
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs font-medium flex items-start gap-3">
                <Bot className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">HeatSafe AI is Locked</span>
                  Clinical thermal risk simulations and conversational AI health guidance require HeatSafe Pro access.
                </div>
              </div>
            )}

            {targetFeature === 'skyscan_ai' && (
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-xs font-medium flex items-start gap-3">
                <Scan className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">SkyScan AI is Locked</span>
                  Multimodal computer vision sky photo analysis and real-time atmospheric correlation require HeatSafe Pro access.
                </div>
              </div>
            )}

            {/* Feature comparison grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <BellRing className="w-4 h-4" />
                  <span>Water Reminder</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Automatic countdown timers and adaptive hydration targets calibrated to extreme heat indices.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                  <Bot className="w-4 h-4" />
                  <span>HeatSafe AI</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Personal vulnerability analysis, medication risk modeling, and real-time health advice.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <Scan className="w-4 h-4" />
                  <span>SkyScan AI</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Attach sky photos for computer vision cloud cover, UV radiance penetration, and microclimate heat synthesis.
                </p>
              </div>
            </div>

            {/* Password input form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                    <span>HeatSafe Pro Password</span>
                  </span>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter HeatSafe Pro password..."
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full pl-4 pr-12 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 text-sm font-mono tracking-wider focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {isSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Password accepted! Unlocking HeatSafe Pro...</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSuccess || !passwordInput.trim()}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all active:scale-98"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Unlock HeatSafe Pro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('today')}
                  className="py-3.5 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm border border-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
