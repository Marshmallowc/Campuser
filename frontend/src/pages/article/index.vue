<template>
  <view class="article-container safe-area-top">
    <!-- 加载状态 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <template v-else>
      <!-- 文章标题 -->
      <view class="article-title">
        {{ article.title }}
      </view>
      
      <!-- 分割线 -->
      <view class="divider"></view>
      
      <!-- 作者信息和关注按钮 -->
      <view class="author-section">
        <view class="author-info">
          <image class="author-avatar" :src="getAvatarUrl(article.avatar)" mode="aspectFill"></image>
          <text class="author-name">{{ article.userName }}</text>
        </view>
        <view class="follow-btn" @click="toggleFollow">
          <text class="follow-icon">+</text>
          <text>关注</text>
        </view>
      </view>
      
      <!-- 统计信息 -->
      <view class="stats-section">
        <text class="time">{{ formatDateTime(article.time) }}</text>
        <view class="stats-divider"></view>
        <text class="stat-item">{{ article.viewCount || 0 }} 浏览</text>
        <view class="stats-divider"></view>
        <text class="stat-item">{{ article.answerCount || 0 }} 回答</text>
      </view>
      
      <!-- 文章内容 -->
      <view class="article-content">
        {{ article.description }}
      </view>
      
      <!-- 分割线 -->
      <view class="divider"></view>
      
      <!-- 回答列表 -->
      <view class="answers-section">
        <view class="section-title">
          <text class="title-text">回答</text>
          <text class="answer-count">{{ answersList.length }}</text>
        </view>
        
        <!-- 加载回答状态 -->
        <view class="loading-answers" v-if="loadingAnswers">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载回答中...</text>
        </view>
        
        <!-- 没有回答 -->
        <view class="no-answers" v-else-if="answersList.length === 0">
          <text class="no-answers-text">暂无回答，快来回答吧</text>
          <view class="write-answer-btn" @click="goToWriteAnswer">写回答</view>
        </view>
        
        <!-- 回答列表 -->
        <view class="answer-item" v-else v-for="(answer, index) in answersList" :key="index">
          <view class="answer-author">
            <image class="author-avatar-small" :src="getAvatarUrl(answer.avatar)" mode="aspectFill"></image>
            <text class="author-name">{{ answer.userName }}</text>
          </view>
          <view class="answer-content">{{ answer.content }}</view>
          <view class="answer-footer">
            <text class="answer-time">{{ formatDateTime(answer.time) }}</text>
            <view class="answer-actions">
              <view class="action-item" :class="{ active: answer.isLiked }" @click="toggleLike(answer, index)">
                <image class="action-icon" :src="answer.isLiked ? '/static/thumbsuped.svg' : '/static/thumbsup.svg'"></image>
                <text class="action-count">{{ answer.likes }}</text>
              </view>
              <view class="action-item" :class="{ active: answer.isDisliked }" @click="toggleDislike(answer, index)">
                <image class="action-icon" :src="answer.isDisliked ? '/static/hated.svg' : '/static/hate.svg'"></image>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部互动按钮 -->
      <view class="interaction-bar">
        <view class="interaction-buttons">
          <view class="interaction-item" :class="{ active: article.isLiked }" @click="thumbsUp">
            <image class="interaction-icon" :src="article.isLiked ? '/static/thumbsuped.svg' : '/static/thumbsup.svg'"></image>
          </view>
          
          <view class="interaction-item" :class="{ active: article.isDisliked }" @click="hate">
            <image class="interaction-icon" :src="article.isDisliked ? '/static/hated.svg' : '/static/hate.svg'"></image>
          </view>
          
          <view class="interaction-item" :class="{ active: article.isFavorite }" @click="bookmark">
            <image class="interaction-icon" :src="article.isFavorite ? '/static/bookmarked.svg' : '/static/bookmark.svg'"></image>
          </view>
          
          <view class="interaction-item write-answer" @click="goToWriteAnswer">
            <text>写回答</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { store } from '@/common/store.js';
import { api } from '@/common/api.js';

// 加载状态
const loading = ref(true);
const loadingAnswers = ref(false);

// 问题ID
const questionId = ref(0);

