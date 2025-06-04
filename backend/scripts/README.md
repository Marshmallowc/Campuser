# 数据库维护脚本

本目录包含了用于数据库维护的脚本。

## 索引更新脚本

### update-indexes.js

这个脚本用于删除users集合中的email索引，在移除email字段后运行，以避免重复键错误。

**运行方法**:

```bash
# 确保在项目根目录下运行
node scripts/update-indexes.js
```

**预期输出**:

```
MongoDB连接成功
成功删除email索引
当前索引列表: [...]
MongoDB连接已关闭
```

如果索引不存在，会显示:

```
MongoDB连接成功
更新索引时出错: ns not found
索引不存在，无需删除
MongoDB连接已关闭
```

## 注意事项

- 请在运行脚本前备份数据库
- 脚本执行可能需要MongoDB管理员权限
- 如果在生产环境运行，请先在测试环境验证 