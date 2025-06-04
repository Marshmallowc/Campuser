// 全局状态管理

import { reactive } from 'vue';
import { api } from './api.js';

// 获取随机默认头像
const getRandomDefaultAvatar = () => {
  // 随机生成1-13的整数
  const randomNum = Math.floor(Math.random() * 13) + 1;
  return `/static/avatar/default${randomNum}.png`;
};

// 默认用户资料
const defaultUserProfile = {
  username: '大学探索者',
  avatar: getRandomDefaultAvatar(),
  bio: '每一天都是新的开始，探索校园的每一个角落',
  birthday: '',
  level: 3,
  levelProgress: 45,
  points: 248
};

// 初始问题列表（仅在无网络或API失败时使用）
const initialQuestions = [
  {
    id: 1,
    title: '我们学校厉害吗？',
    description: '我想了解一下我们学校在全国的排名，以及有什么特色专业和优势...',
    userName: '新生小白',
    avatar: '/static/avatar/user3.png',
    time: '2023-03-29',
    viewCount: 156,
    answerCount: 8
  },
  {
    id: 2,
    title: '学校哪个食堂好吃？',
    description: '开学有两个月了，我住在二号楼附近吃得主要是二食堂，想问问有没有其他更好吃的地方...',
    userName: '小明',
    avatar: '/static/avatar/user1.png',
    time: '2023-04-01',
    viewCount: 120,
    answerCount: 5
  },
  {
    id: 3,
    title: '给你一个亿，你会在家睡觉还是在我们学校上课？',
    description: '就是想知道大家对于这个问题的看法，如果有一个亿，你们会继续留在学校上课吗...',
    userName: '小红',
    avatar: '/static/avatar/user2.png', 
    time: '2023-04-02',
    viewCount: 234,
    answerCount: 12
  }
];

// 从本地存储获取用户资料或使用默认资料
const getStoredUserProfile = () => {
  try {
    const storedProfile = uni.getStorageSync('userProfile');
    return storedProfile ? JSON.parse(storedProfile) : { ...defaultUserProfile };
  } catch (e) {
    console.error('读取用户资料失败', e);
    return { ...defaultUserProfile };
  }
};

