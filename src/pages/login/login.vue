<template>
    <view class="login-page">
        <!-- 登录容器 -->
        <view class="login-container">
            <!-- Logo 和标题 -->
            <view class="login-header">
                <view class="logo-wrapper">
                    <text class="logo-text">Lab</text>
                </view>
                <text class="app-name">Lab 智管</text>
                <text class="app-subtitle">实验室耗材智能管理系统</text>
            </view>

            <!-- 登录表单 -->
            <view class="login-form">
                <!-- 昵称输入 -->
                <view class="form-group">
                    <text class="form-label">昵称</text>
                    <view class="input-wrapper" :class="{ 'input-error': errors.nickname, 'input-focused': focused.nickname }">
                        <text class="input-icon">👤</text>
                        <input
                            v-model="formData.nickname"
                            type="text"
                            placeholder="请输入昵称"
                            class="form-input"
                            :disabled="loading"
                            @focus="focused.nickname = true"
                            @blur="handleNicknameBlur"
                        />
                    </view>
                    <text v-if="errors.nickname" class="error-text">{{ errors.nickname }}</text>
                </view>

                <!-- 密码输入 -->
                <view class="form-group">
                    <text class="form-label">密码</text>
                    <view class="input-wrapper" :class="{ 'input-error': errors.password, 'input-focused': focused.password }">
                        <text class="input-icon">🔒</text>
                        <input
                            v-model="formData.password"
                            :type="showPassword ? 'text' : 'password'"
                            placeholder="请输入密码"
                            class="form-input"
                            :disabled="loading"
                            @focus="focused.password = true"
                            @blur="handlePasswordBlur"
                        />
                        <text class="toggle-icon" @tap="togglePassword">
                            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                        </text>
                    </view>
                    <text v-if="errors.password" class="error-text">{{ errors.password }}</text>
                </view>

                <!-- 登录按钮 -->
                <view
                    class="login-btn"
                    :class="{ 'btn-loading': loading, 'btn-disabled': !isFormValid }"
                    @tap="handleLogin"
                >
                    <text v-if="!loading">登录</text>
                    <view v-else class="loading-spinner"></view>
                </view>

                <!-- 底部链接 -->
                <view class="form-footer">
                    <text class="link-text" @tap="handleRegister">注册账号</text>
                    <text class="divider">|</text>
                    <text class="link-text" @tap="handleForgotPassword">忘记密码</text>
                </view>
            </view>

            <!-- 装饰线条 -->
            <view class="decoration-line"></view>
        </view>

        <!-- 底部版本 -->
        <view class="footer">
            <text class="footer-text">Version 1.0.0</text>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import Taro from '@tarojs/taro'
import userApi from '../../api/userapi'
import './login.scss'

// 表单数据
const formData = ref({
    nickname: '',
    password: ''
})

// 错误信息
const errors = ref({
    nickname: '',
    password: ''
})

// 焦点状态
const focused = ref({
    nickname: false,
    password: false
})

// 其他状态
const loading = ref(false)
const showPassword = ref(false)

// 表单验证
const handleNicknameBlur = () => {
    const nickname = formData.value.nickname.trim()
    if (!nickname) {
        errors.value.nickname = '请输入昵称'
        return false
    }
    if (nickname.length < 2) {
        errors.value.nickname = '昵称至少需要2个字符'
        return false
    }
    errors.value.nickname = ''
    focused.value.nickname = false
    return true
}

const handlePasswordBlur = () => {
    const password = formData.value.password
    if (!password) {
        errors.value.password = '请输入密码'
        return false
    }
    if (password.length < 6) {
        errors.value.password = '密码至少需要6位'
        return false
    }
    errors.value.password = ''
    focused.value.password = false
    return true
}

// 表单是否有效
const isFormValid = computed(() => {
    return formData.value.nickname &&
           formData.value.password &&
           !errors.value.nickname &&
           !errors.value.password
})

// 切换密码显示
const togglePassword = () => {
    showPassword.value = !showPassword.value
}

// 登录处理
const handleLogin = async () => {
    console.log('登录按钮被点击')
    console.log('表单数据:', formData.value)
    console.log('表单验证状态:', {
        nickname: formData.value.nickname,
        password: formData.value.password,
        errors: errors.value
    })

    if (!handleNicknameBlur() || !handlePasswordBlur()) {
        console.log('表单验证失败')
        return
    }

    if (loading.value) {
        console.log('正在加载中，忽略重复点击')
        return
    }

    console.log('开始登录请求...')
    loading.value = true

    try {
        const res = await Taro.request({
            url: userApi.login,
            method: 'POST',
            data: {
                nickName: formData.value.nickname,  // 注意：使用 nickName (驼峰命名)
                password: formData.value.password
            },
            header: {
                'Content-Type': 'application/json'
            }
        })

        console.log('登录响应:', res)

        // 检查 HTTP 状态码
        if (res.statusCode === 200) {
            if (res.data && res.data.token) {
                // 保存 token 和用户信息
                Taro.setStorageSync('token', res.data.token)
                Taro.setStorageSync('userInfo', res.data.userInfo)
                Taro.setStorageSync('user_id', res.data.userInfo._id)

                // 检查是否首次登录（没有手机号）
                if (!res.data.userInfo.phone) {
                    Taro.showToast({
                        title: '首次登录请完善信息',
                        icon: 'success'
                    })
                    setTimeout(() => {
                        Taro.navigateTo({
                            url: '/pages/setting/setting'
                        })
                    }, 1500)
                } else {
                    Taro.showToast({
                        title: '登录成功',
                        icon: 'success',
                        duration: 1500
                    })
                    setTimeout(() => {
                        Taro.switchTab({
                            url: '/pages/index/index'
                        })
                    }, 1500)
                }
            } else {
                Taro.showToast({
                    title: '登录失败：数据格式错误',
                    icon: 'none',
                    duration: 2000
                })
            }
        } else {
            // HTTP 状态码非 200
            const errorMsg = res.data?.message || res.data?.errorInfo || `登录失败(未知错误)`
            Taro.showToast({
                title: errorMsg,
                icon: 'none',
                duration: 2000
            })
        }
    } catch (error) {
        console.error('网络请求失败:', error)
        Taro.showToast({
            title: '网络连接失败',
            icon: 'none',
            duration: 2000
        })
    } finally {
        loading.value = false
    }
}

// 忘记密码
const handleForgotPassword = () => {
    Taro.showToast({
        title: '功能开发中',
        icon: 'none'
    })
}

// 注册
const handleRegister = () => {
    Taro.navigateTo({
        url: '/pages/register/register'
    })
}
</script>
