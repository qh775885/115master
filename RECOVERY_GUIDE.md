# GitHub账户恢复后的操作指南

## 🔄 恢复同步步骤

### 1. 验证账户状态

```bash
# 检查是否能访问GitHub
git remote -v
```

### 2. 推送所有本地更改

```bash
# 推送主分支
git push origin main

# 推送所有标签
git push origin --tags

# 推送功能分支
git push origin feature/quality-memory
```

### 3. 创建Release发布

```bash
# 在GitHub网站上创建Release
# 版本: v1.6.1-mod.0.0.2
# 标题: 115Master 修改版 - 画质记忆功能
# 描述: 包含画质选择记忆功能的完整版本
# 附件:
#   - 115master.user.js
#   - 115master.meta.js
```

## 📦 文件发布清单

### 必须上传的文件

- `dist/115master.user.js` - 主脚本文件
- `dist/115master.meta.js` - 元数据文件

### 版本信息

- **版本号**: v1.6.1-mod.0.0.2
- **基于**: cbingb666/115master v1.6.1
- **新增功能**: 画质选择记忆
- **完整性**: 包含版权声明和项目信息

## 🎯 后续维护

### 定期备份

```bash
# 每次重要更新后
git tag -a v1.6.1-mod.0.0.x -m "描述信息"
cp dist/115master.user.js backup/
```

### 版本升级策略

- 原作者更新时：使用已建立的合并策略
- 功能修改时：递增mod版本号
- 重大改动时：更新基础版本号

## 🔗 相关链接

- 原作品: https://github.com/cbingb666/115master
- 修改版: https://github.com/qh775885/115master
- 问题反馈: https://github.com/qh775885/115master/issues
