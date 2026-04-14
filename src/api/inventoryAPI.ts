import { BACKEND_BASE_URL } from './config'

const inventoryApi = {
  // 后端服务接口 (端口 3000)
  list: BACKEND_BASE_URL + '/adminapi/inventory/list',
  search: BACKEND_BASE_URL + '/adminapi/inventory/search',
  batchMatch: BACKEND_BASE_URL + '/adminapi/inventory/batch-match', // ✅ 新增
  getByCode: BACKEND_BASE_URL + '/adminapi/inventory/by-code',
  alerts: BACKEND_BASE_URL + '/adminapi/inventory/alerts',
  detail: (id: string) => BACKEND_BASE_URL + `/adminapi/inventory/detail/${id}`,
  add: BACKEND_BASE_URL + '/adminapi/inventory/add',
  update: (id: string) => BACKEND_BASE_URL + `/adminapi/inventory/update/${id}`,
  quantity: (id: string) => BACKEND_BASE_URL + `/adminapi/inventory/quantity/${id}`,
  delete: (id: string) => BACKEND_BASE_URL + `/adminapi/inventory/delete/${id}`,
  stats: BACKEND_BASE_URL + '/adminapi/inventory/stats',
  aiAlert: BACKEND_BASE_URL + '/adminapi/inventory-alert' // ✅ AI智能预警
}

export default inventoryApi
