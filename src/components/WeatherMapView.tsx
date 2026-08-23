import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  Layers,
  Thermometer,
  Sun,
  Shield,
  Navigation,
  Info,
  ExternalLink,
  Flame,
  Compass,
} from 'lucide-react';
import L from 'leaflet';
import { WeatherData, ActiveTab } from '../types';
import { PRESET_CITIES } from '../utils/weather';

interface WeatherMapViewProps {
  weather: WeatherData;
  unit: 'C' | 'F';
  onSelectCity: (lat: number, lon: number, cityName: string, countryName?: string, countryCode?: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const WeatherMapView: React.FC<WeatherMapViewProps> = ({
  weather,
  unit,
  onSelectCity,
  setActiveTab,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<'heat' | 'uv' | 'cooling'>('heat');
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lon: number; name?: string } | null>(null);

  const formatTemp = (celsius: number) => {
    if (unit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [weather.lat, weather.lon],
        zoom: 7,
        scrollWheelZoom: true,
      });

      // Dark Matter tile layer for dark theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 18,
        subdomains: 'abcd',
      }).addTo(map);

      // Create Layer group for markers
      const markerGroup = L.layerGroup().addTo(map);
      markerGroupRef.current = markerGroup;

      // Handle map click to inspect
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setClickedLocation({ lat, lon: lng });
      });

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([weather.lat, weather.lon], mapInstanceRef.current.getZoom() || 7);
    }

    // Clear and redraw markers
    if (markerGroupRef.current && mapInstanceRef.current) {
      markerGroupRef.current.clearLayers();

      // Custom icon for current selected location
      const currentIcon = L.divIcon({
        className: 'custom-heat-pin',
        html: `
          <div style="
            background: #f97316;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000000;
            font-weight: 900;
            font-size: 12px;
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.6);
            border: 2px solid #ffffff;
          ">
            ${weather.temperature}°
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const currentMarker = L.marker([weather.lat, weather.lon], { icon: currentIcon }).addTo(
        markerGroupRef.current
      );

      currentMarker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; color: #e2e2e3;">
          <h4 style="margin: 0; font-weight: 800; font-size: 14px; color: #ffffff;">${weather.city}</h4>
          <p style="margin: 3px 0 0; font-size: 12px; color: rgba(255,255,255,0.6);">${weather.weatherDescription}</p>
          <div style="margin-top: 6px; font-weight: 700; color: #f97316;">
            Heat Index: ${formatTemp(weather.apparentTemperature)}
          </div>
          <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 2px;">
            Risk Level: <b>${weather.riskLevel}</b> | UV: <b>${weather.uvIndex}</b>
          </div>
        </div>
      `).openPopup();

      // Add heat circle overlay
      const heatRadius = activeLayer === 'uv' ? 45000 : 65000;
      const heatColor =
        weather.riskLevel === 'Extreme'
          ? '#ef4444'
          : weather.riskLevel === 'Very High'
          ? '#f87171'
          : weather.riskLevel === 'High'
          ? '#f97316'
          : weather.riskLevel === 'Moderate'
          ? '#fbbf24'
          : '#10b981';

      L.circle([weather.lat, weather.lon], {
        radius: heatRadius,
        color: heatColor,
        fillColor: heatColor,
        fillOpacity: 0.25,
        weight: 1.5,
      }).addTo(markerGroupRef.current);

      // Add other hotspot city markers
      PRESET_CITIES.forEach((city) => {
        if (Math.abs(city.lat - weather.lat) > 0.05 || Math.abs(city.lon - weather.lon) > 0.05) {
          const cityIcon = L.divIcon({
            className: 'preset-city-pin',
            html: `
              <div style="
                background: #18181b;
                color: #e2e2e3;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 700;
                border: 1px solid rgba(255,255,255,0.2);
                box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                white-space: nowrap;
              ">
                📍 ${city.name}
              </div>
            `,
            iconSize: [80, 24],
            iconAnchor: [40, 12],
          });

          const m = L.marker([city.lat, city.lon], { icon: cityIcon }).addTo(markerGroupRef.current!);
          m.on('click', () => {
            onSelectCity(city.lat, city.lon, city.name, city.country, city.countryCode);
          });
        }
      });
    }
  }, [weather, activeLayer, unit]);

  const loadClickedLocation = () => {
    if (!clickedLocation) return;
    onSelectCity(
      clickedLocation.lat,
      clickedLocation.lon,
      `Coord (${clickedLocation.lat.toFixed(2)}, ${clickedLocation.lon.toFixed(2)})`
    );
    setClickedLocation(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Controls & Map Header */}
      <div className="bg-white/5 rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Weather &amp; Heat Map</h2>
            </div>
            <p className="text-xs text-white/40 font-medium mt-1">
              Live thermal radar, UV exposure zone mapping, and high-heat regional stations
            </p>
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => setActiveLayer('heat')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeLayer === 'heat'
                  ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Heat Index</span>
            </button>
            <button
              onClick={() => setActiveLayer('uv')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeLayer === 'uv'
                  ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>UV Intensity</span>
            </button>
            <button
              onClick={() => setActiveLayer('cooling')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeLayer === 'cooling'
                  ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Cooling Shelters</span>
            </button>
          </div>
        </div>

        {/* Global Preset Hotspots */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-mono font-bold text-white/30 shrink-0 text-[10px] uppercase tracking-widest">
            Jump to Hotspots:
          </span>
          {PRESET_CITIES.map((city, idx) => (
            <button
              key={idx}
              onClick={() => onSelectCity(city.lat, city.lon, city.name, city.country, city.countryCode)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-500/30 border border-white/10 text-white/80 font-medium transition-colors"
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-[#0d0d0f] rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-[460px] sm:h-[520px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Click inspection banner */}
        {clickedLocation && (
          <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-[#141416]/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-orange-500/40 z-10 animate-in fade-in slide-in-from-top-2 duration-150 text-white">
            <div className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest">Point Selected</div>
            <div className="font-bold text-sm text-white mt-0.5">
              Lat: {clickedLocation.lat.toFixed(4)}, Lon: {clickedLocation.lon.toFixed(4)}
            </div>
            <p className="text-xs text-white/60 mt-1">
              Fetch real-time heat conditions and safety alerts for this coordinate?
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={loadClickedLocation}
                className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.4)]"
              >
                Inspect Location
              </button>
              <button
                onClick={() => setClickedLocation(null)}
                className="px-3 py-1.5 bg-white/10 text-white font-medium text-xs rounded-xl hover:bg-white/15"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Floating Heat Scale Legend */}
        <div className="absolute bottom-4 right-4 bg-[#141416]/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/15 z-10 text-xs">
          <div className="font-bold text-white mb-2">Heat Risk Scale</div>
          <div className="space-y-1.5 font-medium text-[11px] text-white/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>Low (&lt; 27°C / 80°F)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>Moderate (27-32°C / 80-90°F)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
              <span>High (33-39°C / 91-103°F)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span>Very High (40-47°C / 104-116°F)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>Extreme (&gt; 48°C / 117°F+)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
