<template>
    <view class="laboratory-page">
        <!-- 基本信息 -->
        <view class="setting-section">
            <!-- 实验室名称输入 -->
            <view class="setting-item">
                <text class="item-label"
                    >实验室名称 <text class="required">*</text></text
                >
                <input
                    v-model="formData.labName"
                    class="item-input"
                    placeholder="请输入实验室名称"
                    maxlength="100"
                    @blur="handleFieldBlur('labName')"
                />
                <text v-if="errors.labName" class="error-text">{{
                    errors.labName
                }}</text>
            </view>

            <!-- 所属大学 -->
            <view class="setting-item">
                <text class="item-label"
                    >所属大学 <text class="required">*</text></text
                >
                <input
                    v-model="formData.university"
                    class="item-input"
                    placeholder="请输入所属大学"
                    maxlength="100"
                    @blur="handleFieldBlur('university')"
                />
                <text v-if="errors.university" class="error-text">{{
                    errors.university
                }}</text>
            </view>

            <!-- 负责人姓名 -->
            <view class="setting-item">
                <text class="item-label">负责人姓名</text>
                <input
                    v-model="formData.managerName"
                    class="item-input"
                    placeholder="请输入负责人姓名"
                    maxlength="50"
                    @blur="handleFieldBlur('managerName')"
                />
                <text v-if="errors.managerName" class="error-text">{{
                    errors.managerName
                }}</text>
            </view>

            <!-- 联系方式 -->
            <view class="setting-item">
                <text class="item-label">联系方式</text>
                <input
                    v-model="formData.managerContact"
                    type="number"
                    class="item-input"
                    placeholder="请输入联系方式"
                    maxlength="20"
                    @blur="handleFieldBlur('managerContact')"
                />
                <text v-if="errors.managerContact" class="error-text">{{
                    errors.managerContact
                }}</text>
            </view>
        </view>

        <!-- 按钮组 -->
        <view class="button-group">
            <view
                class="btn-primary"
                :class="{ 'btn-loading': loading }"
                @tap="handleSubmit"
            >
                <text v-if="!loading">创建实验室</text>
                <view v-else class="loading-spinner"></view>
            </view>
            <view class="btn-secondary" @tap="handleCancel">
                <text>取消</text>
            </view>
        </view>

        <!-- 错误提示 -->
        <view v-if="errorMessage" class="error-toast">
            <text class="error-text">{{ errorMessage }}</text>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import labApi from '../../api/labapi'
import './create-lab.scss'

// 来源页面
const fromPage = ref('')

// 表单数据
const formData = reactive({
    labName: '',
    university: '',
    managerName: '',
    managerContact: ''
})

// 错误信息
const errorMessage = ref('')

// 加载状态
const loading = ref(false)

// 表单验证错误
const errors = reactive({
    labName: '',
    university: '',
    managerName: '',
    managerContact: ''
})

