# 实验室库存管理系统

> 基于 Taro + Vue3 + TypeScript 开发的跨平台实验室库存管理小程序，支持微信小程序、支付宝小程序、H5 等多端运行。

## 📋 项目简介

本系统是一个现代化的实验室库存管理解决方案，集成了 **AI 智能助手**、**库存管理**、**出入库记录追踪**、**实验室信息管理**、**多人协作** 等功能，帮助实验室实现高效的库存数字化管理。

## ✨ 功能特性

### 核心功能

#### 🤖 AI 智能助手
- 语音识别输入（微信语音识别插件）
- 智能对话交互
- 库存查询助手
- 操作指南与建议

#### 📦 库存管理
- 库存列表查看与搜索（支持关键词搜索）
- 库存物品详情查看
- 库存物品的创建、编辑、删除
- **出入库操作**：领用（出库）/ 归还（入库）
- 实时库存数量统计
- **出入库记录追踪**：完整的流水记录
- QR 码扫描快速切换物品
- 库存操作智能验证（防止负库存）

#### 🏢 实验室管理
- 实验室信息查看与编辑
- 实验室列表与搜索
- 创建新实验室
- 实验室成员管理

#### 👥 协作功能
- 多用户协作管理库存
- 实时同步库存状态
- 操作记录审计追踪

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
│   │   └── transactionAPI.ts         # 出入库流水接口
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
│   │   └── collaboration/            # 协作页
│   ├── app.config.ts                 # 应用配置（路由/TabBar/插件）
│   ├── app.scss                      # 全局样式
│   └── app.ts                        # 应用入口
├── config/                           # Taro 框架配置
│   └── index.ts                      # 编译配置
├── .husky/                           # Git Hooks 配置
├── CLAUDE.md                         # Claude Code 开发指南
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
在 [src/api/config.ts](src/api/config.ts) 中配置后端 API 地址：

```typescript
export const API_BASE_URL = 'https://your-api.com/api'
```

### 页面路由配置
在 [src/app.config.ts](src/app.config.ts) 中配置页面路由和底部导航栏。

## 📱 页面说明

| 页面 | 路径 | 功能说明 | TabBar |
|------|------|----------|:-----:|
| 首页 | pages/index/index | 系统首页，展示数据统计与快捷入口 | ✅ |
| AI 助手 | pages/ai-chat/ai-chat | AI 智能聊天助手，支持语音输入 | ✅ |
| 库存管理 | pages/inventory/inventory | 库存列表（含统计）、搜索、筛选 | ✅ |
| 库存详情 | pages/inventory/inventory-detail | 查看库存物品详细信息 | ❌ |
| 出入库记录 | pages/inventory/inventory-record | **主要操作界面**：领用/归还物品 | ❌ |
| 库存编辑 | pages/inventory/inventory-edit | 创建/编辑库存物品 | ❌ |
| 协作 | pages/collaboration/collaboration | 多人协作管理 | ✅ |
| 个人中心 | pages/profile/profile | 展示用户信息和菜单入口 | ✅ |
| 登录 | pages/profile/login/login | 用户登录 | ❌ |
| 注册 | pages/profile/register/register | 用户注册 | ❌ |
| 设置 | pages/profile/setting/setting | 编辑个人资料、修改密码 | ❌ |
| 实验室信息 | pages/profile/laboratory/laboratory | 查看/选择/编辑实验室信息 | ❌ |
| 创建实验室 | pages/profile/create-lab/create-lab | 创建新实验室 | ❌ |

## 🔌 API 接口

> **基础 URL**: 配置在 `src/api/config.ts`，默认为 `http://localhost:3000`

> **响应格式**:
> - 成功: `{ errCode: '0', data: {...} }`
> - 失败: `{ errCode: '-1', errorInfo: '错误信息' }`

### 用户相关 (`userapi.ts`)
- `POST /api/user/register` - 用户注册
- `POST /api/user/login` - 用户登录
- `POST /api/user/update` - 更新用户信息
- `POST /api/user/profile` - 获取用户信息
- `POST /api/upload` - 上传文件（头像等）

### 库存相关 (`inventoryAPI.ts`)
- `GET /api/inventory/list` - 获取库存列表（支持搜索）
- `GET /api/inventory/detail/:id` - 获取库存详情
- `POST /api/inventory/create` - 创建库存物品
- `POST /api/inventory/update` - 更新库存物品
- `PUT /api/inventory/quantity/:id` - 更新库存数量
  - 参数: `{ quantity: number, operation: 'add' | 'subtract' }`
  - 自动创建出入库流水记录
- `DELETE /api/inventory/delete/:id` - 删除库存物品

### 出入库流水 (`transactionAPI.ts`)
- `POST /api/transaction/stock-in` - 入库操作
- `POST /api/transaction/stock-out` - 出库操作
- `GET /api/transaction/records` - 查询流水记录
- `DELETE /api/transaction/records/:id` - 删除流水记录

> **流水记录自动包含**: 操作人姓名、联系方式、操作时间、数量变化等完整审计信息

### 实验室相关 (`labapi.ts`)
- `GET /api/lab/list` - 获取实验室列表
- `GET /api/lab/search` - 搜索实验室
- `GET /api/lab/detail/:labName` - 获取实验室详情
- `POST /api/lab/create` - 创建实验室
- `POST /api/lab/update/:labName` - 更新实验室信息
- `DELETE /api/lab/delete/:labName` - 删除实验室

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题，请通过 Issue 联系我们。

---

## 💡 开发指南

### 添加新页面

1. 在 `src/pages/` 下创建页面目录
2. 创建页面组件文件（如 `[page-name].vue` 和 `[page-name].scss`）
3. 在 `src/app.config.ts` 的 `pages` 数组中添加路由
4. 如需添加到 TabBar，在 `tabBar.list` 中配置

### API 开发规范

```typescript
// 1. 在对应的 API 文件中定义接口
export const apiName = API_BASE_URL + '/path/to/api'

// 2. 发起请求
Taro.request({
  url: apiUrl,
  method: 'POST',
  header: {
    'Content-Type': 'application/json',
    Authorization: Taro.getStorageSync('token') || ''
  },
  data: requestData,
  success: (res) => {
    if (res.statusCode === 200 && res.data.errCode === '0') {
      // 成功处理
    }
  }
})
```

### 导航规范

```typescript
// 跳转到新页面
Taro.navigateTo({ url: '/pages/target-page/target-page' })

// 返回上一页
Taro.navigateBack()

// 传递参数
Taro.navigateTo({ url: '/pages/target-page/target-page?id=123&from=profile' })

// 读取参数
const instance = Taro.getCurrentInstance()
const params = instance.router?.params
```

### 存储规范

```typescript
// 设置存储
Taro.setStorageSync('key', value)

// 获取存储
const value = Taro.getStorageSync('key')

// 删除存储
Taro.removeStorageSync('key')
```

**常用存储键名**:
- `token` - 认证令牌
- `user_id` - 当前用户 ID
- `userInfo` - 完整用户对象
- `labName` - 当前实验室名称
- `laboratoryInfo` - 实验室信息缓存

### 样式规范

- 设计宽度: **750rpx**
- 主色调: `#1E90FF` (Dodger Blue)
- 背景渐变: `#F0F5FA` → `#E8EEF5` → `#D9E6F2`
- 毛玻璃效果: `backdrop-filter: blur(20rpx)`
- 页面容器类: `[page-name]-page`
- 区块类: `setting-section`
- 列表项: `setting-item`
- 按钮: `btn-primary`, `btn-secondary`
