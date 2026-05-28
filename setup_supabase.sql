-- 创建订单表
CREATE TABLE orders (
  id bigserial PRIMARY KEY,
  order_no bigint UNIQUE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  pickup_code text,
  design text,          -- 存设计图的 base64 或图片链接
  status text DEFAULT '待制作',
  time text,
  device_type text,     -- 设备类型：mobile（手机）或 desktop（电脑）
  created_at timestamptz DEFAULT now()
);

-- 开启行级安全（RLS）
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 允许任何人读取订单（管理端和顾客查看都需要）
CREATE POLICY "允许所有人读取" ON orders FOR SELECT USING (true);

-- 允许任何人插入新订单（游客下单）
CREATE POLICY "允许所有人插入" ON orders FOR INSERT WITH CHECK (true);

-- 允许任何人更新订单（管理端改状态、恢复待制作等）
CREATE POLICY "允许所有人更新" ON orders FOR UPDATE USING (true);

-- 允许删除订单
CREATE POLICY "允许所有人删除" ON orders FOR DELETE USING (true);
