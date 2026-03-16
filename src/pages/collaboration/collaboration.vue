<template>
    <view class="collaboration-page">
        <!-- 顶部标题 -->
        <view class="page-header">
            <view class="header-title">计划</view>
        </view>

        <!-- 上半部分：实验计划区域 -->
        <view class="experiment-plan-section">
            <view class="section-header">
                <text class="section-title">📋 实验计划</text>
                <text class="view-more" @tap="handleViewMorePlans">查看更多 →</text>
            </view>

            <!-- 实验计划列表（最多2条，平铺展示） -->
            <view class="plan-list">
                <view
                    v-for="plan in experimentPlans.slice(0, 2)"
                    :key="plan.id"
                    class="plan-card"
                    @tap="handlePlanClick(plan)"
                >
                    <view class="plan-header">
                        <text class="plan-title">{{ plan.title }}</text>
                        <view class="plan-status" :class="plan.status">
                            {{ getStatusText(plan.status) }}
                        </view>
                    </view>

                    <view class="plan-info">
                        <text class="plan-type">{{ plan.experimentType }}</text>
                        <text class="plan-date">{{ plan.date }}</text>
                    </view>

                    <view class="plan-items">
                        <text class="items-label">需要耗材：</text>
                        <view class="items-list">
                            <text
                                v-for="(item, index) in plan.itemsNeeded.slice(0, 2)"
                                :key="index"
                                class="item-tag"
                                :class="item.status"
                            >
                                {{ item.name }} {{ item.quantity }}
                            </text>
                            <text v-if="plan.itemsNeeded.length > 2" class="item-tag more">
                                +{{ plan.itemsNeeded.length - 2 }}
                            </text>
                        </view>
                    </view>

                    <view v-if="plan.status === 'ongoing'" class="plan-progress">
                        <view class="progress-bar">
                            <view class="progress-fill" :style="{ width: plan.progress + '%' }"></view>
                        </view>
                        <text class="progress-text">{{ plan.progress }}%</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 下半部分：耗材共享区域 -->
        <view class="consumable-sharing-section">
            <!-- 功能标签切换 -->
            <view class="tab-section">
                <view
                    v-for="tab in tabs"
                    :key="tab.value"
                    class="tab-item"
                    :class="{ active: currentTab === tab.value }"
                    @tap="handleTabChange(tab.value)"
                >
                    <text class="tab-icon">{{ tab.icon }}</text>
                    <text class="tab-label">{{ tab.label }}</text>
                    <text v-if="tab.badge" class="tab-badge">{{ tab.badge }}</text>
                </view>
            </view>

            <!-- 需求大厅 -->
            <view v-if="currentTab === 'requests'" class="request-list">
                <view
                    v-for="item in requestList"
                    :key="item.id"
                    class="request-card"
                    :class="[item.status]"
                    @tap="handleRequestClick(item)"
                >
                    <!-- 卡片头部 -->
                    <view class="card-header">
                        <view class="user-info">
                            <view class="user-avatar">{{ item.avatar }}</view>
                            <view class="user-detail">
                                <text class="user-name">{{ item.userName }}</text>
                                <text class="user-lab">{{ item.labName }}</text>
                            </view>
                        </view>
                        <view class="request-status" :class="item.status">
                            {{ item.statusText }}
                        </view>
                    </view>

                    <!-- 卡片内容 -->
                    <view class="card-content">
                        <text class="request-title">{{ item.title }}</text>
                        <text class="request-desc">{{ item.description }}</text>

                        <!-- 耗材信息 -->
                        <view class="item-info">
                            <view class="info-item">
                                <text class="info-label">需要耗材</text>
                                <text class="info-value">{{ item.itemName }}</text>
                            </view>
                            <view class="info-item">
                                <text class="info-label">数量</text>
                                <text class="info-value">{{ item.quantity }}</text>
                            </view>
                            <view class="info-item">
                                <text class="info-label">期望时间</text>
                                <text class="info-value">{{ item.expectedTime }}</text>
                            </view>
                        </view>
                    </view>

                    <!-- 卡片底部操作 -->
                    <view class="card-footer">
                        <text class="footer-time">{{ item.publishTime }}</text>
                        <view class="footer-actions">
                            <view class="action-btn secondary" @tap.stop="handleShare(item)">
                                <text>📤 我有富余</text>
                            </view>
                            <view class="action-btn primary" @tap.stop="handleContact(item)">
                                <text>💬 联系TA</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 我的共享 -->
            <view v-if="currentTab === 'my-share'" class="my-share-list">
                <view class="share-header">
                    <text class="share-title">我发布的共享</text>
                    <view class="publish-btn" @tap="handlePublish">
                        <text>➕ 发布新共享</text>
                    </view>
                </view>

                <view
                    v-for="item in myShareList"
                    :key="item.id"
                    class="share-item"
                    @tap="handleEditShare(item)"
                >
                    <view class="item-main">
                        <text class="item-name">{{ item.itemName }}</text>
                        <text class="item-quantity">富余: {{ item.quantity }}</text>
                    </view>
                    <view class="item-status">
                        <text class="status-text">{{ item.consultCount }}人咨询</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 悬浮发布按钮 -->
        <view class="fab-btn" @tap="handlePublish">
            <text class="fab-icon">➕</text>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import './collaboration.scss'

