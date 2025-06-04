const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/User');
const auth = require('../middleware/auth');

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'quickcust-secret-key';

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    check('username', '用户名必填').not().isEmpty(),
    check('phone', '请提供有效的手机号').isMobilePhone('zh-CN'),
    check('password', '密码至少需要6个字符').isLength({ min: 6 })
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

    const { username, phone, password, avatar } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ $or: [{ username }, { phone }] });

      if (user) {
        if (user.phone === phone) {
          return res.status(400).json({
            code: 400,
            message: '该手机号已被注册'
          });
        } else {
          return res.status(400).json({
            code: 400,
            message: '该用户名已被使用'
          });
        }
      }

      // Create new user
      let avatarUrl = 'https://via.placeholder.com/150'; // 默认头像
      if (avatar) {
        // 检查是否是相对路径（以'/'开头）
        if (avatar.startsWith('/')) {
          // 获取服务器域名作为基础URL - 这里假设前端和后端在同一域名下
          // 在实际应用中，您可能需要从配置文件或环境变量中获取基础URL
          const baseUrl = ''; // 根据实际情况调整
          avatarUrl = `${baseUrl}${avatar}`;
        } else {
          // 如果已经是完整URL，直接使用
          avatarUrl = avatar;
        }
      }

      console.log('Final avatar URL being saved:', avatarUrl);

      user = new User({
        username,
        phone,
        password,
        avatar: avatarUrl
      });

      // 添加调试日志，确认接收到的头像URL
      console.log('Registering user with avatar:', avatar);

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save user
      await user.save();

      // Create JWT payload
      const payload = {
        user: {
          id: user.id
        }
      };

      // Sign token
      jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          
          // 确保avatar URL是完整的URL
          let avatarUrl = user.avatar;
          if (avatarUrl && avatarUrl.startsWith('/')) {
            const baseUrl = 'https://potljcwiotnr.sealoshzh.site'; // 根据实际情况调整
            avatarUrl = `${baseUrl}${avatarUrl}`;
          }
          
          console.log('Register response avatar URL:', avatarUrl);
          
          res.json({
            code: 200,
            message: '注册成功',
            data: {
              userId: user.id,
              token,
              userProfile: {
                username: user.username,
                avatar: avatarUrl,
                bio: user.bio,
                birthday: user.birthday,
                level: user.level,
                levelProgress: user.levelProgress,
                points: user.points
              }
            }
          });
        }
      );
    } catch (err) {
      console.error('Register error:', err.message);
      res.status(500).json({
        code: 500,
        message: '服务器错误'
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('phone', '手机号必填').exists(),
    check('phone', '请输入有效的手机号').isMobilePhone('zh-CN'),
    check('password', '密码必填').exists()
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

    const { phone, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ phone });

      if (!user) {
        return res.status(400).json({
          code: 400,
          message: '手机号或密码不正确'
        });
      }

      // 添加调试日志，检查用户头像URL
      console.log('User login attempt, avatar in DB:', user.avatar);

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          code: 400,
          message: '手机号或密码不正确'
        });
      }

      // Create JWT payload
      const payload = {
        user: {
          id: user.id
        }
      };

      // Sign token
      jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          
          // 确保avatar URL是完整的URL
          let avatarUrl = user.avatar;
          if (avatarUrl && avatarUrl.startsWith('/')) {
            const baseUrl = 'https://potljcwiotnr.sealoshzh.site'; // 根据实际情况调整
            avatarUrl = `${baseUrl}${avatarUrl}`;
          }
          
          console.log('Login response avatar URL:', avatarUrl);
          
          res.json({
            code: 200,
            message: '登录成功',
            data: {
              userId: user.id,
              token,
              userProfile: {
                username: user.username,
                avatar: avatarUrl,
                bio: user.bio,
                birthday: user.birthday,
                level: user.level,
                levelProgress: user.levelProgress,
                points: user.points
              }
            }
          });
        }
      );
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).json({
        code: 500,
        message: '服务器错误'
      });
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset token
// @access  Public
router.post(
  '/forgot-password',
  [
    check('phone', '请提供有效的手机号').isMobilePhone('zh-CN')
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

    const { phone } = req.body;

    try {
      // Find user by phone
      const user = await User.findOne({ phone });

      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '该手机号未注册'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
      
      // Set token and expiry
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      
      await user.save();

      // In a real application, you would send an SMS with a link or code
      // For this example, we'll just return the token
      // TODO: Configure SMS sending service

      res.json({
        code: 200,
        message: '密码重置验证码已发送'
      });
    } catch (err) {
      console.error('Forgot password error:', err.message);
      res.status(500).json({
        code: 500,
        message: '服务器错误'
      });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post(
  '/reset-password',
  [
    check('token', '重置令牌必填').not().isEmpty(),
    check('newPassword', '新密码至少需要6个字符').isLength({ min: 6 })
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

    const { token, newPassword } = req.body;

    try {
      // Find user by reset token and check expiry
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          code: 400,
          message: '重置令牌无效或已过期'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      
      // Clear reset token fields
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      
      await user.save();

      res.json({
        code: 200,
        message: '密码重置成功'
      });
    } catch (err) {
      console.error('Reset password error:', err.message);
      res.status(500).json({
        code: 500,
        message: '服务器错误'
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side only)
// @access  Private
router.post('/logout', auth, (req, res) => {
  // JWT is stateless, so logout is handled on the client
  // We can add token blacklisting/revocation if needed
  res.json({
    code: 200,
    message: '退出成功'
  });
});

module.exports = router; 