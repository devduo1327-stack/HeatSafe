import { WeatherData, HeatRiskLevel, HourlyForecast } from '../types';

// Calculate Heat Index using NOAA formula
export function calculateHeatIndex(tempC: number, humidity: number): number {
  const tempF = (tempC * 9) / 5 + 32;
  if (tempF < 80) return tempC;

  const HI_F =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * humidity -
    0.22475541 * tempF * humidity -
    0.00683783 * tempF * tempF -
    0.05481717 * humidity * humidity +
    0.00122874 * tempF * tempF * humidity +
    0.00085282 * tempF * humidity * humidity -
    0.00000199 * tempF * tempF * humidity * humidity;

  return Math.round(((HI_F - 32) * 5) / 9);
}

// Calculate Heat Risk Level from Heat Index / Apparent Temperature
export function getHeatRiskLevel(heatIndexC: number): {
  level: HeatRiskLevel;
  description: string;
  color: string;
  badgeBg: string;
  textColor: string;
} {
  if (heatIndexC < 27) {
    return {
      level: 'Low',
      description: 'Little to no heat risk for general population. Normal hydration recommended.',
      color: '#10B981', // green-500
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      textColor: 'text-emerald-700',
    };
  } else if (heatIndexC < 33) {
    return {
      level: 'Moderate',
      description: 'Fatigue possible with prolonged exposure and physical activity. Stay hydrated.',
      color: '#F59E0B', // amber-500
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-300',
      textColor: 'text-amber-700',
    };
  } else if (heatIndexC < 40) {
    return {
      level: 'High',
      description: 'Heat cramps and exhaustion likely. Heat stroke possible with continued outdoor exposure.',
      color: '#F97316', // orange-500
      badgeBg: 'bg-orange-50 text-orange-900 border-orange-300',
      textColor: 'text-orange-700',
    };
  } else if (heatIndexC < 48) {
    return {
      level: 'Very High',
      description: 'Heat cramps or exhaustion very likely. Heat stroke probable with continued activity.',
      color: '#EF4444', // red-500
      badgeBg: 'bg-red-50 text-red-900 border-red-300',
      textColor: 'text-red-700',
    };
  } else {
    return {
      level: 'Extreme',
      description: 'DANGER: Heat stroke imminent with high physical exertion. Stay in air-conditioned shelter.',
      color: '#7F1D1D', // dark red
      badgeBg: 'bg-rose-100 text-rose-950 border-rose-400 font-bold',
      textColor: 'text-rose-800',
    };
  }
}

// Format UV description
export function getUvCategory(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

// Calculate Safe Outdoor Window recommendation
export function getOutdoorSafetyRecommendation(maxHeatIndex: number, uvMax: number): string {
  if (maxHeatIndex >= 44 || uvMax >= 10) {
    return 'Avoid 10 AM–5 PM';
  } else if (maxHeatIndex >= 38 || uvMax >= 8) {
    return 'Avoid 11 AM–4 PM';
  } else if (maxHeatIndex >= 32 || uvMax >= 6) {
    return 'Caution 12 PM–3 PM';
  } else {
    return 'Safe throughout day';
  }
}

// Calculate Hydration Guideline
export function getHydrationRecommendation(heatIndex: number): string {
  if (heatIndex >= 42) return 'Critical: 1L/hr + Electrolytes';
  if (heatIndex >= 35) return 'High Intake Required (750ml/hr)';
  if (heatIndex >= 28) return 'Recommended';
  return 'Normal';
}

// Calculate Protection Guideline
export function getProtectionRecommendation(uv: number, temp: number): string {
  if (uv >= 8 || temp >= 36) return 'Mandatory (Hat, SPF 50, Shade)';
  if (uv >= 6 || temp >= 30) return 'Recommended';
  if (uv >= 3) return 'Sunglasses & SPF 30';
  return 'Minimal';
}

// Preset popular worldwide hot weather cities
export const PRESET_CITIES = [
  { name: 'Muscat, OM', lat: 23.5880, lon: 58.3829, country: 'Oman', countryCode: 'OM' },
  { name: 'Phoenix, US', lat: 33.4484, lon: -112.0740, country: 'United States', countryCode: 'US' },
  { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708, country: 'United Arab Emirates', countryCode: 'AE' },
  { name: 'Riyadh, SA', lat: 24.7136, lon: 46.6753, country: 'Saudi Arabia', countryCode: 'SA' },
  { name: 'Delhi, IN', lat: 28.6139, lon: 77.2090, country: 'India', countryCode: 'IN' },
  { name: 'Seville, ES', lat: 37.3891, lon: -5.9845, country: 'Spain', countryCode: 'ES' },
  { name: 'Austin, US', lat: 30.2672, lon: -97.7431, country: 'United States', countryCode: 'US' },
  { name: 'Sydney, AU', lat: -33.8688, lon: 151.2093, country: 'Australia', countryCode: 'AU' },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278, country: 'United Kingdom', countryCode: 'GB' },
  { name: 'Cairo, EG', lat: 30.0444, lon: 31.2357, country: 'Egypt', countryCode: 'EG' },
];

