<template>
  <nut-popup
    :visible="visible"
    position="center"
    :style="{ width: '85%', borderRadius: '24rpx' }"
    @close="handleClose"
  >
    <view class="record-modal">
      <!-- 标题 -->
      <view class="modal-header">
        <text class="modal-title">记录使用</text>
        <view class="close-btn" @click="handleClose">
          <text>✕</text>
        </view>
      </view>

      <!-- 提示信息 -->
      <view class="modal-content">
        <text>记录使用弹窗组件</text>
      </view>

      <!-- 确认按钮 -->
      <view class="modal-footer">
        <nut-button plain type="primary" @click="handleClose">
          取消
        </nut-button>
        <nut-button type="primary" @click="handleSubmit">
          确认
        </nut-button>
      </view>
    </view>
  </nut-popup>
</template>

<script setup>
import { ref } from 'vue'
import Taro from '@tarojs/taro'

const props = defineProps({
  visible: Boolean,
  item: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

// 提交记录
const handleSubmit = () => {
  Taro.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

// 关闭弹窗
const handleClose = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
.record-modal {
  padding: 32rpx;
  background: #f5f7fb;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  position: relative;

  .modal-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #1e2b3c;
  }

  .close-btn {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    color: #999;
  }
}

.modal-content {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666;
}

.modal-footer {
  display: flex;
  gap: 16rpx;

  button {
    flex: 1;
  }
}
</style>
