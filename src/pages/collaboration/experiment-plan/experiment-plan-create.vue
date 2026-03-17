<template>
    <view class="plan-create-page">
        <!-- 顶部导航 -->
        <view class="page-header">
            <view class="header-back" @tap="handleBack">
                <text class="back-icon">←</text>
            </view>
            <view class="header-title">核对实验计划</view>
            <view class="header-action" @tap="handleSubmit">
                <text class="save-text">保存</text>
            </view>
        </view>

        <!-- 提示信息 -->
        <view v-if="!isFromAI" class="hint-banner">
            <text class="hint-icon">💡</text>
            <text class="hint-text"
                >提示：您可以在 AI
                聊天页面让助手解析实验计划，然后跳转到此页面进行核对</text
            >
        </view>

        <!-- 表单 -->
        <scroll-view class="form-container" scrollY="true">
            <view class="form-section">
                <view class="form-item">
                    <text class="form-label">计划标题 *</text>
                    <view class="input-wrapper">
                        <input
                            v-model="formData.title"
                            class="form-input"
                            placeholder="请输入计划标题"
                            :maxlength="100"
                        />
                    </view>
                </view>

                <view class="form-item">
                    <text class="form-label">实验日期</text>
                    <picker
                        mode="date"
                        :value="formData.experimentDate"
                        @change="handleDateChange"
                    >
                        <view class="picker-wrapper">
                            <text class="picker-text">{{
                                formData.experimentDate || '请选择日期'
                            }}</text>
                        </view>
                    </picker>
                </view>

                <view class="form-item">
                    <text class="form-label">实验描述</text>
                    <textarea
                        v-model="formData.description"
                        class="form-textarea"
                        placeholder="描述实验内容和目的"
                        :maxlength="500"
                    />
                </view>

                <!-- 耗材清单 -->
                <view class="form-section-title">
                    <text class="title-text">耗材清单</text>
                    <view class="add-item-btn" @tap="handleSelectFromInventory">
                        <text class="add-icon">📦</text>
                        <text class="add-text">从仓库选择</text>
                    </view>
                </view>

                <view
                    v-for="(item, index) in formData.itemsNeeded"
                    :key="index"
                    class="item-row"
                >
                    <view class="item-card">
                        <!-- 主要内容区域 -->
                        <view class="item-main">
                            <!-- 左侧：耗材信息 -->
                            <view
                                class="item-left"
                                @tap="handleReplaceFromInventory(index)"
                            >
                                <view class="item-header">
                                    <text class="item-name">{{
                                        item.name
                                    }}</text>
                                    <view class="item-badge">
                                        <text class="badge-text">可更换</text>
                                    </view>
                                </view>
                                <text
                                    v-if="item.specification"
                                    class="item-spec"
                                    >{{ item.specification }}</text
                                >
                                <view v-if="item.stockInfo" class="stock-hint">
                                    <text
                                        :class="[
                                            'stock-dot',
                                            item.stockInfo.status
                                        ]"
                                    ></text>
                                    <text
                                        :class="[
                                            'stock-text',
                                            item.stockInfo.status
                                        ]"
                                        >{{ item.stockInfo.text }}</text
                                    >
                                </view>
                            </view>

                            <!-- 右侧：数量控制和删除 -->
                            <view class="item-right">
                                <view class="qty-control">
                                    <view
                                        class="qty-btn decrease"
                                        @tap="handleDecreaseQty(index)"
                                    >
                                        <text class="btn-icon">-</text>
                                    </view>
                                    <view class="qty-display">
                                        <text class="qty-value">{{
                                            item.quantity
                                        }}</text>
                                        <text
                                            v-if="item.unit"
                                            class="qty-unit"
                                            >{{ item.unit }}</text
                                        >
                                    </view>
                                    <view
                                        class="qty-btn increase"
                                        @tap="handleIncreaseQty(index)"
                                    >
                                        <text class="btn-icon">+</text>
                                    </view>
                                </view>
                                <view
                                    class="delete-btn"
                                    @tap="handleDeleteItem(index)"
                                >
                                    <text class="delete-icon">🗑️</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>

                <view
                    v-if="formData.itemsNeeded.length === 0"
                    class="empty-items-hint"
                >
                    <text class="hint-icon">📦</text>
                    <text class="hint-text">暂无耗材</text>
                    <text class="hint-sub">点击上方按钮从仓库选择耗材</text>
                </view>
            </view>
        </scroll-view>

        <!-- 仓库搜索弹窗 -->
        <view
            v-if="showInventoryModal"
            class="inventory-modal"
            @tap="closeInventoryModal"
        >
            <view class="modal-content" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">选择耗材</text>
                    <view class="modal-close" @tap="closeInventoryModal">
                        <text class="close-icon">✕</text>
                    </view>
                </view>

                <view class="search-box">
                    <text class="search-icon">🔍</text>
                    <input
                        v-model="searchKeyword"
                        class="search-input"
                        placeholder="搜索耗材名称、规格、分类..."
                        @input="handleSearchInput"
                        @confirm="handleSearchInput"
                    />
                    <view
                        v-if="searchKeyword"
                        class="clear-btn"
                        @tap="clearSearch"
                    >
                        <text class="clear-icon">✕</text>
                    </view>
                </view>

                <scroll-view class="search-results" scrollY="true">
                    <view v-if="isSearching" class="search-loading">
                        <text class="loading-text">搜索中...</text>
                    </view>

                    <view
                        v-else-if="searchResults.length === 0 && searchKeyword"
                        class="search-empty"
                    >
                        <text class="empty-icon">🔍</text>
                        <text class="empty-text">未找到相关耗材</text>
                    </view>

                    <view
                        v-else-if="searchResults.length === 0 && !searchKeyword"
                        class="search-empty"
                    >
                        <text class="empty-icon">💡</text>
                        <text class="empty-text">请输入关键词搜索耗材</text>
                    </view>

                    <view
                        v-for="(item, index) in searchResults"
                        :key="index"
                        class="inventory-item"
                        @tap="selectInventoryItem(item)"
                    >
                        <view class="item-main">
                            <text class="item-name">{{ item.name }}</text>
                            <view class="item-meta">
                                <text
                                    v-if="item.specification"
                                    class="item-spec"
                                    >{{ item.specification }}</text
                                >
                                <text class="item-category">{{
                                    item.category
                                }}</text>
                            </view>
                        </view>
                        <view class="item-stock">
                            <text
                                :class="[
                                    'stock-text',
                                    item.quantity > 0
                                        ? 'sufficient'
                                        : 'insufficient'
                                ]"
                            >
                                库存: {{ item.quantity }}{{ item.unit }}
                            </text>
                        </view>
                    </view>
                </scroll-view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import inventoryAPI from '../../../api/inventoryAPI'
