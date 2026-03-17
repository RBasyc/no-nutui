# 实验室库存管理系统

> 基于 Taro + Vue3 + TypeScript 开发的跨平台实验室库存管理小程序，支持微信小程序、支付宝小程序、H5 等多端运行。

## 📋 项目简介

本系统是一个现代化的实验室库存管理解决方案，集成了 **AI 智能助手**、**库存管理**、**实验计划管理**、**耗材共享协作**、**出入库记录追踪**、**实验室信息管理** 等功能，帮助实验室实现高效的库存数字化管理和团队协作。

## ✨ 功能特性

### 核心功能

#### 🤖 AI 智能助手
- 语音识别输入（微信语音识别插件）
- 智能对话交互
- **实验计划自动生成**：描述实验需求，AI 自动解析并生成耗材清单
- 库存查询助手
- 操作指南与建议

#### 📋 实验计划管理 ⭐ 新增
- **计划列表**：查看所有实验计划，状态自动判断（未开始/进行中）
- **创建计划**：手动创建实验计划，从仓库选择耗材
- **AI 生成计划**：在 AI 聊天中描述实验，自动生成计划卡片
- **计划详情**：查看完整计划信息和耗材清单
- **取消计划**：取消实验计划，**自动归还所有耗材到仓库**
- **库存联动**：创建计划时自动扣减库存，取消时自动归还
- **状态管理**：根据实验日期自动判断状态（无需手动设置）

#### 📦 库存管理
- 库存列表查看与搜索（支持关键词搜索）
- 库存物品详情查看
- 库存物品的创建、编辑、删除
- **出入库操作**：领用（出库）/ 归还（入库）
- 实时库存数量统计
- **出入库记录追踪**：完整的流水记录
- QR 码扫描快速切换物品
- 库存操作智能验证（防止负库存）

#### 🤝 耗材共享协作 ⭐ 新增
- **需求大厅**：查看其他实验室的耗材需求
- **发布需求**：发布耗材需求（我需要/我富余）
- **我的共享**：管理发布的共享信息
- **分类筛选**：按类型查看需求
- **联系方式**：查看发布者联系方式
- **删除共享**：删除已发布的共享信息

#### 🏢 实验室管理
- 实验室信息查看与编辑
- 实验室列表与搜索
- 创建新实验室
- 实验室成员管理

#### ⚙️ 设置中心
- 个人资料编辑
- 头像上传
- 密码修改
- 实验室关联设置

### 技术亮点
- 🎨 **现代 UI 设计**：毛玻璃效果 + 渐变色 + 流畅动画
- 📱 **响应式布局**：完美适配多种屏幕尺寸（设计宽度 750rpx）
- 🔐 **完善的表单验证**：实时验证 + 友好错误提示
- 💾 **本地缓存与同步**：智能缓存策略，提升用户体验
- 🔄 **Token 身份验证**：安全的用户认证机制
- 🎤 **语音交互**：集成微信语音识别插件
- 📊 **数据可视化**：库存统计与图表展示
- 🔄 **自动状态判断**：根据日期自动判断实验计划状态

## 🛠 技术栈