// 存储全局状态
export const store = reactive({
  // 问题列表
  questions: [],
  
  // 收藏列表
  favorites: [],
  
  // 用户资料
  userProfile: getStoredUserProfile(),
  
  // 加载状态
  loading: {
    questions: false,
    favorites: false,
    profile: false
  },
  
  // 初始化数据
  async init() {
    // 获取用户资料
    const token = uni.getStorageSync('token');
    if (token) {
      await this.fetchUserProfile();
      await this.fetchFavorites();
    }
    
    // 获取问题列表
    await this.fetchQuestions();
  },
  
  // 获取问题列表（从API）
  async fetchQuestions(params = {}) {
    this.loading.questions = true;
    try {
      const response = await api.question.getQuestions(params);
      if (response && response.code === 200) {
        // 添加调试输出，查看API返回的问题列表格式
        console.log('API返回的问题列表数据:', JSON.stringify(response.data.questions.slice(0, 2)));
        // 特别检查ID字段
        if (response.data.questions.length > 0) {
          const firstQuestion = response.data.questions[0];
          console.log('第一个问题的ID格式:', JSON.stringify({
            _id: firstQuestion._id,
            id: firstQuestion.id,
            _id_type: typeof firstQuestion._id
          }));
          console.log('第一个问题的所有字段:', Object.keys(firstQuestion));
          
          // 详细检查用户信息
          if (firstQuestion.user) {
            console.log('用户字段完整内容:', JSON.stringify(firstQuestion.user));
            if (firstQuestion.user.username) {
              console.log('用户名类型:', typeof firstQuestion.user.username);
              console.log('用户名值:', firstQuestion.user.username);
            }
          }
          
          console.log('问题数据中的用户名:', firstQuestion.userName); 
          console.log('问题数据中的用户名类型:', typeof firstQuestion.userName);
        }
        
        // 处理问题列表中的用户信息和头像URLs
        const processedQuestions = response.data.questions.map(question => {
          // 检查是否有id字段显示在界面上  
          console.log('问题数据字段:', question);
          
          // 创建一个新对象，确保不带有可能导致展示问题的其他字段
          const cleanedQuestion = {
            _id: question._id,
            id: question.id,
            title: question.title || '无标题',
            description: question.description || '暂无描述',
            createdAt: question.createdAt || question.time,
            viewCount: question.viewCount || 0,
            answerCount: question.answerCount || 0
          };
          
          // 处理用户信息
          if (question.user && typeof question.user === 'object') {
            // 从user对象中获取用户名
            if (question.user.username) {
              cleanedQuestion.userName = question.user.username;
            } else if (question.user.nickName) {
              cleanedQuestion.userName = question.user.nickName;
            } else if (question.user.name) {
              cleanedQuestion.userName = question.user.name;
            } else if (question.user._id) {
              // 如果没有名字但有ID，使用匿名用户
              cleanedQuestion.userName = '匿名用户';
            } else {
              cleanedQuestion.userName = '匿名用户';
            }
            
            // 处理头像URL
            if (question.user.avatar && typeof question.user.avatar === 'string') {
              cleanedQuestion.avatar = api.getFullUrl(question.user.avatar);
              console.log('处理后的头像URL:', cleanedQuestion.avatar);
            } else {
              // 没有头像时使用随机默认头像
              cleanedQuestion.avatar = getRandomDefaultAvatar();
            }
          } else if (question.userName) {
            // 如果直接有userName字段
            cleanedQuestion.userName = question.userName;
            
            // 确保头像URL是完整的字符串路径
            if (question.avatar && typeof question.avatar === 'string') {
              cleanedQuestion.avatar = api.getFullUrl(question.avatar);
            } else {
              // 没有头像时使用随机默认头像
              cleanedQuestion.avatar = getRandomDefaultAvatar();
            }
          } else {
            // 没有任何用户信息的情况
            cleanedQuestion.userName = '匿名用户';
            // 使用随机默认头像
            cleanedQuestion.avatar = getRandomDefaultAvatar();
          }
          
          // 如果用户名是纯数字，直接保留，不做处理
          // 之前的数字用户名处理逻辑已移除
          
          return cleanedQuestion;
        });
        
        // 调试输出处理后的头像URLs
        if (processedQuestions.length > 0) {
          console.log('处理后的问题列表头像样例:', 
            processedQuestions.slice(0, 2).map(q => ({
              userName: q.userName,
              avatar: q.avatar
            }))
          );
        }
        
        this.questions = processedQuestions;
      } else {
        // 如果API请求失败，使用本地存储的数据
        console.error('获取问题列表失败', response);
        this.questions = initialQuestions;
      }
    } catch (error) {
      console.error('获取问题列表异常', error);
      this.questions = initialQuestions;
    } finally {
      this.loading.questions = false;
    }
    return this.questions;
  },
  
  // 获取问题详情（从API或本地备份）
  async fetchQuestionDetail(questionId) {
    console.log('尝试获取问题详情, ID:', questionId, '类型:', typeof questionId);
    
    // 确保ID是字符串
    const idStr = String(questionId).trim();
    
    if (!idStr) {
      console.error('无效的问题ID');
      return null;
    }
    
    try {
      // 先尝试从API获取问题详情
      const response = await api.question.getQuestionDetail(idStr);
      console.log('API获取问题详情返回:', JSON.stringify(response));
      
      if (response.code === 200) {
        // 打印详细的返回数据结构
        console.log('成功获取问题详情, 数据结构:', 
          Object.keys(response.data).join(', '), 
          'user字段类型:', typeof response.data.user
        );
        
        // 预处理用户信息
        if (response.data.user && typeof response.data.user === 'object') {
          // 从用户对象中获取用户信息
          response.data.userName = response.data.user.username || response.data.user.name || '未知用户';
          
          // 处理头像URL
          if (response.data.user.avatar && typeof response.data.user.avatar === 'string') {
            response.data.avatar = api.getFullUrl(response.data.user.avatar);
            console.log('问题详情-用户头像URL(从user对象):', response.data.avatar);
          } else {
            response.data.avatar = getRandomDefaultAvatar();
            console.log('问题详情-用户使用默认头像(从user对象):', response.data.avatar);
          }
        } else {
          // 直接使用问题对象中的用户名
          response.data.userName = response.data.userName || response.data.username || '未知用户';
          
          // 处理直接在问题对象中的头像
          if (response.data.avatar && typeof response.data.avatar === 'string') {
            response.data.avatar = api.getFullUrl(response.data.avatar);
            console.log('问题详情-用户头像URL(直接):', response.data.avatar);
          } else {
            response.data.avatar = getRandomDefaultAvatar();
            console.log('问题详情-用户使用默认头像(直接):', response.data.avatar);
          }
        }
        
        // 确保问题有id字段，支持微信小程序环境
        if (!response.data.id && response.data._id) {
          response.data.id = response.data._id;
        }
        
        return response.data;
      } else {
        console.error('获取问题详情失败', response);
        // API请求失败，尝试从本地问题列表中查找
        return this.getLocalQuestionDetail(idStr);
      }
    } catch (error) {
      console.error('获取问题详情异常', error);
      // 发生错误，尝试从本地问题列表中查找
      return this.getLocalQuestionDetail(idStr);
    }
  },
  
  // 从本地问题列表查找问题详情
  getLocalQuestionDetail(questionId) {
    console.log('尝试从本地获取问题详情, ID:', questionId);
    
    // 确保ID是字符串
    const idStr = String(questionId).trim();
    
    // 确保问题列表已加载
    if (this.questions.length === 0) {
      this.questions = initialQuestions;
    }
    
    // MongoDB的ObjectId通常是字符串格式，如"6822952f33dfcdd8581c18dd"
    // 我们要支持从本地列表中通过id或_id属性进行查找
    
    // 先从当前问题列表中查找
    let question = this.questions.find(q => 
      (q._id && String(q._id) === idStr) || 
      (q.id && String(q.id) === idStr)
    );
    
    // 如果在当前列表中找不到，再从初始问题列表中查找
    if (!question) {
      question = initialQuestions.find(q => 
        (q.id && String(q.id) === idStr) || 
        (q._id && String(q._id) === idStr)
      );
    }
    
    // 如果仍然找不到，但我们知道这是MongoDB的ObjectId格式
    if (!question && idStr.length >= 24) {
      // 这可能是一个有效的MongoDB ObjectId
      console.log('MongoDB ObjectId格式但本地找不到数据:', idStr);
      return null;
    }
    
    // 确保返回的问题对象有id字段
    if (question && !question.id && question._id) {
      question.id = question._id;
    }
    
    return question || null;
  },
  
  // 获取我的问题列表（从API）
  async fetchMyQuestions(page = 1, limit = 10) {
    try {
      const response = await api.question.getMyQuestions(page, limit);
      if (response.code === 200) {
        return response.data.questions;
      } else {
        console.error('获取我的提问列表失败', response);
        return [];
      }
    } catch (error) {
      console.error('获取我的提问列表异常', error);
      return [];
    }
  },
  
  // 获取可回答的问题列表（从API）
  async fetchUnansweredQuestions(page = 1, limit = 10) {
    try {
      const response = await api.question.getUnansweredQuestions(page, limit);
      if (response.code === 200) {
        return response.data.questions;
      } else {
        console.error('获取可回答的问题列表失败', response);
        return [];
      }
    } catch (error) {
      console.error('获取可回答的问题列表异常', error);
      return [];
    }
  },
  
  // 添加问题（使用API）
  async addQuestion(question) {
    try {
      const response = await api.question.createQuestion({
        content: question.content,
        description: question.description
      });
      
      if (response.code === 200) {
        // 发布成功后重新获取问题列表
        await this.fetchQuestions();
        return {
          success: true,
          id: response.data.id
        };
      } else {
        return {
          success: false,
          message: response.message || '发布问题失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '发布问题出错'
      };
    }
  },
  
  // 获取用户资料（从API）
  async fetchUserProfile() {
    this.loading.profile = true;
    try {
      const response = await api.user.getProfile();
      console.log('获取用户资料API响应:', response);
      
      if (response && response.code === 200) {
        // 确保头像字段存在，如果不存在则使用随机默认头像
        const avatarUrl = response.data.avatar ? api.getFullUrl(response.data.avatar) : getRandomDefaultAvatar();
        console.log('处理后的用户头像URL:', avatarUrl);
        
        this.userProfile = {
          ...response.data,
          avatar: avatarUrl
        };
        this.saveUserProfile();
      } else {
        console.error('获取用户资料失败', response);
        // 获取失败时不更新资料，保持现有用户资料
      }
    } catch (error) {
      console.error('获取用户资料异常', error);
      // 获取异常时不更新资料，保持现有用户资料
    } finally {
      this.loading.profile = false;
    }
    return this.userProfile;
  },
  
  // 更新用户资料（使用API）
  async updateUserProfile(profile) {
    try {
      const response = await api.user.updateProfile(profile);
      if (response.code === 200) {
        this.userProfile = response.data;
        this.saveUserProfile();
        return {
          success: true,
          profile: this.userProfile
        };
      } else {
        return {
          success: false,
          message: response.message || '更新资料失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '更新资料出错'
      };
    }
  },
  
  // 检查并更新用户的默认头像（如果是placeholder）
  async checkAndUpdateDefaultAvatar() {
    try {
      // 检查当前头像是否是placeholder或为空
      const currentAvatar = this.userProfile?.avatar || '';
      console.log('检查默认头像，当前头像:', currentAvatar);
      
      // 识别placeholder头像的条件
      const isPlaceholder = currentAvatar.includes('placeholder.com') || 
                           currentAvatar === '' || 
                           currentAvatar === 'none' ||
                           currentAvatar.includes('undefined') ||
                           !currentAvatar;
      
      if (isPlaceholder) {
        console.log('检测到placeholder或空头像，更新为随机默认头像');
        
        // 生成随机默认头像
        const randomAvatar = getRandomDefaultAvatar();
        console.log('生成的随机默认头像:', randomAvatar);
        
        // 更新用户资料
        const result = await api.user.updateProfile({
          avatar: randomAvatar
        });
        
        if (result.code === 200) {
          console.log('成功更新用户头像为随机默认头像:', randomAvatar);
          
          // 更新本地用户资料
          this.userProfile.avatar = randomAvatar;
          this.saveUserProfile();
          
          return {
            success: true,
            avatar: randomAvatar
          };
        } else {
          console.error('更新随机头像失败:', result.message);
          return {
            success: false,
            message: result.message || '更新头像失败'
          };
        }
      } else {
        return {
          success: true,
          message: '用户已有头像，无需更新'
        };
      }
    } catch (error) {
      console.error('检查和更新默认头像出错:', error);
      return {
        success: false,
        message: '更新头像出错'
      };
    }
  },
  
  // 上传头像（使用API）
  async uploadAvatar(filePath) {
    console.log('store.uploadAvatar被调用，文件路径:', filePath);
    try {
      const response = await api.user.uploadAvatar(filePath);
      console.log('上传头像API响应:', JSON.stringify(response));
      
      if (response.code === 200) {
        // 获取返回的头像URL
        let avatarUrl = response.data.avatarUrl;
        console.log('获取到的原始头像URL:', avatarUrl);
        
        // 确保URL是完整路径
        if (avatarUrl && typeof api.getFullUrl === 'function') {
          avatarUrl = api.getFullUrl(avatarUrl);
          console.log('转换后的完整头像URL:', avatarUrl);
        }
        
        // 更新用户资料中的头像
        this.userProfile.avatar = avatarUrl;
        this.saveUserProfile();
        console.log('头像已更新并保存到本地');
        
        return {
          success: true,
          avatarUrl: avatarUrl
        };
      } else {
        console.error('上传头像API返回错误:', response.message);
        return {
          success: false,
          message: response.message || '上传头像失败'
        };
      }
    } catch (error) {
      console.error('上传头像异常:', error);
      return {
        success: false,
        message: '上传头像出错'
      };
    }
  },
  
  // 获取用户统计数据（从API）
  async fetchUserStatistics() {
    try {
      const response = await api.user.getStatistics();
      if (response && response.code === 200) {
        return response.data;
      } else {
        console.error('获取用户统计数据失败', response);
        // 返回默认统计数据
        return {
          questions: 0,
          answers: 0,
          followers: 0,
          following: 0
        };
      }
    } catch (error) {
      console.error('获取用户统计数据异常', error);
      // 出错时返回默认统计数据
      return {
        questions: 0,
        answers: 0,
        followers: 0,
        following: 0
      };
    }
  },
  
  // 获取收藏列表（从API）
  async fetchFavorites(page = 1, limit = 10) {
    this.loading.favorites = true;
    try {
      const response = await api.favorite.getFavorites(page, limit);
      if (response.code === 200) {
        this.favorites = response.data.favorites;
      } else {
        console.error('获取收藏列表失败', response);
      }
    } catch (error) {
      console.error('获取收藏列表异常', error);
    } finally {
      this.loading.favorites = false;
    }
    return this.favorites;
  },
  
  // 收藏或取消收藏问题（使用API）
  async toggleFavorite(questionId) {
    try {
      const response = await api.question.toggleFavorite(questionId);
      if (response.code === 200) {
        // 操作成功后更新收藏列表
        await this.fetchFavorites();
        return {
          success: true,
          isFavorite: response.data.isFavorite
        };
      } else {
        return {
          success: false,
          message: response.message || '操作失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '操作出错'
      };
    }
  },
  
  // 检查问题是否已收藏
  isFavorite(questionId) {
    return this.favorites.some(item => item.id === questionId);
  },
  
  // 获取收藏的问题列表
  getFavorites() {
    return this.favorites;
  },
  
  // 获取用户资料
  getUserProfile() {
    return this.userProfile;
  },
  
  // 保存用户资料到本地存储
  saveUserProfile() {
    try {
      uni.setStorageSync('userProfile', JSON.stringify(this.userProfile));
    } catch (e) {
      console.error('保存用户资料失败', e);
    }
  },
  
  // 获取问题列表
  getQuestions() {
    return this.questions;
  },
  
  // 获取问题的回答列表
  async getAnswers(questionId, params = {}) {
    console.log('store.getAnswers被调用, 问题ID:', questionId);
    try {
      const response = await api.answer.getAnswers(questionId, params);
      console.log('获取回答列表API响应:', JSON.stringify(response));
      
      if (response.code === 200) {
        // 处理回答列表中的头像URL
        const processedAnswers = response.data.answers.map(answer => {
          // 处理用户头像URL
          if (answer.avatar && typeof answer.avatar === 'string') {
            // 确保头像URL是完整的
            answer.avatar = api.getFullUrl(answer.avatar);
            console.log('处理后的回答用户头像URL:', answer.avatar);
          } else {
            // 如果没有头像，使用随机默认头像
            answer.avatar = getRandomDefaultAvatar();
            console.log('回答用户使用默认头像:', answer.avatar);
          }
          
          // 确保其他字段也存在
          answer.userName = answer.userName || '匿名用户';
          answer.time = answer.time || answer.createdAt || new Date().toISOString();
          answer.likes = answer.likes || 0;
          
          return answer;
        });
        
        return {
          success: true,
          total: response.data.total,
          answers: processedAnswers
        };
      } else {
        return {
          success: false,
          message: response.message || '获取回答列表失败',
          answers: []
        };
      }
    } catch (error) {
      console.error('获取回答列表出错:', error);
      return {
        success: false,
        message: '获取回答列表出错',
        answers: []
      };
    }
  },
  
  // 发布回答
  async createAnswer(questionId, content) {
    console.log('store.createAnswer被调用, 问题ID:', questionId);
    try {
      const response = await api.answer.createAnswer(questionId, content);
      console.log('发布回答API响应:', JSON.stringify(response));
      
      if (response.code === 200) {
        return {
          success: true,
          id: response.data.id
        };
      } else {
        return {
          success: false,
          message: response.message || '发布回答失败'
        };
      }
    } catch (error) {
      console.error('发布回答出错:', error);
      return {
        success: false,
        message: '发布回答出错'
      };
    }
  },
  
  // 获取我的回答列表
  async getMyAnswers(page = 1, limit = 10) {
    try {
      const response = await api.answer.getMyAnswers(page, limit);
      if (response.code === 200) {
        // 处理回答列表中的头像URL
        const processedAnswers = response.data.answers.map(answer => {
          // 如果有头像字段，确保URL是完整的
          if (answer.avatar && typeof answer.avatar === 'string') {
            answer.avatar = api.getFullUrl(answer.avatar);
          } else if (answer.user && answer.user.avatar) {
            // 有些API可能会返回嵌套的user对象
            answer.avatar = api.getFullUrl(answer.user.avatar);
          } else {
            // 如果没有头像，使用随机默认头像
            answer.avatar = getRandomDefaultAvatar();
          }
          
          return answer;
        });
        
        return {
          success: true,
          total: response.data.total,
          answers: processedAnswers
        };
      } else {
        return {
          success: false,
          message: response.message || '获取我的回答列表失败',
          answers: []
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '获取我的回答列表出错',
        answers: []
      };
    }
  },
  
  // 回答点赞/取消点赞
  async toggleLike(answerId) {
    try {
      const response = await api.answer.toggleLike(answerId);
      if (response.code === 200) {
        return {
          success: true,
          isLiked: response.data.isLiked,
          likes: response.data.likes
        };
      } else {
        return {
          success: false,
          message: response.message || '操作失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '操作出错'
      };
    }
  },
  
  // 回答不喜欢/取消不喜欢
  async toggleDislike(answerId) {
    try {
      const response = await api.answer.toggleDislike(answerId);
      if (response.code === 200) {
        return {
          success: true,
          isDisliked: response.data.isDisliked
        };
      } else {
        return {
          success: false,
          message: response.message || '操作失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '操作出错'
      };
    }
  }
}); 