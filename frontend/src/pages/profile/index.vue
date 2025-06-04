<template>
  <view class="profile-container safe-area-top">
    <!-- 加载状态 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <template v-else>
      <!-- 用户信息卡片 -->
      <UserCard 
        :userInfo="userInfo" 
        @edit="editProfile" 
        @settings="toSettings" 
      />
      
      <!-- 数据统计 -->
      <view class="stat-section">
        <view class="stat-item" @click="goToMyContent('questions')">
          <text class="stat-num">{{ statistics.questions }}</text>
          <text class="stat-label">提问</text>
        </view>
        <view class="divider"></view>
        <view class="stat-item" @click="goToMyContent('answers')">
          <text class="stat-num">{{ statistics.answers }}</text>
          <text class="stat-label">回答</text>
        </view>
        <view class="divider"></view>
        <view class="stat-item" @click="goToMyContent('followers')">
          <text class="stat-num">{{ statistics.followers }}</text>
          <text class="stat-label">关注者</text>
        </view>
        <view class="divider"></view>
        <view class="stat-item" @click="goToMyContent('following')">
          <text class="stat-num">{{ statistics.following }}</text>
          <text class="stat-label">关注</text>
        </view>
      </view>
      
      <!-- 功能列表 -->
      <view class="feature-section">
        <view class="section-title">我的内容</view>
        <view class="feature-list">
          <view class="feature-item" @click="goToMyContent('questions')">
            <view class="feature-icon my-questions"></view>
            <text class="feature-name">我的提问</text>
            <text class="feature-arrow">></text>
          </view>
          <view class="feature-item" @click="goToMyContent('answers')">
            <view class="feature-icon my-answers"></view>
            <text class="feature-name">我的回答</text>
            <text class="feature-arrow">></text>
          </view>
          <view class="feature-item" @click="goToMyContent('favorites')">
            <view class="feature-icon my-favorites"></view>
            <text class="feature-name">我的收藏</text>
            <text class="feature-arrow">></text>
          </view>
          <view class="feature-item" @click="goToMyContent('drafts')">
            <view class="feature-icon my-drafts"></view>
            <text class="feature-name">草稿箱</text>
            <text class="feature-arrow">></text>
          </view>
        </view>
      </view>
      
      <view class="feature-section">
        <view class="section-title">其他功能</view>
        <view class="feature-list">
          <view class="feature-item" @click="goToPage('feedback')">
            <view class="feature-icon feedback"></view>
            <text class="feature-name">反馈与帮助</text>
            <text class="feature-arrow">></text>
          </view>
          <view class="feature-item" @click="goToPage('about')">
            <view class="feature-icon about"></view>
            <text class="feature-name">关于我们</text>
            <text class="feature-arrow">></text>
          </view>
        </view>
      </view>
      
      <!-- 退出登录按钮 -->
      <view class="logout-btn" @click="logout">
        <text>退出登录</text>
      </view>
    </template>
    
    <!-- 底部导航栏 -->
    <TabBar active-tab="user" @add-click="toggleActionMenu" />
    
    <!-- 底部弹出菜单 -->
    <view class="action-menu" v-if="showActionMenu">
      <view class="action-menu-content" @click.stop>
        <view class="action-menu-header">
          <text class="header-title">请选择操作</text>
          <view class="close-btn" @click="toggleActionMenu">×</view>
        </view>
        <view class="action-menu-items">
          <view class="action-menu-item" @click="handleAsk">
            <view class="action-icon-wrapper ask-icon">
              <image class="action-icon" src="/static/ask.svg"></image>
            </view>
            <text class="action-text">提问</text>
          </view>
          <view class="action-menu-item" @click="handleAnswer">
            <view class="action-icon-wrapper answer-icon">
              <image class="action-icon" src="/static/answer.svg"></image>
            </view>
            <text class="action-text">回答问题</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 遮罩层 -->
    <view class="mask" v-if="showActionMenu" @click="toggleActionMenu"></view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import TabBar from '@/components/TabBar.vue';
import UserCard from './components/UserCard.vue';
import { store } from '@/common/store.js';
import { api } from '@/common/api.js';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';

// 是否显示底部操作菜单
const showActionMenu = ref(false);

