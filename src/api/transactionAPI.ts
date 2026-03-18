import { BACKEND_BASE_URL } from './config'

/**
 * 出入库操作 API
 */
const transactionApi = {
  // 入库操作
  stockIn: BACKEND_BASE_URL + '/adminapi/transaction/stock-in',

  // 出库操作
  stockOut: BACKEND_BASE_URL + '/adminapi/transaction/stock-out',

  // 查询流水记录
  records: BACKEND_BASE_URL + '/adminapi/transaction/records',

  // 删除流水记录
  deleteRecord: (id: string) => BACKEND_BASE_URL + `/adminapi/transaction/records/${id}`
}

export default transactionApi