### 核心框架
- **[Taro 4.1](https://taro.zone/)** - 多端统一开发框架
- **[Vue 3](https://vuejs.org/)** - 渐进式 JavaScript 框架（Composition API）
- **[TypeScript](https://www.typescriptlang.org/)** - 类型安全的 JavaScript 超集

### UI 与样式
- **[Sass](https://sass-lang.com/)** - CSS 预处理器
- **设计规范**：750rpx 响应式设计系统
- **设计风格**：Glassmorphism（毛玻璃效果）+ 渐变色

### 构建工具
- **[Vite](https://vitejs.dev/)** - 下一代前端构建工具
- **代码规范**：ESLint + Stylelint + Husky + lint-staged

### 功能插件
- **微信语音识别插件** (WechatSI) - 语音输入功能
- **qrcode** - 二维码生成
- **weapp-qrcode-canvas-2d** - Canvas 二维码绘制

### 后端对接
- RESTful API 设计
- Token 认证机制
- 统一错误处理（errCode/errorInfo 格式）

## 📁 项目结构

```
no-nutui/
├── src/
│   ├── api/                          # API 接口层
│   │   ├── config.ts                 # API 基础配置
│   │   ├── userapi.ts                # 用户相关接口
│   │   ├── inventoryAPI.ts           # 库存相关接口
│   │   ├── labapi.ts                 # 实验室相关接口
│   │   ├── transactionAPI.ts         # 出入库流水接口
│   │   ├── shareRequestApi.ts        # 耗材共享接口 ⭐ 新增
│   │   └── experimentPlanApi.ts      # 实验计划接口 ⭐ 新增
│   ├── assets/                       # 静态资源
│   │   └── icons/                    # 图标资源（首页/库存/AI/协作/个人）
│   ├── pages/                        # 页面组件
│   │   ├── index/                    # 首页
│   │   ├── profile/                  # 个人中心模块
│   │   │   ├── profile.vue           # 个人中心主页
│   │   │   ├── login/                # 登录页
│   │   │   ├── register/             # 注册页
│   │   │   ├── setting/              # 设置页
│   │   │   ├── laboratory/           # 实验室信息页
│   │   │   └── create-lab/           # 创建实验室页
│   │   ├── inventory/                # 库存管理模块
│   │   │   ├── inventory.vue         # 库存列表（含统计）
│   │   │   ├── inventory-detail/     # 库存详情
│   │   │   ├── inventory-edit/       # 库存编辑
│   │   │   └── inventory-record/     # 出入库记录（主要操作界面）
│   │   ├── ai-chat/                  # AI 聊天助手
│   │   └── collaboration/            # 协作页 ⭐ 重构
│   │       ├── collaboration.vue    # 协作主页（实验计划 + 耗材共享）
│   │       └── experiment-plan/      # 实验计划模块 ⭐ 新增
│   │           ├── experiment-plan.vue           # 计划列表
│   │           ├── experiment-plan-create.vue   # 创建/核对计划
│   │           └── experiment-plan-detail.vue   # 计划详情
│   │       └── share-publish/        # 耗材共享模块 ⭐ 新增
│   │           └── share-publish.vue            # 发布共享
│   ├── app.config.ts                 # 应用配置（路由/TabBar/插件）
│   ├── app.scss                      # 全局样式
│   └── app.ts                        # 应用入口
├── config/                           # Taro 框架配置
│   └── index.ts                      # 编译配置
├── .husky/                           # Git Hooks 配置
├── CLAUDE.md                         # Claude Code 开发指南
├── MEMORY.md                         # 开发记忆文档
├── package.json                      # 项目依赖与脚本
└── tsconfig.json                     # TypeScript 配置
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.x
- npm >= 7.x 或 yarn >= 1.22.x

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 开发模式

**微信小程序**
```bash
npm run dev:weapp
```

**支付宝小程序**
```bash
npm run dev:alipay
```

**H5**
```bash
npm run dev:h5
```

**其他平台**
```bash
npm run dev:swan      # 百度小程序
npm run dev:tt        # 字节跳动小程序
npm run dev:qq        # QQ 小程序
npm run dev:jd        # 京东小程序
npm run dev:rn        # React Native
```

### 生产构建

```bash
npm run build:weapp    # 微信小程序
npm run build:h5       # H5
# 其他平台构建命令同开发模式，将 dev 替换为 build
```

## ⚙️ 配置说明

### API 配置

项目使用**双服务架构**，需要配置两个后端地址：

#### 1. 环境变量配置

在项目根目录创建 `.env.local` 文件（参考 [.env.example](.env.example)）：

```bash
# 后端服务地址 (端口 3000) - 主要业务接口
VITE_BACKEND_BASE_URL=http://localhost:3000

# MCP 服务地址 (端口 3001) - AI 工具接口
VITE_MCP_BASE_URL=http://localhost:3001

# 微信小程序 AppID
TARO_APP_ID=wx069ba97219f66d99
```

#### 2. 生产环境配置

在生产环境中，创建 `.env.production` 文件：

```bash
# 生产环境 API 地址
VITE_BACKEND_BASE_URL=https://your-api.com
VITE_MCP_BASE_URL=https://your-mcp.com
TARO_APP_ID=wxXXXXXXXXXXXXXXXX
```

#### 3. 代码中的使用

```typescript
// src/api/config.ts
import { BACKEND_BASE_URL, MCP_BASE_URL } from './config'

// 后端服务接口 - 用户、库存、实验室、实验计划等业务
const apiUrl = BACKEND_BASE_URL + '/adminapi/inventory/list'

// MCP 服务接口 - AI 智能查询工具
const mcpUrl = MCP_BASE_URL + '/tools/inventory-summary'
```

## 📱 页面说明

### TabBar 页面（底部导航）

| 页面 | 路径 | 功能说明 |
|------|------|----------|
| 首页 | pages/index/index | 系统首页，展示数据统计与快捷入口 |
| AI 助手 | pages/ai-chat/ai-chat | AI 智能聊天助手，支持语音输入 |
| 库存管理 | pages/inventory/inventory | 库存列表（含统计）、搜索、筛选 |
| 计划 | pages/collaboration/collaboration | 实验计划 + 耗材共享协作 ⭐ |
| 我的 | pages/profile/profile | 展示用户信息和菜单入口 |

### 实验计划模块 ⭐ 新增

| 页面 | 路径 | 功能说明 |
|------|------|----------|
| 计划列表 | pages/collaboration/experiment-plan/experiment-plan | 查看所有实验计划，状态自动判断 |
| 创建计划 | pages/collaboration/experiment-plan/experiment-plan-create | 手动创建/AI 生成实验计划，核对耗材清单 |
| 计划详情 | pages/collaboration/experiment-plan/experiment-plan-detail | 查看计划详情，取消实验并归还耗材 |

### 耗材共享模块 ⭐ 新增

| 页面 | 路径 | 功能说明 |
|------|------|----------|
| 协作页 | pages/collaboration/collaboration | 实验计划 + 耗材共享需求大厅 |
| 发布共享 | pages/collaboration/share-publish/share-publish | 发布耗材需求/富余信息 |

### 其他页面

| 页面 | 路径 | 功能说明 |
|------|------|----------|
| 库存详情 | pages/inventory/inventory-detail | 查看库存物品详细信息 |
| 出入库记录 | pages/inventory/inventory-record | **主要操作界面**：领用/归还物品 |
| 库存编辑 | pages/inventory/inventory-edit | 创建/编辑库存物品 |
| 登录 | pages/profile/login/login | 用户登录 |
| 注册 | pages/profile/register/register | 用户注册 |
| 设置 | pages/profile/setting/setting | 编辑个人资料、修改密码 |
| 实验室信息 | pages/profile/laboratory/laboratory | 查看/选择/编辑实验室信息 |
| 创建实验室 | pages/profile/create-lab/create-lab | 创建新实验室 |

## 🔌 API 接口

> **服务架构**：
> - **后端服务** (3000端口): 用户认证、库存管理、实验计划、实验室管理等核心业务
> - **MCP 服务** (3001端口): AI 智能查询工具（库存摘要、过期预警等）
>
> **响应格式**:
> - 成功: `{ errCode: '0', data: {...} }`
> - 失败: `{ errCode: '-1', errorInfo: '错误信息' }`

### 用户相关 (`userapi.ts`)
- `POST /user/login` - 用户登录
- `POST /user/register` - 用户注册
- `POST /user/update-profile` - 更新用户信息
- `POST /user/check-nickname` - 检查昵称可用性
- `POST /upload/image` - 上传文件（头像等）

### 库存相关 (`inventoryAPI.ts`)
- `GET /adminapi/inventory/list` - 获取库存列表（支持搜索）
- `GET /adminapi/inventory/detail/:id` - 获取库存详情
- `GET /adminapi/inventory/search` - 搜索耗材
- `GET /adminapi/inventory/by-code` - 扫码查询
- `GET /adminapi/inventory/alerts` - 获取预警耗材
- `GET /adminapi/inventory/stats` - 库存统计
- `POST /adminapi/inventory/add` - 创建库存物品
- `PUT /adminapi/inventory/update/:id` - 更新库存物品
- `PUT /adminapi/inventory/quantity/:id` - 更新库存数量
  - 参数: `{ quantity: number, operation: 'add' | 'subtract' }`
  - 自动创建出入库流水记录
- `DELETE /adminapi/inventory/delete/:id` - 删除库存物品
- `GET /tools/inventory-summary` - **MCP 服务**: 库存统计摘要

### 实验计划相关 (`experimentPlanApi.ts`) ⭐ 新增
- `GET /adminapi/experiment-plan/list` - 获取实验计划列表（分页）
- `GET /adminapi/experiment-plan/detail/:id` - 获取实验计划详情
- `POST /adminapi/experiment-plan/add` - 创建实验计划
  - 创建时自动扣减库存
- `PUT /adminapi/experiment-plan/update/:id` - 更新实验计划
- `DELETE /adminapi/experiment-plan/delete/:id` - 删除实验计划
  - 取消时先归还耗材再删除

### 耗材共享相关 (`shareRequestApi.ts`) ⭐ 新增
- `GET /adminapi/share-request/list` - 获取需求列表
- `GET /adminapi/share-request/my-shares` - 获取我的共享列表
- `GET /adminapi/share-request/contact/:id` - 获取联系方式
- `POST /adminapi/share-request/add` - 发布共享需求
- `DELETE /adminapi/share-request/delete/:id` - 删除共享需求

### 出入库流水 (`transactionAPI.ts`)
- `GET /adminapi/transaction/list` - 查询流水记录
- `GET /adminapi/transaction/statistics` - 流水统计

> **流水记录自动包含**: 操作人姓名、联系方式、操作时间、数量变化等完整审计信息

### 实验室相关 (`labapi.ts`)
- `GET /lab/list` - 获取实验室列表
- `GET /lab/search` - 搜索实验室
- `GET /lab/detail/:labName` - 获取实验室详情
- `POST /lab/create` - 创建实验室
- `PUT /lab/update/:labName` - 更新实验室信息
- `DELETE /lab/delete/:labName` - 删除实验室

### AI 智能助手
- `POST /ai/chat` - AI 聊天接口
  - 支持自然语言库存查询
  - 自动生成实验计划（返回结构化卡片数据）
  - 自动调用 MCP 工具获取数据

## 🎯 核心功能流程

### 实验计划管理流程

```
方式一：手动创建
┌─────────────────┐
│  计划列表页     │
│  点击"新建计划" │
└────────┬────────┘
         ▼
┌─────────────────┐
│  创建/核对页     │
│  手动填写信息   │
│  从仓库选择耗材 │
│  自动扣减库存   │
└────────┬────────┘
         ▼
    保存计划 ✓

方式二：AI 生成
┌─────────────────┐
│  AI 聊天页       │
│  "下周三做        │
│   Western Blot"  │
└────────┬────────┘
         ▼
┌─────────────────┐
│  AI 生成计划卡片 │
│  显示耗材清单   │
│  [取消] [去核对] │
└────────┬────────┘
         ▼
    点击"去核对"
         ▼
┌─────────────────┐
│  创建/核对页     │
│  预填充 AI 数据  │
│  核对无误保存   │
└─────────────────�

查看详情
┌─────────────────┐
│  计划详情页     │
│  查看完整信息   │
│  点击"取消实验" │
└────────┬────────┘
         ▼
    确认取消
         ▼
┌─────────────────┐
│  归还所有耗材   │
│  删除计划       │
└─────────────────┘
```

### 库存联动机制

| 操作 | 库存变化 | 流水记录 |
|------|----------|----------|
| 创建计划 | 自动扣减 | 消耗出库（consume_out） |
| 取消计划 | 自动归还 | 使用出库（use_out） |
| 领用耗材 | 手动操作 | 使用出库（use_out） |
| 归还耗材 | 手动操作 | 归还入库（return_in） |

## 🌐 服务架构说明

### 双服务设计

```
┌─────────────────┐
│  前端 (no-nutui) │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌──────┐
│ 3000 │  │ 3001 │
│后端  │  │ MCP  │
│服务  │  │ 服务 │
└──────┘  └──────┘
```

**后端服务** (端口 3000):
- 用户认证与授权
- 库存 CRUD 操作
- 实验计划管理 ⭐
- 耗材共享管理 ⭐
- 出入库流水管理
- 实验室管理
- AI 聊天接口

**MCP 服务** (端口 3001):
- `/tools/inventory-summary` - 库存统计摘要
- `/tools/expired-items` - 已过期耗材
- `/tools/expiring-items` - 即将过期耗材
- `/tools/low-stock-items` - 库存不足耗材
- `/tools/out-of-stock-items` - 缺货耗材
- `/tools/search-inventory` - 搜索耗材
- `/tools/check-item` - 检查耗材可用性
- `/tools/purchase-suggestions` - 采购建议

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题，请通过 Issue 联系我们。
