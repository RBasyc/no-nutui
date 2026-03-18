<template>
    <view class="profile-page">
        <!-- 个人中心容器 -->
        <view class="profile-container">
            <!-- 头部信息 -->
            <view class="profile-header">
                <!-- 圆形装饰 -->
                <view class="circle-deco-1"></view>
                <view class="circle-deco-2"></view>

                <!-- 实验室标识 -->
                <view class="lab-badge">
                    <text>Lab {{ currentLabName || '未加入' }}</text>
                </view>

                <view class="avatar-wrapper">
                    <image
                        v-if="userInfo.avatar"
                        :src="userInfo.avatar"
                        class="avatar-image"
                        mode="aspectFill"
                    />
                    <text v-else class="avatar-placeholder">{{
                        firstChar
                    }}</text>
                </view>
                <text class="nickname">{{
                    userInfo.nickName || '未登录'
                }}</text>

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
                <view class="menu-item" @tap="handleMenuClick('settings')">
                    <text class="menu-icon">⚙️</text>
                    <text class="menu-label">个人信息</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider"></view>
                <view class="menu-item" @tap="handleMenuClick('laboratory')">
                    <text class="menu-icon">💬</text>
                    <text class="menu-label">实验室</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider"></view>
                <view class="menu-item" @tap="handleMenuClick('statistics')">
                    <text class="menu-icon">📊</text>
                    <text class="menu-label">数据统计</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider"></view>
                <!-- 实验室审批功能 - 仅管理员可见 -->
                <view v-if="currentLabRole === 'admin'" class="menu-item" @tap="handleMenuClick('member-management')">
                    <text class="menu-icon">👥</text>
                    <text class="menu-label">成员管理</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view v-if="currentLabRole === 'admin'" class="menu-divider"></view>
                <view class="menu-item" @tap="handleMenuClick('help')">
                    <text class="menu-icon">❓</text>
                    <text class="menu-label">帮助</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider"></view>
                <view class="menu-item" @tap="handleMenuClick('about')">
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
            <view class="logout-btn" v-if="isLoggedIn" @tap="handleLogout">
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

// 当前实验室名称
const currentLabName = ref('')

// 当前实验室角色
const currentLabRole = ref('')

// 角色中文映射
const roleMap = {
    admin: '管理员',
    manager: '管理员',
    member: '成员'
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
    // 优先使用当前实验室的角色
    const role = currentLabRole.value || userInfo.value.role

    // 如果有明确的角色映射，使用映射
    if (role && roleMap[role]) {
        return roleMap[role]
    }

    // 默认显示"成员"而不是"普通用户"
    return '成员'
})

// 获取用户信息
const getUserInfo = () => {
    try {
        const storedUserInfo = Taro.getStorageSync('userInfo')
        if (storedUserInfo) {
            userInfo.value = { ...storedUserInfo }
        }

        // 获取当前实验室名称
        const labName = Taro.getStorageSync('currentLabName') || Taro.getStorageSync('labName')
        if (labName) {
            currentLabName.value = labName
            // 同步更新 userInfo 中的 labName
            if (userInfo.value) {
                userInfo.value.labName = labName
            }
        } else {
            currentLabName.value = ''
        }

        // 获取当前实验室角色
        const role = Taro.getStorageSync('currentLabRole')
        if (role) {
            currentLabRole.value = role
        }
    } catch (e) {
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
        url: '/pages/profile/login/login'
    })
}

// 菜单点击
const handleMenuClick = (type) => {

    switch (type) {
        case 'settings':
            Taro.navigateTo({
                url: '/pages/profile/setting/setting'
            })
            break
        case 'laboratory':
            Taro.navigateTo({
                url: '/pages/profile/laboratory/laboratory?from=profile'
            })
            break
        case 'member-management':
            // 获取当前实验室ID并传递
            const currentLabId = Taro.getStorageSync('currentLabId')
            if (!currentLabId) {
                Taro.showToast({
                    title: '未找到实验室信息',
                    icon: 'none'
                })
                return
            }
            Taro.navigateTo({
                url: `/pages/profile/member-management/member-management?labId=${currentLabId}`
            })
            break
        case 'statistics':
            Taro.navigateTo({
                url: '/pages/statistics/statistics'
            })
            break
        default:
            Taro.navigateTo({
                url: '/pages/profile/setting/setting'
            })
    }
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
                            url: '/pages/profile/login/login'
                        })
                    }, 1500)
                } catch (e) {
                }
            }
        }
    })
}
</script>
