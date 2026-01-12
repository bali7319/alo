import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alo17.tr',
  appName: 'alo17',
  webDir: 'out',
  server: {
    // Production URL - APK production URL'den yüklenecek
    // Development için yorumu kaldırın ve localhost kullanın:
    // url: 'http://localhost:3000',
    // Production için:
    url: 'https://alo17.tr',
    androidScheme: 'https',
    cleartext: true // HTTP için gerekli (development)
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
    allowMixedContent: true
  },
  ios: {
    scheme: 'alo17',
    contentInset: 'automatic'
  }
};

export default config;
