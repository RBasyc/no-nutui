<template>
    <view class="laboratory-page">
        <!-- 当前实验室卡片 -->
        <view class="current-lab-card">
            <view class="card-header">
                <text class="header-title">当前实验室</text>
                <text v-if="!currentLab" class="no-lab-hint">未加入实验室</text>
            </view>
            <view v-if="currentLab" class="lab-info">
                <view class="lab-main">
                    <text class="lab-name">{{ currentLab.labName }}</text>
                    <text class="lab-university">{{ currentLab.university }}</text>
                </view>
                <view class="lab-role-badge" :class="`role-${currentLab.role}`">
                    <text>{{ getRoleText(currentLab.role) }}</text>
                </view>
            </view>
        </view>

        <!-- 我加入的实验室列表 -->
        <view class="my-labs-section">
            <view class="section-header">
                <text class="section-title">我加入的实验室</text>
                <text v-if="myLabs.length > 0" class="lab-count">{{ myLabs.length }}个</text>
            </view>

            <!-- 实验室列表 -->
            <view v-if="loadingMyLabs" class="loading-container">
                <text class="loading-text">加载中...</text>
            </view>
            <view v-else-if="myLabs.length === 0" class="empty-state">
                <text class="empty-icon">🔬</text>
                <text class="empty-text">还未加入任何实验室</text>
                <text class="empty-hint">搜索并申请加入实验室</text>
            </view>
            <view v-else class="lab-list">
                <view
                    v-for="lab in myLabs"
                    :key="lab.id"
                    class="lab-item"
                    :class="{ 'is-current': lab.isActive }"
                >
                    <view class="lab-item-content">
                        <view class="lab-item-info">
                            <text class="lab-item-name">{{ lab.labName }}</text>
                            <text class="lab-item-university">{{ lab.university }}</text>
                        </view>
                        <view class="lab-item-status">
                            <view
                                class="status-badge"
                                :class="`status-${lab.status}`"
                            >
                                <text>{{ getStatusText(lab.status) }}</text>
                            </view>
                            <view
                                v-if="lab.isActive"
                                class="role-badge"
                                :class="`role-${lab.role}`"
                            >
                                <text>{{ getRoleText(lab.role) }}</text>
                            </view>
                        </view>
                    </view>
                    <view class="lab-item-actions">
                        <text v-if="lab.isActive" class="current-badge"
                            >当前使用</text
                        >
                        <view
                            v-else-if="lab.status === 'active'"
                            class="action-btn btn-switch"
                            @tap="switchLab(lab)"
                        >
                            <text>切换</text>
                        </view>
                        <view
                            v-if="lab.status === 'pending'"
                            class="action-btn btn-cancel"
                            @tap="cancelApplication(lab)"
                        >
                            <text>取消申请</text>
                        </view>
                        <view
                            v-if="lab.status === 'active' && !lab.isActive"
                            class="action-btn btn-leave"
                            @tap="leaveLab(lab)"
                        >
                            <text>离开</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 浏览实验室 -->
        <view class="search-section">
            <view class="section-header">
                <text class="section-title">浏览实验室</text>
            </view>

            <!-- 搜索框 -->
            <view class="search-wrapper">
                <view
                    class="search-input-wrapper"
                    :class="{ 'input-focused': showLabList }"
                >
                    <text class="search-icon">🔬</text>
                    <input
                        v-model="searchKeyword"
                        class="search-input"
                        placeholder="搜索实验室名称或大学..."
                        @focus="handleSearchFocus"
                        @input="handleSearchInput"
                    />
                    <text v-if="searchKeyword" class="clear-btn" @tap="clearSearch">
                        ✕
                    </text>
                </view>

                <!-- 选中的实验室信息 -->
                <view v-if="selectedLab" class="selected-lab-info">
                    <view class="selected-lab-details">
                        <text class="selected-lab-name">{{
                            selectedLab.labName
                        }}</text>
                        <text class="selected-lab-university">{{
                            selectedLab.university
                        }}</text>
                    </view>
                    <view class="selected-lab-actions">
                        <view
                            v-if="isApplied(selectedLab._id)"
                            class="status-badge applied"
                        >
                            <text>已申请</text>
                        </view>
                        <view
                            v-else-if="isMember(selectedLab._id)"
                            class="status-badge member"
                        >
                            <text>已加入</text>
                        </view>
                        <view
                            v-else
                            class="action-btn btn-apply-main"
                            @tap="showApplyModal(selectedLab)"
                        >
                            <text>申请加入</text>
                        </view>
                    </view>
                </view>

                <!-- 实验室下拉列表 -->
                <view v-if="showLabList" class="lab-dropdown">
                    <!-- 加载状态 -->
                    <scroll-view
                        v-if="loadingLabs"
                        scrollY="true"
                        class="lab-list-scroll"
                    >
                        <view class="lab-item-dropdown">
                            <text class="loading-text">加载中...</text>
                        </view>
                    </scroll-view>

                    <!-- 实验室列表 -->
                    <scroll-view
                        v-else-if="filteredLabs.length > 0"
                        scrollY="true"
                        class="lab-list-scroll"
                    >
                        <view
                            v-for="lab in filteredLabs"
                            :key="lab._id"
                            class="lab-item-dropdown"
                            :class="{ 'is-selected': isSelectedLab(lab) }"
                            @tap="selectLab(lab)"
                        >
                            <view class="lab-info-dropdown">
                                <text class="lab-name-dropdown">{{
                                    lab.labName
                                }}</text>
                                <text class="lab-university-dropdown">{{
                                    lab.university
                                }}</text>
                            </view>
                            <view class="lab-selection-indicator">
                                <view
                                    v-if="isSelectedLab(lab)"
                                    class="check-icon"
                                >
                                    ✓
                                </view>
                            </view>
                        </view>
                    </scroll-view>

                    <!-- 空状态 -->
                    <view v-else class="lab-no-result">
                        <text class="no-result-text">未找到匹配的实验室</text>
                    </view>

                    <!-- 创建新实验室入口 -->
                    <view class="lab-create-link" @tap="goToCreateLab">
                        <text class="create-icon">➕</text>
                        <text class="create-text"
                            >没有找到？创建新实验室</text
                        >
                    </view>
                </view>
            </view>
        </view>

        <!-- 申请加入弹窗 -->
        <view v-if="isApplyModalVisible" class="modal-overlay" @tap="hideApplyModal">
            <view class="modal-content" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">申请加入实验室</text>
                    <view class="modal-close" @tap="hideApplyModal">
                        <text>✕</text>
                    </view>
                </view>
                <view class="modal-body">
                    <view class="apply-lab-info">
                        <text class="apply-lab-name">{{
                            selectedLabForApply?.labName
                        }}</text>
                        <text class="apply-lab-university">{{
                            selectedLabForApply?.university
                        }}</text>
                    </view>
                    <view class="form-item">
                        <text class="form-label">申请理由</text>
                        <textarea
                            v-model="applyReason"
                            class="form-textarea"
                            placeholder="请简要说明申请理由（选填）"
                            maxlength="500"
                        />
                        <text class="char-count">{{ applyReason.length }}/500</text>
                    </view>
                </view>
                <view class="modal-footer">
                    <view class="modal-btn btn-cancel" @tap="hideApplyModal">
                        <text>取消</text>
                    </view>
                    <view
                        class="modal-btn btn-confirm"
                        :class="{ 'btn-loading': submittingApply }"
                        @tap="submitApply"
                    >
                        <text v-if="!submittingApply">提交申请</text>
                        <view v-else class="loading-spinner"></view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 离开实验室确认弹窗 -->
        <view
            v-if="isLeaveModalVisible"
            class="modal-overlay"
            @tap="hideLeaveModal"
        >
            <view class="modal-content" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">确认离开实验室</text>
                    <view class="modal-close" @tap="hideLeaveModal">
                        <text>✕</text>
                    </view>
                </view>
                <view class="modal-body">
                    <view class="leave-warning">
                        <text class="warning-icon">⚠️</text>
                        <text class="warning-text"
                            >确定要离开「{{ labToLeave?.labName }}」吗？</text
                        >
                    </view>
                    <text class="leave-hint"
                        >离开后将无法访问该实验室的数据</text
                    >
                </view>
                <view class="modal-footer">
                    <view class="modal-btn btn-cancel" @tap="hideLeaveModal">
                        <text>取消</text>
                    </view>
                    <view
                        class="modal-btn btn-confirm btn-danger"
                        :class="{ 'btn-loading': leavingLab }"
                        @tap="confirmLeave"
                    >
                        <text v-if="!leavingLab">确认离开</text>
                        <view v-else class="loading-spinner"></view>
                    </view>
                </view>
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
import Taro, { useDidShow } from '@tarojs/taro'
import labApi from '../../../api/labapi'
import labMemberApi from '../../../api/labMemberApi'
import './laboratory.scss'

