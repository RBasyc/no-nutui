<template>
    <view class="statistics-page">
        <!-- Page Header -->
        <view class="page-header">
            <text class="header-title">📊 数据统计</text>
        </view>

        <!-- Loading State -->
        <view v-if="loading" class="loading-state">
            <text class="loading-text">加载中...</text>
        </view>

        <!-- Statistics Content -->
        <view v-else class="statistics-content">
            <!-- Overview Metrics -->
            <view class="section-title">📈 概览指标</view>
            <view class="metrics-grid">
                <view
                    v-for="metric in overviewMetrics"
                    :key="metric.key"
                    class="metric-card"
                    :style="{ borderLeftColor: metric.color }"
                >
                    <text class="metric-icon">{{ metric.icon }}</text>
                    <view class="metric-info">
                        <text class="metric-value">{{
                            getAnimatedValue(metric.key, metric.value)
                        }}</text>
                        <text class="metric-label">{{ metric.label }}</text>
                    </view>
                </view>
            </view>

            <!-- Category Breakdown -->
            <view class="section-title">📦 分类统计</view>
            <view class="category-section">
                <view class="pie-chart-container">
                    <view
                        class="pie-chart"
                        :style="{ background: generateConicGradient() }"
                    >
                        <view class="pie-center">
                            <text class="pie-total">{{
                                totalCategoryItems
                            }}</text>
                            <text class="pie-label">总物品</text>
                        </view>
                    </view>

                    <view class="pie-legend">
                        <view
                            v-for="(item, key) in categoryData"
                            :key="key"
                            class="legend-item"
                        >
                            <view
                                class="legend-color"
                                :style="{
                                    backgroundColor: categoryColors[key]
                                }"
                            ></view>
                            <text class="legend-label">{{ key }}</text>
                            <text class="legend-value">{{ item.count }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- Trend Chart -->
            <view class="section-title">📉 出入库趋势 (7天)</view>
            <view class="trend-section">
                <canvas
                    type="2d"
                    id="trendCanvas"
                    canvas-id="trendCanvas"
                    class="trend-canvas"
                ></canvas>

                <!-- Legend -->
                <view class="trend-legend">
                    <view class="legend-item">
                        <view
                            class="legend-color"
                            style="background: #52c41a"
                        ></view>
                        <text>入库</text>
                    </view>
                    <view class="legend-item">
                        <view
                            class="legend-color"
                            style="background: #ff4d4f"
                        ></view>
                        <text>出库</text>
                    </view>
                </view>
            </view>

            <!-- Transaction Summary -->
            <view class="section-title">📋 本周出入库汇总</view>
            <view class="transaction-section">
                <view
                    v-for="(item, key) in displayTransactionData"
                    :key="key"
                    class="bar-item"
                >
                    <view class="bar-label">{{ typeLabels[key] }}</view>
                    <view class="bar-track">
                        <view
                            class="bar-fill"
                            :style="{
                                width:
                                    (item.count / maxTransactionCount) * 100 +
                                    '%',
                                backgroundColor: typeColors[key],
                                '--target-width':
                                    (item.count / maxTransactionCount) * 100 +
                                    '%'
                            }"
                        >
                            <text class="bar-value">{{ item.count }}</text>
                        </view>
                    </view>
                    <view class="bar-quantity"
                        >{{ item.totalQuantity }} 次</view
                    >
                </view>
                <view
                    v-if="Object.keys(displayTransactionData).length === 0"
                    class="empty-state"
                >
                    <text class="empty-text">本周暂无出入库记录</text>
                </view>
            </view>

            <!-- Top Consumed Items -->
            <view class="section-title">🔥 本月消耗排行 TOP10</view>
            <view class="top-consumed-section">
                <view
                    v-for="(item, index) in topConsumedItems"
                    :key="item.inventoryId"
                    class="consumed-item"
                >
                    <view class="item-rank">{{ index + 1 }}</view>
                    <view class="item-info">
                        <text class="item-name">{{ item.name }}</text>
                        <text class="item-code">{{ item.code }}</text>
                    </view>
                    <view class="item-stats">
                        <text class="consumed-amount"
                            >{{ item.totalConsumed }} {{ item.unit }}</text
                        >
                        <text class="operation-count"
                            >{{ item.operationCount }} 次操作</text
                        >
                    </view>
                </view>
                <view v-if="topConsumedItems.length === 0" class="empty-state">
                    <text class="empty-text">本月暂无消耗记录</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import Taro from '@tarojs/taro'
import './statistics.scss'

// API base URL
const BACKEND_BASE_URL = 'http://localhost:3000'

// Loading state
const loading = ref(true)

// Overview metrics interface
interface OverviewMetric {
    key: string
    icon: string
    label: string
    value: number | string
    color: string
}

const overviewMetrics = ref<OverviewMetric[]>([])

// Animated values storage
const animatedValues = ref<Record<string, string>>({})

// Category data interface
interface CategoryData {
    [key: string]: {
        count: number
        totalValue: number
    }
}

