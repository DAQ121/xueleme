# 学了么 API 接口文档

## 基础信息

- Base URL: `https://api.xueleme.com/v1`
- 请求格式: `application/json`
- 响应格式: `application/json`
- 认证方式: Bearer Token（`Authorization: Bearer <token>`）

---

## 通用响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

## 错误码

| code | 说明 |
|------|------|
| 0 | 成功 |
| 401 | 未授权，token 无效或过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 422 | 参数校验失败 |
| 500 | 服务器内部错误 |

---

## 认证模块

### 1. 发送验证码
`POST /auth/send-code`

**Request:**
```json
{ "phone": "13800138000" }
```

**Response:**
```json
{ "code": 0, "message": "验证码已发送" }
```

---

### 2. 登录 / 注册
`POST /auth/login`

**Request:**
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": "u_123",
      "phone": "138****8000",
      "isSubscribed": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### 3. 退出登录
`POST /auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "code": 0, "message": "已退出" }
```

---

## 分类模块

### 4. 获取所有分类
`GET /categories`

**Response:**
```json
{
  "code": 0,
  "data": [
    { "id": "funny", "name": "搞笑", "order": 0 },
    { "id": "history", "name": "历史", "order": 1 },
    { "id": "military", "name": "军事", "order": 2 },
    { "id": "science", "name": "科学", "order": 3 },
    { "id": "philosophy", "name": "哲理", "order": 4 },
    { "id": "life", "name": "生活", "order": 5 },
    { "id": "tech", "name": "科技", "order": 6 },
    { "id": "art", "name": "艺术", "order": 7 },
    { "id": "sports", "name": "体育", "order": 8 },
    { "id": "food", "name": "美食", "order": 9 }
  ]
}
```

---

## 卡片模块

### 5. 获取卡片列表
`GET /cards`

**Query Params:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | string | 否 | 按分类筛选 |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |

**Response:**
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "card_123",
        "categoryId": "funny",
        "content": "人生苦短，及时行乐。",
        "author": "网络热梗",
        "source": null,
        "gradient": "",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

---

### 6. 获取卡片详情
`GET /cards/:id`

**Response:**
```json
{
  "code": 0,
  "data": {
    "id": "card_123",
    "categoryId": "funny",
    "content": "人生苦短，及时行乐。",
    "author": "网络热梗",
    "source": null,
    "gradient": "",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## 收藏夹模块

### 7. 获取收藏夹列表
`GET /favorites`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "code": 0,
  "data": [
    {
      "id": "folder_123",
      "name": "我的收藏",
      "color": "#ef4444",
      "order": 0,
      "cardIds": ["card_1", "card_2"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 8. 创建收藏夹
`POST /favorites`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "我的收藏",
  "color": "#ef4444"
}
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "id": "folder_123",
    "name": "我的收藏",
    "color": "#ef4444",
    "order": 0,
    "cardIds": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 9. 更新收藏夹
`PATCH /favorites/:id`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "新名称",
  "color": "#3b82f6"
}
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "id": "folder_123",
    "name": "新名称",
    "color": "#3b82f6",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

---

### 10. 删除收藏夹
`DELETE /favorites/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "code": 0, "message": "删除成功" }
```

---

### 11. 添加卡片到收藏夹
`POST /favorites/:id/cards`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{ "cardId": "card_123" }
```

**Response:**
```json
{ "code": 0, "message": "收藏成功" }
```

---

### 12. 从收藏夹移除卡片
`DELETE /favorites/:id/cards/:cardId`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "code": 0, "message": "移除成功" }
```

---

### 13. 移动卡片到其他收藏夹
`POST /favorites/:id/cards/:cardId/move`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{ "targetFolderId": "folder_456" }
```

**Response:**
```json
{ "code": 0, "message": "移动成功" }
```

---

## 用户设置模块

### 14. 获取用户设置
`GET /user/settings`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "code": 0,
  "data": {
    "selectedCategories": ["funny", "history", "science"],
    "categoryOrder": ["funny", "history", "science", "military"],
    "theme": "system"
  }
}
```

---

### 15. 更新用户设置
`PATCH /user/settings`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "selectedCategories": ["funny", "science"],
  "categoryOrder": ["funny", "science", "history"],
  "theme": "dark"
}
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "selectedCategories": ["funny", "science"],
    "categoryOrder": ["funny", "science", "history"],
    "theme": "dark"
  }
}
```

---

## 反馈模块

### 16. 提交意见反馈
`POST /feedback`

**Headers:** `Authorization: Bearer <token>`（可选）

**Request:**
```json
{ "content": "希望增加更多科技类内容" }
```

**Response:**
```json
{ "code": 0, "message": "感谢您的反馈" }
```
