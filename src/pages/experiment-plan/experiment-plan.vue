<template>
    <view class="experiment-plan-page">
        <!-- 顶部导航栏 -->
        <view class="page-header">
            <view class="header-back" @tap="handleBack">
                <text class="back-icon">←</text>
            </view>
            <view class="header-title">实验计划</view>
            <view class="header-placeholder"></view>
        </view>

        <!-- 空状态提示 -->
        <view class="empty-state">
            <text class="empty-icon">📋</text>
            <text class="empty-title">实验计划功能</text>
            <text class="empty-subtitle">开发中...</text>
            <view class="empty-description">
                <text class="desc-text">您可以通过AI助手解析实验计划</text>
                <text class="desc-text">获取耗材需求清单</text>
            </view>
            <view class="action-buttons">
                <view class="action-btn primary" @tap="handleGoToAI">
                    <text>🤖 前往AI助手</text>
                </view>
                <view class="action-btn secondary" @tap="handleBack">
                    <text>返回</text>
                </view>
            </view>
        </view>

        <!-- 功能预告 -->
        <view class="feature-preview">
            <view class="preview-title">即将上线</view>
            <view class="feature-list">
                <view class="feature-item">
                    <text class="feature-icon">📅</text>
                    <view class="feature-content">
                        <text class="feature-name">计划日历</text>
                        <text class="feature-desc">可视化管理实验计划</text>
                    </view>
                </view>
                <view class="feature-item">
                    <text class="feature-icon">🔗</text>
                    <view class="feature-content">
                        <text class="feature-name">耗材关联</text>
                        <text class="feature-desc">自动关联库存和需求</text>
                    </view>
                </view>
                <view class="feature-item">
                    <text class="feature-icon">⏰</text>
                    <view class="feature-content">
                        <text class="feature-name">进度跟踪</text>
                        <text class="feature-desc">实时追踪实验进度</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import Taro from '@tarojs/taro'
import './experiment-plan.scss'

// 返回上一页
const handleBack = () => {
    Taro.navigateBack()
}

// 前往AI助手
const handleGoToAI = () => {
    Taro.switchTab({
        url: '/pages/ai-chat/ai-chat'
    })
}
</script>