// 当前实验室
const currentLab = ref(null)

// 我的实验室列表
const myLabs = ref([])
const loadingMyLabs = ref(false)

// 可用实验室列表
const availableLabs = ref([])
const filteredLabs = ref([])
const showLabList = ref(false)
const loadingLabs = ref(false)
const searchKeyword = ref('')
const selectedLab = ref(null)

// 申请相关
const isApplyModalVisible = ref(false)
const selectedLabForApply = ref(null)
const applyReason = ref('')
const submittingApply = ref(false)

// 离开实验室相关
const isLeaveModalVisible = ref(false)
const labToLeave = ref(null)
const leavingLab = ref(false)

// 错误信息
const errorMessage = ref('')

// 获取角色文本
const getRoleText = (role) => {
    const roleMap = {
        admin: '管理员',
        member: '成员',
        pending: '待审批'
    }
    return roleMap[role] || '未知'
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        pending: '待审批',
        active: '已加入',
        rejected: '已拒绝',
        left: '已离开'
    }
    return statusMap[status] || '未知'
}

// 检查是否已申请
const isApplied = (labId) => {
    return myLabs.value.some(
        (lab) => lab.labId === labId && lab.status === 'pending'
    )
}

// 检查是否已加入
const isMember = (labId) => {
    return myLabs.value.some(
        (lab) => lab.labId === labId && lab.status === 'active'
    )
}

