# 安全配置指南

## 🔒 敏感信息保护

本项目已进行安全配置，确保敏感信息不会泄露到公开仓库中。

### ✅ 已完成的安全措施

1. **.gitignore 配置**
   - 排除所有 `.env` 和 `.env.*.local` 文件
   - 排除日志、缓存、构建产物等
   - 排除 IDE 配置文件

2. **环境变量管理**
   - 创建 `.env.example` 作为配置模板
   - 敏感配置通过环境变量管理
   - 不同环境使用不同的配置文件

3. **API 配置优化**
   - 移除硬编码的生产服务器 IP
   - 使用 `import.meta.env` 读取环境变量
   - 默认使用本地开发地址

---

## 📝 部署前必做配置

### 第一步：创建本地配置文件

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

### 第二步：配置环境变量

编辑 `.env.local` 文件，填入真实值：

```bash
# API 地址（开发环境）
VITE_API_BASE_URL=http://localhost:3000

# 微信小程序 AppID
TARO_APP_ID=wx069ba97219f66d99
```

### 第三步：配置生产环境（可选）

如果需要部署到生产环境，编辑 `.env.production`：

```bash
# 生产环境 API 地址
VITE_API_BASE_URL=https://your-production-api.com

# 生产环境 AppID
TARO_APP_ID=wxXXXXXXXXXXXXXXXX
```

---

## 🚀 不同环境的配置

### 开发环境
文件：`.env.development`
```bash
VITE_API_BASE_URL=http://localhost:3000
TARO_APP_ID=wx069ba97219f66d99
```

### 测试环境
文件：`.env.test`
```bash
VITE_API_BASE_URL=http://test-api.example.com
TARO_APP_ID=wxXXXXXXXXXXXXXXXX
```

### 生产环境
文件：`.env.production`
```bash
VITE_API_BASE_URL=https://api.example.com
TARO_APP_ID=wxXXXXXXXXXXXXXXXX
```

---

## ⚠️ 安全注意事项

### 不要提交到 Git 的文件

以下文件已在 `.gitignore` 中排除，**切勿强制提交**：

- `.env` - 所有环境变量
- `.env.local` - 本地覆盖配置
- `.env.*.local` - 特定环境的本地配置
- `*.log` - 日志文件
- `dist/` - 构建产物

### 代码中的敏感信息

**❌ 错误做法：**
```typescript
// 硬编码敏感信息
const API_KEY = 'sk-xxxxxxxxxxxxxxxx'
const DB_PASSWORD = 'password123'
const SERVER_IP = '106.52.20.209'
```

**✅ 正确做法：**
```typescript
// 使用环境变量
const API_KEY = import.meta.env.VITE_API_KEY
const DB_PASSWORD = import.meta.env.VITE_DB_PASSWORD
const SERVER_IP = import.meta.env.VITE_SERVER_IP
```

---

## 🔐 生产环境安全检查清单

在部署到生产环境前，请确认：

- [ ] 已移除所有硬编码的 API 地址、密钥
- [ ] 已配置 `.env.production` 文件
- [ ] 已更新 `.env.production` 中的 AppID
- [ ] `.env.local` 和其他敏感文件未被提交
- [ ] 检查 `git status` 确认没有未追踪的敏感文件
- [ ] 生产环境 API 使用 HTTPS 协议
- [ ] 已设置适当的 CORS 策略
- [ ] 已配置服务器端的安全验证

---

## 📂 环境变量说明

| 变量名 | 说明 | 示例 | 获取方式 |
|--------|------|------|----------|
| `VITE_API_BASE_URL` | 后端 API 基础地址 | `http://localhost:3000` | 根据部署环境配置 |
| `TARO_APP_ID` | 微信小程序 AppID | `wx069ba97219f66d99` | 微信公众平台 → 开发 → 开发设置 |

> **注意**: 微信小程序 AppID 已通过环境变量管理，不会暴露在代码仓库中。

### 使用方法

在代码中访问环境变量：

```typescript
// Vite 环境变量（必须以 VITE_ 开头）
const apiUrl = import.meta.env.VITE_API_BASE_URL

// Taro 环境变量
const appId = process.env.TARO_APP_ID
```

---

## 🛠️ 常见问题

### Q: 为什么我的环境变量不生效？
**A:** 确保：
1. 变量名以 `VITE_` 开头（客户端代码）
2. 重启了开发服务器
3. 没有在 `.env.local` 中覆盖

### Q: 如何检查是否已提交敏感信息？
**A:** 运行以下命令检查：
```bash
# 检查 Git 历史
git log --all --full-history --source -- "*.env"

# 检查当前状态
git status

# 搜索可能的敏感信息
git grep "106.52.20.209"
git grep "sk-"
```

### Q: 如果已经提交了敏感信息怎么办？
**A:** 需要从 Git 历史中完全删除：
```bash
# 使用 git-filter-repo 工具
pip install git-filter-repo
git filter-repo --invert-paths --path .env.local

# 或者使用 BFG Repo-Cleaner
# 然后强制推送：git push --force
```

---

## 📞 需要帮助？

如有安全问题或疑问，请：
1. 查看 [SECURITY.md](./SECURITY.md)
2. 提交 Issue 并标注 "security" 标签

---

**最后更新**: 2026-03-12
