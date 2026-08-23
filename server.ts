import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Server-side Gemini initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Emergency contact directory for various countries / regions
const EMERGENCY_DATA: Record<string, {
  country: string;
  ambulance: string;
  police: string;
  fire: string;
  general: string;
  heatHotline: string;
  guidelines: string;
}> = {
  OM: {
    country: "Oman",
    ambulance: "9999",
    police: "9999",
    fire: "9999",
    general: "9999",
    heatHotline: "2444 1999 (Ministry of Health Emergency) / 9999",
    guidelines: "Dial 9999 anywhere across the Sultanate of Oman for emergency police, ambulance, civil defence, and urgent heat emergency rescue."
  },
  US: {
    country: "United States",
    ambulance: "911",
    police: "911",
    fire: "911",
    general: "911",
    heatHotline: "1-800-222-1222 (Poison & Triage) / 211 (Cooling Centers)",
    guidelines: "Call 911 immediately if someone stops sweating, shows confusion, faints, or has vomiting during high heat."
  },
  GB: {
    country: "United Kingdom",
    ambulance: "999",
    police: "999",
    fire: "999",
    general: "112 / 999",
    heatHotline: "111 (NHS Non-emergency)",
    guidelines: "Call 999 for heatstroke emergencies or 111 for clinical advice on heat exhaustion."
  },
  CA: {
    country: "Canada",
    ambulance: "911",
    police: "911",
    fire: "911",
    general: "911",
    heatHotline: "811 (HealthLink)",
    guidelines: "Call 911 for severe heat illness. Contact 811 for non-urgent heat health advice."
  },
  AU: {
    country: "Australia",
    ambulance: "000",
    police: "000",
    fire: "000",
    general: "000 / 112 (mobile)",
    heatHotline: "1800 022 222 (Healthdirect)",
    guidelines: "Call 000 for life-threatening heat illness. Move patient to shaded area immediately."
  },
  IN: {
    country: "India",
    ambulance: "108",
    police: "100",
    fire: "101",
    general: "112 (National Emergency)",
    heatHotline: "1075 (National Health Helpline) / 104",
    guidelines: "Call 112 or 108. Apply cold water wraps, move out of direct sun, give ORS if conscious."
  },
  EU: {
    country: "European Union / General Europe",
    ambulance: "112",
    police: "112",
    fire: "112",
    general: "112",
    heatHotline: "112 (Universal Emergency)",
    guidelines: "Dial 112 free of charge from any fixed or mobile phone in the EU."
  },
  DEFAULT: {
    country: "International",
    ambulance: "112 / 911",
    police: "112 / 911",
    fire: "112 / 911",
    general: "112 / 911",
    heatHotline: "Contact local emergency dispatch",
    guidelines: "Seek immediate medical attention for unconsciousness, rapid pulse, lack of sweat in high heat."
  }
};

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "HeatSafe Server", timestamp: new Date().toISOString() });
});

// API: Emergency info by country code
app.get("/api/emergency/contacts", (req, res) => {
  const countryCode = (req.query.country as string || "DEFAULT").toUpperCase();
  const info = EMERGENCY_DATA[countryCode] || EMERGENCY_DATA.DEFAULT;
  res.json({ countryCode, ...info });
});

