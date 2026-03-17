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
            <view v-if="experimentPlans.length > 0" class="plan-list">
                <view
                    v-for="plan in experimentPlans.slice(0, 2)"
                    :key="plan.id"
                    class="plan-card"
                    @tap="handlePlanClick(plan)"
                >
                    <view class="plan-header">
                        <text class="plan-title">{{ plan.title }}</text>
                        <view class="plan-status" :class="plan.status">
                            {{ plan.statusText }}
                        </view>
                    </view>

                    <view class="plan-info">
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

                    <view v-if="plan.status === 'in_progress'" class="plan-progress">
                        <view class="progress-bar">
                            <view class="progress-fill" :style="{ width: plan.progress + '%' }"></view>
                        </view>
                        <text class="progress-text">{{ plan.progress }}%</text>
                    </view>
                </view>
            </view>

            <!-- 实验计划空状态 -->
            <view v-else class="empty-state">
                <text class="empty-icon">📋</text>
                <text class="empty-text">暂无实验计划</text>
                <text class="empty-hint">点击"查看更多"创建新的实验计划</text>
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
            <view v-if="currentTab === 'requests'" class="request-section">
                <!-- 类型切换 -->
                <view class="request-type-tabs">
                    <view
                        v-for="type in requestTypes"
                        :key="type.value"
                        class="type-tab-item"
                        :class="{ active: currentRequestType === type.value }"
                        @tap="handleRequestTypeChange(type.value)"
                    >
                        <text class="type-tab-icon">{{ type.icon }}</text>
                        <text class="type-tab-label">{{ type.label }}</text>
                    </view>
                </view>

                <!-- 搜索栏 -->
                <view class="search-bar">
                    <view class="search-input-wrapper">
                        <text class="search-icon">🔍</text>
                        <input
                            v-model="searchKeyword"
                            placeholder="搜索耗材名称、标题..."
                            class="search-input"
                            @input="handleSearchInput"
                        />
                        <text v-if="searchKeyword" class="clear-icon" @tap="clearSearch">✕</text>
                    </view>
                </view>

                <!-- 需求列表 -->
                <view class="request-list">
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
                            <view class="user-avatar">
                                <image
                                    v-if="item.avatar && item.avatar.startsWith('http')"
                                    :src="item.avatar"
                                    class="avatar-image"
                                    mode="aspectFill"
                                />
                                <text v-else class="avatar-placeholder">{{ item.userFirstChar }}</text>
                            </view>
                            <view class="user-detail">
                                <text class="user-name">{{ item.userName }}</text>
                                <text class="user-lab">{{ item.labName }}</text>
                            </view>
                        </view>
                        <view class="header-right">
                            <!-- 我发布的tag -->
                            <view v-if="item.isMyPublish" class="my-publish-tag">
                                <text>我发布</text>
                            </view>
                            <view class="request-status" :class="item.status">
                                {{ item.statusText }}
                            </view>
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
                            <view class="action-btn primary" @tap.stop="handleContact(item)">
                                <text>📞 联系TA</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 需求大厅空状态 -->
                <view v-if="requestList.length === 0 && !loading" class="empty-state">
                    <text class="empty-icon">📋</text>
                    <text class="empty-text">暂无需求信息</text>
                    <text class="empty-hint">当前没有耗材共享需求</text>
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
                    class="share-item-card"
                >
                    <view class="share-card-main">
                        <view class="share-type-badge" :class="item.requestType">
                            <text v-if="item.requestType === 'request'">📋 我需要</text>
                            <text v-else>📤 我富余</text>
                        </view>

                        <view class="share-title">{{ item.title }}</view>
                        <view class="share-desc">{{ item.description }}</view>

                        <view class="share-info">
                            <view class="info-row">
                                <text class="info-label">耗材名称</text>
                                <text class="info-value">{{ item.itemName }}</text>
                            </view>
                            <view class="info-row">
                                <text class="info-label">数量</text>
                                <text class="info-value">{{ item.quantity }}</text>
                            </view>
                            <view class="info-row">
                                <text class="info-label">期望时间</text>
                                <text class="info-value">{{ item.expectedTime }}</text>
                            </view>
                        </view>

                        <view class="share-footer">
                            <text class="consult-count">{{ item.consultCount }}人咨询</text>
                            <view class="delete-btn" @tap.stop="handleDeleteShare(item)">
                                <text>🗑️ 删除</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 我的共享空状态 -->
                <view v-if="myShareList.length === 0 && !loading" class="empty-state">
                    <text class="empty-icon">📤</text>
                    <text class="empty-text">暂无共享信息</text>
                    <text class="empty-hint">点击"发布新共享"分享您的富余耗材</text>
                </view>
            </view>
        </view>

        <!-- 联系方式弹窗 -->
        <view v-if="showContactModal" class="contact-modal" @tap="closeContactModal">
            <view class="modal-content" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">联系方式</text>
                </view>
                <view class="modal-body">
                    <text class="contact-info">{{ selectedContact }}</text>
                </view>
                <view class="modal-footer">
                    <view class="modal-btn copy-btn" @tap="copyContact">
                        <text>复制</text>
                    </view>
                    <view class="modal-btn close-btn" @tap="closeContactModal">
                        <text>关闭</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import experimentPlanApi from '../../api/experimentPlanApi'
