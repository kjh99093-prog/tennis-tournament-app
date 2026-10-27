import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { DataSourcesSection } from './DataSourcesSection';
import { SurfaceType } from '../types';
import {
  User,
  Database,
  Sliders,
  Check,
  Save,
  MapPin,
  Trophy,
  Shield,
  Activity,
  Globe,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';

export const ProfileView: React.FC<{ onLogout: () => Promise<void> | void }> = ({ onLogout }) => {
  const { playerProfile, updatePlayerProfile, category, setCategory } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [activeSection, setActiveSection] = useState<'profile' | 'sources' | 'settings'>('sources');
  const [formData, setFormData] = useState({ ...playerProfile });
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlayerProfile(formData);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const toggleSurface = (surf: SurfaceType) => {
    const current = formData.preferredSurfaces || [];
    if (current.includes(surf)) {
      setFormData({
        ...formData,
        preferredSurfaces: current.filter((s) => s !== surf)
      });
    } else {
      setFormData({
        ...formData,
        preferredSurfaces: [...current, surf]
      });
    }
  };

  const allSurfaces: SurfaceType[] = ['Indoor Hard', 'Hard', 'Clay', 'Grass'];

  return (
    <div className="space-y-4 pb-20">
      {/* View Header */}
      <div>
        <h1 className="text-lg md:text-xl font-extrabold text-[#F3F5F0]">
          {t('profile_title')}
        </h1>
        <p className="text-xs text-[#AAB9B3] mt-0.5">
          {t('profile_subtitle')}
        </p>
      </div>

      {/* Section Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#20352F] rounded-xl border border-[#354740]">
        <button
          type="button"
          onClick={() => setActiveSection('sources')}
          className={`py-2 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 min-w-0 leading-tight ${
            activeSection === 'sources'
              ? 'bg-[#D5FA63] text-[#151F24] shadow-xs'
              : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
          }`}
        >
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-normal text-center">{t('tab_sources_short')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('profile')}
          className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 min-w-0 ${
            activeSection === 'profile'
              ? 'bg-[#D5FA63] text-[#151F24] shadow-xs'
              : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
          }`}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t('tab_profile_short')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('settings')}
          className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 min-w-0 ${
            activeSection === 'settings'
              ? 'bg-[#D5FA63] text-[#151F24] shadow-xs'
              : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t('tab_settings_short')}</span>
        </button>
      </div>

      {/* 1. Dedicated Data Sources Section */}
      {activeSection === 'sources' && (
        <div className="space-y-4">
          <DataSourcesSection />
        </div>
      )}

      {/* 2. Player Profile Editor */}
      {activeSection === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="bg-[#20352F] border border-[#354740] rounded-2xl p-4 md:p-5 space-y-4">
            <h3 className="font-bold text-sm text-[#F3F5F0] flex items-center gap-2">
              <User className="w-4 h-4 text-[#D5FA63]" />
              <span>{t('profile_title')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[#AAB9B3] font-semibold block">
                  {t('player_name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                />
              </div>

              {/* Age Group / Division */}
              <div className="space-y-1">
                <label className="text-[#AAB9B3] font-semibold block">
                  {t('age_group')}
                </label>
                <input
                  type="text"
                  value={formData.ageGroup}
                  onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                  className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                />
              </div>

              {/* UTR Rating */}
              <div className="space-y-1">
                <label className="text-[#AAB9B3] font-semibold block">
                  {t('utr_rating')}
                </label>
                <input
                  type="text"
                  value={formData.utrRating}
                  onChange={(e) => setFormData({ ...formData, utrRating: e.target.value })}
                  className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                />
              </div>

              {/* National Rating / NTRP */}
              <div className="space-y-1">
                <label className="text-[#AAB9B3] font-semibold block">
                  {t('national_rating')}
                </label>
                <input
                  type="text"
                  value={formData.nationalRating}
                  onChange={(e) => setFormData({ ...formData, nationalRating: e.target.value })}
                  className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                />
              </div>

              {/* Tennis PIN */}
              <div className="space-y-1">
                <label className="text-[#AAB9B3] font-semibold block">
                  {t('tennis_canada_pin')}
                </label>
                <input
                  type="text"
                  value={formData.tennisCanadaPin || ''}
                  onChange={(e) => setFormData({ ...formData, tennisCanadaPin: e.target.value })}
                  placeholder="e.g. BC-2012-9844 / 202688401"
                  className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                />
              </div>

              {/* Home City */}
              <div className="space-y-1">
                <label className="text-[#AAB9B3] font-semibold block">
                  {t('home_city')}
                </label>
                <input
                  type="text"
                  value={formData.homeCity}
                  onChange={(e) => setFormData({ ...formData, homeCity: e.target.value })}
                  className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                />
              </div>

              {/* Province / State */}
              <div className="space-y-1">
                <label className="text-[#AAB9B3] font-semibold block">
                  {t('home_province')}
                </label>
                <input
                  type="text"
                  value={formData.homeProvinceState}
                  onChange={(e) => setFormData({ ...formData, homeProvinceState: e.target.value })}
                  className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                />
              </div>

              {/* Max Travel Radius */}
              <div className="space-y-1">
                <label className="text-[#AAB9B3] font-semibold block">
                  {t('max_travel_distance')}
                </label>
                <input
                  type="number"
                  value={formData.maxTravelKm}
                  onChange={(e) => setFormData({ ...formData, maxTravelKm: Number(e.target.value) })}
                  className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                />
              </div>
            </div>

            {/* Preferred Surfaces */}
            <div className="space-y-2 pt-2">
              <label className="text-xs text-[#AAB9B3] font-semibold block">
                {t('preferred_surfaces')}
              </label>
              <div className="flex flex-wrap gap-2">
                {allSurfaces.map((surf) => {
                  const selected = formData.preferredSurfaces?.includes(surf);
                  return (
                    <button
                      key={surf}
                      type="button"
                      onClick={() => toggleSurface(surf)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                        selected
                          ? 'bg-[#D5FA63] text-[#151F24] border-[#D5FA63]'
                          : 'bg-[#151F24] text-[#AAB9B3] hover:text-[#F3F5F0] border-[#354740]'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 stroke-[3]" />}
                      <span>{surf}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D5FA63] text-[#151F24] font-bold text-xs shadow-md hover:bg-[#cbf74e] transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{t('save_profile_btn')}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Account actions */}
      <section className="rounded-2xl border border-[#4A554E] bg-[#192623] p-4 space-y-2">
        <h3 className="text-sm font-bold text-[#F3F5F0]">Account</h3>
        <p className="text-xs text-[#B7C4BE]">Sign out of your AURA Tennis account on this device.</p>
        <button type="button" onClick={() => setShowLogoutConfirm(true)} className="logout-action flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </section>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4" role="presentation" onClick={() => setShowLogoutConfirm(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title" className="w-full max-w-sm rounded-2xl border border-[#526A5D] bg-[#1C2B28] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#302321] text-[#FFD8D2]"><LogOut className="h-5 w-5" /></div>
            <h3 id="logout-confirm-title" className="mt-3 text-center text-lg font-extrabold text-[#F3F5F0]">Are you sure you want to log out?</h3>
            <p className="mt-2 text-center text-sm leading-5 text-[#B7C4BE]">You can log back in anytime with your email and password.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setShowLogoutConfirm(false)} className="rounded-xl border border-[#526A5D] bg-[#243832] px-3 py-2.5 text-sm font-bold text-[#F3F5F0] hover:bg-[#293F37]">Cancel</button>
              <button type="button" onClick={() => { setShowLogoutConfirm(false); void onLogout(); }} className="rounded-xl bg-[#D5FA63] px-3 py-2.5 text-sm font-extrabold text-[#151F24] hover:bg-[#CBF74E]">Yes, log out</button>
            </div>
          </section>
        </div>
      )}

      {/* 3. Preferences & Settings */}
      {activeSection === 'settings' && (
        <div className="space-y-4">
          <div className="bg-[#20352F] border border-[#354740] rounded-2xl p-4 md:p-5 space-y-4">
            <h3 className="font-bold text-sm text-[#F3F5F0] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D5FA63]" />
              <span>{t('settings_section_title')}</span>
            </h3>

            {/* Language Selector in Settings as well */}
            <div className="p-3.5 rounded-xl bg-[#151F24] border border-[#354740] flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#F3F5F0] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#D5FA63]" />
                  <span>{t('interface_language')}</span>
                </span>
                <p className="text-[11px] text-[#AAB9B3]">
                  EN (English) / 中文 (Simplified Chinese)
                </p>
              </div>

              <div className="flex items-center bg-[#20352F] p-0.5 rounded-lg border border-[#354740]">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    language === 'en'
                      ? 'bg-[#D5FA63] text-[#151F24] shadow-xs'
                      : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('zh-CN')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    language === 'zh-CN'
                      ? 'bg-[#D5FA63] text-[#151F24] shadow-xs'
                      : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
                  }`}
                >
                  简体中文
                </button>
              </div>
            </div>

            {/* Theme Mode: Dark vs Light */}
            <div className="p-3.5 rounded-xl bg-[#151F24] border border-[#354740] flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#F3F5F0] flex items-center gap-1.5">
                  {theme === 'dark' ? (
                    <Moon className="w-3.5 h-3.5 text-[#D5FA63]" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-[#D5FA63]" />
                  )}
                  <span>{t('theme_label')}</span>
                </span>
                <p className="text-[11px] text-[#AAB9B3]">
                  {theme === 'dark' ? t('theme_dark') : t('theme_light')} Mode
                </p>
              </div>

              <div className="flex items-center bg-[#20352F] p-0.5 rounded-lg border border-[#354740]">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                    theme === 'dark'
                      ? 'bg-[#D5FA63] text-[#151F24] shadow-xs'
                      : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  <span>{t('theme_dark')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                    theme === 'light'
                      ? 'bg-[#D5FA63] text-[#151F24] shadow-xs'
                      : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  <span>{t('theme_light')}</span>
                </button>
              </div>
            </div>

            {/* Circuit Mode */}
            <div className="p-3.5 rounded-xl bg-[#151F24] border border-[#354740] flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#F3F5F0]">
                  {t('player_category')}
                </span>
                <p className="text-[11px] text-[#AAB9B3]">
                  {t('category_junior')} vs {t('category_adult')}
                </p>
              </div>

              <div className="flex items-center bg-[#20352F] p-0.5 rounded-lg border border-[#354740]">
                <button
                  type="button"
                  onClick={() => setCategory('junior')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    category === 'junior'
                      ? 'bg-[#D5FA63] text-[#151F24]'
                      : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
                  }`}
                >
                  {t('category_junior')}
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('adult')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    category === 'adult'
                      ? 'bg-[#D5FA63] text-[#151F24]'
                      : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
                  }`}
                >
                  {t('category_adult')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Toast Notification */}
      {showSavedToast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-[#D5FA63] text-[#151F24] px-4 py-2 rounded-xl font-bold text-xs shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{t('profile_saved_toast')}</span>
        </div>
      )}
    </div>
  );
};
