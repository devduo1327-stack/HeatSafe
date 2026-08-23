import React, { useState, useEffect, useRef } from 'react';
import {
  ThermometerSun,
  MapPin,
  Search,
  ChevronDown,
  Navigation,
  Sun,
  Map as MapIcon,
  ShieldAlert,
  PhoneCall,
  Bot,
  Compass,
  AlertTriangle,
  Lock,
  Unlock,
  Scan,
  Settings,
} from 'lucide-react';
import { ActiveTab, WeatherData } from '../types';
import { PRESET_CITIES, searchLocations } from '../utils/weather';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  weather: WeatherData | null;
  unit: 'C' | 'F';
  setUnit: (u: 'C' | 'F') => void;
  onSelectCity: (lat: number, lon: number, cityName: string, countryName?: string, countryCode?: string) => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  isProUnlocked?: boolean;
  onNavigateToUnlock?: (target?: 'water_reminder' | 'heatsafe_ai' | 'skyscan_ai' | 'general') => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  weather,
  unit,
  setUnit,
  onSelectCity,
  onUseCurrentLocation,
  isLocating,
  isProUnlocked = false,
  onNavigateToUnlock,
  onOpenSettings,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle location search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleTabClick = (tabId: ActiveTab) => {
    if ((tabId === 'heatsafe_ai' || tabId === 'skyscan_ai') && !isProUnlocked) {
      if (onNavigateToUnlock) {
        onNavigateToUnlock(tabId);
      } else {
        setActiveTab('pro_unlock');
      }
      setIsDropdownOpen(false);
      return;
    }
    setActiveTab(tabId);
    setIsDropdownOpen(false);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string; isLocked?: boolean }[] = [
    { id: 'today', label: 'Today', icon: <Sun className="w-4 h-4 text-orange-400" /> },
    { id: 'weather_map', label: 'Weather Map', icon: <MapIcon className="w-4 h-4 text-sky-400" /> },
    { id: 'safety_recommendations', label: 'Safety Recommendations', icon: <ShieldAlert className="w-4 h-4 text-emerald-400" /> },
    { id: 'emergency_contacts', label: 'Emergency Contacts', icon: <PhoneCall className="w-4 h-4 text-rose-400" />, badge: 'Based on Location' },
    {
      id: 'heatsafe_ai',
      label: 'HeatSafe AI',
      icon: isProUnlocked ? <Bot className="w-4 h-4 text-orange-400" /> : <Lock className="w-4 h-4 text-orange-400" />,
      badge: isProUnlocked ? 'Advisor' : '🔒 Pro Lock',
      isLocked: !isProUnlocked,
    },
    {
      id: 'skyscan_ai',
      label: 'SkyScan AI',
      icon: isProUnlocked ? <Scan className="w-4 h-4 text-cyan-400" /> : <Lock className="w-4 h-4 text-cyan-400" />,
      badge: isProUnlocked ? 'Sky Vision' : '🔒 Pro Lock',
      isLocked: !isProUnlocked,
    },
  ];

  const currentTabItem =
    activeTab === 'pro_unlock'
      ? {
          id: 'pro_unlock' as ActiveTab,
          label: 'HeatSafe Pro Unlock',
          icon: <Lock className="w-4 h-4 text-orange-400" />,
        }
      : navItems.find((n) => n.id === activeTab) || navItems[0];

  const formatTemp = (celsius: number) => {
    if (unit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/10 text-[#e2e2e3]">
      {/* Top Banner if extreme risk */}
      {weather && (weather.riskLevel === 'Extreme' || weather.riskLevel === 'Very High') && (
        <div className="bg-red-500/15 border-b border-red-500/30 text-red-400 px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-center">
          <AlertTriangle className="w-4 h-4 animate-bounce text-red-400 shrink-0" />
          <span>
            Extreme Heat Alert in {weather.city}: Feels like {formatTemp(weather.apparentTemperature)}. Limit outdoor exposure!
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-3 sm:gap-4">
          {/* Logo & Heading: Starts with HeatSafe Basic */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('today')}
              className="flex items-center gap-3 text-left group focus:outline-hidden"
              id="brand-home-button"
            >
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:scale-105 transition-transform shrink-0">
                <span className="text-black font-black text-xl">H</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold tracking-tight text-white">
                    {isProUnlocked ? 'HeatSafe Pro' : 'HeatSafe Basic'}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full border ${
                      isProUnlocked
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    }`}
                  >
                    {isProUnlocked ? 'Pro Active' : 'Basic Edition'}
                  </span>
                </div>
                <p className="text-[11px] text-white/40 font-medium hidden sm:block">
                  Thermal Wellness &amp; Safety Protocol
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Dropdown (Requested: Drop-down headings) */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="navigation-dropdown-trigger"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#e2e2e3] font-medium text-sm transition-all"
            >
              <span className="flex items-center gap-2">
                {currentTabItem.icon}
                <span className="hidden md:inline">{currentTabItem.label}</span>
                <span className="md:hidden truncate max-w-[110px]">{currentTabItem.label}</span>
              </span>
              <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 bg-[#141416] rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
                  Select Section
                </div>
                {navItems.map((item, idx) => {
                  const isSelected = activeTab === item.id;
                  const num = `0${idx + 1}`;
                  return (
                    <button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-orange-500/10 text-orange-400 font-semibold border-l-2 border-orange-500'
                          : 'hover:bg-white/5 text-[#e2e2e3]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-white/20 text-xs font-mono">{num}</span>
                        <div className="p-1.5 rounded-lg bg-white/5">{item.icon}</div>
                        <div>
                          <div className="text-sm flex items-center gap-1.5">
                            <span>{item.label}</span>
                            {item.isLocked && (
                              <Lock className="w-3 h-3 text-orange-400" />
                            )}
                          </div>
                          {item.badge && (
                            <div className="text-[10px] text-white/40 font-normal">
                              {item.badge}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                      ) : item.isLocked ? (
                        <span className="text-[10px] font-mono text-orange-400 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                          PRO
                        </span>
                      ) : null}
                    </button>
                  );
                })}

                {/* Settings in Dropdown */}
                {onOpenSettings && (
                  <div className="pt-2 mt-2 border-t border-white/10 px-2">
                    <button
                      id="nav-item-settings"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-[#e2e2e3] flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                          <Settings className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">Settings</div>
                          <div className="text-[10px] text-white/40">
                            {isProUnlocked ? 'Manage HeatSafe Pro' : 'Plan & Preferences'}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isProUnlocked
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        }`}
                      >
                        {isProUnlocked ? 'PRO' : 'BASIC'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Desktop Tabs for rapid desktop navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/10">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === item.id
                    ? 'bg-white/10 text-white font-semibold border border-white/15 shadow-xs'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.isLocked && (
                  <span className="text-[9px] font-mono text-orange-400 ml-0.5">🔒</span>
                )}
              </button>
            ))}
          </nav>

          {/* Location & Controls matching Sophisticated Dark Spec */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Location Selector */}
            <div className="relative" ref={searchRef}>
              <button
                id="location-search-button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#e2e2e3] text-xs sm:text-sm font-medium transition-colors border border-white/10"
                title="Change Location"
              >
                <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0"></span>
                <span className="max-w-[80px] sm:max-w-[130px] truncate font-medium">
                  {weather ? `${weather.city}, ${weather.countryCode}` : 'Detecting...'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-white/40 hidden sm:block" />
              </button>

              {/* Location Search Dialog / Dropdown */}
              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#141416] rounded-2xl shadow-2xl border border-white/15 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-white text-sm">Select Location</span>
                    <button
                      onClick={onUseCurrentLocation}
                      disabled={isLocating}
                      className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/30"
                    >
                      <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
                    </button>
                  </div>

                  <div className="relative mb-3">
                    <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search city, e.g. Muscat, Phoenix, Dubai..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-white/10 focus:outline-hidden focus:border-orange-500 bg-white/5 text-white placeholder:text-white/30"
                      autoFocus
                    />
                  </div>

                  {/* Search Results */}
                  {isSearching && (
                    <div className="py-4 text-center text-xs text-white/40">Searching global cities...</div>
                  )}

                  {!isSearching && searchResults.length > 0 && (
                    <div className="max-h-48 overflow-y-auto mb-3 divide-y divide-white/5">
                      {searchResults.map((res, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onSelectCity(res.latitude, res.longitude, res.name, res.country, res.country_code);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left py-2.5 px-2 hover:bg-white/5 rounded-lg text-xs font-medium text-white/80 flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-white">{res.name}</span>
                            {res.admin1 && <span className="text-white/60">, {res.admin1}</span>}
                            <span className="text-white/40 block text-[11px]">{res.country}</span>
                          </div>
                          <Compass className="w-3.5 h-3.5 text-white/40" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Presets */}
                  <div>
                    <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest mb-2">
                      High-Heat Regions &amp; Hotspots
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_CITIES.slice(0, 6).map((city, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            onSelectCity(city.lat, city.lon, city.name, city.country, city.countryCode);
                            setIsSearchOpen(false);
                          }}
                          className="text-xs bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-500/30 text-white/80 px-2.5 py-1 rounded-lg font-medium border border-white/10 transition-colors"
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Unit Switcher */}
            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-bold">
              <button
                id="unit-switch-c"
                onClick={() => setUnit('C')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  unit === 'C' ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'text-white/60 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                id="unit-switch-f"
                onClick={() => setUnit('F')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  unit === 'F' ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'text-white/60 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>

            {/* Settings Trigger Button */}
            {onOpenSettings && (
              <button
                id="header-settings-button"
                onClick={onOpenSettings}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#e2e2e3] hover:text-white transition-all flex items-center gap-1.5 group"
                title="Settings & Plan Management"
              >
                <Settings className="w-4 h-4 text-white/60 group-hover:text-orange-400 group-hover:rotate-45 transition-all" />
                <span className="hidden sm:inline text-xs font-semibold">Settings</span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full border hidden md:inline ${
                    isProUnlocked
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                  }`}
                >
                  {isProUnlocked ? 'PRO' : 'BASIC'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

