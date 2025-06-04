<template>
  <view class="edit-profile-container">
    <!-- 头部 -->
    <view class="header">
      <view class="left-section">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="header-title">编辑资料</text>
      </view>
      <view class="save-btn" @click="saveProfile" :class="{ 'disabled': loading }">
        <text>{{ loading ? '保存中...' : '保存' }}</text>
      </view>
    </view>
    
    <!-- 表单区域 -->
    <view class="form-container">
      <!-- 头像选择 -->
      <view class="form-item avatar-item">
        <text class="form-label">头像</text>
        <view class="avatar-selector" @click="chooseAvatar">
          <img class="avatar" :src="userProfile.avatar" mode="aspectFill" />
          <view class="edit-icon">
            <text class="icon-text">编辑</text>
          </view>
        </view>
      </view>
      
      <!-- 用户名 -->
      <view class="form-item">
        <text class="form-label">用户名</text>
        <input 
          class="form-input" 
          type="text" 
          v-model="userProfile.username" 
          placeholder="请输入用户名" 
          maxlength="20"
          :disabled="loading"
        />
      </view>
      
      <!-- 生日 -->
      <view class="form-item">
        <text class="form-label">生日</text>
        <picker 
          class="form-picker" 
          mode="date" 
          :value="userProfile.birthday" 
          start="1900-01-01" 
          :end="currentDate" 
          @change="birthdayChange"
          :disabled="loading"
        >
          <view class="picker-text">{{ userProfile.birthday || '请选择生日' }}</view>
        </picker>
      </view>
      
      <!-- 个人介绍 -->
      <view class="form-item">
        <text class="form-label">个人介绍</text>
        <textarea 
          class="form-textarea" 
          v-model="userProfile.bio" 
          placeholder="用一句话介绍自己" 
          maxlength="100"
          :disabled="loading"
        />
        <text class="char-count">{{ userProfile.bio.length }}/100</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { store } from '@/common/store.js';
import { api } from '@/common/api.js'; // 导入api模块以使用getFullUrl函数

// 加载状态
const loading = ref(false);

// 获取当前日期
const currentDate = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

// 用户资料数据
const userProfile = reactive({
  username: '',
  avatar: '',
  birthday: '',
  bio: ''
});

// 加载用户资料
const loadUserProfile = () => {
  const profile = store.getUserProfile();
  userProfile.username = profile.username;
  userProfile.avatar = profile.avatar;
  userProfile.birthday = profile.birthday || '';
  userProfile.bio = profile.bio || '';
};

// 生日选择器改变事件
const birthdayChange = (e) => {
  userProfile.birthday = e.detail.value;
};

// 选择头像
const chooseAvatar = () => {
  if (loading.value) return;
  
  console.log('准备选择头像，当前头像URL:', userProfile.avatar);
  
  uni.chooseImage({
    count: 1, // 默认9
    sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 从相册选择或使用相机拍摄
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0];
      console.log('选择图片成功，临时路径:', tempFilePath);
      
      // 显示上传中提示
      uni.showLoading({
        title: '上传中...'
      });
      
      try {
        // 上传头像到服务器
        console.log('开始上传头像');
        const result = await store.uploadAvatar(tempFilePath);
        console.log('上传头像结果:', result);
        
        if (result.success) {
          // 直接设置临时文件作为预览，避免网络延迟
          userProfile.avatar = tempFilePath;
          
          // 服务器返回的URL设置到用户资料
          setTimeout(() => {
            if (result.avatarUrl) {
              // 确保URL是完整的，如果不是，则添加服务器域名前缀
              const fullAvatarUrl = api.getFullUrl(result.avatarUrl);
              userProfile.avatar = fullAvatarUrl;
              console.log('更新头像URL为:', fullAvatarUrl);
            }
          }, 500);
          
          uni.hideLoading();
          uni.showToast({
            title: '头像上传成功',
            icon: 'success'
          });
        } else {
          uni.hideLoading();
          uni.showToast({
            title: result.message || '头像上传失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('上传头像出错:', error);
        uni.hideLoading();
        uni.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        });
      }
    },
    fail: (error) => {
      console.error('选择图片失败:', error);
    }
  });
};

// 保存用户资料
const saveProfile = async () => {
  // 表单验证
  if (!userProfile.username.trim()) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    });
    return;
  }
  
  // 防止重复提交
  if (loading.value) return;
  loading.value = true;
  
  try {
    // 调用API更新资料
    const result = await store.updateUserProfile({
      username: userProfile.username,
      birthday: userProfile.birthday,
      bio: userProfile.bio
    });
    
    if (result.success) {
      // 更新成功
      uni.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500,
        success: () => {
          // 保存成功后返回上一页
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }
      });
    } else {
      // 更新失败
      uni.showToast({
        title: result.message || '保存失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('保存资料出错:', error);
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 页面加载时获取用户资料
onMounted(() => {
  loadUserProfile();
});
</script>

<style lang="scss">
.edit-profile-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  background-color: #fff;
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
  
  .save-btn {
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
    
    &.disabled {
      background-color: #f5f5f5;
      color: #999;
      box-shadow: none;
    }
  }
}

.form-container {
  padding: 30rpx;
  
  .form-item {
    margin-bottom: 40rpx;
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    position: relative;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
    
    .form-label {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 20rpx;
      display: block;
    }
    
    .form-input {
      font-size: 32rpx;
      color: #333;
      width: 100%;
      height: 80rpx;
      padding: 0 15rpx;
    }
    
    .form-picker {
      font-size: 32rpx;
      color: #333;
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      
      .picker-text {
        padding: 0 15rpx;
      }
    }
    
    .form-textarea {
      font-size: 32rpx;
      color: #333;
      width: 100%;
      height: 200rpx;
      padding: 15rpx;
      box-sizing: border-box;
    }
    
    .char-count {
      position: absolute;
      right: 30rpx;
      bottom: 30rpx;
      font-size: 24rpx;
      color: #999;
    }
    
    &.avatar-item {
      display: flex;
      align-items: center;
      
      .form-label {
        margin-bottom: 0;
        margin-right: 40rpx;
      }
      
      .avatar-selector {
        position: relative;
        
        .avatar {
          width: 120rpx;
          height: 120rpx;
          border-radius: 60rpx;
          background-color: #f0f0f0;
        }
        
        .edit-icon {
          position: absolute;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          color: #fff;
          font-size: 20rpx;
          padding: 4rpx 10rpx;
          border-radius: 20rpx;
        }
      }
    }
  }
}
</style> 