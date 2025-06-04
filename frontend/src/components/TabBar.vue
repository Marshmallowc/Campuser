<template>
  <view class="tabbar">
    <view 
      class="tabbar-item" 
      :class="{ active: activeTab === 'home' }" 
      @click="switchTab('home')"
    >
      <text class="tabbar-icon">🏠</text>
      <text class="tabbar-text">首页</text>
    </view>
    <view 
      class="tabbar-item" 
      :class="{ active: activeTab === 'qa' }" 
      @click="switchTab('qa')"
    >
      <text class="tabbar-icon">📝</text>
      <text class="tabbar-text">直答</text>
    </view>
    <view class="tabbar-item add-btn" @click="showAddMenu">
      <view class="add-circle">
        <text class="add-icon">+</text>
      </view>
    </view>
    <view 
      class="tabbar-item" 
      :class="{ active: activeTab === 'message' }" 
      @click="switchTab('message')"
    >
      <text class="tabbar-icon">💬</text>
      <text class="tabbar-text">消息</text>
    </view>
    <view 
      class="tabbar-item" 
      :class="{ active: activeTab === 'user' }" 
      @click="switchTab('user')"
    >
      <text class="tabbar-icon">👤</text>
      <text class="tabbar-text">我的</text>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 定义属性
const props = defineProps({
  activeTab: {
    type: String,
    default: 'home'
  }
});

// 定义事件
const emit = defineEmits(['tab-click', 'add-click']);

// 切换标签页
const switchTab = (tab) => {
  if (tab === props.activeTab) return;
  emit('tab-click', tab);
  
  // 根据标签执行对应跳转
  switch (tab) {
    case 'home':
      navigateTo('/pages/index/index');
      break;
    case 'qa':
      // 直答页面暂未实现
      showToast('直答功能开发中');
      break;
    case 'message':
      navigateTo('/pages/message/index');
      break;
    case 'user':
      navigateTo('/pages/profile/index');
      break;
  }
};

// 显示添加菜单
const showAddMenu = () => {
  emit('add-click');
};

// 页面跳转封装
const navigateTo = (url) => {
  uni.navigateTo({
    url,
    fail: () => {
      uni.reLaunch({
        url
      });
    }
  });
};

// 提示信息
const showToast = (title) => {
  uni.showToast({
    title,
    icon: 'none'
  });
};
</script>

<style lang="scss">
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  z-index: 99;
  /* 安全区域适配 */
  padding-bottom: constant(safe-area-inset-bottom); /* 兼容 iOS < 11.2 */
  padding-bottom: env(safe-area-inset-bottom); /* 兼容 iOS >= 11.2 */
  box-shadow: 0 -1px 0 0 rgba(0, 0, 0, 0.05);
  
  .tabbar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    transition: all 0.2s;
    
    &.active {
      .tabbar-icon {
        transform: scale(1.1);
      }
      
      .tabbar-text {
        color: #228be6;
        font-weight: 500;
      }
    }
    
    .tabbar-icon {
      font-size: 40rpx;
      margin-bottom: 4rpx;
    }
    
    .tabbar-text {
      font-size: 20rpx;
      color: #868e96;
    }
    
    &.add-btn {
      position: relative;
      
      .add-circle {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
        background: linear-gradient(135deg, #4dabf7 0%, #228be6 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: -40rpx;
        
        .add-icon {
          color: #fff;
          font-size: 50rpx;
          font-weight: 300;
        }
      }
    }
  }
}
</style> 