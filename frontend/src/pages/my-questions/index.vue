<template>
  <view class="my-questions-container">
    <!-- 头部 -->
    <view class="header">
      <view class="left-section">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="header-title">我的提问</text>
      </view>
    </view>
    
    <!-- 问题列表 -->
    <scroll-view 
      class="question-list"
      scroll-y="true"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="myQuestions.length > 0">
        <view 
          class="question-item" 
          v-for="(item, index) in myQuestions" 
          :key="index"
          @click="goToArticle(item)"
        >
          <view class="question-title">{{ item.title }}</view>
          <view class="question-content">{{ item.description }}</view>
          <view class="question-footer">
            <text class="time">{{ item.time }}</text>
            <view class="stats">
              <view class="stat-item">
                <text class="count">{{ item.viewCount }}</text>
                <text class="label">浏览</text>
              </view>
              <view class="stat-item">
                <text class="count">{{ item.answerCount }}</text>
                <text class="label">回答</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else class="empty-state">
        <image class="empty-icon" src="/static/empty.png" mode="aspectFit"></image>
        <text class="empty-text">暂无提问记录</text>
        <view class="action-btn" @click="goToAsk">
          <text>去提问</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { store } from '@/common/store.js';

// 下拉刷新状态
const refreshing = ref(false);
// 我的问题列表
const myQuestions = ref([]);

// 获取我的问题列表
const fetchMyQuestions = () => {
  // 在实际应用中，这里应该从后端API获取用户的问题
  // 这里使用store中的问题列表模拟
  const allQuestions = store.getQuestions();
  
  // 添加一些额外的信息，如浏览次数、回答次数和提问时间
  myQuestions.value = allQuestions.map(question => ({
    ...question,
    viewCount: Math.floor(Math.random() * 100) + 5, // 模拟浏览次数
    answerCount: Math.floor(Math.random() * 10),   // 模拟回答次数
    time: getRandomTime()                          // 模拟提问时间
  }));
};

// 生成随机时间
const getRandomTime = () => {
  const times = ['刚刚', '10分钟前', '1小时前', '3小时前', '昨天', '2天前', '一周前'];
  return times[Math.floor(Math.random() * times.length)];
};

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true;
  
  setTimeout(() => {
    fetchMyQuestions();
    refreshing.value = false;
    
    uni.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 1000
    });
  }, 1000);
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转到文章详情
const goToArticle = (item) => {
  uni.navigateTo({
    url: `/pages/article/index?id=${item.id}`
  });
};

// 跳转到提问页面
const goToAsk = () => {
  uni.navigateTo({
    url: '/pages/ask/index'
  });
};

// 页面加载时获取数据
onMounted(() => {
  fetchMyQuestions();
});
</script>

<style lang="scss">
.my-questions-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  padding: 30rpx 40rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  
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
    
    .header-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
  }
}

.question-list {
  flex: 1;
  padding: 20rpx;
  
  .question-item {
    margin-bottom: 20rpx;
    padding: 30rpx;
    background-color: #fff;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
    
    .question-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
    }
    
    .question-content {
      font-size: 28rpx;
      color: #666;
      line-height: 1.5;
      margin-bottom: 20rpx;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    
    .question-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .time {
        font-size: 24rpx;
        color: #999;
      }
      
      .stats {
        display: flex;
        
        .stat-item {
          display: flex;
          align-items: center;
          margin-left: 30rpx;
          
          .count {
            font-size: 24rpx;
            color: #666;
            margin-right: 6rpx;
          }
          
          .label {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }
  }
}

.empty-state {
  padding-top: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 40rpx;
  }
  
  .action-btn {
    background-color: #e6f7ff;
    color: #1677ff;
    padding: 16rpx 60rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
  }
}
</style> 