// 加载状态
const loading = ref(false);

// 用户信息
const userInfo = reactive({
  username: '',
  avatar: '',
  bio: '',
  level: 0,
  levelProgress: 0,
  points: 0
});

// 统计数据
const statistics = reactive({
  questions: 0,
  answers: 0,
  followers: 0,
  following: 0
});

// 加载用户信息和统计数据
const loadUserData = async () => {
  loading.value = true;
  try {
    // 获取用户资料
    await store.fetchUserProfile();
    const profile = store.getUserProfile();
    
    // 更新用户信息
    userInfo.username = profile.username;
    
    // 确保头像URL是完整的
    if (profile.avatar) {
      console.log('原始头像URL:', profile.avatar);
      userInfo.avatar = api.getFullUrl(profile.avatar);
      console.log('处理后的头像URL:', userInfo.avatar);
    } else {
      userInfo.avatar = '/static/avatar/user1.png'; // 本地默认头像不需要转换
    }
    
    userInfo.bio = profile.bio || '这个人很懒，什么都没留下';
    userInfo.level = profile.level || 1;
    userInfo.levelProgress = profile.levelProgress || 0;
    userInfo.points = profile.points || 0;
    
    // 获取统计数据
    const stats = await store.fetchUserStatistics();
    if (stats) {
      statistics.questions = stats.questions;
      statistics.answers = stats.answers;
      statistics.followers = stats.followers;
      statistics.following = stats.following;
    }
  } catch (error) {
    console.error('加载用户数据失败:', error);
    // 确保在出错时也设置默认头像
    userInfo.avatar = '/static/avatar/user1.png';
    uni.showToast({
      title: '加载用户数据失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    // 如果是下拉刷新触发的加载，停止下拉刷新动画
    uni.stopPullDownRefresh();
  }
};

// 处理下拉刷新
onPullDownRefresh(() => {
  // 刷新用户数据
  loadUserData();
});

// 编辑个人资料
const editProfile = () => {
  uni.navigateTo({
    url: '/pages/edit-profile/index'
  });
};

// 前往设置页面
const toSettings = () => {
  uni.showToast({
    title: '设置功能开发中',
    icon: 'none'
  });
};

// 跳转到我的内容
const goToMyContent = (type) => {
  switch (type) {
    case 'questions':
      uni.navigateTo({
        url: '/pages/my-questions/index'
      });
      break;
    case 'answers':
      uni.navigateTo({
        url: '/pages/my-answers/index'
      });
      break;
    case 'favorites':
      uni.navigateTo({
        url: '/pages/my-favorites/index'
      });
      break;
    default:
      uni.showToast({
        title: `${type}功能开发中`,
        icon: 'none'
      });
  }
};

// 跳转到其他页面
const goToPage = (page) => {
  uni.showToast({
    title: `${page}功能开发中`,
    icon: 'none'
  });
};

// 退出登录
const logout = async () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 调用退出登录API
          await api.auth.logout();
          
          // 清除本地存储的用户数据
          uni.removeStorageSync('token');
          uni.removeStorageSync('userId');
          
          // 显示退出提示
          uni.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 2000
          });
          
          // 返回登录页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/index'
            });
          }, 2000);
        } catch (error) {
          console.error('退出登录失败:', error);
          // 即使API调用失败也清除本地存储的用户数据，确保用户可以退出
          uni.removeStorageSync('token');
          uni.removeStorageSync('userId');
          
          uni.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 2000
          });
          
          // 返回登录页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/index'
            });
          }, 2000);
        }
      }
    }
  });
};

// 切换底部操作菜单显示状态
const toggleActionMenu = () => {
  showActionMenu.value = !showActionMenu.value;
};

// 处理提问操作
const handleAsk = () => {
  showActionMenu.value = false;
  // 跳转到提问页面
  uni.navigateTo({
    url: '/pages/ask/index'
  });
};

// 处理回答操作
const handleAnswer = () => {
  showActionMenu.value = false;
  // 跳转到回答页面
  uni.navigateTo({
    url: '/pages/answer/index'
  });
};

// 页面加载完成时执行
onMounted(() => {
  loadUserData();
});

