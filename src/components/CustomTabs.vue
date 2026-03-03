<template>
    <view class="custom-tabs">
        <!-- 标签头部 -->
        <scroll-view
            class="tabs-header"
            scroll-x
            :scroll-into-view="scrollIntoView"
            scroll-with-animation
            enable-flex
        >
            <view class="tabs-wrapper">
                <view
                    v-for="tab in tabs"
                    :id="'tab-' + tab.paneKey"
                    :key="tab.paneKey"
                    class="tab-item"
                    :class="{ active: activeKey === tab.paneKey }"
                    @click="handleTabClick(tab.paneKey)"
                >
                    <text class="tab-icon">{{ tab.icon }}</text>
                    <text class="tab-label">{{ tab.label }}</text>
                    <text v-if="tab.badge" class="tab-badge">{{
                        tab.badge
                    }}</text>
                    <view
                        v-if="activeKey === tab.paneKey"
                        class="tab-indicator"
                    ></view>
                </view>
            </view>
        </scroll-view>

        <!-- 标签内容 -->
        <view class="tabs-content">
            <slot></slot>
        </view>
    </view>
</template>

<script setup>
import { ref, provide, computed, watch, onMounted } from 'vue'

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    }
})

const emit = defineEmits(['update:modelValue', 'change'])

const activeKey = ref(props.modelValue)
const scrollIntoView = ref('')
const tabs = ref([])

// 注册标签页
const registerPane = (pane) => {
    const index = tabs.value.findIndex((t) => t.paneKey === pane.paneKey)
    if (index === -1) {
        tabs.value.push(pane)
    }
}

// 注销标签页
const unregisterPane = (paneKey) => {
    const index = tabs.value.findIndex((t) => t.paneKey === paneKey)
    if (index > -1) {
        tabs.value.splice(index, 1)
    }
}

// 提供给子组件使用
provide('customTabs', {
    activeKey,
    registerPane,
    unregisterPane
})

// 监听外部变化
watch(
    () => props.modelValue,
    (newVal) => {
        activeKey.value = newVal
    }
)

// 监听内部变化
watch(activeKey, (newVal) => {
    emit('update:modelValue', newVal)
    emit('change', newVal)
})

// 点击标签
const handleTabClick = (key) => {
    if (activeKey.value !== key) {
        activeKey.value = key
        // 滚动到可见区域
        scrollIntoView.value = 'tab-' + key
    }
}

onMounted(() => {
    if (!activeKey.value && tabs.value.length > 0) {
        activeKey.value = tabs.value[0].paneKey
    }
})
</script>

<style lang="scss">
.custom-tabs {
    width: 100%;
    background: #fff;
    box-sizing: border-box;

    .tabs-header {
        width: 100%;
        white-space: nowrap;
        border-bottom: 1px solid #f0f0f0;
        box-sizing: border-box;

        .tabs-wrapper {
            display: flex;
            flex-direction: row;
            padding: 0 16rpx;
            box-sizing: border-box;

            .tab-item {
                position: relative;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                padding: 32rpx 40rpx;
                color: #666;
                font-size: 28rpx;
                white-space: nowrap;
                box-sizing: border-box;

                &.active {
                    color: #506cf6;
                    font-weight: 500;
                }

                .tab-icon {
                    margin-right: 8rpx;
                    font-size: 32rpx;
                    flex-shrink: 0;
                }

                .tab-label {
                    flex-shrink: 0;
                }

                .tab-badge {
                    margin-left: 8rpx;
                    padding: 4rpx 12rpx;
                    background: #fa2c19;
                    color: #fff;
                    font-size: 22rpx;
                    border-radius: 20rpx;
                    min-width: 36rpx;
                    text-align: center;
                    flex-shrink: 0;
                }

                .tab-indicator {
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 40rpx;
                    height: 6rpx;
                    background: #506cf6;
                    border-radius: 6rpx;
                }
            }
        }
    }

    .tabs-content {
        width: 100%;
        box-sizing: border-box;
    }
}
</style>
