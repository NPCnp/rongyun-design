# JSONBin.io 配置指南

## 为什么用 JSONBin.io？

- ✅ **国内可直接访问**，无需代理
- ✅ **免费额度充足**：每天 1000 次写入
- ✅ **配置简单**，无需信用卡

## 配置步骤

### 1. 注册 JSONBin.io

1. 访问 https://jsonbin.io
2. 使用 GitHub 或邮箱注册账号
3. 登录后进入 Dashboard

### 2. 创建 Bin

1. 点击「**Create a new Bin**」
2. 选择 Bin 类型：「**Private**」（私有）
3. 创建后会得到一个 **Bin ID**（格式如：`65a1234567890abcdef12345`）

### 3. 获取 API Key

1. 点击右上角头像
2. 选择「**API Keys**」
3. 复制 **Master Key**（这个是管理密钥）

### 4. 配置到代码中

#### 修改 index-inline.html

找到这段代码：

```javascript
const JSONBIN_BIN_ID = 'YOUR_BIN_ID';
const JSONBIN_API_KEY = 'YOUR_API_KEY';
```

替换为你的实际值：

```javascript
const JSONBIN_BIN_ID = '65a1234567890abcdef12345';
const JSONBIN_API_KEY = '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

#### 修改 admin.html

同样的位置，替换相同的值。

## 如何使用

### 手机端

1. 用户在手机上下单
2. 订单自动保存到 localStorage
3. 同时推送到 JSONBin 云端

### 电脑端

1. 打开 admin.html
2. 每 5 秒自动检查一次 JSONBin
3. 如果有新房单，自动同步到本地显示

## 注意事项

### 安全提示

- 不要把 API Key 提交到 GitHub 公有仓库
- 建议创建单独的配置文件

### 免费额度

- 每天 1000 次写入
- 每个 Bin 最大 500KB
- 超过后需要付费

### 数据备份

- JSONBin 会自动保存历史版本
- 可以随时回滚数据

## 测试配置

1. 在手机上打开 index-inline.html
2. 提交一个测试订单
3. 在电脑上打开 admin.html
4. 应该能在 5 秒内看到新订单

## 故障排查

### 问题：Console 显示 "JSONBin 未配置，跳过云端保存"

**解决：** 检查 BIN_ID 和 API_KEY 是否正确配置

### 问题：订单不同步

**解决：**
1. 确认两个文件配置的是同一个 Bin
2. 检查 API Key 是否正确
3. 查看 Console 是否有错误信息

### 问题：达到写入限制

**解决：** 免费用户每天 1000 次写入，次日重置
