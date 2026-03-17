# 知识卡片 API 文档

本文档详细说明了知识卡片应用的前后端交互 API 接口。

## 接口根路径

所有接口的根路径为 `/api`。

---

## 1. 获取知识卡片

获取所有或特定分类下的知识卡片列表。

- **URL**: `/api/cards`
- **Method**: `GET`
- **Query Parameters**:
  - `categoryId` (可选): `string` - 用于筛选特定分类下的卡片。

- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: `KnowledgeCard[]`

    ```json
    [
      {
        "id": "funny-1",
        "categoryId": "funny",
        "content": "人生苦短，及时行乐。钱没了可以再赚，头发没了就真没了。",
        "author": "网络热梗",
        "gradient": "",
        "createdAt": "2024-01-01"
      }
    ]
    ```

- **Example**:
  - 获取所有卡片: `GET /api/cards`
  - 获取 “搞笑” 分类的卡片: `GET /api/cards?categoryId=funny`

---

## 2. 获取收藏夹

获取用户的所有收藏夹及其包含的卡片 ID。

- **URL**: `/api/favorites`
- **Method**: `GET`

- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: `FavoriteFolder[]`

    ```json
    [
      {
        "id": "funny",
        "name": "搞笑",
        "order": 0,
        "color": "#EF4444",
        "cardIds": ["funny-1", "funny-2"],
        "createdAt": "2024-05-20T12:00:00.000Z",
        "updatedAt": "2024-05-20T12:00:00.000Z"
      }
    ]
    ```

- **Example**:
  - `GET /api/favorites`

---

## 配置说明

本项目支持通过环境变量在 **mock 数据** 和 **API 调用** 两种模式间切换。

1.  在项目根目录下找到或创建 `.env.local` 文件。
2.  修改 `NEXT_PUBLIC_USE_API` 的值：
    - `NEXT_PUBLIC_USE_API=false` (默认): 前端将直接从 `lib/mock-data.ts` 读取数据，不会发起网络请求。
    - `NEXT_PUBLIC_USE_API=true`: 前端将调用本机的 `/api` 接口来获取数据。

**注意**: 切换此配置后，需要**重启开发服务器** (重新运行 `npm run dev`) 才能生效。
