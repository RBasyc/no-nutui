const baseURL = 'http://localhost:3000'
// const baseURL = 'http://192.168.67.48:3000'

const userApi = {
    login: baseURL + '/user/login',
    register: baseURL + '/user/register',
    checkNickname: baseURL + '/user/check-nickname',
    upload: baseURL + '/upload/image',
    updateProfile: baseURL + '/user/update-profile'
}

export default userApi