// 字段失焦验证
const handleFieldBlur = (field) => {
    const value = formData[field]
    const stringValue = value != null ? String(value) : ''

    switch (field) {
        case 'labName':
            if (!stringValue || !stringValue.trim()) {
                errors.labName = '请输入实验室名称'
                errorMessage.value = '请输入实验室名称'
            } else if (stringValue.length < 2) {
                errors.labName = '实验室名称至少2个字符'
                errorMessage.value = '实验室名称至少2个字符'
            } else if (stringValue.length > 100) {
                errors.labName = '实验室名称最多100个字符'
                errorMessage.value = '实验室名称最多100个字符'
            } else {
                errors.labName = ''
                if (
                    !errors.university &&
                    !errors.managerName &&
                    !errors.managerContact
                ) {
                    errorMessage.value = ''
                }
            }
            break

        case 'university':
            if (!stringValue || !stringValue.trim()) {
                errors.university = '请输入所属大学'
                errorMessage.value = '请输入所属大学'
            } else if (stringValue.length > 100) {
                errors.university = '大学名称最多100个字符'
                errorMessage.value = '大学名称最多100个字符'
            } else {
                errors.university = ''
                if (
                    !errors.labName &&
                    !errors.managerName &&
                    !errors.managerContact
                ) {
                    errorMessage.value = ''
                }
            }
            break

        case 'managerName':
            if (stringValue && stringValue.trim() && stringValue.length < 2) {
                errors.managerName = '负责人姓名至少2个字符'
                errorMessage.value = '负责人姓名至少2个字符'
            } else {
                errors.managerName = ''
                if (
                    !errors.labName &&
                    !errors.university &&
                    !errors.managerContact
                ) {
                    errorMessage.value = ''
                }
            }
            break

        case 'managerContact':
            if (
                stringValue &&
                stringValue.trim() &&
                !/^1[3-9]\d{9}$/.test(stringValue)
            ) {
                errors.managerContact = '联系方式格式不正确'
                errorMessage.value = '联系方式格式不正确'
            } else {
                errors.managerContact = ''
                if (
                    !errors.labName &&
                    !errors.university &&
                    !errors.managerName
                ) {
                    errorMessage.value = ''
                }
            }
            break
    }
}

// 提交表单
const handleSubmit = () => {
    // 验证必填字段
    handleFieldBlur('labName')
    handleFieldBlur('university')

    // 检查是否有错误
    if (errors.labName || errors.university) {
        return
    }

    loading.value = true

    // 提交数据到后端
    const submitData = {
        labName: formData.labName.trim(),
        university: formData.university.trim(),
        managerName: formData.managerName?.trim() || '',
        managerContact: formData.managerContact?.trim() || '',
        status: 'active'
    }

    Taro.request({
        url: labApi.create,
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
            Authorization: Taro.getStorageSync('token') || ''
        },
        data: submitData,
        success: (res) => {
            loading.value = false
            if (res.statusCode === 200 || res.statusCode === 201) {
                const data = res.data

                if (data.errCode === '0') {
                    // 创建成功后的处理
                    Taro.setStorageSync('labName', formData.labName)
                    Taro.setStorageSync('laboratoryInfo', formData)

                    // 如果是从注册页来的，保存新创建的实验室信息
                    if (fromPage.value === 'register') {
                        Taro.setStorageSync('newlyCreatedLab', formData.labName)
                        Taro.setStorageSync(
                            'newlyCreatedLabUniversity',
                            formData.university
                        )
                    }

                    // 如果是从 laboratory 页面来的，也保存到临时存储
                    if (fromPage.value === 'laboratory') {
                        Taro.setStorageSync('newlyCreatedLab', formData.labName)
                        Taro.setStorageSync(
                            'newlyCreatedLabUniversity',
                            formData.university
                        )
                    }

                    Taro.showToast({
                        title: '创建成功',
                        icon: 'success'
                    })

                    setTimeout(() => {
                        Taro.navigateBack()
                    }, 1500)
                } else {
                    // 后端返回业务错误
                    const errorMsg =
                        data.errorInfo || data.errCode === '-1'
                            ? '创建失败'
                            : '创建失败'
                    Taro.showToast({
                        title: data.errorInfo || errorMsg,
                        icon: 'none',
                        duration: 2000
                    })
                }
            } else {
                // HTTP 状态码错误
                const errorMsg = res.data?.errorInfo || `HTTP ${res.statusCode}`
                Taro.showToast({
                    title: errorMsg,
                    icon: 'none',
                    duration: 2000
                })
            }
        },
        fail: (err) => {
            loading.value = false
            console.error('创建失败:', err)
            const errorMsg = err.errMsg || '创建失败，请检查网络连接'
            errorMessage.value = errorMsg
            Taro.showToast({
                title: errorMsg,
                icon: 'none',
                duration: 2000
            })
        }
    })
}

// 取消操作
const handleCancel = () => {
    Taro.navigateBack()
}

// 页面加载时获取来源参数
onMounted(() => {
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    fromPage.value = params?.from || ''
})
</script>
