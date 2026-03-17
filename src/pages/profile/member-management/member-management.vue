<template>
    <view class="member-management-page">
        <!-- 页面标题 -->
        <view class="page-header">
            <text class="page-title">实验室成员管理</text>
        </view>

        <!-- 标签切换 -->
        <view class="tab-bar">
            <view
                v-for="tab in tabs"
                :key="tab.value"
                :class="['tab-item', { active: activeTab === tab.value }]"
                @tap="switchTab(tab.value)"
            >
                <text class="tab-text">{{ tab.label }}</text>
                <text v-if="tab.count > 0" class="tab-count">({{ tab.count }})</text>
            </view>
        </view>

        <!-- 成员列表 -->
        <scroll-view scrollY class="members-scroll">
            <view v-for="member in members" :key="member.id" class="member-item">
                <view class="member-info">
                    <image class="member-avatar" :src="member.userAvatar || '/assets/default-avatar.png'" />
                    <view class="member-details">
                        <text class="member-name">{{ member.userName }}</text>
                        <text class="member-role">{{ getRoleText(member.role) }}</text>
                        <text v-if="member.applicationReason && activeTab === 'pending'" class="apply-reason">
                            申请理由: {{ member.applicationReason }}
                        </text>
                    </view>
                </view>

                <view class="member-actions">
                    <!-- 待审批操作 -->
                    <template v-if="activeTab === 'pending'">
                        <view class="btn btn-primary" @tap="approveMember(member)">
                            <text>通过</text>
                        </view>
                        <view class="btn btn-danger" @tap="rejectMember(member)">
                            <text>拒绝</text>
                        </view>
                    </template>

                    <!-- 正式成员操作 -->
                    <template v-if="activeTab === 'active'">
                        <picker
                            mode="selector"
                            :range="roleOptions"
                            @change="onRoleChange($event, member)"
                        >
                            <view class="btn btn-secondary">
                                <text>修改角色</text>
                            </view>
                        </picker>
                        <view class="btn btn-danger" @tap="removeMember(member)">
                            <text>移除</text>
                        </view>
                    </template>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-if="members.length === 0 && !loading" class="empty-state">
                <text class="empty-icon">👥</text>
                <text class="empty-text">{{ getEmptyText() }}</text>
            </view>

            <!-- 加载状态 -->
            <view v-if="loading" class="loading-state">
                <text class="loading-text">加载中...</text>
            </view>
        </scroll-view>

        <!-- 查看日志按钮 -->
        <view class="logs-btn-wrapper">
            <view class="btn btn-secondary logs-btn" @tap="viewLogs">
                <text>查看操作日志</text>
            </view>
        </view>

        <!-- 审批弹窗 -->
        <view v-if="showApproveModal" class="modal-overlay" @tap="hideApproveModal">
            <view class="modal-content" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">审批通过申请</text>
                    <view class="modal-close" @tap="hideApproveModal">✕</view>
                </view>

                <view class="modal-body">
                    <view class="member-summary">
                        <text class="summary-name">{{ selectedMember?.userName }}</text>
                        <text v-if="selectedMember?.applicationReason" class="summary-reason">
                            {{ selectedMember.applicationReason }}
                        </text>
                    </view>

                    <view class="form-item">
                        <text class="form-label">分配角色</text>
                        <radio-group @change="onRoleSelect">
                            <label class="radio-item" v-for="role in roleOptions" :key="role">
                                <radio :value="role" :checked="selectedRole === role" />
                                <text class="radio-text">{{ getRoleText(role) }}</text>
                            </label>
                        </radio-group>
                    </view>
                </view>

                <view class="modal-footer">
                    <view class="btn btn-secondary" @tap="hideApproveModal">
                        <text>取消</text>
                    </view>
                    <view
                        class="btn btn-primary"
                        :class="{ 'btn-loading': approving }"
                        @tap="confirmApprove"
                    >
                        <text v-if="!approving">确认通过</text>
                        <view v-else class="loading-spinner"></view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 拒绝弹窗 -->
        <view v-if="showRejectModal" class="modal-overlay" @tap="hideRejectModal">
            <view class="modal-content" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">拒绝申请</text>
                    <view class="modal-close" @tap="hideRejectModal">✕</view>
                </view>

                <view class="modal-body">
                    <view class="member-summary">
                        <text class="summary-name">{{ selectedMember?.userName }}</text>
                    </view>

                    <view class="form-item">
                        <text class="form-label">拒绝理由</text>
                        <textarea
                            v-model="rejectReason"
                            class="form-textarea"
                            placeholder="请输入拒绝理由（可选）"
                            maxlength="500"
                        />
                        <text class="char-count">{{ rejectReason.length }}/500</text>
                    </view>
                </view>

                <view class="modal-footer">
                    <view class="btn btn-secondary" @tap="hideRejectModal">
                        <text>取消</text>
                    </view>
                    <view
                        class="btn btn-danger"
                        :class="{ 'btn-loading': rejecting }"
                        @tap="confirmReject"
                    >
                        <text v-if="!rejecting">确认拒绝</text>
                        <view v-else class="loading-spinner"></view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import labMemberApi from '../../../api/labMemberApi'

