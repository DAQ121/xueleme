# 数据库字段映射

## Category (分类)
- id: Int
- name: String
- code: String (unique)
- template: String? (Text)
- isScheduled: Boolean
- cronExpression: String?
- order: Int
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime

❌ 不存在的字段: icon, color, description

## Card (卡片)
- id: Int
- categoryId: Int
- content: String (Text)
- author: String?
- source: String?
- tags: Json (数组)
- likesCount: Int
- favoritesCount: Int
- status: CardStatus (DRAFT/PUBLISHED/ARCHIVED)
- createdAt: DateTime
- updatedAt: DateTime

❌ 不存在的字段: question, answer

## User (用户)
- id: Int
- phone: String? (unique)
- email: String? (unique)
- passwordHash: String?
- isSubscribed: Boolean
- role: UserRole (USER/ADMIN)
- createdAt: DateTime
- updatedAt: DateTime

## FavoriteFolder (收藏夹)
- id: Int
- userId: Int
- name: String
- color: String
- order: Int
- createdAt: DateTime
- updatedAt: DateTime

❌ 不存在的字段: icon

## Feedback (反馈)
- id: Int
- userId: Int?
- content: String (Text)
- status: FeedbackStatus (PENDING/REVIEWED/RESOLVED)
- createdAt: DateTime

❌ 不存在的字段: type

## UserSettings (用户设置)
- id: Int
- userId: Int (unique)
- selectedCategories: Json (数组)
- categoryOrder: Json (数组)
- theme: String
- updatedAt: DateTime
