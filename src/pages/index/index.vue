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

        <!-- AI智能预警卡片 -->
        <view class="ai-alert-card">
            <view class="ai-alert-header">
                <text class="ai-alert-icon iconfont icon-jiqiren"></text>
                <text class="ai-alert-title">AI智能预警</text>
                <view class="header-right">
                    <view v-if="aiAlertData.priority && !aiAlertLoading && !aiAlertRefreshing" class="ai-alert-priority" :class="getPriorityClass(aiAlertData.priority)">
                        <text>{{ aiAlertData.priority }}优先级</text>
                    </view>
                    <!-- 骨架屏优先级标签 -->
                    <view v-if="aiAlertLoading || aiAlertRefreshing" class="skeleton-priority"></view>
                    <!-- 刷新按钮 - 始终显示 -->
                    <view class="refresh-btn-icon" @tap="handleRefreshAlert" :class="{ 'refreshing': aiAlertRefreshing }">
                        <text class="refresh-icon">{{ aiAlertRefreshing ? '⟳' : '↻' }}</text>
                    </view>
                </view>
            </view>

            <!-- 骨架屏加载状态 -->
            <view v-if="aiAlertLoading || aiAlertRefreshing" class="ai-alert-skeleton">
                <!-- 摘要骨架 -->
                <view class="skeleton-summary">
                    <view class="skeleton-line skeleton-line-long"></view>
                    <view class="skeleton-line skeleton-line-medium"></view>
                </view>

                <!-- 预警项骨架 -->
                <view class="skeleton-alerts">
                    <view v-for="i in 2" :key="i" class="skeleton-alert-item">
                        <view class="skeleton-alert-icon"></view>
                        <view class="skeleton-alert-content">
                            <view class="skeleton-line skeleton-line-short"></view>
                            <view class="skeleton-line skeleton-line-tiny"></view>
                        </view>
                    </view>
                </view>

                <!-- 建议骨架 -->
                <view class="skeleton-recommendations">
                    <view class="skeleton-line skeleton-line-medium"></view>
                    <view class="skeleton-line skeleton-line-long"></view>
                </view>
            </view>

            <!-- 有AI建议时显示 -->
            <view v-else-if="aiAlertData.summary" class="ai-alert-content">
                <!-- 概况总结 -->
                <view class="ai-alert-summary">
                    <text class="summary-text">{{ aiAlertData.summary }}</text>
                </view>

                <!-- 前3个最紧急的预警 -->
                <view v-if="aiAlertData.topAlerts && aiAlertData.topAlerts.length > 0" class="ai-alerts-list">
                    <view
                        v-for="(alert, index) in aiAlertData.topAlerts"
                        :key="index"
                        class="ai-alert-item"
                    >
                        <text class="alert-icon iconfont" :class="getAlertIcon(alert.type)"></text>
                        <view class="alert-info">
                            <text class="alert-item-name">{{ alert.itemName }}</text>
                            <text class="alert-info-text">{{ alert.info }}</text>
                        </view>
                    </view>
                </view>

                <!-- 综合建议（包含行动建议） -->
                <view v-if="aiAlertData.recommendations && aiAlertData.recommendations.length > 0" class="ai-recommendations">
                    <text class="recommendations-title iconfont icon-tianjia"> 行动建议</text>
                    <view
                        v-for="(rec, index) in aiAlertData.recommendations"
                        :key="index"
                        class="recommendation-item"
                    >
                        <text class="recommendation-bullet">{{ index + 1 }}.</text>
                        <text class="recommendation-text">{{ rec }}</text>
                    </view>
                </view>
            </view>

            <!-- 无数据或出错时 -->
            <view v-else class="ai-alert-empty">
                <text class="empty-icon iconfont icon-tubiaozhutu"></text>
                <text class="empty-text">点击刷新获取AI预警建议</text>
                <view class="refresh-btn" @tap="loadAiAlert">
                    <text>刷新</text>
                </view>
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
                <text class="action-icon" :class="action.icon"></text>
                <text class="action-label">{{ action.label }}</text>
            </view>
        </view>

        <!-- 即将过期耗材列表 -->
        <view class="list-section">
            <view class="list-header">
                <text class="list-title">即将过期耗材</text>
                <text class="list-more" @tap="handleViewAll">查看全部 →</text>
            </view>

            <!-- 有数据时显示列表 -->
            <view v-if="expiringItems.length > 0" class="consumable-list">
                <view
                    v-for="(item, index) in expiringItems"
                    :key="index"
                    class="list-item"
                    @tap="handleItemClick(item)"
                >
                    <text class="item-icon iconfont" :class="item.icon"></text>
                    <view class="item-info">
                        <text class="item-name">{{ item.name }}</text>
                        <view class="item-desc">
                            <text>货号: {{ item.code }}</text>
                            <text>库存: {{ item.stock }}</text>
                        </view>
                    </view>
                    <view v-if="item.days !== null" class="item-expire-wrapper">
                        <text
                            class="item-expire"
                            :class="getExpiryClass(item.days)"
                        >
                            {{ item.days }}天
                        </text>
                    </view>
                    <text v-else class="item-tag">{{ item.status }}</text>
                </view>
            </view>

            <!-- 无数据时显示空状态 -->
            <view v-else class="empty-state">
                <text class="empty-icon iconfont icon-chenggong"></text>
                <text class="empty-text">暂无即将过期的耗材</text>
            </view>
        </view>

        <!-- 待处理采购清单 -->
        <view class="list-section">
            <view class="list-header">
                <text class="list-title">待处理采购清单</text>
                <text class="list-more" @tap="handleExportPurchaseList"
                    >导出Excel</text
                >
            </view>
            <!-- 有数据时显示列表 -->
            <view v-if="purchaseItems.length > 0" class="consumable-list">
                <view
                    v-for="(item, index) in purchaseItems"
                    :key="index"
                    class="list-item purchase-item"
                    @tap="handleItemClick(item)"
                >
                    <text class="item-icon iconfont" :class="item.icon"></text>
                    <view class="item-info">
                        <text class="item-name">{{ item.name }}</text>
                        <view class="item-desc">
                            <text>建议采购: {{ item.suggestQty }}{{ item.unit }}</text>
                            <text>当前: {{ item.currentStock }}</text>
                        </view>
                    </view>
                    <text class="item-tag urgent">{{ item.status }}</text>
                </view>
            </view>

            <!-- 无数据时显示空状态 -->
            <view v-else class="empty-state">
                <text class="empty-icon iconfont icon-chenggong"></text>
                <text class="empty-text">暂无需要采购的耗材</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import inventoryApi from '../../api/inventoryAPI'