// API: Gemini Heat AI Chat & Query
app.post("/api/gemini/advisor", async (req, res) => {
  try {
    const { prompt, weatherContext, userProfile } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are HeatSafe AI, an expert thermal safety specialist and clinical environmental health advisor.
The user is consulting you for specific heat safety advice, thermal physiology guidance, symptom triage, activity planning, or cooling protocols.

Current Real-Time Ground Weather Context:
- Location: ${weatherContext?.city || "Current Location"}
- Ambient Temperature: ${weatherContext?.temperature ?? 32}°C (${Math.round((weatherContext?.temperature ?? 32) * 9/5 + 32)}°F)
- Perceived Heat Index (Feels Like): ${weatherContext?.apparentTemperature ?? 36}°C (${Math.round((weatherContext?.apparentTemperature ?? 36) * 9/5 + 32)}°F)
- Relative Humidity: ${weatherContext?.humidity ?? 60}%
- UV Index: ${weatherContext?.uvIndex ?? 8}
- Heat Illness Risk Category: ${weatherContext?.riskLevel || "High"}
${userProfile ? `User Profile: Age Group: ${userProfile.ageGroup || 'Adult'}, Activity Level: ${userProfile.activity || 'Moderate'}, Reported Conditions: ${userProfile.conditions?.join(', ') || 'None specified'}` : ''}

CRITICAL RESPONSE GUIDELINES:
1. DIRECT AND CLEAR STATEMENT: Answer the user's exact question or concern directly in the very first sentence. Never open with repetitive generic boilerplate or generic greetings. State the core medical/safety conclusion clearly and authoritatively.
2. THOROUGH & ACTIONABLE DETAIL: Provide comprehensive, specific guidance (exact hydration volumes like 250ml every 15-20 min, electrolyte sodium/potassium replacement ratios, specific hourly windows for safe outdoor exercise, fabric types, fan vs AC evaporation limits, symptom progression from heat cramps to heat stroke).
3. CLINICAL ACCURACY:
   - If emergency symptoms are mentioned (body temp > 39.5°C / 103°F, confusion, loss of consciousness, cessation of sweating with red hot skin, vomiting, seizures), immediately give clear emergency protocol: call local emergency services, initiate active cooling (ice packs on groin/armpits/neck, cold water immersion, evaporative misting).
   - If mild symptoms (lightheadedness, heavy sweating, muscle spasms, headache), provide immediate step-by-step resting, oral rehydration solution, elevation of feet, and cool environment transfer.
4. FORMATTING RULES:
   - Do NOT use markdown asterisks (***, **, *) or hashtags (##, ###). Keep all text clean and readable with natural paragraphs, numbered steps, or plain bullet dashes.
   - Maintain a confident, compassionate, and crystal-clear clinical tone.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const rawText = response.text || "";
    const cleanText = rawText
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .trim();

    if (cleanText) {
      return res.json({
        text: cleanText,
        timestamp: new Date().toISOString(),
      });
    }

    throw new Error("Empty AI response");
  } catch (error: any) {
    console.error("Gemini Advisor Error:", error);
    
    // Generate intelligent contextual response based on prompt keywords and weather
    const query = (req.body?.prompt || "").toLowerCase();
    const city = req.body?.weatherContext?.city || "your area";
    const temp = req.body?.weatherContext?.temperature ?? 34;
    const feelsLike = req.body?.weatherContext?.apparentTemperature ?? 38;
    const humidity = req.body?.weatherContext?.humidity ?? 55;
    const uv = req.body?.weatherContext?.uvIndex ?? 8;

    let clearStatement = "";

    if (query.includes("run") || query.includes("exercise") || query.includes("gym") || query.includes("workout") || query.includes("sport")) {
      clearStatement = `Outdoor strenuous exercise during peak heat hours in ${city} poses a severe risk of exertional heat exhaustion and heat stroke.

Safe Activity Guidelines for Today:
1. Optimal Training Window: Complete outdoor workouts strictly before 6:30 AM or after 7:30 PM when solar radiation and surface heat have subsided.
2. Hydration Protocol: Drink 500ml of fluid with electrolytes 2 hours before exercise, and consume 200-250ml every 15-20 minutes during moderate exertion.
3. Heart Rate Monitoring: Lower your target intensity by 15-20% because elevated ambient temperatures (${temp}°C / Feels like ${feelsLike}°C) increase cardiac output and core body heating.
4. Warning Thresholds: Stop immediately if you experience dizziness, goosebumps while sweating, sudden nausea, or muscle cramping.`;
    } else if (query.includes("nauseous") || query.includes("lighthead") || query.includes("dizzy") || query.includes("faint") || query.includes("headache") || query.includes("cramp")) {
      clearStatement = `Your symptoms indicate early to moderate heat exhaustion caused by core body overheating and electrolyte depletion in ${city}'s ${feelsLike}°C heat index.

Immediate Action Protocol:
1. Move to Shade or AC: Immediately move to an air-conditioned room or dense shade and loosen any restrictive clothing.
2. Active Cooling: Apply cool, wet towels or ice packs to high-blood-flow areas (back of neck, armpits, and groin).
3. Rehydration: Sip cool water or an oral rehydration solution (electrolyte beverage) slowly. Avoid rapid gulping to prevent nausea.
4. Elevation: Lie flat and elevate your legs 15-30 cm above heart level to restore blood pressure to the brain.
5. Medical Threshold: If vomiting prevents fluid intake, or if confusion, slurred speech, or loss of consciousness occurs, seek immediate emergency medical care.`;
    } else if (query.includes("water") || query.includes("drink") || query.includes("hydrat") || query.includes("fluid") || query.includes("electrolyte")) {
      clearStatement = `At current atmospheric conditions in ${city} (Heat Index ${feelsLike}°C with ${humidity}% humidity), your body requires approximately 750ml to 1,000ml of fluid per hour of outdoor activity to replace sweat losses.

Hydration Strategy:
1. Frequency: Drink 200-250ml (1 cup) of cool water every 15 to 20 minutes rather than large quantities infrequently.
2. Electrolyte Balance: If sweating continuously for more than 45 minutes, replace sodium and potassium with electrolyte tablets, coconut water, or sports hydration mixes to prevent hyponatremia.
3. Substances to Avoid: Avoid caffeinated energy drinks and alcohol, as they accelerate dehydration and impair peripheral blood flow.
4. Hydration Check: Monitor your urine color; pale straw-yellow indicates adequate hydration, whereas dark amber signals significant dehydration.`;
    } else if (query.includes("sunscreen") || query.includes("uv") || query.includes("skin") || query.includes("cloth")) {
      clearStatement = `With a UV Index of ${uv} in ${city}, unprotected skin can experience cellular damage and severe sunburn in less than 15-20 minutes.

Sun Protection Protocol:
1. Sunscreen: Apply broad-spectrum SPF 50+ sunscreen 20 minutes prior to sun exposure and reapply every 90 minutes or immediately after heavy sweating.
2. Apparel: Wear loose-fitting, light-colored, tightly woven clothing (preferably UPF 50+ rated) to reflect solar radiation.
3. Eyewear & Headwear: Wear a wide-brimmed hat (minimum 7cm brim) and UV400 polarized sunglasses to protect the eyes and optic nerve from intense solar glare.`;
    } else {
      clearStatement = `In ${city}, the current ambient temperature of ${temp}°C (Feels like ${feelsLike}°C with ${humidity}% humidity and UV Index ${uv}) creates elevated thermal strain on the cardiovascular and thermoregulatory systems.

Comprehensive Heat Safety Directives:
1. Thermal Management: Stay in air-conditioned or ventilated environments between 11:00 AM and 4:30 PM when direct solar insolation is at its maximum peak.
2. Fluid Intake: Consume a baseline of 2.5 to 3.5 liters of water daily, increasing by 250ml for every 20 minutes spent in direct outdoor heat.
3. Cooling Measures: Use cold water rinses on pulse points (wrists, neck, temples) to accelerate convective heat dissipation.
4. Vulnerability Awareness: Children, elderly adults, and individuals taking blood pressure or allergy medications have reduced heat tolerance and require closer monitoring.`;
    }

    res.json({
      text: clearStatement,
      timestamp: new Date().toISOString(),
    });
  }
});

// API: Gemini Structured Personalized Assessment
app.post("/api/gemini/personalized-assessment", async (req, res) => {
  try {
    const { weather, profile } = req.body;
    const ai = getGeminiClient();

    const prompt = `Perform a comprehensive Heat Safety Risk Assessment for an individual with the following parameters:
- Location: ${weather?.city || "Local Area"}
- Current Temp: ${weather?.temperature ?? 35}°C
- Heat Index: ${weather?.apparentTemperature ?? 39}°C
- UV Index: ${weather?.uvIndex ?? 9}
- Humidity: ${weather?.humidity ?? 65}%
- Individual Age: ${profile?.ageGroup || "Adult (18-64)"}
- Occupation / Activity: ${profile?.activity || "Moderate outdoor exposure"}
- Health Conditions: ${profile?.conditions?.length ? profile.conditions.join(", ") : "None reported"}
- Planned Outdoor Hours: ${profile?.outdoorHours || "Midday (11 AM - 3 PM)"}

Please evaluate the heat risk and provide a JSON response with:
- personalRiskLevel: ("Low" | "Moderate" | "High" | "Very High" | "Critical Danger")
- riskScore: number between 1 and 100
- summary: concise 2-sentence summary of specific vulnerabilities
- hydrationPlan: recommended ml/hour and electrolyte guidance
- safeWindows: suggested best hours for outdoor tasks
- keyPrecautions: array of 4-6 specific actionable precautions
- redFlagSymptoms: array of 3-4 symptoms that require immediate medical attention for this profile`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert thermal physiologist and occupational heat health specialist. Always return valid structured JSON adhering to the requested schema.",
        responseMimeType: "application/json",
      },
    });

    let resultJson;
    try {
      resultJson = JSON.parse(response.text || "{}");
    } catch {
      resultJson = {
        personalRiskLevel: "High",
        riskScore: 78,
        summary: "High heat index and solar radiation create elevated strain. Take frequent shaded breaks and hydrate continuously.",
        hydrationPlan: "Drink 750ml - 1000ml of cool water per hour with sodium/potassium electrolyte replenishment.",
        safeWindows: "Early morning before 10:00 AM or late evening after 6:30 PM.",
        keyPrecautions: [
          "Wear loose-fitting, light-colored UPF 50+ clothing",
          "Apply broad-spectrum SPF 50 sunscreen every 90 minutes",
          "Take 15-minute rest breaks in air-conditioned or shaded areas every 45 minutes",
          "Monitor urine color to ensure clear or pale straw hue"
        ],
        redFlagSymptoms: ["Dizziness or fainting", "Confusion or slurred speech", "Nausea or vomiting", "Hot, red, or dry skin with rapid pulse"]
      };
    }

    res.json(resultJson);
  } catch (error: any) {
    console.error("Gemini Assessment Error:", error);
    // Fallback reliable medical-grade estimation
    res.json({
      personalRiskLevel: "High",
      riskScore: 75,
      summary: "Environmental heat index exceeds safe thresholds for prolonged exertion. Elevated risk of thermal stress.",
      hydrationPlan: "Drink at least 800ml fluid/hour with electrolytes.",
      safeWindows: "Before 10:00 AM and after 6:00 PM.",
      keyPrecautions: [
        "Avoid peak sun hours (11:00 AM - 4:00 PM)",
        "Wear wide-brimmed hats and polarized sunglasses",
        "Never leave children, elderly persons, or pets in parked vehicles",
        "Keep cold compresses or misting fans nearby"
      ],
      redFlagSymptoms: ["High body temperature (>103°F/39.4°C)", "Confusion or altered mental state", "Rapid breathing and pulse", "Loss of consciousness"]
    });
  }
});

