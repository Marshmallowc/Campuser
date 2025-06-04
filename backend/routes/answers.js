const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/answers/my
// @desc    Get current user's answers
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = { user: req.user.user.id };
    
    // Get total count
    const total = await Answer.countDocuments(query);
    
    // Get answers with pagination
    const answers = await Answer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('question', 'title');
    
    // Format response
    const formattedAnswers = answers.map(answer => {
      return {
        id: answer._id,
        questionId: answer.question._id,
        questionTitle: answer.question.title,
        content: answer.content,
        time: answer.createdAt,
        likes: answer.likes
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
    console.error('Get my answers error:', err.message);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// @route   POST /api/answers/:answerId/like
// @desc    Toggle like status for an answer
// @access  Private
router.post('/:answerId/like', auth, async (req, res) => {
  try {
    const answerId = req.params.answerId;
    const userId = req.user.user.id;
    
    // Find answer
    const answer = await Answer.findById(answerId);
    
    if (!answer) {
      return res.status(404).json({
        code: 404,
        message: '回答不存在'
      });
    }
    
    // Check if already liked
    const isLiked = answer.usersLiked.includes(userId);
    
    // Check if disliked
    const isDisliked = answer.usersDisliked.includes(userId);
    
    // If disliked, remove from disliked array
    if (isDisliked) {
      answer.usersDisliked = answer.usersDisliked.filter(
        id => id.toString() !== userId
      );
    }
    
    if (isLiked) {
      // Remove like
      answer.usersLiked = answer.usersLiked.filter(
        id => id.toString() !== userId
      );
      answer.likes = Math.max(0, answer.likes - 1);
      
      await answer.save();
      
      res.json({
        code: 200,
        message: '操作成功',
        data: {
          isLiked: false,
          likes: answer.likes
        }
      });
    } else {
      // Add like
      answer.usersLiked.push(userId);
      answer.likes += 1;
      
      await answer.save();
      
      // Reward answerer with points
      if (answer.user.toString() !== userId) {
        const answerUser = await User.findById(answer.user);
        answerUser.points += 2;
        
        // Check if user should level up
        const newLevelProgress = answerUser.levelProgress + 2;
        if (newLevelProgress >= 100) {
          answerUser.level += 1;
          answerUser.levelProgress = newLevelProgress - 100;
        } else {
          answerUser.levelProgress = newLevelProgress;
        }
        
        await answerUser.save();
      }
      
      res.json({
        code: 200,
        message: '操作成功',
        data: {
          isLiked: true,
          likes: answer.likes
        }
      });
    }
  } catch (err) {
    console.error('Toggle like error:', err.message);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// @route   POST /api/answers/:answerId/dislike
// @desc    Toggle dislike status for an answer
// @access  Private
router.post('/:answerId/dislike', auth, async (req, res) => {
  try {
    const answerId = req.params.answerId;
    const userId = req.user.user.id;
    
    // Find answer
    const answer = await Answer.findById(answerId);
    
    if (!answer) {
      return res.status(404).json({
        code: 404,
        message: '回答不存在'
      });
    }
    
    // Check if already disliked
    const isDisliked = answer.usersDisliked.includes(userId);
    
    // Check if liked
    const isLiked = answer.usersLiked.includes(userId);
    
    // If liked, remove from liked array and decrease likes
    if (isLiked) {
      answer.usersLiked = answer.usersLiked.filter(
        id => id.toString() !== userId
      );
      answer.likes = Math.max(0, answer.likes - 1);
    }
    
    if (isDisliked) {
      // Remove dislike
      answer.usersDisliked = answer.usersDisliked.filter(
        id => id.toString() !== userId
      );
      
      await answer.save();
      
      res.json({
        code: 200,
        message: '操作成功',
        data: {
          isDisliked: false
        }
      });
    } else {
      // Add dislike
      answer.usersDisliked.push(userId);
      
      await answer.save();
      
      res.json({
        code: 200,
        message: '操作成功',
        data: {
          isDisliked: true
        }
      });
    }
  } catch (err) {
    console.error('Toggle dislike error:', err.message);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;