// 文章数据
const article = ref({
  id: 0,
  title: '',
  userName: '',
  avatar: '',
  description: '',
  time: '',
  viewCount: 0,
  answerCount: 0,
  isLiked: false,
  isDisliked: false,
  isFavorite: false
});

// 回答列表
const answersList = ref([]);

// 切换关注状态
const toggleFollow = () => {
  uni.showToast({
    title: '关注功能开发中',
    icon: 'none'
  });
};

// 点赞
const thumbsUp = async () => {
  // 这里应该要调用点赞问题的API，但API文档中没有提供，暂时模拟
  uni.showToast({
    title: article.value.isLiked ? '已取消点赞' : '点赞成功',
    icon: 'none'
  });
  
  // 切换点赞状态
  article.value.isLiked = !article.value.isLiked;
  
  // 如果点赞了，取消不喜欢状态
  if (article.value.isLiked && article.value.isDisliked) {
    article.value.isDisliked = false;
  }
};

// 不喜欢
const hate = async () => {
  // 这里应该要调用不喜欢问题的API，但API文档中没有提供，暂时模拟
  uni.showToast({
    title: article.value.isDisliked ? '已取消不感兴趣' : '已标记为不感兴趣',
    icon: 'none'
  });
  
  // 切换不喜欢状态
  article.value.isDisliked = !article.value.isDisliked;
  
  // 如果不喜欢了，取消点赞状态
  if (article.value.isDisliked && article.value.isLiked) {
    article.value.isLiked = false;
  }
};

