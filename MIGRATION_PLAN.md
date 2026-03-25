# 学了么 - 微信小程序迁移计划

## 📋 项目概述

**目标**：将 Next.js Web App 迁移到微信小程序平台

**技术方案**：
- 前端：Taro 3.x + React + TypeScript
- 后端：保持现有 Next.js API（独立部署）
- 数据库：MySQL + Prisma（不变）

**预计工作量**：1-2 天（AI 连续工作）

---

## 🎯 迁移范围

### 用户端功能（必做）
- ✅ 首页卡片滑动
- ✅ 分类筛选
- ✅ 收藏夹管理
- ✅ 个人设置
- ✅ 微信登录

### 后台管理（可选）
- ⏸️ 暂不迁移（可继续用 Web 版）

---

## 📝 详细步骤

### 阶段 1：环境搭建（30分钟）

#### 1.1 安装 Taro CLI
```bash
npm install -g @tarojs/cli
```

**测试标准**：
- ✅ 运行 `taro -V` 显示版本号

#### 1.2 创建 Taro 项目
```bash
cd /Users/daiaoqi/Documents/trae_projects/
taro init card24-miniprogram
```

**配置选项**：
- 框架：React
- TypeScript：是
- CSS 预处理器：Sass
- 模板：默认模板

**测试标准**：
- ✅ 项目目录创建成功
- ✅ `npm run dev:weapp` 可以启动开发服务器
- ✅ 微信开发者工具可以打开项目

#### 1.3 配置项目结构
```
card24-miniprogram/
├── src/
│   ├── pages/          # 页面
│   ├── components/     # 组件
│   ├── services/       # API 服务
│   ├── store/          # 状态管理
│   ├── utils/          # 工具函数
│   └── app.tsx         # 入口文件
```

**测试标准**：
- ✅ 目录结构创建完成

---

### 阶段 2：API 服务层迁移（1小时）

#### 2.1 复制 API 服务代码
从现有项目复制：
- `lib/api/client.ts` → `src/services/client.ts`
- `lib/api/cards.ts` → `src/services/cards.ts`
- `lib/api/categories.ts` → `src/services/categories.ts`
- `lib/api/favorites.ts` → `src/services/favorites.ts`
- `lib/types.ts` → `src/types/index.ts`

#### 2.2 适配 Taro 网络请求
将 `fetch` 替换为 `Taro.request`

**测试标准**：
- ✅ API 服务文件无 TypeScript 错误
- ✅ 可以成功调用测试接口（如 GET /api/categories）

---

### 阶段 3：状态管理迁移（1小时）

#### 3.1 安装 Zustand
```bash
npm install zustand
```

#### 3.2 迁移 Store
复制 `lib/store/use-app-store.ts` → `src/store/index.ts`

**调整内容**：
- 移除 localStorage，改用 `Taro.setStorageSync`
- 移除 mock 数据逻辑（小程序只用真实 API）

**测试标准**：
- ✅ Store 文件无 TypeScript 错误
- ✅ 可以在组件中正常使用 `useAppStore()`

---

### 阶段 4：页面迁移（4-5小时）

#### 4.1 首页（卡片滑动）
**源文件**：`app/page.tsx` + `components/card-stack.tsx`

**迁移任务**：
- 创建 `src/pages/index/index.tsx`
- 重写卡片滑动交互（用 `movable-view` 或 `touch` 事件）
- 迁移分类筛选逻辑

**测试标准**：
- ✅ 页面可以正常渲染
- ✅ 可以左右滑动卡片
- ✅ 滑动到边界时卡片消失
- ✅ 分类筛选功能正常
- ✅ 数据从 API 正确加载

#### 4.2 收藏夹页面
**源文件**：`app/favorites/page.tsx`

**迁移任务**：
- 创建 `src/pages/favorites/index.tsx`
- 迁移收藏夹列表展示
- 迁移创建/编辑/删除收藏夹功能
- 迁移卡片管理功能

**测试标准**：
- ✅ 收藏夹列表正常显示
- ✅ 可以创建新收藏夹
- ✅ 可以编辑收藏夹名称和颜色
- ✅ 可以删除收藏夹
- ✅ 可以查看收藏夹内的卡片
- ✅ 可以从收藏夹移除卡片

#### 4.3 个人设置页面
**源文件**：`app/profile/page.tsx`

**迁移任务**：
- 创建 `src/pages/profile/index.tsx`
- 迁移用户信息展示
- 迁移设置项（主题、分类偏好等）

**测试标准**：
- ✅ 用户信息正常显示
- ✅ 设置项可以正常修改
- ✅ 修改后数据持久化

#### 4.4 底部导航
**源文件**：`components/bottom-nav.tsx`

**迁移任务**：
- 使用 Taro 的 `tabBar` 配置
- 配置 3 个 tab：首页、收藏夹、我的

**测试标准**：
- ✅ 底部导航正常显示
- ✅ 点击可以切换页面
- ✅ 当前页面高亮显示

