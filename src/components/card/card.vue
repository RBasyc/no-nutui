<template>
    <view
        :class="['card', shadowClass && `card--shadow-${shadowClass}`]"
        :style="cardStyle"
        @click="onClick"
    >
        <!-- 卡片内容插槽 -->
        <slot></slot>
    </view>
</template>

<script setup>
import { computed } from 'vue'
import './card.scss'

const props = defineProps({
    // 背景颜色
    bgColor: {
        type: String,
        default: '#ffffff'
    },
    // 圆角大小
    radius: {
        type: String,
        default: '16rpx'
    },
    // 内边距
    padding: {
        type: String,
        default: '32rpx'
    },
    // 阴影级别：none | light | medium | dark
    shadow: {
        type: String,
        default: 'light',
        validator: (value) => ['none', 'light', 'medium', 'dark'].includes(value)
    },
    // 渐变背景（设置后优先级高于 bgColor）
    gradient: {
        type: String,
        default: ''
    },
    // 边框
    border: {
        type: String,
        default: ''
    },
    // 卡片宽度
    width: {
        type: String,
        default: ''
    },
    // 卡片高度
    height: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['click'])

// 计算阴影类名
const shadowClass = computed(() => {
    if (props.shadow === 'none') return ''
    return props.shadow
})

// 计算卡片样式
const cardStyle = computed(() => {
    const style = {
        backgroundColor: props.bgColor,
        borderRadius: props.radius,
        padding: props.padding
    }

    // 渐变背景
    if (props.gradient) {
        style.background = props.gradient
    }

    // 边框
    if (props.border) {
        style.border = props.border
    }

    // 宽高
    if (props.width) style.width = props.width
    if (props.height) style.height = props.height

    return style
})

// 点击事件
const onClick = (e) => {
    emit('click', e)
}
</script>
