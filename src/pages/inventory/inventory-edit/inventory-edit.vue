<template>
    <view class="edit-page">
        <view class="edit-container">
            <!-- 页面标题 -->
            <view class="page-header">
                <text class="page-title">{{
                    isEdit ? '编辑耗材' : '添加耗材'
                }}</text>
            </view>

            <!-- 表单内容 -->
            <scroll-view scroll-y class="form-content">
                <!-- 基本信息 -->
                <view class="form-section">
                    <view class="section-title">基本信息</view>

                    <view class="form-group">
                        <text class="form-label"
                            >耗材名称 <text class="required">*</text></text
                        >
                        <view
                            class="input-wrapper"
                            :class="{
                                'input-error': errors.name,
                                'input-focused': focused.name
                            }"
                        >
                            <text class="input-icon">📦</text>
                            <input
                                v-model="formData.name"
                                placeholder="请输入耗材名称"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.name = true"
                                @blur="handleFieldBlur('name')"
                            />
                        </view>
                        <text v-if="errors.name" class="error-text">{{
                            errors.name
                        }}</text>
                    </view>

                    <view class="form-group">
                        <text class="form-label"
                            >耗材编号 <text class="required">*</text></text
                        >
                        <view
                            class="input-wrapper"
                            :class="{
                                'input-error': errors.code,
                                'input-focused': focused.code
                            }"
                        >
                            <text class="input-icon">🏷️</text>
                            <input
                                v-model="formData.code"
                                placeholder="请输入或扫码录入耗材编号"
                                class="form-input"
                                :disabled="loading || isEdit"
                                @focus="focused.code = true"
                                @blur="handleFieldBlur('code')"
                            />
                            <view
                                v-if="!isEdit"
                                class="scan-btn"
                                @tap="handleScanCode"
                            >
                                📷
                            </view>
                        </view>
                        <text v-if="errors.code" class="error-text">{{
                            errors.code
                        }}</text>
                    </view>

                    <view class="form-group">
                        <text class="form-label"
                            >分类 <text class="required">*</text></text
                        >
                        <view class="category-options">
                            <view
                                v-for="cat in categories"
                                :key="cat.value"
                                class="category-option"
                                :class="{
                                    active: formData.category === cat.value
                                }"
                                @tap="formData.category = cat.value"
                            >
                                <text class="option-icon">{{ cat.icon }}</text>
                                <text class="option-label">{{
                                    cat.label
                                }}</text>
                            </view>
                        </view>
                        <text v-if="errors.category" class="error-text">{{
                            errors.category
                        }}</text>
                    </view>

                    <view class="form-group">
                        <text class="form-label">规格</text>
                        <view
                            class="input-wrapper"
                            :class="{ 'input-focused': focused.specification }"
                        >
                            <text class="input-icon">📏</text>
                            <input
                                v-model="formData.specification"
                                placeholder="如：100mL、500次等"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.specification = true"
                                @blur="focused.specification = false"
                            />
                        </view>
                    </view>
                </view>

                <!-- 库存信息 -->
                <view class="form-section">
                    <view class="section-title">库存信息</view>

                    <view class="form-group">
                        <text class="form-label"
                            >单位 <text class="required">*</text></text
                        >
                        <view
                            class="input-wrapper"
                            :class="{
                                'input-error': errors.unit,
                                'input-focused': focused.unit
                            }"
                        >
                            <text class="input-icon">📐</text>
                            <input
                                v-model="formData.unit"
                                placeholder="如：瓶、盒、个等"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.unit = true"
                                @blur="handleFieldBlur('unit')"
                            />
                        </view>
                        <text v-if="errors.unit" class="error-text">{{
                            errors.unit
                        }}</text>
                    </view>

                    <view class="form-group">
                        <text class="form-label">初始数量</text>
                        <view
                            class="input-wrapper"
                            :class="{ 'input-focused': focused.quantity }"
                        >
                            <text class="input-icon">🔢</text>
                            <input
                                v-model="formData.quantity"
                                type="number"
                                placeholder="请输入数量"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.quantity = true"
                                @blur="focused.quantity = false"
                            />
                        </view>
                    </view>

                    <view class="form-group">
                        <text class="form-label">最小库存</text>
                        <view
                            class="input-wrapper"
                            :class="{ 'input-focused': focused.minQuantity }"
                        >
                            <text class="input-icon">⚠️</text>
                            <input
                                v-model="formData.minQuantity"
                                type="number"
                                placeholder="默认10"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.minQuantity = true"
                                @blur="focused.minQuantity = false"
                            />
                        </view>
                    </view>

                    <view class="form-group">
                        <text class="form-label">最大库存</text>
                        <view
                            class="input-wrapper"
                            :class="{ 'input-focused': focused.maxQuantity }"
                        >
                            <text class="input-icon">📊</text>
                            <input
                                v-model="formData.maxQuantity"
                                type="number"
                                placeholder="可选"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.maxQuantity = true"
                                @blur="focused.maxQuantity = false"
                            />
                        </view>
                    </view>

                    <view class="form-group">
                        <text class="form-label">存放位置</text>
                        <view
                            class="input-wrapper"
                            :class="{ 'input-focused': focused.location }"
                        >
                            <text class="input-icon">📍</text>
                            <input
                                v-model="formData.location"
                                placeholder="如：A-01-01"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.location = true"
                                @blur="focused.location = false"
                            />
                        </view>
                    </view>
                </view>

                <!-- 采购信息 -->
                <view class="form-section">
                    <view class="section-title">采购信息</view>

                    <view class="form-group">
                        <text class="form-label"
                            >单价 <text class="required">*</text></text
                        >
                        <view
                            class="input-wrapper"
                            :class="{
                                'input-error': errors.price,
                                'input-focused': focused.price
                            }"
                        >
                            <text class="input-icon">💰</text>
                            <input
                                v-model="formData.price"
                                type="digit"
                                placeholder="请输入单价"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.price = true"
                                @blur="handleFieldBlur('price')"
                            />
                        </view>
                        <text v-if="errors.price" class="error-text">{{
                            errors.price
                        }}</text>
                    </view>

                    <view class="form-group">
                        <text class="form-label">供应商</text>
                        <view
                            class="input-wrapper"
                            :class="{ 'input-focused': focused.supplier }"
                        >
                            <text class="input-icon">🏢</text>
                            <input
                                v-model="formData.supplier"
                                placeholder="请输入供应商名称"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.supplier = true"
                                @blur="focused.supplier = false"
                            />
                        </view>
                    </view>

                    <view class="form-group">
                        <text class="form-label">购买日期</text>
                        <Picker
                            mode="date"
                            :value="formData.purchaseDate"
                            :end="today"
                            @change="handlePurchaseDateChange"
                        >
                            <view
                                class="picker-input"
                                :class="{ 'input-focused': focused.purchaseDate }"
                            >
                                <text class="input-icon">📅</text>
                                <text
                                    class="picker-value"
                                    :class="{ placeholder: !formData.purchaseDate }"
                                >
                                    {{ formData.purchaseDate || '请选择购买日期' }}
                                </text>
                                <text class="picker-arrow">▼</text>
                            </view>
                        </Picker>
                    </view>

                    <view class="form-group">
                        <text class="form-label">过期日期</text>
                        <Picker
                            mode="date"
                            :value="formData.expiryDate"
                            :start="today"
                            @change="handleExpiryDateChange"
                        >
                            <view
                                class="picker-input"
                                :class="{ 'input-focused': focused.expiryDate }"
                            >
                                <text class="input-icon">⏰</text>
                                <text
                                    class="picker-value"
                                    :class="{ placeholder: !formData.expiryDate }"
                                >
                                    {{ formData.expiryDate || '请选择过期日期（可选）' }}
                                </text>
                                <text class="picker-arrow">▼</text>
                            </view>
                        </Picker>
                    </view>
                </view>

                <!-- 备注 -->
                <view class="form-section">
                    <view class="section-title">备注</view>

                    <view class="form-group">
                        <text class="form-label">备注信息</text>
                        <textarea
                            v-model="formData.remarks"
                            placeholder="请输入备注信息"
                            class="form-textarea"
                            :disabled="loading"
                            :rows="3"
                        />
                    </view>
                </view>
            </scroll-view>

            <!-- 底部按钮 -->
            <view class="form-footer">
                <view class="btn-secondary" @tap="handleCancel">取消</view>
                <view
                    class="btn-primary"
                    :class="{
                        'btn-loading': loading,
                        'btn-disabled': !isFormValid
                    }"
                    @tap="handleSubmit"
                >
                    <text v-if="!loading">{{ isEdit ? '保存' : '添加' }}</text>
                    <view v-else class="loading-spinner"></view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import inventoryApi from '../../../api/inventoryAPI'
