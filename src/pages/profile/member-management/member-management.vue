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
                <text v-if="tab.count > 0" class="tab-count"
                    >({{ tab.count }})</text
                >
            </view>
        </view>

        <!-- 成员列表 -->
        <scroll-view scrollY class="members-scroll">
            <view
                v-for="member in members"
                :key="member.id"
                class="member-item"
            >
                <view class="member-info">
                    <image
                        class="member-avatar"
                        :src="member.userAvatar || '/assets/default-avatar.png'"
                    />
                    <view class="member-details">
                        <text class="member-name">{{ member.userName }}</text>
                        <text class="member-role">{{
                            getRoleText(member.role)
                        }}</text>
                        <text
                            v-if="
                                member.applicationReason &&
                                activeTab === 'pending'
                            "
                            class="apply-reason"
                        >
                            申请理由: {{ member.applicationReason }}
                        </text>
                    </view>
                </view>

                <view class="member-actions">
                    <!-- 待审批操作 -->
                    <template v-if="activeTab === 'pending'">
                        <view
                            class="btn btn-primary"
                            @tap="approveMember(member)"
                        >
                            <text>通过</text>
                        </view>
                        <view
                            class="btn btn-danger"
                            @tap="rejectMember(member)"
                        >
                            <text>拒绝</text>
                        </view>
                    </template>

                    <!-- 正式成员操作 -->
                    <template v-if="activeTab === 'active'">
                        <!-- 只有一个管理员时，不显示修改角色按钮 -->
                        <picker
                            v-if="!(adminCount === 1 && member.role === 'admin')"
                            mode="selector"
                            :range="roleOptions"
                            @change="onRoleChange($event, member)"
                        >
                            <view class="btn btn-secondary">
                                <text>修改角色</text>
                            </view>
                        </picker>
                        <!-- 只有一个管理员时，不显示移除按钮 -->
                        <view
                            v-if="!(adminCount === 1 && member.role === 'admin')"
                            class="btn btn-danger"
                            @tap="removeMember(member)"
                        >
                            <text>移除</text>
                        </view>
                        <!-- 最后一个管理员时的提示 -->
                        <view
                            v-if="adminCount === 1 && member.role === 'admin'"
                            class="btn btn-disabled"
                        >
                            <text>唯一管理员</text>
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
        <view
            v-if="showApproveModal"
            class="modal-overlay"
            @tap="hideApproveModal"
        >
            <view class="modal-content" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">审批通过申请</text>
                    <view class="modal-close" @tap="hideApproveModal">✕</view>
                </view>

                <view class="modal-body">
                    <view class="member-summary">
                        <text class="summary-name">{{
                            selectedMember?.userName
                        }}</text>
                        <text
                            v-if="selectedMember?.applicationReason"
                            class="summary-reason"
                        >
                            {{ selectedMember.applicationReason }}
                        </text>
                    </view>

                    <view class="form-item">
                        <text class="form-label">分配角色</text>
                        <radio-group @change="onRoleSelect">
                            <label
                                class="radio-item"
                                v-for="role in roleOptions"
                                :key="role"
                            >
                                <radio
                                    :value="role"
                                    :checked="selectedRole === role"
                                />
                                <text class="radio-text">{{
                                    getRoleText(role)
                                }}</text>
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
        <view
            v-if="showRejectModal"
            class="modal-overlay"
            @tap="hideRejectModal"
        >
            <view class="modal-content" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">拒绝申请</text>
                    <view class="modal-close" @tap="hideRejectModal">✕</view>
                </view>

                <view class="modal-body">
                    <view class="member-summary">
                        <text class="summary-name">{{
                            selectedMember?.userName
                        }}</text>
                    </view>

                    <view class="form-item">
                        <text class="form-label">拒绝理由</text>
                        <textarea
                            v-model="rejectReason"
                            class="form-textarea"
                            placeholder="请输入拒绝理由（可选）"
                            maxlength="500"
                        />
                        <text class="char-count"
                            >{{ rejectReason.length }}/500</text
                        >
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
import './member-management.scss'

// 状态管理
const activeTab = ref('pending')
const tabs = reactive([
    { value: 'pending', label: '待审批', count: 0 },
    { value: 'active', label: '正式成员', count: 0 }
])

const members = ref([])
const loading = ref(false)
const adminCount = ref(0) // 管理员数量

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

            // 统计管理员数量（仅在正式成员标签时统计）
            if (activeTab.value === 'active') {
                adminCount.value = members.value.filter(m => m.role === 'admin').length
            }
        } else {
            members.value = []
            adminCount.value = 0
        }
    } catch (error) {
        console.error('获取成员列表失败:', error)
        members.value = []
        adminCount.value = 0
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
        content: `确定要将 ${member.userName} 的角色修改为 ${getRoleText(
            newRole
        )} 吗？`,
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

                    if (
                        response.statusCode === 200 &&
                        response.data?.errCode === '0'
                    ) {
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

                    if (
                        response.statusCode === 200 &&
                        response.data?.errCode === '0'
                    ) {
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

    // 如果 URL 参数中没有 labId，尝试从本地存储获取
    if (!labId.value) {
        const currentLabId = Taro.getStorageSync('currentLabId')
        if (currentLabId) {
            labId.value = currentLabId
        } else {
            Taro.showToast({
                title: '缺少实验室ID',
                icon: 'none'
            })
            setTimeout(() => {
                Taro.navigateBack()
            }, 1500)
            return
        }
    }

    loadMembers()
    loadPendingCount()
})
</script>

