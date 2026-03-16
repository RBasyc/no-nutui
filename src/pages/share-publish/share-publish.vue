<template>
    <view class="publish-page">
        <!-- 页面标题 -->
        <view class="page-header">
            <text class="page-title">发布共享需求</text>
        </view>

        <!-- 表单内容 -->
        <scroll-view scroll-y class="form-content">
                <!-- 需求类型 -->
                <view class="form-section">
                    <view class="section-title">需求类型</view>

                    <view class="form-group">
                        <view class="type-options">
                            <view
                                class="type-option"
                                :class="{ active: formData.requestType === 'request' }"
                                @tap="formData.requestType = 'request'"
                            >
                                <text class="option-icon">📋</text>
                                <text class="option-label">我需要</text>
                                <text class="option-desc">寻求耗材帮助</text>
                            </view>
                            <view
                                class="type-option"
                                :class="{ active: formData.requestType === 'share' }"
                                @tap="formData.requestType = 'share'"
                            >
                                <text class="option-icon">📤</text>
                                <text class="option-label">我富余</text>
                                <text class="option-desc">共享耗材资源</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 基本信息 -->
                <view class="form-section">
                    <view class="section-title">基本信息</view>

                    <view class="form-group">
                        <text class="form-label">
                            标题 <text class="required">*</text>
                        </text>
                        <view
                            class="input-wrapper"
                            :class="{
                                'input-error': errors.title,
                                'input-focused': focused.title
                            }"
                        >
                            <text class="input-icon">📝</text>
                            <input
                                v-model="formData.title"
                                placeholder="简明扼要地描述您的需求"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.title = true"
                                @blur="handleFieldBlur('title')"
                            />
                        </view>
                        <text v-if="errors.title" class="error-text">{{
                            errors.title
                        }}</text>
                    </view>

                    <view class="form-group">
                        <text class="form-label">
                            详细描述 <text class="required">*</text>
                        </text>
                        <view
                            class="textarea-wrapper"
                            :class="{
                                'input-error': errors.description,
                                'input-focused': focused.description
                            }"
                        >
                            <textarea
                                v-model="formData.description"
                                placeholder="请详细描述您的需求或可提供的资源信息..."
                                class="form-textarea"
                                :disabled="loading"
                                maxlength="500"
                                @focus="focused.description = true"
                                @blur="handleFieldBlur('description')"
                            />
                            <text class="char-count">{{
                                formData.description.length
                            }}/500</text>
                        </view>
                        <text v-if="errors.description" class="error-text">{{
                            errors.description
                        }}</text>
                    </view>
                </view>

                <!-- 耗材信息 -->
                <view class="form-section">
                    <view class="section-title">{{ formData.requestType === 'request' ? '需求信息' : '提供信息' }}</view>

                    <view class="form-group">
                        <text class="form-label">
                            耗材名称 <text class="required">*</text>
                        </text>
                        <view
                            class="input-wrapper"
                            :class="{
                                'input-error': errors.itemName,
                                'input-focused': focused.itemName
                            }"
                        >
                            <text class="input-icon">📦</text>
                            <input
                                v-model="formData.itemName"
                                placeholder="请输入耗材名称"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.itemName = true"
                                @blur="handleFieldBlur('itemName')"
                            />
                        </view>
                        <text v-if="errors.itemName" class="error-text">{{
                            errors.itemName
                        }}</text>
                    </view>

                    <view class="form-group">
                        <text class="form-label">
                            数量 <text class="required">*</text>
                        </text>
                        <view
                            class="input-wrapper"
                            :class="{
                                'input-error': errors.quantity,
                                'input-focused': focused.quantity
                            }"
                        >
                            <text class="input-icon">🔢</text>
                            <input
                                v-model="formData.quantity"
                                placeholder="如：2瓶、1盒、500g等"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.quantity = true"
                                @blur="handleFieldBlur('quantity')"
                            />
                        </view>
                        <text v-if="errors.quantity" class="error-text">{{
                            errors.quantity
                        }}</text>
                    </view>

                    <view class="form-group">
                        <text class="form-label">
                            {{ formData.requestType === 'request' ? '期望时间' : '有效期' }} <text class="required">*</text>
                        </text>
                        <view
                            class="input-wrapper"
                            :class="{
                                'input-error': errors.expectedTime,
                                'input-focused': focused.expectedTime
                            }"
                        >
                            <text class="input-icon">⏰</text>
                            <input
                                v-model="formData.expectedTime"
                                :placeholder="formData.requestType === 'request' ? '如：3天内、1周内、随时等' : '如：1个月内、长期有效等'"
                                class="form-input"
                                :disabled="loading"
                                @focus="focused.expectedTime = true"
                                @blur="handleFieldBlur('expectedTime')"
                            />
                        </view>
                        <text v-if="errors.expectedTime" class="error-text">{{
                            errors.expectedTime
                        }}</text>
                    </view>
                </view>

                <!-- 紧急程度 -->
                <view class="form-section">
                    <view class="section-title">紧急程度</view>

                    <view class="form-group">
                        <view class="status-options">
                            <view
                                class="status-option"
                                :class="{ active: formData.status === 'normal' }"
                                @tap="formData.status = 'normal'"
                            >
                                <text class="option-icon">📋</text>
                                <text class="option-label">普通</text>
                            </view>
                            <view
                                class="status-option"
                                :class="{ active: formData.status === 'urgent' }"
                                @tap="formData.status = 'urgent'"
                            >
                                <text class="option-icon">🔥</text>
                                <text class="option-label">紧急</text>
                            </view>
                        </view>
                    </view>
                </view>
            </scroll-view>

            <!-- 底部操作按钮 -->
            <view class="form-actions">
                <view class="action-btn cancel" @tap="handleCancel">
                    <text>取消</text>
                </view>
                <view
                    class="action-btn submit"
                    :class="{ loading: loading }"
                    @tap="handleSubmit"
                >
                    <text v-if="!loading">发布</text>
                    <text v-else>发布中...</text>
                </view>
            </view>
    </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import Taro from '@tarojs/taro'