import './inventory-edit.scss'

// 分类选项
const categories = [
    { icon: '🧪', label: '试剂', value: '试剂' },
    { icon: '📦', label: '耗材', value: '耗材' },
    { icon: '⚙️', label: '仪器', value: '仪器' },
    { icon: '📁', label: '其他', value: '其他' }
]

// 是否为编辑模式
const isEdit = ref(false)
const itemId = ref('')

// 表单数据
const formData = ref({
    name: '',
    code: '',
    category: '试剂',
    specification: '',
    unit: '',
    quantity: '',
    minQuantity: '10',
    maxQuantity: '',
    price: '',
    supplier: '',
    purchaseDate: '',
    expiryDate: '',
    location: '',
    remarks: ''
})

// 错误信息
const errors = ref({
    name: '',
    code: '',
    category: '',
    unit: '',
    price: ''
})

// 焦点状态
const focused = ref({
    name: false,
    code: false,
    category: false,
    specification: false,
    unit: false,
    quantity: false,
    minQuantity: false,
    maxQuantity: false,
    price: false,
    supplier: false,
    purchaseDate: false,
    expiryDate: false,
    location: false
})

// 加载状态
const loading = ref(false)

// 今天的日期（用于限制日期选择范围）
const today = ref(new Date().toISOString().split('T')[0])

