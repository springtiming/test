# TradeMind UI

一个基于 React 的加密货币交易决策评审与研究员社区平台前端应用。

## 项目简介

TradeMind 是一个专注于加密货币交易决策评审的社区平台，允许研究员对他人的交易决策进行专业评价和打分。平台具备完整的用户体系、权限管理和研究员排行榜系统。

### 核心功能

- **决策评审** - 浏览和评价交易决策，支持 K 线图表展示
- **研究员排行榜** - 根据评价质量和社区贡献进行排名
- **用户权限管理** - 访客 → 研究员 → 管理员的多层级权限体系
- **研究员申请系统** - 用户可申请成为研究员，管理员审核

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript 5.9 |
| 路由 | React Router 7 |
| 样式 | Tailwind CSS 4 |
| 图表 | lightweight-charts (TradingView) |
| 图标 | Lucide React |
| 构建工具 | Vite 7 |
| 代码检查 | ESLint 9 + typescript-eslint |

## 项目结构

```
trademind-ui/
├── src/
│   ├── main.tsx                 # 应用入口
│   ├── App.tsx                  # 主应用组件和路由配置
│   ├── index.css                # 全局样式和主题变量
│   │
│   ├── pages/                   # 页面组件
│   │   ├── DecisionReview.tsx   # 决策评审页面（首页）
│   │   ├── ResearcherRanking.tsx # 研究员排行榜
│   │   ├── AdminPanel.tsx       # 管理员面板
│   │   └── SettingsPage.tsx     # 账号设置
│   │
│   ├── components/              # 可复用组件
│   │   ├── Header.tsx           # 导航头部
│   │   ├── DecisionCard.tsx     # 决策卡片
│   │   ├── ReviewItem.tsx       # 评价项
│   │   ├── CandlestickChart.tsx # K线图表
│   │   ├── UIComponents.tsx     # 通用UI组件
│   │   ├── AuthModal.tsx        # 登录/注册模态框
│   │   └── ApplyResearcherModal.tsx # 研究员申请模态框
│   │
│   ├── contexts/                # 全局状态管理
│   │   ├── AuthContext.tsx      # 认证和用户状态
│   │   └── ReviewContext.tsx    # 评价状态
│   │
│   └── types/                   # TypeScript 类型定义
│       ├── user.ts              # 用户相关类型
│       └── review.ts            # 评价相关类型
│
├── public/
│   └── logos/                   # 加密货币 logo
│
├── index.html                   # HTML 入口
├── package.json                 # 依赖配置
├── vite.config.ts               # Vite 配置
├── tsconfig.json                # TypeScript 配置
└── eslint.config.js             # ESLint 配置
```

## 文档

- UI 改造方案（历史决策展示与复盘分析）：`docs/UI改造方案-历史决策.md`
- Research API 对接规范：`docs/ResearchAPI-对接规范.md`

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173 启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 用户角色与权限

系统包含三种用户角色：

| 功能 | 访客 (Guest) | 研究员 (Researcher) | 管理员 (Admin) |
|------|:------------:|:------------------:|:--------------:|
| 浏览决策 | ✓ | ✓ | ✓ |
| 浏览评价 | ✓ | ✓ | ✓ |
| 发表评价 | ✗ | ✓ | ✓ |
| 点赞评价 | ✗ | ✓ | ✓ |
| 删除评价 | ✗ | 仅自己 | 全部 |
| 申请成为研究员 | ✓ | ✗ | ✗ |
| 访问管理面板 | ✗ | ✗ | ✓ |
| 审核申请 | ✗ | ✗ | ✓ |

## 测试账号

系统预置了测试账号用于体验功能：

| 账号 | 密码 | 角色 |
|------|------|------|
| admin@trademind.com | admin123 | 管理员 |
| satoshi@crypto.com | satoshi123 | 研究员 (Lv.5) |

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | DecisionReview | 首页 - 决策评审 |
| `/ranking` | ResearcherRanking | 研究员排行榜 |
| `/admin` | AdminPanel | 管理员面板（需管理员权限）|
| `/settings` | SettingsPage | 账号设置（需登录）|

## 主题配色

项目采用深色主题（目前浅色主题还没实装），主要颜色变量：

```css
--color-bg: #222222          /* 背景色 */
--color-surface: #2c2c2c     /* 卡片背景 */
--color-primary: #3b82f6     /* 主色（蓝色）*/
--color-success: #2DBD85     /* 成功色（绿色）*/
--color-danger: #E02D42      /* 危险色（红色）*/
--color-warning: #F0B90B     /* 警告色（黄色）*/
--color-text: #EAECEF        /* 文本色 */
--color-subtext: #848E9C     /* 次文本色 */
```

## 核心组件

### CandlestickChart

基于 TradingView 的 lightweight-charts 库，展示交易决策的 K 线图表。

```tsx
<CandlestickChart
  symbol="BTC/USDT"
  entryPrice={94850}
  currentPrice={95000}
  direction="LONG"
/>
```

### AuthModal

登录/注册模态框组件，支持两种模式切换。

```tsx
<AuthModal
  isOpen={showAuth}
  onClose={() => setShowAuth(false)}
  initialMode="login"
/>
```

### ReviewItem

评价项组件，展示单条评价信息，支持点赞和删除。

```tsx
<ReviewItem review={review} />
```

## 数据说明

当前版本使用模拟数据：

- **决策数据** - 硬编码在 DecisionReview.tsx
- **用户数据** - 存储在 AuthContext 内存中
- **评价数据** - 存储在 ReviewContext 内存中
- **K线数据** - 动态随机生成

> 刷新页面后数据会重置为初始状态。

## 开发说明

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.tsx` 添加路由配置
3. 在 `src/components/Header.tsx` 添加导航链接（如需要）

### 添加新组件

1. 在 `src/components/` 创建组件文件
2. 使用 TypeScript 定义 Props 类型
3. 遵循项目既有的样式规范

### 状态管理

项目使用 React Context 进行全局状态管理：

- `AuthContext` - 用户认证、权限、研究员申请
- `ReviewContext` - 评价的增删改查、点赞
