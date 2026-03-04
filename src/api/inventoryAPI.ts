import { API_BASE_URL } from './config'

const inventoryApi = {
  list: API_BASE_URL + '/adminapi/inventory/list',
  search: API_BASE_URL + '/adminapi/inventory/search',
  getByCode: API_BASE_URL + '/adminapi/inventory/by-code',
  alerts: API_BASE_URL + '/adminapi/inventory/alerts',
  detail: (id: string) => API_BASE_URL + `/adminapi/inventory/detail/${id}`,
  add: API_BASE_URL + '/adminapi/inventory/add',
  update: (id: string) => API_BASE_URL + `/adminapi/inventory/update/${id}`,
  quantity: (id: string) => API_BASE_URL + `/adminapi/inventory/quantity/${id}`,
  delete: (id: string) => API_BASE_URL + `/adminapi/inventory/delete/${id}`,
  stats: API_BASE_URL + '/adminapi/inventory/stats'
}

export default inventoryApi
