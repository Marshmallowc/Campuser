const express = require('express');
const router = express.Router();

const Favorite = require('../models/Favorite');
const auth = require('../middleware/auth');

// @route   GET /api/favorites
// @desc    Get user's favorite questions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count
    const total = await Favorite.countDocuments({ user: req.user.user.id });
    
    // Get favorites with pagination
    const favorites = await Favorite.find({ user: req.user.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'question',
        populate: {
          path: 'user',
          select: 'username avatar'
        }
      });
    
    // Format response
    const formattedFavorites = await Promise.all(favorites.map(async favorite => {
      const question = favorite.question;
      
      // Get answer count
      const Answer = require('../models/Answer');
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
        favorites: formattedFavorites
      }
    });
  } catch (err) {
    console.error('Get favorites error:', err.message);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router; 