// 收藏
const bookmark = async () => {
  try {
    // 调用API切换收藏状态
    const result = await store.toggleFavorite(article.value.id);
    
    if (result.success) {
      // 更新收藏状态
      article.value.isFavorite = result.isFavorite;
      
      uni.showToast({
        title: article.value.isFavorite ? '已收藏' : '已取消收藏',
        icon: 'none'
      });
    } else {
      uni.showToast({
        title: result.message || '操作失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
  }
};

// 跳转到写回答页面
const goToWriteAnswer = () => {
  // 编码问题标题，防止URL编码问题
  const encodedTitle = encodeURIComponent(article.value.title);
  
  uni.navigateTo({
    url: `/pages/write-answer/index?id=${questionId.value}&title=${encodedTitle}`,
    events: {
      // 页面返回时刷新回答列表
      refreshAnswers: () => {
        console.log('返回文章详情页，刷新回答列表');
        loadAnswers(questionId.value);
      }
    },
    success: () => {
      console.log('成功跳转到写回答页面，问题ID:', questionId.value);
    }
  });
};

// 切换回答点赞状态
const toggleLike = async (answer, index) => {
  try {
    // 调用API切换点赞状态
    const result = await store.toggleLike(answer.id);
    
    if (result.success) {
      // 更新回答列表中的点赞状态和数量
      answersList.value[index].isLiked = result.isLiked;
      answersList.value[index].likes = result.likes;
      
      // 如果点赞了，取消不喜欢状态
      if (result.isLiked && answersList.value[index].isDisliked) {
        answersList.value[index].isDisliked = false;
      }
      
      uni.showToast({
        title: result.isLiked ? '点赞成功' : '已取消点赞',
        icon: 'none'
      });
    } else {
      uni.showToast({
        title: result.message || '操作失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
  }
};

// 切换回答不喜欢状态
const toggleDislike = async (answer, index) => {
  try {
    // 调用API切换不喜欢状态
    const result = await store.toggleDislike(answer.id);
    
    if (result.success) {
      // 更新回答列表中的不喜欢状态
      answersList.value[index].isDisliked = result.isDisliked;
      
      // 如果不喜欢了，取消点赞状态
      if (result.isDisliked && answersList.value[index].isLiked) {
        answersList.value[index].isLiked = false;
        // 重新获取点赞数，简单处理就是如果原来是点赞的，取消后减1
        answersList.value[index].likes = Math.max(0, answersList.value[index].likes - 1);
      }
      
      uni.showToast({
        title: result.isDisliked ? '已标记为不感兴趣' : '已取消不感兴趣',
        icon: 'none'
      });
    } else {
      uni.showToast({
        title: result.message || '操作失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('不喜欢操作失败:', error);
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
  }
};

// 获取有效的头像URL
const getAvatarUrl = (avatar) => {
  if (!avatar || avatar === 'none' || avatar.includes('undefined')) {
    // 如果头像为空或无效，返回默认头像
    return '/static/avatar/default1.png';
  }
  return avatar;
};

// 获取问题详情
const getQuestionDetail = async (id) => {
  console.log('正在获取问题详情，ID:', id, '类型:', typeof id);
  
  // 确保ID是字符串
  const idStr = String(id).trim();
  
  if (!idStr) {
    console.error('无效的问题ID');
    uni.showToast({
      title: '参数错误：无效的问题ID',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
    return;
  }
  
  try {
    // 调用API获取问题详情
    const questionDetail = await store.fetchQuestionDetail(idStr);
    
    if (questionDetail) {
      console.log('成功获取问题详情:', JSON.stringify({
        title: questionDetail.title,
        _id: questionDetail._id,
        user: questionDetail.user,
        avatar: questionDetail.avatar // 输出头像URL用于调试
      }));
      
      // 设置问题ID
      questionId.value = idStr;
      
      // 更新文章数据
      article.value = {
        id: questionDetail._id || questionDetail.id || idStr,
        title: questionDetail.title || '无标题',
        userName: questionDetail.userName || '匿名用户',
        avatar: questionDetail.avatar || '/static/avatar/default1.png',
        description: questionDetail.description || '',
        time: questionDetail.time || questionDetail.createdAt || new Date().toISOString(),
        viewCount: questionDetail.viewCount || 0,
        answerCount: questionDetail.answerCount || 0,
        isLiked: false, // API 未提供
        isDisliked: false, // API 未提供
        isFavorite: store.isFavorite(idStr) // 检查是否已收藏
      };
      
      // 检查并打印头像URL以便调试
      console.log('文章头像URL:', article.value.avatar);
      
      // 获取回答列表
      loadAnswers(idStr);
    } else {
      // 如果获取不到问题详情，显示错误提示
      console.error('无法获取问题详情:', idStr);
      uni.showToast({
        title: '问题不存在或已被删除',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  } catch (error) {
    console.error('获取问题详情失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } finally {
    loading.value = false;
  }
};

// 加载回答列表
const loadAnswers = async (id) => {
  loadingAnswers.value = true;
  try {
    // 调用API获取回答列表
    const response = await store.getAnswers(id);
    
    if (response && response.success) {
      answersList.value = response.answers || [];
    } else {
      console.error('获取回答列表失败:', response?.message || '未知错误');
      // 失败时提供空列表，允许用户查看问题并回答
      answersList.value = [];
    }
  } catch (error) {
    console.error('获取回答列表失败:', error);
    // 错误时提供空列表
    answersList.value = [];
  } finally {
    loadingAnswers.value = false;
  }
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

// 页面加载
onMounted(() => {
  // 获取页面参数 - 适配不同平台
  let id = null;
  
  // 方式1：通过getCurrentPages获取（兼容性更好）
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  // 不同平台参数获取方式不同
  if (currentPage.$page && currentPage.$page.options) {
    // uni-app Vue3方式
    id = currentPage.$page.options.id;
    console.log('通过$page.options获取参数:', id);
  } else if (currentPage.options) {
    // 小程序原生方式
    id = currentPage.options.id;
    console.log('通过options获取参数:', id);
  } else if (currentPage.$vm && currentPage.$vm.$mp && currentPage.$vm.$mp.query) {
    // uni-app Vue2方式
    id = currentPage.$vm.$mp.query.id;
    console.log('通过$mp.query获取参数:', id);
  }
  
  // 方式2：通过uni-app自带API获取（仅适用于uni-app）
  if (!id) {
    try {
      const options = uni.getLaunchOptionsSync();
      if (options && options.query && options.query.id) {
        id = options.query.id;
        console.log('通过getLaunchOptionsSync获取参数:', id);
      }
    } catch (error) {
      console.error('getLaunchOptionsSync错误:', error);
    }
  }
  
  // 方式3：适用于微信小程序
  if (!id) {
    try {
      // @ts-ignore
      if (wx && wx.getCurrentInstance) {
        const instance = wx.getCurrentInstance();
        const query = instance.query;
        if (query && query.id) {
          id = query.id;
          console.log('通过wx.getCurrentInstance获取参数:', id);
        }
      }
    } catch (error) {
      console.error('wx.getCurrentInstance错误:', error);
    }
  }
  
  // 确保ID是字符串类型
  if (id && typeof id !== 'string') {
    id = String(id);
  }
  
  console.log('最终获取到的ID:', id, '类型:', typeof id);
  
  if (id) {
    // 直接使用字符串ID，不要转换为数字，因为MongoDB使用的是ObjectId
    getQuestionDetail(id);
  } else {
    loading.value = false;
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }
});
</script>

<style lang="scss">
.article-container {
  padding: 30rpx;
  background-color: #fff;
  min-height: 100vh;
  padding-bottom: 120rpx; // 为底部互动栏留出空间
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

.article-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
}

.divider {
  height: 1px;
  background-color: #eee;
  margin: 20rpx 0;
}

.author-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  
  .author-info {
    display: flex;
    align-items: center;
    
    .author-avatar {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      margin-right: 15rpx;
    }
    
    .author-name {
      font-size: 28rpx;
      color: #666;
    }
  }
  
  .follow-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10rpx 20rpx;
    background-color: #e6f7ff;
    border-radius: 30rpx;
    color: #1677ff;
    font-size: 24rpx;
    
    .follow-icon {
      font-size: 24rpx;
      margin-right: 6rpx;
    }
  }
}

.stats-section {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 24rpx;
  color: #999;
  
  .time {
    margin-right: 15rpx;
  }
  
  .stats-divider {
    width: 1px;
    height: 24rpx;
    background-color: #eee;
    margin: 0 15rpx;
  }
  
  .stat-item {
    margin-right: 15rpx;
  }
}

.article-content {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 30rpx;
}

// 回答列表
.answers-section {
  .section-title {
    display: flex;
    align-items: center;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
    
    .answer-count {
      font-size: 26rpx;
      color: #999;
      margin-left: 15rpx;
      font-weight: normal;
    }
  }
  
  // 加载回答状态
  .loading-answers {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30rpx 0;
    
    .loading-spinner {
      width: 40rpx;
      height: 40rpx;
      border: 3rpx solid #f3f3f3;
      border-top: 3rpx solid #1677ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 10rpx;
    }
    
    .loading-text {
      font-size: 28rpx;
      color: #999;
    }
  }
  
  // 无回答状态
  .no-answers {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 50rpx 0;
    
    .no-answers-text {
      font-size: 28rpx;
      color: #999;
      margin-bottom: 30rpx;
    }
    
    .write-answer-btn {
      background-color: #1677ff;
      color: #fff;
      font-size: 28rpx;
      padding: 15rpx 30rpx;
      border-radius: 30rpx;
    }
  }
  
  // 回答项
  .answer-item {
    margin-bottom: 40rpx;
    border-bottom: 1px solid #f5f5f5;
    padding-bottom: 30rpx;
    
    &:last-child {
      border-bottom: none;
    }
    
    .answer-author {
      display: flex;
      align-items: center;
      margin-bottom: 15rpx;
      
      .author-avatar-small {
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        margin-right: 10rpx;
      }
      
      .author-name {
        font-size: 26rpx;
        color: #666;
      }
    }
    
    .answer-content {
      font-size: 28rpx;
      color: #333;
      line-height: 1.6;
      margin-bottom: 20rpx;
    }
    
    .answer-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .answer-time {
        font-size: 24rpx;
        color: #999;
      }
      
      .answer-actions {
        display: flex;
        align-items: center;
        
        .action-item {
          display: flex;
          align-items: center;
          margin-left: 30rpx;
          
          &.active {
            color: #1677ff;
          }
          
          .action-icon {
            width: 32rpx;
            height: 32rpx;
          }
          
          .action-count {
            font-size: 24rpx;
            color: #999;
            margin-left: 8rpx;
          }
        }
      }
    }
  }
}

.interaction-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  
  .interaction-buttons {
    display: flex;
    width: 100%;
    
    .interaction-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 15rpx 0;
      
      &.active {
        color: #1677ff;
      }
      
      .interaction-icon {
        width: 40rpx;
        height: 40rpx;
      }
      
      &.write-answer {
        background-color: #1677ff;
        color: #fff;
        border-radius: 30rpx;
        margin-left: 10rpx;
        flex: 2;
        font-size: 28rpx;
      }
    }
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