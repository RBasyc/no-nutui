<template>
  <nut-popup
    :visible="visible"
    position="bottom"
    :style="{ height: '85%' }"
    round
    @close="handleClose"
  >
    <view class="form-modal">
      <!-- 标题栏 -->
      <view class="modal-header">
        <text class="modal-title">{{ isEdit ? '编辑耗材' : '添加耗材' }}</text>
        <view class="close-btn" @click="handleClose">
          <text>✕</text>
        </view>
      </view>

      <!-- 表单内容 -->
      <scroll-view scroll-y class="modal-content">
        <view class="form-placeholder">
          <text>库存表单弹窗组件</text>
        </view>
      </scroll-view>

      <!-- 底部按钮 -->
      <view class="modal-footer">
        <nut-button plain type="primary" @click="handleClose">
          取消
        </nut-button>
        <nut-button type="primary" @click="handleSubmit">
          {{ isEdit ? '保存' : '添加' }}
        </nut-button>
      </view>
    </view>
  </nut-popup>
</template>

<script setup>
import { computed } from 'vue'
import Taro from '@tarojs/taro'

const props = defineProps({
  visible: Boolean,
  item: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

// 是否为编辑模式
const isEdit = computed(() => !!props.item?._id)

// 提交表单
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
.form-modal {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f7fb;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background: #fff;
  border-bottom: 2rpx solid #f0f0f0;
  position: relative;

  .modal-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #1e2b3c;
  }

  .close-btn {
    position: absolute;
    right: 32rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    color: #999;
  }
}

.modal-content {
  flex: 1;
  padding: 24rpx;
}

.form-placeholder {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  background: #fff;
  border-top: 2rpx solid #f0f0f0;

  button {
    flex: 1;
  }
}
</style>
