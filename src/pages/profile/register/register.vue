<template>
    <view class="register-page">
        <!-- 注册容器 -->
        <view class="register-container">
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

                <!-- 手机号输入 -->
                <view class="form-group">
                    <text class="form-label">手机号</text>
                    <view
                        class="input-wrapper"
                        :class="{
                            'input-error': errors.phone,
                            'input-focused': focused.phone,
                            'input-success': phoneValid
                        }"
                    >
                        <text class="input-icon">📱</text>
                        <input
                            v-model="formData.phone"
                            type="tel"
                            placeholder="请输入手机号"
                            class="form-input"
                            :disabled="loading"
                            maxlength="11"
                            @focus="focused.phone = true"
                            @blur="handlePhoneBlur"
                            @input="handlePhoneInput"
                        />
                        <text
                            v-if="phoneValid && !checkingPhone"
                            class="success-icon"
                            >✓</text
                        >
                        <view
                            v-if="checkingPhone"
                            class="checking-icon"
                        ></view>
                    </view>
                    <text v-if="errors.phone" class="error-text">{{
                        errors.phone
                    }}</text>
                    <text
                        v-if="phoneValid && !checkingPhone"
                        class="success-text"
                        >手机号可用</text
                    >
                </view>

                <!-- 隐私协议勾选框 -->
                <view class="privacy-agreement">
                    <view
                        class="checkbox-wrapper"
                        @tap="togglePrivacyAgreement"
                    >
                        <view
                            class="checkbox"
                            :class="{ 'checkbox-checked': agreedToPrivacy }"
                        >
                            <text v-if="agreedToPrivacy" class="checkbox-icon">✓</text>
                        </view>
                        <text class="privacy-text">我已阅读并同意</text>
                    </view>
                    <view class="privacy-links">
                        <text class="privacy-link" @tap="showUserAgreement">《用户服务协议》</text>
                        <text class="privacy-link" @tap="showPrivacyPolicy">《隐私政策》</text>
                    </view>
                </view>
                <text v-if="errors.privacy" class="error-text privacy-error">{{
                    errors.privacy
                }}</text>

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
import { ref, computed } from 'vue'
import Taro from '@tarojs/taro'
import userApi from '../../../api/userapi'
import './register.scss'

// 表单数据
const formData = ref({
    nickname: '',
    phone: '',
    password: '',
    confirmPassword: ''
})

// 错误信息
const errors = ref({
    nickname: '',
    phone: '',
    password: '',
    confirmPassword: '',
    privacy: ''
})

// 焦点状态
const focused = ref({
    nickname: false,
    phone: false,
    password: false,
    confirmPassword: false
})

// 其他状态
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const checkingNickname = ref(false)
const checkingPhone = ref(false)
const nicknameValid = ref(false)
const phoneValid = ref(false)
const loadingText = ref('注册')
const agreedToPrivacy = ref(false) // 隐私协议同意状态

// 昵称和手机号检查定时器
let checkTimer = null
let phoneCheckTimer = null

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

