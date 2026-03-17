<template>
    <view class="transaction-records-page">
        <!-- 页面标题 -->
        <view class="page-header">
            <text class="page-title">出入库流水</text>
        </view>

        <!-- 筛选面板 -->
        <view class="filter-panel">
            <view class="filter-row">
                <text class="filter-label">操作类型</text>
                <view class="filter-options">
                    <view
                        v-for="type in operationTypes"
                        :key="type.value"
                        :class="[
                            'filter-option',
                            { active: filterType === type.value }
                        ]"
                        @tap="handleTypeFilter(type.value)"
                    >
                        <text class="option-text">{{ type.label }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 统计卡片 -->
        <view class="stats-cards">
            <view class="stat-card">
                <text class="stat-icon">📥</text>
                <view class="stat-info">
                    <text class="stat-value">{{ stats.inCount }}</text>
                    <text class="stat-label">入库次数</text>
                </view>
            </view>
            <view class="stat-card">
                <text class="stat-icon">📤</text>
                <view class="stat-info">
                    <text class="stat-value">{{ stats.outCount }}</text>
                    <text class="stat-label">出库次数</text>
                </view>
            </view>
            <view class="stat-card">
                <text class="stat-icon">📊</text>
                <view class="stat-info">
                    <text class="stat-value">{{ stats.totalCount }}</text>
                    <text class="stat-label">总记录</text>
                </view>
            </view>
        </view>

        <!-- 流水列表 -->
        <scroll-view scrollY class="records-scroll" @scrolltolower="loadMore">
            <view
                v-for="record in records"
                :key="record.id"
                class="record-card"
                @tap="handleRecordClick(record)"
            >
                <view class="record-header">
                    <view class="record-type" :class="record.type">
                        <text class="type-icon">{{
                            getTypeIcon(record.type)
                        }}</text>
                        <text class="type-text">{{
                            getTypeText(record.type)
                        }}</text>
                    </view>
                    <text class="record-time">{{
                        formatDateTime(record.createdAt)
                    }}</text>
                </view>

                <view class="record-content">
                    <view class="content-row">
                        <text class="content-label">耗材名称</text>
                        <text class="content-value">{{ record.itemName }}</text>
                    </view>
                    <view class="content-row">
                        <text class="content-label">耗材编码</text>
                        <text class="content-value">{{ record.itemCode }}</text>
                    </view>
                    <view class="content-row">
                        <text class="content-label">操作数量</text>
                        <text
                            class="content-value"
                            :class="{
                                positive: record.quantity > 0,
                                negative: record.quantity < 0
                            }"
                        >
                            {{ record.quantity > 0 ? '+' : ''
                            }}{{ record.quantity }}
                        </text>
                    </view>
                    <view class="content-row">
                        <text class="content-label">前后数量</text>
                        <text class="content-value"
                            >{{ record.quantityBefore }} →
                            {{ record.quantityAfter }}</text
                        >
                    </view>
                    <view class="content-row">
                        <text class="content-label">操作人</text>
                        <text class="content-value">{{ record.userName }}</text>
                    </view>
                    <view v-if="record.remark" class="content-row">
                        <text class="content-label">备注</text>
                        <text class="content-value remark">{{
                            record.remark
                        }}</text>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-if="records.length === 0 && !loading" class="empty-state">
                <text class="empty-icon">📋</text>
                <text class="empty-text">暂无流水记录</text>
            </view>

            <!-- 加载状态 -->
            <view v-if="loading" class="loading-state">
                <text class="loading-text">加载中...</text>
            </view>

            <!-- 没有更多 -->
            <view
                v-if="!hasMore && records.length > 0"
                class="no-more-state"
            >
                <text class="no-more-text">没有更多了</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useDidShow } from '@tarojs/taro'
import transactionApi from '../../../api/transactionAPI'
import './transaction-records.scss'

// 操作类型选项
const operationTypes = [
    { value: '', label: '全部' },
    { value: 'purchase_in', label: '采购入库' },
    { value: 'return_in', label: '归还入库' },
    { value: 'consume_out', label: '领用出库' },
    { value: 'use_out', label: '使用出库' }
]

// 筛选条件
const filterType = ref('')

// 流水记录列表
const records = ref([])

// 统计数据
const stats = reactive({
    inCount: 0,
    outCount: 0,
    totalCount: 0
})

// 分页
const currentPage = ref(1)
const pageSize = 20
const hasMore = ref(true)
const loading = ref(false)

// 获取类型图标
const getTypeIcon = (type) => {
    const iconMap = {
        purchase_in: '📥',
        return_in: '🔄',
        consume_out: '📤',
        use_out: '🔧'
    }
    return iconMap[type] || '📋'
}

// 获取类型文本
const getTypeText = (type) => {
    const textMap = {
        purchase_in: '采购入库',
        return_in: '归还入库',
        consume_out: '领用出库',
        use_out: '使用出库'
    }
    return textMap[type] || type
}

// 格式化日期时间
const formatDateTime = (date) => {
    if (!date) return '-'
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
}

// 处理类型筛选
const handleTypeFilter = (type) => {
    filterType.value = type
    currentPage.value = 1
    hasMore.value = true
    loadRecords()
}

// 加载流水记录
const loadRecords = async () => {
    if (loading.value || !hasMore.value) return

    try {
        loading.value = true

        const params = {
            page: currentPage.value,
            pageSize
        }

        // 添加筛选条件
        if (filterType.value) {
            params.type = filterType.value
        }

        const res = await Taro.request({
            url: transactionApi.records,
            method: 'GET',
            data: params,
            header: {
                Authorization: Taro.getStorageSync('token') || ''
            }
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            const data = res.data.data

            // 后端返回的数据结构：{ total, transactions, page, pageSize, totalPages }
            // transactions 中已 populate inventoryId 和 operator
            const processedTransactions = (data.transactions || []).map(t => ({
                id: t._id,
                type: t.type,
                quantity: t.quantity,
                quantityBefore: t.quantityBefore,
                quantityAfter: t.quantityAfter,
                remark: t.remark,
                userName: t.userName,
                operationTime: t.operationTime,
                createdAt: t.createdAt,
                itemName: t.inventoryId?.name || '未知耗材',
                itemCode: t.inventoryId?.code || '-'
            }))

            if (currentPage.value === 1) {
                records.value = processedTransactions
            } else {
                records.value = [...records.value, ...processedTransactions]
            }

            hasMore.value = currentPage.value < (data.totalPages || 1)

            // 更新统计数据
            updateStats()
        } else {
            Taro.showToast({
                title: res.data?.errorInfo || '加载失败',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('加载流水记录失败:', error)
        Taro.showToast({
            title: '加载失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 更新统计数据
const updateStats = () => {
    let inCount = 0
    let outCount = 0

    records.value.forEach((record) => {
        if (record.type === 'purchase_in' || record.type === 'return_in') {
            inCount++
        } else if (
            record.type === 'consume_out' ||
            record.type === 'use_out'
        ) {
            outCount++
        }
    })

    stats.inCount = inCount
    stats.outCount = outCount
    stats.totalCount = records.value.length
}

// 加载更多
const loadMore = () => {
    if (!loading.value && hasMore.value) {
        currentPage.value++
        loadRecords()
    }
}

// 点击记录
const handleRecordClick = (record) => {
    // 可以在这里实现详情查看功能
    console.log('查看记录详情:', record)
}

// 页面加载
onMounted(() => {
    loadRecords()
})

// 页面显示时刷新
useDidShow(() => {
    if (currentPage.value === 1) {
        loadRecords()
    }
})
</script>
