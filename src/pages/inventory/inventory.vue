<template>
    <view class="page-wrapper">
        <!-- 页面内容 -->
        <view class="inventory-page">
            <!-- 顶部区域 -->
            <view class="page-header">
                <view class="header-title">库存管理</view>
                <view class="header-actions">
                    <view class="action-btn" @tap="handleSort">
                        <text class="btn-icon">🔃</text>
                        <text class="btn-text">{{ sortText }}</text>
                    </view>
                    <view class="action-btn primary" @tap="handleAddItem">
                        <text class="btn-icon">+</text>
                        <text class="btn-text">添加</text>
                    </view>
                </view>
            </view>

            <!-- 搜索框 -->
            <view class="search-section">
                <view class="search-bar">
                    <text class="search-icon">🔍</text>
                    <input
                        class="search-input"
                        v-model="searchValue"
                        placeholder="搜索耗材名称、CAS号、货号..."
                        placeholder-class="search-placeholder"
                    />
                </view>
            </view>

            <!-- 分类标签 -->
            <view class="category-tabs">
                <scroll-view scroll-x enable-flex class="tabs-scroll">
                    <view
                        v-for="(category, index) in categories"
                        :key="index"
                        class="tab-item"
                        :class="{ active: currentCategory === category.value }"
                        @tap="handleCategoryChange(category.value)"
                    >
                        <text class="tab-icon">{{ category.icon }}</text>
                        <text class="tab-label">{{ category.label }}</text>
                    </view>
                </scroll-view>
            </view>

            <!-- 统计摘要卡片 -->
            <view class="stats-summary">
                <view class="summary-card">
                    <text class="summary-icon">📦</text>
                    <view class="summary-info">
                        <text class="summary-value">{{
                            statsData.totalItems
                        }}</text>
                        <text class="summary-label">总数量</text>
                    </view>
                </view>
                <view class="summary-card warning">
                    <text class="summary-icon">⚠️</text>
                    <view class="summary-info">
                        <text class="summary-value">{{
                            statsData.expiring
                        }}</text>
                        <text class="summary-label">即将过期</text>
                    </view>
                </view>
                <view class="summary-card danger">
                    <text class="summary-icon">🔴</text>
                    <view class="summary-info">
                        <text class="summary-value">{{
                            statsData.lowStock
                        }}</text>
                        <text class="summary-label">库存不足</text>
                    </view>
                </view>
            </view>

            <!-- 库存列表 -->
            <view class="inventory-list">
                <view
                    v-for="(item, index) in filteredItems"
                    :key="index"
                    class="inventory-card"
                    @tap="handleItemClick(item)"
                >
                    <!-- 卡片头部 -->
                    <view class="card-header">
                        <text class="item-icon">{{ item.icon }}</text>
                        <view class="item-main">
                            <text class="item-name">{{ item.name }}</text>
                            <view class="item-meta">
                                <text class="meta-item">{{ item.code }}</text>
                                <text class="meta-item">{{
                                    item.spec || item.specification
                                }}</text>
                            </view>
                        </view>
                        <view class="stock-badge" :class="item.stockStatus">
                            {{
                                item.stockStatus === 'low'
                                    ? '库存低'
                                    : item.stockStatus === 'out'
                                    ? '缺货'
                                    : '充足'
                            }}
                        </view>
                    </view>

                    <!-- 卡片内容 -->
                    <view class="card-content">
                        <view class="content-row">
                            <view class="content-item">
                                <text class="item-label">库存数量</text>
                                <text class="item-value">{{
                                    item.quantity
                                }}</text>
                            </view>
                            <view class="content-item">
                                <text class="item-label">单位</text>
                                <text class="item-value">{{ item.unit }}</text>
                            </view>
                            <view class="content-item">
                                <text class="item-label">位置</text>
                                <text class="item-value">{{
                                    item.location
                                }}</text>
                            </view>
                        </view>

                        <!-- 过期信息 -->
                        <view v-if="item.expiryDate" class="expiry-info">
                            <view class="expiry-label">
                                <text class="expiry-icon">⏰</text>
                                <text>过期时间</text>
                            </view>
                            <text
                                class="expiry-date"
                                :class="getExpiryClass(item.daysUntilExpiry)"
                            >
                                {{ item.expiryDate }}
                                <text
                                    v-if="item.daysUntilExpiry !== null"
                                    class="days-badge"
                                >
                                    ({{ item.daysUntilExpiry }}天)
                                </text>
                            </text>
                        </view>
                    </view>

                    <!-- 卡片底部操作 -->
                    <view class="card-footer">
                        <view
                            class="footer-action"
                            @tap.stop="handleEdit(item)"
                        >
                            <text class="action-icon">✏️</text>
                            <text class="action-text">编辑</text>
                        </view>
                        <view
                            class="footer-action"
                            @tap.stop="handleRecord(item)"
                        >
                            <text class="action-icon">📝</text>
                            <text class="action-text">记录</text>
                        </view>
                        <view
                            class="footer-action"
                            @tap.stop="handleQRCode(item)"
                        >
                            <text class="action-icon">📱</text>
                            <text class="action-text">二维码</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view
                v-if="filteredItems.length === 0 && !loading"
                class="empty-state"
            >
                <text class="empty-icon">📦</text>
                <text class="empty-text">暂无库存数据</text>
                <text class="empty-hint">点击"添加"按钮添加耗材</text>
            </view>

            <!-- 加载状态 -->
            <view v-if="loading" class="loading-state">
                <text>加载中...</text>
            </view>
        </view>

        <!-- 二维码弹窗 -->
        <view v-show="showQRModal" class="qrcode-modal" @tap="showQRModal = false">
            <view class="qrcode-content" @tap.stop>
                <view class="qrcode-header">
                    <text class="qrcode-title">耗材二维码</text>
                    <view class="close-btn" @tap="showQRModal = false">✕</view>
                </view>
                <view class="qrcode-body">
                    <view class="qrcode-display">
                        <view class="qrcode-placeholder">{{ currentItem?.code }}</view>
                    </view>
                    <view class="qrcode-info">
                        <text class="info-name">{{ currentItem?.name }}</text>
                        <text class="info-code">{{ currentItem?.code }}</text>
                    </view>
                </view>
                <view class="qrcode-footer">
                    <view class="btn-secondary" @tap="showQRModal = false">关闭</view>
                    <view class="btn-primary" @tap="handleSaveQRCode">保存图片</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Taro from '@tarojs/taro'
