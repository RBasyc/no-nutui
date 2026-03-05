<template>
    <view class="index-page">
        <!-- 顶部导航区域 -->
        <view class="page-header">
            <view class="header-title">Lab智管</view>
            <view
                v-if="userInfo.avatar"
                class="header-avatar-img"
                :style="{ backgroundImage: `url(${userInfo.avatar})` }"
            />
            <view v-else class="header-avatar-text">
                {{ userInfo.nickname?.charAt(0) || '用' }}
            </view>
        </view>

        <!-- 数据统计卡片 -->
        <view class="stats-cards">
            <view class="stat-card" @tap="handleStatClick('total')">
                <text class="stat-value">{{ statsData.totalStock }}</text>
                <text class="stat-label">总库存</text>
            </view>
            <view class="stat-card warning" @tap="handleStatClick('expiring')">
                <text class="stat-value">{{ statsData.expiringCount }}</text>
                <text class="stat-label">即将过期</text>
            </view>
            <view class="stat-card danger" @tap="handleStatClick('lowstock')">
                <text class="stat-value">{{ statsData.lowStockCount }}</text>
                <text class="stat-label">库存不足</text>
            </view>
        </view>

        <!-- 快捷操作区域 -->
        <view class="quick-actions">
            <view
                v-for="(action, index) in quickActions"
                :key="index"
                class="action-item"
                @tap="handleActionClick(action.label)"
            >
                <text class="action-icon">{{ action.icon }}</text>
                <text class="action-label">{{ action.label }}</text>
            </view>
        </view>

        <!-- AI 智能提醒卡片 -->
        <view class="reminder-section">
            <view class="reminder-card">
                <view class="reminder-header" @tap="toggleReminder">
                    <text class="ai-badge">🤖 AI 建议</text>
                    <text class="reminder-tag">基于实验计划</text>
                    <text class="expand-icon">{{
                        aiReminderExpanded ? '▲' : '▼'
                    }}</text>
                </view>
                <view
                    class="reminder-content"
                    :class="{ expanded: aiReminderExpanded }"
                >
                    "计划做3次Western Blot，每次用1块胶，20μL蛋白上样" →
                    建议优先使用即将过期的 RIPA
                    裂解液（库存5瓶，剩余21天），并补充 BCA 试剂盒。
                </view>
                <view class="reminder-meta" v-if="aiReminderExpanded">
                    <text class="meta-time">⏳ 来自 张莹 实验室</text>
                    <text class="expire-badge">⏰ 2条过期预警</text>
                </view>
            </view>
        </view>

        <!-- 即将过期耗材列表 -->
        <view class="list-section">
            <view class="list-header">
                <text class="list-title">即将过期耗材</text>
                <text class="list-more" @tap="handleViewAll">查看全部 →</text>
            </view>
            <view class="consumable-list">
                <view
                    v-for="(item, index) in expiringItems"
                    :key="index"
                    class="list-item"
                >
                    <text class="item-icon">{{ item.icon }}</text>
                    <view class="item-info">
                        <text class="item-name">{{ item.name }}</text>
                        <view class="item-desc">
                            <text>货号: {{ item.code }}</text>
                            <text>库存: {{ item.stock }}瓶</text>
                        </view>
                    </view>
                    <text v-if="item.days" class="item-expire"
                        >{{ item.days }}天</text
                    >
                    <text v-else class="item-tag">{{ item.status }}</text>
                </view>
            </view>
        </view>

        <!-- 待处理采购清单 -->
        <view class="list-section">
            <view class="list-header">
                <text class="list-title">待处理采购清单</text>
                <text class="list-more" @tap="handleActionClick('导出Excel')"
                    >导出Excel</text
                >
            </view>
            <view class="consumable-list">
                <view
                    v-for="(item, index) in purchaseItems"
                    :key="index"
                    class="list-item purchase-item"
                >
                    <text class="item-icon">{{ item.icon }}</text>
                    <view class="item-info">
                        <text class="item-name">{{ item.name }}</text>
                        <view class="item-desc">
                            <text>建议采购量: {{ item.suggestQty }}支</text>
                            <text>缺货预警</text>
                        </view>
                    </view>
                    <text class="item-tag urgent">{{ item.status }}</text>
                </view>
            </view>
        </view>

        <!-- 协作共享模块 -->
        <view class="collaboration-section">
            <view class="collaboration-card" @tap="handleCollaborationClick">
                <view class="collaboration-header">
                    <text class="collab-badge">🤝 协作共享</text>
                    <text class="collab-tag">A组 有多余 trypsin</text>
                </view>
                <view class="collaboration-content">
                    B组缺胰蛋白酶？A组富余3瓶，可共享。点击查看详情 →
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import './index.scss'

