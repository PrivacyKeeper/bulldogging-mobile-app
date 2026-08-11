// Expo app config. Values that differ per build environment come from
// EXPO_PUBLIC_* env vars so a fresh clone runs without editing this file.
module.exports = {
  expo: {
    name: "Bulldogging",
    slug: "bulldogging",
    scheme: "bulldogging",
    version: '0.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    splash: {
      resizeMode: 'contain',
      backgroundColor: "#0e1319",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "pro.bulldogging.app",
      infoPlist: {
        NSCameraUsageDescription: 'Record your runs so Bulldogging can analyse them.',
        NSMicrophoneUsageDescription: 'Capture audio alongside your run video.',
        NSPhotoLibraryUsageDescription: 'Pick a run video to analyse.',
      },
    },
    android: {
      package: "pro.bulldogging.app",
      adaptiveIcon: {
        backgroundColor: "#0e1319",
      },
      edgeToEdgeEnabled: true,
    },
    web: { bundler: 'metro', output: 'static' },
    plugins: ['expo-router', 'expo-video'],
    experiments: { typedRoutes: true },
    extra: {
      domain: "bulldogging.pro",
      eventType: "steerwrestling",
    },
  },
};