// 状态管理
const activeTab = ref('pending')
const tabs = reactive([
    { value: 'pending', label: '待审批', count: 0 },
    { value: 'active', label: '正式成员', count: 0 }
])

const members = ref([])
const loading = ref(false)

const showApproveModal = ref(false)
const showRejectModal = ref(false)
const selectedMember = ref(null)
const selectedRole = ref('member')
const rejectReason = ref('')
const approving = ref(false)
const rejecting = ref(false)

const roleOptions = ['admin', 'member']

// 从页面参数获取实验室ID
const labId = ref('')

// 获取角色文本
const getRoleText = (role) => {
    const roleMap = {
        admin: '管理员',
        member: '成员',
        pending: '待审批'
    }
    return roleMap[role] || role
}

// 切换标签
const switchTab = (tab) => {
    activeTab.value = tab
    loadMembers()
}

// 获取空状态文本
const getEmptyText = () => {
    if (activeTab.value === 'pending') {
        return '暂无待审批成员'
    }
    return '暂无正式成员'
}

// 加载成员列表
const loadMembers = async () => {
    loading.value = true

    try {
        const res = await Taro.request({
            url: labMemberApi.members(labId.value),
            method: 'GET',
            data: {
                status: activeTab.value
            },
            header: {
                Authorization: Taro.getStorageSync('token') || ''
            }
        })

        if (res.statusCode === 200 && res.data?.errCode === '0') {
            members.value = res.data.data?.items || []
        } else {
            members.value = []
        }
    } catch (error) {
        console.error('获取成员列表失败:', error)
        members.value = []
    } finally {
        loading.value = false
    }
}

// 加载待审批数量
const loadPendingCount = async () => {
    try {
        const res = await Taro.request({
            url: labMemberApi.pending(labId.value),
            method: 'GET',
            header: {
                Authorization: Taro.getStorageSync('token') || ''
            }
        })

        if (res.statusCode === 200 && res.data?.errCode === '0') {
            tabs[0].count = res.data.data?.total || 0
        }
    } catch (error) {
        console.error('获取待审批数量失败:', error)
    }
}

// 审批通过
const approveMember = (member) => {
    selectedMember.value = member
    selectedRole.value = 'member'
    showApproveModal.value = true
}

const hideApproveModal = () => {
    showApproveModal.value = false
    selectedMember.value = null
    selectedRole.value = 'member'
}

const onRoleSelect = (e) => {
    selectedRole.value = e.detail.value
}