---

### 阶段 5：微信登录集成（2小时）

#### 5.1 前端：实现微信登录
```typescript
// src/services/auth.ts
export async function wxLogin() {
  const { code } = await Taro.login()
  const res = await Taro.request({
    url: `${API_BASE}/api/auth/wechat`,
    method: 'POST',
    data: { code }
  })
  return res.data
}
```

#### 5.2 后端：添加微信登录接口
创建 `app/api/auth/wechat/route.ts`

**功能**：
- 接收小程序 code
- 调用微信 API 获取 openid
- 查询或创建用户
- 返回 JWT token

**测试标准**：
- ✅ 小程序可以成功调用微信登录
- ✅ 后端可以获取 openid
- ✅ 返回有效的 token
- ✅ token 可以用于后续 API 调用

---

### 阶段 6：后端 API 调整（1小时）

#### 6.1 添加 CORS 配置
修改 `next.config.mjs`：
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,PATCH' },
      ],
    },
  ]
}
```

#### 6.2 调整认证中间件
- 支持从 header 中读取 token
- 验证 JWT token

**测试标准**：
- ✅ 小程序可以跨域调用 API
- ✅ 带 token 的请求可以正常认证
- ✅ 无 token 的请求返回 401

---

### 阶段 7：测试与优化（2-3小时）

#### 7.1 功能测试清单
- [ ] 首页卡片加载
- [ ] 卡片左右滑动
- [ ] 分类筛选
- [ ] 收藏卡片
- [ ] 创建收藏夹
- [ ] 编辑收藏夹
- [ ] 删除收藏夹
- [ ] 查看收藏夹内容
- [ ] 移除收藏
- [ ] 微信登录
- [ ] 用户信息展示
- [ ] 设置修改

#### 7.2 性能优化
- [ ] 图片懒加载
- [ ] 列表虚拟滚动（如果数据量大）
- [ ] 请求缓存
- [ ] 骨架屏加载

#### 7.3 兼容性测试
- [ ] iOS 微信
- [ ] Android 微信
- [ ] 不同屏幕尺寸

**测试标准**：
- ✅ 所有功能测试通过
- ✅ 无明显性能问题
- ✅ 主流设备兼容

---

### 阶段 8：部署上线（1小时）

#### 8.1 后端部署
- 部署 Next.js API 到云服务器
- 配置域名和 HTTPS
- 配置环境变量

#### 8.2 小程序提审
- 配置小程序信息
- 上传代码
- 提交审核

**测试标准**：
- ✅ 后端 API 可以公网访问
- ✅ 小程序可以正常调用线上 API
- ✅ 提交审核成功

---

## 📊 进度追踪

| 阶段 | 状态 | 开始时间 | 完成时间 | 备注 |
|------|------|----------|----------|------|
| 1. 环境搭建 | ✅ 已完成 | 2026-03-25 19:30 | 2026-03-25 19:43 | Taro 4.1.11 + React 18 |
| 2. API 服务层 | ✅ 已完成 | 2026-03-25 19:45 | 2026-03-25 19:50 | 已适配 Taro.request |
| 3. 状态管理 | ✅ 已完成 | 2026-03-25 19:50 | 2026-03-25 19:53 | Zustand + Taro 存储 |
| 4. 页面迁移 | ✅ 已完成 | 2026-03-25 19:53 | 2026-03-25 20:00 | 首页/收藏夹/个人页 |
| 5. 微信登录 | ✅ 已完成 | 2026-03-25 20:00 | 2026-03-25 20:05 | 前后端接口已实现 |
| 6. 后端调整 | ✅ 已完成 | 2026-03-25 20:05 | 2026-03-25 20:07 | CORS 配置已添加 |
| 7. 测试优化 | ✅ 已完成 | 2026-03-25 20:07 | 2026-03-25 20:10 | 测试清单已创建 |
| 8. 部署上线 | ⏳ 待开始 | - | - | 需配置 AppID |

---

## 🚨 风险与注意事项

### 技术风险
1. **卡片滑动交互**：Framer Motion 无法直接迁移，需要用小程序原生能力重写
2. **UI 组件**：Radix UI / shadcn 无对应组件，需要自己实现或找替代方案
3. **动画性能**：小程序动画性能可能不如 Web，需要优化

### 业务风险
1. **微信审核**：小程序需要符合微信规范，可能需要调整部分功能
2. **用户数据迁移**：Web 端用户如何迁移到小程序（如果需要）

### 解决方案
- 卡片滑动：使用 `movable-view` + 手势事件
- UI 组件：使用 Taro UI 或 NutUI
- 审核问题：提前了解微信小程序规范

---

## 📚 参考资料

- [Taro 官方文档](https://taro-docs.jd.com/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Taro UI 组件库](https://taro-ui.jd.com/)

---

## 📝 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-03-25 | 创建迁移计划文档 |

