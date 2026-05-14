# 🎬 Movie Streaming Platform - Multi-Platform với AI Integration

Hệ thống xem phim trực tuyến đa nền tảng với khả năng đồng bộ tiến độ xem và gợi ý phim thông minh sử dụng AI.

## 📋 Tính năng chính

### Core Features
- ✅ **HLS Adaptive Streaming**: Tự động điều chỉnh chất lượng video theo băng thông
- ✅ **Cross-Platform Sync**: Đồng bộ tiến độ xem giữa Web và Android
- ✅ **AI Recommendations**: Gợi ý phim thông minh dựa trên Collaborative Filtering
- ✅ **Video Transcoding**: Tự động xử lý video thành nhiều chất lượng (1080p, 720p, 480p, 360p)
- ✅ **User Authentication**: JWT-based authentication với Spring Security
- ✅ **Admin Dashboard**: Quản lý phim, upload video, theo dõi analytics

### Technical Highlights
- **FFmpeg Integration**: Video processing pipeline chuyên nghiệp
- **Microservices Architecture**: Backend và AI service tách biệt độc lập
- **Docker Deployment**: Containerization hoàn chỉnh với Docker Compose

---

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────┐          ┌─────────────┐
│   Web App   │          │ Android App │
│   (React)   │          │  (Kotlin)   │
└──────┬──────┘          └──────┬──────┘
       │                        │
       └────────────┬───────────┘
                    │
             ┌──────▼──────┐
             │   Backend   │
             │ Spring Boot │
             └──────┬──────┘
                    │
       ┌────────────┴────────────┐
       │                         │
┌──────▼──────┐         ┌────────▼────────┐
│   MySQL     │         │   AI Service    │
│  Database   │         │ (Python/FastAPI) │
└─────────────┘         └─────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2**
- **Spring Security** + **JWT**
- **Spring Data JPA** + **Hibernate**
- **MySQL 8.0**
- **FFmpeg** (Video processing)

### Frontend (Web)
- **React 18**
- **Video.js** (HLS player)
- **Axios** (HTTP client)

### Mobile (Android)
- **Kotlin**
- **ExoPlayer** (HLS streaming)
- **Retrofit** (API client)
- **MVVM Architecture**
- **Glide** (Image loading)

### AI Service
- **Python 3.11**
- **FastAPI**
- **Pandas** + **NumPy**
- **Scikit-learn** (Collaborative Filtering)
- **SQLAlchemy**

### DevOps
- **Docker** + **Docker Compose**
- **Git** + **GitHub**

---

## 📦 Cấu trúc Project

```
MovieFilm/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/movieplatform/
│   │       ├── entity/         # JPA Entities
│   │       ├── repository/     # Data repositories
│   │       ├── service/        # Business logic
│   │       ├── controller/     # REST controllers
│   │       └── config/         # Configuration
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
│
├── mobile/                     # Android App (Kotlin)
│   ├── app/
│   │   ├── src/main/java/
│   │   │   └── com/movieplatform/mobile/
│   │   └── build.gradle
│   └── settings.gradle
│
├── ai-service/                 # Python AI Service
│   ├── app/
│   │   ├── main.py             # FastAPI app
│   │   ├── recommender.py      # ML algorithm
│   │   └── database.py         # DB connection
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/                   # Database scripts
│   └── schema.sql              # MySQL schema
│
├── docker-compose.yml          # Docker orchestration
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

Cài đặt các tools sau:
- **Java JDK 17+** ([Download](https://adoptium.net/))
- **Node.js 20+** ([Download](https://nodejs.org/))
- **Python 3.11+** ([Download](https://www.python.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **MySQL 8.0** (hoặc dùng Docker)
- **FFmpeg** ([Download](https://ffmpeg.org/download.html))
- **Android Studio** (cho mobile development)

### Option 1: Chạy với Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/NhsPhu/MovieFilm.git
cd MovieFilm

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Access services:
# - Backend API: http://localhost:8080/api
# - Swagger UI: http://localhost:8080/api/swagger-ui.html
# - Frontend:   http://localhost:3000
# - AI Service: http://localhost:8001
```

### Option 2: Chạy Manual (Development)

#### 1. Setup Database

```bash
mysql -u root -p < database/schema.sql
```

#### 2. Backend (Spring Boot)

```bash
cd backend
mvn clean install
mvn spring-boot:run
# Backend sẽ chạy tại: http://localhost:8080
```

#### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
# Frontend sẽ chạy tại: http://localhost:3000
```

#### 4. AI Service (Python)

```bash
cd ai-service
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Tạo file .env từ template
cp .env.example .env       # Linux/Mac
copy .env.example .env     # Windows

