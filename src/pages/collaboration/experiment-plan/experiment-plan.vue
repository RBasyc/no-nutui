<template>
    <view class="experiment-plan-page">
        <!-- 顶部导航栏 -->
        <view class="page-header">
            <view class="header-placeholder"></view>
            <view class="header-title">实验计划</view>
            <view class="header-action" @tap="handleCreatePlan">
                <text class="create-icon">+</text>
                <text class="create-text">新建计划</text>
            </view>
        </view>

        <!-- 加载状态 -->
        <view v-if="loading" class="loading-container">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载中...</text>
        </view>

        <!-- 空状态 -->
        <view v-else-if="plans.length === 0" class="empty-state">
            <text class="empty-icon">📋</text>
            <text class="empty-title">暂无实验计划</text>
            <view class="action-buttons">
                <view class="action-btn primary" @tap="handleCreatePlan">
                    <text>手动创建计划</text>
                </view>
            </view>
            <view class="empty-hint">
                <text class="hint-text">💡 提示：您也可以在 AI 聊天页面描述实验，让助手自动生成耗材清单</text>
            </view>
        </view>

        <!-- 计划列表 -->
        <scroll-view v-else class="plan-list" scrollY="true">
            <view
                v-for="plan in plans"
                :key="plan._id"
                class="plan-item"
                @tap="handleViewPlan(plan)"
            >
                <view class="plan-header">
                    <text class="plan-title">{{ plan.title }}</text>
                    <view v-if="plan.status === 'cancelled'" class="plan-status status-cancelled">
                        <text>已取消</text>
                    </view>
                    <view v-else-if="isPlanInProgress(plan.experimentDate)" class="plan-status status-in_progress">
                        <text>进行中</text>
                    </view>
                    <view v-else class="plan-status status-upcoming">
                        <text>未开始</text>
                    </view>
                </view>
                <view class="plan-info">
                    <text class="plan-date">{{ formatDate(plan.experimentDate) }}</text>
                    <text class="plan-items-count">{{ plan.itemsNeeded?.length || 0 }} 项耗材</text>
                </view>
                <view v-if="plan.description" class="plan-description">
                    <text class="description-text">{{ plan.description }}</text>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useDidShow } from '@tarojs/taro'
import './experiment-plan.scss'

// 计划列表数据
const plans = ref([])
const loading = ref(false)

// 加载实验计划列表
const loadPlans = async () => {
    loading.value = true

    try {
        const token = Taro.getStorageSync('token') || ''

        // 检查后端 API 是否存在
        const res = await Taro.request({
            url: 'http://localhost:3000/adminapi/experiment-plan/list',
            method: 'GET',
            header: {
                Authorization: token
            }
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            plans.value = res.data.data?.items || []
        } else {
            // API 可能不存在或返回错误，显示空状态
            console.warn('加载实验计划失败:', res.data?.errorInfo)
            plans.value = []
        }
    } catch (error) {
        console.error('加载实验计划失败:', error)
        // 网络错误或后端未启动，显示空状态
        plans.value = []
    } finally {
        loading.value = false
    }
}

// 跳转到创建计划页面
const handleCreatePlan = () => {
    Taro.navigateTo({
        url: '/pages/collaboration/experiment-plan/experiment-plan-create'
    })
}

// 查看计划详情
const handleViewPlan = (plan) => {
    Taro.navigateTo({
        url: `/pages/collaboration/experiment-plan/experiment-plan-detail?id=${plan._id || plan.id}`
    })
}

// 判断计划是否进行中
const isPlanInProgress = (experimentDate) => {
    if (!experimentDate) return false
    const expDate = new Date(experimentDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return expDate <= today
}

// 获取状态文本（保留用于兼容）
const getStatusText = (status) => {
    const statusMap = {
        draft: '草稿',
        in_progress: '进行中',
        completed: '已完成',
        cancelled: '已取消'
    }
    return statusMap[status] || '未知'
}

// 格式化日期
const formatDate = (dateStr) => {
    if (!dateStr) return '未设置日期'

    try {
        const date = new Date(dateStr)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${month}-${day}`
    } catch {
        return '日期格式错误'
    }
}

// 页面加载
onMounted(() => {
    loadPlans()
})

// 页面显示时刷新（从其他页面返回时）
useDidShow(() => {
    loadPlans()
})
</script>
