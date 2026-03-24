<template>
    <view class="setting-page">
        <!-- 头像设置 -->
        <view class="setting-section">
            <view class="setting-item avatar-item">
                <text class="item-label">头像</text>
                <button
                    class="avatar-wrapper"
                    open-type="chooseAvatar"
                    @chooseavatar="onChooseAvatar"
                >
                    <image
                        v-if="formData.avatar"
                        :src="formData.avatar"
                        class="avatar-preview"
                        mode="aspectFill"
                    />
                    <view v-else class="avatar-placeholder">
                        <text class="avatar-icon">📷</text>
                        <text class="avatar-text">选择头像</text>
                    </view>
                    <text class="avatar-action">{{
                        formData.avatar ? '更换' : '选择'
                    }}</text>
                </button>
            </view>
        </view>

        <!-- 基本信息 -->
        <view class="setting-section">
            <!-- 用户名 -->
            <view class="setting-item">
                <text class="item-label">用户名</text>
                <text class="item-value">{{
                    formData.nickName || '未设置'
                }}</text>
            </view>

            <!-- 真实姓名 -->
            <view class="setting-item">
                <text class="item-label"
                    >真实姓名 <text class="required">*</text></text
                >
                <input
                    v-model="formData.realName"
                    class="item-input"
                    placeholder="请输入真实姓名"
                    maxlength="50"
                    @blur="handleFieldBlur('realName')"
                />
            </view>

            <!-- 手机号 -->
            <view class="setting-item">
                <text class="item-label"
                    >手机号 <text class="required">*</text></text
                >
                <input
                    v-model="formData.phone"
                    type="number"
                    class="item-input"
                    placeholder="请输入手机号"
                    maxlength="11"
                    @blur="handleFieldBlur('phone')"
                />
            </view>

            <!-- 邮箱 -->
            <view class="setting-item">
                <text class="item-label"
                    >邮箱 <text class="required">*</text></text
                >
                <input
                    v-model="formData.email"
                    class="item-input"
                    placeholder="请输入邮箱"
                    @blur="handleFieldBlur('email')"
                />
            </view>

            <!-- 角色 -->
            <view class="setting-item">
                <text class="item-label">角色</text>
                <text class="item-value role-badge">{{ roleText }}</text>
            </view>

            <!-- 注册时间 -->
            <view class="setting-item">
                <text class="item-label">注册时间</text>
                <text class="item-value">{{
                    formatDate(formData.createdAt)
                }}</text>
            </view>

            <!-- 最后登录 -->
            <view class="setting-item">
                <text class="item-label">最后登录</text>
                <text class="item-value">{{
                    formatDate(formData.lastLogin)
                }}</text>
            </view>
        </view>

        <!-- 修改密码 -->
        <view class="setting-section">
            <view class="setting-item action-item" @tap="handleChangePassword">
                <text class="item-label">修改密码</text>
                <text class="item-arrow">›</text>
            </view>
        </view>

        <!-- 按钮组 -->
        <view class="button-group">
            <view
                class="btn-primary"
                :class="{ 'btn-loading': loading }"
                @tap="handleSubmit"
            >
                <text v-if="!loading">保存设置</text>
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
import Taro from '@tarojs/taro'
import './setting.scss'
import userApi from '../../../api/userapi'

// 表单数据
const formData = reactive({
    avatar: '',
    nickName: '',
    realName: '',
    phone: '',
    email: '',
    role: '',
    status: '',
    createdAt: null,
    lastLogin: null
})

// 错误信息
const errorMessage = ref('')

// 加载状态
const loading = ref(false)

// 表单验证错误
const errors = reactive({
    realName: '',
    phone: '',
    email: ''
})

// 角色文本映射
const roleText = computed(() => {
    const roleMap = {
        admin: '管理员',
        manager: '管理者',
        user: '普通用户'
    }
    return roleMap[formData.role] || '未知'
})

