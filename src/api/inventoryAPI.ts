import { BACKEND_BASE_URL, MCP_BASE_URL } from './config'

const inventoryApi = {
  // 后端服务接口 (端口 3000)
  list: BACKEND_BASE_URL + '/adminapi/inventory/list',
  search: BACKEND_BASE_URL + '/adminapi/inventory/search',
  getByCode: BACKEND_BASE_URL + '/adminapi/inventory/by-code',
  alerts: BACKEND_BASE_URL + '/adminapi/inventory/alerts',
  detail: (id: string) => BACKEND_BASE_URL + `/adminapi/inventory/detail/${id}`,
  add: BACKEND_BASE_URL + '/adminapi/inventory/add',
  update: (id: string) => BACKEND_BASE_URL + `/adminapi/inventory/update/${id}`,
  quantity: (id: string) => BACKEND_BASE_URL + `/adminapi/inventory/quantity/${id}`,
  delete: (id: string) => BACKEND_BASE_URL + `/adminapi/inventory/delete/${id}`,
  stats: BACKEND_BASE_URL + '/adminapi/inventory/stats',

  // MCP 服务接口 (端口 3001)
  summary: MCP_BASE_URL + '/tools/inventory-summary'
}

export default inventoryApi
