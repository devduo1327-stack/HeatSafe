import React, { useState } from 'react';
import {
  X,
  Settings,
  ShieldCheck,
  Zap,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Bot,
  Scan,
  BellRing,
  Trash2,
  Globe,
  Sliders,
  Check,
} from 'lucide-react';
import { WeatherData } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProUnlocked: boolean;
  onUnlockPro: (password: string) => boolean;
  onLockPro: () => void;
  unit: 'C' | 'F';
  setUnit: (unit: 'C' | 'F') => void;
  weather: WeatherData | null;
  onClearChatHistory?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isProUnlocked,
  onUnlockPro,
  onLockPro,
  unit,
  setUnit,
  weather,
  onClearChatHistory,
}) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState<'plan' | 'preferences'>('plan');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [planActionToast, setPlanActionToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUnlockPro(passwordInput)) {
      setPasswordError(false);
      setPasswordInput('');
      setPlanActionToast('Successfully upgraded to HeatSafe Pro!');
      setTimeout(() => setPlanActionToast(null), 3000);
    } else {
      setPasswordError(true);
    }
  };

  const handleConfirmCancelPro = () => {
    onLockPro();
    setShowCancelConfirm(false);
    setPlanActionToast('Returned to HeatSafe Basic. You can re-upgrade to Pro anytime.');
    setTimeout(() => setPlanActionToast(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="bg-[#141417] border border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-[#e2e2e3]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Application Settings</span>
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                    isProUnlocked
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                  }`}
                >
                  {isProUnlocked ? 'Pro Active' : 'Basic Plan'}
                </span>
              </h2>
              <p className="text-xs text-white/50">Manage subscription plan, features, and user preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 bg-white/[0.01] px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveSettingsTab('plan')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeSettingsTab === 'plan'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Plan &amp; Subscription</span>
          </button>
          <button
            onClick={() => setActiveSettingsTab('preferences')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeSettingsTab === 'preferences'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Preferences &amp; Units</span>
          </button>
        </div>

        {/* Action Status Toast */}
        {planActionToast && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{planActionToast}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeSettingsTab === 'plan' && (
            <div className="space-y-6">
              {/* Current Active Plan Card */}
              <div
                className={`p-5 rounded-3xl border relative overflow-hidden transition-all ${
                  isProUnlocked
                    ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-cyan-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                    : 'bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-amber-500/10 border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.15)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/50">
                        Current Active Tier
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isProUnlocked
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                        }`}
                      >
                        {isProUnlocked ? 'HeatSafe Pro' : 'HeatSafe Basic'}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {isProUnlocked ? 'Full Thermal Protection Tier' : 'Standard Community Tier'}
                    </h3>
                    <p className="text-xs text-white/60 max-w-md">
                      {isProUnlocked
                        ? 'Unlimited access to SkyScan AI vision, clinical heat intelligence advisor, and smart water alarms.'
                        : 'Free access to live Heat Index station telemetry, UV alerts, interactive weather maps, and emergency dialers.'}
                    </p>
                  </div>

                  {/* Plan Switch Button */}
                  <div className="shrink-0">
                    {isProUnlocked ? (
                      <button
                        id="cancel-pro-upgrade-btn"
                        onClick={() => setShowCancelConfirm(true)}
                        className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/80 hover:text-red-300 border border-white/10 hover:border-red-500/30 text-xs font-semibold flex items-center gap-2 transition-all"
                      >
                        <Lock className="w-3.5 h-3.5 text-red-400" />
                        <span>Cancel Pro &amp; Return to Basic</span>
                      </button>
                    ) : (
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-orange-400 block">Upgrade Available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cancel Confirmation Drawer/Box */}
                {showCancelConfirm && (
                  <div className="mt-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3 animate-in fade-in">
                    <div className="flex items-start gap-2.5 text-red-300 text-xs font-medium">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white">Return to HeatSafe Basic Plan?</div>
                        <span>
                          Pro features (SkyScan AI, HeatSafe AI Chat, and Water Reminder alerts) will be locked. You can enter your Pro access passkey anytime to re-upgrade.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleConfirmCancelPro}
                        className="py-2 px-4 rounded-xl bg-red-500 hover:bg-red-400 text-black font-bold text-xs transition-all"
                      >
                        Yes, Downgrade to Basic
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-all"
                      >
                        Keep Pro
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Upgrade to Pro Section (Visible when on Basic) */}
              {!isProUnlocked && (
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <h4 className="text-sm font-bold text-white">Upgrade to HeatSafe Pro</h4>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Enter the access passkey to instantly activate multimodal sky photo scanning, customized health vulnerability profiling, and automated hydration alerts.
                  </p>

                  <form onSubmit={handleUpgradeSubmit} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={passwordInput}
                          onChange={(e) => {
                            setPasswordInput(e.target.value);
                            setPasswordError(false);
                          }}
                          placeholder="Enter Pro Access Passkey"
                          className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-sm text-white font-mono placeholder:text-white/30 focus:outline-hidden ${
                            passwordError ? 'border-red-500 bg-red-500/10' : 'border-white/15 focus:border-orange-500'
                          }`}
                        />
                      </div>
                      <button
                        type="submit"
                        className="py-2.5 px-6 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all shrink-0"
                      >
                        <Unlock className="w-4 h-4" />
                        <span>Upgrade to Pro</span>
                      </button>
                    </div>

                    {passwordError && (
                      <div className="text-xs text-red-400 font-medium">Invalid Pro Passkey. Please verify and try again.</div>
                    )}
                  </form>
                </div>
              )}

              {/* Plan Comparison Matrix */}
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-white/50">
                  Feature Entitlements Matrix
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Basic Column */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-bold text-white">HeatSafe Basic</span>
                      <span className="text-[10px] font-mono text-white/40">Free Forever</span>
                    </div>
                    <ul className="space-y-2 text-xs text-white/70">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Real-Time Heat Index &amp; UV Station Data</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>24-Hour &amp; 7-Day Heat Forecasting</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Interactive Global Heat Risk Map</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Emergency Helpline Directory &amp; Dialing</span>
                      </li>
                    </ul>
                  </div>

                  {/* Pro Column */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-orange-500/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-bold text-orange-400">HeatSafe Pro</span>
                      <span className="text-[10px] font-mono text-orange-400">Unlocked</span>
                    </div>
                    <ul className="space-y-2 text-xs text-white/85">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-orange-400" />
                        <span className="font-semibold text-white">SkyScan AI Photo Vision</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-orange-400" />
                        <span className="font-semibold text-white">HeatSafe AI Clinical Chatbot</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-orange-400" />
                        <span className="font-semibold text-white">Smart Hydration Timers &amp; Alarms</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-orange-400" />
                        <span className="font-semibold text-white">Personal Health Condition Profiler</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'preferences' && (
            <div className="space-y-6">
              {/* Temperature Unit Preference */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white">Temperature Measurement Unit</div>
                  <div className="text-xs text-white/50">Switch between Celsius (°C) and Fahrenheit (°F)</div>
                </div>

                <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-bold">
                  <button
                    onClick={() => setUnit('C')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      unit === 'C'
                        ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Celsius (°C)
                  </button>
                  <button
                    onClick={() => setUnit('F')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      unit === 'F'
                        ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Fahrenheit (°F)
                  </button>
                </div>
              </div>

              {/* Data & Cache Management */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div>
                  <div className="text-sm font-bold text-white">Chat &amp; Local Storage</div>
                  <div className="text-xs text-white/50">Clear cached HeatSafe AI consultation messages and temporary storage</div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (onClearChatHistory) onClearChatHistory();
                      try {
                        localStorage.removeItem('heatsafe_ai_chat_history');
                      } catch (e) {
                        console.error(e);
                      }
                      setPlanActionToast('HeatSafe AI chat history cleared successfully.');
                      setTimeout(() => setPlanActionToast(null), 3000);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-white/70 text-xs font-semibold border border-white/10 hover:border-red-500/30 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Clear AI Chat History</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
          <span className="text-xs text-white/40 font-mono">HeatSafe v2.4 • Clinical Edition</span>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
