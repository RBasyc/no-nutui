<template>
	<view class="member-logs-page">
		<!-- 日志列表 -->
		<scroll-view
			class="logs-list"
			scrollY
			@scrolltolower="handleLoadMore"
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="handleRefresh"
		>
			<view
				v-for="log in logs"
				:key="log._id"
				class="log-item"
			>
				<!-- 操作类型标签 -->
				<view class="log-badge" :class="getActionClass(log.action)">
					{{ ACTION_TEXT_MAP[log.action] || log.action }}
				</view>

				<!-- 操作详情 -->
				<view class="log-content">
					<text class="log-operator">{{ log.operatorName || '系统' }}</text>
					<text class="log-action">{{ getActionDescription(log) }}</text>
					<text
						v-if="log.remark"
						class="log-remark"
					>{{ log.remark }}</text>
				</view>

				<!-- 操作时间 -->
				<view class="log-time">
					{{ formatTime(log.createdAt) }}
				</view>
			</view>

			<!-- 加载状态 -->
			<view v-if="loading" class="loading-state">
				<text>加载中...</text>
			</view>
			<view
				v-else-if="!hasMore && logs.length > 0"
				class="no-more-state"
			>
				<text>没有更多了</text>
			</view>

			<!-- 空状态 -->
			<view
				v-if="!loading && logs.length === 0"
				class="empty-state"
			>
				<text class="empty-icon">📋</text>
				<text class="empty-text">暂无操作记录</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import { useDidShow } from '@tarojs/taro'
import { checkTokenExpired } from '../../../utils/authHelper'
import labMemberApi from '../../../api/labMemberApi'
import './member-logs.scss'

// 页面参数
const labId = ref('')

// 数据状态
const logs = ref([])
const loading = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)
const pageSize = 20
const hasMore = ref(true)

// 操作类型映射
const ACTION_TEXT_MAP = {
	'apply': '申请加入',
	'approve': '批准加入',
	'reject': '拒绝申请',
	'leave': '退出实验室',
	'remove': '移除成员',
	'role_change': '角色变更'
}

// 角色名称映射
const ROLE_TEXT_MAP = {
	'admin': '管理员',
	'member': '成员',
	'pending': '待审批'
}

// 获取操作描述
const getActionDescription = (log) => {
	switch (log.action) {
		case 'role_change':
			return `将角色从 ${ROLE_TEXT_MAP[log.beforeRole] || log.beforeRole} 变更为 ${ROLE_TEXT_MAP[log.afterRole] || log.afterRole}`
		case 'remove':
			return `移除了成员（原角色：${ROLE_TEXT_MAP[log.beforeRole] || log.beforeRole}）`
		case 'leave':
			return `退出了实验室（原角色：${ROLE_TEXT_MAP[log.beforeRole] || log.beforeRole}）`
		case 'approve':
			return `批准加入（角色：${ROLE_TEXT_MAP[log.afterRole] || log.afterRole}）`
		default:
			return ''
	}
}

// 格式化时间
const formatTime = (dateStr) => {
	if (!dateStr) return ''

	const date = new Date(dateStr)
	const now = new Date()
	const diff = now.getTime() - date.getTime()

	// 小于1分钟显示"刚刚"
	if (diff < 60000) return '刚刚'

	// 小于1小时显示"X分钟前"
	if (diff < 3600000) {
		return `${Math.floor(diff / 60000)}分钟前`
	}

	// 小于1天显示"X小时前"
	if (diff < 86400000) {
		return `${Math.floor(diff / 3600000)}小时前`
	}

	// 小于7天显示"X天前"
	if (diff < 604800000) {
		return `${Math.floor(diff / 86400000)}天前`
	}

	// 其他显示完整日期
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')

	return `${year}-${month}-${day} ${hour}:${minute}`
}

// 获取操作类型样式
const getActionClass = (action) => {
	const classMap = {
		'apply': 'apply',
		'approve': 'approve',
		'reject': 'reject',
		'leave': 'leave',
		'remove': 'remove',
		'role_change': 'role-change'
	}
	return classMap[action] || ''
}

// 加载日志列表
const loadLogs = async (refresh = false) => {
	if (loading.value && !refresh) return

	try {
		loading.value = true
		if (refresh) {
			refreshing.value = true
			currentPage.value = 1
			hasMore.value = true
		}

		const res = await Taro.request({
			url: labMemberApi.logs(labId.value),
			method: 'GET',
			data: {
				page: currentPage.value,
				pageSize
			},
			header: {
				Authorization: Taro.getStorageSync('token') || ''
			}
		})

		// 检查HTTP状态码
		if (res.statusCode !== 200) {
			throw new Error(`HTTP ${res.statusCode}`)
		}

		// 检查业务错误码
		if (res.data.errCode && res.data.errCode !== '0') {
			// 检查是否为token过期
			if (checkTokenExpired(res.data.errorInfo)) {
				return
			}

			Taro.showToast({
				title: res.data.errorInfo || '加载失败',
				icon: 'none'
			})
			if (refresh) {
				logs.value = []
			}
			return
		}

		// 后端返回 {errCode, errorInfo, data: {items, total, page, pageSize}}
		const data = res.data.data

		// 防御性检查：确保data和data.items存在且是数组
		if (!data || !Array.isArray(data.items)) {
			if (refresh) {
				logs.value = []
			}
			return
		}

		if (refresh) {
			logs.value = data.items
		} else {
			logs.value = [...logs.value, ...data.items]
		}

		// 判断是否还有更多数据
		hasMore.value = logs.value.length < (data.total || 0)
	} catch (error) {
		console.error('加载日志失败:', error)
		Taro.showToast({
			title: '加载失败',
			icon: 'none'
		})
		// 确保出错时logs是数组
		if (refresh) {
			logs.value = []
		}
	} finally {
		loading.value = false
		refreshing.value = false
	}
}

// 下拉刷新
const handleRefresh = () => {
	loadLogs(true)
}

// 上拉加载更多
const handleLoadMore = () => {
	if (!loading.value && hasMore.value) {
		currentPage.value++
		loadLogs()
	}
}

// 页面显示时加载
useDidShow(() => {
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

	loadLogs(true)
})
</script>
