<template>
    <view class="laboratory-page">
        <!-- 基本信息 -->
        <view class="setting-section">
            <!-- 实验室选择 - 下拉选择 -->
            <view class="setting-item lab-selector-wrapper">
                <text class="item-label"
                    >实验室名称 <text class="required">*</text></text
                >
                <view
                    class="input-wrapper"
                    :class="{
                        'input-error': errors.labName,
                        'input-focused': focused.labName
                    }"
                    @tap="toggleLabDropdown"
                >
                    <text class="input-icon">🔬</text>
                    <text
                        class="form-input"
                        :class="{ 'input-placeholder': !selectedLab }"
                    >
                        {{
                            selectedLab
                                ? selectedLab.labName
                                : '请选择或搜索实验室'
                        }}
                    </text>
                    <text class="toggle-icon">
                        {{ showLabDropdown ? '▲' : '▼' }}
                    </text>
                </view>
                <text v-if="errors.labName" class="error-text">{{
                    errors.labName
                }}</text>

                <!-- 已选实验室提示 -->
                <view
                    v-if="selectedLab && !showLabDropdown"
                    class="lab-info-bar"
                >
                    <text class="lab-info-icon">✓</text>
                    <view class="lab-info-content">
                        <text class="lab-info-name">{{
                            selectedLab.labName
                        }}</text>
                        <text
                            v-if="selectedLab.university"
                            class="lab-info-university"
                            >{{ selectedLab.university }}</text
                        >
                    </view>
                </view>

                <!-- 实验室下拉列表 -->
                <view v-if="showLabDropdown" class="lab-dropdown">
                    <!-- 头部：在 scroll-view 外面 -->
                    <view
                        v-if="!loadingLabs && labList.length > 0"
                        class="lab-list-header"
                    >
                        <text class="lab-count-text"
                            >共 {{ labList.length }} 个实验室</text
                        >
                    </view>

                    <!-- 可滚动列表区域 -->
                    <scroll-view
                        v-if="loadingLabs"
                        scrollY="true"
                        class="lab-list-scroll"
                    >
                        <view class="lab-item lab-loading">
                            <text class="loading-text">加载中...</text>
                        </view>
                    </scroll-view>
                    <scroll-view
                        v-else-if="labList.length > 0"
                        scrollY="true"
                        class="lab-list-scroll"
                    >
                        <view
                            v-for="lab in labList"
                            :key="lab.labName"
                            class="lab-item"
                            @tap="selectLab(lab)"
                        >
                            <view class="lab-info">
                                <text class="lab-name">{{
                                    lab.labName
                                }}</text>
                                <text class="lab-university">{{
                                    lab.university
                                }}</text>
                            </view>
                        </view>
                    </scroll-view>
                    <view v-else class="lab-no-result">
                        <text class="no-result-text">暂无实验室</text>
                    </view>

                    <!-- 创建新实验室入口：固定在底部 -->
                    <view class="lab-create-link" @tap="goToCreateLab">
                        <text class="create-icon">➕</text>
                        <text class="create-text"
                            >没有找到？创建新实验室</text
                        >
                    </view>
                </view>
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
                <text v-if="!loading">{{ buttonText }}</text>
                <view v-else class="loading-spinner"></view>
            </view>
            <view class="btn-secondary" @tap="handleReset">
                <text>重置</text>
            </view>
        </view>

        <!-- 错误提示 -->
        <view v-if="errorMessage" class="error-toast">
            <text class="error-text">{{ errorMessage }}</text>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import labApi from '../../../api/labapi'
import userApi from '../../../api/userapi'
import './laboratory.scss'

// 来源页面（用于判断返回路径）
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

// 焦点状态
const focused = reactive({
    labName: false
})

// 实验室选择相关状态
const labList = ref([])
const selectedLab = ref(null)
const showLabDropdown = ref(false)
const loadingLabs = ref(false)

// 按钮文本（根据场景动态显示）
const buttonText = computed(() => {
    if (fromPage.value === 'profile') {
        return '保存更改'
    }
    return '创建实验室'
})

