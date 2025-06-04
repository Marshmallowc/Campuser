<template>
  <view class="my-answers-container safe-area-top">
    <!-- 头部 -->
    <view class="header">
      <view class="left-section">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="header-title">我的回答</text>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 回答列表 -->
    <scroll-view 
      v-else
      class="answer-list"
      scroll-y="true"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="myAnswers.length > 0">
        <view 
          class="answer-item" 
          v-for="(item, index) in myAnswers" 
          :key="index"
          @click="goToArticle(item)"
        >
          <view class="question-title">{{ item.questionTitle }}</view>
          <view class="answer-content">{{ item.content }}</view>
          <view class="answer-footer">
            <text class="time">{{ formatDateTime(item.time || item.createdAt) }}</text>
            <view class="stats">
              <view class="stat-item">
                <text class="count">{{ item.likes || 0 }}</text>
                <text class="label">点赞</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else class="empty-state">
        <image class="empty-icon" src="/static/empty.png" mode="aspectFit"></image>
        <text class="empty-text">暂无回答记录</text>
        <view class="action-btn" @click="goToAnswer">
          <text>去回答</text>
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
// 加载状态
const loading = ref(true);
// 我的回答列表
const myAnswers = ref([]);

// 获取我的回答列表
const fetchMyAnswers = async () => {
  loading.value = true;
  try {
    // 调用store中的方法获取真实数据
    const result = await store.getMyAnswers();
    console.log('获取我的回答列表结果:', result);
    
    if (result && result.success) {
      myAnswers.value = result.answers || [];
    } else {
      // 获取失败时显示提示
      uni.showToast({
        title: result.message || '获取回答列表失败',
        icon: 'none'
      });
      myAnswers.value = [];
    }
  } catch (error) {
    console.error('获取我的回答列表出错:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
    myAnswers.value = [];
  } finally {
    loading.value = false;
  }
};

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true;
  
  try {
    await fetchMyAnswers();
    uni.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 1000
    });
  } catch (error) {
    console.error('刷新失败:', error);
  } finally {
    refreshing.value = false;
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转到文章详情
const goToArticle = (item) => {
  uni.navigateTo({
    url: `/pages/article/index?id=${item.questionId}`
  });
};

// 跳转到回答页面
const goToAnswer = () => {
  uni.reLaunch({
    url: '/pages/index/index'
  });
};

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '未知时间';
  
  // 检查是否是相对时间格式（如"3天前"）
  if (typeof dateTimeStr === 'string' && 
      (dateTimeStr.includes('天前') || 
       dateTimeStr.includes('小时前') || 
       dateTimeStr.includes('分钟前') || 
       dateTimeStr.includes('周前'))) {
    return dateTimeStr;
  }
  
  try {
    const date = new Date(dateTimeStr);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return dateTimeStr;
    }
    
    // 计算相对时间
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        if (diffMinutes === 0) {
          return '刚刚';
        }
        return `${diffMinutes}分钟前`;
      }
      return `${diffHours}小时前`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}周前`;
    } else {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
  } catch (error) {
    return dateTimeStr;
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchMyAnswers();
});
</script>

<style lang="scss">
.my-answers-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 80rpx;
  /* #ifdef MP-WEIXIN */
  padding-top: calc(80rpx + constant(safe-area-inset-top)); /* 兼容 iOS < 11.2 */
  padding-top: calc(80rpx + env(safe-area-inset-top)); /* 兼容 iOS >= 11.2 */
  /* #endif */
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300rpx;
  
  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid #f3f3f3;
    border-top: 4rpx solid #1677ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20rpx;
  }
  
  .loading-text {
    font-size: 28rpx;
    color: #999;
  }
}

.header {
  padding: 20rpx 40rpx 30rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
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
    
    .header-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
  }
}

.answer-list {
  flex: 1;
  padding: 20rpx;
  
  .answer-item {
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
    
    .answer-content {
      font-size: 28rpx;
      color: #666;
      line-height: 1.5;
      margin-bottom: 20rpx;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    
    .answer-footer {
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style> 