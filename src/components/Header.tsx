
import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Trophy, UserCheck, Sun, Moon } from 'lucide-react';

export const Header: React.FC = () => {
  const { category, setCategory } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-[#151F24]/95 backdrop-blur-md border-b border-[#354740] px-3 sm:px-4 py-2 transition-colors">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">

        {/* Brand Logo & Title */}
        <div className="flex items-center justify-between gap-2 min-w-0 w-full sm:w-auto">
          <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#20352F] border border-[#354740] flex items-center justify-center text-[#D5FA63] shadow-xs shrink-0">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#F3F5F0] truncate">
                  {t('app_title')}
                </span>

                <span className="hidden md:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#20352F] text-[#AAB9B3] border border-[#354740] shrink-0">
                  {t('app_subtitle')}
                </span>
              </div>

              <p className="text-[10px] sm:text-[11px] text-[#AAB9B3] truncate leading-tight">
                {category === 'junior'
                  ? t('category_junior')
                  : t('category_adult')} • {t('fit_score')}
              </p>
            </div>
          </div>

          {/* Mobile Language & Theme Controls */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            <div
              className="flex items-center bg-[#20352F] p-0.5 rounded-lg border border-[#354740]"
              role="group"
              aria-label={t('language_toggle_label')}
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-[#D5FA63] text-[#151F24] shadow-xs font-black'
                    : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
                }`}
                aria-pressed={language === 'en'}
              >
                EN
              </button>

              <button
                type="button"
                onClick={() => setLanguage('zh-CN')}
                className={`px-1.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                  language === 'zh-CN'
                    ? 'bg-[#D5FA63] text-[#151F24] shadow-xs font-black'
                    : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
                }`}
                aria-pressed={language === 'zh-CN'}
              >
                中文
              </button>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-7 h-7 rounded-lg bg-[#20352F] hover:bg-[#293B35] border border-[#354740] text-[#D5FA63] transition-all flex items-center justify-center shrink-0"
              title={`${t('theme_toggle')}: ${theme === 'dark' ? t('theme_dark') : t('theme_light')}`}
              aria-label={`${t('theme_toggle')}: ${theme === 'dark' ? t('theme_dark') : t('theme_light')}`}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-[#D5FA63]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#151F24]" />
              )}
            </button>
          </div>
        </div>

        {/* Junior / Adult Selector & Desktop Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 min-w-0">
          <div
            className="grid grid-cols-2 sm:flex items-center bg-[#20352F] p-0.5 rounded-lg border border-[#354740] w-full sm:w-auto shrink-0"
            role="group"
            aria-label={t('category_selector_label')}
          >
            <button
              type="button"
              onClick={() => setCategory('junior')}
              className={`px-3 py-1.5 sm:py-1 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                category === 'junior'
                  ? 'bg-[#D5FA63] text-[#151F24] shadow-xs'
                  : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
              <span>{t('category_junior')}</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('adult')}
              className={`px-3 py-1.5 sm:py-1 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                category === 'adult'
                  ? 'bg-[#D5FA63] text-[#151F24] shadow-xs'
                  : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t('category_adult')}</span>
            </button>
          </div>

          {/* Desktop Language & Theme Controls */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <div
              className="flex items-center bg-[#20352F] p-0.5 rounded-lg border border-[#354740]"
              role="group"
              aria-label={t('language_toggle_label')}
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-[#D5FA63] text-[#151F24] shadow-xs font-black'
                    : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
                }`}
                aria-pressed={language === 'en'}
              >
                EN
              </button>

              <button
                type="button"
                onClick={() => setLanguage('zh-CN')}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                  language === 'zh-CN'
                    ? 'bg-[#D5FA63] text-[#151F24] shadow-xs font-black'
                    : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
                }`}
                aria-pressed={language === 'zh-CN'}
              >
                中文
              </button>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg bg-[#20352F] hover:bg-[#293B35] border border-[#354740] text-[#D5FA63] transition-all flex items-center justify-center shrink-0"
              title={`${t('theme_toggle')}: ${theme === 'dark' ? t('theme_dark') : t('theme_light')}`}
              aria-label={`${t('theme_toggle')}: ${theme === 'dark' ? t('theme_dark') : t('theme_light')}`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#D5FA63]" />
              ) : (
                <Moon className="w-4 h-4 text-[#151F24]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
