import { BACKEND_BASE_URL } from './config'

const statisticsApi = {
  overview: BACKEND_BASE_URL + '/adminapi/statistics/overview',
  category: BACKEND_BASE_URL + '/adminapi/statistics/category',
  trend: BACKEND_BASE_URL + '/adminapi/statistics/trend',
  transactionSummary: BACKEND_BASE_URL + '/adminapi/statistics/transaction-summary',
  topConsumed: BACKEND_BASE_URL + '/adminapi/statistics/top-consumed'
}

export default statisticsApi
