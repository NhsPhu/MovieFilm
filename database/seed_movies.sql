USE moviedb;

-- Clear previous data
DELETE FROM movie_genres;
DELETE FROM movies;

-- Reset Auto Increment
ALTER TABLE movies AUTO_INCREMENT = 1;

-- 1
INSERT INTO movies (id, title, description, poster_url, backdrop_url, release_year, duration_sec, avg_rating, views_count, status, director, language, age_rating, folder_path)
VALUES (
    1,
    'Inception',
    'Một đạo chích lành nghề, chuyên đánh cắp bí mật của người khác bằng cách thâm nhập vào tiềm thức của họ. Giờ đây anh ta được trao một cơ hội để chuộc lại lỗi lầm bằng một nhiệm vụ tưởng chừng bất khả thi: Cấy ghép một ý tưởng vào tâm trí của mục tiêu.',
    'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    'https://image.tmdb.org/t/p/w1280/s3TBrRGB1inv7jzOuNXPkbBgNeM.jpg',
    2010,
    8880,
    8.8,
    45000,
    'READY',
    'Christopher Nolan',
    'English',
    'T16',
    '/movies/inception'
);

-- 2
INSERT INTO movies (id, title, description, poster_url, backdrop_url, release_year, duration_sec, avg_rating, views_count, status, director, language, age_rating, folder_path)
VALUES (
    2,
    'Interstellar',
    'Khi Trái Đất ngày càng tàn lụi, một nhóm nhà thám hiểm sử dụng một hố đen mới được khám phá để du hành xuyên không gian, tìm kiếm một hành tinh mới cho sự sinh tồn của nhân loại trước khi thời gian cạn kiệt.',
    'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    'https://image.tmdb.org/t/p/w1280/xJHokMbljvjEVAW4sABO65epZJT.jpg',
    2014,
    10140,
    8.6,
    52000,
    'READY',
    'Christopher Nolan',
    'English',
    'T13',
    '/movies/interstellar'
);

-- 3
INSERT INTO movies (id, title, description, poster_url, backdrop_url, release_year, duration_sec, avg_rating, views_count, status, director, language, age_rating, folder_path)
VALUES (
    3,
    'The Dark Knight',
    'Khi mối đe dọa mang tên The Joker gây ra hỗn loạn và thảm họa cho người dân thành phố Gotham, Batman phải chấp nhận một trong những thử thách tâm lý và thể chất lớn nhất để chống lại sự phi lý và bảo vệ công lý.',
    'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    'https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    2008,
    9120,
    9.0,
    65000,
    'READY',
    'Christopher Nolan',
    'English',
    'T16',
    '/movies/dark_knight'
);

-- 4
INSERT INTO movies (id, title, description, poster_url, backdrop_url, release_year, duration_sec, avg_rating, views_count, status, director, language, age_rating, folder_path)
VALUES (
    4,
    'Avengers: Endgame',
    'Sau những sự kiện tàn khốc của Avengers: Cuộc chiến vô cực, vũ trụ bị tàn phá tột cùng. Với sự giúp đỡ của các đồng minh còn sống sót, nhóm Avengers phải tập hợp lại thêm một lần nữa để đảo ngược hành động của Thanos quyết định số phận thực tại.',
    'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    2019,
    10860,
    8.4,
    120000,
    'READY',
    'Anthony Russo, Joe Russo',
    'English',
    'T13',
    '/movies/avengers_endgame'
);

-- 5
INSERT INTO movies (id, title, description, poster_url, backdrop_url, release_year, duration_sec, avg_rating, views_count, status, director, language, age_rating, folder_path)
VALUES (
    5,
    'Parasite (Ký Sinh Trùng)',
    'Một gia đình nghèo nhưng vô cùng mưu mô thâm nhập dần từng bước vào một gia đình giàu có ngây thơ thông qua những thân phận giả dạng khác nhau. Sự xung đột giai cấp dẫn đến những hệ luỵ bất ngờ và tàn khốc.',
    'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    'https://image.tmdb.org/t/p/w1280/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    2019,
    7920,
    8.6,
    38000,
    'READY',
    'Bong Joon-ho',
    'Korean',
    'T18',
    '/movies/parasite'
);

-- 6
INSERT INTO movies (id, title, description, poster_url, backdrop_url, release_year, duration_sec, avg_rating, views_count, status, director, language, age_rating, folder_path)
VALUES (
    6,
    'Spider-Man: No Way Home',
    'Lần đầu tiên trong lịch sử điện ảnh, thân phận Người Nhện của Peter Parker bị phơi bày. Khi tìm đến Doctor Strange để nhờ giúp đỡ viết lại thực tại, phép thuật gặp sự cố xé rách ranh giới các vũ trụ, dẫn đến những kẻ thù hùng mạnh nhất dần dần xuất hiện.',
    'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1ZrsNdG21zR4f8.jpg',
    'https://image.tmdb.org/t/p/w1280/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    2021,
    8880,
    8.0,
    115000,
    'READY',
    'Jon Watts',
    'English',
    'T13',
    '/movies/spider_man_nwh'
);

-- 7
INSERT INTO movies (id, title, description, poster_url, backdrop_url, release_year, duration_sec, avg_rating, views_count, status, director, language, age_rating, folder_path)
VALUES (
    7,
    'John Wick: Chapter 4',
    'John Wick khám phá ra con đường để đánh bại tận gốc rễ tổ chức High Table. Nhưng trước khi có thể giành lại sự tự do vĩnh viễn, anh phải đối mặt với một kẻ thù mới với những liên minh hùng mạnh trên toàn cầu và những thế lực biến những người anh em cũ thành tử thù.',
    'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    'https://image.tmdb.org/t/p/w1280/7I6VUdPj6tQECNHdviJkUHD2u89.jpg',
    2023,
    10140,
    7.8,
    76000,
    'READY',
    'Chad Stahelski',
    'English',
    'T18',
    '/movies/john_wick_4'
);

-- 8
INSERT INTO movies (id, title, description, poster_url, backdrop_url, release_year, duration_sec, avg_rating, views_count, status, director, language, age_rating, folder_path)
VALUES (
    8,
    'Dune: Part Two',
    'Paul Atreides tiếp tục hành trình trả thù vĩ đại cùng với Chani và tộc người Fremen chống lại những kẻ đã hủy hoại gia đình anh. Đứng trước sự lựa chọn giữa tình yêu của cuộc đời và số phận của vũ trụ, Paul phải ngăn chặn một tương lai tồi tệ mà chỉ mình anh có thể dự đoán trước.',
    'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGxM1Ryt.jpg',
    'https://image.tmdb.org/t/p/w1280/8rpDcsfLJypbO6vtecwm8DftOBUS.jpg',
    2024,
    9960,
    8.3,
    85000,
    'READY',
    'Denis Villeneuve',
    'English',
    'T16',
    '/movies/dune_2'
);

-- Note: In genres table, usually 1:Action, 2:Comedy, 3:Drama, 4:Horror, 5:Sci-Fi, 6:Romance, 7:Thriller, 8:Animation, 9:Documentary, 10:Fantasy

INSERT IGNORE INTO movie_genres (movie_id, genre_id) VALUES
(1, 1), (1, 5), (1, 7), 
(2, 3), (2, 5),         
(3, 1), (3, 3), (3, 7), 
(4, 1), (4, 5), (4, 10),
(5, 2), (5, 3), (5, 7), 
(6, 1), (6, 5), (6, 10),
(7, 1), (7, 7),
(8, 1), (8, 5), (8, 3);
