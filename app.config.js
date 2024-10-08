import 'dotenv/config';

export default {
  expo: {
    name: "ChatApp",
    slug: "ChatApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.chatapp",
      buildNumber: "1.0.0",
      infoPlist: {
        UIBackgroundModes: ["fetch", "remote-notification"],
        NSUserTrackingUsageDescription: "This identifier will be used to deliver personalized notifications.",
        NSPhotoLibraryUsageDescription: "The app accesses your photos to let you share them with your friends."  // iOS Photo Library permission
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.yourcompany.chatapp",
      versionCode: 1,
      permissions: ["NOTIFICATIONS", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"],  // Android permissions for accessing photos
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
    
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you share them with your friends."  // Image picker permission message
        }
      ]
    ],
    extra: {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      eas: {
        projectId:  "96f0dfbe-64e7-433b-9df2-25c67c945afa"
      }
    }
  }
}