uvicorn app.main:app --reload --port 8001
# AI Service sẽ chạy tại: http://localhost:8001
```

#### 5. Mobile (Android)

```bash
# Mở folder mobile/ bằng Android Studio
# Sync Gradle → Build → Run trên emulator hoặc thiết bị thật
```

---

## 📖 API Documentation

Sau khi start Backend, truy cập Swagger UI:
```
http://localhost:8080/api/swagger-ui.html
```

### Một số endpoints quan trọng:

```
POST   /api/auth/register          # Đăng ký user
POST   /api/auth/login             # Đăng nhập
GET    /api/auth/me                # Thông tin user hiện tại

GET    /api/movies                 # Danh sách phim (pagination)
GET    /api/movies/{id}            # Chi tiết phim
POST   /api/admin/movies           # Upload phim (Admin only)

POST   /api/history                # Cập nhật tiến độ xem
GET    /api/history                # Lịch sử xem của user
GET    /api/history/movie/{id}     # Tiến độ xem phim cụ thể

GET    /api/stream/{movieId}/master.m3u8      # HLS master playlist
GET    /api/stream/{movieId}/{quality}/...    # HLS segments

GET    /recommend/{user_id}?limit=10          # AI gợi ý phim
```

---

## 🎥 Video Processing Flow

### Upload & Transcoding Process

1. **Admin Upload** file video (VD: `movie.mp4`)
2. **Backend** lưu metadata vào database, status = `PROCESSING`
3. **FFmpeg Worker** xử lý:
   - Transcode thành 4 chất lượng: 1080p, 720p, 480p, 360p
   - Cắt thành các segments 10 giây (.ts files)
   - Tạo playlists (.m3u8 files)
4. **Storage** lưu tất cả vào `storage/movies/{movieId}/`
5. **Backend** cập nhật status = `READY`

### Streaming Flow

1. **Client** request `GET /api/stream/{movieId}/master.m3u8`
2. **Player** phân tích playlist, chọn quality phù hợp với băng thông
3. **Player** download từng segment .ts tuần tự
4. **Adaptive streaming**: Tự động switch quality khi network thay đổi

---

## 🔄 Cross-Platform Sync Mechanism

```
User trên Web:
1. Xem phim A đến giây 1500
2. Pause / Close browser
3. Frontend gọi: POST /api/history {movieId: 1, currentTime: 1500, device: "WEB"}

Database (watch_history table):
├── user_id: 123
├── movie_id: 1
├── current_time_sec: 1500
├── device_type: WEB
└── last_watched_at: 2026-01-06 00:00:00

User trên Android:
1. Mở app, chọn phim A
2. App gọi: GET /api/history/movie/1
3. Server trả về: {currentTime: 1500}
4. ExoPlayer auto seek đến giây 1500
```

---

## 🤖 AI Recommendation Algorithm

### Collaborative Filtering với Implicit Ratings

```python
# Implicit rating calculation
rating = {
    "finished":      5,  # points
    "watched > 70%": 4,
    "watched > 40%": 3,
    "else":          2,
}

# Algorithm:
# 1. Build user-movie interaction matrix
# 2. Calculate user similarity (cosine similarity)
# 3. Find top 5 similar users
# 4. Recommend movies they watched but current user hasn't
# 5. Fallback to popular movies for new users (cold start)
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test       # Unit tests
mvn verify     # Integration tests
```

### Frontend Tests
```bash
cd frontend
npm test
npm run build
```

### Android Tests
```bash
cd mobile
./gradlew test
./gradlew connectedAndroidTest
```

---

## 🐛 Troubleshooting

### FFmpeg not found
```bash
# Windows
choco install ffmpeg

# Linux
sudo apt-get install ffmpeg

# Mac
brew install ffmpeg
```

### Port already in use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

### Docker MySQL connection refused
```bash
docker-compose logs mysql
docker-compose ps
```

---

## 👥 Contributors

- **Developer**: Nguyễn Hồ Sỹ Phú
- **Tech Stack**: Java Spring Boot · React · Kotlin · Python FastAPI · Docker
- **Project Type**: Personal Project

---

## 📄 License

MIT License

---

## 🎓 Về Dự án

Đây là dự án cá nhân được xây dựng để thực hành và áp dụng các công nghệ:
- ✅ Backend API với Java Spring Boot
- ✅ Kiến trúc Microservices
- ✅ Video streaming technology (HLS / FFmpeg)
- ✅ Machine Learning integration (Collaborative Filtering)
- ✅ Mobile development (Kotlin / Android)
- ✅ DevOps practices (Docker, Docker Compose)

---

## 📞 Liên hệ

- Email: nguyenhosyphu@gmail.com
- GitHub: [github.com/NhsPhu](https://github.com/NhsPhu)

---

**Happy Coding! 🚀**