import { usePullDownRefresh, useReachBottom, useDidShow } from '@tarojs/taro'
import './inventory.scss'
import inventoryApi from '../../api/inventoryAPI'

// 搜索值
const searchValue = ref('')

// 当前分类
const currentCategory = ref('all')

// 排序方式
const currentSort = ref('default')
const sortOptions = [
    { value: 'default', label: '默认排序' },
    { value: 'expiry', label: '按过期时间' },
    { value: 'quantity', label: '按库存数量' },
    { value: 'name', label: '按名称' }
]

const sortText = computed(() => {
    return (
        sortOptions.find((opt) => opt.value === currentSort.value)?.label ||
        '排序'
    )
})

// 分类数据
const categories = ref([
    { icon: '📋', label: '全部', value: 'all' },
    { icon: '🧪', label: '试剂', value: '试剂' },
    { icon: '📦', label: '耗材', value: '耗材' },
    { icon: '⚙️', label: '仪器', value: '仪器' },
    { icon: '📁', label: '其他', value: '其他' }
])

// 统计数据
const statsData = ref({
    totalItems: 0,
    expiring: 0,
    lowStock: 0
})

// 加载状态
const loading = ref(false)
const refreshing = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = 20
const hasMore = ref(true)

// 库存列表数据
const inventoryItems = ref([])

// 当前选中的耗材（用于跳转和二维码）
const currentItem = ref(null)

// 二维码弹窗状态
const showQRModal = ref(false)

