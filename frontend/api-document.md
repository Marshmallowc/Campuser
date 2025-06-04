# 速问App API接口文档

## 基础信息

- **API根地址**: `https://phrzkdfnowea.sealoshzh.site`
- **基础URL**: `/api`
- **完整基础URL**: `https://phrzkdfnowea.sealoshzh.site/api`
- **数据格式**: JSON
- **认证方式**: Bearer Token
- **状态码**: 
  - 200: 成功
  - 400: 请求错误
  - 401: 认证失败
  - 404: 资源不存在
  - 500: 服务器错误

## 认证和用户管理

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
- **成功响应** (200):
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
- **失败响应** (400):
  ```json
  {
    "code": 400,
    "message": "该邮箱已被注册/该用户名已被使用/密码至少需要6个字符"
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
- **成功响应** (200):
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
- **失败响应** (400):
  ```json
  {
    "code": 400,
    "message": "用户名/邮箱或密码不正确"
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
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "message": "密码重置邮件已发送"
  }
  ```
- **失败响应** (404):
  ```json
  {
    "code": 404,
    "message": "该邮箱未注册"
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
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "message": "密码重置成功"
  }
  ```
- **失败响应** (400):
  ```json
  {
    "code": 400,
    "message": "重置令牌无效或已过期"
  }
  ```

### 5. 退出登录

- **接口路径**: `/api/auth/logout`
- **请求方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "message": "退出成功"
  }
  ```
- **失败响应** (401):
  ```json
  {
    "code": 401,
    "message": "认证失败: 令牌无效"
  }
  ```

## 用户资料管理

### 1. 获取用户资料

- **接口路径**: `/api/users/profile`
- **请求方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **成功响应** (200):
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
- **失败响应** (401/404):
  ```json
  {
    "code": 401,
    "message": "认证失败: 令牌无效"
  }
  ```
  或
  ```json
  {
    "code": 404,
    "message": "用户不存在"
  }
  ```

### 2. 更新用户资料

- **接口路径**: `/api/users/profile`
- **请求方法**: `PUT`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数** (所有字段均为可选):
  ```json
  {
    "username": "更新的用户名",
    "bio": "更新的个人简介",
    "birthday": "更新的生日"
  }
  ```
- **成功响应** (200):
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
- **失败响应** (400/401/404):
  ```json
  {
    "code": 400,
    "message": "该用户名已被使用"
  }
  ```

### 3. 上传头像

- **接口路径**: `/api/users/avatar`
- **请求方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **请求内容**: `multipart/form-data`，包含key为`avatar`的图片文件
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "message": "头像上传成功",
    "data": {
      "avatarUrl": "新头像URL"
    }
  }
  ```
- **失败响应** (400/401):
  ```json
  {
    "code": 400,
    "message": "未提供头像文件"
  }
  ```
  或
  ```json
  {
    "code": 400,
    "message": "仅支持图片文件 (jpeg, jpg, png, gif)"
  }
  ```

### 4. 获取用户统计数据

- **接口路径**: `/api/users/statistics`
- **请求方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **成功响应** (200):
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
- **失败响应** (401):
  ```json
  {
    "code": 401,
    "message": "认证失败: 令牌无效"
  }
  ```

## 问题管理

### 1. 获取问题列表

- **接口路径**: `/api/questions`
- **请求方法**: `GET`
- **查询参数**:
  - `tab`: 标签类型 (all/follow/recommend/hot)，默认为`all`
  - `page`: 页码，默认为`1`
  - `limit`: 每页条数，默认为`10`
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "data": {
      "total": 100,
      "questions": [
        {
          "id": "问题ID",
          "title": "问题标题",
          "description": "问题描述",
          "userName": "提问者用户名",
          "avatar": "提问者头像URL",
          "time": "2023-03-29T00:00:00.000Z",
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
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "data": {
      "id": "问题ID",
      "title": "问题标题",
      "description": "问题详细描述",
      "userName": "提问者用户名",
      "avatar": "提问者头像URL",
      "time": "2023-03-29T00:00:00.000Z",
      "viewCount": 156,
      "answerCount": 8,
      "isFavorite": false
    }
  }
  ```
- **失败响应** (404):
  ```json
  {
    "code": 404,
    "message": "问题不存在"
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
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "message": "问题发布成功",
    "data": {
      "id": "新问题ID"
    }
  }
  ```
- **失败响应** (400/401):
  ```json
  {
    "code": 400,
    "message": "问题标题不能为空"
  }
  ```
  或
  ```json
  {
    "code": 400,
    "message": "问题标题不能超过100个字符"
  }
  ```
  或
  ```json
  {
    "code": 400,
    "message": "问题描述不能超过2000个字符"
  }
  ```

### 4. 获取我的提问列表

