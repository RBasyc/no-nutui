// API 基础配置
// 从环境变量获取 API 地址，如果未设置则使用默认值
// 请在 .env.local 文件中配置 VITE_API_BASE_URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// 示例配置（请勿在代码中硬编码生产环境地址）
// 开发环境：http://localhost:3000
// 生产环境：在 .env.production 中配置
