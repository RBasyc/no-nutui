import Taro from '@tarojs/taro'

/**
 * 处理token过期 - 清除本地存储并跳转到登录页
 */
export const handleTokenExpired = () => {
    console.log('检测到token过期，准备退出登录...')

    // 清除本地存储
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('user_id')
    Taro.removeStorageSync('userInfo')
    Taro.removeStorageSync('labName')
    Taro.removeStorageSync('laboratoryInfo')

    // 显示提示
    Taro.showModal({
        title: '登录已过期',
        content: '您的登录已过期，请重新登录',
        showCancel: false,
        success: () => {
            // 跳转到登录页，使用reLaunch清空页面栈
            Taro.reLaunch({
                url: '/pages/profile/login/login'
            })
        }
    })
}

/**
 * 检查响应是否为token过期
 * @param errorInfo - 错误信息字符串
 * @returns {boolean} - 是否为token过期
 */
export const checkTokenExpired = (errorInfo: string): boolean => {
    if (!errorInfo) return false

    const tokenExpiredKeywords = [
        'token过期',
        'token expired',
        '未授权',
        'Unauthorized',
        '401',
        'invalid token',
        '令牌过期',
        '登录过期'
    ]

    const isTokenExpired = tokenExpiredKeywords.some(keyword =>
        errorInfo.toLowerCase().includes(keyword.toLowerCase())
    )

    if (isTokenExpired) {
        handleTokenExpired()
        return true
    }

    return false
}

/**
 * 包装API请求，自动处理token过期
 * @param requestFn - 返回Promise的请求函数
 * @returns Promise
 */
export const withTokenCheck = async <T = any>(
    requestFn: () => Promise<T>
): Promise<T> => {
    try {
        return await requestFn()
    } catch (error: any) {
        // 检查错误信息中是否包含token过期相关内容
        if (error.message && checkTokenExpired(error.message)) {
            throw new Error('Token expired')
        }
        throw error
    }
}