import './experiment-plan-create.scss'

// 表单数据
const formData = reactive({
    title: '',
    experimentDate: '',
    description: '',
    itemsNeeded: []
})

// 标记是否来自 AI
const isFromAI = ref(false)

// 仓库数据缓存
const inventoryItems = ref([])

// 仓库搜索弹窗状态
const showInventoryModal = ref(false)
const searchKeyword = ref('')
const searchResults = ref([])
const isSearching = ref(false)
let searchTimer = null
let replacingItemIndex = -1 // 记录正在替换的耗材索引

// 打开仓库选择弹窗
const openInventoryModal = (replaceIndex = -1) => {
    replacingItemIndex = replaceIndex
    showInventoryModal.value = true
    searchKeyword.value = ''
    searchResults.value = []
}

// 关闭仓库选择弹窗
const closeInventoryModal = () => {
    showInventoryModal.value = false
    searchKeyword.value = ''
    searchResults.value = []
    replacingItemIndex = -1
    if (searchTimer) {
        clearTimeout(searchTimer)
        searchTimer = null
    }
}

// 搜索耗材（防抖）
const handleSearchInput = (e) => {
    // 直接从事件对象获取输入值
    const value = e.detail.value

    if (searchTimer) {
        clearTimeout(searchTimer)
    }

    if (!value.trim()) {
        searchResults.value = []
        isSearching.value = false
        return
    }

    isSearching.value = true

    searchTimer = setTimeout(async () => {
        await searchInventoryItems()
    }, 500)
}

// 清除搜索
const clearSearch = () => {
    searchKeyword.value = ''
    searchResults.value = []
}

