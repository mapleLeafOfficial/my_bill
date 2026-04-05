-- 合租记账本数据库初始化脚本
-- 在 Supabase Dashboard > SQL Editor 中执行此脚本

-- 人员表
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 支出记录表
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(20) NOT NULL CHECK (category IN ('水电费', '网费', '燃气费', '物业费', '其他')),
  description VARCHAR(200),
  payer_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  expense_date DATE NOT NULL,
  month VARCHAR(7) NOT NULL, -- 格式 YYYY-MM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 月度结算表
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) NOT NULL UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_settled BOOLEAN DEFAULT FALSE,
  settled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认成员（如果不存在）
INSERT INTO members (name)
SELECT * FROM (VALUES ('室友1'), ('室友2'), ('室友3')) AS t(name)
WHERE NOT EXISTS (SELECT 1 FROM members);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_expenses_month ON expenses(month);
CREATE INDEX IF NOT EXISTS idx_expenses_payer ON expenses(payer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 视图：获取支出记录（含付款人信息）
CREATE OR REPLACE VIEW expenses_with_payer AS
SELECT
  e.*,
  m.name as payer_name,
  m.avatar_url as payer_avatar
FROM expenses e
LEFT JOIN members m ON e.payer_id = m.id
ORDER BY e.expense_date DESC;