export async function fetchWeatherData(lat: number, lon: number, cityName?: string, countryName?: string, countryCode?: string): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,uv_index,weather_code&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather API error: ${res.statusText}`);
  }
  const data = await res.json();

  const current = data.current;
  const hourlyData = data.hourly;
  const dailyData = data.daily;

  const temp = Math.round(current.temperature_2m);
  const humidity = Math.round(current.relative_humidity_2m);
  const apparentTemp = Math.round(current.apparent_temperature);
  const windSpeed = Math.round(current.wind_speed_10m);
  const weatherCode = current.weather_code;

  // Find max UV from hourly or daily
  const maxUvToday = dailyData?.uv_index_max?.[0] ?? 8;
  const currentHourIdx = new Date().getHours();
  const currentUv = hourlyData?.uv_index?.[currentHourIdx] ?? (maxUvToday > 6 ? 8 : 4);

  const riskInfo = getHeatRiskLevel(apparentTemp);
  const uvCategory = getUvCategory(currentUv);
  const outdoorRec = getOutdoorSafetyRecommendation(apparentTemp, maxUvToday);
  const hydrationRec = getHydrationRecommendation(apparentTemp);
  const protectionRec = getProtectionRecommendation(currentUv, temp);

  // Parse 24 hourly data
  const hourly: HourlyForecast[] = [];
  const startIdx = Math.max(0, currentHourIdx - 2);
  const endIdx = Math.min(startIdx + 24, (hourlyData.time || []).length);

  for (let i = startIdx; i < endIdx; i++) {
    const rawTime = hourlyData.time[i];
    const hourNum = new Date(rawTime).getHours();
    const hTemp = Math.round(hourlyData.temperature_2m[i]);
    const hApparent = Math.round(hourlyData.apparent_temperature[i]);
    const hUv = Math.round(hourlyData.uv_index[i] || 0);
    const hRisk = getHeatRiskLevel(hApparent).level;
    const isSafe = hRisk === 'Low' || (hRisk === 'Moderate' && hUv < 6);

    let note = 'Safe for exercise';
    if (hRisk === 'Extreme' || hRisk === 'Very High') {
      note = 'Danger: Avoid all outdoor exertion';
    } else if (hRisk === 'High') {
      note = 'High heat stress: Take frequent shade';
    } else if (hRisk === 'Moderate') {
      note = 'Moderate risk: Hydrate every 20 min';
    }

    hourly.push({
      time: `${hourNum % 12 === 0 ? 12 : hourNum % 12} ${hourNum >= 12 ? 'PM' : 'AM'}`,
      hourNumber: hourNum,
      temp: hTemp,
      apparentTemp: hApparent,
      uvIndex: hUv,
      riskLevel: hRisk,
      safeForActivity: isSafe,
      activityNote: note,
    });
  }

  // Simplified Wet Bulb Globe Temp (WBGT) estimate formula
  const wbgt = Math.round(0.7 * (temp * 0.7 + humidity * 0.1) + 0.2 * temp + 0.1 * temp);

  // Weather description based on WMO code
  let weatherDescription = 'Sunny & Clear';
  if (weatherCode === 1 || weatherCode === 2) weatherDescription = 'Mostly Sunny';
  else if (weatherCode === 3) weatherDescription = 'Partly Cloudy';
  else if (weatherCode >= 51 && weatherCode <= 67) weatherDescription = 'Light Rain';
  else if (weatherCode >= 80 && weatherCode <= 82) weatherDescription = 'Showers';
  else if (weatherCode >= 95) weatherDescription = 'Thunderstorm';

  return {
    city: cityName || 'Local Location',
    country: countryName || 'Current Region',
    countryCode: countryCode || 'US',
    lat,
    lon,
    temperature: temp,
    apparentTemperature: apparentTemp,
    humidity,
    uvIndex: currentUv,
    windSpeed,
    weatherCode,
    weatherDescription,
    dewPoint: Math.round(temp - (100 - humidity) / 5),
    wbgtEstimate: wbgt,
    highTemp: Math.round(dailyData?.temperature_2m_max?.[0] ?? temp + 3),
    lowTemp: Math.round(dailyData?.temperature_2m_min?.[0] ?? temp - 6),
    riskLevel: riskInfo.level,
    riskDescription: riskInfo.description,
    hourly,
    todaySafety: {
      hydration: hydrationRec,
      uv: uvCategory,
      outdoorActivity: outdoorRec,
      protection: protectionRec,
    },
  };
}

// Search locations using Open-Meteo Geocoding
export async function searchLocations(query: string): Promise<Array<{
  name: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  admin1?: string;
}>> {
  if (!query || query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Geocoding search failed', err);
    return [];
  }
}