// 每次显示页面时检查头像
onShow(() => {
  // 检查并更新默认头像
  store.checkAndUpdateDefaultAvatar().then(result => {
    if (result && result.success) {
      console.log('自动更新了用户头像:', result.avatar);
      loadUserData(); // 重新加载用户数据以显示新头像
    }
  });
});
</script>

<style lang="scss">
.profile-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 100rpx; // 为底部导航栏留出空间
  padding-top: 80rpx; // 增加顶部间距，避免被手机摄像头遮挡
  /* #ifdef MP-WEIXIN */
  padding-top: calc(80rpx + constant(safe-area-inset-top)); /* 兼容 iOS < 11.2 */
  padding-top: calc(80rpx + env(safe-area-inset-top)); /* 兼容 iOS >= 11.2 */
  /* #endif */
}

// 加载状态
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300rpx;
  margin: 30rpx;
  padding: 50rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
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

// 数据统计
.stat-section {
  margin: 0 30rpx 30rpx;
  padding: 30rpx 0;
  background-color: #fff;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .stat-num {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 10rpx;
    }
    
    .stat-label {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .divider {
    width: 1px;
    height: 60rpx;
    background-color: #eee;
  }
}

// 功能列表
.feature-section {
  margin: 0 30rpx 30rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
  
  .section-title {
    padding: 30rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .feature-list {
    .feature-item {
      display: flex;
      align-items: center;
      padding: 30rpx;
      position: relative;
      
      &:after {
        content: '';
        position: absolute;
        left: 30rpx;
        right: 30rpx;
        bottom: 0;
        height: 1px;
        background-color: #f0f0f0;
      }
      
      &:last-child:after {
        display: none;
      }
      
      .feature-icon {
        width: 50rpx;
        height: 50rpx;
        margin-right: 20rpx;
        background-color: #f0f0f0;
        border-radius: 10rpx;
        
        &.my-questions {
          background-color: #e6f7ff;
        }
        
        &.my-answers {
          background-color: #e6fffb;
        }
        
        &.my-favorites {
          background-color: #fff7e6;
        }
        
        &.my-drafts {
          background-color: #f9f0ff;
        }
        
        &.feedback {
          background-color: #f6ffed;
        }
        
        &.about {
          background-color: #fcffe6;
        }
      }
      
      .feature-name {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }
      
      .feature-arrow {
        font-size: 28rpx;
        color: #bbb;
      }
    }
  }
}

// 退出登录按钮
.logout-btn {
  margin: 30rpx;
  height: 90rpx;
  background-color: #fff;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #ff4d4f;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

// 底部弹出菜单样式
.action-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  
  .action-menu-content {
    width: 100%;
    background-color: #fff;
    border-top-left-radius: 20rpx;
    border-top-right-radius: 20rpx;
    padding: 40rpx 30rpx 60rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: slideUp 0.3s ease;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
    
    .action-menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 20rpx 30rpx;
      border-bottom: 1px solid #f5f5f5;
      margin-bottom: 30rpx;
      
      .header-title {
        font-size: 28rpx;
        color: #666;
      }
      
      .close-btn {
        width: 40rpx;
        height: 40rpx;
        font-size: 32rpx;
        color: #999;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .action-menu-items {
      display: flex;
      justify-content: space-around;
      width: 100%;
      padding: 0 20rpx;
      
      .action-menu-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20rpx 40rpx;
        border-radius: 12rpx;
        transition: all 0.2s;
        
        &:active {
          background-color: #f9f9f9;
        }
        
        .action-icon-wrapper {
          width: 110rpx;
          height: 110rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20rpx;
          transition: all 0.2s;
          
          &.ask-icon {
            background-color: #e8f4ff;
            border: 1px solid #d0e8ff;
          }
          
          &.answer-icon {
            background-color: #e8fff0;
            border: 1px solid #d0ffe8;
          }
          
          &:active {
            transform: scale(0.95);
          }
        }
        
        .action-icon {
          width: 50rpx;
          height: 50rpx;
        }
        
        .action-text {
          font-size: 30rpx;
          color: #333;
          font-weight: 500;
        }
      }
    }
  }
}

// 遮罩层
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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