- **接口路径**: `/api/questions/my/list`
- **请求方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `page`: 页码，默认为`1`
  - `limit`: 每页条数，默认为`10`
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "data": {
      "total": 12,
      "questions": [
        {
          "id": "问题ID",
          "title": "问题标题",
          "description": "问题描述",
          "time": "2023-03-29T00:00:00.000Z",
          "viewCount": 156,
          "answerCount": 8
        }
      ]
    }
  }
  ```
- **失败响应** (401):
  ```json
  {
    "code": 401,
    "message": "认证失败: 令牌无效"
  }
  ```

### 5. 获取可回答的问题列表

- **接口路径**: `/api/questions/unanswered/list`
- **请求方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `page`: 页码，默认为`1`
  - `limit`: 每页条数，默认为`10`
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "data": {
      "total": 50,
      "questions": [
        {
          "id": "问题ID",
          "title": "问题标题",
          "description": "问题描述",
          "userName": "提问者用户名",
          "avatar": "提问者头像URL",
          "time": "2023-03-29T00:00:00.000Z",
          "viewCount": 156,
          "answerCount": 8
        }
      ]
    }
  }
  ```
- **失败响应** (401):
  ```json
  {
    "code": 401,
    "message": "认证失败: 令牌无效"
  }
  ```

## 回答管理

### 1. 获取问题的回答列表

- **接口路径**: `/api/questions/{questionId}/answers`
- **请求方法**: `GET`
- **查询参数**:
  - `page`: 页码，默认为`1`
  - `limit`: 每页条数，默认为`10`
  - `sort`: 排序方式 (time/likes)，默认为`time`
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "data": {
      "total": 36,
      "answers": [
        {
          "id": "回答ID",
          "content": "回答内容",
          "userName": "回答者用户名",
          "avatar": "回答者头像URL",
          "time": "2023-04-01T00:00:00.000Z",
          "likes": 24,
          "isLiked": false,
          "isDisliked": false
        }
      ]
    }
  }
  ```
- **失败响应** (404):
  ```json
  {
    "code": 404,
    "message": "问题不存在"
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
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "message": "回答发布成功",
    "data": {
      "id": "新回答ID"
    }
  }
  ```
- **失败响应** (400/401/404):
  ```json
  {
    "code": 400,
    "message": "回答内容不能为空"
  }
  ```
  或
  ```json
  {
    "code": 400,
    "message": "回答内容不能超过5000个字符"
  }
  ```
  或
  ```json
  {
    "code": 404,
    "message": "问题不存在"
  }
  ```

### 3. 获取我的回答列表

- **接口路径**: `/api/answers/my`
- **请求方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `page`: 页码，默认为`1`
  - `limit`: 每页条数，默认为`10`
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "data": {
      "total": 36,
      "answers": [
        {
          "id": "回答ID",
          "questionId": "问题ID",
          "questionTitle": "问题标题",
          "content": "回答内容",
          "time": "2023-04-01T00:00:00.000Z",
          "likes": 24
        }
      ]
    }
  }
  ```
- **失败响应** (401):
  ```json
  {
    "code": 401,
    "message": "认证失败: 令牌无效"
  }
  ```

## 交互功能

### 1. 点赞/取消点赞

- **接口路径**: `/api/answers/{answerId}/like`
- **请求方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **成功响应** (200):
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
- **失败响应** (401/404):
  ```json
  {
    "code": 404,
    "message": "回答不存在"
  }
  ```

### 2. 不喜欢/取消不喜欢

- **接口路径**: `/api/answers/{answerId}/dislike`
- **请求方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "isDisliked": true
    }
  }
  ```
- **失败响应** (401/404):
  ```json
  {
    "code": 404,
    "message": "回答不存在"
  }
  ```

### 3. 收藏/取消收藏问题

- **接口路径**: `/api/questions/{questionId}/favorite`
- **请求方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "isFavorite": true
    }
  }
  ```
- **失败响应** (401/404):
  ```json
  {
    "code": 404,
    "message": "问题不存在"
  }
  ```

### 4. 获取收藏列表

- **接口路径**: `/api/favorites`
- **请求方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `page`: 页码，默认为`1`
  - `limit`: 每页条数，默认为`10`
- **成功响应** (200):
  ```json
  {
    "code": 200,
    "data": {
      "total": 15,
      "favorites": [
        {
          "id": "问题ID",
          "title": "问题标题",
          "description": "问题描述",
          "userName": "提问者用户名",
          "avatar": "提问者头像URL",
          "time": "2023-03-29T00:00:00.000Z",
          "viewCount": 156,
          "answerCount": 8
        }
      ]
    }
  }
  ```
- **失败响应** (401):
  ```json
  {
    "code": 401,
    "message": "认证失败: 令牌无效"
  }
  ```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 认证失败或未认证 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
