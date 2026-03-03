<template>
    <view class="profile-page">
        <!-- 个人中心容器 -->
        <view class="profile-container">
            <!-- 头部信息 -->
            <view class="profile-header">
                <!-- 圆形装饰 -->
                <view class="circle-deco-1"></view>
                <view class="circle-deco-2"></view>

                <view class="avatar-wrapper">
                    <image
                        v-if="userInfo.avatar"
                        :src="userInfo.avatar"
                        class="avatar-image"
                        mode="aspectFill"
                    />
                    <text v-else class="avatar-placeholder">{{ firstChar }}</text>
                </view>
                <text class="nickname">{{ userInfo.nickName || '未登录' }}</text>

                <!-- 标签 -->
                <view class="tags" v-if="isLoggedIn">
                    <view class="tag tag-primary">{{ roleText }}</view>
                    <view class="tag tag-success">已认证</view>
                </view>
            </view>

            <!-- 数据统计卡片 -->
            <view class="stats-card" v-if="isLoggedIn">
                <view class="stat-item">
                    <text class="stat-value">128</text>
                    <text class="stat-label">库存</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item">
                    <text class="stat-value">56</text>
                    <text class="stat-label">协作</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item">
                    <text class="stat-value">89</text>
                    <text class="stat-label">计划</text>
                </view>
            </view>

            <!-- 功能菜单 -->
            <view class="menu-section" v-if="isLoggedIn">
                <view
                    class="menu-item"
                    @tap="handleMenuClick('settings')"
                >
                    <text class="menu-icon">⚙️</text>
                    <text class="menu-label">设置</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider"></view>
                <view
                    class="menu-item"
                    @tap="handleMenuClick('feedback')"
                >
                    <text class="menu-icon">💬</text>
                    <text class="menu-label">反馈</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider"></view>
                <view
                    class="menu-item"
                    @tap="handleMenuClick('help')"
                >
                    <text class="menu-icon">❓</text>
                    <text class="menu-label">帮助</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider"></view>
                <view
                    class="menu-item"
                    @tap="handleMenuClick('about')"
                >
                    <text class="menu-icon">ℹ️</text>
                    <text class="menu-label">关于</text>
                    <text class="menu-arrow">›</text>
                </view>
            </view>

            <!-- 登录提示（未登录状态） -->
            <view class="login-prompt" v-if="!isLoggedIn">
                <text class="prompt-text">登录后查看更多信息</text>
                <view class="login-btn" @tap="handleLogin">
                    <text>立即登录</text>
                </view>
            </view>

            <!-- 退出登录按钮 -->
            <view
                class="logout-btn"
                v-if="isLoggedIn"
                @tap="handleLogout"
            >
                <text>退出登录</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useDidShow } from '@tarojs/taro'
import './profile.scss'

// 用户信息
const userInfo = ref({
    nickName: '',
    avatar: '',
    role: 'user'
})

// 角色中文映射
const roleMap = {
    admin: '管理员',
    manager: '管理者',
    user: '普通用户'
}

// 是否已登录
const isLoggedIn = computed(() => {
    return !!(userInfo.value.nickName && userInfo.value.nickName !== '未登录')
})

// 昵称首字母
const firstChar = computed(() => {
    const name = userInfo.value.nickName || '未'
    return name.charAt(0).toUpperCase()
})

// 角色文本
const roleText = computed(() => {
    return roleMap[userInfo.value.role] || '未知角色'
})

// 获取用户信息
const getUserInfo = () => {
    try {
        const storedUserInfo = Taro.getStorageSync('userInfo')
        if (storedUserInfo) {
            userInfo.value = storedUserInfo
        }
    } catch (e) {
        console.error('获取用户信息失败:', e)
    }
}

// 页面加载时获取用户信息
onMounted(() => {
    getUserInfo()
})

// 页面显示时重新获取用户信息
useDidShow(() => {
    getUserInfo()
})

// 跳转到登录页
const handleLogin = () => {
    Taro.navigateTo({
        url: '/pages/login/login'
    })
}

// 菜单点击
const handleMenuClick = (type) => {
    console.log('点击菜单:', type)

    // 目前所有菜单都跳转到设置页
    Taro.navigateTo({
        url: '/pages/setting/setting'
    })
}

// 退出登录
const handleLogout = () => {
    Taro.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
            if (res.confirm) {
                try {
                    Taro.removeStorageSync('token')
                    Taro.removeStorageSync('userInfo')
                    Taro.removeStorageSync('user_id')

                    // 清空当前用户信息
                    userInfo.value = {
                        nickName: '',
                        avatar: '',
                        role: 'user'
                    }

                    Taro.showToast({
                        title: '已退出登录',
                        icon: 'success'
                    })

                    setTimeout(() => {
                        Taro.reLaunch({
                            url: '/pages/login/login'
                        })
                    }, 1500)
                } catch (e) {
                    console.error('退出登录失败:', e)
                }
            }
        }
    })
}
</script>