const categoryData = ref<CategoryData>({})

// Trend data interface
interface TrendPoint {
    date: string
    in: number
    out: number
}

const trendData = ref<TrendPoint[]>([])

// Transaction summary interface
interface TransactionSummary {
    [key: string]: {
        count: number
        totalQuantity: number
    }
}

const transactionSummary = ref<TransactionSummary>({})

// Top consumed items interface
interface TopConsumedItem {
    inventoryId: string
    name: string
    code: string
    category: string
    unit: string
    totalConsumed: number
    operationCount: number
}

const topConsumedItems = ref<TopConsumedItem[]>([])

// Category colors
const categoryColors: Record<string, string> = {
    试剂: '#1E90FF',
    耗材: '#52c41a',
    仪器: '#faad14',
    其他: '#8c8c8c'
}

// Transaction type labels
const typeLabels: Record<string, string> = {
    purchase_in: '采购入库',
    return_in: '归还入库',
    consume_out: '消耗出库',
    use_out: '领用出库',
    adjust: '库存调整'
}

// Transaction type colors
const typeColors: Record<string, string> = {
    purchase_in: '#52c41a',
    return_in: '#1890ff',
    consume_out: '#ff4d4f',
    use_out: '#faad14',
    adjust: '#8c8c8c'
}

// Animated value getter
const getAnimatedValue = (key: string, value: number | string): string => {
    if (!animatedValues.value[key]) {
        const numValue = typeof value === 'number' ? value : parseFloat(value)
        animateValue(key, numValue)
    }
    return animatedValues.value[key] || value.toString()
}

// Counter animation
const animateValue = (key: string, target: number) => {
    const duration = 1000
    const steps = 30
    const stepValue = target / steps
    let current = 0

    const timer = setInterval(() => {
        current += stepValue
        if (current >= target) {
            current = target
            clearInterval(timer)
        }
        animatedValues.value[key] = Math.floor(current).toString()
    }, duration / steps)
}

// Total category items
const totalCategoryItems = computed(() => {
    return Object.values(categoryData.value).reduce(
        (sum, item) => sum + item.count,
        0
    )
})

// Generate conic gradient for pie chart
const generateConicGradient = () => {
    let currentAngle = 0
    const gradients: string[] = []

    for (const [key, item] of Object.entries(categoryData.value)) {
        if (item.count === 0) continue

        const percentage = (item.count / totalCategoryItems.value) * 100
        const angle = (percentage / 100) * 360
        const color = categoryColors[key]

        gradients.push(`${color} ${currentAngle}deg ${currentAngle + angle}deg`)
        currentAngle += angle
    }

    if (gradients.length === 0) {
        return 'conic-gradient(#f0f0f0 0deg 360deg)'
    }

    return `conic-gradient(${gradients.join(', ')})`
}

// Display transaction data (filter out zero counts)
const displayTransactionData = computed(() => {
    return Object.fromEntries(
        Object.entries(transactionSummary.value).filter(
            ([_, value]) => value.count > 0
        )
    )
})

// Max transaction count for bar scaling
const maxTransactionCount = computed(() => {
    return Math.max(
        ...Object.values(displayTransactionData.value).map((v) => v.count),
        1
    )
})

