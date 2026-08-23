import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Sun,
  Activity,
  HardHat,
  Flame,
  Wind,
  Gauge,
  Clock,
  CheckCircle2,
  Plus,
  RotateCcw,
  Bell,
  BellRing,
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp,
  AlertOctagon,
  Lock,
  Unlock,
  KeyRound,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WeatherData, ActiveTab } from '../types';
import { getHeatRiskLevel } from '../utils/weather';

interface TodayViewProps {
  weather: WeatherData;
  unit: 'C' | 'F';
  setActiveTab: (tab: ActiveTab) => void;
  isProUnlocked?: boolean;
  onUnlockClick?: (target?: 'water_reminder' | 'heatsafe_ai' | 'general') => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  weather,
  unit,
  setActiveTab,
  isProUnlocked = false,
  onUnlockClick,
}) => {
  // Hydration state
  const [hydrationGoalMl, setHydrationGoalMl] = useState(2500);
  const [currentHydrationMl, setCurrentHydrationMl] = useState(() => {
    const saved = localStorage.getItem('heatsafe_hydration_today');
    return saved ? parseInt(saved, 10) : 750;
  });
  const [reminderMinutes, setReminderMinutes] = useState(45);
  const [isReminderActive, setIsReminderActive] = useState(false);
  const [reminderCountdown, setReminderCountdown] = useState(45 * 60);
  const [lastLoggedAmount, setLastLoggedAmount] = useState<number | null>(null);

  // Save hydration
  useEffect(() => {
    localStorage.setItem('heatsafe_hydration_today', currentHydrationMl.toString());
  }, [currentHydrationMl]);

  // Handle reminder countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isReminderActive && reminderCountdown > 0) {
      interval = setInterval(() => {
        setReminderCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isReminderActive && reminderCountdown === 0) {
      // Trigger chime / alert
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('HeatSafe Hydration Reminder', {
          body: `Time to drink water! Heat risk in ${weather.city} is currently ${weather.riskLevel}.`,
          icon: '💧',
        });
      }
      // Reset timer
      setReminderCountdown(reminderMinutes * 60);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReminderActive, reminderCountdown, reminderMinutes, weather.city, weather.riskLevel]);

  const toggleReminder = async () => {
    if (!isReminderActive) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      setReminderCountdown(reminderMinutes * 60);
      setIsReminderActive(true);
    } else {
      setIsReminderActive(false);
    }
  };

  const addHydration = (amount: number) => {
    const newTotal = currentHydrationMl + amount;
    setCurrentHydrationMl(newTotal);
    setLastLoggedAmount(amount);
    setTimeout(() => setLastLoggedAmount(null), 1500);

    // Confetti if goal reached
    if (newTotal >= hydrationGoalMl && currentHydrationMl < hydrationGoalMl) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const resetHydration = () => {
    setCurrentHydrationMl(0);
  };

  const formatTemp = (celsius: number) => {
    if (unit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const riskInfo = getHeatRiskLevel(weather.apparentTemperature);
  const hydrationPercent = Math.min(100, Math.round((currentHydrationMl / hydrationGoalMl) * 100));

  // Format countdown string
  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. HERO WEATHER & HEAT RISK SECTION */}
      <div className="bg-white/5 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Temperature & Conditions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-white/40">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span>{weather.city}, {weather.country} • Current Heat Conditions</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-4">
              <div className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                {formatTemp(weather.temperature)}
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-white/70">
                  Feels like (Heat Index):{' '}
                  <span className="font-extrabold text-orange-400 text-base">
                    {formatTemp(weather.apparentTemperature)}
                  </span>
                </div>
                <div className="text-xs text-white/40 font-medium">
                  High: {formatTemp(weather.highTemp)} • Low: {formatTemp(weather.lowTemp)} • {weather.weatherDescription}
                </div>
              </div>
            </div>

            {/* Heat Risk Level Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                weather.riskLevel === 'Extreme' || weather.riskLevel === 'Very High'
                  ? 'bg-red-500/15 border-red-500/30 text-red-300'
                  : weather.riskLevel === 'High'
                  ? 'bg-orange-500/15 border-orange-500/30 text-orange-300'
                  : weather.riskLevel === 'Moderate'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div className="p-2 rounded-xl bg-white/10 shadow-xs shrink-0">
                {weather.riskLevel === 'Extreme' || weather.riskLevel === 'Very High' ? (
                  <AlertOctagon className="w-6 h-6 text-red-400 animate-pulse" />
                ) : (
                  <Flame className="w-6 h-6 text-orange-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono font-extrabold tracking-wider">Heat-Risk Level:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white/15 border border-white/20 text-white">
                    {weather.riskLevel}
                  </span>
                </div>
                <p className="text-xs sm:text-sm mt-1 font-medium leading-relaxed opacity-90">
                  {weather.riskDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-white/50 font-semibold">
                <Sun className="w-4 h-4 text-orange-400" />
                <span>UV Radiation</span>
              </div>
              <div className="text-lg font-extrabold text-white">
                {weather.uvIndex} <span className="text-xs font-medium text-white/40">/ 12</span>
              </div>
              <div className="text-[11px] font-semibold text-orange-400">
                {weather.todaySafety.uv} Risk
              </div>
            </div>

            <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-white/50 font-semibold">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span>Relative Humidity</span>
              </div>
              <div className="text-lg font-extrabold text-white">
                {weather.humidity}%
              </div>
              <div className="text-[11px] font-semibold text-white/40">
                Dew Pt: {formatTemp(weather.dewPoint)}
              </div>
            </div>

            <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-white/50 font-semibold">
                <Wind className="w-4 h-4 text-teal-400" />
                <span>Wind Speed</span>
              </div>
              <div className="text-lg font-extrabold text-white">
                {weather.windSpeed} <span className="text-xs font-medium text-white/40">km/h</span>
              </div>
              <div className="text-[11px] font-semibold text-white/40">
                {weather.windSpeed > 15 ? 'Breezy Cooling' : 'Light Air'}
              </div>
            </div>

            <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-white/50 font-semibold">
                <Gauge className="w-4 h-4 text-rose-400" />
                <span>Wet Bulb (WBGT)</span>
              </div>
              <div className="text-lg font-extrabold text-white">
                {formatTemp(weather.wbgtEstimate)}
              </div>
              <div className="text-[11px] font-semibold text-white/40">
                Thermal Stress Metric
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REQUESTED MANDATORY DISPLAY FORMAT: "Today's Safety" */}
      <div className="bg-white/5 rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl" id="todays-safety-card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Today's Safety</h2>
              <p className="text-xs text-white/40 font-medium">Daily Heat Guidelines &amp; Direct Actions</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('safety_recommendations')}
            className="text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
          >
            <span>Full Safety Guide</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* The 4 requested safety rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Hydration */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-sky-500/40 transition-colors">
            <div className="w-11 h-11 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-xl shrink-0">
              💧
            </div>
            <div>
              <div className="text-xs uppercase font-mono font-bold tracking-wider text-sky-400">Hydration</div>
              <div className="text-base font-bold text-white mt-0.5">
                {weather.todaySafety.hydration}
              </div>
              <div className="text-[11px] text-white/40 font-medium">Drink water before feeling thirsty</div>
            </div>
          </div>

          {/* UV */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-orange-500/40 transition-colors">
            <div className="w-11 h-11 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-xl shrink-0">
              ☀️
            </div>
            <div>
              <div className="text-xs uppercase font-mono font-bold tracking-wider text-orange-400">UV Index</div>
              <div className="text-base font-bold text-white mt-0.5">
                {weather.todaySafety.uv} ({weather.uvIndex})
              </div>
              <div className="text-[11px] text-white/40 font-medium">High solar burn potential in 15-20 min</div>
            </div>
          </div>

          {/* Outdoor activity */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-red-500/40 transition-colors">
            <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-xl shrink-0">
              🏃
            </div>
            <div>
              <div className="text-xs uppercase font-mono font-bold tracking-wider text-red-400">Outdoor activity</div>
              <div className="text-base font-bold text-white mt-0.5">
                {weather.todaySafety.outdoorActivity}
              </div>
              <div className="text-[11px] text-white/40 font-medium">Schedule workouts in cooler hours</div>
            </div>
          </div>

          {/* Protection */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-yellow-500/40 transition-colors">
            <div className="w-11 h-11 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center text-xl shrink-0">
              🧢
            </div>
            <div>
              <div className="text-xs uppercase font-mono font-bold tracking-wider text-yellow-400">Protection</div>
              <div className="text-base font-bold text-white mt-0.5">
                {weather.todaySafety.protection}
              </div>
              <div className="text-[11px] text-white/40 font-medium">Broad-brim hat, SPF 50 &amp; sunglasses</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE HYDRATION TRACKER & SMART REMINDER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hydration Logger */}
        <div className="lg:col-span-7 bg-white/5 rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Hydration Tracker</h3>
                <p className="text-xs text-white/40 font-medium">
                  Target adjusted for {weather.riskLevel} heat risk ({hydrationGoalMl} ml)
                </p>
              </div>
            </div>
            <button
              onClick={resetHydration}
              title="Reset today's water count"
              className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar & Counter */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-sky-400">
                  {currentHydrationMl}
                </span>
                <span className="text-sm font-semibold text-white/40">
                  / {hydrationGoalMl} ml ({hydrationPercent}%)
                </span>
              </div>
              {lastLoggedAmount && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full animate-bounce">
                  +{lastLoggedAmount} ml logged!
                </span>
              )}
            </div>

            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${hydrationPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Add Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              id="drink-glass-btn"
              onClick={() => addHydration(250)}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-white flex flex-col items-center gap-1 font-semibold text-xs transition-all active:scale-95"
            >
              <span className="text-lg">🥛</span>
              <span>+250 ml Glass</span>
            </button>

            <button
              id="drink-bottle-btn"
              onClick={() => addHydration(500)}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-white flex flex-col items-center gap-1 font-semibold text-xs transition-all active:scale-95"
            >
              <span className="text-lg">🍶</span>
              <span>+500 ml Bottle</span>
            </button>

            <button
              id="drink-large-btn"
              onClick={() => addHydration(750)}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-white flex flex-col items-center gap-1 font-semibold text-xs transition-all active:scale-95"
            >
              <span className="text-lg">🫗</span>
              <span>+750 ml Electrolyte</span>
            </button>
          </div>

          {/* Urine Hydration Color Check */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
            <span className="font-semibold">Hydration Check:</span>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-full bg-yellow-200" title="Pale Lemon: Well Hydrated"></span>
              <span>Pale Lemon = Ideal</span>
              <span className="text-white/20">|</span>
              <span className="w-3 h-3 rounded-full bg-amber-500" title="Amber: Drink Immediately"></span>
              <span>Dark Amber = Dehydrated</span>
            </div>
          </div>
        </div>

        {/* Smart Water Reminder & AI Tip */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#141416] text-white rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-5 relative overflow-hidden">
          {!isProUnlocked ? (
            /* LOCKED WATER REMINDER STATE */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base">Water Reminder</h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        PRO
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40">Automated hydration alerts</p>
                  </div>
                </div>

                {/* Clickable Lock Symbol Button */}
                <button
                  id="unlock-water-reminder-lock-btn"
                  onClick={() => {
                    if (onUnlockClick) {
                      onUnlockClick('water_reminder');
                    } else {
                      setActiveTab('pro_unlock');
                    }
                  }}
                  className="p-2.5 rounded-2xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-orange-400 hover:text-orange-300 hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(249,115,22,0.25)] flex items-center gap-1.5"
                  title="Click to unlock HeatSafe Pro"
                >
                  <Lock className="w-4 h-4" />
                  <span className="text-xs font-bold">Unlock</span>
                </button>
              </div>

              {/* Clickable Lock Body Banner */}
              <div
                onClick={() => {
                  if (onUnlockClick) {
                    onUnlockClick('water_reminder');
                  } else {
                    setActiveTab('pro_unlock');
                  }
                }}
                className="cursor-pointer group p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-orange-500/20 hover:border-orange-500/40 transition-all text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-black transition-all shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                    Water Reminder is Locked
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed max-w-xs mx-auto">
                    Timed interval chimes and smart heat alerts are protected. Click this lock symbol to enter the HeatSafe Pro password.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                  <KeyRound className="w-3 h-3" />
                  <span>Unlock with Pro Password</span>
                </div>
              </div>
            </div>
          ) : (
            /* UNLOCKED WATER REMINDER STATE */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base">Water Reminder</h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40">Timed alerts for hot weather</p>
                  </div>
                </div>

                <button
                  id="toggle-water-reminder"
                  onClick={toggleReminder}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isReminderActive
                      ? 'bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                      : 'bg-white/10 hover:bg-white/15 text-white'
                  }`}
                >
                  {isReminderActive ? <BellRing className="w-3.5 h-3.5 animate-bounce" /> : <Bell className="w-3.5 h-3.5" />}
                  <span>{isReminderActive ? 'Active' : 'Enable'}</span>
                </button>
              </div>

              {isReminderActive && (
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/60">Next drink in:</span>
                  <span className="font-mono text-base font-bold text-orange-400">
                    {formatCountdown(reminderCountdown)}
                  </span>
                </div>
              )}

              {/* Reminder Interval Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/40">Interval Frequency:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        setReminderMinutes(mins);
                        setReminderCountdown(mins * 60);
                      }}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                        reminderMinutes === mins
                          ? 'bg-orange-500 text-black shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                          : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Call to action for HeatSafe AI */}
          <div className="pt-3 border-t border-white/10">
            <button
              id="today-heatsafe-ai-cta"
              onClick={() => {
                if (!isProUnlocked) {
                  if (onUnlockClick) {
                    onUnlockClick('heatsafe_ai');
                  } else {
                    setActiveTab('pro_unlock');
                  }
                } else {
                  setActiveTab('heatsafe_ai');
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(249,115,22,0.25)]"
            >
              {!isProUnlocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>HeatSafe AI (🔒 Pro Feature)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Ask HeatSafe AI for Custom Advice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. HOURLY OUTDOOR ACTIVITY SAFETY TIMELINE */}
      <div className="bg-white/5 rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Safer Times for Outdoor Activity</h3>
              <p className="text-xs text-white/40 font-medium">
                Hourly Heat Stress &amp; UV Analysis for Exercise, Sports &amp; Work
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-white/60">Safe</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-white/60">Caution</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-white/60">Danger Window</span>
            </span>
          </div>
        </div>

        {/* Scrollable Hourly Row */}
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <div className="flex gap-2.5 min-w-[680px]">
            {weather.hourly.slice(0, 12).map((item, idx) => {
              const isPeakDanger = item.riskLevel === 'Very High' || item.riskLevel === 'Extreme';
              const isCaution = item.riskLevel === 'High' || item.riskLevel === 'Moderate';

              return (
                <div
                  key={idx}
                  className={`flex-1 min-w-[95px] p-3 rounded-2xl border text-center flex flex-col justify-between transition-all ${
                    isPeakDanger
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : isCaution
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  <div className="text-xs font-mono font-bold text-white/80">{item.time}</div>
                  
                  <div className="my-2 space-y-0.5">
                    <div className="text-lg font-black text-white">{formatTemp(item.temp)}</div>
                    <div className="text-[10px] text-white/40 font-semibold">
                      Feels {formatTemp(item.apparentTemp)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-white/60">UV: {item.uvIndex}</div>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] font-extrabold ${
                        isPeakDanger
                          ? 'bg-red-500 text-white'
                          : isCaution
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isPeakDanger ? 'Avoid' : isCaution ? 'Caution' : 'Safe'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety Recommendation summary banner */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-start gap-3 text-xs text-white/70 font-medium">
          <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Outdoor Schedule Recommendation:</span> Best hours for running, cycling, or outdoor physical chores are early morning before 9:00 AM or late afternoon after 6:00 PM. High solar radiation and thermal heat accumulation peak between 11:00 AM and 4:00 PM.
          </div>
        </div>
      </div>
    </div>
  );
};