// 加载我的实验室
const loadMyLabs = async () => {
    if (loadingMyLabs.value) return

    loadingMyLabs.value = true
    errorMessage.value = ''

    try {
        const res = await Taro.request({
            url: labMemberApi.myLabs,
            method: 'GET',
            header: {
                Authorization: Taro.getStorageSync('token') || ''
            }
        })

        if (res.statusCode === 200 && res.data?.errCode === '0') {
            const items = res.data.data?.items || []
            myLabs.value = items

            // 设置当前实验室
            const activeLab = items.find((lab) => lab.isActive)
            if (activeLab) {
                currentLab.value = activeLab
                // 保存到本地存储
                Taro.setStorageSync('currentLabId', activeLab.labId)
                Taro.setStorageSync('currentLabName', activeLab.labName)
            } else {
                currentLab.value = null
            }
        } else {
            throw new Error(res.data?.errorInfo || '加载失败')
        }
    } catch (error) {
        console.error('加载我的实验室失败:', error)
        errorMessage.value = error.message || '加载失败'
        myLabs.value = []
        currentLab.value = null
    } finally {
        loadingMyLabs.value = false
    }
}

// 切换实验室列表显示
const toggleLabList = () => {
    showLabList.value = !showLabList.value
    if (showLabList.value && availableLabs.value.length === 0) {
        loadAvailableLabs()
    }
}

// 加载可用实验室列表
const loadAvailableLabs = async () => {
    if (loadingLabs.value) return

    loadingLabs.value = true

    try {
        const res = await Taro.request({
            url: labApi.list,
            method: 'GET',
            header: {
                Authorization: Taro.getStorageSync('token') || ''
            }
        })

        if (res.statusCode === 200 && res.data?.errCode === '0') {
            availableLabs.value = res.data.data || []
            filterLabs() // 加载后立即过滤
        } else {
            availableLabs.value = []
        }
    } catch (error) {
        console.error('加载实验室列表失败:', error)
        availableLabs.value = []
    } finally {
        loadingLabs.value = false
    }
}

