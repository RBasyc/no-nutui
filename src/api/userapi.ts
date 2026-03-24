import { BACKEND_BASE_URL } from './config'

const userApi = {
    login: BACKEND_BASE_URL + '/user/login',
    register: BACKEND_BASE_URL + '/user/register',
    checkNickname: BACKEND_BASE_URL + '/user/check-nickname',
    updateProfile: BACKEND_BASE_URL + '/user/update-profile',
    uploadAvatar: BACKEND_BASE_URL + '/upload/avatar',
}

export default userApi
