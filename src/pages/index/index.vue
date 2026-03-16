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

            <!-- 有数据时显示列表 -->
            <view v-if="expiringItems.length > 0" class="consumable-list">
                <view
                    v-for="(item, index) in expiringItems"
                    :key="index"
                    class="list-item"
                    @tap="handleItemClick(item)"
                >
                    <text class="item-icon">{{ item.icon }}</text>
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
                <text class="empty-icon">✅</text>
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
                    <text class="item-icon">{{ item.icon }}</text>
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
                <text class="empty-icon">✅</text>
                <text class="empty-text">暂无需要采购的耗材</text>
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
import Taro, { useDidShow } from '@tarojs/taro'
import inventoryApi from '../../api/inventoryAPI'
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
const expiringItems = ref([])

// 待处理采购清单
const purchaseItems = ref([])

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

// 加载统计数据
const loadStatsData = async () => {
    try {
        // 尝试从多个地方获取实验室名称
        const userInfo = Taro.getStorageSync('userInfo')
        let labName =
            userInfo?.labName || userInfo?.laboratory || userInfo?.lab || ''

        // 如果 userInfo 中没有，尝试从单独的存储中获取
        if (!labName) {
            labName = Taro.getStorageSync('labName') || ''
        }

        if (!labName) {
            console.warn('未找到实验室名称，跳过统计')
            return
        }

        const res = await Taro.request({
            url: inventoryApi.summary,
            method: 'GET',
            data: { labName },
            header: {
                'Content-Type': 'application/json',
                Authorization: Taro.getStorageSync('token') || ''
            }
        })

        if (res.statusCode === 200 && res.data.success) {
            const data = res.data.data
            statsData.value = {
                totalStock: data.totalItems || 0,
                expiringCount: data.expiringSoon || 0,
                lowStockCount: data.lowStock || 0
            }
        }
    } catch (error) {
        console.error('加载统计数据失败:', error)
        // 统计数据加载失败不影响主功能
    }
}

// 加载即将过期耗材列表
const loadExpiringItems = async () => {
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

            // 筛选即将过期和已过期的耗材
            const expiringSoonItems = allAlertItems.filter(
                (item) =>
                    item.status === 'expiring_soon' || item.status === 'expired'
            )

            // 计算剩余天数并排序
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

            // 按剩余天数排序（天数少的在前）
            itemsWithDays.sort((a, b) => {
                if (a.days === null) return 1
                if (b.days === null) return -1
                return a.days - b.days
            })

            // 取前4个
            expiringItems.value = itemsWithDays.slice(0, 4).map((item) => {
                // 根据分类设置图标
                const categoryIcons = {
                    试剂: '🧪',
                    耗材: '💊',
                    仪器: '⚙️',
                    其他: '📦'
                }

                return {
                    icon: categoryIcons[item.category] || '📦',
                    name: item.name,
                    code: item.code,
                    stock: item.quantity,
                    days: item.days,
                    status: item.status,
                    id: item._id || item.id
                }
            })
        }
    } catch (error) {
        console.error('加载即将过期耗材失败:', error)
        // 加载失败时显示空列表
        expiringItems.value = []
    }
}

// 加载待处理采购清单
const loadPurchaseItems = async () => {
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

            // 筛选库存不足和缺货的耗材
            const lowStockItems = allAlertItems.filter(
                (item) =>
                    item.status === 'low_stock' || item.status === 'out_of_stock'
            )

            // 计算建议采购量并排序
            const itemsWithSuggestion = lowStockItems.map((item) => {
                // 建议采购量 = 最大库存 - 当前库存
                // 如果没有最大库存，则使用最小库存的2倍作为建议量
                const maxQty = item.maxQuantity || item.minQuantity * 2
                const suggestQty = Math.max(0, maxQty - item.quantity)

                // 根据分类设置图标
                const categoryIcons = {
                    试剂: '🧪',
                    耗材: '💊',
                    仪器: '⚙️',
                    其他: '📦'
                }

                return {
                    icon: categoryIcons[item.category] || '📦',
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

            // 按库存短缺程度排序（缺货的在前，然后按建议采购量降序）
            itemsWithSuggestion.sort((a, b) => {
                if (a.status === '缺货' && b.status !== '缺货') return -1
                if (a.status !== '缺货' && b.status === '缺货') return 1
                return b.suggestQty - a.suggestQty
            })

            // 取前4个
            purchaseItems.value = itemsWithSuggestion.slice(0, 4)
        }
    } catch (error) {
        console.error('加载采购清单失败:', error)
        // 加载失败时显示空列表
        purchaseItems.value = []
    }
}

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

// 页面加载时获取用户信息和统计数据
onMounted(() => {
    getUserInfo()
    loadStatsData()
    loadExpiringItems()
    loadPurchaseItems()
})

// 页面显示时刷新统计数据（包括从其他页面返回时）
useDidShow(() => {
    loadStatsData()
    loadExpiringItems()
    loadPurchaseItems()
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

// 协作共享点击
const handleCollaborationClick = () => {
    Taro.switchTab({
        url: '/pages/collaboration/collaboration'
    })
}
</script>
