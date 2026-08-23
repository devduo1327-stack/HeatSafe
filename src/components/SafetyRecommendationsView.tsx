import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  Flame,
  CheckCircle,
  HelpCircle,
  Sparkles,
  PhoneCall,
  UserCheck,
  HardHat,
  PawPrint,
  Car,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { WeatherData, ActiveTab } from '../types';

interface SafetyRecommendationsViewProps {
  weather: WeatherData;
  unit: 'C' | 'F';
  setActiveTab: (tab: ActiveTab) => void;
}

export const SafetyRecommendationsView: React.FC<SafetyRecommendationsViewProps> = ({
  weather,
  unit,
  setActiveTab,
}) => {
  // Vulnerability Calculator State
  const [selectedAge, setSelectedAge] = useState<'child' | 'adult' | 'senior'>('adult');
  const [selectedWork, setSelectedWork] = useState<'indoor' | 'outdoor' | 'athlete'>('outdoor');
  const [hasHeartCondition, setHasHeartCondition] = useState(false);
  const [hasRespiratory, setHasRespiratory] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);

  // Active FAQ / Accordion item
  const [expandedSection, setExpandedSection] = useState<string | null>('triage');

  // Compute calculated risk score
  let vulnerabilityScore = 30;
  if (selectedAge === 'senior' || selectedAge === 'child') vulnerabilityScore += 25;
  if (selectedWork === 'outdoor') vulnerabilityScore += 25;
  if (selectedWork === 'athlete') vulnerabilityScore += 20;
  if (hasHeartCondition) vulnerabilityScore += 20;
  if (hasRespiratory) vulnerabilityScore += 15;
  if (isPregnant) vulnerabilityScore += 20;
  if (weather.riskLevel === 'Extreme' || weather.riskLevel === 'Very High') vulnerabilityScore += 25;
  else if (weather.riskLevel === 'High') vulnerabilityScore += 15;

  vulnerabilityScore = Math.min(100, vulnerabilityScore);

  const getVulnerabilityLabel = (score: number) => {
    if (score >= 75) return { label: 'Severe Vulnerability', color: 'text-red-400 bg-red-500/15 border-red-500/30' };
    if (score >= 50) return { label: 'Elevated Risk', color: 'text-orange-400 bg-orange-500/15 border-orange-500/30' };
    return { label: 'Standard Risk', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
  };

  const currentRiskBadge = getVulnerabilityLabel(vulnerabilityScore);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white/5 rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Heat Safety Recommendations</h2>
            <p className="text-xs text-white/40 font-medium">
              Medical protocols, symptom triage, personalized risk evaluation, and preventive protection
            </p>
          </div>
        </div>
      </div>

      {/* 1. HEAT ILLNESS TRIAGE: Heat Cramps vs Heat Exhaustion vs Heat Stroke */}
      <div className="bg-white/5 rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-5" id="symptoms-triage">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Heat Illness Symptom Checker &amp; First Aid</h3>
              <p className="text-xs text-white/40 font-medium">Know when to rest and when to call emergency services</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Heat Cramps */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-amber-500/30 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono font-bold text-amber-400 tracking-wider">Mild Stage</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Rest &amp; Fluids</span>
              </div>
              <h4 className="font-bold text-base text-white">Heat Cramps</h4>
              <ul className="text-xs text-white/70 space-y-1.5 list-disc list-inside">
                <li>Painful muscle spasms (legs, abdomen)</li>
                <li>Heavy sweating during intense work</li>
                <li>Flushed, warm skin</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-white/10 text-xs font-medium text-amber-300">
              <span className="font-bold text-white">Action:</span> Stop all activity, sit in cool shade, drink water or oral electrolyte solution, massage muscles gently.
            </div>
          </div>

          {/* Heat Exhaustion */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-orange-500/30 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono font-bold text-orange-400 tracking-wider">Moderate Stage</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">Urgent Care</span>
              </div>
              <h4 className="font-bold text-base text-white">Heat Exhaustion</h4>
              <ul className="text-xs text-white/70 space-y-1.5 list-disc list-inside">
                <li>Heavy sweating &amp; cold, pale, clammy skin</li>
                <li>Fast, weak pulse &amp; dizziness</li>
                <li>Nausea, vomiting, or muscle cramps</li>
                <li>Headache, weakness &amp; faintness</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-white/10 text-xs font-medium text-orange-300">
              <span className="font-bold text-white">Action:</span> Move to AC room, loosen clothing, apply wet cool cloths to neck &amp; forehead, sip cool water. Seek medical care if vomiting persists &gt;1 hr.
            </div>
          </div>

          {/* Heat Stroke */}
          <div className="p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/40 flex flex-col justify-between space-y-4 shadow-2xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono font-extrabold text-red-400 tracking-wider">🚨 Critical Emergency</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">Call 911 / 112</span>
              </div>
              <h4 className="font-bold text-base text-white">Heat Stroke</h4>
              <ul className="text-xs text-red-200 font-medium space-y-1.5 list-disc list-inside">
                <li>Body temperature &gt; 103°F / 39.4°C</li>
                <li>Hot, red, dry skin OR profuse sweating</li>
                <li>Confusion, slurred speech, delirium</li>
                <li>Rapid, strong pulse &amp; fainting/loss of consciousness</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-red-500/30 text-xs text-red-200 space-y-3">
              <div>
                <span className="font-bold text-white">Immediate Action:</span> Call emergency dispatch immediately! Move person to shade, immerse in cold water bath or douse with ice packs in armpits, neck, groin. Do NOT give fluids if unconscious!
              </div>
              <button
                onClick={() => setActiveTab('emergency_contacts')}
                className="w-full py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>View Emergency Numbers</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PERSONAL VULNERABILITY CALCULATOR */}
      <div className="bg-white/5 rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Personalized Risk Profile Calculator</h3>
              <p className="text-xs text-white/40 font-medium">Calculate your specific vulnerability based on age, occupation &amp; health</p>
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto ${currentRiskBadge.color}`}>
            <span>Risk Index: {vulnerabilityScore}/100</span>
            <span>({currentRiskBadge.label})</span>
          </div>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Age Group */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Age Group</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['child', 'adult', 'senior'] as const).map((age) => (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    selectedAge === age
                      ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                  }`}
                >
                  {age === 'child' ? 'Child (0-12)' : age === 'senior' ? 'Senior (65+)' : 'Adult (18-64)'}
                </button>
              ))}
            </div>
          </div>

          {/* Activity / Occupation */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Activity / Work</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['indoor', 'outdoor', 'athlete'] as const).map((work) => (
                <button
                  key={work}
                  onClick={() => setSelectedWork(work)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    selectedWork === work
                      ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                  }`}
                >
                  {work === 'indoor' ? 'Indoor AC' : work === 'outdoor' ? 'Outdoor Labor' : 'Sports/Athlete'}
                </button>
              ))}
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Special Conditions</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setHasHeartCondition(!hasHeartCondition)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  hasHeartCondition
                    ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                }`}
              >
                Heart / Blood Pressure
              </button>
              <button
                onClick={() => setHasRespiratory(!hasRespiratory)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  hasRespiratory
                    ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                }`}
              >
                Asthma / Respiratory
              </button>
              <button
                onClick={() => setIsPregnant(!isPregnant)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isPregnant
                    ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                }`}
              >
                Pregnancy
              </button>
            </div>
          </div>
        </div>

        {/* Calculated Recommendations Box */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-xs text-orange-400">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Tailored Safety Measures for This Profile:</span>
          </div>
          <ul className="text-xs text-white/70 font-medium space-y-1 list-disc list-inside">
            {selectedAge === 'senior' && (
              <li>Thermoregulatory efficiency is reduced. Keep indoor ambient temp &lt; 26°C (78°F) and do not rely solely on electric fans during extreme heat.</li>
            )}
            {selectedAge === 'child' && (
              <li>Children produce more heat per body weight and sweat less. Never leave in vehicles; enforce mandatory 15-min drink breaks every 30 mins of play.</li>
            )}
            {selectedWork === 'outdoor' && (
              <li>Work-to-rest ratio: 45 min work / 15 min rest in shaded cool recovery area. Consume 1 quart (950ml) of cool fluids per hour.</li>
            )}
            {hasHeartCondition && (
              <li>Avoid beta-blocker dehydration risks. Consult your physician regarding fluid limits and avoid sudden thermal shock.</li>
            )}
            <li>Recommended daily fluid target: {selectedWork === 'outdoor' ? '3,500 ml' : '2,500 ml'} with sodium &amp; potassium electrolytes.</li>
          </ul>
        </div>
      </div>

      {/* 3. GEAR, PETS & VEHICLE SAFETY GUIDELINES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Protection & Clothing Guide */}
        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <HardHat className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white">Protective Gear &amp; Attire</h4>
          </div>
          <ul className="text-xs text-white/70 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><b className="text-white">UPF 50+ Clothing:</b> Loose-fitting, lightweight, long-sleeve moisture-wicking fabrics reflect solar heat.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><b className="text-white">Wide-Brimmed Hat (3+ inches):</b> Shields face, ears, and back of neck far better than standard baseball caps.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><b className="text-white">Sunscreen:</b> Apply SPF 50 broad spectrum 20 minutes before stepping out and reapply every 90 minutes.</span>
            </li>
          </ul>
        </div>

        {/* Pets & Hot Car Alert */}
        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <PawPrint className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white">Pets &amp; Vehicle Hotspot Warnings</h4>
          </div>
          <ul className="text-xs text-white/70 space-y-2">
            <li className="flex items-start gap-2">
              <Car className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span><b className="text-white">Parked Cars Are Dangerous:</b> In 32°C (90°F) weather, car interior temperatures reach 43°C (109°F) in 10 minutes and 51°C (124°F) in 30 minutes! Never leave anyone inside.</span>
            </li>
            <li className="flex items-start gap-2">
              <PawPrint className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><b className="text-white">The 7-Second Asphalt Rule:</b> Place the back of your hand on the pavement for 7 seconds. If it's too hot for your hand, it will burn your pet's paws.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
