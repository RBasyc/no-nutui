<template>
    <view class="register-page">
        <!-- 注册容器 -->
        <view class="register-container">
            <!-- Logo 和标题 -->
            <view class="register-header">
                <view class="logo-wrapper">
                    <text class="logo-text">Lab</text>
                </view>
                <text class="app-name">创建账号</text>
                <text class="app-subtitle">加入 Lab 智管，开启智能管理</text>
            </view>

            <!-- 注册表单 -->
            <view class="register-form">
                <!-- 昵称输入 -->
                <view class="form-group">
                    <text class="form-label">昵称</text>
                    <view
                        class="input-wrapper"
                        :class="{
                            'input-error': errors.nickname,
                            'input-focused': focused.nickname,
                            'input-success': nicknameValid
                        }"
                    >
                        <text class="input-icon">👤</text>
                        <input
                            v-model="formData.nickname"
                            type="nickname"
                            placeholder="请输入昵称（2-20个字符）"
                            class="form-input"
                            :disabled="loading"
                            @focus="focused.nickname = true"
                            @blur="handleNicknameBlur"
                            @input="handleNicknameInput"
                        />
                        <text
                            v-if="nicknameValid && !checkingNickname"
                            class="success-icon"
                            >✓</text
                        >
                        <view
                            v-if="checkingNickname"
                            class="checking-icon"
                        ></view>
                    </view>
                    <text v-if="errors.nickname" class="error-text">{{
                        errors.nickname
                    }}</text>
                    <text
                        v-if="nicknameValid && !checkingNickname"
                        class="success-text"
                        >昵称可用</text
                    >
                </view>

                <!-- 密码输入 -->
                <view class="form-group">
                    <text class="form-label">密码</text>
                    <view
                        class="input-wrapper"
                        :class="{
                            'input-error': errors.password,
                            'input-focused': focused.password
                        }"
                    >
                        <text class="input-icon">🔒</text>
                        <input
                            v-model="formData.password"
                            :type="showPassword ? 'text' : 'password'"
                            placeholder="请输入密码（至少6位）"
                            class="form-input"
                            :disabled="loading"
                            @focus="focused.password = true"
                            @blur="handlePasswordBlur"
                        />
                        <text class="toggle-icon" @tap="togglePassword">
                            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                        </text>
                    </view>
                    <text v-if="errors.password" class="error-text">{{
                        errors.password
                    }}</text>
                </view>

                <!-- 确认密码输入 -->
                <view class="form-group">
                    <text class="form-label">确认密码</text>
                    <view
                        class="input-wrapper"
                        :class="{
                            'input-error': errors.confirmPassword,
                            'input-focused': focused.confirmPassword
                        }"
                    >
                        <text class="input-icon">🔒</text>
                        <input
                            v-model="formData.confirmPassword"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            placeholder="请再次输入密码"
                            class="form-input"
                            :disabled="loading"
                            @focus="focused.confirmPassword = true"
                            @blur="handleConfirmPasswordBlur"
                        />
                        <text class="toggle-icon" @tap="toggleConfirmPassword">
                            {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
                        </text>
                    </view>
                    <text v-if="errors.confirmPassword" class="error-text">{{
                        errors.confirmPassword
                    }}</text>
                </view>

                <!-- 实验室选择 - 下拉选择 -->
                <view
                    class="form-group lab-selector-wrapper"
                    :class="{ 'selector-error': errors.labName }"
                >
                    <text class="form-label">所属实验室</text>
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
                                    : '请选择实验室'
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

                        <!-- 创建实验室入口：固定在底部 -->
                        <view class="lab-create-link" @tap="goToCreateLab">
                            <text class="create-icon">➕</text>
                            <text class="create-text"
                                >没有您的实验室？点我去创建</text
                            >
                        </view>
                    </view>
                </view>

                <!-- 注册按钮 -->
                <view
                    class="register-btn"
                    :class="{
                        'btn-loading': loading,
                        'btn-disabled': !isFormValid
                    }"
                    @tap="handleRegister"
                >
                    <text v-if="!loading">{{ loadingText }}</text>
                    <view v-else class="loading-spinner"></view>
                </view>

                <!-- 底部链接 -->
                <view class="form-footer">
                    <text class="link-text" @tap="handleLogin">返回登录</text>
                </view>
            </view>

            <!-- 装饰线条 -->
            <view class="decoration-line"></view>
        </view>

        <!-- 底部版本 -->
        <view class="footer">
            <text class="footer-text">Version 1.0.0</text>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import userApi from '../../../api/userapi'
import labApi from '../../../api/labapi'
import './register.scss'

// 表单数据
const formData = ref({
    nickname: '',
    password: '',
    confirmPassword: '',
    labName: ''
})