// 检查手机号是否存在
const checkPhoneExists = async (phone) => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        phoneValid.value = false
        return
    }

    checkingPhone.value = true
    errors.value.phone = ''

    try {
        const res = await Taro.request({
            url: userApi.checkPhone,
            method: 'GET',
            data: { phone }
        })

        if (res.statusCode === 200 && res.data) {
            if (res.data.errCode === '0') {
                // 手机号可用
                phoneValid.value = true
                errors.value.phone = ''
            } else if (res.data.errCode === '10002') {
                // 手机号已存在
                phoneValid.value = false
                errors.value.phone = '该手机号已被注册，请更换'
            }
        }
    } catch (error) {
        console.error('检查手机号失败:', error)
    } finally {
        checkingPhone.value = false
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

// 手机号输入处理（带防抖）
const handlePhoneInput = () => {
    // 清除之前的定时器
    if (phoneCheckTimer) {
        clearTimeout(phoneCheckTimer)
    }

    phoneValid.value = false

    const phoneValue = formData.value.phone
    const phone = phoneValue ? String(phoneValue).trim() : ''

    if (!phone) {
        errors.value.phone = ''
        return
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
        errors.value.phone = '请输入正确的手机号格式'
        return
    }

    errors.value.phone = ''

    // 防抖：500ms 后检查手机号
    phoneCheckTimer = setTimeout(() => {
        checkPhoneExists(phone)
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

const handlePhoneBlur = () => {
    focused.value.phone = false
    // 如果手机号已经验证通过，不需要重新验证
    if (phoneValid.value) {
        return true
    }
    // 否则触发输入验证
    handlePhoneInput()
    // 返回验证结果
    return phoneValid.value && !errors.value.phone
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

// 表单是否有效
const isFormValid = computed(() => {
    return (
        formData.value.nickname &&
        formData.value.phone &&
        formData.value.password &&
        formData.value.confirmPassword &&
        !errors.value.nickname &&
        !errors.value.phone &&
        !errors.value.password &&
        !errors.value.confirmPassword &&
        !errors.value.privacy &&
        nicknameValid.value &&
        phoneValid.value &&
        agreedToPrivacy.value
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
    console.log('手机号验证状态:', phoneValid.value)

    // 清除所有之前的错误提示
    errors.value.nickname = ''
    errors.value.phone = ''
    errors.value.password = ''
    errors.value.confirmPassword = ''

    // 触发所有验证
    const isNicknameValid = handleNicknameBlur()
    const isPhoneValid = handlePhoneBlur()
    const isPasswordValid = handlePasswordBlur()
    const isConfirmPasswordValid = handleConfirmPasswordBlur()

    // 检查隐私协议
    if (!agreedToPrivacy.value) {
        errors.value.privacy = "请阅读并同意隐私协议"
        Taro.showToast({
            title: "请阅读并同意隐私协议",
            icon: "none"
        })
        return
    }


    console.log('验证结果:', {
        isNicknameValid,
        isPhoneValid,
        isPasswordValid,
        isConfirmPasswordValid
    })

    if (
        !isNicknameValid ||
        !isPhoneValid ||
        !isPasswordValid ||
        !isConfirmPasswordValid
    ) {
        console.log('验证失败，退出注册流程')
        console.log('当前错误:', errors.value)
        // 显示第一个错误提示
        if (errors.value.nickname) {
            Taro.showToast({ title: errors.value.nickname, icon: 'none' })
        } else if (errors.value.phone) {
            Taro.showToast({ title: errors.value.phone, icon: 'none' })
        } else if (errors.value.password) {
            Taro.showToast({ title: errors.value.password, icon: 'none' })
        } else if (errors.value.confirmPassword) {
            Taro.showToast({
                title: errors.value.confirmPassword,
                icon: 'none'
            })
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
                phone: formData.value.phone,
                password: formData.value.password
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

                // 处理昵称或手机号已存在的错误
                if (res.data.errCode === '10001') {
                    const errorInfo = res.data.errorInfo || ''
                    if (errorInfo.includes('手机号')) {
                        errors.value.phone = '该手机号已被使用，请更换'
                        phoneValid.value = false
                    } else {
                        errors.value.nickname = '该昵称已被使用，请更换'
                        nicknameValid.value = false
                    }
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
// 切换隐私协议同意状态
const togglePrivacyAgreement = () => {
    agreedToPrivacy.value = !agreedToPrivacy.value
    if (agreedToPrivacy.value) {
        errors.value.privacy = ''
    }
}

// 显示用户服务协议
const showUserAgreement = () => {
    Taro.showModal({
        title: '用户服务协议',
        content: `欢迎使用 Lab 智管！

1. 服务说明
本应用提供实验室库存管理、数据分析等智能管理服务。

2. 用户信息收集
我们仅在您授权的情况下收集以下信息：
- 昵称：用于个性化展示
- 手机号：用于账号注册和身份验证
- 密码：加密存储用于身份验证

3. 信息使用
收集的信息仅用于：
- 账号注册和身份验证
- 提供个性化服务体验
- 改进产品和服务质量

4. 信息保护
我们采取安全措施保护您的个人信息：
- 密码加密存储
- 数据传输加密
- 严格的数据访问控制

5. 信息共享
未经您的同意，我们不会与第三方共享您的个人信息。

6. 您的权利
- 查询、更正、删除个人信息
- 撤销同意
- 注销账号

7. 联系我们
如有疑问，请通过应用内反馈功能联系我们。`,
        showCancel: false,
        confirmText: '我已阅读'
    })
}

// 显示隐私政策
const showPrivacyPolicy = () => {
    Taro.showModal({
        title: '隐私政策',
        content: `Lab 智管隐私政策

生效日期：2024年1月1日

1. 信息收集
我们收集您主动提供的信息：
- 注册信息（昵称、手机号、密码）
- 设备信息（设备型号、操作系统版本）
- 使用数据（操作日志、功能使用情况）

2. 信息使用
收集的信息用于：
- 提供核心功能服务
- 账号安全验证
- 产品优化和数据分析
- 防止欺诈和滥用

3. 信息存储
您的个人信息存储在安全的服务器中，我们采取合理的技术措施保护数据安全。

4. 信息共享
我们不会出售、出租或以其他方式披露您的个人信息，除非：
- 获得您的明确同意
- 法律法规要求
- 保护用户或公众的合法权益

5. Cookie使用
我们使用Cookie和类似技术来改善用户体验。

6. 您的权利
- 访问和修改个人信息
- 删除账号和相关信息
- 撤销授权
- 举报投诉

7. 未成年人保护
我们的服务主要面向成年用户。如您未满18岁，请在监护人陪同下使用。

8. 政策更新
我们可能会不时更新本隐私政策。更新后会在应用内公示。

9. 联系我们
如有任何隐私相关问题，请联系我们。`,
        showCancel: false,
        confirmText: '我已阅读'
    })
}

const handleLogin = () => {
    Taro.navigateTo({
        url: '/pages/profile/login/login'
    })
}
</script>
