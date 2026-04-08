USE moviedb;

ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN membership_rank ENUM('MEMBER', 'CLOSE', 'VIP') NOT NULL DEFAULT 'MEMBER';

UPDATE users SET membership_rank = 'VIP' WHERE role = 'ADMIN';