// 搜索框聚焦
const handleSearchFocus = () => {
    showLabList.value = true
    if (availableLabs.value.length === 0) {
        loadAvailableLabs()
    } else {
        filterLabs()
    }
}

// 搜索输入
const handleSearchInput = () => {
    filterLabs()
}

// 过滤实验室
const filterLabs = () => {
    if (!searchKeyword.value.trim()) {
        filteredLabs.value = availableLabs.value
        return
    }

    const keyword = searchKeyword.value.toLowerCase()
    filteredLabs.value = availableLabs.value.filter(
        (lab) =>
            lab.labName.toLowerCase().includes(keyword) ||
            lab.university.toLowerCase().includes(keyword)
    )
}

// 清空搜索
const clearSearch = () => {
    searchKeyword.value = ''
    filterLabs()
}

// 选择实验室
const selectLab = (lab) => {
    selectedLab.value = lab
    showLabList.value = false
}

// 检查是否选中
const isSelectedLab = (lab) => {
    return selectedLab.value?._id === lab._id
}

// 切换实验室
const switchLab = async (lab) => {
    if (lab.isActive) return

    try {
        const res = await Taro.request({
            url: labMemberApi.currentLab(lab.labId),
            method: 'PUT',
            header: {
                Authorization: Taro.getStorageSync('token') || ''
            }
        })

        if (res.statusCode === 200 && res.data?.errCode === '0') {
            // 更新 token（从响应头或响应体中获取）
            const newToken = res.data.data?.token || res.header?.['Authorization'] || res.header?.['authorization']
            if (newToken) {
                Taro.setStorageSync('token', newToken)
            }

            // 更新用户信息中的实验室名称
            const userInfo = Taro.getStorageSync('userInfo') || {}
            if (res.data.data?.currentLabName) {
                userInfo.labName = res.data.data.currentLabName
                userInfo.laboratory = res.data.data.currentLabName
                Taro.setStorageSync('userInfo', userInfo)
            }

            // 更新当前实验室信息
            const currentLabName = res.data.data?.currentLabName || ''
            const currentLabId = res.data.data?.currentLabId || ''
            const currentLabRole = res.data.data?.role || ''

            Taro.setStorageSync('currentLabName', currentLabName)
            Taro.setStorageSync('currentLabId', currentLabId)
            Taro.setStorageSync('labName', currentLabName) // 兼容旧字段
            Taro.setStorageSync('currentLabRole', currentLabRole)

            // 清除所有相关缓存
            Taro.removeStorageSync('inventoryList')
            Taro.removeStorageSync('inventoryData')
            Taro.removeStorageSync('experimentPlanList')
            Taro.removeStorageSync('shareRequestList')

            // 清除协作页面刷新标志
            Taro.removeStorageSync('shouldRefreshCollaboration')

            Taro.showToast({
                title: '切换成功，正在加载数据...',
                icon: 'success',
                duration: 1500
            })

            // 重新加载列表
            await loadMyLabs()

            // 延迟后跳转到首页，确保数据加载
            setTimeout(() => {
                Taro.reLaunch({
                    url: '/pages/index/index'
                })
            }, 1500)
        } else {
            throw new Error(res.data?.errorInfo || '切换失败')
        }
    } catch (error) {
        console.error('切换实验室失败:', error)
        Taro.showToast({
            title: error.message || '切换失败',
            icon: 'none'
        })
    }
}

// 显示申请弹窗
const showApplyModal = (lab) => {
    // 检查是否已经申请过或已是成员
    if (isApplied(lab._id)) {
        Taro.showToast({
            title: '您已申请过该实验室，请等待审批',
            icon: 'none',
            duration: 2000
        })
        return
    }

    if (isMember(lab._id)) {
        Taro.showToast({
            title: '您已是该实验室成员',
            icon: 'none',
            duration: 2000
        })
        return
    }

    selectedLabForApply.value = lab
    applyReason.value = ''
    isApplyModalVisible.value = true
}