// 处理购买日期选择
const handlePurchaseDateChange = (e) => {
    formData.value.purchaseDate = e.detail.value
    focused.value.purchaseDate = false
}

// 处理过期日期选择
const handleExpiryDateChange = (e) => {
    formData.value.expiryDate = e.detail.value
    focused.value.expiryDate = false
}

// 表单验证
const isFormValid = computed(() => {
    const required = ['name', 'code', 'category', 'unit', 'price']
    return (
        required.every((field) => formData.value[field]) &&
        Object.values(errors.value).every((error) => !error)
    )
})

// 字段失焦验证
const handleFieldBlur = (field) => {
    focused.value[field] = false
    const value = formData.value[field]

    switch (field) {
        case 'name':
            if (!value || !value.trim()) {
                errors.value.name = '请输入耗材名称'
            } else {
                errors.value.name = ''
            }
            break
        case 'code':
            if (!value || !value.trim()) {
                errors.value.code = '请输入耗材编号'
            } else {
                errors.value.code = ''
            }
            break
        case 'unit':
            if (!value || !value.trim()) {
                errors.value.unit = '请输入单位'
            } else {
                errors.value.unit = ''
            }
            break
        case 'price':
            if (!value || value <= 0) {
                errors.value.price = '请输入有效的单价'
            } else {
                errors.value.price = ''
            }
            break
    }
}

// 格式化日期为 YYYY-MM-DD
const formatDateForPicker = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 加载耗材详情（编辑模式）
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

        const item = res.data.data
        formData.value = {
            name: item.name || '',
            code: item.code || '',
            category: item.category || '试剂',
            specification: item.spec || item.specification || '',
            unit: item.unit || '',
            quantity: item.quantity?.toString() || '',
            minQuantity: item.minQuantity?.toString() || '10',
            maxQuantity: item.maxQuantity?.toString() || '',
            price: item.price?.toString() || '',
            supplier: item.supplier || '',
            purchaseDate: formatDateForPicker(item.purchaseDate),
            expiryDate: formatDateForPicker(item.expiryDate),
            location: item.location || '',
            remarks: item.remarks || ''
        }
    } catch (error) {
        console.error('加载耗材详情失败:', error)
        Taro.showToast({
            title: '加载失败',
            icon: 'none'
        })
    }
}

