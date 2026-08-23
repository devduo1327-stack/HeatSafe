export type HeatRiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';

export interface WeatherData {
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  temperature: number; // Celsius
  apparentTemperature: number; // Feels like / Heat Index
  humidity: number; // %
  uvIndex: number;
  windSpeed: number; // km/h
  weatherCode: number;
  weatherDescription: string;
  dewPoint: number;
  wbgtEstimate: number; // Wet Bulb Globe Temperature estimate
  highTemp: number;
  lowTemp: number;
  riskLevel: HeatRiskLevel;
  riskDescription: string;
  hourly: HourlyForecast[];
  todaySafety: {
    hydration: string;
    uv: string;
    outdoorActivity: string;
    protection: string;
  };
}

export interface HourlyForecast {
  time: string;
  hourNumber: number;
  temp: number;
  apparentTemp: number;
  uvIndex: number;
  riskLevel: HeatRiskLevel;
  safeForActivity: boolean;
  activityNote: string;
}

export interface UserRiskProfile {
  ageGroup: 'child' | 'adult' | 'senior' | 'infant';
  activityLevel: 'resting' | 'light_work' | 'heavy_outdoor_labor' | 'athletics';
  healthConditions: string[];
  hydrationTargetMl: number;
  currentHydrationMl: number;
  hydrationRemindersEnabled: boolean;
  reminderIntervalMinutes: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  notes?: string;
}

export interface RegionalEmergencyInfo {
  country: string;
  countryCode: string;
  ambulance: string;
  police: string;
  fire: string;
  general: string;
  heatHotline: string;
  guidelines: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isEmergencyAlert?: boolean;
}

export type ActiveTab = 'today' | 'weather_map' | 'safety_recommendations' | 'emergency_contacts' | 'heatsafe_ai' | 'skyscan_ai' | 'pro_unlock';

export interface SkyScanAnalysis {
  atmosphericCondition: string;
  cloudCoverPercentage: number;
  cloudTypes: string[];
  estimatedTemperature: number;
  temperatureExplanation: string;
  estimatedHumidity: number;
  humidityExplanation: string;
  uvExposureAssessment: string;
  heatRiskAssessment: HeatRiskLevel;
  comfortScore: number; // 0-100
  detailedAnalysis: string;
  outdoorSafetyTips: string[];
}
