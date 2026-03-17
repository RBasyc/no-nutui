<template>
    <view class="experiment-detail-page">
        <!-- 顶部导航栏 -->
        <view class="page-header">
            <view class="header-back" @tap="handleBack">
                <text class="back-icon">←</text>
            </view>
            <view class="header-title">实验详情</view>
            <view class="header-placeholder"></view>
        </view>

        <!-- 加载状态 -->
        <view v-if="loading" class="loading-container">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载中...</text>
        </view>

        <!-- 详情内容 -->
        <scroll-view v-else-if="planData" class="detail-content" scrollY="true">
            <!-- 状态卡片 -->
            <view class="status-card">
                <view v-if="planData.status === 'cancelled'" class="status-badge status-cancelled">
                    <text class="status-text">已取消</text>
                </view>
                <view v-else-if="isPlanInProgress" class="status-badge status-in_progress">
                    <text class="status-text">进行中</text>
                </view>
                <view v-else class="status-badge status-upcoming">
                    <text class="status-text">未开始</text>
                </view>
                <text class="create-time">创建于 {{ formatDateTime(planData.createdAt) }}</text>
            </view>

            <!-- 基本信息 -->
            <view class="info-section">
                <view class="section-title">
                    <text class="title-icon">📋</text>
                    <text class="title-text">基本信息</text>
                </view>

                <view class="info-item">
                    <text class="info-label">计划标题</text>
                    <text class="info-value">{{ planData.title }}</text>
                </view>

                <view class="info-item">
                    <text class="info-label">实验类型</text>
                    <text class="info-value">{{ planData.experimentType || '未设置' }}</text>
                </view>

                <view class="info-item">
                    <text class="info-label">实验日期</text>
                    <text class="info-value">{{ formatDate(planData.experimentDate) || '未设置' }}</text>
                </view>

                <view v-if="planData.description" class="info-item description-item">
                    <text class="info-label">实验描述</text>
                    <text class="info-value description-text">{{ planData.description }}</text>
                </view>
            </view>

            <!-- 耗材清单 -->
            <view class="items-section">
                <view class="section-title">
                    <text class="title-icon">📦</text>
                    <text class="title-text">耗材清单</text>
                    <text class="title-count">({{ planData.itemsNeeded?.length || 0 }} 项)</text>
                </view>

                <view
                    v-for="(item, index) in planData.itemsNeeded"
                    :key="index"
                    class="item-card"
                >
                    <view class="item-header">
                        <text class="item-name">{{ item.name }}</text>
                        <view class="item-quantity">
                            <text class="quantity-value">{{ item.quantity }}</text>
                            <text class="quantity-unit">{{ item.unit || '件' }}</text>
                        </view>
                    </view>

                    <view class="item-details">
                        <view v-if="item.specification" class="detail-row">
                            <text class="detail-label">规格：</text>
                            <text class="detail-value">{{ item.specification }}</text>
                        </view>
                        <view v-if="item.category" class="detail-row">
                            <text class="detail-label">分类：</text>
                            <text class="detail-value">{{ item.category }}</text>
                        </view>
                        <view v-if="item.stockInfo" class="detail-row">
                            <text class="detail-label">库存状态：</text>
                            <text
                                :class="['detail-value', 'stock-status', item.stockInfo.status]"
                            >
                                {{ item.stockInfo.text }}
                            </text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 底部按钮区域占位 -->
            <view class="footer-placeholder"></view>
        </scroll-view>

        <!-- 底部操作栏 -->
        <view v-if="planData && canCancel" class="footer-actions">
            <view class="cancel-btn" @tap="handleCancelExperiment">
                <text class="cancel-icon">✕</text>
                <text class="cancel-text">取消实验</text>
            </view>
        </view>

        <!-- 取消确认弹窗 -->
        <view v-if="showCancelModal" class="modal-overlay" @tap="closeCancelModal">
            <view class="modal-content" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">确认取消实验？</text>
                </view>

                <view class="modal-body">
                    <text class="modal-desc">取消实验后，所有耗材将自动归还到仓库</text>

                    <view v-if="planData?.itemsNeeded?.length > 0" class="return-list">
                        <text class="return-title">将归还以下耗材：</text>
                        <view
                            v-for="(item, index) in planData.itemsNeeded"
                            :key="index"
                            class="return-item"
                        >
                            <text class="return-name">• {{ item.name }}</text>
                            <text class="return-qty">+{{ item.quantity }}{{ item.unit || '' }}</text>
                        </view>
                    </view>
                </view>

                <view class="modal-footer">
                    <view class="modal-btn btn-secondary" @tap="closeCancelModal">
                        <text>再想想</text>
                    </view>
                    <view class="modal-btn btn-danger" @tap="confirmCancel">
                        <text>确认取消</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import inventoryAPI from '../../../api/inventoryAPI'