// Draw trend chart on Canvas
const drawTrendChart = async () => {
    if (!trendData.value || trendData.value.length === 0) return

    try {
        const query = Taro.createSelectorQuery()
        query
            .select('#trendCanvas')
            .fields({ node: true, size: true })
            .exec(async (res) => {
                if (!res || !res[0]) {
                    console.warn('Canvas node not found')
                    return
                }

                const canvas = res[0].node
                const ctx = canvas.getContext('2d')

                // 设置 canvas 实际尺寸
                const dpr = Taro.getSystemInfoSync().pixelRatio || 1
                const chartWidth = 640
                const chartHeight = 240
                const padding = 40

                canvas.width = chartWidth * dpr
                canvas.height = chartHeight * dpr
                ctx.scale(dpr, dpr)

                // 清空画布
                ctx.clearRect(0, 0, chartWidth, chartHeight)

                // 绘制背景
                ctx.fillStyle = '#fafafa'
                ctx.fillRect(0, 0, chartWidth, chartHeight)

                const maxVal =
                    Math.max(
                        ...trendData.value.map((d) => Math.max(d.in, d.out)),
                        1
                    ) * 1.1
                const chartAreaHeight = chartHeight - padding * 2
                const chartAreaWidth = chartWidth - padding * 2

                // 绘制网格线
                ctx.strokeStyle = '#e8e8e8'
                ctx.lineWidth = 1
                for (let i = 0; i <= 5; i++) {
                    const y = padding + (chartAreaHeight / 5) * i
                    ctx.beginPath()
                    ctx.moveTo(padding, y)
                    ctx.lineTo(chartWidth - padding, y)
                    ctx.stroke()
                }

                // 绘制入库线（绿色）
                if (trendData.value.length > 1) {
                    ctx.strokeStyle = '#52c41a'
                    ctx.lineWidth = 2
                    ctx.beginPath()

                    trendData.value.forEach((point, index) => {
                        const x =
                            padding +
                            (index / (trendData.value.length - 1)) *
                                chartAreaWidth
                        const y =
                            padding +
                            chartAreaHeight -
                            (point.in / maxVal) * chartAreaHeight

                        if (index === 0) {
                            ctx.moveTo(x, y)
                        } else {
                            ctx.lineTo(x, y)
                        }
                    })

                    ctx.stroke()

                    // 绘制入库数据点
                    ctx.fillStyle = '#52c41a'
                    trendData.value.forEach((point, index) => {
                        const x =
                            padding +
                            (index / (trendData.value.length - 1)) *
                                chartAreaWidth
                        const y =
                            padding +
                            chartAreaHeight -
                            (point.in / maxVal) * chartAreaHeight
                        ctx.beginPath()
                        ctx.arc(x, y, 3, 0, 2 * Math.PI)
                        ctx.fill()
                    })
                }

                // 绘制出库线（红色）
                if (trendData.value.length > 1) {
                    ctx.strokeStyle = '#ff4d4f'
                    ctx.lineWidth = 2
                    ctx.beginPath()

                    trendData.value.forEach((point, index) => {
                        const x =
                            padding +
                            (index / (trendData.value.length - 1)) *
                                chartAreaWidth
                        const y =
                            padding +
                            chartAreaHeight -
                            (point.out / maxVal) * chartAreaHeight

                        if (index === 0) {
                            ctx.moveTo(x, y)
                        } else {
                            ctx.lineTo(x, y)
                        }
                    })

                    ctx.stroke()

                    // 绘制出库数据点
                    ctx.fillStyle = '#ff4d4f'
                    trendData.value.forEach((point, index) => {
                        const x =
                            padding +
                            (index / (trendData.value.length - 1)) *
                                chartAreaWidth
                        const y =
                            padding +
                            chartAreaHeight -
                            (point.out / maxVal) * chartAreaHeight
                        ctx.beginPath()
                        ctx.arc(x, y, 3, 0, 2 * Math.PI)
                        ctx.fill()
                    })
                }
            })
    } catch (error) {
        console.error('Failed to draw chart:', error)
    }
}

// Fetch all statistics data
const fetchAllStatistics = async () => {
    try {
        loading.value = true

        const token = Taro.getStorageSync('token')
        if (!token) {
            Taro.showToast({ title: '请先登录', icon: 'none' })
            return
        }

        // Parallel fetch all data
        const [
            overviewRes,
            categoryRes,
            trendRes,
            transactionRes,
            topConsumedRes
        ] = await Promise.all([
            Taro.request({
                url: BACKEND_BASE_URL + '/adminapi/statistics/overview',
                method: 'GET',
                header: { Authorization: token }
            }),
            Taro.request({
                url: BACKEND_BASE_URL + '/adminapi/statistics/category',
                method: 'GET',
                header: { Authorization: token }
            }),
            Taro.request({
                url: BACKEND_BASE_URL + '/adminapi/statistics/trend?days=7',
                method: 'GET',
                header: { Authorization: token }
            }),
            Taro.request({
                url: BACKEND_BASE_URL + '/adminapi/statistics/transaction-summary',
                method: 'GET',
                header: { Authorization: token }
            }),
            Taro.request({
                url: BACKEND_BASE_URL + '/adminapi/statistics/top-consumed',
                method: 'GET',
                header: { Authorization: token }
            })
        ])

        // Process overview response
        if (overviewRes.data.errCode === '0') {
            const data = overviewRes.data.data
            overviewMetrics.value = [
                {
                    key: 'total',
                    icon: '📦',
                    label: '总物品数',
                    value: data.totalItems,
                    color: '#1E90FF'
                },
                {
                    key: 'value',
                    icon: '💰',
                    label: '总价值(元)',
                    value: data.totalValue.toFixed(2),
                    color: '#52c41a'
                },
                {
                    key: 'alert',
                    icon: '⚠️',
                    label: '预警数量',
                    value: data.alertCount,
                    color: '#ff4d4f'
                },
                {
                    key: 'operations',
                    icon: '🔄',
                    label: '本月操作',
                    value: data.monthlyOperations,
                    color: '#faad14'
                }
            ]
        }

        // Process category response
        if (categoryRes.data.errCode === '0') {
            categoryData.value = categoryRes.data.data
        }

        // Process trend response
        if (trendRes.data.errCode === '0') {
            trendData.value = trendRes.data.data
        }

        // Process transaction response
        if (transactionRes.data.errCode === '0') {
            transactionSummary.value = transactionRes.data.data
        }

        // Process top consumed response
        if (topConsumedRes.data.errCode === '0') {
            topConsumedItems.value = topConsumedRes.data.data
        }

        // Draw trend chart after data is loaded
        await nextTick()
        drawTrendChart()
    } catch (error) {
        console.error('Failed to fetch statistics:', error)
        Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchAllStatistics()
})
</script>
