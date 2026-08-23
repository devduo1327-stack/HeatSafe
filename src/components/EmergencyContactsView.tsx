import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  MapPin,
  AlertOctagon,
  Shield,
  Hospital,
  Heart,
  Plus,
  Trash2,
  Share2,
  ExternalLink,
  Info,
  Building,
  UserPlus,
  Send,
} from 'lucide-react';
import { WeatherData, EmergencyContact, RegionalEmergencyInfo } from '../types';

interface EmergencyContactsViewProps {
  weather: WeatherData;
  unit: 'C' | 'F';
}

export const EmergencyContactsView: React.FC<EmergencyContactsViewProps> = ({ weather, unit }) => {
  const [regionalInfo, setRegionalInfo] = useState<RegionalEmergencyInfo | null>(null);
  const [isLoadingRegional, setIsLoadingRegional] = useState(false);

  // In Case of Emergency (ICE) Personal Contacts
  const [personalContacts, setPersonalContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('heatsafe_ice_contacts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      { id: '1', name: 'Primary Family Contact', relationship: 'Family / Spouse', phone: '911-000-0000' },
    ];
  });

  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [smsCopied, setSmsCopied] = useState(false);

  // Save personal contacts to localStorage
  useEffect(() => {
    localStorage.setItem('heatsafe_ice_contacts', JSON.stringify(personalContacts));
  }, [personalContacts]);

  // Fetch emergency directory based on weather countryCode
  useEffect(() => {
    async function fetchEmergencyInfo() {
      setIsLoadingRegional(true);
      try {
        const countryCode = weather.countryCode || 'US';
        const res = await fetch(`/api/emergency/contacts?country=${encodeURIComponent(countryCode)}`);
        if (res.ok) {
          const data = await res.json();
          setRegionalInfo(data);
        }
      } catch (err) {
        console.error('Failed to fetch emergency contacts', err);
      } finally {
        setIsLoadingRegional(false);
      }
    }
    fetchEmergencyInfo();
  }, [weather.countryCode]);

  const addPersonalContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: newContactRelation.trim() || 'Emergency Contact',
    };

    setPersonalContacts([...personalContacts, newContact]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelation('');
    setIsAddingContact(false);
  };

  const removeContact = (id: string) => {
    setPersonalContacts(personalContacts.filter((c) => c.id !== id));
  };

  const generateSmsSos = () => {
    const tempStr = unit === 'F' ? `${Math.round((weather.temperature * 9) / 5 + 32)}°F` : `${weather.temperature}°C`;
    const message = `EMERGENCY ALERT: I am feeling unwell due to extreme heat (${tempStr}, Heat Index in ${weather.city}). My current location is https://maps.google.com/?q=${weather.lat},${weather.lon}. Please check on me immediately.`;
    navigator.clipboard.writeText(message);
    setSmsCopied(true);
    setTimeout(() => setSmsCopied(false), 3000);
  };

  // Determine if location is Oman
  const isOman =
    weather.countryCode === 'OM' ||
    weather.country?.toLowerCase().includes('oman') ||
    weather.city?.toLowerCase().includes('muscat') ||
    weather.city?.toLowerCase().includes('salalah');

  const primaryAmbulance = isOman ? '9999' : (regionalInfo?.ambulance || '911');
  const primaryGeneral = isOman ? '9999' : (regionalInfo?.general || '112');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP LOCATION-AWARE EMERGENCY DISPATCH BANNER */}
      <div className="bg-gradient-to-br from-red-950/80 via-red-900/60 to-black text-white rounded-3xl p-6 sm:p-8 border border-red-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-xs font-mono font-bold uppercase tracking-wider text-red-300">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>Location Detected: {weather.city}, {weather.country} ({weather.countryCode})</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Emergency Services &amp; Immediate Response
            </h2>
            <p className="text-xs sm:text-sm text-white/70 font-medium leading-relaxed">
              {isOman
                ? `In Oman, dial 9999 immediately for all emergency dispatch, ambulance, civil defence, and urgent heat stroke rescue in ${weather.city}.`
                : `If someone is vomiting, disoriented, losing consciousness, or displaying heat stroke symptoms in ${weather.city}, call emergency dispatch immediately.`}
            </p>
          </div>

          {/* Rapid Dial Buttons for Location */}
          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${primaryAmbulance}`}
              className="px-5 py-3.5 rounded-2xl bg-red-500 hover:bg-red-400 text-black font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all active:scale-95"
            >
              <PhoneCall className="w-5 h-5 text-black" />
              <span>Call Medical: {primaryAmbulance}</span>
            </a>

            <a
              href={`tel:${primaryGeneral}`}
              className="px-4 py-3.5 rounded-2xl bg-white/10 text-white border border-white/20 font-bold text-sm flex items-center gap-2 hover:bg-white/15 transition-colors"
            >
              <Shield className="w-4 h-4 text-orange-400" />
              <span>All Emergency: {primaryGeneral}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. REGIONAL HEAT HOTLINES & CLINICAL HELPLINES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* National Hotlines for Location */}
        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Heat Crisis &amp; Health Helplines ({weather.country})
              </h3>
              <p className="text-xs text-white/40 font-medium">Non-emergency clinical triage &amp; shelter info</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Health Advisory &amp; Heat Helpline</span>
                <span className="text-white/60">{regionalInfo?.heatHotline || 'Contact Local Health Services'}</span>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-300 font-bold text-[11px]">
                24/7 Available
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Emergency Guidelines ({weather.country})</span>
                <span className="text-white/60 text-[11px] leading-relaxed block mt-0.5">
                  {regionalInfo?.guidelines || 'Dial 911 / 112 for severe heat cramps or fainting.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Local Emergency Rooms & Cooling Centers Finder */}
        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Find Nearby Facilities in {weather.city}</h3>
              <p className="text-xs text-white/40 font-medium">Find nearest ERs, Urgent Care, and Cooling Centers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={`https://www.google.com/maps/search/emergency+room+hospital+near+${encodeURIComponent(weather.city)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <Hospital className="w-4 h-4 text-sky-400" />
                <span>Nearest Hospitals</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white" />
            </a>

            <a
              href={`https://www.google.com/maps/search/cooling+center+or+public+library+near+${encodeURIComponent(weather.city)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" />
                <span>Cooling Centers</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white" />
            </a>

            <a
              href={`https://www.google.com/maps/search/urgent+care+near+${encodeURIComponent(weather.city)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-400" />
                <span>Urgent Care Clinics</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white" />
            </a>

            <button
              onClick={generateSmsSos}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-between transition-all text-left group"
            >
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-red-400" />
                <span>{smsCopied ? 'SOS Text Copied!' : 'Copy SOS Location SMS'}</span>
              </div>
              <Share2 className="w-3.5 h-3.5 text-white/40 group-hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. PERSONAL IN CASE OF EMERGENCY (ICE) CONTACT LIST */}
      <div className="bg-white/5 rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Personal ICE (In Case of Emergency) Contacts
              </h3>
              <p className="text-xs text-white/40 font-medium">
                Family members, caregivers, or colleagues to notify if you feel unwell
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingContact(!isAddingContact)}
            className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-[0_0_10px_rgba(249,115,22,0.4)] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Add Contact Form */}
        {isAddingContact && (
          <form onSubmit={addPersonalContact} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Full Name (e.g. Sarah Connor)"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number (e.g. +1 555-0192)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                required
              />
              <input
                type="text"
                placeholder="Relationship (e.g. Spouse / Friend)"
                value={newContactRelation}
                onChange={(e) => setNewContactRelation(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingContact(false)}
                className="px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-400 text-black rounded-xl shadow-[0_0_10px_rgba(249,115,22,0.4)] transition-all"
              >
                Save Contact
              </button>
            </div>
          </form>
        )}

        {/* Contacts List */}
        <div className="divide-y divide-white/10">
          {personalContacts.map((contact) => (
            <div key={contact.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-white text-sm block">{contact.name}</span>
                <span className="text-white/50 font-medium">{contact.relationship} • {contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold flex items-center gap-1 border border-emerald-500/30 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <button
                  onClick={() => removeContact(contact.id)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
