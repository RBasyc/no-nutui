// API 基础配置
// 从环境变量获取 API 地址，必须显式配置
// Taro 使用 VITE_ 前缀的环境变量

// 后端 API 服务地址 (端口 3000) - 主要业务逻辑
export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

// MCP HTTP 服务器地址 (端口 3001) - AI 集成接口
export const MCP_BASE_URL = import.meta.env.VITE_MCP_BASE_URL;

