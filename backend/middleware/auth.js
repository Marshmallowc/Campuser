const jwt = require('jsonwebtoken');

// JWT secret should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'quickcust-secret-key';

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '认证失败: 无效的令牌格式'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '认证失败: 未提供令牌'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({
      code: 401,
      message: '认证失败: 令牌无效'
    });
  }
}; 