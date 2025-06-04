const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const auth = require('../middleware/auth');

// @route   GET /api/questions
// @desc    Get questions with pagination and tab filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { tab = 'all', page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query based on tab
    let query = {};
    // For follow or other tabs requiring auth, we'd need to implement filtering
    // For this simplified version, we'll just return all questions
    
    // Get total count
    const total = await Question.countDocuments(query);
    
    // Get questions with pagination
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username avatar');
    
    // Format response
    const formattedQuestions = await Promise.all(questions.map(async question => {
      const answerCount = await Answer.countDocuments({ question: question._id });
      
      return {
        id: question._id,
        title: question.title,
        description: question.description,
        userName: question.user.username,
        avatar: question.user.avatar,
        time: question.createdAt,
        viewCount: question.viewCount,
        answerCount
      };
    }));
    
    res.json({
      code: 200,
      data: {
        total,
        questions: formattedQuestions
      }
    });
  } catch (err) {
    console.error('Get questions error:', err.message);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// @route   GET /api/questions/:id
// @desc    Get question by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        code: 404,
        message: '问题不存在或已被删除'
      });
    }
    
    const question = await Question.findById(req.params.id)
      .populate('user', 'username avatar');
    
    if (!question) {
      return res.status(404).json({
        code: 404,
        message: '问题不存在或已被删除'
      });
    }
    
    // Increment view count
    question.viewCount += 1;
    await question.save();
    
    // Get answer count
    const answerCount = await Answer.countDocuments({ question: question._id });
    
    // Check if user has favorited this question (if authenticated)
    let isFavorite = false;
    if (req.header('Authorization')) {
      try {
        const token = req.header('Authorization').split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quickcust-secret-key');
        const userId = decoded.user.id;
        
        const favorite = await Favorite.findOne({
          user: userId,
          question: question._id
        });
        
        isFavorite = !!favorite;
      } catch (err) {
        // Token error, but we'll just set isFavorite to false
        console.error('Token verification error:', err.message);
      }
    }
    
    res.json({
      code: 200,
      data: {
        id: question._id,
        title: question.title,
        description: question.description,
        userName: question.user.username,
        avatar: question.user.avatar,
        time: question.createdAt,
        viewCount: question.viewCount,
        answerCount,
        isFavorite
      }
    });
  } catch (err) {
    console.error('Get question error:', err.message);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// @route   POST /api/questions
// @desc    Create a new question
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('content', '问题标题不能为空').not().isEmpty(),
      check('content', '问题标题不能超过100个字符').isLength({ max: 100 }),
      check('description', '问题描述不能超过2000个字符').optional().isLength({ max: 2000 })
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
    
    const { content, description = '' } = req.body;
    
    try {
      const newQuestion = new Question({
        title: content,
        description: description || '', // 确保描述字段有值，即使为空字符串
        user: req.user.user.id
      });
      
      await newQuestion.save();
      
      // Reward user with points for asking a question
      const user = await User.findById(req.user.user.id);
      user.points += 5;
      
      // Check if user should level up
      const newLevelProgress = user.levelProgress + 5;
      if (newLevelProgress >= 100) {
        user.level += 1;
        user.levelProgress = newLevelProgress - 100;
      } else {
        user.levelProgress = newLevelProgress;
      }
      
      await user.save();
      
      res.json({
        code: 200,
        message: '问题发布成功',
        data: {
          id: newQuestion._id
        }
      });
    } catch (err) {
      console.error('Create question error:', err.message);
      res.status(500).json({
        code: 500,
        message: '服务器错误'
      });
    }
  }
);

