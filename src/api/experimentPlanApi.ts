import { BACKEND_BASE_URL } from './config'

const experimentPlanApi = {
    list: BACKEND_BASE_URL + '/adminapi/experiment-plan/list',
    detail: (id: string) => BACKEND_BASE_URL + `/adminapi/experiment-plan/detail/${id}`,
    add: BACKEND_BASE_URL + '/adminapi/experiment-plan/add',
    update: (id: string) => BACKEND_BASE_URL + `/adminapi/experiment-plan/update/${id}`,
    updateProgress: (id: string) => BACKEND_BASE_URL + `/adminapi/experiment-plan/progress/${id}`,
    delete: (id: string) => BACKEND_BASE_URL + `/adminapi/experiment-plan/delete/${id}`,
    statistics: BACKEND_BASE_URL + '/adminapi/experiment-plan/statistics'
}

export default experimentPlanApi
