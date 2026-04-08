USE moviedb;

-- Batch 2: Adding 22 more realistic movies
INSERT INTO movies (id, title, description, poster_url, backdrop_url, release_year, duration_sec, avg_rating, views_count, status, director, language, age_rating, folder_path)
VALUES 
(9, 'The Matrix', 'Một hacker máy tính tình cờ khám phá ra bản chất thực sự của thực tại phồn hoa mà con người đang sống: một mô phỏng máy tính, và vai trò của chính anh trong cuộc chiến chống lại những cỗ máy điều khiển.', 
'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GvwJwBZZ4Zcz.jpg', 'https://image.tmdb.org/t/p/w1280/lMnoYqPIsWVsXo10x9P9P1OEI5a.jpg', 1999, 8160, 8.7, 98000, 'READY', 'Lana Wachowski, Lilly Wachowski', 'English', 'T16', '/movies/matrix'),

(10, 'Gladiator', 'Một vị tướng vĩ đại của La Mã bị phản bội và gia đình bị sát hại bởi con trai tham nhũng của hoàng đế. Ông đến đấu trường như một võ sĩ giác đấu để báo thù.', 
'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg', 'https://image.tmdb.org/t/p/w1280/4HWAQu28e2yaWrtupFPGFkdNU7V.jpg', 2000, 9300, 8.5, 87000, 'READY', 'Ridley Scott', 'English', 'T16', '/movies/gladiator'),

(11, 'Avatar', 'Một cựu lính thủy đánh bộ bị liệt được phái đến mặt trăng Pandora với nhiệm vụ khai thác độc đáo. Nhưng tại đây anh bị giằng xé giữa việc tuân theo mệnh lệnh và bảo vệ thế giới mới của mình.', 
'https://picsum.photos/seed/avatar_poster/600/900', 'https://picsum.photos/seed/avatar_bg/1280/720', 2009, 9720, 7.8, 145000, 'READY', 'James Cameron', 'English', 'T13', '/movies/avatar'),

(12, 'Titanic', 'Một câu chuyện tình yêu vượt thời gian bị che khuất bởi bi kịch chìm tàu tồi tệ nhất lịch sử giữa một chàng họa sĩ nghèo và cô gái quý tộc khao khát tự do.', 
'https://picsum.photos/seed/titanic_poster/600/900', 'https://picsum.photos/seed/titanic_bg/1280/720', 1997, 11700, 7.9, 134000, 'READY', 'James Cameron', 'English', 'T13', '/movies/titanic'),

(13, 'Forrest Gump', 'Góc nhìn về cuộc sống qua lăng kính của một người đàn ông có chỉ số IQ thấp nhưng tâm hồn vĩ đại, người đã vô tình có mặt ở nhiều cột mốc lịch sử ấn tượng.', 
'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg', 'https://image.tmdb.org/t/p/w1280/3h1JZGDhZ8usSGITbSKmH3F3o04.jpg', 1994, 8520, 8.8, 112000, 'READY', 'Robert Zemeckis', 'English', 'P', '/movies/forrest_gump'),

(14, 'The Shawshank Redemption', 'Hai người đàn ông bị cầm tù thiết lập mối quan hệ kéo dài qua nhiều năm, tìm thấy sự an ủi và sự cứu độ từ những hành động của lòng khoan dung.', 
'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dENYA.jpg', 'https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg', 1994, 8520, 9.3, 142000, 'READY', 'Frank Darabont', 'English', 'T16', '/movies/shawshank'),

(15, 'Pulp Fiction', 'Cuộc sống của hai tên sát thủ gốc băng đảng, một võ sĩ quyền anh, một người vợ xã hội đen và một cặp cướp nhà hàng đan xen trong bốn câu chuyện bạo lực và sự cứu chuộc.', 
'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPbOYKQruqE.jpg', 'https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg', 1994, 9240, 8.9, 105000, 'READY', 'Quentin Tarantino', 'English', 'T18', '/movies/pulp_fiction'),

(16, 'Fight Club', 'Một nhân viên văn phòng mất ngủ khao khát thoát khỏi khuôn mẫu rập khuôn của xã hội. Cuộc đời anh thay đổi khi gặp người chuyên buôn bán bánh xà phòng bí ẩn Tyler Durden.', 
'https://picsum.photos/seed/fight_poster/600/900', 'https://picsum.photos/seed/fight_bg/1280/720', 1999, 8340, 8.8, 98000, 'READY', 'David Fincher', 'English', 'T18', '/movies/fight_club'),

