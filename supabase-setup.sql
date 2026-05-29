-- 1. 创建 orders 表
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no INT8,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    pickup_code TEXT UNIQUE NOT NULL,
    design TEXT,
    status TEXT DEFAULT '待制作',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 启用 RLS（行级安全）
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3. 创建允许匿名用户读取和写入的策略
CREATE POLICY "允许匿名用户读取订单" 
    ON orders 
    FOR SELECT 
    USING (true);

CREATE POLICY "允许匿名用户创建订单" 
    ON orders 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "允许匿名用户更新订单" 
    ON orders 
    FOR UPDATE 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "允许匿名用户删除订单" 
    ON orders 
    FOR DELETE 
    USING (true);

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_orders_pickup_code ON orders(pickup_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
