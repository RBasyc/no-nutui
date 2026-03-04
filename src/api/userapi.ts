import { API_BASE_URL } from './config'

const userApi = {
    login: API_BASE_URL + '/user/login',
    register: API_BASE_URL + '/user/register',
    checkNickname: API_BASE_URL + '/user/check-nickname',
    updateProfile: API_BASE_URL + '/user/update-profile',
    upload: API_BASE_URL + '/upload/image',
}

export default userApi