import shareRequestApi from '../../api/shareRequestApi'
import './collaboration.scss'

// 当前标签
const currentTab = ref('requests')

// 联系方式弹窗状态
const showContactModal = ref(false)
const selectedContact = ref('')

// 需求类型切换（我需要/我富余）
const currentRequestType = ref('all')
const requestTypes = ref([
    { value: 'all', label: '全部', icon: '📋' },
    { value: 'request', label: '我需要', icon: '📥' },
    { value: 'share', label: '我富余', icon: '📤' }
])

// 搜索关键词
const searchKeyword = ref('')

// 防抖定时器
let debounceTimer = null

// 标签数据（只保留需求大厅和我的共享）
const tabs = ref([
    { value: 'requests', label: '需求大厅', icon: '📋', badge: null },
    { value: 'my-share', label: '我的共享', icon: '📤' }
])

// 实验计划数据
const experimentPlans = ref([])

// 需求列表
const requestList = ref([])

// 我的共享列表
const myShareList = ref([])

// 当前用户ID
const currentUserId = ref('')

// 加载状态
const loading = ref(false)

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 格式化相对时间
const formatRelativeTime = (dateString) => {
    if (!dateString) return ''
    const now = new Date()
    const date = new Date(dateString)
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return formatDate(dateString)
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        pending: '待开始',
        ongoing: '进行中',
        completed: '已完成',
        urgent: '紧急',
        normal: '进行中',
        share: '可共享'
    }
    return statusMap[status] || status
}

// 获取实验计划状态文本
const getPlanStatusText = (status) => {
    const statusMap = {
        draft: '草稿',
        in_progress: '进行中',
        completed: '已完成',
        cancelled: '已取消'
    }
    return statusMap[status] || status
}

