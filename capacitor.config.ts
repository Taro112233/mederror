import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taro.mederror',
  appName: 'mederror',
  webDir: 'public',
  server: {
    url: 'https://mederror.vercel.app',
    cleartext: true,
  },
};

export default config;
