<template>
  <view class="message-container">
    <!-- 头部 -->
    <view class="header">
      <text class="header-title">消息</text>
    </view>
    
    <!-- 消息分类标签 -->
    <view class="tab-bar">
      <view class="tab-item" :class="{ active: activeTab === 'all' }" @click="changeTab('all')">
        <text>全部</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'comment' }" @click="changeTab('comment')">
        <text>评论</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'like' }" @click="changeTab('like')">
        <text>点赞</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'system' }" @click="changeTab('system')">
        <text>系统</text>
      </view>
    </view>
    
    <!-- 消息列表 -->
    <scroll-view 
      class="message-list"
      scroll-y="true"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 消息项 -->
      <view 
        class="message-item" 
        v-for="(item, index) in displayMessages" 
        :key="index"
        @click="handleMessageClick(item)"
      >
        <view class="user-avatar">
          <image :src="item.avatar" mode="aspectFill"></image>
          <view class="unread-dot" v-if="!item.isRead"></view>
        </view>
        <view class="message-content">
          <view class="message-header">
            <text class="user-name">{{ item.userName }}</text>
            <text class="time">{{ item.time }}</text>
          </view>
          <view class="message-body">
            <text>{{ item.content }}</text>
          </view>
          <view class="message-footer" v-if="item.questionTitle">
            <text class="question-title">{{ item.questionTitle }}</text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="displayMessages.length === 0" class="empty-message">
        <image src="/static/empty.png" mode="aspectFit" class="empty-icon"></image>
        <text class="empty-text">暂无{{ getTabName() }}消息</text>
      </view>
    </scroll-view>
    
    <!-- 底部导航栏 -->
    <TabBar active-tab="message" @add-click="toggleActionMenu" />
    
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
import { ref, computed, onMounted } from 'vue';
import TabBar from '@/components/TabBar.vue';

// 当前活动标签
const activeTab = ref('all');
// 下拉刷新状态
const refreshing = ref(false);
// 是否显示底部操作菜单
const showActionMenu = ref(false);

// 消息数据
const messages = ref([
  {
    id: 1,
    type: 'comment',
    userName: '学习达人',
    avatar: '/static/avatar/user1.png',
    content: '回复了你的问题',
    questionTitle: '我们学校厉害吗？',
    time: '10分钟前',
    isRead: false
  },
  {
    id: 2,
    type: 'like',
    userName: '校园生活家',
    avatar: '/static/avatar/user2.png',
    content: '点赞了你的回答',
    questionTitle: '学校哪个食堂好吃？',
    time: '1小时前',
    isRead: true
  },
  {
    id: 3,
    type: 'comment',
    userName: '校园网红',
    avatar: '/static/avatar/user3.png',
    content: '评论了你的回答: 说得太对了！一食堂的红烧肉确实好吃！',
    questionTitle: '学校哪个食堂好吃？',
    time: '3小时前',
    isRead: false
  },
  {
    id: 4,
    type: 'system',
    userName: '系统通知',
    avatar: '/static/avatar/system.png',
    content: '你的账号已成功注册，欢迎加入速问社区！',
    time: '1天前',
    isRead: true
  },
  {
    id: 5,
    type: 'like',
    userName: '学习小王子',
    avatar: '/static/avatar/user4.png',
    content: '点赞了你的问题',
    questionTitle: '给你一个亿，你会在家睡觉还是在我们学校上课？',
    time: '2天前',
    isRead: true
  }
]);

// 根据当前选中的标签筛选要显示的消息
const displayMessages = computed(() => {
  if (activeTab.value === 'all') {
    return messages.value;
  } else {
    return messages.value.filter(item => item.type === activeTab.value);
  }
});

// 切换标签
const changeTab = (tab) => {
  activeTab.value = tab;
};

// 根据当前标签返回对应的名称
const getTabName = () => {
  switch (activeTab.value) {
    case 'comment':
      return '评论';
    case 'like':
      return '点赞';
    case 'system':
      return '系统';
    default:
      return '';
  }
};

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true;
  
  // 模拟加载数据
  setTimeout(() => {
    // 随机添加一条新消息
    if (Math.random() > 0.5) {
      const newTypes = ['comment', 'like', 'system'];
      const newType = newTypes[Math.floor(Math.random() * newTypes.length)];
      const newMessage = {
        id: messages.value.length + 1,
        type: newType,
        userName: newType === 'system' ? '系统通知' : '新用户' + Math.floor(Math.random() * 100),
        avatar: newType === 'system' ? '/static/avatar/system.png' : '/static/avatar/user' + Math.ceil(Math.random() * 4) + '.png',
        content: newType === 'system' ? '系统消息更新' : (newType === 'like' ? '点赞了你的内容' : '评论了你的内容'),
        questionTitle: '最新问题标题',
        time: '刚刚',
        isRead: false
      };
      messages.value.unshift(newMessage);
      
      // 显示新消息通知
      uni.showToast({
        title: '收到新消息',
        icon: 'success'
      });
    } else {
      // 没有新消息
      uni.showToast({
        title: '暂无新消息',
        icon: 'none'
      });
    }
    
    refreshing.value = false;
  }, 1000);
};

// 处理消息点击
const handleMessageClick = (message) => {
  // 标记为已读
  message.isRead = true;
  
  // 根据消息类型进行不同处理
  if (message.type === 'system') {
    // 系统消息不跳转
    uni.showToast({
      title: '已查看系统消息',
      icon: 'none'
    });
  } else {
    // 其他消息跳转到对应问题
    uni.navigateTo({
      url: `/pages/article/index?id=${message.id}`
    });
  }
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

// 页面加载时执行
onMounted(() => {
  // 如果需要，可以在这里加载消息数据
});
</script>

<style lang="scss">
.message-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 100rpx; // 为底部导航栏留出空间
}

.header {
  padding: 30rpx 40rpx;
  background-color: #fff;
  
  .header-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    display: block;
  }
}

.tab-bar {
  display: flex;
  height: 80rpx;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  
  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #666;
    position: relative;
    
    &.active {
      color: #333;
      font-weight: bold;
      
      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background-color: #1677ff;
      }
    }
  }
}

.message-list {
  flex: 1;
  height: calc(100vh - 190rpx - 100rpx); // 减去头部高度和底部导航栏高度
  
  .message-item {
    display: flex;
    padding: 30rpx 40rpx;
    background-color: #fff;
    margin-bottom: 2rpx;
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 40rpx;
      right: 0;
      height: 1rpx;
      background-color: #f0f0f0;
    }
    
    .user-avatar {
      width: 80rpx;
      height: 80rpx;
      margin-right: 24rpx;
      position: relative;
      
      image {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
      
      .unread-dot {
        position: absolute;
        top: 0;
        right: 0;
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        background-color: #ff4d4f;
      }
    }
    
    .message-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .message-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10rpx;
        
        .user-name {
          font-size: 28rpx;
          font-weight: 500;
          color: #333;
        }
        
        .time {
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .message-body {
        font-size: 28rpx;
        color: #666;
        line-height: 1.5;
        margin-bottom: 10rpx;
      }
      
      .message-footer {
        background-color: #f9f9f9;
        padding: 16rpx 20rpx;
        border-radius: 8rpx;
        margin-top: 10rpx;
        
        .question-title {
          font-size: 26rpx;
          color: #666;
        }
      }
    }
  }
  
  .empty-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 200rpx;
    
    .empty-icon {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 30rpx;
      opacity: 0.5;
    }
    
    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
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
</style> 