const confirmApprove = async () => {
    if (!selectedMember.value) return

    approving.value = true

    try {
        const res = await Taro.request({
            url: labMemberApi.approve(selectedMember.value.id),
            method: 'PUT',
            header: {
                Authorization: Taro.getStorageSync('token') || ''
            },
            data: {
                role: selectedRole.value
            }
        })

        if (res.statusCode === 200 && res.data?.errCode === '0') {
            Taro.showToast({
                title: '已通过申请',
                icon: 'success'
            })

            hideApproveModal()
            await loadMembers()
            await loadPendingCount()
        } else {
            Taro.showToast({
                title: res.data?.errorInfo || '操作失败',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('审批失败:', error)
        Taro.showToast({
            title: '操作失败',
            icon: 'none'
        })
    } finally {
        approving.value = false
    }
}

// 拒绝申请
const rejectMember = (member) => {
    selectedMember.value = member
    rejectReason.value = ''
    showRejectModal.value = true
}

const hideRejectModal = () => {
    showRejectModal.value = false
    selectedMember.value = null
    rejectReason.value = ''
}

const confirmReject = async () => {
    if (!selectedMember.value) return

    rejecting.value = true

    try {
        const res = await Taro.request({
            url: labMemberApi.reject(selectedMember.value.id),
            method: 'PUT',
            header: {
                Authorization: Taro.getStorageSync('token') || ''
            },
            data: {
                reason: rejectReason.value.trim()
            }
        })

        if (res.statusCode === 200 && res.data?.errCode === '0') {
            Taro.showToast({
                title: '已拒绝申请',
                icon: 'success'
            })

            hideRejectModal()
            await loadMembers()
            await loadPendingCount()
        } else {
            Taro.showToast({
                title: res.data?.errorInfo || '操作失败',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('拒绝失败:', error)
        Taro.showToast({
            title: '操作失败',
            icon: 'none'
        })
    } finally {
        rejecting.value = false
    }
}

// 修改角色
const onRoleChange = (e, member) => {
    const newRole = roleOptions[e.detail.value]

    Taro.showModal({
        title: '确认修改角色',
        content: `确定要将 ${member.userName} 的角色修改为 ${getRoleText(newRole)} 吗？`,
        success: async (res) => {
            if (res.confirm) {
                try {
                    const response = await Taro.request({
                        url: labMemberApi.role(member.id),
                        method: 'PUT',
                        header: {
                            Authorization: Taro.getStorageSync('token') || ''
                        },
                        data: {
                            role: newRole
                        }
                    })

                    if (response.statusCode === 200 && response.data?.errCode === '0') {
                        Taro.showToast({
                            title: '角色修改成功',
                            icon: 'success'
                        })
                        await loadMembers()
                    } else {
                        Taro.showToast({
                            title: response.data?.errorInfo || '操作失败',
                            icon: 'none'
                        })
                    }
                } catch (error) {
                    console.error('修改角色失败:', error)
                    Taro.showToast({
                        title: '操作失败',
                        icon: 'none'
                    })
                }
            }
        }
    })
}

// 移除成员
const removeMember = (member) => {
    Taro.showModal({
        title: '确认移除成员',
        content: `确定要将 ${member.userName} 移出实验室吗？`,
        success: async (res) => {
            if (res.confirm) {
                try {
                    const response = await Taro.request({
                        url: labMemberApi.remove(member.id),
                        method: 'DELETE',
                        header: {
                            Authorization: Taro.getStorageSync('token') || ''
                        }
                    })

                    if (response.statusCode === 200 && response.data?.errCode === '0') {
                        Taro.showToast({
                            title: '已移除成员',
                            icon: 'success'
                        })
                        await loadMembers()
                        await loadPendingCount()
                    } else {
                        Taro.showToast({
                            title: response.data?.errorInfo || '操作失败',
                            icon: 'none'
                        })
                    }
                } catch (error) {
                    console.error('移除成员失败:', error)
                    Taro.showToast({
                        title: '操作失败',
                        icon: 'none'
                    })
                }
            }
        }
    })
}

// 查看日志
const viewLogs = () => {
    Taro.navigateTo({
        url: `/pages/profile/member-logs/member-logs?labId=${labId.value}`
    })
}

// 页面加载
onMounted(() => {
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    labId.value = params?.labId || ''

    if (!labId.value) {
        Taro.showToast({
            title: '缺少实验室ID',
            icon: 'none'
        })
        setTimeout(() => {
            Taro.navigateBack()
        }, 1500)
        return
    }

    loadMembers()
    loadPendingCount()
})
</script>

<style lang="scss" scoped>
.member-management-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding-bottom: 32rpx;
}

.page-header {
    padding: 32rpx;
    text-align: center;

    .page-title {
        font-size: 40rpx;
        font-weight: bold;
        color: white;
    }
}

.tab-bar {
    display: flex;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20rpx);
    margin: 0 32rpx 24rpx;
    border-radius: 16rpx;
    padding: 8rpx;
    gap: 8rpx;

    .tab-item {
        flex: 1;
        text-align: center;
        padding: 16rpx;
        border-radius: 12rpx;
        transition: all 0.3s;

        &.active {
            background: #667eea;

            .tab-text {
                color: white;
            }

            .tab-count {
                color: rgba(255, 255, 255, 0.8);
            }
        }

        .tab-text {
            font-size: 28rpx;
            color: #666;
        }

        .tab-count {
            font-size: 24rpx;
            color: #999;
        }
    }
}

.members-scroll {
    max-height: 900rpx;
    margin: 0 32rpx;
    padding: 0 16rpx;
}

.member-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20rpx);
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;

    .member-info {
        display: flex;
        gap: 16rpx;
        flex: 1;

        .member-avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
            background: #f0f0f0;
        }

        .member-details {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 8rpx;

            .member-name {
                font-size: 32rpx;
                font-weight: bold;
                color: #333;
            }

            .member-role {
                font-size: 24rpx;
                color: #667eea;
            }

            .apply-reason {
                font-size: 24rpx;
                color: #666;
            }
        }
    }

    .member-actions {
        display: flex;
        gap: 12rpx;
    }
}

.empty-state {
    text-align: center;
    padding: 80rpx 32rpx;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20rpx);
    border-radius: 16rpx;
    margin: 0 16rpx;

    .empty-icon {
        display: block;
        font-size: 120rpx;
        margin-bottom: 24rpx;
    }

    .empty-text {
        display: block;
        font-size: 28rpx;
        color: #666;
    }
}