// 提交表单
const handleSubmit = async () => {
    // 验证必填字段
    if (!isFormValid.value) {
        Taro.showToast({
            title: '请填写所有必填字段',
            icon: 'none'
        })
        return
    }

    loading.value = true

    try {
        const submitData = {
            ...formData.value,
            quantity: Number(formData.value.quantity) || 0,
            minQuantity: Number(formData.value.minQuantity) || 10,
            maxQuantity: formData.value.maxQuantity
                ? Number(formData.value.maxQuantity)
                : undefined,
            price: Number(formData.value.price)
        }

        let res
        if (isEdit.value) {
            // 更新
            res = await Taro.request({
                url: inventoryApi.update(itemId.value),
                method: 'PUT',
                data: submitData,
                header: {
                    'Content-Type': 'application/json',
                    Authorization: Taro.getStorageSync('token')
                }
            })
        } else {
            // 添加
            res = await Taro.request({
                url: inventoryApi.add,
                method: 'POST',
                data: submitData,
                header: {
                    'Content-Type': 'application/json',
                    Authorization: Taro.getStorageSync('token')
                }
            })
        }

        if (res.data.errCode && res.data.errCode !== '0') {
            Taro.showToast({
                title:
                    res.data.errorInfo ||
                    (isEdit.value ? '修改失败' : '添加失败'),
                icon: 'none'
            })
            return
        }

        Taro.showToast({
            title: isEdit.value ? '修改成功' : '添加成功',
            icon: 'success'
        })

        // 返回仓库页
        setTimeout(() => {
            Taro.navigateBack()
        }, 1500)
    } catch (error) {
        console.error('提交失败:', error)
        Taro.showToast({
            title: '提交失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 判断是否为 MongoDB ObjectId
const isObjectId = (id) => {
    // MongoDB ObjectId 是 24 字符的十六进制字符串
    return /^[0-9a-fA-F]{24}$/.test(id)
}

// 通过货物码查询并自动填充表单（公共函数）
const queryAndFillByCode = async (code) => {
    try {
        Taro.showLoading({ title: '查询中...' })

        const res = await Taro.request({
            url: inventoryApi.getByCode,
            method: 'GET',
            data: { code },
            header: {
                Authorization: Taro.getStorageSync('token')
            }
        })

        Taro.hideLoading()

        if (res.data.errCode && res.data.errCode !== '0') {
            Taro.showToast({
                title: res.data.errorInfo || '查询失败',
                icon: 'none'
            })
            return
        }

        // 如果找到该编号的耗材，自动填充表单
        if (res.data.data) {
            const item = res.data.data
            Taro.showModal({
                title: '发现已有耗材',
                content: `发现耗材：${item.name}\n\n是否自动填充表单？`,
                success: (modalRes) => {
                    if (modalRes.confirm) {
                        // 自动填充表单
                        formData.value.name = item.name || ''
                        formData.value.category = item.category || '试剂'
                        formData.value.specification = item.specification || ''
                        formData.value.unit = item.unit || ''
                        formData.value.price = item.price?.toString() || ''
                        formData.value.minQuantity = item.minQuantity?.toString() || '10'
                        formData.value.maxQuantity = item.maxQuantity?.toString() || ''
                        formData.value.supplier = item.supplier || ''
                        formData.value.location = item.location || ''
                        // 数量、日期等不需要自动填充

                        Taro.showToast({
                            title: '已自动填充表单',
                            icon: 'success'
                        })
                    }
                }
            })
        } else {
            Taro.showToast({
                title: '扫码成功，请填写表单',
                icon: 'success'
            })
        }
    } catch (err) {
        Taro.hideLoading()
        console.error('查询失败:', err)
        Taro.showToast({
            title: '查询失败',
            icon: 'none'
        })
    }
}

// 扫码录入（查询数据库并自动填充表单）
const handleScanCode = async () => {
    try {
        const scanRes = await Taro.scanCode({
            onlyFromCamera: false,
            scanType: ['barCode', 'qrCode']
        })

        const scannedText = scanRes.result

        // 判断是否为 MongoDB ObjectId（扫描的是已有耗材的二维码）
        if (isObjectId(scannedText)) {
            Taro.showLoading({ title: '查询中...' })

            const res = await Taro.request({
                url: inventoryApi.detail(scannedText),
                method: 'GET',
                header: {
                    Authorization: Taro.getStorageSync('token')
                }
            })

            Taro.hideLoading()

            if (res.data.errCode === '0' && res.data.data) {
                const item = res.data.data
                Taro.showModal({
                    title: '发现已有耗材',
                    content: `扫描到已有耗材：${item.name}（编号：${item.code}）\n\n如需编辑请前往库存列表，是否复制信息进行新耗材录入？`,
                    confirmText: '复制信息',
                    cancelText: '前往列表',
                    success: (modalRes) => {
                        if (modalRes.confirm) {
                            // 自动填充表单（复制信息）
                            formData.value.code = '' // 编码不复制，需要新的
                            formData.value.name = item.name || ''
                            formData.value.category = item.category || '试剂'
                            formData.value.specification =
                                item.specification || ''
                            formData.value.unit = item.unit || ''
                            formData.value.price = item.price?.toString() || ''
                            formData.value.minQuantity =
                                item.minQuantity?.toString() || '10'
                            formData.value.maxQuantity =
                                item.maxQuantity?.toString() || ''
                            formData.value.supplier = item.supplier || ''
                            formData.value.location = item.location || ''
                            Taro.showToast({
                                title: '已复制耗材信息',
                                icon: 'success'
                            })
                        } else {
                            // 前往库存列表编辑该耗材
                            Taro.navigateTo({
                                url: `/pages/inventory-edit/inventory-edit?id=${scannedText}`
                            })
                        }
                    }
                })
            } else {
                Taro.showToast({
                    title: '未找到该耗材',
                    icon: 'none'
                })
            }
            return
        }

        // 如果是普通编号，查询数据库并自动填充
        formData.value.code = scannedText
        await queryAndFillByCode(scannedText)
    } catch (err) {
        Taro.hideLoading()
        console.error('扫码失败:', err)
        Taro.showToast({
            title: '扫码失败',
            icon: 'none'
        })
    }
}

// 取消
const handleCancel = () => {
    Taro.navigateBack()
}

onMounted(async () => {
    // 获取页面参数
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params

    if (params?.id) {
        // 编辑模式
        isEdit.value = true
        itemId.value = params.id
        loadItemDetail()
    } else if (params?.code) {
        // 从扫码登记页面传递的货物码 - 自动查询并填充
        const decodedCode = decodeURIComponent(params.code)
        formData.value.code = decodedCode

        // 调用公共函数查询并自动填充
        await queryAndFillByCode(decodedCode)
    }
})
</script>