// 当前标签
const currentTab = ref('requests')

// 标签数据（只保留需求大厅和我的共享）
const tabs = ref([
    { value: 'requests', label: '需求大厅', icon: '📋', badge: 5 },
    { value: 'my-share', label: '我的共享', icon: '📤' }
])

// 实验计划数据（模拟数据）
const experimentPlans = ref([
    {
        id: '1',
        title: 'Western Blot 实验',
        experimentType: '蛋白分析',
        date: '2026-03-15',
        status: 'pending',
        progress: 0,
        itemsNeeded: [
            { name: 'RIPA裂解液', quantity: '2瓶', status: 'sufficient' },
            { name: 'BCA试剂盒', quantity: '1盒', status: 'insufficient' }
        ]
    },
    {
        id: '2',
        title: 'PCR 扩增',
        experimentType: '分子生物学',
        date: '2026-03-16',
        status: 'ongoing',
        progress: 60,
        itemsNeeded: [
            { name: 'Taq酶', quantity: '1支', status: 'expiring' }
        ]
    }
])

// 需求列表（复用现有数据）
const requestList = ref([
    {
        id: 1,
        avatar: '👤',
        userName: '张三',
        labName: 'A组',
        title: '急需胰蛋白酶',
        description: '本周实验需要，如果有的话请帮忙',
        itemName: '胰蛋白酶',
        quantity: '2瓶',
        expectedTime: '3天内',
        status: 'urgent',
        statusText: '紧急',
        publishTime: '2小时前'
    },
    {
        id: 2,
        avatar: '👩',
        userName: '李四',
        labName: 'B组',
        title: '求购BCA试剂盒',
        description: '实验需要，有富余的请联系',
        itemName: 'BCA试剂盒',
        quantity: '1盒',
        expectedTime: '1周内',
        status: 'normal',
        statusText: '进行中',
        publishTime: '5小时前'
    },
    {
        id: 3,
        avatar: '👨',
        userName: '王五',
        labName: 'C组',
        title: 'RIPA裂解液共享',
        description: '实验室有多余的RIPA裂解液，可以共享',
        itemName: 'RIPA裂解液',
        quantity: '3瓶',
        expectedTime: '随时',
        status: 'share',
        statusText: '可共享',
        publishTime: '1天前'
    }
])

// 我的共享列表（复用现有数据）
const myShareList = ref([
    {
        id: 1,
        itemName: 'PBS缓冲液',
        quantity: '5瓶',
        consultCount: 3
    },
    {
        id: 2,
        itemName: '移液枪头',
        quantity: '2盒',
        consultCount: 1
    }
])

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        pending: '待开始',
        ongoing: '进行中',
        completed: '已完成'
    }
    return statusMap[status] || status
}

// 查看更多实验计划
const handleViewMorePlans = () => {
    Taro.navigateTo({
        url: '/pages/experiment-plan/experiment-plan'
    })
}

// 实验计划卡片点击
const handlePlanClick = (plan) => {
    Taro.showToast({
        title: `查看${plan.title}详情`,
        icon: 'none'
    })
}

// 标签切换
const handleTabChange = (value) => {
    currentTab.value = value
}

// 需求卡片点击
const handleRequestClick = (item) => {
    Taro.showToast({
        title: `查看${item.userName}的需求详情`,
        icon: 'none'
    })
}

// 我有富余
const handleShare = (item) => {
    Taro.showToast({
        title: `联系${item.userName}提供帮助`,
        icon: 'none'
    })
}

// 联系TA
const handleContact = (item) => {
    Taro.showToast({
        title: `联系${item.userName}`,
        icon: 'none'
    })
}

// 发布
const handlePublish = () => {
    Taro.showToast({
        title: '发布功能开发中',
        icon: 'none'
    })
}

// 编辑共享
const handleEditShare = (item) => {
    Taro.showToast({
        title: `编辑${item.itemName}`,
        icon: 'none'
    })
}
</script>
