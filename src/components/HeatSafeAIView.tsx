import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Droplets,
  HeartPulse,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { WeatherData, AIChatMessage } from '../types';

// Helper function to strip markdown symbols like ***, **, ##, ###, #, etc.
export function cleanAIText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    // Remove markdown heading symbols (e.g. "### Title", "## Title", "# Title")
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\s+#{1,6}\s+/g, ' ')
    // Replace bullet asterisks or dashes with clean bullet symbol
    .replace(/^\s*\*\s+/gm, '• ')
    .replace(/^\s*-\s+/gm, '• ')
    // Remove triple asterisks, double asterisks, and single asterisks (bold/italic)
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    // Remove stray hashtags anywhere in text
    .replace(/#/g, '')
    // Remove markdown formatting like backticks
    .replace(/`/g, '')
    // Clean up repetitive blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface HeatSafeAIViewProps {
  weather: WeatherData;
  unit: 'C' | 'F';
  isProUnlocked?: boolean;
  onUnlockClick?: () => void;
}

export const HeatSafeAIView: React.FC<HeatSafeAIViewProps> = ({
  weather,
  unit,
  isProUnlocked = false,
  onUnlockClick,
}) => {
  if (!isProUnlocked) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(249,115,22,0.25)]">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-mono font-bold uppercase tracking-wider">
            <span>HeatSafe Pro Required</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">HeatSafe AI is Locked</h2>
          <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
            Personalized clinical thermal recommendations and conversational heat health consultations are available in HeatSafe Pro.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={onUnlockClick}
            className="py-3.5 px-8 rounded-2xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm inline-flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            <Lock className="w-4 h-4" />
            <span>Click to Unlock HeatSafe Pro</span>
          </button>
        </div>
      </div>
    );
  }
  const createWelcomeMessage = (): AIChatMessage => ({
    id: 'welcome',
    sender: 'assistant',
    text: `Hello! I am HeatSafe AI, your clinical thermal safety assistant.

Currently in ${weather.city}, it is ${weather.temperature}°C (Feels like ${weather.apparentTemperature}°C) with ${weather.riskLevel} heat risk and a UV Index of ${weather.uvIndex}.

Ask me anything about heat symptoms, hydration requirements, outdoor sports safety, or tell me your schedule for a personalized plan!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages, setMessages] = useState<AIChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('heatsafe_ai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading chat history:', e);
    }
    return [createWelcomeMessage()];
  });

  const [chatClearedToast, setChatClearedToast] = useState(false);

  // Sync chat to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('heatsafe_ai_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error('Error saving chat history:', e);
    }
  }, [messages]);

  const handleClearChat = () => {
    try {
      localStorage.removeItem('heatsafe_ai_chat_history');
    } catch (e) {
      console.error(e);
    }
    setMessages([createWelcomeMessage()]);
    setChatClearedToast(true);
    setTimeout(() => setChatClearedToast(false), 2500);
  };

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [personalizedPlan, setPersonalizedPlan] = useState<any | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Form for personalized AI plan
  const [userAgeGroup, setUserAgeGroup] = useState('Adult (18-64)');
  const [userActivity, setUserActivity] = useState('Moderate outdoor labor / Walking');
  const [userConditions, setUserConditions] = useState('None');
  const [userOutdoorTime, setUserOutdoorTime] = useState('12:00 PM - 3:00 PM');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          weatherContext: {
            city: weather.city,
            temperature: weather.temperature,
            apparentTemperature: weather.apparentTemperature,
            humidity: weather.humidity,
            uvIndex: weather.uvIndex,
            riskLevel: weather.riskLevel,
          },
          userProfile: {
            ageGroup: userAgeGroup,
            activity: userActivity,
            conditions: userConditions.split(',').map((c) => c.trim()),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('AI service error');
      }

      const data = await response.json();
      const isEmergency =
        textToSend.toLowerCase().includes('faint') ||
        textToSend.toLowerCase().includes('unconscious') ||
        textToSend.toLowerCase().includes('vomit') ||
        textToSend.toLowerCase().includes('confusion');

      const assistantMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.text || 'Please ensure you seek shaded shelter and stay hydrated with cool water.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergencyAlert: isEmergency,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI chat failed', err);
      const q = textToSend.toLowerCase();
      let fallbackText = '';

      if (q.includes('run') || q.includes('exercise') || q.includes('gym') || q.includes('workout') || q.includes('sport')) {
        fallbackText = `Exercising outdoors in ${weather.city} right now is hazardous due to the ${weather.apparentTemperature}°C heat index.

Recommended Action:
- Delay outdoor workouts until after 7:30 PM or before 6:30 AM when solar radiation drops.
- If exercising indoors, ensure active air conditioning and pre-hydrate with 500ml water plus electrolytes.
- Reduce target heart rate threshold by 15-20% to account for ambient cardiovascular strain.`;
      } else if (q.includes('nausea') || q.includes('dizzy') || q.includes('lighthead') || q.includes('faint') || q.includes('vomit') || q.includes('cramp')) {
        fallbackText = `You are exhibiting warning signs of heat exhaustion caused by core body thermal elevation and fluid-electrolyte depletion.

Immediate Steps:
1. Move immediately into an air-conditioned room or dense shade.
2. Lie down flat with your legs elevated 20-30 cm to restore cerebral blood flow.
3. Apply cold, damp towels or ice packs to your neck, armpits, and groin.
4. Sip cool water or an electrolyte solution slowly.
5. If symptoms worsen or vomiting occurs, contact emergency medical services immediately.`;
      } else if (q.includes('water') || q.includes('drink') || q.includes('hydrat') || q.includes('fluid')) {
        fallbackText = `In ${weather.city}'s current conditions (${weather.temperature}°C / Feels like ${weather.apparentTemperature}°C, ${weather.humidity}% humidity), your target fluid intake is 750ml to 1,000ml per hour of heat exposure.

Key Hydration Directives:
- Consume 200-250ml every 15-20 minutes in steady increments.
- Add electrolytes (sodium and potassium) if sweating for over 45 minutes to prevent hyponatremic cramps.
- Avoid caffeine and alcohol as they increase renal fluid loss.`;
      } else {
        fallbackText = `Current thermal conditions in ${weather.city} (${weather.temperature}°C, Feels like ${weather.apparentTemperature}°C, UV ${weather.uvIndex}) present significant heat strain.

Direct Protection Guidelines:
- Minimize unshaded outdoor exposure between 11:00 AM and 4:30 PM.
- Wear loose-fitting, light-colored clothing and broad-spectrum SPF 50+ sunscreen.
- Maintain consistent fluid intake with regular cooling breaks in air conditioning.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate structured personalized plan via Gemini
  const generatePersonalizedAssessment = async () => {
    setIsGeneratingPlan(true);
    try {
      const response = await fetch('/api/gemini/personalized-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weather: {
            city: weather.city,
            temperature: weather.temperature,
            apparentTemperature: weather.apparentTemperature,
            humidity: weather.humidity,
            uvIndex: weather.uvIndex,
          },
          profile: {
            ageGroup: userAgeGroup,
            activity: userActivity,
            conditions: userConditions.split(',').map((c) => c.trim()),
            outdoorHours: userOutdoorTime,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to generate plan');
      const data = await response.json();
      setPersonalizedPlan(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const quickPrompts = [
    `Describe the temperature & heat issues in ${weather.city} right now`,
    'I feel lightheaded & nauseous after 30 min outside—what should I do?',
    'What is the safest hour for running or gym today?',
    'How much water and electrolyte powder should I take?',
    'What are the signs that heat exhaustion has become heat stroke?',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP AI ADVISOR OVERVIEW BANNER */}
      <div className="bg-white/5 text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider border border-orange-500/20">
              <Bot className="w-3.5 h-3.5" />
              <span>AI Heat Safety Specialist</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              HeatSafe AI Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-white/60 font-medium leading-relaxed">
              Powered by advanced thermal physiology models to analyze local weather in {weather.city}, assess personal vulnerabilities, and provide real-time clinical safety protocols.
            </p>
          </div>

          <button
            onClick={() => handleSendMessage(`Provide a comprehensive analysis of the temperature (${weather.temperature}°C, Feels like ${weather.apparentTemperature}°C) and biological heat issues in ${weather.city} right now.`)}
            disabled={isLoading}
            className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Current Heat Issues</span>
          </button>
        </div>
      </div>

      {/* 2. PERSONALIZED AI RISK ASSESSMENT GENERATOR */}
      <div className="bg-white/5 rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Personalized AI Safety Plan Generator</h3>
            <p className="text-xs text-white/40 font-medium">
              Generate a custom hydration schedule, safe windows &amp; precautions for your day
            </p>
          </div>
        </div>

        {/* Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">Age Bracket</label>
            <select
              value={userAgeGroup}
              onChange={(e) => setUserAgeGroup(e.target.value)}
              className="w-full text-xs font-medium bg-white/5 border border-white/10 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            >
              <option className="bg-[#141416] text-white">Child (0-12 yrs)</option>
              <option className="bg-[#141416] text-white">Teen (13-17 yrs)</option>
              <option className="bg-[#141416] text-white">Adult (18-64)</option>
              <option className="bg-[#141416] text-white">Senior (65+ yrs)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">Activity Level</label>
            <select
              value={userActivity}
              onChange={(e) => setUserActivity(e.target.value)}
              className="w-full text-xs font-medium bg-white/5 border border-white/10 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            >
              <option className="bg-[#141416] text-white">Indoor AC (Office / Home)</option>
              <option className="bg-[#141416] text-white">Moderate outdoor labor / Walking</option>
              <option className="bg-[#141416] text-white">Heavy Construction / Roofer / Farm</option>
              <option className="bg-[#141416] text-white">Athletic Training / Marathon / Sports</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">Planned Outdoor Hours</label>
            <select
              value={userOutdoorTime}
              onChange={(e) => setUserOutdoorTime(e.target.value)}
              className="w-full text-xs font-medium bg-white/5 border border-white/10 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            >
              <option className="bg-[#141416] text-white">Early Morning (6 AM - 9 AM)</option>
              <option className="bg-[#141416] text-white">Midday Peak (11 AM - 3 PM)</option>
              <option className="bg-[#141416] text-white">Late Afternoon (3 PM - 6 PM)</option>
              <option className="bg-[#141416] text-white">Evening / Night (After 6 PM)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">Health Conditions</label>
            <input
              type="text"
              placeholder="e.g. Hypertension, Asthma, None"
              value={userConditions}
              onChange={(e) => setUserConditions(e.target.value)}
              className="w-full text-xs font-medium bg-white/5 border border-white/10 text-white placeholder:text-white/40 rounded-xl p-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>
        </div>

        <button
          onClick={generatePersonalizedAssessment}
          disabled={isGeneratingPlan}
          className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] active:scale-98"
        >
          {isGeneratingPlan ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Analyzing Atmospheric &amp; Biological Risk...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>Generate AI Personalized Safety Assessment</span>
            </>
          )}
        </button>

        {/* Structured Output Result Card */}
        {personalizedPlan && (
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold text-orange-400 tracking-wider">
                  AI Evaluation Result:
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  {personalizedPlan.personalRiskLevel} ({personalizedPlan.riskScore}/100)
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed">
              {cleanAIText(personalizedPlan.summary)}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                  <Droplets className="w-4 h-4" />
                  <span>Hydration &amp; Electrolytes</span>
                </div>
                <p className="text-xs text-white/70 font-medium">{cleanAIText(personalizedPlan.hydrationPlan)}</p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
                  <Clock className="w-4 h-4" />
                  <span>Optimal Safe Time Windows</span>
                </div>
                <p className="text-xs text-white/70 font-medium">{cleanAIText(personalizedPlan.safeWindows)}</p>
              </div>
            </div>

            {/* Key Precautions Checklist */}
            {personalizedPlan.keyPrecautions && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-white block">Personal Action Checklist:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {personalizedPlan.keyPrecautions.map((prec: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-white/80 bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{cleanAIText(prec)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. CONVERSATIONAL AI ADVISOR CHAT INTERFACE */}
      <div className="bg-white/5 rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Ask HeatSafe AI</h3>
              <p className="text-xs text-white/40 font-medium">Ask any question or describe symptoms</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {chatClearedToast && (
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 animate-in fade-in">
                History cleared
              </span>
            )}
            <button
              id="delete-chat-history-btn"
              onClick={handleClearChat}
              disabled={isLoading}
              title="Delete chat history"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-white/60 text-xs font-semibold border border-white/10 hover:border-red-500/30 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Delete History</span>
              <span className="sm:hidden">Clear</span>
            </button>
          </div>
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 text-white/70 font-medium border border-white/10 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Message Stream */}
        <div className="h-80 overflow-y-auto p-4 rounded-2xl bg-[#0d0d0f] border border-white/10 space-y-3.5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-black shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1.5 ${
                    isUser
                      ? 'bg-orange-500 text-black font-bold shadow-[0_0_12px_rgba(249,115,22,0.3)] rounded-tr-xs'
                      : msg.isEmergencyAlert
                      ? 'bg-red-500/15 border border-red-500/40 text-red-200 rounded-tl-xs'
                      : 'bg-white/5 border border-white/10 text-[#e2e2e3] rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line">{cleanAIText(msg.text)}</div>
                  <div
                    className={`text-[10px] text-right ${
                      isUser ? 'text-black/60 font-mono' : 'text-white/40 font-mono'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-black shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/60 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
                <span>HeatSafe AI is formulating clinical recommendations...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type your question (e.g. 'I have heat cramps', 'Is it safe to walk my dog right now?')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 px-4 py-3 text-xs sm:text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/40 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-5 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-black font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-1.5 shadow-[0_0_10px_rgba(249,115,22,0.4)] transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
