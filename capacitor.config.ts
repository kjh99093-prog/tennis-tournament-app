import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.auratennis.tournamentnavigator',
  appName: 'AURA Tennis',
  webDir: 'dist',
  backgroundColor: '#151F24',
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
