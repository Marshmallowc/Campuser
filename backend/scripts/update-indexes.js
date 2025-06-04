/**
 * 这个脚本用于删除users集合中的email索引
 * 在移除email字段后运行，以避免重复键错误
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:nns2n8k7@quickcust-mongodb.ns-ulhx2f83.svc:27017';

async function updateIndexes() {
  try {
    // 连接到MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB连接成功');
    
    // 获取数据库连接
    const db = mongoose.connection;
    
    // 删除users集合中的email索引
    await db.collection('users').dropIndex('email_1');
    
    console.log('成功删除email索引');
    
    // 显示当前索引列表
    const indexes = await db.collection('users').indexes();
    console.log('当前索引列表:', indexes);
    
  } catch (error) {
    console.error('更新索引时出错:', error.message);
    if (error.code === 27) {
      console.log('索引不存在，无需删除');
    }
  } finally {
    // 关闭MongoDB连接
    await mongoose.disconnect();
    console.log('MongoDB连接已关闭');
  }
}

// 执行更新索引操作
updateIndexes(); 