// 错误信息
const errors = ref({
    nickname: '',
    password: '',
    confirmPassword: '',
    labName: ''
})

// 焦点状态
const focused = ref({
    nickname: false,
    password: false,
    confirmPassword: false,
    labName: false
})

// 其他状态
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const checkingNickname = ref(false)
const nicknameValid = ref(false)
const loadingText = ref('注册')

// 实验室选择相关状态
const labList = ref([])
const selectedLab = ref(null)
const showLabDropdown = ref(false)
const loadingLabs = ref(false)

// 昵称检查定时器
let checkTimer = null

// 检查昵称是否存在
const checkNicknameExists = async (nickname) => {
    if (!nickname || nickname.length < 2) {
        nicknameValid.value = false
        return
    }

    checkingNickname.value = true
    errors.value.nickname = ''

    try {
        const res = await Taro.request({
            url: userApi.checkNickname,
            method: 'GET',
            data: { nickName: nickname }
        })

        if (res.statusCode === 200 && res.data) {
            if (res.data.errCode === '0') {
                // 昵称可用
                nicknameValid.value = true
                errors.value.nickname = ''
            } else if (res.data.errCode === '10001') {
                // 昵称已存在
                nicknameValid.value = false
                errors.value.nickname = '该昵称已被使用，请更换'
            }
        }
    } catch (error) {
        console.error('检查昵称失败:', error)
    } finally {
        checkingNickname.value = false
    }
}

// 昵称输入处理（带防抖）
const handleNicknameInput = () => {
    // 清除之前的定时器
    if (checkTimer) {
        clearTimeout(checkTimer)
    }

    nicknameValid.value = false

    const nickname = formData.value.nickname.trim()
    if (!nickname) {
        errors.value.nickname = ''
        return
    }

    if (nickname.length < 2) {
        errors.value.nickname = '昵称至少需要2个字符'
        return
    }

    errors.value.nickname = ''

    // 防抖：500ms 后检查昵称
    checkTimer = setTimeout(() => {
        checkNicknameExists(nickname)
    }, 500)
}

// 表单验证
const handleNicknameBlur = () => {
    focused.value.nickname = false
    // 如果昵称已经验证通过，不需要重新验证
    if (nicknameValid.value) {
        return true
    }
    // 否则触发输入验证
    handleNicknameInput()
    // 返回验证结果
    return nicknameValid.value && !errors.value.nickname
}

const handlePasswordBlur = () => {
    focused.value.password = false
    const password = formData.value.password
    if (!password) {
        errors.value.password = '请输入密码'
        return false
    }
    if (password.length < 6) {
        errors.value.password = '密码至少需要6位'
        return false
    }
    errors.value.password = ''

    // 如果确认密码已填写，重新验证
    if (formData.value.confirmPassword) {
        handleConfirmPasswordBlur()
    }
    return true
}

const handleConfirmPasswordBlur = () => {
    focused.value.confirmPassword = false
    const { password, confirmPassword } = formData.value

    if (!confirmPassword) {
        errors.value.confirmPassword = '请确认密码'
        return false
    }

    if (password !== confirmPassword) {
        errors.value.confirmPassword = '两次输入的密码不一致'
        return false
    }

    errors.value.confirmPassword = ''
    return true
}

const handleLabNameBlur = () => {
    focused.value.labName = false
    // 新的实验室选择通过下拉框处理
    return !!formData.value.labName
}

// 表单是否有效
const isFormValid = computed(() => {
    return (
        formData.value.nickname &&
        formData.value.password &&
        formData.value.confirmPassword &&
        formData.value.labName &&
        !errors.value.nickname &&
        !errors.value.password &&
        !errors.value.confirmPassword &&
        !errors.value.labName &&
        nicknameValid.value
    )
})

// 切换密码显示
const togglePassword = () => {
    showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
    showConfirmPassword.value = !showConfirmPassword.value
}

