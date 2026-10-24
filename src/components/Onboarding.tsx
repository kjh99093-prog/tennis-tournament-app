import React, { useState } from 'react';
import { PlayerCategory, PlayerProfile, SurfaceType } from '../types';

interface Props { onComplete: () => void; }

const blankProfile = (category: PlayerCategory, name: string): PlayerProfile => ({
  name,
  category,
  ageGroup: '',
  utrRating: '',
  nationalRating: '',
  tennisCanadaPin: '',
  ustaId: '',
  homeCity: '',
  homeProvinceState: '',
  homeCountry: 'Canada',
  preferredSurfaces: [],
  maxTravelKm: 100,
  playStyle: '',
  racketModel: ''
});

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<PlayerCategory>('junior');
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [utrRating, setUtrRating] = useState('');
  const [nationalRating, setNationalRating] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [homeProvinceState, setHomeProvinceState] = useState('');
  const [homeCountry, setHomeCountry] = useState<'Canada' | 'United States'>('Canada');
  const [surfaces, setSurfaces] = useState<SurfaceType[]>([]);
  const [maxTravelKm, setMaxTravelKm] = useState('100');

  const finish = () => {
    const profile: PlayerProfile = {
      ...blankProfile(category, name.trim()),
      ageGroup, utrRating, nationalRating, homeCity: homeCity.trim(),
      homeProvinceState: homeProvinceState.trim(), homeCountry,
      preferredSurfaces: surfaces, maxTravelKm: Number(maxTravelKm) || 100
    };
    localStorage.setItem('aura_tennis_category', category);
    localStorage.setItem('aura_tennis_profile', JSON.stringify(profile));
    localStorage.setItem('aura_tennis_setup_complete', 'true');
    onComplete();
  };

  const toggleSurface = (surface: SurfaceType) => setSurfaces((current) =>
    current.includes(surface) ? current.filter((item) => item !== surface) : [...current, surface]
  );

  return (
    <main className="min-h-screen bg-[#151F24] text-[#F3F5F0] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-[#20352F] border border-[#354740] flex items-center justify-center text-[#D5FA63] text-xl">🎾</div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#D5FA63] font-bold">AuraTennis</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold">{step === 0 ? 'Let’s set up your profile' : step === 1 ? 'What should we call you?' : 'Personalize your recommendations'}</h1>
          <p className="mt-2 text-sm text-[#AAB9B3]">Step {step + 1} of 3 · {step === 2 ? 'Optional details' : 'A quick setup'}</p>
        </div>

        {step === 0 && <section className="grid grid-cols-2 gap-3">
          {(['junior', 'adult'] as PlayerCategory[]).map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-2xl border p-5 text-left transition-colors ${category === item ? 'bg-[#20352F] border-[#D5FA63]' : 'bg-[#182320] border-[#354740]'}`}>
              <span className="text-2xl">{item === 'junior' ? '🎾' : '🏆'}</span>
              <span className="mt-3 block text-lg font-extrabold">{item === 'junior' ? 'Junior' : 'Adult'}</span>
              <span className="mt-1 block text-xs text-[#AAB9B3]">{item === 'junior' ? 'Youth tournaments' : 'Adult tournaments'}</span>
            </button>
          ))}
        </section>}

        {step === 1 && <section className="space-y-2">
          <label htmlFor="setup-name" className="text-sm font-semibold">Your name <span className="text-[#D5FA63]">*</span></label>
          <input id="setup-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) setStep(2); }} placeholder="Enter your name" maxLength={80} className="w-full rounded-xl bg-[#20352F] border border-[#354740] focus:border-[#D5FA63] px-4 py-3 outline-none" />
          <p className="text-xs text-[#AAB9B3]">This name will appear in your welcome message.</p>
        </section>}

        {step === 2 && <section className="space-y-4">
          <p className="text-sm text-[#AAB9B3]">You can skip everything here and add details later in My Profile.</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-[#AAB9B3]">Age group / division
              <input value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} placeholder={category === 'junior' ? 'e.g. U14' : 'e.g. Open'} className="mt-1 w-full rounded-lg bg-[#20352F] border border-[#354740] px-3 py-2 text-sm text-[#F3F5F0]" />
            </label>
            <label className="text-xs text-[#AAB9B3]">UTR rating
              <input value={utrRating} onChange={(e) => setUtrRating(e.target.value)} placeholder="Optional" className="mt-1 w-full rounded-lg bg-[#20352F] border border-[#354740] px-3 py-2 text-sm text-[#F3F5F0]" />
            </label>
            <label className="text-xs text-[#AAB9B3]">City
              <input value={homeCity} onChange={(e) => setHomeCity(e.target.value)} placeholder="e.g. Vancouver" className="mt-1 w-full rounded-lg bg-[#20352F] border border-[#354740] px-3 py-2 text-sm text-[#F3F5F0]" />
            </label>
            <label className="text-xs text-[#AAB9B3]">Province / State
              <input value={homeProvinceState} onChange={(e) => setHomeProvinceState(e.target.value)} placeholder="e.g. BC" className="mt-1 w-full rounded-lg bg-[#20352F] border border-[#354740] px-3 py-2 text-sm text-[#F3F5F0]" />
            </label>
            <label className="text-xs text-[#AAB9B3] col-span-2">National rating / NTRP
              <input value={nationalRating} onChange={(e) => setNationalRating(e.target.value)} placeholder="Optional" className="mt-1 w-full rounded-lg bg-[#20352F] border border-[#354740] px-3 py-2 text-sm text-[#F3F5F0]" />
            </label>
          </div>
          <label className="block text-xs text-[#AAB9B3]">Country
            <select value={homeCountry} onChange={(e) => setHomeCountry(e.target.value as 'Canada' | 'United States')} className="mt-1 w-full rounded-lg bg-[#20352F] border border-[#354740] px-3 py-2 text-sm text-[#F3F5F0]">
              <option>Canada</option><option>United States</option>
            </select>
          </label>
          <div>
            <p className="text-xs font-semibold text-[#AAB9B3] mb-2">Preferred court surfaces</p>
            <div className="flex flex-wrap gap-2">
              {(['Indoor Hard', 'Hard', 'Clay', 'Grass', 'Carpet'] as SurfaceType[]).map((surface) => <button key={surface} type="button" onClick={() => toggleSurface(surface)} className={`rounded-full border px-3 py-1.5 text-xs ${surfaces.includes(surface) ? 'bg-[#D5FA63] text-[#151F24] border-[#D5FA63]' : 'border-[#354740] text-[#AAB9B3]'}`}>{surface}</button>)}
            </div>
          </div>
          <label className="block text-xs text-[#AAB9B3]">Maximum travel distance (km)
            <input type="number" min="0" max="5000" value={maxTravelKm} onChange={(e) => setMaxTravelKm(e.target.value)} className="mt-1 w-full rounded-lg bg-[#20352F] border border-[#354740] px-3 py-2 text-sm text-[#F3F5F0]" />
          </label>
        </section>}

        <div className="flex gap-3">
          {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="rounded-xl border border-[#354740] px-5 py-3 text-sm font-bold text-[#AAB9B3]">Back</button>}
          {step < 2 ? <button type="button" disabled={step === 1 && !name.trim()} onClick={() => setStep(step + 1)} className="flex-1 rounded-xl bg-[#D5FA63] px-5 py-3 text-sm font-extrabold text-[#151F24] disabled:opacity-40">Continue</button>
            : <><button type="button" onClick={finish} className="rounded-xl border border-[#354740] px-4 py-3 text-sm font-bold text-[#AAB9B3]">Skip</button><button type="button" onClick={finish} className="flex-1 rounded-xl bg-[#D5FA63] px-5 py-3 text-sm font-extrabold text-[#151F24]">Create profile</button></>}
        </div>
      </div>
    </main>
  );
};
