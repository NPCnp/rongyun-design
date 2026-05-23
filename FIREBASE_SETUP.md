# Firebase 配置指南

## 为什么需要 Firebase？

之前的 `localStorage` 只能在**同一设备、同一浏览器**中共享数据。

使用 Firebase 后，可以实现：
- 📱 手机下单 → 💻 电脑立即看到
- 🌐 多设备实时同步
- 📦 订单数据云端永久保存

## 配置步骤

### 1. 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击「创建项目」
3. 输入项目名称（如：rongyun-diy）
4. 完成创建

### 2. 启用 Realtime Database

1. 在 Firebase 控制台左侧菜单找到「构建」→「实时数据库」
2. 点击「创建数据库」
3. 选择数据库位置（建议选美国或欧洲）
4. 选择「在测试模式下启动」（生产环境需要配置安全规则）
5. 完成创建

### 3. 获取 Firebase 配置信息

1. 在 Firebase 控制台，点击齿轮图标（⚙️）→「项目设置」
2. 向下滚动找到「您的应用」
3. 点击「添加应用」→「网页」（</> 图标）
4. 输入应用昵称（如：DiyOrder）
5. 点击「注册应用」
6. 复制 `firebaseConfig` 对象中的信息

### 4. 配置到代码中

#### 方法一：修改代码中的占位符

找到 `index-inline.html` 和 `admin.html` 中的这段代码：

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

把 `YOUR_XXX` 替换成你刚才复制的实际值。

#### 方法二：创建单独的配置文件（推荐）

1. 创建 `firebase-config.js`：

```javascript
window.firebaseConfig = {
    apiKey: "你的实际值",
    authDomain: "你的实际值",
    databaseURL: "你的实际值",
    projectId: "你的实际值",
    storageBucket: "你的实际值",
    messagingSenderId: "你的实际值",
    appId: "你的实际值"
};
```

2. 在 HTML 中引用：

```html
<script src="firebase-config.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.8.1/firebase-database-compat.js"></script>
```

3. 修改 `initFirebase()` 函数：

```javascript
function initFirebase() {
    const firebaseConfig = window.firebaseConfig;
    
    try {
        if (typeof firebase !== 'undefined') {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            firebaseDB = firebase.database();
            console.log('Firebase 初始化成功');
            if (typeof listenToFirebase === 'function') {
                listenToFirebase();
            }
        }
    } catch (e) {
        console.log('Firebase 未配置，仅使用本地存储');
    }
}
```

### 5. 配置数据库安全规则（重要！）

为了安全起见，建议配置安全规则：

```rules
{
  "rules": {
    "orders": {
      ".read": true,
      ".write": true
    }
  }
}
```

**注意：** 这是开发环境的宽松规则。生产环境建议使用：

```rules
{
  "rules": {
    "orders": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## 测试配置

1. 在手机上打开 `index-inline.html`，提交一个订单
2. 在电脑上打开 `admin.html`，应该能看到刚才的订单
3. 在电脑上修改订单状态，手机上应该也能看到变化

## 故障排查

### 问题：Console 显示 "Firebase 未配置"

**解决：** 检查配置信息是否正确

### 问题：订单不同步

**解决：**
1. 检查两个文件用的是同一个 Firebase 配置
2. 查看浏览器 Console 是否有错误
3. 检查 Realtime Database 是否启用

### 问题：上传图片太大

**解决：** Firebase Realtime Database 不适合存储大量图片数据。
建议：
- 把设计图压缩后再保存
- 或者使用 Firebase Storage 存储图片，数据库只存 URL

## 免费额度

Firebase 免费额度：
- Realtime Database：1 GB 存储、10 GB 传输/月
- 足够小项目使用

## 高级功能（可选）

### 添加用户认证

1. 在 Firebase 控制台启用「身份验证」
2. 添加邮箱/密码登录方式
3. 修改安全规则要求用户登录后才能读写

### 添加订单推送通知

可以使用 Firebase Cloud Functions 或第三方服务在订单提交时发送通知。