// ============ 实验室选择相关方法 ============

// 获取所有实验室列表
const loadLabList = async () => {
    if (loadingLabs.value) return

    loadingLabs.value = true

    try {
        const res = await Taro.request({
            url: labApi.list,
            method: 'GET'
        })

        if (res.statusCode === 200 && res.data && res.data.errCode === '0') {
            labList.value = res.data.data || []
        } else {
            labList.value = []
        }
    } catch (error) {
        console.error('获取实验室列表失败:', error)
        labList.value = []
    } finally {
        loadingLabs.value = false
    }
}

// 切换下拉框显示
const toggleLabDropdown = () => {
    showLabDropdown.value = !showLabDropdown.value
    if (showLabDropdown.value && labList.value.length === 0) {
        loadLabList()
    }
    focused.value.labName = showLabDropdown.value
}

// 选择实验室
const selectLab = (lab) => {
    selectedLab.value = lab
    formData.labName = lab.labName
    formData.university = lab.university
    showLabDropdown.value = false
    focused.labName = false
    errors.labName = ''
    errors.university = ''
}

// 跳转到创建实验室页面
const goToCreateLab = () => {
    showLabDropdown.value = false
    Taro.navigateTo({
        url: '/pages/profile/create-lab/create-lab?from=laboratory'
    })
}