// @route   GET /api/questions/my
// @desc    Get current user's questions
// @access  Private
router.get('/my/list', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = { user: req.user.user.id };
    
    // Get total count
    const total = await Question.countDocuments(query);
    
    // Get questions with pagination
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Format response
    const formattedQuestions = await Promise.all(questions.map(async question => {
      const answerCount = await Answer.countDocuments({ question: question._id });
      
      return {
        id: question._id,
        title: question.title,
        description: question.description,
        time: question.createdAt,
        viewCount: question.viewCount,
        answerCount
      };
    }));
    
    res.json({
      code: 200,
      data: {
        total,
        questions: formattedQuestions
      }
    });
  } catch (err) {
    console.error('Get my questions error:', err.message);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// @route   GET /api/questions/unanswered
// @desc    Get unanswered questions
// @access  Private
router.get('/unanswered/list', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get all questions
    const allQuestions = await Question.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar');
    
    // Filter out questions that the user has already answered
    const userId = req.user.user.id;
    const userAnswers = await Answer.find({ user: userId }).distinct('question');
    
    const unansweredQuestions = allQuestions.filter(question => 
      !userAnswers.includes(question._id.toString()) && 
      question.user._id.toString() !== userId
    );
    
    // Apply pagination
    const total = unansweredQuestions.length;
    const paginatedQuestions = unansweredQuestions.slice(skip, skip + parseInt(limit));
    
    // Format response
    const formattedQuestions = await Promise.all(paginatedQuestions.map(async question => {
      const answerCount = await Answer.countDocuments({ question: question._id });
      
      return {
        id: question._id,
        title: question.title,
        description: question.description,
        userName: question.user.username,
        avatar: question.user.avatar,
        time: question.createdAt,
        viewCount: question.viewCount,
        answerCount
      };
    }));
    
    res.json({
      code: 200,
      data: {
        total,
        questions: formattedQuestions
      }
    });
  } catch (err) {
    console.error('Get unanswered questions error:', err.message);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// @route   GET /api/questions/:questionId/answers
// @desc    Get answers for a question
// @access  Public
router.get('/:questionId/answers', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'time' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get question
    const question = await Question.findById(req.params.questionId);
    
    if (!question) {
      return res.status(404).json({
        code: 404,
        message: '问题不存在'
      });
    }
    
    // Determine sort order
    let sortOrder = {};
    if (sort === 'likes') {
      sortOrder = { likes: -1, createdAt: -1 };
    } else {
      sortOrder = { createdAt: -1 };
    }
    
    // Get total count
    const total = await Answer.countDocuments({ question: req.params.questionId });
    
    // Get answers with pagination
    const answers = await Answer.find({ question: req.params.questionId })
      .sort(sortOrder)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username avatar');
    
    // Check if user has liked/disliked answers (if authenticated)
    let userLikedAnswers = [];
    let userDislikedAnswers = [];
    
    if (req.header('Authorization')) {
      try {
        const token = req.header('Authorization').split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quickcust-secret-key');
        const userId = decoded.user.id;
        
        userLikedAnswers = await Answer.find({
          question: req.params.questionId,
          usersLiked: userId
        }).distinct('_id');
        
        userDislikedAnswers = await Answer.find({
          question: req.params.questionId,
          usersDisliked: userId
        }).distinct('_id');
      } catch (err) {
        // Token error, but we'll just continue
        console.error('Token verification error:', err.message);
      }
    }
    
    // Format response
    const formattedAnswers = answers.map(answer => {
      return {
        id: answer._id,
        content: answer.content,
        userName: answer.user.username,
        avatar: answer.user.avatar,
        time: answer.createdAt,
        likes: answer.likes,
        isLiked: userLikedAnswers.some(id => id.toString() === answer._id.toString()),
        isDisliked: userDislikedAnswers.some(id => id.toString() === answer._id.toString())
      };
    });
    
    res.json({
      code: 200,
      data: {
        total,
        answers: formattedAnswers
      }
    });
  } catch (err) {
    console.error('Get answers error:', err.message);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// @route   POST /api/questions/:questionId/answers
// @desc    Answer a question
// @access  Private
router.post(
  '/:questionId/answers',
  [
    auth,
    [
      check('content', '回答内容不能为空').not().isEmpty(),
      check('content', '回答内容不能超过2000个字符').isLength({ max: 2000 })
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
    
    try {
      // Check if questionId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(req.params.questionId)) {
        return res.status(404).json({
          code: 404,
          message: '问题不存在或已被删除'
        });
      }
      
      const question = await Question.findById(req.params.questionId);
      
      if (!question) {
        return res.status(404).json({
          code: 404,
          message: '问题不存在'
        });
      }
      
      const { content } = req.body;
      
      // Create new answer
      const newAnswer = new Answer({
        content,
        question: req.params.questionId,
        user: req.user.user.id
      });
      
      await newAnswer.save();
      
      // Reward user with points for answering
      const user = await User.findById(req.user.user.id);
      user.points += 10;
      
      // Check if user should level up
      const newLevelProgress = user.levelProgress + 10;
      if (newLevelProgress >= 100) {
        user.level += 1;
        user.levelProgress = newLevelProgress - 100;
      } else {
        user.levelProgress = newLevelProgress;
      }
      
      await user.save();
      
      res.json({
        code: 200,
        message: '回答发布成功',
        data: {
          id: newAnswer._id
        }
      });
    } catch (err) {
      console.error('Create answer error:', err.message);
      res.status(500).json({
        code: 500,
        message: '服务器错误'
      });
    }
  }
);

// @route   POST /api/questions/:questionId/favorite
// @desc    Toggle favorite status of a question
// @access  Private
router.post('/:questionId/favorite', auth, async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const userId = req.user.user.id;
    
    // Check if question exists
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({
        code: 404,
        message: '问题不存在'
      });
    }
    
    // Check if already favorited
    const favorite = await Favorite.findOne({
      user: userId,
      question: questionId
    });
    
    if (favorite) {
      // Remove favorite
      await favorite.deleteOne();
      
      res.json({
        code: 200,
        message: '操作成功',
        data: {
          isFavorite: false
        }
      });
    } else {
      // Add favorite
      const newFavorite = new Favorite({
        user: userId,
        question: questionId
      });
      
      await newFavorite.save();
      
      res.json({
        code: 200,
        message: '操作成功',
        data: {
          isFavorite: true
        }
      });
    }
  } catch (err) {
    console.error('Toggle favorite error:', err.message);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// @route   PUT /api/questions/:questionId
// @desc    Update a question
// @access  Private (question owner only)
router.put(
  '/:questionId',
  [
    auth,
    [
      check('title', '问题标题不能为空').not().isEmpty(),
      check('title', '问题标题不能超过100个字符').isLength({ max: 100 }),
      check('description', '问题描述不能超过2000个字符').optional().isLength({ max: 2000 })
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
    
    try {
      // Check if questionId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(req.params.questionId)) {
        return res.status(404).json({
          code: 404,
          message: '问题不存在或已被删除'
        });
      }
      
      const question = await Question.findById(req.params.questionId);
      
      if (!question) {
        return res.status(404).json({
          code: 404,
          message: '问题不存在'
        });
      }
      
      const { title, description } = req.body;
      
      question.title = title;
      question.description = description || '';
      
      await question.save();
      
      res.json({
        code: 200,
        message: '问题更新成功',
        data: {
          id: question._id
        }
      });
    } catch (err) {
      console.error('Update question error:', err.message);
      res.status(500).json({
        code: 500,
        message: '服务器错误'
      });
    }
  }
);

// @route   DELETE /api/questions/:questionId
// @desc    Delete a question
// @access  Private (question owner only)
router.delete('/:questionId', auth, async (req, res) => {
  try {
    // Check if questionId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.questionId)) {
      return res.status(404).json({
        code: 404,
        message: '问题不存在或已被删除'
      });
    }
    
    const question = await Question.findById(req.params.questionId);
    
    if (!question) {
      return res.status(404).json({
        code: 404,
        message: '问题不存在'
      });
    }
    
    // Check if user is the owner of the question
    if (question.user.toString() !== req.user.user.id) {
      return res.status(403).json({
        code: 403,
        message: '没有权限删除该问题'
      });
    }
    
    await question.deleteOne();
    
    res.json({
      code: 200,
      message: '问题删除成功'
    });
  } catch (err) {
    console.error('Delete question error:', err.message);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router; 