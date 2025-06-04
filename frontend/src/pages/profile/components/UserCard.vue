<!-- 用户信息卡片组件 -->
<template>
  <view class="user-card">
    <view class="user-info">
      <img class="avatar" :src="userInfo.avatar" mode="aspectFill" />
      <view class="user-details">
        <view class="username">{{ userInfo.username }}</view>
        <view class="bio">{{ userInfo.bio }}</view>
        <view class="level-info">
          <text class="level">Lv.{{ userInfo.level }}</text>
          <view class="level-progress">
            <view class="progress-bar" :style="{ width: userInfo.levelProgress + '%' }"></view>
          </view>
          <text class="points">{{ userInfo.points }} 积分</text>
        </view>
      </view>
    </view>
    <view class="action-buttons">
      <view class="action-btn edit-btn" @click="$emit('edit')">
        <text>编辑资料</text>
      </view>
      <view class="action-btn settings-btn" @click="$emit('settings')">
        <text>设置</text>
      </view>
    </view>
  </view>
</template>

<script setup>
// 接收用户信息作为props
const props = defineProps({
  userInfo: {
    type: Object,
    required: true,
    default: () => ({
      username: '未知用户',
      avatar: '/static/avatar/default1.png',
      bio: '这个人很懒，什么都没留下',
      level: 1,
      levelProgress: 0,
      points: 0
    })
  }
});

// 定义组件事件
defineEmits(['edit', 'settings']);
</script>

<style lang="scss" scoped>
.user-card {
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  padding: 30rpx;
  margin: 30rpx 30rpx 20rpx;
  
  .user-info {
    display: flex;
    margin-bottom: 30rpx;
    
    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      margin-right: 30rpx;
      border: 1px solid #f0f0f0;
      object-fit: cover;
    }
    
    .user-details {
      flex: 1;
      
      .username {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 10rpx;
      }
      
      .bio {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 20rpx;
        line-height: 1.4;
      }
      
      .level-info {
        display: flex;
        align-items: center;
        
        .level {
          font-size: 24rpx;
          color: #1677ff;
          background-color: #e8f4ff;
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
          margin-right: 20rpx;
        }
        
        .level-progress {
          flex: 1;
          height: 16rpx;
          background-color: #f0f0f0;
          border-radius: 8rpx;
          overflow: hidden;
          margin-right: 20rpx;
          
          .progress-bar {
            height: 100%;
            background-color: #1677ff;
            border-radius: 8rpx;
          }
        }
        
        .points {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
  
  .action-buttons {
    display: flex;
    justify-content: space-between;
    
    .action-btn {
      height: 70rpx;
      font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 35rpx;
      flex: 1;
      
      &.edit-btn {
        background-color: #1677ff;
        color: #fff;
        margin-right: 20rpx;
      }
      
      &.settings-btn {
        background-color: #f5f5f5;
        color: #666;
      }
    }
  }
}
</style> 