(17, 'Joker', 'Câu chuyện về sự sa ngã của Arthur Fleck, một gã hề làm thuê có vấn đề thần kinh, người đã dần bị xã hội gạt bỏ để rồi trở thành ngọn lửa kích động hỗn loạn ở Gotham.', 
'https://picsum.photos/seed/joker_poster/600/900', 'https://picsum.photos/seed/joker_bg/1280/720', 2019, 7320, 8.4, 123000, 'READY', 'Todd Phillips', 'English', 'T18', '/movies/joker'),

(18, 'Mad Max: Fury Road', 'Kẻ cô độc giữa sa mạc post-apocalyptic, Max tham gia cùng với Furiosa mạnh mẽ hòng trốn thoát khỏi bọn lãnh chúa sa mạc khát máu trong cuộc đua đuổi không ngừng nghỉ.', 
'https://picsum.photos/seed/madmax_poster/600/900', 'https://picsum.photos/seed/madmax_bg/1280/720', 2015, 7200, 8.1, 95000, 'READY', 'George Miller', 'English', 'T16', '/movies/mad_max'),

(19, 'The Avengers', 'Loki cùng đạo quân ngoài hành tinh mang đến mối rủi ro tàn phá Trái Đất. Nick Fury phải điều động tất cả những anh hùng xuất chúng nhất để bảo vệ nhân loại.', 
'https://picsum.photos/seed/avengers1_poster/600/900', 'https://picsum.photos/seed/avengers1_bg/1280/720', 2012, 8580, 8.0, 110000, 'READY', 'Joss Whedon', 'English', 'T13', '/movies/avengers'),

(20, 'Avengers: Infinity War', 'Sự xuất hiện của Thanos buộc biệt đội Avengers và đồng minh phải hi sinh mọi thứ để cố gắng ngăn chặn mưu đồ quét sạch nửa vũ trụ.', 
'https://picsum.photos/seed/infinity_poster/600/900', 'https://picsum.photos/seed/infinity_bg/1280/720', 2018, 8940, 8.4, 150000, 'READY', 'Anthony Russo, Joe Russo', 'English', 'T13', '/movies/infinity_war'),

(21, 'Oppenheimer', 'Xoay quanh nhà vật lý người Mỹ J. Robert Oppenheimer, câu chuyện theo sát quá trình ông tạo ra vũ khí hủy diệt lớn nhất trong lịch sử nhân loại.', 
'https://picsum.photos/seed/oppenheimer_poster/600/900', 'https://picsum.photos/seed/oppenheimer_bg/1280/720', 2023, 10800, 8.5, 92000, 'READY', 'Christopher Nolan', 'English', 'T16', '/movies/oppenheimer'),

(22, 'Top Gun: Maverick', 'Sau 30 năm phục vụ, Maverick được gọi lại để huấn luyện đội phi công xuất sắc nhất của Top Gun cho một nhiệm vụ chuyên biệt chưa từng có.', 
'https://picsum.photos/seed/topgun_poster/600/900', 'https://picsum.photos/seed/topgun_bg/1280/720', 2022, 7800, 8.3, 85000, 'READY', 'Joseph Kosinski', 'English', 'T13', '/movies/top_gun'),

(23, 'The Batman', 'Khi tên sát nhân bí ẩn nhắm vào giới thượng lưu tại Gotham bằng một loạt các câu đố hiểm hóc, Batman bị kéo vào hang ổ tăm tối khám phá sự thật.', 
'https://picsum.photos/seed/batman_poster/600/900', 'https://picsum.photos/seed/batman_bg/1280/720', 2022, 10560, 7.8, 93000, 'READY', 'Matt Reeves', 'English', 'T16', '/movies/the_batman'),

(24, 'Barbie', 'Trải qua cơn khủng hoảng hiện sinh nghiêm trọng ở thế giới Barbie hoàn hảo, Barbie và Ken bước vào thế giới loài người để khám phá sự thật.', 
'https://picsum.photos/seed/barbie_poster/600/900', 'https://picsum.photos/seed/barbie_bg/1280/720', 2023, 6840, 7.3, 115000, 'READY', 'Greta Gerwig', 'English', 'P', '/movies/barbie'),

