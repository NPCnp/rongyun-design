# LeanCloud 配置指南

LeanCloud 是国内可用的 BaaS（Backend as a Service）服务，完全兼容中国大陆网络环境。

## 配置步骤

### 1. 注册 LeanCloud 账号

- 访问 [LeanCloud 官网](https://www.leancloud.cn)
- 使用手机号注册并登录

### 2. 创建应用

1. 进入控制台，点击「创建应用」
2. 选择「开发版」（免费）
3. 填写应用名称，例如「榕韵订单系统」
4. 选择数据中心（建议「华东」）
5. 点击「创建」

### 3. 获取应用凭证

1. 在应用列表中点击刚创建的应用
2. 在左侧菜单选择「设置 → 应用凭证」
3. 复制以下信息：
   - **AppID**
   - **AppKey**
   - **服务器地址 (API 服务器 URL)**

### 4. 配置到代码中

找到两个文件中的配置部分：

**index-inline.html 和 admin.html 中都有：**
```javascript
const LC_APP_ID = 'YOUR_APP_ID';      // 替换为你的 AppID
const LC_APP_KEY = 'YOUR_APP_KEY';    // 替换为你的 AppKey
const LC_SERVER_URL = 'YOUR_SERVER_URL';  // 替换为你的服务器地址
```

将 `YOUR_XXX` 替换为你复制的实际值。

### 5. 配置 Class（数据表）权限

为了安全，我们需要设置权限：

1. 在左侧菜单选择「存储 → 数据」
2. 点击「新建 Class」
3. Class 名称填写：`Order`
4. 选择「受保护的读写」
5. 点击「创建」
6. 点击 `Order` 类右边的 ⚙️ →「权限设置」
7. 把「添加」「查找」「删除」「更新」都设为「所有人」

## 使用说明

### 手机端
- 用户下单 → 自动保存到 LeanCloud
- 同时保存在 localStorage 中

### 电脑端
- 打开 admin.html
- 每 5 秒自动从 LeanCloud 拉取新订单
- 自动合并到本地数据
- 标记状态、删除等操作同步到云端

## 免费配额

LeanCloud 开发版免费配额：
- **API 请求：** 3 万次/天
- **数据存储：** 1 GB
- **文件存储：** 10 GB
- 足够小订单系统使用

## 故障排查

### Console 提示「LeanCloud 未配置」
- 检查是否替换了所有的 `YOUR_XXX`
- 确保代码没有拼写错误

### 订单无法保存
- 检查「Order」Class 是否创建
- 检查 Class 权限是否正确设置

### 订单数据不同步
- 确保两个文件使用相同的 AppID
- 检查浏览器 Console 是否有错误信息

## 安全提示

- 不要将 AppKey 公开到 GitHub 等平台
- 生产环境建议使用 LeanCloud 的用户认证功能