// 隐藏申请弹窗
const hideApplyModal = () => {
    isApplyModalVisible.value = false
    selectedLabForApply.value = null
    applyReason.value = ''
}

// 提交申请
const submitApply = async () => {
    if (!selectedLabForApply.value) return

    submittingApply.value = true

    try {
        const res = await Taro.request({
            url: labMemberApi.apply,
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                Authorization: Taro.getStorageSync('token') || ''
            },
            data: {
                labId: selectedLabForApply.value._id,
                reason: applyReason.value.trim()
            }
        })

        if (res.statusCode === 200 && res.data?.errCode === '0') {
            Taro.showToast({
                title: '申请已提交',
                icon: 'success'
            })

            hideApplyModal()
            // 重新加载列表
            await loadMyLabs()
        } else {
            // 处理重复申请的错误
            const errorMsg = res.data?.errorInfo || '申请失败'
            if (errorMsg.includes('duplicate key') || errorMsg.includes('E11000')) {
                throw new Error('您已经申请过该实验室，请勿重复申请')
            }
            throw new Error(errorMsg)
        }
    } catch (error) {
        console.error('申请加入失败:', error)
        Taro.showToast({
            title: error.message || '申请失败',
            icon: 'none',
            duration: 2500
        })
    } finally {
        submittingApply.value = false
    }
}

// 取消申请
const cancelApplication = async (lab) => {
    try {
        // 使用 leaveLab API 来取消申请（适用于 pending 状态）
        const res = await Taro.request({
            url: labMemberApi.leave(lab.labId),
            method: 'POST',
            header: {
                Authorization: Taro.getStorageSync('token') || ''
            }
        })

        if (res.statusCode === 200 && res.data?.errCode === '0') {
            Taro.showToast({
                title: '已取消申请',
                icon: 'success'
            })
            await loadMyLabs()
        } else {
            throw new Error(res.data?.errorInfo || '取消失败')
        }
    } catch (error) {
        console.error('取消申请失败:', error)
        Taro.showToast({
            title: error.message || '取消失败',
            icon: 'none'
        })
    }
}

// 显示离开确认弹窗
const showLeaveModal = (lab) => {
    labToLeave.value = lab
    isLeaveModalVisible.value = true
}

// 隐藏离开确认弹窗
const hideLeaveModal = () => {
    isLeaveModalVisible.value = false
    labToLeave.value = null
}

// 离开实验室
const leaveLab = async (lab) => {
    showLeaveModal(lab)
}

// 确认离开
const confirmLeave = async () => {
    if (!labToLeave.value) return

    leavingLab.value = true

    try {
        const res = await Taro.request({
            url: labMemberApi.leave(labToLeave.value.labId),
            method: 'POST',
            header: {
                Authorization: Taro.getStorageSync('token') || ''
            }
        })

        if (res.statusCode === 200 && res.data?.errCode === '0') {
            Taro.showToast({
                title: '已离开实验室',
                icon: 'success'
            })

            hideLeaveModal()
            // 重新加载列表
            await loadMyLabs()

            // 如果离开的是当前实验室，清除缓存
            if (labToLeave.value.isActive) {
                Taro.removeStorageSync('inventoryList')
                Taro.removeStorageSync('inventoryData')
            }
        } else {
            throw new Error(res.data?.errorInfo || '离开失败')
        }
    } catch (error) {
        console.error('离开实验室失败:', error)
        Taro.showToast({
            title: error.message || '离开失败',
            icon: 'none'
        })
    } finally {
        leavingLab.value = false
    }
}

// 跳转到创建实验室页面
const goToCreateLab = () => {
    Taro.navigateTo({
        url: '/pages/profile/create-lab/create-lab'
    })
}

// 页面加载
onMounted(() => {
    loadMyLabs()
})

// 页面显示时刷新（从其他页面返回时）
useDidShow(() => {
    loadMyLabs()
})
</script>
