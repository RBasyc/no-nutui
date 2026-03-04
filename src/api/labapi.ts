import { API_BASE_URL } from './config'

const labApi = {
    list: API_BASE_URL + '/lab/list',
    search: API_BASE_URL + '/lab/search',
    detail: (labName: string) => API_BASE_URL + `/lab/detail/${encodeURIComponent(labName)}`,
    create: API_BASE_URL + '/lab/create',
    update: (labName: string) => API_BASE_URL + `/lab/update/${encodeURIComponent(labName)}`,
    delete: (labName: string) => API_BASE_URL + `/lab/delete/${encodeURIComponent(labName)}`
}

export default labApi
