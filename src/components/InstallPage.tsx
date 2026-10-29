import React, { useEffect, useState } from 'react';
import { Download, Share, Smartphone, Trophy, CheckCircle2, ArrowUpRight } from 'lucide-react';

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }> };

export const InstallPage: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') setIsInstalled(true);
    setInstallPrompt(null);
  };

  const openApp = () => { window.location.href = '/'; };

  return (
    <main className="min-h-[100dvh] bg-[#151F24] text-[#F3F5F0] flex items-center justify-center p-5">
      <section className="w-full max-w-md rounded-3xl border border-[#354740] bg-[#20352F] p-6 sm:p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#151F24] border border-[#354740]">
          <Trophy className="h-10 w-10 text-[#D5FA63]" />
        </div>
        <p className="text-xs font-bold tracking-[0.22em] text-[#D5FA63]">ATONI</p>
        <h1 className="mt-2 text-2xl font-extrabold">Your Tennis Tournament Tracker</h1>
        <p className="mt-3 text-sm leading-6 text-[#B9C7C0]">Install ATONI on your phone for quick access to tournaments, saved events, and match notes.</p>

        {isInstalled ? (
          <button onClick={openApp} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D5FA63] px-5 py-4 font-bold text-[#151F24]">
            <CheckCircle2 className="h-5 w-5" /> Open ATONI
          </button>
        ) : installPrompt ? (
          <button onClick={install} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D5FA63] px-5 py-4 font-bold text-[#151F24]">
            <Download className="h-5 w-5" /> Install ATONI
          </button>
        ) : isIOS ? (
          <div className="mt-7 rounded-2xl border border-[#53665D] bg-[#151F24] p-4 text-left">
            <h2 className="font-bold text-[#D5FA63]">Add ATONI to your Home Screen</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[#F3F5F0]">
              <li>Open this page in <strong>Safari</strong>.</li>
              <li>Tap the <strong>Share</strong> icon <Share className="inline h-4 w-4 align-text-bottom" />.</li>
              <li>Choose <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong>.</li>
            </ol>
            <button onClick={() => setShowIOSSteps(!showIOSSteps)} className="mt-3 text-sm font-semibold text-[#D5FA63] underline">
              {showIOSSteps ? 'Hide tip' : 'Can’t find Add to Home Screen?'}
            </button>
            {showIOSSteps && <p className="mt-2 text-sm leading-5 text-[#B9C7C0]">If you opened this from another app, use its Share or More menu to open the page in Safari first. The iPhone does not support an automatic website-install popup.</p>}
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-[#53665D] bg-[#151F24] p-4 text-left">
            <h2 className="font-bold text-[#D5FA63]">Install from your browser</h2>
            <p className="mt-2 text-sm leading-6 text-[#F3F5F0]">Open this link in <strong>Chrome</strong>, then use the browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
            <p className="mt-2 text-xs leading-5 text-[#B9C7C0]">The direct install prompt appears only when your browser supports it and ATONI meets the installation requirements.</p>
          </div>
        )}

        <button onClick={openApp} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#53665D] px-5 py-3 font-semibold text-[#F3F5F0] hover:bg-[#293B35]">
          <ArrowUpRight className="h-4 w-4" /> Continue to ATONI
        </button>
        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#8FA198]"><Smartphone className="h-4 w-4" /> No app store required</p>
      </section>
    </main>
  );
};
