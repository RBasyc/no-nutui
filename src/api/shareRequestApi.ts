import { BACKEND_BASE_URL } from './config'

const shareRequestApi = {
    list: BACKEND_BASE_URL + '/adminapi/share-request/list',
    myShares: BACKEND_BASE_URL + '/adminapi/share-request/my-shares',
    detail: (id: string) => BACKEND_BASE_URL + `/adminapi/share-request/detail/${id}`,
    add: BACKEND_BASE_URL + '/adminapi/share-request/add',
    update: (id: string) => BACKEND_BASE_URL + `/adminapi/share-request/update/${id}`,
    delete: (id: string) => BACKEND_BASE_URL + `/adminapi/share-request/delete/${id}`,
    consult: (id: string) => BACKEND_BASE_URL + `/adminapi/share-request/consult/${id}`,
    contact: (id: string) => BACKEND_BASE_URL + `/adminapi/share-request/contact/${id}`
}

export default shareRequestApi
