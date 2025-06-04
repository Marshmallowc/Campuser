# 速问App后端 (QuickCust Backend)

基于 Node.js + Express + MongoDB 的速问App后端服务。

## 功能特性

- 用户认证 (注册、登录、忘记密码)
- 用户资料管理
- 问题管理
- 回答管理
- 点赞、收藏功能

## 技术栈

- Node.js
- Express
- MongoDB
- JWT 认证
- Multer (文件上传)

## 环境要求

- Node.js 14.x 或更高版本
- MongoDB 服务器

## 安装和运行

1. 克隆项目

```bash
git clone <repository-url>
cd quickcust-backend
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

创建 `.env` 文件在项目根目录中，并配置以下变量：

```
PORT=8080
JWT_SECRET=your_jwt_secret_key
```

4. 启动服务器

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## API 文档

详细的API文档见 `api.md` 文件。

## 项目结构

```
├── models/             # 数据库模型
├── routes/             # 路由处理
├── middleware/         # 中间件
├── uploads/            # 上传文件目录
├── server.js           # 入口文件
├── package.json        # 项目依赖
└── README.md           # 项目说明
```

## 数据库配置

本项目使用 MongoDB 作为数据库。默认连接字符串：

```
mongodb://root:nns2n8k7@quickcust-mongodb.ns-ulhx2f83.svc:27017
```

## 授权和认证

API 使用 JWT (JSON Web Token) 进行认证。大多数端点需要在 HTTP 请求头中包含有效的 JWT 令牌：

```
Authorization: Bearer <token>
``` 