import shareRequestApi from '../../api/shareRequestApi'
import './share-publish.scss'

// 表单数据
const formData = reactive({
    title: '',
    description: '',
    itemName: '',
    quantity: '',
    expectedTime: '',
    status: 'normal',
    requestType: 'request'
})

// 错误信息
const errors = reactive({
    title: '',
    description: '',
    itemName: '',
    quantity: '',
    expectedTime: ''
})

// 输入框焦点状态
const focused = reactive({
    title: false,
    description: false,
    itemName: false,
    quantity: false,
    expectedTime: false
})

// 加载状态
const loading = ref(false)

// 字段验证
const handleFieldBlur = (field) => {
    const value = formData[field]

    if (!value || value.trim() === '') {
        errors[field] = '此项不能为空'
    } else if (field === 'title' && value.length > 100) {
        errors[field] = '标题不能超过100个字符'
    } else if (field === 'description' && value.length < 10) {
        errors[field] = '描述至少需要10个字符'
    } else {
        errors[field] = ''
    }

    focused[field] = false
}

// 表单验证
const validateForm = () => {
    let isValid = true

    // 验证标题
    if (!formData.title || formData.title.trim() === '') {
        errors.title = '请输入标题'
        isValid = false
    } else if (formData.title.length > 100) {
        errors.title = '标题不能超过100个字符'
        isValid = false
    } else {
        errors.title = ''
    }

    // 验证描述
    if (!formData.description || formData.description.trim() === '') {
        errors.description = '请输入详细描述'
        isValid = false
    } else if (formData.description.length < 10) {
        errors.description = '描述至少需要10个字符'
        isValid = false
    } else {
        errors.description = ''
    }

    // 验证耗材名称
    if (!formData.itemName || formData.itemName.trim() === '') {
        errors.itemName = '请输入耗材名称'
        isValid = false
    } else {
        errors.itemName = ''
    }

    // 验证数量
    if (!formData.quantity || formData.quantity.trim() === '') {
        errors.quantity = '请输入数量'
        isValid = false
    } else {
        errors.quantity = ''
    }

    // 验证期望时间
    if (!formData.expectedTime || formData.expectedTime.trim() === '') {
        errors.expectedTime = '请输入期望时间'
        isValid = false
    } else {
        errors.expectedTime = ''
    }

    return isValid
}

// 提交表单
const handleSubmit = async () => {
    // 验证表单
    if (!validateForm()) {
        Taro.showToast({
            title: '请检查表单填写',
            icon: 'none'
        })
        return
    }

    try {
        loading.value = true

        const res = await Taro.request({
            url: shareRequestApi.add,
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization': Taro.getStorageSync('token') || ''
            },
            data: {
                title: formData.title.trim(),
                description: formData.description.trim(),
                itemName: formData.itemName.trim(),
                quantity: formData.quantity.trim(),
                expectedTime: formData.expectedTime.trim(),
                status: formData.status,
                requestType: formData.requestType
            }
        })

        if (res.statusCode === 200 && res.data.errCode === '0') {
            Taro.showToast({
                title: '发布成功',
                icon: 'success'
            })

            // 设置刷新标志，通知协作页面刷新数据
            Taro.setStorageSync('shouldRefreshCollaboration', Date.now())

            // 延迟返回，让用户看到成功提示
            setTimeout(() => {
                Taro.navigateBack()
            }, 1500)
        } else {
            Taro.showToast({
                title: res.data.errorInfo || '发布失败',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('发布失败:', error)
        Taro.showToast({
            title: '网络错误，发布失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 取消发布
const handleCancel = () => {
    Taro.showModal({
        title: '确认取消',
        content: '确定要放弃发布吗？已填写的内容将不会保存。',
        success: (res) => {
            if (res.confirm) {
                Taro.navigateBack()
            }
        }
    })
}
</script>