// 用户信息
const userInfo = ref({
    nickname: '',
    avatar: ''
})

// AI提醒展开状态
const aiReminderExpanded = ref(false)

// 数据统计
const statsData = ref({
    totalStock: 128,
    expiringCount: 12,
    lowStockCount: 5
})

// 快捷操作
const quickActions = ref([
    { icon: '📱', label: '快捷扫码' },
    { icon: '✏️', label: '手动登记' },
    { icon: '📋', label: '采购清单' },
    { icon: '📊', label: '统计分析' }
])

// 即将过期耗材
const expiringItems = ref([
    { icon: '🧪', name: 'RIPA裂解液', code: 'P0013', stock: 5, days: 21 },
    { icon: '💊', name: 'BCA试剂盒', code: 'P0028', stock: 2, days: 15 },
    { icon: '🧬', name: '胰蛋白酶', code: 'P0042', stock: 3, days: 8 },
    { icon: '💉', name: 'PBS缓冲液', code: 'P0056', stock: 8, days: 30 }
])

// 待处理采购清单
const purchaseItems = ref([
    { icon: '🧬', name: '胰蛋白酶', suggestQty: 10, status: '缺货' },
    { icon: '🧪', name: 'RIPA裂解液', suggestQty: 5, status: '预警' }
])

// 获取用户信息
const getUserInfo = () => {
    try {
        const storedUserInfo = Taro.getStorageSync('userInfo')
        if (storedUserInfo) {
            userInfo.value = {
                nickname: storedUserInfo.nickName || '',
                avatar: storedUserInfo.avatar || ''
            }
        }
    } catch (e) {
        console.error('获取用户信息失败:', e)
    }
}

// 页面加载时获取用户信息
onMounted(() => {
    getUserInfo()
})

// 统计卡片点击
const handleStatClick = (type) => {
    const typeMap = {
        total: '总库存',
        expiring: '即将过期',
        lowstock: '库存不足'
    }
    Taro.showToast({
        title: `查看${typeMap[type]}`,
        icon: 'none'
    })
}

// 快捷操作点击
const handleActionClick = async (label) => {
    switch (label) {
        case '快捷扫码':
            try {
                const scanRes = await Taro.scanCode({
                    onlyFromCamera: false,
                    scanType: ['barCode', 'qrCode']
                })

                const scannedText = scanRes.result
                console.log('扫码结果:', scannedText)

                // 判断是否为 MongoDB ObjectId（24位十六进制）
                const isObjectId = /^[0-9a-fA-F]{24}$/.test(scannedText)

                if (isObjectId) {
                    // 如果是 ObjectId，跳转到借用与归还界面
                    Taro.navigateTo({
                        url: `/pages/inventory/inventory-record/inventory-record?id=${scannedText}`
                    })
                    Taro.showToast({
                        title: '跳转到借用归还',
                        icon: 'success'
                    })
                } else {
                    // 如果是货号编码，跳转到新建货物界面，传递货物码
                    Taro.navigateTo({
                        url: `/pages/inventory/inventory-edit/inventory-edit?code=${encodeURIComponent(
                            scannedText
                        )}`
                    })
                    Taro.showToast({
                        title: '跳转到新建货物',
                        icon: 'success'
                    })
                }
            } catch (err) {
                console.error('扫码失败:', err)
                Taro.showToast({
                    title: '扫码失败',
                    icon: 'none'
                })
            }
            break
        case '手动登记':
            Taro.navigateTo({
                url: '/pages/inventory/inventory-edit/inventory-edit'
            })
            break
        case '采购清单':
            Taro.navigateTo({
                url: '/pages/purchase/purchase'
            })
            break
        case '统计分析':
            Taro.navigateTo({
                url: '/pages/inventory/inventory'
            })
            break
    }
}

// 切换AI提醒展开状态
const toggleReminder = () => {
    aiReminderExpanded.value = !aiReminderExpanded.value
}

// 查看全部
const handleViewAll = () => {
    Taro.showToast({
        title: '跳转到库存页',
        icon: 'none'
    })
}

// 协作共享点击
const handleCollaborationClick = () => {
    Taro.switchTab({
        url: '/pages/collaboration/collaboration'
    })
}
</script>
