# Supabase 配置指南

## 第一步：注册并创建项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "Start your project"，使用 GitHub 账号登录
3. 创建新项目：
   - Name: 项目名称（例如 "rongyun-diy"）
   - Database Password: 设置一个密码（记住这个密码）
   - Region: 选择亚太地区服务器（Tokyo 或 Singapore）
4. 等待数据库创建完成（需要 2-5 分钟）

## 第二步：创建订单表

在项目 Dashboard 中：

1. 左侧菜单点击 **SQL Editor**
2. 点击 **New Query**
3. 复制粘贴下面的 SQL 代码，点击 **Run**

```sql
-- 创建订单表
CREATE TABLE orders (
    id bigserial PRIMARY KEY,
    order_no bigint UNIQUE NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    pickup_code text,
    design text,
    status text DEFAULT '待制作',
    time text,
    created_at timestamp DEFAULT now()
);

-- 允许任何人读取（游客查看订单）
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "允许所有人读取" ON orders FOR SELECT USING (true);

-- 允许任何人插入订单（游客下单）
CREATE POLICY "允许所有人插入" ON orders FOR INSERT WITH CHECK (true);

-- 允许任何人更新（后台管理）
CREATE POLICY "允许所有人更新" ON orders FOR UPDATE USING (true);

-- 允许任何人删除
CREATE POLICY "允许所有人删除" ON orders FOR DELETE USING (true);
```

## 第三步：获取连接信息

1. 左侧菜单点击 **Settings** → **API**
2. 复制这两个信息：
   - **Project URL**: 类似 `https://xxx.supabase.co`
   - **anon public**: 一长串字符（以 `eyJ` 开头）

## 第四步：配置应用

### 配置设计页面

1. 在手机或电脑上打开设计页面
2. 点击顶部的 **⚙️ 配置云端** 按钮
3. 填入刚才获取的 Project URL 和 anon public key
4. 点击 **保存配置**

### 配置管理后台

1. 打开 `admin.html`
2. 在顶部配置区域填入同样的信息
3. 点击 **保存配置并连接**

## 完成！

现在：
- ✅ 游客在手机端下单会自动同步到云端
- ✅ 管理后台可以实时查看新订单
- ✅ 可以标记订单完成、删除订单等操作
- ✅ 设计图数据会保存到数据库

## 注意事项

- Supabase 免费版每天有 50,000 次请求限制，完全够用
- 数据库大小限制 500MB，足够保存大量订单
- anon public key 是公开的，不怕泄露
- 如果担心安全，可以后续配置更严格的权限策略
