# ProGuard Rules for React Native Android (safe for iOS too)

# --- React Native core ---
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.soloader.** { *; }
-keep class com.facebook.yoga.** { *; }

# Keep MainApplication and MainActivity (adjust your package)
-keep class com.sumitdev315.tsbplapp.MainApplication { *; }
-keep class com.sumitdev315.tsbplapp.MainActivity { *; }

# --- React Native Reanimated ---
-keep class com.swmansion.reanimated.** { *; }

# --- React Native Gesture Handler ---
-keep class com.swmansion.gesturehandler.** { *; }

# --- React Native Camera / Expo Camera / Image Picker ---
-keep class org.reactnative.camera.** { *; }
-keep class com.google.android.cameraview.** { *; }
-keep class com.facebook.react.modules.camera.** { *; }

# --- React Native Location & Geolocation ---
-keep class com.facebook.react.modules.location.** { *; }
-keep class com.google.android.gms.location.** { *; }
-keep class com.google.android.gms.common.api.GoogleApiClient { *; }
-keep class android.location.** { *; }

# --- React Navigation (safe) ---
-keep class com.facebook.react.modules.core.DeviceEventManagerModule$RCTDeviceEventEmitter { *; }

# --- Prevent "Tried to remove non-existent frame callback" and SurfaceMountingManager errors ---
-keep class com.facebook.react.uimanager.** { *; }

# --- WorkManager (if used by Expo Camera or Location) ---
-keep class androidx.work.** { *; }
-dontwarn androidx.work.impl.background.firebase.FirebaseJobService

# --- AsyncStorage or SecureStore (if used) ---
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keep class expo.modules.securestore.** { *; }

# --- Expo Modules (if using Expo SDK) ---
-keep class expo.modules.** { *; }

# --- Misc: Keep native modules safe ---
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.modules.** { *; }

# Optional: Firebase (if used)
# -keep class com.google.firebase.** { *; }

# Optional: Glide or image libraries
# -keep class com.bumptech.glide.** { *; }

# Avoid warnings
-dontwarn com.facebook.react.**
-dontwarn com.google.android.**
-dontwarn com.swmansion.**
-dontwarn expo.modules.**

# Keep class names for debugging (optional)
-renamesourcefileattribute SourceFile
-keepattributes SourceFile,LineNumberTable
# --- Required for Expo Camera and Barcode Scanner ---
-keep class com.google.mlkit.** { *; }
-keep class com.google.zxing.** { *; }
-keep class androidx.camera.core.** { *; }
-keep class androidx.camera.lifecycle.** { *; }
-keep class androidx.camera.view.** { *; }
-keep class androidx.camera.camera2.** { *; }

# Keep barcode result decoding intact
-keep class expo.modules.camera.** { *; }
-keep class expo.modules.barcodescanner.** { *; }

# Prevent MLKit code from being stripped
-keep class com.google.android.odml.** { *; }

# Keep internal camera interfaces
-keep class org.webrtc.** { *; } # If you use video/scanning

# Optional: Avoid runtime crash related to missing Kotlin metadata
-keep class kotlin.Metadata { *; }
