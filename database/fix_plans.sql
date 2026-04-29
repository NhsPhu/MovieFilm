USE moviedb;

UPDATE subscription_plans SET name='Thanh Vien', features='Xem phim co quang cao;Chat luong 720p;1 thiet bi' WHERE rank_level='MEMBER';
UPDATE subscription_plans SET name='Than Thiet', features='Khong quang cao;Chat luong 1080p;2 thiet bi;Tai phim offline' WHERE rank_level='CLOSE';
UPDATE subscription_plans SET name='VIP', features='Khong quang cao;Chat luong 4K;4 thiet bi;Tai phim offline;Xem phim som' WHERE rank_level='VIP';
