const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = 'uploads/avatars';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(null, `${req.user.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('仅支持图片文件 (jpeg, jpg, png, gif)'));
    }
  }
});

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }
    
    res.json({
      code: 200,
      data: {
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        birthday: user.birthday,
        level: user.level,
        levelProgress: user.levelProgress,
        points: user.points
      }
    });
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    [
      check('username', '用户名不能为空').optional().not().isEmpty(),
      check('bio', '个人简介过长').optional().isLength({ max: 200 }),
      check('birthday', '生日格式无效').optional().isISO8601().toDate()
    ]
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      });
    }
    
    const { username, bio, birthday } = req.body;
    
    try {
      // Check if username already exists
      if (username) {
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser.id !== req.user.user.id) {
          return res.status(400).json({
            code: 400,
            message: '该用户名已被使用'
          });
        }
      }
      
      // Find and update user
      const user = await User.findById(req.user.user.id);
      
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在'
        });
      }
      
      if (username) user.username = username;
      if (bio !== undefined) user.bio = bio;
      if (birthday) user.birthday = birthday;
      
      await user.save();
      
      res.json({
        code: 200,
        message: '资料更新成功',
        data: {
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          birthday: user.birthday,
          level: user.level,
          levelProgress: user.levelProgress,
          points: user.points
        }
      });
    } catch (err) {
      console.error('Update profile error:', err.message);
      res.status(500).json({
        code: 500,
        message: '服务器错误'
      });
    }
  }
);

// @route   POST /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '未提供头像文件'
      });
    }
    
    // Update user avatar URL
    const user = await User.findById(req.user.user.id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }
    
    // Set avatar URL (in a real app, this would be served from a CDN or storage service)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    
    await user.save();
    
    res.json({
      code: 200,
      message: '头像上传成功',
      data: {
        avatarUrl
      }
    });
  } catch (err) {
    console.error('Avatar upload error:', err.message);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// @route   GET /api/users/statistics
// @desc    Get user statistics
// @access  Private
router.get('/statistics', auth, async (req, res) => {
  try {
    const userId = req.user.user.id;
    
    // Count questions asked by user
    const questionsCount = await Question.countDocuments({ user: userId });
    
    // Count answers given by user
    const answersCount = await Answer.countDocuments({ user: userId });
    
    // In a real app, you would also count followers and following
    // This would require a follower/following model
    // For this example, we'll use placeholder values
    const followersCount = 0;
    const followingCount = 0;
    
    res.json({
      code: 200,
      data: {
        questions: questionsCount,
        answers: answersCount,
        followers: followersCount,
        following: followingCount
      }
    });
  } catch (err) {
    console.error('Get statistics error:', err.message);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router; 