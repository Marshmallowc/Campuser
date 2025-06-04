# 速问App后端接口文档

## 用户管理
### 1. 用户注册
- **接口路径**: `/api/auth/register`
- **请求方法**: `POST`
- **请求参数**:
  ```json
  {
    "username": "用户名",
    "password": "密码",
    "email": "邮箱"
  }
  ```
- **响应内容**:
  ```json
  {
    "code": 200,
    "message": "注册成功",
    "data": {
      "userId": "用户ID",
      "token": "认证token"
    }
  }
  ```

### 2. 用户登录
- **接口路径**: `/api/auth/login`
- **请求方法**: `POST`
- **请求参数**:
  ```json
  {
    "username": "用户名/邮箱",
    "password": "密码"
  }
  ```
- **响应内容**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "userId": "用户ID",
      "token": "认证token",
      "userProfile": {
        "username": "用户名",
        "avatar": "头像URL",
        "bio": "个人简介",
        "birthday": "生日",
        "level": 3,
        "levelProgress": 45,
        "points": 248
      }
    }
  }
  ```

### 3. 忘记密码
- **接口路径**: `/api/auth/forgot-password`
- **请求方法**: `POST`
- **请求参数**:
  ```json
  {
    "email": "注册邮箱"
  }
  ```
- **响应内容**:
  ```json
  {
    "code": 200,
    "message": "密码重置邮件已发送"
  }
  ```

### 4. 重置密码
- **接口路径**: `/api/auth/reset-password`
- **请求方法**: `POST`
- **请求参数**:
  ```json
  {
    "token": "重置令牌",
    "newPassword": "新密码"
  }
  ```
- **响应内容**:
  ```json
  {
    "code": 200,
    "message": "密码重置成功"
  }
  ```

### 5. 退出登录
- **接口路径**: `/api/auth/logout`
- **请求方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **响应内容**:
  ```json
  {
    "code": 200,
    "message": "退出成功"
  }
  ```

## 用户资料管理
### 1. 获取用户资料
- **接口路径**: `/api/users/profile`
- **请求方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **响应内容**:
  ```json
  {
    "code": 200,
    "data": {
      "username": "用户名",
      "avatar": "头像URL",
      "bio": "个人简介",
      "birthday": "生日",
      "level": 3,
      "levelProgress": 45,
      "points": 248
    }
  }
  ```

### 2. 更新用户资料
- **接口路径**: `/api/users/profile`
- **请求方法**: `PUT`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
  ```json
  {
    "username": "更新的用户名",
    "bio": "更新的个人简介",
    "birthday": "更新的生日"
  }
  ```
- **响应内容**:
  ```json
  {
    "code": 200,
    "message": "资料更新成功",
    "data": {
      "username": "更新后的用户名",
      "avatar": "头像URL",
      "bio": "更新后的个人简介",
      "birthday": "更新后的生日",
      "level": 3,
      "levelProgress": 45,
      "points": 248
    }
  }
  ```

### 3. 上传头像
- **接口路径**: `/api/users/avatar`
- **请求方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **请求内容**: `multipart/form-data`，包含图片文件
- **响应内容**:
  ```json
  {
    "code": 200,
    "message": "头像上传成功",
    "data": {
      "avatarUrl": "新头像URL"
    }
  }
  ```

### 4. 获取用户统计数据
- **接口路径**: `/api/users/statistics`
- **请求方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **响应内容**:
  ```json
  {
    "code": 200,
    "data": {
      "questions": 12,
      "answers": 36,
      "followers": 58,
      "following": 23
    }
  }
  ```

## 问题管理
### 1. 获取问题列表
- **接口路径**: `/api/questions`
- **请求方法**: `GET`
- **查询参数**:
  - `tab`: 标签类型 (all/follow/recommend/hot)
  - `page`: 页码
  - `limit`: 每页条数
- **响应内容**:
  ```json
  {
    "code": 200,
    "data": {
      "total": 100,
      "questions": [
        {
          "id": 1,
          "title": "问题标题",
          "description": "问题描述",
          "userName": "提问者用户名",
          "avatar": "提问者头像URL",
          "time": "2023-03-29",
          "viewCount": 156,
          "answerCount": 8
        }
      ]
    }
  }
  ```

### 2. 获取问题详情
- **接口路径**: `/api/questions/{id}`
- **请求方法**: `GET`
- **响应内容**:
  ```json
  {
    "code": 200,
    "data": {
      "id": 1,
      "title": "问题标题",
      "description": "问题详细描述",
      "userName": "提问者用户名",
      "avatar": "提问者头像URL",
      "time": "2023-03-29",
      "viewCount": 156,
      "answerCount": 8,
      "isFavorite": false
    }
  }
  ```

### 3. 发布问题
- **接口路径**: `/api/questions`
- **请求方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
  ```json
  {
    "content": "问题标题",
    "description": "问题详细描述"
  }
  ```
- **响应内容**:
  ```json
  {
    "code": 200,
    "message": "问题发布成功",
    "data": {
      "id": "新问题ID"
    }
  }
  ```

### 4. 获取我的提问列表
- **接口路径**: `/api/questions/my`
- **请求方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `page`: 页码
  - `limit`: 每页条数
- **响应内容**:
  ```json
  {
    "code": 200,
    "data": {
      "total": 12,
      "questions": [
        {
          "id": 1,
          "title": "问题标题",
          "description": "问题描述",
          "time": "2023-03-29",
          "viewCount": 156,
          "answerCount": 8
        }
      ]
    }
  }
  ```

## 回答管理
### 1. 获取问题的回答列表
- **接口路径**: `/api/questions/{questionId}/answers`
- **请求方法**: `GET`
- **查询参数**:
  - `page`: 页码
  - `limit`: 每页条数
  - `sort`: 排序方式 (time/likes)
- **响应内容**:
  ```json
  {
    "code": 200,
    "data": {
      "total": 36,
      "answers": [
        {
          "id": 1,
          "content": "回答内容",
          "userName": "回答者用户名",
          "avatar": "回答者头像URL",
          "time": "2023-04-01",
          "likes": 24,
          "isLiked": false,
          "isDisliked": false
        }
      ]
    }
  }
  ```

### 2. 发布回答
- **接口路径**: `/api/questions/{questionId}/answers`
- **请求方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
  ```json
  {
    "content": "回答内容"
  }
  ```
- **响应内容**:
  ```json
  {
    "code": 200,
    "message": "回答发布成功",
    "data": {
      "id": "新回答ID"
    }
  }
  ```

### 3. 获取可回答的问题列表
- **接口路径**: `/api/questions/unanswered`
- **请求方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `page`: 页码
  - `limit`: 每页条数
- **响应内容**:
  ```json
  {
    "code": 200,
    "data": {
      "total": 50,
      "questions": [
        {
          "id": 1,
          "title": "问题标题",
          "description": "问题描述",
          "userName": "提问者用户名",
          "avatar": "提问者头像URL",
          "time": "2023-03-29",
          "viewCount": 156,
          "answerCount": 8
        }
      ]
    }
  }
  ```

### 4. 获取我的回答列表
- **接口路径**: `/api/answers/my`
- **请求方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `page`: 页码
  - `limit`: 每页条数
- **响应内容**:
  ```json
  {
    "code": 200,
    "data": {
      "total": 36,
      "answers": [
        {
          "id": 1,
          "questionId": 2,
          "questionTitle": "问题标题",
          "content": "回答内容",
          "time": "2023-04-01",
          "likes": 24
        }
      ]
    }
  }
  ```

## 交互功能
### 1. 点赞/取消点赞
- **接口路径**: `/api/answers/{answerId}/like`
- **请求方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **响应内容**:
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "isLiked": true,
      "likes": 25
    }
  }
  ```

### 2. 不喜欢/取消不喜欢
- **接口路径**: `/api/answers/{answerId}/dislike`
- **请求方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **响应内容**:
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "isDisliked": true
    }
  }
  ```

### 3. 收藏/取消收藏问题
- **接口路径**: `/api/questions/{questionId}/favorite`
- **请求方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **响应内容**:
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "isFavorite": true
    }
  }
  ```

### 4. 获取收藏列表
- **接口路径**: `/api/favorites`
- **请求方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `page`: 页码
  - `limit`: 每页条数
- **响应内容**:
  ```json
  {
    "code": 200,
    "data": {
      "total": 15,
      "favorites": [
        {
          "id": 1,
          "title": "问题标题",
          "description": "问题描述",
          "userName": "提问者用户名",
          "avatar": "提问者头像URL",
          "time": "2023-03-29",
          "viewCount": 156,
          "answerCount": 8
        }
      ]
    }
  }
  ```