// 字段失焦验证
const handleFieldBlur = (field) => {
    const value = formData[field]
    const stringValue = value != null ? String(value) : ''

    switch (field) {
        case 'labName':
            // 选择模式：验证是否已选择
            if (!stringValue || !stringValue.trim()) {
                errors.labName = '请选择实验室'
                errorMessage.value = '请选择实验室'
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

    // 检查是否有错误
    if (errors.labName) {
        return
    }

    loading.value = true

    // 判断操作类型
    const isUpdateProfile = fromPage.value === 'profile' && selectedLab.value

    // 根据场景确定 API 和方法
    let url, method, requestData
    if (isUpdateProfile) {
        // 更新用户所属实验室 - 需要调用用户 API 更新
        url = userApi.updateProfile
        method = 'POST'
        requestData = {
            _id: Taro.getStorageSync('user_id'),
            labName: formData.labName.trim()
        }
    } else {
        // 创建新实验室
        const submitData = {
            labName: formData.labName.trim(),
            university: formData.university.trim(),
            managerName: formData.managerName?.trim() || '',
            managerContact: formData.managerContact?.trim() || '',
            status: 'active'
        }
        url = labApi.create
        method = 'POST'
        requestData = submitData
    }

    Taro.request({
        url,
        method,
        header: {
            'Content-Type': 'application/json',
            Authorization: Taro.getStorageSync('token') || ''
        },
        data: requestData,
        success: (res) => {
            loading.value = false
            if (res.statusCode === 200 || res.statusCode === 201) {
                const data = res.data

                if (data.errCode === '0') {
                    if (isUpdateProfile) {
                        // 更新用户所属实验室
                        const userInfo = Taro.getStorageSync('userInfo')
                        if (userInfo) {
                            userInfo.labName = formData.labName
                            Taro.setStorageSync('userInfo', userInfo)
                        }
                        Taro.setStorageSync('labName', formData.labName)
                        Taro.setStorageSync('laboratoryInfo', formData)
                    }

                    Taro.showToast({
                        title: isUpdateProfile ? '更改成功' : '创建成功',
                        icon: 'success'
                    })

                    setTimeout(() => {
                        Taro.navigateBack()
                    }, 1500)
                } else {
                    // 后端返回业务错误
                    const errorMsg =
                        data.errorInfo || data.errCode === '-1'
                            ? '操作失败'
                            : '操作失败'
                    Taro.showToast({
                        title: data.errorInfo || errorMsg,
                        icon: 'none',
                        duration: 2000
                    })
                }
            } else {
                // HTTP 状态码错误
                const errorMsg =
                    res.data?.errorInfo || `HTTP ${res.statusCode}`
                Taro.showToast({
                    title: errorMsg,
                    icon: 'none',
                    duration: 2000
                })
            }
        },
        fail: (err) => {
            loading.value = false
            console.error('操作失败:', err)
            const errorMsg = err.errMsg || '操作失败，请检查网络连接'
            errorMessage.value = errorMsg
            Taro.showToast({
                title: errorMsg,
                icon: 'none',
                duration: 2000
            })
        }
    })
}

// 重置表单
const handleReset = () => {
    selectedLab.value = null

    // 从本地存储加载实验室信息
    const labInfo = Taro.getStorageSync('laboratoryInfo')
    if (labInfo) {
        Object.assign(formData, {
            labName: labInfo.labName || '',
            university: labInfo.university || '',
            managerName: labInfo.managerName || '',
            managerContact: labInfo.managerContact || ''
        })
        // 设置已选实验室
        if (labInfo.labName) {
            selectedLab.value = {
                labName: labInfo.labName,
                university: labInfo.university || ''
            }
        }
    } else {
        Object.assign(formData, {
            labName: '',
            university: '',
            managerName: '',
            managerContact: ''
        })
    }

    // 清空错误
    errors.labName = ''
    errors.university = ''
    errors.managerName = ''
    errors.managerContact = ''
    errorMessage.value = ''

    Taro.showToast({
        title: '已重置',
        icon: 'success'
    })
}

// 页面显示时刷新实验室列表
useDidShow(() => {
    // 页面显示时重新加载实验室列表
    loadLabList()

    // 检查是否有新创建的实验室并自动选择
    const newLabName = Taro.getStorageSync('newlyCreatedLab')
    if (newLabName) {
        loadLabList().then(() => {
            const newLab = labList.value.find(
                lab => lab.labName === newLabName
            )
            if (newLab) {
                selectLab(newLab)
            }

            // 清除临时存储
            Taro.removeStorageSync('newlyCreatedLab')
            Taro.removeStorageSync('newlyCreatedLabUniversity')
        })
    }
})

// 页面加载时获取实验室信息
onMounted(() => {
    // 获取 URL 参数
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    fromPage.value = params?.from || ''

    // 从用户信息中获取实验室名称
    const userInfo = Taro.getStorageSync('userInfo')

    // 尝试从多个地方获取实验室名称
    let labName = userInfo?.labName || userInfo?.laboratory || userInfo?.lab || ''
    // 如果 userInfo 中没有，尝试从单独的存储中获取
    if (!labName) {
        labName = Taro.getStorageSync('labName') || ''
    }

    if (labName) {
        // 用户已有实验室，从后端获取实验室详情
        Taro.request({
            url: labApi.detail(labName),
            method: 'GET',
            header: {
                Authorization: Taro.getStorageSync('token') || ''
            },
            success: (res) => {
                if (res.statusCode === 200 && res.data.errCode === '0') {
                    const labData = res.data.data
                    Object.assign(formData, {
                        labName: labData.labName || '',
                        university: labData.university || '',
                        managerName: labData.managerName || '',
                        managerContact: labData.managerContact || ''
                    })
                    // 设置已选实验室，进入选择模式
                    selectedLab.value = {
                        labName: labData.labName || '',
                        university: labData.university || ''
                    }
                }
            },
            fail: (err) => {
                console.error('获取实验室信息失败:', err)
                // 从本地存储加载
                const labInfo = Taro.getStorageSync('laboratoryInfo')
                if (labInfo) {
                    Object.assign(formData, labInfo)
                    selectedLab.value = {
                        labName: labInfo.labName || '',
                        university: labInfo.university || ''
                    }
                }
            }
        })
    } else {
        // 用户没有实验室，从本地存储加载（如果有）
        const labInfo = Taro.getStorageSync('laboratoryInfo')
        if (labInfo) {
            Object.assign(formData, labInfo)
            selectedLab.value = {
                labName: labInfo.labName || '',
                university: labInfo.university || ''
            }
        }
    }

    // 加载实验室列表
    loadLabList()
})
</script>