// 加载实验计划列表
const loadExperimentPlans = async () => {
    try {
        const res = await Taro.request({
            url: experimentPlanApi.list,
            method: 'GET',
            header: {
                'Content-Type': 'application/json',
                'Authorization': Taro.getStorageSync('token') || ''
            },
            data: {
                page: 1,
                pageSize: 2
            }
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            const items = res.data.data.items || []
            experimentPlans.value = items.map(item => ({
                id: item._id,
                title: item.title,
                date: formatDate(item.experimentDate),
                status: item.status,
                statusText: getPlanStatusText(item.status),
                progress: item.progress || 0,
                itemsNeeded: item.itemsNeeded || []
            }))
        }
    } catch (error) {
        console.error('加载实验计划失败:', error)
    }
}

// 加载需求大厅列表
const loadRequestList = async () => {
    try {
        loading.value = true
        const userId = Taro.getStorageSync('user_id')
        currentUserId.value = userId

        // 构建请求参数
        const params = {
            page: 1,
            pageSize: 10,
            status: 'urgent,normal'
        }

        // 添加类型筛选
        if (currentRequestType.value !== 'all') {
            params.requestType = currentRequestType.value
        }

        // 添加搜索关键词
        if (searchKeyword.value) {
            params.keyword = searchKeyword.value
        }

        const res = await Taro.request({
            url: shareRequestApi.list,
            method: 'GET',
            header: {
                'Content-Type': 'application/json',
                'Authorization': Taro.getStorageSync('token') || ''
            },
            data: params
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            const items = res.data.data.items || []
            requestList.value = items.map(item => {
                const userName = item.publisher?.nickName || item.publisherName || '未知用户'
                return {
                    id: item._id,
                    avatar: item.publisher?.avatar || '',
                    userFirstChar: userName.charAt(0).toUpperCase(),
                    userName: userName,
                    labName: item.labName || '未知实验室',
                    title: item.title,
                    description: item.description,
                    itemName: item.itemName,
                    quantity: item.quantity,
                    expectedTime: item.expectedTime,
                    status: item.status,
                    statusText: getStatusText(item.status),
                    publishTime: formatRelativeTime(item.createdAt),
                    isMyPublish: item.publisher?._id === userId
                }
            })

            // 更新徽章数量
            tabs.value[0].badge = requestList.value.length
        }
    } catch (error) {
        console.error('加载需求列表失败:', error)
    } finally {
        loading.value = false
    }
}

// 加载我的共享列表
const loadMyShareList = async () => {
    try {
        loading.value = true
        const res = await Taro.request({
            url: shareRequestApi.myShares,
            method: 'GET',
            header: {
                'Content-Type': 'application/json',
                'Authorization': Taro.getStorageSync('token') || ''
            }
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            const items = res.data.data.items || []
            myShareList.value = items.map(item => ({
                id: item.id || item._id,  // 兼容两种格式
                title: item.title,
                description: item.description,
                itemName: item.itemName,
                quantity: item.quantity,
                expectedTime: item.expectedTime,
                consultCount: item.consultCount || 0,
                requestType: item.requestType || 'request',
                status: item.status
            }))
        }
    } catch (error) {
        console.error('加载我的共享失败:', error)
    } finally {
        loading.value = false
    }
}

// 页面显示时加载数据
useDidShow(() => {
    // 检查是否需要刷新（从发布页返回）
    const shouldRefresh = Taro.getStorageSync('shouldRefreshCollaboration')

    if (shouldRefresh) {
        // 清除刷新标志
        Taro.removeStorageSync('shouldRefreshCollaboration')

        // 切换到"我的共享"标签并刷新数据
        currentTab.value = 'my-share'

        Promise.all([
            loadRequestList(),
            loadMyShareList()
        ]).then(() => {
            Taro.showToast({
                title: '发布成功',
                icon: 'success',
                duration: 1500
            })
        })
    } else {
        // 正常加载所有数据
        loadExperimentPlans()
        loadRequestList()
        loadMyShareList()
    }
})

// 查看更多实验计划
const handleViewMorePlans = () => {
    Taro.navigateTo({
        url: '/pages/collaboration/experiment-plan/experiment-plan'
    })
}

// 实验计划卡片点击
const handlePlanClick = (plan) => {
    Taro.navigateTo({
        url: `/pages/collaboration/experiment-plan/experiment-plan-detail?id=${plan.id}`
    })
}

// 标签切换
const handleTabChange = (value) => {
    currentTab.value = value

    // 切换标签时刷新对应的数据，显示加载提示
    Taro.showLoading({
        title: '加载中...',
        mask: true
    })

    if (value === 'requests') {
        loadRequestList().finally(() => {
            Taro.hideLoading()
        })
    } else if (value === 'my-share') {
        loadMyShareList().finally(() => {
            Taro.hideLoading()
        })
    }
}

// 需求类型切换
const handleRequestTypeChange = (value) => {
    currentRequestType.value = value
    loadRequestList()
}

// 搜索输入（带防抖）
const handleSearchInput = () => {
    // 清除之前的定时器
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }

    // 设置新的定时器，400ms 后执行搜索
    debounceTimer = setTimeout(() => {
        loadRequestList()
    }, 400)
}

// 清空搜索
const clearSearch = () => {
    searchKeyword.value = ''
    loadRequestList()
}

// 需求卡片点击
const handleRequestClick = (item) => {
    Taro.showToast({
        title: `查看${item.userName}的需求详情`,
        icon: 'none'
    })
}

// 联系TA
const handleContact = async (item) => {
    try {
        const res = await Taro.request({
            url: shareRequestApi.contact(item.id),
            method: 'GET',
            header: {
                'Content-Type': 'application/json',
                'Authorization': Taro.getStorageSync('token') || ''
            }
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            selectedContact.value = res.data.data.fullContact
            showContactModal.value = true
        } else {
            Taro.showToast({
                title: res.data.errorInfo || '获取联系方式失败',
                icon: 'none'
            })
        }
    } catch (error) {
        Taro.showToast({
            title: '网络错误',
            icon: 'none'
        })
    }
}

// 复制联系方式
const copyContact = () => {
    Taro.setClipboardData({
        data: selectedContact.value,
        success: () => {
            Taro.showToast({
                title: '已复制到剪贴板',
                icon: 'success'
            })
        }
    })
}

// 关闭联系弹窗
const closeContactModal = () => {
    showContactModal.value = false
    selectedContact.value = ''
}

// 发布
const handlePublish = () => {
    Taro.navigateTo({
        url: '/pages/collaboration/share-publish/share-publish'
    })
}

// 编辑共享
const handleEditShare = (item) => {
    Taro.showToast({
        title: `编辑${item.itemName}`,
        icon: 'none'
    })
}

// 删除共享
const handleDeleteShare = (item) => {
    Taro.showModal({
        title: '确认删除',
        content: `确定要删除"${item.title}"吗？`,
        success: async (res) => {
            if (res.confirm) {
                try {
                    const deleteRes = await Taro.request({
                        url: shareRequestApi.delete(item.id),
                        method: 'DELETE',
                        header: {
                            'Content-Type': 'application/json',
                            'Authorization': Taro.getStorageSync('token') || ''
                        }
                    })

                    if (deleteRes.statusCode === 200 && deleteRes.data.errCode === '0') {
                        Taro.showToast({
                            title: '删除成功',
                            icon: 'success'
                        })
                        // 重新加载列表
                        loadMyShareList()
                    } else {
                        Taro.showToast({
                            title: deleteRes.data.errorInfo || '删除失败',
                            icon: 'none'
                        })
                    }
                } catch (error) {
                    console.error('删除失败:', error)
                    Taro.showToast({
                        title: '网络错误',
                        icon: 'none'
                    })
                }
            }
        }
    })
}
</script>
