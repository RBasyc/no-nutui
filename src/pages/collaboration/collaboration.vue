<template>
    <view class="collaboration-page">
        <!-- 顶部标题 -->
        <view class="page-header">
            <view class="header-title">协作共享</view>
        </view>

        <!-- 统计概览 -->
        <view class="collab-stats">
            <view class="stat-card">
                <text class="stat-icon">🤝</text>
                <view class="stat-info">
                    <text class="stat-value">{{ statsData.ongoing }}</text>
                    <text class="stat-label">进行中</text>
                </view>
            </view>
            <view class="stat-card warning">
                <text class="stat-icon">⏳</text>
                <view class="stat-info">
                    <text class="stat-value">{{ statsData.pending }}</text>
                    <text class="stat-label">待响应</text>
                </view>
            </view>
            <view class="stat-card success">
                <text class="stat-icon">✅</text>
                <view class="stat-info">
                    <text class="stat-value">{{ statsData.completed }}</text>
                    <text class="stat-label">已完成</text>
                </view>
            </view>
        </view>

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

        <!-- 我的协作 -->
        <view v-if="currentTab === 'my-collab'" class="my-collab-list">
            <view class="empty-state">
                <text class="empty-icon">🤝</text>
                <text class="empty-text">暂无协作记录</text>
                <text class="empty-hint">去需求大厅看看吧</text>
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

        <!-- 消息中心 -->
        <view v-if="currentTab === 'messages'" class="message-list">
            <view
                v-for="item in messageList"
                :key="item.id"
                class="message-item"
                @tap="handleMessageClick(item)"
            >
                <view class="message-avatar">{{ item.avatar }}</view>
                <view class="message-main">
                    <view class="message-top">
                        <text class="message-name">{{ item.userName }}</text>
                        <text class="message-time">{{ item.time }}</text>
                    </view>
                    <text class="message-content">{{ item.content }}</text>
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

// 统计数据
const statsData = ref({
    ongoing: 8,
    pending: 3,
    completed: 24
})

// 标签数据
const tabs = ref([
    { value: 'requests', label: '需求大厅', icon: '📋', badge: 5 },
    { value: 'my-collab', label: '我的协作', icon: '🤝' },
    { value: 'my-share', label: '我的共享', icon: '📤' },
    { value: 'messages', label: '消息', icon: '💬', badge: 2 }
])

// 需求列表
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

// 我的共享列表
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

// 消息列表
const messageList = ref([
    {
        id: 1,
        avatar: '👤',
        userName: '张三',
        content: '您好，我对您的胰蛋白酶很感兴趣',
        time: '10分钟前'
    },
    {
        id: 2,
        avatar: '👩',
        userName: '李四',
        content: '请问BCA试剂盒还在吗？',
        time: '1小时前'
    }
])

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

// 消息点击
const handleMessageClick = (item) => {
    Taro.showToast({
        title: `查看与${item.userName}的聊天`,
        icon: 'none'
    })
}
</script>