// 执行搜索（传递搜索关键词到后端）
const searchInventoryItems = async () => {
    try {
        const token = Taro.getStorageSync('token') || ''
        const params = {
            page: 1,
            pageSize: 100 // 获取更多数据以便搜索
        }

        // 如果有搜索关键词，传递给后端
        if (searchKeyword.value.trim()) {
            params.search = searchKeyword.value.trim()
        }

        const res = await Taro.request({
            url: inventoryAPI.list,
            method: 'GET',
            data: params,
            header: {
                'Content-Type': 'application/json',
                Authorization: token
            }
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            // 后端返回的是分页数据：{total, items, page, pageSize}
            const pageData = res.data.data
            const items = pageData?.items || []

            searchResults.value = items
        } else {
            searchResults.value = []
        }
    } catch (error) {
        console.error('获取耗材列表失败:', error)
        searchResults.value = []
    } finally {
        isSearching.value = false
    }
}

// 选择耗材并添加到清单
const selectInventoryItem = (item) => {
    if (replacingItemIndex >= 0) {
        // 替换模式
        formData.itemsNeeded[replacingItemIndex] = {
            ...formData.itemsNeeded[replacingItemIndex],
            name: item.name,
            unit: item.unit || '',
            specification: item.specification || '',
            category: item.category || '其他',
            inventoryId: String(item.id || item._id),  // 转换为字符串
            stockQuantity: item.quantity, // 保存原始库存数量
            stockInfo: {
                status: item.quantity > 0 ? 'sufficient' : 'insufficient',
                text:
                    item.quantity > 0
                        ? `库存: ${item.quantity}${item.unit || ''}`
                        : '库存不足'
            }
        }

        Taro.showToast({
            title: '已更换耗材',
            icon: 'success',
            duration: 1000
        })
    } else {
        // 新增模式
        // 检查是否已经添加过该耗材
        const existingIndex = formData.itemsNeeded.findIndex(
            (i) => i.name === item.name
        )

        if (existingIndex >= 0) {
            Taro.showToast({
                title: '该耗材已在清单中',
                icon: 'none'
            })
            return
        }

        // 添加耗材到清单
        formData.itemsNeeded.push({
            name: item.name,
            quantity: 1,
            unit: item.unit || '',
            specification: item.specification || '',
            category: item.category || '其他',
            inventoryId: String(item.id || item._id),  // 转换为字符串
            stockQuantity: item.quantity, // 保存原始库存数量
            stockInfo: {
                status: item.quantity > 0 ? 'sufficient' : 'insufficient',
                text:
                    item.quantity > 0
                        ? `库存: ${item.quantity}${item.unit || ''}`
                        : '库存不足'
            }
        })

        Taro.showToast({
            title: '已添加耗材',
            icon: 'success',
            duration: 1000
        })
    }

    // 关闭弹窗
    closeInventoryModal()
}

// 加载仓库数据
const loadInventoryItems = async () => {
    try {
        const token = Taro.getStorageSync('token') || ''
        const res = await Taro.request({
            url: inventoryAPI.list,
            method: 'GET',
            header: {
                'Content-Type': 'application/json',
                Authorization: token
            }
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            // 确保返回的数据是数组
            const data = res.data.data
            inventoryItems.value = Array.isArray(data) ? data : []
        } else {
            // API调用失败，确保是空数组
            inventoryItems.value = []
        }
    } catch (error) {
        console.error('加载仓库数据失败:', error)
        // 出错时确保是空数组
        inventoryItems.value = []
    }
}

// 从 URL 参数获取 AI 数据
onMounted(async () => {
    const instance = getCurrentInstance()
    const params = instance.router?.params

    if (params?.aiData) {
        isFromAI.value = true
        try {
            const aiData = JSON.parse(decodeURIComponent(params.aiData))
            console.log('接收到的AI数据:', aiData)

            if (aiData.type === 'experiment_plan') {
                // 直接使用 AI 返回的字段
                formData.title = aiData.title || aiData.summary || '实验计划'
                formData.experimentDate = aiData.date || ''
                formData.description = aiData.content || aiData.summary || ''

                // 解析耗材清单：确保数据格式正确并与仓库联动
                if (
                    Array.isArray(aiData.parsed_items) &&
                    aiData.parsed_items.length > 0
                ) {
                    // 先加载仓库数据以便匹配
                    await loadInventoryItems()

                    // 确保 inventoryItems.value 是数组
                    const inventoryList = Array.isArray(inventoryItems.value)
                        ? inventoryItems.value
                        : []

                    formData.itemsNeeded = await Promise.all(
                        aiData.parsed_items.map(async (item, index) => {
                            const itemName = item.name || `耗材${index + 1}`

                            // 尝试在仓库中找到匹配的耗材
                            const matchedInventory = inventoryList.find(
                                (inv) =>
                                    inv.name === itemName ||
                                    inv.name.includes(itemName) ||
                                    itemName.includes(inv.name)
                            )

                            return {
                                name: itemName,
                                quantity:
                                    parseInt(item.quantity) ||
                                    parseInt(item.quantity_str) ||
                                    1,
                                unit: matchedInventory?.unit || item.unit || '',
                                specification:
                                    matchedInventory?.specification ||
                                    item.specification ||
                                    '',
                                category:
                                    matchedInventory?.category ||
                                    item.category ||
                                    '其他',
                                inventoryId: matchedInventory?.id, // 如果匹配到仓库中的耗材，保存ID
                                stockInfo: matchedInventory
                                    ? {
                                          status:
                                              matchedInventory.quantity > 0
                                                  ? 'sufficient'
                                                  : 'insufficient',
                                          text:
                                              matchedInventory.quantity > 0
                                                  ? `库存: ${
                                                        matchedInventory.quantity
                                                    }${
                                                        matchedInventory.unit ||
                                                        ''
                                                    }`
                                                  : '库存不足'
                                      }
                                    : null
                            }
                        })
                    )
                } else {
                    // 如果没有解析到耗材，创建空的耗材列表
                    formData.itemsNeeded = []
                }

                console.log('填充的表单数据:', formData)

                Taro.showToast({
                    title: `已解析${formData.itemsNeeded.length}项耗材`,
                    icon: 'success',
                    duration: 2000
                })
            }
        } catch (error) {
            console.error('解析 AI 数据失败:', error)
            Taro.showToast({
                title: '数据解析失败',
                icon: 'none'
            })
        }
    }
})

// 从仓库选择耗材（唯一的添加方式）
const handleSelectFromInventory = () => {
    openInventoryModal()
}

// 替换已有耗材（从仓库重新选择）
const handleReplaceFromInventory = (index) => {
    openInventoryModal(index)
}

// 增加数量
const handleIncreaseQty = (index) => {
    const item = formData.itemsNeeded[index]
    const currentQty = parseInt(item.quantity) || 0
    const stockQty = parseInt(item.stockQuantity) || 0

    // 检查是否超过库存
    if (currentQty >= stockQty) {
        Taro.showToast({
            title: `库存不足，当前库存仅 ${stockQty}${item.unit || ''}`,
            icon: 'none'
        })
        return
    }

    item.quantity = currentQty + 1
}

// 减少数量
const handleDecreaseQty = (index) => {
    const item = formData.itemsNeeded[index]
    const currentQty = parseInt(item.quantity) || 0
    if (currentQty > 1) {
        item.quantity = currentQty - 1
    }
}

// 删除耗材项
const handleDeleteItem = (index) => {
    formData.itemsNeeded.splice(index, 1)
}

// 选择实验日期
const handleDateChange = (e) => {
    formData.experimentDate = e.detail.value
}

// 提交表单
const handleSubmit = async () => {
    // 验证表单
    if (!formData.title.trim()) {
        Taro.showToast({
            title: '请输入计划标题',
            icon: 'none'
        })
        return
    }

    if (formData.itemsNeeded.length === 0) {
        Taro.showToast({
            title: '请从仓库选择至少一项耗材',
            icon: 'none'
        })
        return
    }

    // 验证耗材数量（耗材都来自仓库，name等字段已确保完整）
    const invalidItem = formData.itemsNeeded.find(
        (item) => !item.quantity || item.quantity <= 0
    )
    if (invalidItem) {
        Taro.showToast({
            title: '请检查耗材数量',
            icon: 'none'
        })
        return
    }

    try {
        const token = Taro.getStorageSync('token') || ''

        // 先扣减所有耗材的库存
        const deductPromises = formData.itemsNeeded.map(async (item) => {
            if (!item.inventoryId) return

            await Taro.request({
                url: inventoryAPI.quantity(item.inventoryId),
                method: 'PUT',
                header: {
                    'Content-Type': 'application/json',
                    Authorization: token
                },
                data: {
                    quantity: parseInt(item.quantity),
                    operation: 'subtract',
                    reason: '创建实验计划'
                }
            })
        })

        await Promise.all(deductPromises)

        // 然后保存实验计划
        const res = await Taro.request({
            url: 'http://localhost:3000/adminapi/experiment-plan/add',
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                Authorization: token
            },
            data: formData
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            Taro.showToast({
                title: '保存成功，已扣减库存',
                icon: 'success',
                duration: 1500
            })

            setTimeout(() => {
                Taro.navigateBack()
            }, 1500)
        } else {
            throw new Error(res.data?.errorInfo || '保存失败')
        }
    } catch (error) {
        console.error('保存失败:', error)
        Taro.showToast({
            title: error.message || '保存失败',
            icon: 'none'
        })
    }
}

// 返回上一页
const handleBack = () => {
    Taro.navigateBack()
}
</script>
