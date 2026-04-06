# Proguard rules for RimCinema

# Retrofit
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.rimcinema.data.model.** { *; }
-keepclassmembers class com.rimcinema.data.model.** { *; }

# Gson
-keep class com.google.gson.** { *; }
-keep class sun.misc.Unsafe { *; }

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
