# 榕韵亲子定制

福州文旅自助设计系统

## 🚀 快速部署

### 使用 Vercel 部署（推荐）

1. 将本文件夹的文件上传到 GitHub 仓库
2. 访问 [vercel.com](https://vercel.com)
3. 用 GitHub 账号登录
4. 点击 "New Project"
5. 选择您的仓库
6. 点击 "Deploy"
7. 几秒钟后部署完成！

### 使用 Netlify 部署

1. 访问 [netlify.com](https://netlify.com)
2. 用 GitHub 账号登录
3. 点击 "Add new site" → "Deploy manually"
4. 直接拖拽文件夹到上传区域
5. 部署完成！

### 使用 GitHub Pages

1. 创建 GitHub 仓库
2. 上传所有文件
3. 进入仓库 Settings → Pages
4. 选择 main 分支，点击 Save
5. 等待几分钟即可访问

## 📱 功能说明

### 设计端 (index-standalone.html)
- 🎨 自助设计明信片/帆布袋
- 📝 添加文字和图案
- ✅ 下单提交到云端
- 📋 取件码生成

### 管理端 (admin.html)
- 📊 订单管理
- 🔍 状态筛选
- 🔑 取件码查询
- 💾 本地+云端存储

## 🛠️ 技术栈

- Fabric.js 画布设计
- Supabase 云端数据库
- 响应式设计支持移动端

## 📄 文件结构

```
DIY/
├── index.html              # 设计端（完整版）
├── index-standalone.html  # 设计端（精简版）
├── admin.html            # 管理端
├── src/
│   ├── config.js         # 配置文件
│   ├── data.js         # 数据文件
│   ├── canvas-manager.js # 画布管理
│   ├── order-manager.js  # 订单管理
│   ├── app.js          # 主应用逻辑
│   └── styles.css       # 样式文件
└── vercel.json          # Vercel 配置
```

## 🔧 配置说明

在 `src/config.js` 和 `admin.html` 中配置您的 Supabase 凭证：

```javascript
var SUPABASE_URL = 'your-supabase-url';
var SUPABASE_ANON_KEY = 'your-anon-key';
```

在 Supabase 中创建表：

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no INT8,
  name TEXT,
  phone TEXT,
  pickup_code TEXT,
  design TEXT,
  status TEXT DEFAULT '待制作',
  created_at TIMESTAMP DEFAULT now()
);
```

启用行级别安全策略，允许公开读写。

## 📞 联系方式

- 📱 138-0000-0000
