# 学了么 (Xueleme)

移动端知识卡片学习应用，支持卡片浏览、收藏管理和后台管理系统。

## 技术栈

- **框架**: Next.js 16 + React 19
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand
- **动画**: Framer Motion
- **UI 组件**: Radix UI + shadcn/ui
- **数据库**: MySQL + Prisma 5
- **语言**: TypeScript

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL 数据库

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env.example` 为 `.env` 并配置：

```env
# 数据库连接
DATABASE_URL="mysql://user:password@host:3306/xueleme"

# API 模式切换
NEXT_PUBLIC_USE_API=false  # true: 真实后端, false: mock 数据
```

### 数据库初始化

```bash
# 生成 Prisma Client
npx prisma generate

# 执行数据库迁移
npx prisma migrate dev

# 填充测试数据
npm run seed
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 功能模块

### 前台功能

- 📚 卡片浏览：分类筛选、无限滚动
- ⭐ 收藏管理：创建收藏夹、拖拽排序
- ⚙️ 个人设置：主题切换、字体大小
- 💬 反馈提交

### 后台管理

访问 `/admin/login`

默认账号：`admin@xueleme.com` / `admin123`

- 📊 数据统计面板
- 📝 卡片管理（CRUD + 状态流转）
- 🏷️ 分类管理
- 👥 用户管理
- 📮 反馈管理

## 项目结构

```
├── app/                 # Next.js App Router
│   ├── (main)/         # 前台页面
│   ├── admin/          # 后台管理
│   └── api/            # API Routes
├── components/         # React 组件
├── lib/
│   ├── api/           # API 客户端
│   ├── services/      # 数据服务层
│   ├── store/         # Zustand 状态管理
│   └── types.ts       # TypeScript 类型
├── prisma/
│   └── schema.prisma  # 数据库模型
└── public/            # 静态资源
```

## 开发命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # 代码检查
```

## 数据库说明

使用 Prisma 5 作为 ORM（注意：不能升级到 Prisma 7，MySQL 无 adapter 支持）

### 主要数据模型

- `Card`: 知识卡片（支持 DRAFT/PUBLISHED/ARCHIVED 状态）
- `Category`: 分类
- `User`: 用户
- `Folder`: 收藏夹
- `FolderCard`: 收藏夹-卡片关联
- `UserSettings`: 用户设置
- `Feedback`: 用户反馈

## API 模式

项目支持两种运行模式：

1. **Mock 模式**（默认）：使用 localStorage + mock 数据，无需数据库
2. **API 模式**：连接真实数据库，通过 API Routes 操作数据

通过 `NEXT_PUBLIC_USE_API` 环境变量切换。

## 部署

### Vercel 部署

1. 连接 GitHub 仓库
2. 配置环境变量（DATABASE_URL 等）
3. 自动部署

### 自托管

```bash
npm run build
npm run start
```

## License

MIT