import experimentPlanApi from '../../../api/experimentPlanApi'
import './experiment-plan-detail.scss'

// 实验计划数据
const planData = ref(null)
const loading = ref(true)
const showCancelModal = ref(false)

// 获取路由参数
const instance = getCurrentInstance()
const planId = instance.router?.params?.id

// 判断计划是否进行中（实验日期是今天或之前，且未取消）
const isPlanInProgress = computed(() => {
    if (!planData.value?.experimentDate || planData.value.status === 'cancelled') {
        return false
    }
    const experimentDate = new Date(planData.value.experimentDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return experimentDate <= today
})

// 是否可以取消实验（未取消的计划都可以取消）
const canCancel = computed(() => {
    return planData.value?.status !== 'cancelled'
})

// 加载实验计划详情
const loadPlanDetail = async () => {
    if (!planId) {
        Taro.showToast({
            title: '缺少计划ID',
            icon: 'none'
        })
        return
    }

    loading.value = true

    try {
        const token = Taro.getStorageSync('token') || ''
        const res = await Taro.request({
            url: experimentPlanApi.detail(planId),
            method: 'GET',
            header: {
                Authorization: token
            }
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            const data = res.data.data
            // 后端使用了 populate，inventoryId 可能是对象，需要提取 _id
            if (data.itemsNeeded && Array.isArray(data.itemsNeeded)) {
                data.itemsNeeded = data.itemsNeeded.map(item => ({
                    ...item,
                    inventoryId: item.inventoryId?._id
                        ? String(item.inventoryId._id)
                        : (item.inventoryId ? String(item.inventoryId) : null)
                }))
            }
            planData.value = data
        } else {
            throw new Error(res.data?.errorInfo || '加载失败')
        }
    } catch (error) {
        console.error('加载实验计划详情失败:', error)
        Taro.showToast({
            title: error.message || '加载失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 格式化日期
const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        draft: '草稿',
        in_progress: '进行中',
        completed: '已完成',
        cancelled: '已取消'
    }
    return statusMap[status] || status
}

// 打开取消确认弹窗
const handleCancelExperiment = () => {
    showCancelModal.value = true
}

// 关闭取消弹窗
const closeCancelModal = () => {
    showCancelModal.value = false
}

// 确认取消实验
const confirmCancel = async () => {
    if (!planData.value?.itemsNeeded || planData.value.itemsNeeded.length === 0) {
        Taro.showToast({
            title: '该计划没有耗材',
            icon: 'none'
        })
        return
    }

    try {
        const token = Taro.getStorageSync('token') || ''

        // 1. 归还所有耗材到仓库
        const returnPromises = planData.value.itemsNeeded.map(async (item) => {
            if (!item.inventoryId) {
                return
            }

            const inventoryIdStr = String(item.inventoryId)

            // 调用库存API增加数量（归还）
            await Taro.request({
                url: inventoryAPI.quantity(inventoryIdStr),
                method: 'PUT',
                header: {
                    Authorization: token
                },
                data: {
                    quantity: parseInt(item.quantity),
                    operation: 'add'
                }
            })
        })

        await Promise.all(returnPromises)

        // 2. 删除实验计划
        const deleteRes = await Taro.request({
            url: experimentPlanApi.delete(planId),
            method: 'DELETE',
            header: {
                Authorization: token
            }
        })

        if (deleteRes.statusCode !== 200 || deleteRes.data.errCode !== '0') {
            throw new Error(deleteRes.data?.errorInfo || '删除计划失败')
        }

        Taro.showToast({
            title: '已取消实验，耗材已归还',
            icon: 'success',
            duration: 2000
        })

        closeCancelModal()

        // 延迟返回列表页
        setTimeout(() => {
            Taro.navigateBack()
        }, 2000)
    } catch (error) {
        console.error('取消实验失败:', error)
        Taro.showToast({
            title: error.message || '取消失败',
            icon: 'none'
        })
    }
}

// 返回上一页
const handleBack = () => {
    Taro.navigateBack()
}

onMounted(() => {
    loadPlanDetail()
})
</script>
