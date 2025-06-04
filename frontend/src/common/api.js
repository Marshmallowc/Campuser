// API服务封装
const BASE_URL = 'https://phrzkdfnowea.sealoshzh.site/api';
const SERVER_URL = 'https://phrzkdfnowea.sealoshzh.site'; // 服务器基础URL，用于拼接相对路径

// 将相对路径转换为完整URL
const getFullUrl = (path) => {
  if (!path) return '';
  
  // 如果已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 如果是/static开头的路径，属于本地静态资源，不需要添加域名前缀
  if (path.startsWith('/static/')) {
    return path;
  }
  
  // 如果是相对路径，添加服务器域名前缀
  if (path.startsWith('/')) {
    return `${SERVER_URL}${path}`;
  }
  
  // 其他情况，添加服务器域名和斜杠
  return `${SERVER_URL}/${path}`;
};

// 请求拦截器
const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = uni.getStorageSync('token');
    
    // 默认请求头
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // 如果有token，则添加到请求头
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 是否显示错误提示
    const showErrorToast = options.showErrorToast !== false;
    
    uni.request({
      url: `${BASE_URL}${url}`,
      method: options.method || 'GET',
      data: options.data,
      header: headers,
      success: (res) => {
        // 处理响应
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 处理未授权情况
          uni.removeStorageSync('token');
          if (showErrorToast) {
            uni.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none'
            });
            setTimeout(() => {
              uni.redirectTo({
                url: '/pages/login/index'
              });
            }, 1500);
          }
          reject(res.data || { code: 401, message: '未授权' });
        } else {
          // 处理其他错误
          if (showErrorToast) {
            uni.showToast({
              title: (res.data && res.data.message) || '请求失败',
              icon: 'none'
            });
          }
          reject(res.data || { code: res.statusCode, message: '请求失败' });
        }
      },
      fail: (err) => {
        // 处理网络错误
        if (showErrorToast) {
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
        }
        console.error('网络请求失败', err);
        reject({ code: -1, message: '网络请求失败', error: err });
      }
    });
  });
};

// 上传文件
const uploadFile = (url, filePath, formData = {}, name = 'file') => {
  console.log('调用uploadFile方法:', url, '文件路径:', filePath, '表单数据:', formData, '文件名称:', name);
  
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');
    console.log('上传使用的token:', token ? '已设置' : '未设置');
    
    uni.uploadFile({
      url: `${BASE_URL}${url}`,
      filePath,
      name,
      formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        console.log('上传文件返回结果:', res.statusCode, res.data ? res.data.substring(0, 100) : '无数据');
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data);
            console.log('解析上传响应成功:', data);
            resolve(data);
          } catch (error) {
            console.error('解析上传响应JSON出错:', error, '原始数据:', res.data);
            uni.showToast({
              title: '上传成功但解析结果失败',
              icon: 'none'
            });
            // 尝试返回一个成功状态以便继续操作
            resolve({
              code: 200,
              message: '上传成功，但返回数据格式异常',
              data: { avatarUrl: filePath } // 使用本地文件路径作为临时URL
            });
          }
        } else {
          console.error('上传失败，HTTP状态码:', res.statusCode);
          uni.showToast({
            title: '上传失败，请重试',
            icon: 'none'
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        console.error('上传请求失败:', err);
        uni.showToast({
          title: '上传失败，网络错误',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

// 认证和用户管理API
const auth = {
  // 用户注册
  register: (data) => {
    return request('/auth/register', {
      method: 'POST',
      data
    });
  },
  
  // 用户登录
  login: (data) => {
    return request('/auth/login', {
      method: 'POST',
      data
    });
  },
  
  // 忘记密码
  forgotPassword: (data) => {
    return request('/auth/forgot-password', {
      method: 'POST',
      data
    });
  },
  
  // 重置密码
  resetPassword: (data) => {
    return request('/auth/reset-password', {
      method: 'POST',
      data
    });
  },
  
  // 退出登录
  logout: () => {
    return request('/auth/logout', {
      method: 'POST'
    });
  }
};

// 用户资料管理API
const user = {
  // 获取用户资料
  getProfile: () => {
    return request('/users/profile');
  },
  
  // 更新用户资料
  updateProfile: (data) => {
    return request('/users/profile', {
      method: 'PUT',
      data
    });
  },
  
  // 上传头像
  uploadAvatar: (filePath) => {
    console.log('调用uploadAvatar API, 文件路径:', filePath);
    // 确保文件存在
    try {
      const fs = uni.getFileSystemManager();
      fs.accessSync(filePath);
      console.log('文件存在，准备上传');
    } catch (error) {
      console.error('文件不存在或无法访问:', error);
    }
    
    return uploadFile('/users/avatar', filePath, {}, 'avatar');
  },
  
  // 获取用户统计数据
  getStatistics: () => {
    return request('/users/statistics');
  }
};

// 问题管理API
const question = {
  // 获取问题列表
  getQuestions: (params = {}) => {
    const { tab = 'all', page = 1, limit = 10 } = params;
    return request(`/questions?tab=${tab}&page=${page}&limit=${limit}`);
  },
  
  // 获取问题详情
  getQuestionDetail: (id) => {
    return request(`/questions/${id}`, {
      showErrorToast: false // 不显示错误提示，由调用方处理
    });
  },
  
  // 发布问题
  createQuestion: (data) => {
    return request('/questions', {
      method: 'POST',
      data
    });
  },
  
  // 获取我的提问列表
  getMyQuestions: (page = 1, limit = 10) => {
    return request(`/questions/my/list?page=${page}&limit=${limit}`);
  },
  
  // 获取可回答的问题列表
  getUnansweredQuestions: (page = 1, limit = 10) => {
    return request(`/questions/unanswered/list?page=${page}&limit=${limit}`);
  },
  
  // 收藏/取消收藏问题
  toggleFavorite: (questionId) => {
    return request(`/questions/${questionId}/favorite`, {
      method: 'POST'
    });
  }
};

// 回答管理API
const answer = {
  // 获取问题的回答列表
  getAnswers: (questionId, params = {}) => {
    console.log('调用获取回答列表API, 问题ID:', questionId);
    const { page = 1, limit = 10, sort = 'time' } = params;
    return request(`/questions/${questionId}/answers?page=${page}&limit=${limit}&sort=${sort}`);
  },
  
  // 发布回答
  createAnswer: (questionId, content) => {
    console.log('调用发布回答API, 问题ID:', questionId, '内容长度:', content.length);
    return request(`/questions/${questionId}/answers`, {
      method: 'POST',
      data: { content }
    });
  },
  
  // 获取我的回答列表
  getMyAnswers: (page = 1, limit = 10) => {
    return request(`/answers/my?page=${page}&limit=${limit}`);
  },
  
  // 点赞/取消点赞
  toggleLike: (answerId) => {
    return request(`/answers/${answerId}/like`, {
      method: 'POST'
    });
  },
  
  // 不喜欢/取消不喜欢
  toggleDislike: (answerId) => {
    return request(`/answers/${answerId}/dislike`, {
      method: 'POST'
    });
  }
};

// 收藏管理API
const favorite = {
  // 获取收藏列表
  getFavorites: (page = 1, limit = 10) => {
    return request(`/favorites?page=${page}&limit=${limit}`);
  }
};

// 导出所有API服务
export const api = {
  auth,
  user,
  question,
  answer,
  favorite,
  getFullUrl // 导出URL转换函数
}; 