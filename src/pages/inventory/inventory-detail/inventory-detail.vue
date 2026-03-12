<template>
    <view class="detail-page">
        <view class="detail-container" v-if="itemData">
            <!-- 顶部导航 -->
            <view class="page-nav">
                <view class="nav-back" @tap="handleBack">
                    <text class="back-icon">←</text>
                    <text class="back-text">返回</text>
                </view>
                <view class="nav-title">耗材详情</view>
                <view class="nav-actions">
                    <view class="action-btn" @tap="handleEdit">
                        <text class="action-icon">✏️</text>
                    </view>
                </view>
            </view>

            <!-- 耗材主信息卡片 -->
            <view class="main-card">
                <view class="card-header">
                    <text class="item-icon">{{ itemData.icon || '📦' }}</text>
                    <view class="item-info">
                        <text class="item-name">{{ itemData.name }}</text>
                        <text class="item-code">{{ itemData.code }}</text>
                    </view>
                    <view class="status-badge" :class="itemData.status">
                        {{ getStatusText(itemData.status) }}
                    </view>
                </view>
            </view>

            <!-- 库存信息 -->
            <view class="info-section">
                <view class="section-title">
                    <text class="title-icon">📊</text>
                    <text class="title-text">库存信息</text>
                </view>
                <view class="info-grid">
                    <view class="grid-item">
                        <text class="item-label">当前库存</text>
                        <text class="item-value">{{ itemData.quantity }}</text>
                    </view>
                    <view class="grid-item">
                        <text class="item-label">单位</text>
                        <text class="item-value">{{ itemData.unit }}</text>
                    </view>
                    <view class="grid-item">
                        <text class="item-label">最小库存</text>
                        <text class="item-value">{{
                            itemData.minQuantity
                        }}</text>
                    </view>
                    <view class="grid-item">
                        <text class="item-label">最大库存</text>
                        <text class="item-value">{{
                            itemData.maxQuantity || '-'
                        }}</text>
                    </view>
                </view>
            </view>

            <!-- 基本信息 -->
            <view class="info-section">
                <view class="section-title">
                    <text class="title-icon">📋</text>
                    <text class="title-text">基本信息</text>
                </view>
                <view class="info-list">
                    <view class="info-row">
                        <text class="row-label">分类</text>
                        <text class="row-value">{{ itemData.category }}</text>
                    </view>
                    <view class="info-row">
                        <text class="row-label">规格</text>
                        <text class="row-value">{{
                            itemData.spec || itemData.specification || '-'
                        }}</text>
                    </view>
                    <view class="info-row">
                        <text class="row-label">单价</text>
                        <text class="row-value">¥{{ itemData.price }}</text>
                    </view>
                    <view class="info-row">
                        <text class="row-label">供应商</text>
                        <text class="row-value">{{
                            itemData.supplier || '-'
                        }}</text>
                    </view>
                    <view class="info-row">
                        <text class="row-label">存放位置</text>
                        <text class="row-value">{{
                            itemData.location || '-'
                        }}</text>
                    </view>
                </view>
            </view>

            <!-- 时间信息 -->
            <view class="info-section">
                <view class="section-title">
                    <text class="title-icon">📅</text>
                    <text class="title-text">时间信息</text>
                </view>
                <view class="info-list">
                    <view class="info-row">
                        <text class="row-label">购买日期</text>
                        <text class="row-value">{{
                            formatDate(itemData.purchaseDate)
                        }}</text>
                    </view>
                    <view class="info-row" v-if="itemData.expiryDate">
                        <text class="row-label">过期日期</text>
                        <text
                            class="row-value"
                            :class="getExpiryClass(itemData.daysUntilExpiry)"
                        >
                            {{ formatDate(itemData.expiryDate) }}
                            <text
                                v-if="itemData.daysUntilExpiry !== null"
                                class="days-badge"
                            >
                                ({{ itemData.daysUntilExpiry }}天)
                            </text>
                        </text>
                    </view>
                </view>
            </view>

            <!-- 操作按钮 -->
            <view class="action-buttons">
                <view class="btn-secondary" @tap="handleRecord">
                    <text class="btn-icon">📝</text>
                    <text class="btn-text">记录使用</text>
                </view>
                <view class="btn-secondary" @tap="handleQRCode">
                    <text class="btn-icon">📱</text>
                    <text class="btn-text">二维码</text>
                </view>
                <view class="btn-primary" @tap="handleEdit">
                    <text class="btn-icon">✏️</text>
                    <text class="btn-text">编辑</text>
                </view>
            </view>
        </view>

        <!-- 加载状态 -->
        <view v-else class="loading-state">
            <text>加载中...</text>
        </view>

        <!-- 二维码弹窗 -->
        <view
            v-show="showQRModal"
            class="qrcode-modal"
            catchtap="showQRModal = false"
            catchtouchmove
        >
            <view class="qrcode-content" catchtap catchtouchmove>
                <view class="qrcode-header">
                    <text class="qrcode-title">耗材二维码</text>
                    <view class="close-btn" @tap="showQRModal = false">✕</view>
                </view>
                <view class="qrcode-body">
                    <view class="qrcode-display">
                        <canvas
                            type="2d"
                            id="qrcodeCanvas"
                            class="qrcode-canvas"
                        />
                    </view>
                    <view class="qrcode-info">
                        <text class="info-name">{{ itemData?.name }}</text>
                        <text class="info-code">{{ itemData?.code }}</text>
                    </view>
                </view>
                <view class="qrcode-footer">
                    <view class="btn-secondary" @tap="showQRModal = false"
                        >关闭</view
                    >
                    <view class="btn-primary" @tap="handleSaveQRCode"
                        >保存图片</view
                    >
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import drawQrcode from 'weapp-qrcode-canvas-2d'
import './inventory-detail.scss'

