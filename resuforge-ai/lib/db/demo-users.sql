-- 演示账号初始化 SQL
-- 生成时间: 2026-09-12T14:15:01.610Z
-- 密码: demo1234
--
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 粘贴并执行此 SQL
-- 4. 验证：使用下面的账号登录应用

INSERT INTO users (id, name, email, password, created_at, updated_at)
VALUES
  (gen_random_uuid(), '演示用户1', 'user1@demo.com', '$2b$10$Zhyqio4r4Tma51Mz4wKFhuwFjU41UohWPpwJAqLqrZI1Ji4dfciwi', now(), now()),
  (gen_random_uuid(), '演示用户2', 'user2@demo.com', '$2b$10$4vLB7McnZ15gKI/7ya3nZOaOEYO7oIy3/MiXdYxedIQ9TXVzIxmfO', now(), now()),
  (gen_random_uuid(), '演示用户3', 'user3@demo.com', '$2b$10$h/1XckSwBs.8nizqRf6fTOZW4bBad.bvTScPbKWgdEd0J7T6gjA5q', now(), now())
ON CONFLICT (email) DO NOTHING;

-- 验证：可以使用以下账号登录
-- 邮箱: user1@demo.com, 密码: demo1234
-- 邮箱: user2@demo.com, 密码: demo1234
-- 邮箱: user3@demo.com, 密码: demo1234