// 加载库存列表
const loadInventoryList = async (refresh = false) => {
    if (loading.value && !refresh) return

    try {
        loading.value = true
        if (refresh) {
            refreshing.value = true
            currentPage.value = 1
            hasMore.value = true
        }

        // 构建请求参数，避免传递 undefined
        const params = {
            page: currentPage.value,
            pageSize
        }

        // 只有当分类不是 'all' 时才添加 category 参数
        if (currentCategory.value !== 'all') {
            params.category = currentCategory.value
        }

        // 只有当有搜索内容时才添加 search 参数
        if (searchValue.value) {
            params.search = searchValue.value
        }

        const res = await Taro.request({
            url: inventoryApi.list,
            method: 'GET',
            data: params,
            header: {
                Authorization: Taro.getStorageSync('token')
            }
        })

        // 检查HTTP状态码
        if (res.statusCode !== 200) {
            throw new Error(`HTTP ${res.statusCode}`)
        }

        // 检查业务错误码
        if (res.data.errCode && res.data.errCode !== '0') {
            Taro.showToast({
                title: res.data.errorInfo || '加载失败',
                icon: 'none'
            })
            if (refresh) {
                inventoryItems.value = []
            }
            return
        }

        // 后端返回 {errCode, errorInfo, data: {total, items, page, pageSize, totalPages}}
        const data = res.data.data

        // 防御性检查：确保data和data.items存在且是数组
        if (!data || !Array.isArray(data.items)) {
            if (refresh) {
                inventoryItems.value = []
            }
            return
        }

        if (refresh) {
            inventoryItems.value = data.items
        } else {
            inventoryItems.value = [...inventoryItems.value, ...data.items]
        }

        // 判断是否还有更多数据
        hasMore.value = inventoryItems.value.length < (data.total || 0)
    } catch (error) {
        console.error('加载列表失败:', error)
        Taro.showToast({
            title: '加载失败',
            icon: 'none'
        })
        // 确保出错时inventoryItems是数组
        if (refresh) {
            inventoryItems.value = []
        }
    } finally {
        loading.value = false
        refreshing.value = false
        Taro.stopPullDownRefresh()
    }
}

// 过滤后的列表
const filteredItems = computed(() => {
    // 防御性检查：确保inventoryItems.value是数组
    let items = Array.isArray(inventoryItems.value)
        ? [...inventoryItems.value]
        : []

    // 排序
    switch (currentSort.value) {
        case 'expiry':
            items.sort((a, b) => {
                if (!a || a.daysUntilExpiry === null) return 1
                if (!b || b.daysUntilExpiry === null) return -1
                return a.daysUntilExpiry - b.daysUntilExpiry
            })
            break
        case 'quantity':
            items.sort((a, b) => (a?.quantity || 0) - (b?.quantity || 0))
            break
        case 'name':
            items.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))
            break
    }

    return items
})

// 获取过期状态样式
const getExpiryClass = (days) => {
    if (days === null) return ''
    if (days <= 7) return 'critical'
    if (days <= 30) return 'warning'
    return 'normal'
}

// 分类切换
const handleCategoryChange = (category) => {
    currentCategory.value = category
    loadInventoryList(true)
}

// 监听搜索值变化（防抖）
let searchTimer = null
watch(searchValue, () => {
    if (searchTimer) {
        clearTimeout(searchTimer)
    }
    searchTimer = setTimeout(() => {
        loadInventoryList(true)
    }, 500)
})

// 排序切换
const handleSort = () => {
    const currentIndex = sortOptions.findIndex(
        (opt) => opt.value === currentSort.value
    )
    const nextIndex = (currentIndex + 1) % sortOptions.length
    currentSort.value = sortOptions[nextIndex].value
    Taro.showToast({
        title: `已切换至${sortOptions[nextIndex].label}`,
        icon: 'none'
    })
}

// 添加耗材
const handleAddItem = () => {
    Taro.navigateTo({
        url: '/pages/inventory-edit/inventory-edit'
    })
}

// 编辑耗材
const handleEdit = (item) => {
    Taro.navigateTo({
        url: `/pages/inventory-edit/inventory-edit?id=${item._id || item.id}`
    })
}

// 记录使用
const handleRecord = (item) => {
    Taro.navigateTo({
        url: `/pages/inventory-record/inventory-record?id=${item._id || item.id}`
    })
}

// 生成二维码
const handleQRCode = (item) => {
    currentItem.value = item
    showQRModal.value = true
}

// 保存二维码
const handleSaveQRCode = () => {
    Taro.showToast({
        title: '保存功能开发中',
        icon: 'none'
    })
}

// 点击卡片
const handleItemClick = (item) => {
    console.log('点击耗材:', item)
    // 显示耗材详情
}

// 下拉刷新
usePullDownRefresh(() => {
    loadInventoryList(true)
})

// 上拉加载更多
useReachBottom(() => {
    if (!loading.value && hasMore.value) {
        currentPage.value++
        loadInventoryList()
    }
})

// 页面显示时刷新
useDidShow(() => {
    loadInventoryList(true)
})

onMounted(() => {
    loadInventoryList(true)
})
</script>
