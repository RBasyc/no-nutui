<template>
    <view class="record-page">
        <view class="record-container">
            <!-- 耗材信息卡片 -->
            <view v-if="itemData" class="item-card">
                <view class="item-header">
                    <text class="item-icon iconfont" :class="itemData.icon || 'icon-cangchucangku'"></text>
                    <view class="item-info">
                        <text class="item-name">{{ itemData.name }}</text>
                        <text class="item-meta">当前库存：{{ itemData.quantity }} {{ itemData.unit }}</text>
                    </view>
                </view>
            </view>

            <!-- 操作类型选择 -->
            <view class="operation-section">
                <view class="section-title">操作类型</view>
                <view class="operation-tabs">
                    <view
                        class="operation-tab"
                        :class="{ active: operation === 'use' }"
                        @tap="operation = 'use'"
                    >
                        <text class="tab-icon iconfont icon-chuku"></text>
                        <text class="tab-label">使用</text>
                    </view>
                    <view
                        class="operation-tab"
                        :class="{ active: operation === 'return' }"
                        @tap="operation = 'return'"
                    >
                        <text class="tab-icon iconfont icon-ruku"></text>
                        <text class="tab-label">归还</text>
                    </view>
                </view>
            </view>

            <!-- 数量输入 -->
            <view class="quantity-section">
                <view class="section-title">数量</view>
                <view class="quantity-control">
                    <view class="control-btn" @tap="handleDecrease">
                        <text>-</text>
                    </view>
                    <input
                        v-model.number="quantity"
                        type="number"
                        class="quantity-input"
                        placeholder="请输入数量"
                    />
                    <view class="control-btn" @tap="handleIncrease">
                        <text>+</text>
                    </view>
                </view>
                <text class="quantity-unit">单位：{{ itemData?.unit || '个' }}</text>
            </view>

            <!-- 预计结果 -->
            <view class="preview-section">
                <view class="preview-label">操作后库存</view>
                <view
                    class="preview-value"
                    :class="{ insufficient: remainingQuantity < 0 }"
                >
                    {{ remainingQuantity }} {{ itemData?.unit || '个' }}
                </view>
                <view v-if="remainingQuantity < 0" class="warning-text">
                    库存不足！当前库存：{{ itemData?.quantity || 0 }}
                </view>
            </view>

            <!-- 备注 -->
            <view class="remark-section">
                <view class="section-title">备注（可选）</view>
                <textarea
                    v-model="remarks"
                    placeholder="请输入备注信息"
                    class="remark-textarea"
                    :rows="3"
                />
            </view>

            <!-- 提交按钮 -->
            <view class="submit-section">
                <view
                    class="btn-submit"
                    :class="{
                        'btn-loading': loading,
                        'btn-disabled': quantity <= 0 || remainingQuantity < 0
                    }"
                    @tap="handleSubmit"
                >
                    <text v-if="!loading">确认</text>
                    <view v-else class="loading-spinner"></view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import inventoryApi from '../../../api/inventoryAPI'
import './inventory-record.scss'

// 耗材数据
const itemData = ref(null)
const itemId = ref('')

// 操作类型
const operation = ref('use')

// 数量
const quantity = ref(1)

// 备注
const remarks = ref('')

// 加载状态
const loading = ref(false)

// 计算剩余库存
const remainingQuantity = computed(() => {
    if (!itemData.value) return 0
    if (operation.value === 'use') {
        return (itemData.value.quantity || 0) - quantity.value
    } else {
        return (itemData.value.quantity || 0) + quantity.value
    }
})

// 增加数量
const handleIncrease = () => {
    quantity.value++
}

// 减少数量
const handleDecrease = () => {
    if (quantity.value > 1) {
        quantity.value--
    }
}

// 加载耗材详情
const loadItemDetail = async () => {
    if (!itemId.value) return

    try {
        const res = await Taro.request({
            url: inventoryApi.detail(itemId.value),
            method: 'GET',
            header: {
                Authorization: Taro.getStorageSync('token')
            }
        })

        if (res.data.errCode && res.data.errCode !== '0') {
            Taro.showToast({
                title: res.data.errorInfo || '加载失败',
                icon: 'none'
            })
            return
        }

        itemData.value = res.data.data
    } catch (error) {
        console.error('加载耗材详情失败:', error)
        Taro.showToast({
            title: '加载失败',
            icon: 'none'
        })
    }
}