// 注册处理
const handleRegister = async () => {
    console.log('开始注册流程')
    console.log('表单数据:', formData.value)
    console.log('错误信息:', errors.value)
    console.log('昵称验证状态:', nicknameValid.value)

    // 清除所有之前的错误提示
    errors.value.nickname = ''
    errors.value.password = ''
    errors.value.confirmPassword = ''
    errors.value.labName = ''

    // 触发所有验证
    const isNicknameValid = handleNicknameBlur()
    const isPasswordValid = handlePasswordBlur()
    const isConfirmPasswordValid = handleConfirmPasswordBlur()
    const isLabNameValid = handleLabNameBlur()

    console.log('验证结果:', {
        isNicknameValid,
        isPasswordValid,
        isConfirmPasswordValid,
        isLabNameValid
    })

    if (
        !isNicknameValid ||
        !isPasswordValid ||
        !isConfirmPasswordValid ||
        !isLabNameValid
    ) {
        console.log('验证失败，退出注册流程')
        console.log('当前错误:', errors.value)
        // 显示第一个错误提示
        if (errors.value.nickname) {
            Taro.showToast({ title: errors.value.nickname, icon: 'none' })
        } else if (errors.value.password) {
            Taro.showToast({ title: errors.value.password, icon: 'none' })
        } else if (errors.value.confirmPassword) {
            Taro.showToast({
                title: errors.value.confirmPassword,
                icon: 'none'
            })
        } else if (errors.value.labName) {
            Taro.showToast({ title: errors.value.labName, icon: 'none' })
        }
        return
    }

    if (loading.value) {
        console.log('正在加载中，退出注册流程')
        return
    }

    loading.value = true
    loadingText.value = '注册中...'

    try {
        console.log('发送注册请求到:', userApi.register)
        const res = await Taro.request({
            url: userApi.register,
            method: 'POST',
            data: {
                nickName: formData.value.nickname,
                password: formData.value.password,
                labName: formData.value.labName.trim()
            },
            header: {
                'Content-Type': 'application/json'
            }
        })

        console.log('注册响应:', res)

        // 检查 HTTP 状态码
        if (res.statusCode === 200) {
            // 检查业务状态码
            if (res.data && res.data.errCode === '0') {
                Taro.showToast({
                    title: '注册成功',
                    icon: 'success',
                    duration: 1500
                })
                setTimeout(() => {
                    Taro.navigateTo({
                        url: '/pages/profile/login/login'
                    })
                }, 1500)
            } else {
                // 业务逻辑错误
                console.error('注册失败:', res.data)

                // 处理昵称已存在的错误
                if (res.data.errCode === '10001') {
                    errors.value.nickname = '该昵称已被使用，请更换'
                    nicknameValid.value = false
                }

                Taro.showToast({
                    title: res.data.errorInfo || '注册失败，请重试',
                    icon: 'none',
                    duration: 2000
                })
            }
        } else {
            // HTTP 错误
            const errorMsg = res.data?.errorInfo || `注册失败(未知错误)`
            Taro.showToast({
                title: errorMsg,
                icon: 'none',
                duration: 2000
            })
        }
    } catch (error) {
        console.error('网络请求失败:', error)
        Taro.showToast({
            title: '网络连接失败',
            icon: 'none',
            duration: 2000
        })
    } finally {
        loading.value = false
        loadingText.value = '注册'
    }
}

// 返回登录
const handleLogin = () => {
    Taro.navigateTo({
        url: '/pages/profile/login/login'
    })
}

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
    formData.value.labName = lab.labName
    showLabDropdown.value = false
    focused.value.labName = false
    errors.value.labName = ''
}

// 跳转到创建实验室页面
const goToCreateLab = () => {
    showLabDropdown.value = false
    Taro.navigateTo({
        url: '/pages/profile/create-lab/create-lab?from=register'
    })
}

// 页面加载时检查是否从实验室创建页面返回
onMounted(() => {
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params

    // 如果是从实验室创建页面返回，检查是否创建了新实验室
    if (params?.from === 'laboratory' || params?.created === 'true') {
        const newLabName = Taro.getStorageSync('newlyCreatedLab')
        if (newLabName) {
            // 自动填充新创建的实验室
            selectedLab.value = {
                labName: newLabName,
                university:
                    Taro.getStorageSync('newlyCreatedLabUniversity') || ''
            }
            formData.value.labName = newLabName
            // 清除临时存储
            Taro.removeStorageSync('newlyCreatedLab')
            Taro.removeStorageSync('newlyCreatedLabUniversity')
        }
    }
})

// 页面显示时检查是否有新创建的实验室
useDidShow(() => {
    const newLabName = Taro.getStorageSync('newlyCreatedLab')
    if (newLabName) {
        const newUniversity =
            Taro.getStorageSync('newlyCreatedLabUniversity') || ''

        // 重新加载实验室列表
        loadLabList().then(() => {
            // 查找新创建的实验室在列表中的位置
            const newLab = labList.value.find(
                (lab) => lab.labName === newLabName
            )

            if (newLab) {
                // 自动选择新创建的实验室
                selectedLab.value = newLab
                formData.value.labName = newLabName
            } else {
                // 如果列表中没有，手动添加
                const labToAdd = {
                    labName: newLabName,
                    university: newUniversity
                }
                labList.value.unshift(labToAdd)
                selectedLab.value = labToAdd
                formData.value.labName = newLabName
            }

            // 清除临时存储
            Taro.removeStorageSync('newlyCreatedLab')
            Taro.removeStorageSync('newlyCreatedLabUniversity')
        })
    }
})
</script>
