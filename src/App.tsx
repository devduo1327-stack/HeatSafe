/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { TodayView } from './components/TodayView';
import { WeatherMapView } from './components/WeatherMapView';
import { SafetyRecommendationsView } from './components/SafetyRecommendationsView';
import { EmergencyContactsView } from './components/EmergencyContactsView';
import { HeatSafeAIView } from './components/HeatSafeAIView';
import { SkyScanAIView } from './components/SkyScanAIView';
import { ProUnlockScreen } from './components/ProUnlockScreen';
import { SettingsModal } from './components/SettingsModal';
import { ActiveTab, WeatherData } from './types';
import { fetchWeatherData, PRESET_CITIES } from './utils/weather';
import { ThermometerSun, RefreshCw, AlertCircle, ShieldAlert, Settings } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // HeatSafe Pro unlock state (starts as false so app heading is HeatSafe Basic and features are locked)
  const [isProUnlocked, setIsProUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('heatsafe_pro_unlocked') === 'true';
  });
  const [unlockTarget, setUnlockTarget] = useState<'water_reminder' | 'heatsafe_ai' | 'skyscan_ai' | 'general'>('general');

  const handleUnlockPro = (password: string): boolean => {
    if (password.trim() === 'INGHTC-HS-4') {
      setIsProUnlocked(true);
      localStorage.setItem('heatsafe_pro_unlocked', 'true');
      return true;
    }
    return false;
  };

  const handleLockPro = () => {
    setIsProUnlocked(false);
    localStorage.removeItem('heatsafe_pro_unlocked');
  };

  const handleNavigateToUnlock = (target: 'water_reminder' | 'heatsafe_ai' | 'skyscan_ai' | 'general' = 'general') => {
    setUnlockTarget(target);
    setActiveTab('pro_unlock');
  };

  // Load weather for location
  const loadWeatherForCoords = async (
    lat: number,
    lon: number,
    cityName?: string,
    countryName?: string,
    countryCode?: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchWeatherData(lat, lon, cityName, countryName, countryCode);
      setWeather(data);
    } catch (err: any) {
      console.error('Failed to load weather', err);
      setErrorMessage('Unable to connect to live weather feed. Using standard heat-safety benchmark.');
      // Load fallback preset
      try {
        const fallback = PRESET_CITIES[0];
        const data = await fetchWeatherData(fallback.lat, fallback.lon, fallback.name, fallback.country, fallback.countryCode);
        setWeather(data);
      } catch (innerErr) {
        console.error(innerErr);
      }
    } finally {
      setIsLoading(false);
      setIsLocating(false);
    }
  };

  // Get current browser geolocation
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocode via free OSM Nominatim or BigDataCloud
          let detectedCity = 'My Location';
          let detectedCountry = 'Local Region';
          let detectedCountryCode = 'US';
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              const addr = geoData.address || {};
              detectedCity = addr.city || addr.town || addr.village || addr.county || 'My Location';
              detectedCountry = addr.country || 'Local';
              detectedCountryCode = (addr.country_code || 'US').toUpperCase();
            }
          } catch {
            // keep fallback
          }

          loadWeatherForCoords(latitude, longitude, detectedCity, detectedCountry, detectedCountryCode);
        },
        (error) => {
          console.warn('Geolocation denied or unavailable:', error);
          setIsLocating(false);
          // Default to Phoenix, AZ (classic high-heat region)
          const def = PRESET_CITIES[0];
          loadWeatherForCoords(def.lat, def.lon, def.name, def.country, def.countryCode);
        },
        { timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      const def = PRESET_CITIES[0];
      loadWeatherForCoords(def.lat, def.lon, def.name, def.country, def.countryCode);
    }
  };

  // Initial load on mount
  useEffect(() => {
    handleUseCurrentLocation();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-[#e2e2e3] selection:bg-orange-500 selection:text-black">
      {/* Header with requested navigation dropdown */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        weather={weather}
        unit={unit}
        setUnit={setUnit}
        onSelectCity={(lat, lon, name, country, code) => loadWeatherForCoords(lat, lon, name, country, code)}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLocating={isLocating}
        isProUnlocked={isProUnlocked}
        onNavigateToUnlock={handleNavigateToUnlock}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isLoading && !weather ? (
          <div className="min-h-[420px] flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center animate-spin border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-white/60">
              Measuring local heat conditions &amp; solar radiation...
            </div>
          </div>
        ) : weather ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'today' && (
                <TodayView
                  weather={weather}
                  unit={unit}
                  setActiveTab={setActiveTab}
                  isProUnlocked={isProUnlocked}
                  onUnlockClick={handleNavigateToUnlock}
                />
              )}
              {activeTab === 'weather_map' && (
                <WeatherMapView
                  weather={weather}
                  unit={unit}
                  onSelectCity={(lat, lon, name, country, code) =>
                    loadWeatherForCoords(lat, lon, name, country, code)
                  }
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'safety_recommendations' && (
                <SafetyRecommendationsView
                  weather={weather}
                  unit={unit}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'emergency_contacts' && (
                <EmergencyContactsView weather={weather} unit={unit} />
              )}
              {activeTab === 'heatsafe_ai' && (
                <HeatSafeAIView
                  weather={weather}
                  unit={unit}
                  isProUnlocked={isProUnlocked}
                  onUnlockClick={() => handleNavigateToUnlock('heatsafe_ai')}
                />
              )}
              {activeTab === 'skyscan_ai' && (
                <SkyScanAIView
                  weather={weather}
                  unit={unit}
                  isProUnlocked={isProUnlocked}
                  onUnlockClick={() => handleNavigateToUnlock('skyscan_ai')}
                />
              )}
              {activeTab === 'pro_unlock' && (
                <ProUnlockScreen
                  isProUnlocked={isProUnlocked}
                  onUnlock={handleUnlockPro}
                  onLock={handleLockPro}
                  setActiveTab={setActiveTab}
                  targetFeature={unlockTarget}
                />
              )}
            </motion.div>
          </AnimatePresence>
        ) : null}
      </main>

      {/* Footer & Medical Disclaimer in Sophisticated Dark Theme */}
      <footer className="mt-auto border-t border-white/10 bg-white/[0.02] py-5 px-4 sm:px-6 lg:px-8 text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.4)]">
              <span className="text-black font-black text-xs">H</span>
            </div>
            <span className="font-semibold text-white/80 tracking-tight">HeatSafe • Thermal Wellness Protocol</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-white/40 tracking-wider">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-orange-400 flex items-center gap-1 font-medium transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Plan &amp; Settings</span>
            </button>
            <span>•</span>
            <span>
              {weather?.countryCode === 'OM' || weather?.country?.toLowerCase().includes('oman')
                ? 'In Oman, call 9999 for dispatch'
                : 'For clinical emergencies, call local dispatch (911 / 112 / 999)'}
            </span>
          </div>
        </div>
      </footer>

      {/* Global Settings & Plan Management Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isProUnlocked={isProUnlocked}
        onUnlockPro={handleUnlockPro}
        onLockPro={handleLockPro}
        unit={unit}
        setUnit={setUnit}
        weather={weather}
      />
    </div>
  );
}
