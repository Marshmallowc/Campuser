<template>
  <view class="my-favorites-container">
    <!-- 头部 -->
    <view class="header">
      <view class="left-section">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="header-title">我的收藏</text>
      </view>
    </view>
    
    <!-- 收藏列表 -->
    <scroll-view 
      class="favorite-list"
      scroll-y="true"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="myFavorites.length > 0">
        <view 
          class="favorite-item" 
          v-for="(item, index) in myFavorites" 
          :key="index"
          @click="goToArticle(item)"
        >
          <view class="question-title">{{ item.title }}</view>
          <view class="question-content">{{ item.description }}</view>
          <view class="favorite-footer">
            <view class="user-info">
              <image class="user-avatar" :src="item.avatar"></image>
              <text class="user-name">{{ item.userName }}</text>
            </view>
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
          <view class="favorite-actions">
            <view class="action-btn remove-btn" @click.stop="removeFavorite(item.id)">
              <text>取消收藏</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else class="empty-state">
        <image class="empty-icon" src="/static/empty.png" mode="aspectFit"></image>
        <text class="empty-text">暂无收藏记录</text>
        <view class="action-btn" @click="goToIndex">
          <text>去浏览</text>
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
// 我的收藏列表
const myFavorites = ref([]);

// 获取我的收藏列表
const fetchMyFavorites = () => {
  // 从全局存储中获取收藏列表
  myFavorites.value = store.getFavorites();
};

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true;
  
  setTimeout(() => {
    fetchMyFavorites();
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

// 跳转到首页
const goToIndex = () => {
  uni.reLaunch({
    url: '/pages/index/index'
  });
};

// 取消收藏
const removeFavorite = (id) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消收藏吗？',
    success: (res) => {
      if (res.confirm) {
        // 从收藏列表中移除
        store.removeFavorite(id);
        // 刷新收藏列表
        fetchMyFavorites();
        
        uni.showToast({
          title: '已取消收藏',
          icon: 'success',
          duration: 1500
        });
      }
    }
  });
};

// 页面加载时获取数据
onMounted(() => {
  fetchMyFavorites();
});
</script>

<style lang="scss">
.my-favorites-container {
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

.favorite-list {
  flex: 1;
  padding: 20rpx;
  
  .favorite-item {
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
    
    .favorite-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .user-info {
        display: flex;
        align-items: center;
        
        .user-avatar {
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          margin-right: 10rpx;
        }
        
        .user-name {
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .stats {
        display: flex;
        
        .stat-item {
          display: flex;
          align-items: center;
          margin-left: 20rpx;
          
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
    
    .favorite-actions {
      display: flex;
      justify-content: flex-end;
      
      .action-btn {
        padding: 10rpx 30rpx;
        border-radius: 30rpx;
        font-size: 24rpx;
        
        &.remove-btn {
          background-color: #f5f5f5;
          color: #ff4d4f;
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