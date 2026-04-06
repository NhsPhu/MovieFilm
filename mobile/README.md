# RimCinema — Android Native App 📱

Ứng dụng Android native cho nền tảng xem phim RimCinema, sử dụng **Kotlin + Jetpack Compose**.

## Cấu Trúc

```
mobile/
├── app/src/main/java/com/rimcinema/
│   ├── MainActivity.kt
│   ├── data/
│   │   ├── api/          (ApiClient, AuthApi, MovieApi)
│   │   └── model/        (AuthModels, MovieModels, RatingModels)
│   ├── ui/
│   │   ├── theme/        (Material 3 Dark Theme)
│   │   ├── navigation/   (AppNavigation + BottomNavBar)
│   │   └── screens/      (Login, Home, Search, Profile, MovieDetail, Watch)
│   ├── viewmodel/        (Auth, Home, MovieDetail, Watch)
│   └── util/             (SessionManager)
├── app/build.gradle
├── build.gradle
└── settings.gradle
```

## Mở bằng Android Studio

1. **File → Open** → chọn thư mục `mobile/`
2. Chờ Gradle sync hoàn tất
3. Chạy trên **emulator API 26+** hoặc thiết bị thật

## Cấu hình Backend URL

Mở `data/api/ApiClient.kt` → sửa `BASE_URL`:
```kotlin
// Emulator:
private const val BASE_URL = "http://10.0.2.2:8080/api/"
// Thiết bị thật (cùng WiFi):
private const val BASE_URL = "http://<IP_MÁY_TÍNH>:8080/api/"
```

## Tech Stack

| Layer | Technology |
|---|---|
| UI | Jetpack Compose + Material 3 |
| Network | Retrofit2 + OkHttp |
| Video | Media3 ExoPlayer (HLS) |
| Images | Coil |
| State | ViewModel + StateFlow |
| Auth | SharedPreferences + JWT |
