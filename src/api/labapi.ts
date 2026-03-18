import { BACKEND_BASE_URL } from './config'

const labApi = {
    list: BACKEND_BASE_URL + '/lab/list',
    search: BACKEND_BASE_URL + '/lab/search',
    detail: (labName: string) => BACKEND_BASE_URL + `/lab/detail/${encodeURIComponent(labName)}`,
    create: BACKEND_BASE_URL + '/lab/create',
    update: (labName: string) => BACKEND_BASE_URL + `/lab/update/${encodeURIComponent(labName)}`,
    delete: (labName: string) => BACKEND_BASE_URL + `/lab/delete/${encodeURIComponent(labName)}`
}

export default labApi
