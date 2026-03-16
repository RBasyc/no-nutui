// API 基础配置
// 从环境变量获取 API 地址，如果未设置则使用默认值
// 请在 .env.local 文件中配置对应的环境变量

// 后端服务地址 (端口 3000) - 主要业务接口
export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3000'
// export const BACKEND_BASE_URL = 'http://192.168.0.31:3000'

// MCP 服务地址 (端口 3001) - AI 工具接口
export const MCP_BASE_URL = import.meta.env.VITE_MCP_BASE_URL || 'http://localhost:3001'
// export const MCP_BASE_URL = 'http://192.168.0.31:3001'

// 兼容旧代码，统一使用 BACKEND_BASE_URL
export const API_BASE_URL = BACKEND_BASE_URL
