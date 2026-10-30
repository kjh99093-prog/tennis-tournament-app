import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISS_KEY = 'atoni_install_prompt_dismissed_at';
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;

export const InstallPromptBanner: React.FC = () => {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    if (standalone) return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_FOR_MS) return;

    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);
    setVisible(true);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const install = async () => {
    if (!promptEvent || installing) {
      window.location.href = '/install';
      return;
    }
    setInstalling(true);
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') setVisible(false);
      setPromptEvent(null);
    } finally {
      setInstalling(false);
    }
  };

  if (!visible) return null;

  return (
    <aside className="mx-3 mt-3 rounded-2xl border border-[#53665D] bg-[#20352F] p-3.5 sm:mx-5 md:mx-6" aria-label="Install ATONI">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#151F24] text-[#D5FA63]">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#F3F5F0]">Install ATONI</p>
          <p className="mt-0.5 text-xs leading-5 text-[#B9C7C0]">
            {isIOS
              ? 'Add ATONI to your Home Screen for quick access.'
              : 'Keep your tournaments one tap away on your phone.'}
          </p>
        </div>
        <button
          type="button"
          onClick={install}
          disabled={installing}
          className="shrink-0 rounded-xl bg-[#D5FA63] px-3 py-2 text-xs font-extrabold text-[#151F24] disabled:opacity-60"
        >
          {promptEvent ? (installing ? 'Opening…' : 'Install') : 'How to'}
        </button>
        <button type="button" onClick={dismiss} aria-label="Dismiss install suggestion" className="shrink-0 rounded-lg p-1.5 text-[#AAB9B3] hover:bg-[#293B35]">
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