(25, 'Black Panther', 'T''Challa trở về Wakanda bí ẩn và vĩ đại để lên kế vị ngôi vua. Thế nhưng một biến cố lớn ập tới trước sự xuất hiện của một vị khách bí ẩn.', 
'https://picsum.photos/seed/panther_poster/600/900', 'https://picsum.photos/seed/panther_bg/1280/720', 2018, 8040, 7.3, 88000, 'READY', 'Ryan Coogler', 'English', 'T13', '/movies/black_panther'),

(26, 'Everything Everywhere All at Once', 'Một chủ tiệm giặt ủi người Mỹ gốc Hoa có khả năng liên kết với bản thể song song của mình để chống lại một sinh vật hùng mạnh với dã tâm phá vỡ đa vũ trụ.', 
'https://picsum.photos/seed/eeaao_poster/600/900', 'https://picsum.photos/seed/eeaao_bg/1280/720', 2022, 8340, 8.0, 94000, 'READY', 'Daniel Kwan, Daniel Scheinert', 'English', 'T16', '/movies/eeaao'),

(27, 'The Terminator', 'Một cỗ máy ám sát nhân hình du hành xuyên thời gian về năm 1984 để lấy mạng thiếu nữ tên Sarah Connor, người sẽ sinh ra hy vọng duy nhất của nhân loại.', 
'https://picsum.photos/seed/terminator_poster/600/900', 'https://picsum.photos/seed/terminator_bg/1280/720', 1984, 6420, 8.0, 70000, 'READY', 'James Cameron', 'English', 'T16', '/movies/terminator'),

(28, 'Alien', 'Phi hành đoàn tàu không gian Nostromo buộc phải đối đầu với một sinh vật ngoài hành tinh ghê tởm lọt được vào phi thuyền khi họ đáp xuống hành tinh xa lạ.', 
'https://picsum.photos/seed/alien_poster/600/900', 'https://picsum.photos/seed/alien_bg/1280/720', 1979, 7020, 8.5, 68000, 'READY', 'Ridley Scott', 'English', 'T18', '/movies/alien'),

(29, 'Star Wars: A New Hope', 'Luke Skywalker tham gia liên minh phiến quân với hiệp sĩ Jedi cuối cùng, gánh trên vai nhiệm vụ sinh tử là giải cứu thiên hà khỏi hiểm họa từ trạm vũ trụ Death Star.', 
'https://picsum.photos/seed/starwars_poster/600/900', 'https://picsum.photos/seed/starwars_bg/1280/720', 1977, 7260, 8.6, 120000, 'READY', 'George Lucas', 'English', 'P', '/movies/star_wars'),

(30, 'The Lion King', 'Chú sư tử con bé nhỏ Simba trốn chạy khỏi vương quốc và sau đó học được ý nghĩa thực sự của trách nhiệm, lòng can đảm và chu kỳ của sự sống.', 
'https://picsum.photos/seed/lionking_poster/600/900', 'https://picsum.photos/seed/lionking_bg/1280/720', 1994, 5340, 8.5, 130000, 'READY', 'Roger Allers, Rob Minkoff', 'English', 'P', '/movies/lion_king');


-- Insert Genres (Assuming 1:Action, 2:Comedy, 3:Drama, 4:Horror, 5:Sci-Fi, 6:Romance, 7:Thriller, 8:Animation, 9:Documentary, 10:Fantasy)
INSERT IGNORE INTO movie_genres (movie_id, genre_id) VALUES
(9, 1), (9, 5),          -- Matrix
(10, 1), (10, 3),        -- Gladiator
(11, 1), (11, 5),        -- Avatar
(12, 3), (12, 6),        -- Titanic
(13, 3), (13, 6),        -- Forrest Gump
(14, 3),                 -- Shawshank
(15, 3), (15, 7),        -- Pulp
(16, 3), (16, 7),        -- Fight Club
(17, 3), (17, 7),        -- Joker
(18, 1), (18, 5),        -- Mad max
(19, 1), (19, 5),        -- Avengers
(20, 1), (20, 5),        -- Infinity War
(21, 3), (21, 9),        -- Oppenheimer
(22, 1), (22, 3),        -- Top Gun
(23, 1), (23, 7),        -- Batman
(24, 2), (24, 10),       -- Barbie
(25, 1), (25, 5),        -- Panther
(26, 1), (26, 2), (26, 5),-- EEAAO
(27, 1), (27, 5),        -- Terminator
(28, 4), (28, 5),        -- Alien
(29, 1), (29, 5), (29, 10),-- Star wars
(30, 8), (30, 3);        -- Lion King
