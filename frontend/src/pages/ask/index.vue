<template>
  <view class="ask-container">
    <!-- 头部 -->
    <view class="header">
      <view class="left-section">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="title">提问</text>
      </view>
      <view class="submit-btn" @click="submitQuestion">
        <text>发布</text>
      </view>
    </view>
    
    <!-- 问题输入区域 -->
    <view class="question-input-area">
      <textarea
        class="question-input"
        placeholder="输入问题并以句号结尾"
        placeholder-style="color: #d1d1d1;"
        v-model="questionContent"
        auto-height
      />
    </view>
    
    <!-- 可选说明区域 -->
    <view class="description-input-area">
      <textarea
        class="description-input"
        placeholder="对问题进行补充说明，可以更快速获得解答（选填）"
        placeholder-style="color: #d1d1d1;"
        v-model="descriptionContent"
        auto-height
      />
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { store } from '@/common/store.js';

// 问题内容
const questionContent = ref('');
// 问题说明内容
const descriptionContent = ref('');
// 当前用户信息
const userInfo = ref({
  avatar: '/static/avatar/user1.png' // 使用默认头像
});

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 提交问题
const submitQuestion = () => {
  if (!questionContent.value.trim()) {
    uni.showToast({
      title: '请输入问题内容',
      icon: 'none'
    });
    return;
  }
  
  // 模拟提交请求
  uni.showLoading({
    title: '提交中...'
  });
  
  setTimeout(() => {
    // 添加问题到全局存储
    store.addQuestion({
      content: questionContent.value,
      description: descriptionContent.value
    });
    
    uni.hideLoading();
    uni.showToast({
      title: '提问成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        // 提交成功后返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 2000);
      }
    });
  }, 1500);
};
</script>

<style lang="scss">
.ask-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1px solid #f0f0f0;
  
  .left-section {
    display: flex;
    align-items: center;
    
    .back-btn {
      margin-right: 20rpx;
      font-size: 36rpx;
      color: #333;
    }
  }
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
  
  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e0f0ff;
    color: #4096ff;
    font-size: 28rpx;
    font-weight: 500;
    padding: 12rpx 40rpx;
    border-radius: 40rpx;
    box-shadow: 0 0 10rpx rgba(64, 150, 255, 0.2);
  }
}

.question-input-area {
  padding: 40rpx;
  border-bottom: 1px solid #f9f9f9;
  
  .question-input {
    width: 100%;
    font-size: 32rpx;
    color: #333;
    line-height: 1.6;
    min-height: 120rpx;
  }
}

.description-input-area {
  padding: 40rpx;
  flex: 1;
  min-height: 400rpx;
  
  .description-input {
    width: 100%;
    font-size: 28rpx;
    color: #666;
    line-height: 1.5;
    min-height: 300rpx;
  }
}
</style> 