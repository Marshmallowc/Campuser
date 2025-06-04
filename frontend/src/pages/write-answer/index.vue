<template>
  <view class="write-answer-container safe-area-top">
    <!-- 头部 -->
    <view class="header">
      <view class="left-section">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="title">写回答</text>
      </view>
      <view class="submit-btn" @click="submitAnswer">
        <text>发布</text>
      </view>
    </view>
    
    <!-- 问题标题 -->
    <view class="question-title">
      <text>{{ questionTitle }}</text>
    </view>
    
    <!-- 回答输入区域 -->
    <view class="answer-input-area">
      <textarea
        class="answer-input"
        placeholder="请输入你的回答..."
        placeholder-style="color: #d1d1d1;"
        v-model="answerContent"
        auto-height
      />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { store } from '@/common/store.js';

// 问题标题
const questionTitle = ref('');
// 问题ID
const questionId = ref('');
// 回答内容
const answerContent = ref('');

// 页面加载时获取参数
onMounted(() => {
  // 输出调试信息
  console.log('写回答页面加载，获取参数');
  
  const params = uni.getStorageSync('page_params');
  if (params) {
    const query = decodeURIComponent(params).split('?')[1];
    if (query) {
      const queryParams = new URLSearchParams(query);
      questionId.value = queryParams.get('id');
      questionTitle.value = queryParams.get('title');
    }
  } else {
    // 获取页面参数
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage && currentPage.options) {
      questionId.value = currentPage.options.id;
      questionTitle.value = decodeURIComponent(currentPage.options.title || '');
    }
  }
  
  console.log('获取到的问题ID:', questionId.value);
  console.log('获取到的问题标题:', questionTitle.value);
});

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 提交回答
const submitAnswer = async () => {
  if (!answerContent.value.trim()) {
    uni.showToast({
      title: '请输入回答内容',
      icon: 'none'
    });
    return;
  }
  
  if (!questionId.value) {
    uni.showToast({
      title: '问题ID无效',
      icon: 'none'
    });
    return;
  }
  
  console.log('正在提交回答, 问题ID:', questionId.value, '内容长度:', answerContent.value.length);
  
  // 显示加载提示
  uni.showLoading({
    title: '提交中...'
  });
  
  try {
    // 调用API提交回答
    const result = await store.createAnswer(questionId.value, answerContent.value);
    console.log('提交回答结果:', result);
    
    // 隐藏加载提示
    uni.hideLoading();
    
    if (result.success) {
      // 提交成功
      uni.showToast({
        title: '回答已发布',
        icon: 'success',
        duration: 2000,
        success: () => {
          // 提交成功后返回上一页
          setTimeout(() => {
            // 获取当前页面
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            
            // 通知上一页刷新回答列表
            const eventChannel = currentPage.getOpenerEventChannel();
            if (eventChannel && eventChannel.emit) {
              console.log('通知文章页刷新回答列表');
              eventChannel.emit('refreshAnswers');
            } else {
              console.log('获取事件通道失败，无法通知刷新');
            }
            
            // 返回上一页
            uni.navigateBack();
          }, 1500);
        }
      });
    } else {
      // 提交失败
      uni.showToast({
        title: result.message || '提交失败',
        icon: 'none'
      });
    }
  } catch (error) {
    // 发生错误
    console.error('提交回答出错:', error);
    uni.hideLoading();
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    });
  }
};
</script>

<style lang="scss">
.write-answer-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fff;
  padding-top: 80rpx;
  /* #ifdef MP-WEIXIN */
  padding-top: calc(80rpx + constant(safe-area-inset-top)); /* 兼容 iOS < 11.2 */
  padding-top: calc(80rpx + env(safe-area-inset-top)); /* 兼容 iOS >= 11.2 */
  /* #endif */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 40rpx 30rpx;
  border-bottom: 1px solid #f0f0f0;
  margin-top: 10rpx;
  
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

.question-title {
  padding: 30rpx 40rpx;
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #f9f9f9;
}

.answer-input-area {
  padding: 40rpx;
  flex: 1;
  
  .answer-input {
    width: 100%;
    font-size: 30rpx;
    color: #333;
    line-height: 1.6;
    min-height: 300rpx;
  }
}
</style> 