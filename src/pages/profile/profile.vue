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
                <view class="stat-item" @tap="handleStatClick('inventory')">
                    <text class="stat-value">{{ statsData.totalItems }}</text>
                    <text class="stat-label">库存</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item" @tap="handleStatClick('lab')">
                    <text class="stat-value">{{ statsData.labCount }}</text>
                    <text class="stat-label">实验室</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item" @tap="handleStatClick('plan')">
                    <text class="stat-value">{{ statsData.planCount }}</text>
                    <text class="stat-label">计划</text>
                </view>
            </view>

            <!-- 功能菜单 -->
            <view class="menu-section" v-if="isLoggedIn">
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
import inventoryApi from '../../api/inventoryAPI'
import labMemberApi from '../../api/labMemberApi'
import experimentPlanApi from '../../api/experimentPlanApi'

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

// 统计数据
const statsData = ref({
    totalItems: 0,
    labCount: 0,
    planCount: 0
})

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

// 统计卡片点击
const handleStatClick = (type) => {
    switch (type) {
        case 'inventory':
            Taro.switchTab({
                url: '/pages/inventory/inventory'
            })
            break
        case 'lab':
            handleMenuClick('laboratory')
            break
        case 'plan':
            Taro.switchTab({
                url: '/pages/collaboration/collaboration'
            })
            break
    }
}

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

// 加载统计数据
const loadStatsData = async () => {
    try {
        // 并行加载三个接口
        const [inventoryRes, labsRes, plansRes] = await Promise.all([
            // 1. 获取库存统计
            Taro.request({
                url: inventoryApi.alerts,
                method: 'GET',
                header: {
                    Authorization: Taro.getStorageSync('token') || ''
                }
            }).catch(() => null),

            // 2. 获取实验室数量
            Taro.request({
                url: labMemberApi.myLabs,
                method: 'GET',
                header: {
                    Authorization: Taro.getStorageSync('token') || ''
                }
            }).catch(() => null),

            // 3. 获取实验计划数量
            Taro.request({
                url: experimentPlanApi.list,
                method: 'GET',
                header: {
                    Authorization: Taro.getStorageSync('token') || ''
                }
            }).catch(() => null)
        ])

        // 处理库存数据
        if (inventoryRes?.statusCode === 200 && inventoryRes.data.errCode === '0') {
            const summary = inventoryRes.data.data.summary
            statsData.value.totalItems = summary.expiring_soon + summary.expired + summary.low_stock + summary.out_of_stock
        }

        // 处理实验室数量
        if (labsRes?.statusCode === 200 && labsRes.data.errCode === '0') {
            statsData.value.labCount = labsRes.data.data?.items?.length || 0
        }

        // 处理实验计划数量
        if (plansRes?.statusCode === 200 && plansRes.data.errCode === '0') {
            statsData.value.planCount = plansRes.data.data?.total || 0
        }
    } catch (error) {
        console.error('加载统计数据失败:', error)
    }
}

// 页面加载时获取用户信息
onMounted(() => {
    getUserInfo()
})

// 页面显示时重新获取用户信息和统计数据（包括首次加载和从其他页面返回时）
useDidShow(() => {
    getUserInfo()
    loadStatsData()
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
