const baseURL = 'http://localhost:3000'
// const baseURL = 'http://192.168.67.48:3000'

const inventoryApi = {
  list: baseURL + '/adminapi/inventory/list',
  search: baseURL + '/adminapi/inventory/search',
  alerts: baseURL + '/adminapi/inventory/alerts',
  detail: (id: string) => baseURL + `/adminapi/inventory/detail/${id}`,
  add: baseURL + '/adminapi/inventory/add',
  update: (id: string) => baseURL + `/adminapi/inventory/update/${id}`,
  quantity: (id: string) => baseURL + `/adminapi/inventory/quantity/${id}`,
  delete: (id: string) => baseURL + `/adminapi/inventory/delete/${id}`,
  stats: baseURL + '/adminapi/inventory/stats'
}

export default inventoryApi
