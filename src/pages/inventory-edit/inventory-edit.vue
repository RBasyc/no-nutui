<template>
    <view class="edit-page">
        <view class="edit-container">
            <!-- 页面标题 -->
            <view class="page-header">
                <text class="page-title">{{ isEdit ? '编辑耗材' : '添加耗材' }}</text>
            </view>

            <!-- 表单内容 -->
            <scroll-view scroll-y class="form-content">
                <!-- 基本信息 -->
                <view class="form-section">
                    <view class="section-title">基本信息</view>

                    <view class="form-group">
                        <text class="form-label">耗材名称 <text class="required">*</text></text>
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
                        <text v-if="errors.name" class="error-text">{{ errors.name }}</text>
                    </view>

                    <view class="form-group">
                        <text class="form-label">耗材编号 <text class="required">*</text></text>
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
                                placeholder="请输入耗材编号（唯一）"
                                class="form-input"
                                :disabled="loading || isEdit"
                                @focus="focused.code = true"
                                @blur="handleFieldBlur('code')"
                            />
                        </view>
                        <text v-if="errors.code" class="error-text">{{ errors.code }}</text>
                    </view>

                    <view class="form-group">
                        <text class="form-label">分类 <text class="required">*</text></text>
                        <view class="category-options">
                            <view
                                v-for="cat in categories"
                                :key="cat.value"
                                class="category-option"
                                :class="{ active: formData.category === cat.value }"
                                @tap="formData.category = cat.value"
                            >
                                <text class="option-icon">{{ cat.icon }}</text>
                                <text class="option-label">{{ cat.label }}</text>
                            </view>
                        </view>
                        <text v-if="errors.category" class="error-text">{{ errors.category }}</text>
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
                        <text class="form-label">单位 <text class="required">*</text></text>
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
                        <text v-if="errors.unit" class="error-text">{{ errors.unit }}</text>
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
                        <text class="form-label">单价 <text class="required">*</text></text>
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
                        <text v-if="errors.price" class="error-text">{{ errors.price }}</text>
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
                        <view
                            class="input-wrapper"
                            :class="{ 'input-focused': focused.purchaseDate }"
                        >
                            <text class="input-icon">📅</text>
                            <input
                                v-model="formData.purchaseDate"
                                placeholder="YYYY-MM-DD"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.purchaseDate = true"
                                @blur="focused.purchaseDate = false"
                            />
                        </view>
                    </view>

                    <view class="form-group">
                        <text class="form-label">过期日期</text>
                        <view
                            class="input-wrapper"
                            :class="{ 'input-focused': focused.expiryDate }"
                        >
                            <text class="input-icon">⏰</text>
                            <input
                                v-model="formData.expiryDate"
                                placeholder="YYYY-MM-DD（可选）"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.expiryDate = true"
                                @blur="focused.expiryDate = false"
                            />
                        </view>
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
import Taro from '@tarojs/taro'
import inventoryApi from '../../api/inventoryAPI'
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

// 表单验证
const isFormValid = computed(() => {
    const required = ['name', 'code', 'category', 'unit', 'price']
    return required.every(field => formData.value[field]) &&
           Object.values(errors.value).every(error => !error)
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
            purchaseDate: item.purchaseDate || '',
            expiryDate: item.expiryDate || '',
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
            maxQuantity: formData.value.maxQuantity ? Number(formData.value.maxQuantity) : undefined,
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
                    'Authorization': Taro.getStorageSync('token')
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
                    'Authorization': Taro.getStorageSync('token')
                }
            })
        }

        if (res.data.errCode && res.data.errCode !== '0') {
            Taro.showToast({
                title: res.data.errorInfo || (isEdit.value ? '修改失败' : '添加失败'),
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

// 取消
const handleCancel = () => {
    Taro.navigateBack()
}

onMounted(() => {
    // 获取页面参数
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params

    if (params?.id) {
        isEdit.value = true
        itemId.value = params.id
        loadItemDetail()
    }
})
</script>
