<template>
  <view class="answer-container safe-area-top">
    <!-- 头部 -->
    <view class="header">
      <view class="left-section">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="header-title">回答问题</text>
      </view>
    </view>
    
    <!-- 加载错误提示 -->
    <view v-if="loadError" class="error-container" @click="retryLoading">
      <text class="error-text">{{ errorMessage }}</text>
      <text class="retry-text">点击屏幕重试</text>
    </view>
    
    <!-- 问题列表 -->
    <scroll-view v-else 
      class="question-list"
      scroll-y="true"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherpulling="onPulling"
      @refresherrefresh="onRefresh"
      @refresherrestore="onRestore"
      @refresherabort="onAbort"
    >
      <view class="question-item" v-for="(item, index) in questionList" :key="index">
        <view class="question-content">
          <text>{{ item.title }}</text>
        </view>
        <view class="answer-btn" @click="goToWriteAnswer(item)">
          <text>写回答</text>
        </view>
      </view>
      <view v-if="questionList.length === 0" class="empty-tip">
        <text>暂无可回答的问题</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { store } from '@/common/store.js';

// 问题列表
const questionList = ref([]);
// 加载错误状态
const loadError = ref(false);
// 错误信息
const errorMessage = ref('连接服务器超时');
// 下拉刷新状态
const refreshing = ref(false);

// 加载问题列表
const loadQuestions = () => {
  try {
    questionList.value = store.getQuestions();
    loadError.value = false;
  } catch (error) {
    console.error('加载问题列表失败:', error);
    loadError.value = true;
    errorMessage.value = '加载失败，请重试';
  }
};

// 下拉刷新相关函数
const onPulling = () => {
  // 下拉中，可以添加一些视觉反馈
};

const onRefresh = () => {
  refreshing.value = true;
  
  // 显示加载中提示
  uni.showLoading({
    title: '加载中...',
    mask: false
  });
  
  setTimeout(() => {
    // 刷新数据
    loadQuestions();
    
    // 隐藏加载提示
    uni.hideLoading();
    
    // 停止下拉刷新动画
    refreshing.value = false;
    
    // 显示刷新成功提示
    uni.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 1000
    });
  }, 1000);
};

const onRestore = () => {
  // 刷新结束，重置状态
};

const onAbort = () => {
  // 刷新被中止，重置状态
  refreshing.value = false;
};

// 重试加载
const retryLoading = () => {
  loadQuestions();
};

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    delta: 1,
    fail: () => {
      // 如果无法返回（例如直接打开此页面），则跳转到首页
      uni.reLaunch({
        url: '/pages/index/index'
      });
    }
  });
};

// 组件挂载时加载问题列表
onMounted(() => {
  loadQuestions();
});

// 跳转到写回答页面
const goToWriteAnswer = (question) => {
  uni.navigateTo({
    url: `/pages/write-answer/index?id=${question.id}&title=${encodeURIComponent(question.title)}`
  });
};
</script>

<style lang="scss">
.answer-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 80rpx; // 增加顶部间距，避免被手机摄像头遮挡
  /* #ifdef MP-WEIXIN */
  padding-top: calc(80rpx + constant(safe-area-inset-top)); /* 兼容 iOS < 11.2 */
  padding-top: calc(80rpx + env(safe-area-inset-top)); /* 兼容 iOS >= 11.2 */
  /* #endif */
}

.header {
  padding: 20rpx 40rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  position: relative;
  margin-top: 10rpx;
  
  .left-section {
    display: flex;
    align-items: center;
    
    .back-btn {
      margin-right: 20rpx;
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .back-icon {
        font-size: 36rpx;
        color: #333;
        font-weight: bold;
      }
    }
  }
  
  .header-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80vh;
  
  .error-text {
    font-size: 32rpx;
    color: #666;
    margin-bottom: 20rpx;
  }
  
  .retry-text {
    font-size: 28rpx;
    color: #999;
    padding: 10rpx 30rpx;
    border: 1px solid #eee;
    border-radius: 30rpx;
  }
}

.question-list {
  flex: 1;
  padding: 20rpx;
  height: calc(100vh - 110rpx);
  
  .question-item {
    margin-bottom: 20rpx;
    padding: 30rpx 40rpx;
    background-color: #fff;
    border-radius: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #eee;
    
    .question-content {
      flex: 1;
      font-size: 32rpx;
      color: #333;
      padding-right: 20rpx;
    }
    
    .answer-btn {
      background-color: #e0f0ff;
      color: #4096ff;
      font-size: 28rpx;
      padding: 12rpx 24rpx;
      border-radius: 40rpx;
      box-shadow: 0 2rpx 6rpx rgba(64, 150, 255, 0.2);
    }
  }
  
  .empty-tip {
    text-align: center;
    padding: 40rpx 0;
    color: #999;
    font-size: 30rpx;
  }
}
</style> 