// 格式化日期
const formatDate = (date) => {
    if (!date) return '未登录'
    const d = new Date(date)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(
        d.getHours()
    ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 字段失焦验证
const handleFieldBlur = (field) => {
    const value = formData[field]

    // 确保值是字符串类型
    const stringValue = value != null ? String(value) : ''

    switch (field) {
        case 'realName':
            if (!stringValue || !stringValue.trim()) {
                errors.realName = '请输入真实姓名'
                errorMessage.value = '请输入真实姓名'
            } else if (stringValue.length < 2) {
                errors.realName = '真实姓名至少2个字符'
                errorMessage.value = '真实姓名至少2个字符'
            } else if (stringValue.length > 50) {
                errors.realName = '真实姓名最多50个字符'
                errorMessage.value = '真实姓名最多50个字符'
            } else {
                errors.realName = ''
                errorMessage.value = ''
            }
            break

        case 'phone':
            if (!stringValue || !stringValue.trim()) {
                errors.phone = '请输入手机号'
                errorMessage.value = '请输入手机号'
            } else if (!/^1[3-9]\d{9}$/.test(stringValue)) {
                errors.phone = '手机号格式不正确'
                errorMessage.value = '手机号格式不正确'
            } else {
                errors.phone = ''
                errorMessage.value = ''
            }
            break

        case 'email':
            if (!stringValue || !stringValue.trim()) {
                errors.email = '请输入邮箱'
                errorMessage.value = '请输入邮箱'
            } else if (
                !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                    stringValue
                )
            ) {
                errors.email = '邮箱格式不正确'
                errorMessage.value = '邮箱格式不正确'
            } else {
                errors.email = ''
                errorMessage.value = ''
            }
            break
    }
}

// 选择头像 - 使用微信小程序新版头像选择
const onChooseAvatar = (e) => {
    const { avatarUrl } = e.detail
    console.log('选择的头像:', avatarUrl)

    // 显示预览
    formData.avatar = avatarUrl

    // 上传头像到服务器
    uploadAvatar(avatarUrl)
}

// 上传头像
const uploadAvatar = (filePath) => {
    Taro.showLoading({ title: '上传中...', mask: true })

    Taro.uploadFile({
        url: userApi.uploadAvatar,
        filePath: filePath,
        name: 'file',
        header: {
            Authorization: Taro.getStorageSync('token') || ''
        },
        success: (res) => {
            Taro.hideLoading()
            console.log('上传响应:', res)

            if (res.statusCode === 200) {
                try {
                    const data = JSON.parse(res.data)
                    if (data.errCode === '0' || data.code === '0') {
                        formData.avatar =
                            data.data?.url || data.data?.path || filePath
                        console.log('头像上传成功，旧头像已删除:', formData.avatar)
                        Taro.showToast({
                            title: '头像更新成功',
                            icon: 'success'
                        })
                    } else {
                        throw new Error(
                            data.errorInfo || data.message || '上传失败'
                        )
                    }
                } catch (e) {
                    console.error('解析失败:', e)
                    Taro.showToast({
                        title: '上传失败：数据解析错误',
                        icon: 'none'
                    })
                }
            } else {
                Taro.showToast({
                    title: `上传失败(${res.statusCode})`,
                    icon: 'none'
                })
            }
        },
        fail: (err) => {
            Taro.hideLoading()
            console.error('上传失败:', err)
            Taro.showToast({
                title: '头像上传失败，请重试',
                icon: 'none'
            })
        }
    })
}

// 修改密码
const handleChangePassword = () => {
    Taro.showToast({
        title: '修改密码功能开发中',
        icon: 'none'
    })
    // TODO: 实现修改密码页面
    // Taro.navigateTo({
    //     url: '/pages/change-password/change-password'
    // })
}

// 提交表单
const handleSubmit = () => {
    // 验证所有字段
    handleFieldBlur('realName')
    handleFieldBlur('phone')
    handleFieldBlur('email')

    // 检查是否有错误
    if (errors.realName || errors.phone || errors.email) {
        return
    }

    loading.value = true
    const userId = Taro.getStorageSync('user_id')

    Taro.request({
        url: userApi.updateProfile,
        method: 'POST',
        header: {
            Authorization: Taro.getStorageSync('token')
        },
        data: {
            _id: userId,
            avatar: formData.avatar,
            realName: formData.realName,
            phone: formData.phone,
            email: formData.email
        },
        success: (res) => {
            loading.value = false
            if (res.statusCode === 200) {
                const data = res.data

                if (data.errCode === '0' || data.code === '0') {
                    // 更新本地存储
                    const updatedUserInfo = {
                        ...formData,
                        ...data.data
                    }
                    Taro.setStorageSync('userInfo', updatedUserInfo)

                    Taro.showToast({
                        title: '保存成功',
                        icon: 'success'
                    })

                    setTimeout(() => {
                        Taro.switchTab({
                            url: '/pages/profile/profile'
                        })
                    }, 1500)
                } else {
                    throw new Error(
                        data.errorInfo || data.message || '保存失败'
                    )
                }
            }
        },
        fail: (err) => {
            loading.value = false
            console.error('保存失败:', err)
            Taro.showToast({
                title: err.errMsg || '保存失败',
                icon: 'none'
            })
        }
    })
}

// 重置表单
const handleReset = () => {
    const userInfo = Taro.getStorageSync('userInfo')
    if (userInfo) {
        Object.assign(formData, {
            avatar: userInfo.avatar || '',
            realName: userInfo.realName || '',
            phone: userInfo.phone || '',
            email: userInfo.email || ''
        })
    }

    // 清空错误
    errors.realName = ''
    errors.phone = ''
    errors.email = ''
    errorMessage.value = ''

    Taro.showToast({
        title: '已重置',
        icon: 'success'
    })
}

// 获取用户信息
onMounted(() => {
    const userInfo = Taro.getStorageSync('userInfo')
    if (userInfo) {
        Object.assign(formData, {
            avatar: userInfo.avatar || '',
            nickName: userInfo.nickName || '',
            realName: userInfo.realName || '',
            phone: userInfo.phone || '',
            email: userInfo.email || '',
            role: userInfo.role || 'user',
            status: userInfo.status || 'active',
            createdAt: userInfo.createdAt || null,
            lastLogin: userInfo.lastLogin || null
        })
    }
})
</script>