// 判断是否为 MongoDB ObjectId
const isObjectId = (id) => {
    // MongoDB ObjectId 是 24 字符的十六进制字符串
    return /^[0-9a-fA-F]{24}$/.test(id)
}

// 扫码切换耗材
const handleScanCode = async () => {
    try {
        const scanRes = await Taro.scanCode({
            onlyFromCamera: false,
            scanType: ['barCode', 'qrCode']
        })

        const scannedText = scanRes.result
        Taro.showLoading({ title: '查询中...' })

        let item = null
        let newItemId = null

        // 判断扫描结果是否为 MongoDB ObjectId
        if (isObjectId(scannedText)) {
            // 如果是 ObjectId，直接调用 detail 接口
            const res = await Taro.request({
                url: inventoryApi.detail(scannedText),
                method: 'GET',
                header: {
                    Authorization: Taro.getStorageSync('token')
                }
            })

            if (res.data.errCode && res.data.errCode !== '0') {
                Taro.hideLoading()
                Taro.showToast({
                    title: res.data.errorInfo || '未找到该耗材',
                    icon: 'none'
                })
                return
            }

            item = res.data.data
            newItemId = scannedText
        } else {
            // 如果是普通编号，调用 getByCode 接口
            const res = await Taro.request({
                url: inventoryApi.getByCode,
                method: 'GET',
                data: { code: scannedText },
                header: {
                    Authorization: Taro.getStorageSync('token')
                }
            })

            if (res.data.errCode && res.data.errCode !== '0') {
                Taro.hideLoading()
                Taro.showToast({
                    title: res.data.errorInfo || '未找到该耗材',
                    icon: 'none'
                })
                return
            }

            item = res.data.data
            newItemId = item._id || item.id
        }

        Taro.hideLoading()

        if (item) {
            Taro.showModal({
                title: '发现耗材',
                content: `发现耗材：${item.name}\n当前库存：${item.quantity} ${item.unit}\n\n是否切换到该耗材进行记录？`,
                success: (modalRes) => {
                    if (modalRes.confirm) {
                        // 切换到该耗材
                        itemId.value = newItemId
                        // 重置数量和备注
                        quantity.value = 1
                        remarks.value = ''
                        // 重新加载耗材详情
                        loadItemDetail()
                        Taro.showToast({
                            title: '已切换耗材',
                            icon: 'success'
                        })
                    }
                }
            })
        }
    } catch (err) {
        Taro.hideLoading()
        console.error('扫码失败:', err)
        Taro.showToast({
            title: '扫码失败',
            icon: 'none'
        })
    }
}

// 提交记录
const handleSubmit = async () => {
    if (!itemData.value) return

    if (quantity.value <= 0) {
        Taro.showToast({
            title: '请输入有效数量',
            icon: 'none'
        })
        return
    }

    if (remainingQuantity.value < 0) {
        Taro.showToast({
            title: '库存不足',
            icon: 'none'
        })
        return
    }

    loading.value = true

    try {
        const operationType = operation.value === 'use' ? 'subtract' : 'add'

        const res = await Taro.request({
            url: inventoryApi.quantity(itemId.value),
            method: 'PUT',
            data: {
                quantity: quantity.value,
                operation: operationType
            },
            header: {
                Authorization: Taro.getStorageSync('token')
            }
        })

        if (res.data.errCode && res.data.errCode !== '0') {
            Taro.showToast({
                title: res.data.errorInfo || '记录失败',
                icon: 'none'
            })
            return
        }

        Taro.showToast({
            title: '记录成功',
            icon: 'success'
        })

        // 返回仓库页
        setTimeout(() => {
            Taro.navigateBack()
        }, 1500)
    } catch (error) {
        console.error('记录失败:', error)
        Taro.showToast({
            title: '记录失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    // 获取页面参数
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params

    if (params?.id) {
        itemId.value = params.id
        loadItemDetail()
    }
})
</script>
