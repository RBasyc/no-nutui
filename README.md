# 实验室库存管理系统

基于 Taro + Vue3 + TypeScript 开发的跨平台实验室库存管理小程序，支持微信小程序、支付宝小程序、H5 等多端运行。

## 📋 项目简介

本系统旨在为实验室提供便捷的库存管理解决方案，支持库存物品的增删改查、出入库记录、实验室信息管理、多人协作等功能。

## ✨ 功能特性

### 核心功能
- **用户管理**：用户注册、登录、个人信息管理
- **库存管理**：
  - 库存列表查看与搜索
  - 库存物品详情查看
  - 库存物品的创建、编辑、删除
  - 出入库记录追踪
- **实验室管理**：
  - 实验室信息查看与编辑
  - 实验室列表与搜索
  - 创建新实验室
- **协作功能**：多用户协作管理库存
- **设置中心**：个人资料编辑、头像上传、密码修改

### 技术亮点
- 🎨 精美的 UI 设计，采用毛玻璃效果和渐变色
- 📱 响应式布局，适配多种屏幕尺寸
- 🔐 完善的表单验证机制
- 💾 本地缓存与服务器数据同步
- 🔄 支持 Token 身份验证

## 🛠 技术栈

- **框架**：[Taro 4.1](https://taro.zone/) - 多端开发框架
- **UI 框架**：[Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- **语言**：[TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集
- **样式**：[Sass](https://sass-lang.com/) - CSS 预处理器
- **构建工具**：[Vite](https://vitejs.dev/) - 下一代前端构建工具
- **代码规范**：ESLint + Stylelint + Husky + lint-staged
- **其他**：
  - qrcode - 二维码生成
  - weapp-qrcode-canvas-2d - Canvas 二维码绘制

## 📁 项目结构

```
no-nutui/
├── src/
│   ├── api/              # API 接口
│   │   ├── config.ts     # API 配置
│   │   ├── userapi.ts    # 用户相关接口
│   │   ├── inventoryAPI.ts # 库存相关接口
│   │   └── labapi.ts     # 实验室相关接口
│   ├── assets/           # 静态资源
│   │   └── icons/        # 图标资源
│   ├── pages/            # 页面
│   │   ├── index/        # 首页
│   │   ├── login/        # 登录页
│   │   ├── register/     # 注册页
│   │   ├── profile/      # 个人中心
│   │   ├── setting/      # 设置页
│   │   ├── inventory/    # 库存列表
│   │   ├── inventory-detail/ # 库存详情
│   │   ├── inventory-edit/   # 库存编辑
│   │   ├── inventory-record/ # 出入库记录
│   │   ├── laboratory/   # 实验室信息
│   │   ├── create-lab/   # 创建实验室
│   │   └── collaboration/ # 协作页
│   ├── app.config.ts     # 应用配置
│   ├── app.scss          # 全局样式
│   └── app.ts            # 应用入口
├── config/               # Taro 配置
├── package.json          # 项目依赖
└── tsconfig.json         # TypeScript 配置
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

| 页面 | 路径 | 功能说明 |
|------|------|----------|
| 首页 | pages/index/index | 系统首页，展示快捷入口 |
| 登录 | pages/login/login | 用户登录 |
| 注册 | pages/register/register | 用户注册 |
| 个人中心 | pages/profile/profile | 展示用户信息和菜单入口 |
| 设置 | pages/setting/setting | 编辑个人资料 |
| 库存列表 | pages/inventory/inventory | 查看和管理库存物品 |
| 库存详情 | pages/inventory-detail/inventory-detail | 查看库存物品详情 |
| 库存编辑 | pages/inventory-edit/inventory-edit | 创建/编辑库存物品 |
| 出入库记录 | pages/inventory-record/inventory-record | 查看出入库历史记录 |
| 实验室信息 | pages/laboratory/laboratory | 查看/编辑实验室信息 |
| 创建实验室 | pages/create-lab/create-lab | 创建新实验室 |
| 协作 | pages/collaboration/collaboration | 多人协作管理 |

## 🔐 API 接口

### 用户相关
- `POST /api/user/register` - 用户注册
- `POST /api/user/login` - 用户登录
- `POST /api/user/update` - 更新用户信息
- `POST /api/upload` - 上传文件（头像等）

### 库存相关
- `GET /api/inventory/list` - 获取库存列表
- `GET /api/inventory/detail/:id` - 获取库存详情
- `POST /api/inventory/create` - 创建库存物品
- `POST /api/inventory/update` - 更新库存物品
- `DELETE /api/inventory/delete/:id` - 删除库存物品

### 实验室相关
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