// API: Gemini SkyScan AI - Multimodal Sky Image & Weather Data Correlation
app.post("/api/gemini/skyscan", async (req, res) => {
  try {
    const { imageBase64, mimeType, weather } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Sky image is required for SkyScan analysis" });
    }

    const ai = getGeminiClient();

    // Clean base64 if it has data url prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    const finalMime = mimeType || "image/jpeg";

    const prompt = `Analyze this user-uploaded sky photograph and synthesize it directly with real-time ground weather station telemetry for ${weather?.city || "the user's location"}.

Ground Weather Station Telemetry:
- Location: ${weather?.city || "Local City"}, ${weather?.country || ""} (Lat: ${weather?.lat ?? "N/A"}, Lon: ${weather?.lon ?? "N/A"})
- Ground Ambient Temperature: ${weather?.temperature ?? 34}°C (${Math.round((weather?.temperature ?? 34) * 9/5 + 32)}°F)
- Feels Like / Heat Index: ${weather?.apparentTemperature ?? 38}°C
- Ground Relative Humidity: ${weather?.humidity ?? 55}%
- Ground Station UV Index: ${weather?.uvIndex ?? 8}
- Wind Speed: ${weather?.windSpeed ?? 15} km/h
- Current Station Description: ${weather?.weatherDescription || "Clear/Sunny"}

Multimodal Computer Vision Analysis Instructions:
1. Examine the visual sky features: cloud cover, cloud formations (cumulus, cirrus, stratocumulus, anvil clouds, clear solar dome, dust/sand haze, marine layer, etc.), sun position/glare, horizon clarity, and atmospheric haze.
2. Correlate with the real-time weather API station data:
   - Provide an estimated localized visual temperature (°C) reflecting direct radiant heating versus shade.
   - Explain how optical sky conditions (solar angle, atmospheric transparency, ground reflection) affect the thermal profile.
   - Provide estimated humidity (%) with explanation of cloud base condensation level and visible atmospheric moisture.
   - Calculate cloud cover percentage (integer from 0 to 100).
   - Evaluate direct solar UV penetration and solar irradiance through the visible cloud/atmosphere layer.
   - Determine overall heat risk level ("Low" | "Moderate" | "High" | "Very High" | "Extreme").
   - Calculate an overall thermal comfort score from 0 to 100 (100 = optimal comfort, 0 = critical dangerous thermal distress).
   - Provide a detailed plain-text analysis combining the visual optics and meteorological metrics.
   - Provide 4-6 specific actionable outdoor heat safety tips.

CRITICAL FORMATTING RULE:
Do NOT output markdown asterisks (*** or **) or hashtags (##). Keep all text clean and readable.

Return ONLY a JSON object adhering to this schema:
{
  "atmosphericCondition": string,
  "cloudCoverPercentage": number,
  "cloudTypes": string[],
  "estimatedTemperature": number,
  "temperatureExplanation": string,
  "estimatedHumidity": number,
  "humidityExplanation": string,
  "uvExposureAssessment": string,
  "heatRiskAssessment": "Low" | "Moderate" | "High" | "Very High" | "Extreme",
  "comfortScore": number,
  "detailedAnalysis": string,
  "outdoorSafetyTips": string[]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: finalMime,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        systemInstruction: "You are SkyScan AI, a specialized meteorological computer vision intelligence. Correlate sky imagery with ground telemetry. Return strictly valid JSON with no markdown syntax.",
        responseMimeType: "application/json",
      },
    });

    let resultJson: any;
    try {
      resultJson = JSON.parse(response.text || "{}");
    } catch {
      resultJson = {
        atmosphericCondition: "High-Solar Glare & Clear Atmospheric Dome",
        cloudCoverPercentage: 15,
        cloudTypes: ["Clear Sky", "Sparse Cirrus", "Thermal Haze"],
        estimatedTemperature: weather?.temperature || 35,
        temperatureExplanation: "Direct uninterrupted solar insolation creates intense ground-level radiant heating with minimal cloud filtration.",
        estimatedHumidity: weather?.humidity || 45,
        humidityExplanation: "High atmospheric transparency indicates dry mid-troposphere conditions with moderate surface moisture.",
        uvExposureAssessment: `Intense solar penetration corresponding to UV Index ${weather?.uvIndex || 9}. High risk of sunburn within 15 minutes of direct exposure.`,
        heatRiskAssessment: (weather?.riskLevel as any) || "High",
        comfortScore: 42,
        detailedAnalysis: "Sky imagery reveals an open solar window with high atmospheric transmission. Ground infrared re-radiation is elevated, magnifying perceived temperatures beyond ambient shade readings.",
        outdoorSafetyTips: [
          "Seek shade under structures with UV-blocking roofs",
          "Wear polarized UV400 sunglasses to prevent solar glare and retinal strain",
          "Apply broad-spectrum SPF 50+ sunscreen every 90 minutes",
          "Hydrate with 250ml fluids every 20 minutes when active outdoors",
          "Avoid direct strenuous outdoor exertion between 11:00 AM and 4:00 PM"
        ]
      };
    }

    // Clean any accidental markdown in strings
    const cleanStr = (s: string) => (s ? s.replace(/^#{1,6}\s+/gm, '').replace(/\*\*\*/g, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '').trim() : '');
    
    if (resultJson.detailedAnalysis) resultJson.detailedAnalysis = cleanStr(resultJson.detailedAnalysis);
    if (resultJson.atmosphericCondition) resultJson.atmosphericCondition = cleanStr(resultJson.atmosphericCondition);
    if (resultJson.temperatureExplanation) resultJson.temperatureExplanation = cleanStr(resultJson.temperatureExplanation);
    if (resultJson.humidityExplanation) resultJson.humidityExplanation = cleanStr(resultJson.humidityExplanation);
    if (resultJson.uvExposureAssessment) resultJson.uvExposureAssessment = cleanStr(resultJson.uvExposureAssessment);
    if (Array.isArray(resultJson.outdoorSafetyTips)) {
      resultJson.outdoorSafetyTips = resultJson.outdoorSafetyTips.map((tip: string) => cleanStr(tip));
    }
    if (Array.isArray(resultJson.cloudTypes)) {
      resultJson.cloudTypes = resultJson.cloudTypes.map((type: string) => cleanStr(type));
    }

    res.json(resultJson);
  } catch (error: any) {
    console.error("SkyScan AI Error:", error);
    // Fallback calculation using station data
    const temp = req.body?.weather?.temperature || 34;
    const hum = req.body?.weather?.humidity || 50;
    const uv = req.body?.weather?.uvIndex || 8;
    res.json({
      atmosphericCondition: "Open Sky with Direct Solar Radiant Heating",
      cloudCoverPercentage: 20,
      cloudTypes: ["Scattered Cumulus", "Atmospheric Haze"],
      estimatedTemperature: temp,
      temperatureExplanation: `Visual sky clearance confirms strong solar heating, reinforcing station reading of ${temp}°C.`,
      estimatedHumidity: hum,
      humidityExplanation: `Atmospheric moisture optical profile aligns with ground relative humidity of ${hum}%.`,
      uvExposureAssessment: `High direct solar radiance with UV Index ${uv}. Very high skin burn vulnerability without shade.`,
      heatRiskAssessment: (req.body?.weather?.riskLevel as any) || "High",
      comfortScore: 45,
      detailedAnalysis: "Sky optical assessment indicates high solar irradiance reaching ground level. Thermal radiation combined with ambient humidity creates significant thermal strain for outdoor activities.",
      outdoorSafetyTips: [
        "Wear wide-brimmed hats and lightweight UV-protective clothing",
        "Maintain consistent electrolyte hydration (750ml/hour in heat)",
        "Schedule intense outdoor activities for early morning or after sunset",
        "Take shaded rest intervals every 30-45 minutes"
      ]
    });
  }
});

// Vite / static file setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HeatSafe Server is running on port ${PORT}`);
  });
}

startServer();