// 耗材数据
const itemData = ref(null)

// 二维码弹窗状态
const showQRModal = ref(false)

// 获取耗材详情（从 API 获取）
const loadItemDetail = async () => {
    try {
        // 从路由参数中获取耗材ID
        const instance = Taro.getCurrentInstance()
        const itemId = instance.router?.params?.id

        if (!itemId) {
            Taro.showToast({
                title: '缺少耗材ID',
                icon: 'none'
            })
            return
        }

        const res = await Taro.request({
            url: `http://localhost:3000/adminapi/inventory/detail/${itemId}`,
            method: 'GET',
            header: {
                'Content-Type': 'application/json',
                Authorization: Taro.getStorageSync('token') || ''
            }
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            const data = res.data.data

            // 计算剩余天数
            let daysUntilExpiry = null
            if (data.expiryDate) {
                const now = new Date()
                const expiryDate = new Date(data.expiryDate)
                const diffTime = expiryDate.getTime() - now.getTime()
                daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            }

            // 设置图标
            const categoryIcons = {
                试剂: '🧪',
                耗材: '💊',
                仪器: '⚙️',
                其他: '📦'
            }

            itemData.value = {
                ...data,
                icon: categoryIcons[data.category] || '📦',
                daysUntilExpiry
            }
        } else {
            Taro.showToast({
                title: res.data?.errorInfo || '加载失败',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('加载耗材详情失败:', error)
        Taro.showToast({
            title: '加载失败',
            icon: 'none'
        })
    }
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        normal: '正常',
        low_stock: '库存不足',
        out_of_stock: '缺货',
        expiring_soon: '即将过期',
        expired: '已过期'
    }
    return statusMap[status] || '未知'
}

// 格式化日期
const formatDate = (date) => {
    if (!date) return '-'
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0'
    )}-${String(d.getDate()).padStart(2, '0')}`
}

// 获取过期状态样式
const getExpiryClass = (days) => {
    if (days === null) return ''
    if (days <= 0) return 'expired'
    if (days <= 30) return 'warning'
    return 'normal'
}

// 返回
const handleBack = () => {
    Taro.navigateBack()
}

// 编辑
const handleEdit = () => {
    Taro.navigateTo({
        url: `/pages/inventory/inventory-edit/inventory-edit?id=${
            itemData.value._id || itemData.value.id
        }`
    })
}

// 记录使用
const handleRecord = () => {
    Taro.navigateTo({
        url: `/pages/inventory/inventory-record/inventory-record?id=${
            itemData.value._id || itemData.value.id
        }`
    })
}

// 生成二维码
const handleQRCode = async () => {
    if (!itemData.value) return

    showQRModal.value = true

    // 等待 DOM 更新后生成二维码
    await Taro.nextTick()

    setTimeout(async () => {
        try {
            const query = Taro.createSelectorQuery()
            query
                .select('#qrcodeCanvas')
                .fields({
                    node: true,
                    size: true
                })

            const res = await new Promise((resolve, reject) => {
                query.exec((result) => {
                    if (result && result[0]) {
                        resolve(result)
                    } else {
                        reject(new Error('Canvas 节点未找到'))
                    }
                })
            })

            if (!res || !res[0]) {
                console.error('Canvas 节点未找到')
                Taro.showToast({
                    title: 'Canvas 初始化失败',
                    icon: 'none'
                })
                return
            }

            const canvas = res[0].node
            const ctx = canvas.getContext('2d')

            // 获取设备像素比
            const dpr = Taro.getSystemInfoSync().pixelRatio || 1

            // 设置 canvas 实际渲染尺寸（物理像素）
            const canvasSize = 200
            canvas.width = canvasSize * dpr
            canvas.height = canvasSize * dpr

            // 缩放上下文以匹配 dpr
            ctx.scale(dpr, dpr)

            // 调用方法 drawQrcode 生成二维码
            await drawQrcode({
                canvas: canvas,
                canvasId: 'qrcodeCanvas',
                width: canvasSize,
                height: canvasSize,
                padding: 15,
                background: '#ffffff',
                foreground: '#000000',
                text: itemData.value._id || itemData.value.id || '',
                typeNumber: -1,
                correctLevel: 3
            })

            // Taro.showToast({
            //     title: '二维码生成成功',
            //     icon: 'success',
            //     duration: 1000
            // })
        } catch (err) {
            console.error('生成二维码失败:', err)
            Taro.showToast({
                title: '生成二维码失败',
                icon: 'none'
            })
        }
    }, 300)
}

// 保存二维码
const handleSaveQRCode = async () => {
    if (!itemData.value) {
        Taro.showToast({
            title: '请先生成二维码',
            icon: 'none'
        })
        return
    }

    Taro.showLoading({ title: '保存中...' })

    try {
        const canvasId = 'qrcodeCanvas'

        // 关键：重新获取 canvas 节点，而不是使用之前保存的引用
        const query = Taro.createSelectorQuery()

        const canvasNode = await new Promise((resolve, reject) => {
            query
                .select(`#${canvasId}`)
                .fields({
                    node: true,
                    size: true
                })
                .exec((res) => {
                    if (res && res[0] && res[0].node) {
                        resolve(res[0].node)
                    } else {
                        reject(new Error('获取 canvas 节点失败'))
                    }
                })
        })

        // 生成临时文件路径
        const tempRes = await new Promise((resolve, reject) => {
            Taro.canvasToTempFilePath({
                canvasId: canvasId,
                canvas: canvasNode,
                x: 0,
                y: 0,
                width: 200,
                height: 200,
                destWidth: 400,
                destHeight: 400,
                fileType: 'png',
                quality: 1,
                success: resolve,
                fail: reject
            })
        })

        // 保存到相册
        await Taro.saveImageToPhotosAlbum({
            filePath: tempRes.tempFilePath
        })

        Taro.hideLoading()
        Taro.showToast({
            title: '已保存到相册',
            icon: 'success'
        })
    } catch (err) {
        Taro.hideLoading()
        console.error('保存失败：', err)

        if (err.errMsg && err.errMsg.includes('auth')) {
            Taro.showModal({
                title: '需要授权',
                content: '需要授权访问相册才能保存图片',
                confirmText: '去设置',
                success: (modalRes) => {
                    if (modalRes.confirm) {
                        Taro.openSetting()
                    }
                }
            })
        } else {
            Taro.showToast({
                title: err.message || '保存失败',
                icon: 'none'
            })
        }
    }
}

onMounted(() => {
    loadItemDetail()
})
</script>