import { checkTokenExpired } from '../../utils/authHelper'
import './index.scss'

// 用户信息
const userInfo = ref({
    nickname: '',
    avatar: ''
})

// 快捷操作
const quickActions = ref([
    { icon: 'iconfont icon-saoma', label: '快捷扫码' },
    { icon: 'iconfont icon-bianji', label: '手动登记' },
    { icon: 'iconfont icon-dingdan', label: '采购清单' },
    { icon: 'iconfont icon-tubiaozhutu', label: '统计分析' }
])

// 即将过期耗材
const expiringItems = ref([])

// 待处理采购清单
const purchaseItems = ref([])

// AI智能预警数据
const aiAlertData = ref({
    summary: '',
    priority: '',
    topAlerts: [],
    recommendations: []
})
const aiAlertLoading = ref(false)
const aiAlertRefreshing = ref(false)  // 刷新中状态

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

// 统一加载所有数据（只调用一次 alerts 接口）
const loadAllData = async () => {
    try {
        const res = await Taro.request({
            url: inventoryApi.alerts,
            method: 'GET',
            header: {
                'Content-Type': 'application/json',
                Authorization: Taro.getStorageSync('token') || ''
            }
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            const allAlertItems = res.data.data.items || []

            // 1. 处理即将过期耗材列表
            const expiringSoonItems = allAlertItems.filter(
                (item) =>
                    item.status === 'expiring_soon' || item.status === 'expired'
            )

            const now = new Date()
            const itemsWithDays = expiringSoonItems.map((item) => {
                let days = null
                let status = '正常'

                if (item.expiryDate) {
                    const expiryDate = new Date(item.expiryDate)
                    const diffTime = expiryDate.getTime() - now.getTime()
                    days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                    if (days < 0) {
                        status = '已过期'
                    } else if (days <= 7) {
                        status = '紧急'
                    } else if (days <= 15) {
                        status = '预警'
                    } else {
                        status = '即将过期'
                    }
                }

                return {
                    ...item,
                    days,
                    status
                }
            })

            itemsWithDays.sort((a, b) => {
                if (a.days === null) return 1
                if (b.days === null) return -1
                return a.days - b.days
            })

            const categoryIcons = {
                试剂: 'icon-shiji',
                耗材: 'icon-imagevector',
                仪器: 'icon-jianceqi',
                其他: 'icon-qita'
            }

            expiringItems.value = itemsWithDays.slice(0, 4).map((item) => {
                return {
                    icon: categoryIcons[item.category] || 'icon-qita',
                    name: item.name,
                    code: item.code,
                    stock: item.quantity,
                    days: item.days,
                    status: item.status,
                    id: item._id || item.id
                }
            })

            // 2. 处理采购清单
            const lowStockItems = allAlertItems.filter(
                (item) =>
                    item.status === 'low_stock' || item.status === 'out_of_stock'
            )

            const itemsWithSuggestion = lowStockItems.map((item) => {
                const maxQty = item.maxQuantity || item.minQuantity * 2
                const suggestQty = Math.max(0, maxQty - item.quantity)

                return {
                    icon: categoryIcons[item.category] || 'icon-qita',
                    name: item.name,
                    code: item.code,
                    suggestQty: suggestQty,
                    unit: item.unit,
                    currentStock: item.quantity,
                    maxQuantity: item.maxQuantity || item.minQuantity * 2,
                    status: item.quantity === 0 ? '缺货' : '预警',
                    id: item._id || item.id
                }
            })

            itemsWithSuggestion.sort((a, b) => {
                if (a.status === '缺货' && b.status !== '缺货') return -1
                if (a.status !== '缺货' && b.status === '缺货') return 1
                return b.suggestQty - a.suggestQty
            })

            purchaseItems.value = itemsWithSuggestion.slice(0, 4)
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        // 加载失败时显示空列表
        expiringItems.value = []
        purchaseItems.value = []
    }
}

// 兼容旧接口（如果其他地方调用）
const loadStatsData = loadAllData
const loadExpiringItems = loadAllData
const loadPurchaseItems = loadAllData

// 导出采购清单（保存为 XLS 文件）
const handleExportPurchaseList = async () => {
    try {
        if (purchaseItems.value.length === 0) {
            Taro.showToast({
                title: '暂无采购数据',
                icon: 'none'
            })
            return
        }

        Taro.showLoading({ title: '生成中...' })

        // 格式化日期
        const now = new Date()
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

        // 构建 CSV 内容（逗号分隔，Excel 兼容）
        // 添加 UTF-8 BOM，让 Excel 正确识别中文编码
        const BOM = '\uFEFF'
        let csvContent = BOM + '耗材名称,货号,当前库存,单位,建议采购量,状态\n'
        purchaseItems.value.forEach(item => {
            csvContent += `${item.name},${item.code},${item.currentStock},${item.unit},${item.suggestQty},${item.status}\n`
        })

        // 写入文件
        const fs = Taro.getFileSystemManager()
        const fileName = `采购清单_${dateStr}.xls`
        const tempFilePath = `${wx.env.USER_DATA_PATH}/${fileName}`

        await new Promise((resolve, reject) => {
            fs.writeFile({
                filePath: tempFilePath,
                data: csvContent,
                encoding: 'utf8',
                success: resolve,
                fail: reject
            })
        })

        Taro.hideLoading()

        // 打开文档预览（用户可通过右上角菜单保存）
        Taro.openDocument({
            filePath: tempFilePath,
            fileType: 'xls',
            showMenu: true,
            success: () => {
                console.log('文档打开成功，用户可通过右上角菜单保存')
            },
            fail: (err) => {
                console.error('打开文档失败:', err)
                // 降级方案：复制到剪贴板
                Taro.setClipboardData({
                    data: csvContent
                })
                Taro.showModal({
                    title: '预览失败',
                    content: '已将内容复制到剪贴板\n\n可粘贴到 Excel 使用',
                    showCancel: false
                })
            }
        })
    } catch (error) {
        Taro.hideLoading()
        console.error('导出失败:', error)
        Taro.showToast({
            title: '导出失败',
            icon: 'none'
        })
    }
}

// 页面加载时获取用户信息和AI预警
onMounted(() => {
    getUserInfo()
    loadAllData()
    loadAiAlert() // 只在首次加载时获取AI预警
})

// 页面显示时刷新基础数据（不包括AI预警）
useDidShow(() => {
    getUserInfo()
    loadAllData()
})

// 加载AI智能预警（优先从缓存读取，1.5秒骨架屏）
const loadAiAlert = async () => {
    const startTime = Date.now()
    console.log('⏱️ 开始加载AI预警...')

    try {
        aiAlertLoading.value = true

        // 先显示骨架屏1.5秒
        setTimeout(() => {
            if (Date.now() - startTime < 1500) {
                // 1.5秒后才隐藏骨架屏
                return
            }
            aiAlertLoading.value = false
        }, 1500)

        const res = await Taro.request({
            url: inventoryApi.aiAlert,
            method: 'GET',
            header: {
                'Content-Type': 'application/json',
                Authorization: Taro.getStorageSync('token') || ''
            }
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            aiAlertData.value = res.data.data

            // 显示性能数据
            if (res.data.data.execution) {
                const { totalDuration, breakdown } = res.data.data.execution
                console.log(`⚡ 后端性能: 总耗时 ${totalDuration}ms (数据收集${breakdown.dataCollection}ms + AI生成${breakdown.aiGeneration}ms)`)
            }

            // 显示是否来自缓存
            if (res.data.data.isCached !== undefined) {
                console.log(`💾 数据来源: ${res.data.data.isCached ? '缓存（今日已生成）' : '新生成'}`)
            }
        } else {
            console.error('AI预警接口返回错误:', res.data.errorInfo)
            // 检查是否为token过期
            if (checkTokenExpired(res.data.errorInfo)) {
                return
            }
        }
    } catch (error) {
        console.error('加载AI预警失败:', error)
        // 不显示错误提示，静默失败
    } finally {
        aiAlertLoading.value = false
        const totalTime = Date.now() - startTime
        console.log(`✅ AI预警加载完成！前端总耗时: ${totalTime}ms`)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    }
}

// 手动刷新AI预警
const handleRefreshAlert = async () => {
    // 防止重复点击
    if (aiAlertRefreshing.value || aiAlertLoading.value) {
        return
    }

    console.log('🔄 用户手动刷新AI预警...')

    try {
        aiAlertRefreshing.value = true
        aiAlertLoading.value = true  // 同时设置loading状态以显示骨架屏

        const res = await Taro.request({
            url: inventoryApi.aiAlert + '/refresh',
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                Authorization: Taro.getStorageSync('token') || ''
            },
            data: {}
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            aiAlertData.value = res.data.data

            Taro.showToast({
                title: 'AI预警已刷新',
                icon: 'success',
                duration: 1500
            })

            console.log('✅ AI预警刷新成功')
        } else {
            console.error('刷新失败:', res.data.errorInfo)
            // 检查是否为token过期
            if (checkTokenExpired(res.data.errorInfo)) {
                return
            }
            Taro.showToast({
                title: res.data.errorInfo || '刷新失败',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('刷新AI预警失败:', error)
        Taro.showToast({
            title: '刷新失败',
            icon: 'none'
        })
    } finally {
        aiAlertRefreshing.value = false
        aiAlertLoading.value = false  // 重置loading状态
    }
}

// 获取预警类型对应的图标
const getAlertIcon = (type) => {
    const iconMap = {
        expired: 'icon-warning',
        expiring: 'icon-warning',
        low_stock: 'icon-dingdan',
        out_of_stock: 'icon-cuowutishi',
        high_consumption: 'icon-tubiaozhutu'
    }
    return iconMap[type] || 'icon-tishi'
}

// 获取优先级对应的CSS类名
const getPriorityClass = (priority) => {
    const classMap = {
        '高': 'high',
        '中': 'medium',
        '低': 'low'
    }
    return classMap[priority] || 'low'
}

// 获取严重程度对应的CSS类名
const getSeverityClass = (severity) => {
    const classMap = {
        '紧急': 'critical',
        '重要': 'important',
        '一般': 'normal'
    }
    return classMap[severity] || 'normal'
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
            handleExportPurchaseList()
            break
        case '统计分析':
            Taro.navigateTo({
                url: '/pages/statistics/statistics'
            })
            break
    }
}

// 查看全部
const handleViewAll = () => {
    Taro.switchTab({
        url: '/pages/inventory/inventory'
    })
}

// 点击耗材项
const handleItemClick = (item) => {
    Taro.navigateTo({
        url: `/pages/inventory/inventory-detail/inventory-detail?id=${item.id}`
    })
}

// 获取过期状态样式类
const getExpiryClass = (days) => {
    if (days < 0) return 'expired'
    if (days <= 7) return 'critical'
    if (days <= 15) return 'warning'
    return 'normal'
}
</script>