.loading-state {
    text-align: center;
    padding: 40rpx;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20rpx);
    border-radius: 16rpx;
    margin: 0 16rpx;

    .loading-text {
        font-size: 28rpx;
        color: #999;
    }
}

.logs-btn-wrapper {
    padding: 0 32rpx;
    margin-top: 24rpx;

    .logs-btn {
        width: 100%;
    }
}

.btn {
    padding: 16rpx 24rpx;
    border-radius: 12rpx;
    font-size: 26rpx;
    text-align: center;
    min-width: 100rpx;

    &.btn-primary {
        background: #667eea;
        color: white;
    }

    &.btn-secondary {
        background: #e5e7eb;
        color: #374151;
    }

    &.btn-danger {
        background: #ef4444;
        color: white;
    }

    &.btn-loading {
        opacity: 0.6;
    }

    .loading-spinner {
        width: 24rpx;
        height: 24rpx;
        border: 3rpx solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

// 弹窗样式
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    .modal-content {
        width: 600rpx;
        background: white;
        border-radius: 24rpx;
        overflow: hidden;

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 32rpx;
            border-bottom: 1rpx solid #e5e7eb;

            .modal-title {
                font-size: 32rpx;
                font-weight: bold;
                color: #333;
            }

            .modal-close {
                font-size: 40rpx;
                color: #999;
            }
        }

        .modal-body {
            padding: 32rpx;

            .member-summary {
                background: rgba(102, 126, 234, 0.05);
                padding: 24rpx;
                border-radius: 16rpx;
                margin-bottom: 24rpx;

                .summary-name {
                    display: block;
                    font-size: 32rpx;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 8rpx;
                }

                .summary-reason {
                    display: block;
                    font-size: 26rpx;
                    color: #666;
                }
            }

            .form-item {
                margin-bottom: 24rpx;

                .form-label {
                    display: block;
                    font-size: 28rpx;
                    color: #333;
                    margin-bottom: 16rpx;
                }

                .form-textarea {
                    width: 100%;
                    min-height: 160rpx;
                    padding: 20rpx;
                    background: rgba(255, 255, 255, 0.8);
                    border: 1rpx solid #e5e7eb;
                    border-radius: 12rpx;
                    font-size: 28rpx;
                }

                .char-count {
                    display: block;
                    text-align: right;
                    font-size: 24rpx;
                    color: #999;
                    margin-top: 8rpx;
                }

                .radio-item {
                    display: flex;
                    align-items: center;
                    padding: 16rpx;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 12rpx;
                    margin-bottom: 12rpx;

                    &:last-child {
                        margin-bottom: 0;
                    }

                    radio {
                        margin-right: 16rpx;
                    }

                    .radio-text {
                        font-size: 28rpx;
                        color: #333;
                    }
                }
            }
        }

        .modal-footer {
            display: flex;
            gap: 16rpx;
            padding: 32rpx;
            border-top: 1rpx solid #e5e7eb;

            .btn {
                flex: 1;
            }
        }
    }
}
</style>
