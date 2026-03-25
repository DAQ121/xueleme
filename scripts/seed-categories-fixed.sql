-- 清空现有数据
DELETE FROM favorite_cards;
DELETE FROM cards;
DELETE FROM generation_logs;
DELETE FROM categories;

-- 插入新专栏
INSERT INTO categories (name, code, tags, template, is_scheduled, cron_expression, model_config_id, `order`, is_active, created_at, updated_at) VALUES

-- 1. 心理学
('心理学', 'psychology',
'["情绪","认知","行为","人格","社交","亲密关系","职场心理","成长心理","亲子心理","心理疾病","梦境","潜意识","自我认知","说服与影响","压力与焦虑","幸福与积极心理","决策心理","消费心理","群体心理","心理测试"]',
'你是一位心理学科普专家。请生成5条心理学相关的知识卡片，每条100字以内。

要求：
1. 内容涵盖情绪、认知、行为、人格、社交、亲密关系、职场心理、成长心理、亲子心理、心理疾病、梦境、潜意识、自我认知、说服与影响、压力与焦虑、幸福与积极心理、决策心理、消费心理、群体心理、心理测试等主题
2. 语言通俗易懂，贴近生活
3. 可以包含心理学效应、心理现象、心理技巧等
4. 每条卡片从标签中选择1-3个相关标签

严格按以下JSON格式输出：
[
  {"content": "卡片内容", "tags": ["标签1", "标签2"]},
  {"content": "卡片内容", "tags": ["标签1"]}
]',
TRUE, '0 9 * * *', NULL, 1, TRUE, NOW(), NOW()),
