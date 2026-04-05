# Todo1：项目初始化 + Supabase 配置

## 基本信息

- **对应 PRD 模块**：基础设施
- **优先级**：P0
- **预估工作量**：15 个文件
- **依赖**：无
- **状态**：✅ 已完成

---

## 目标描述

初始化 React + Vite + TypeScript 项目，配置 Tailwind CSS 和 shadcn/ui，创建 Supabase 项目并设置数据库表结构。

---

## 任务清单

### 项目初始化

- [x] **创建 Vite 项目**：`npm create vite@latest . -- --template react-ts`
- [x] **安装依赖**：Tailwind CSS、shadcn/ui、React Router、React Query
- [x] **配置 Tailwind CSS**：初始化并配置
- [x] **配置 shadcn/ui**：初始化并安装常用组件

### Supabase 配置

- [x] **安装 Supabase JS SDK**：`@supabase/supabase-js`
- [x] **创建 Supabase 客户端**：`src/lib/supabase.ts`
- [x] **创建数据库迁移脚本**：表结构 SQL

### 数据库表

- [x] **创建 members 表**：人员信息（含头像字段）
- [x] **创建 expenses 表**：支出记录
- [x] **创建 settlements 表**：月度结算
- [x] **插入默认人员数据**：3 个默认成员

### 项目结构

- [x] **创建目录结构**：components、pages、hooks、lib、types
- [x] **创建类型定义**：`src/types/index.ts`

---

## 涉及的文件

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新增 | `package.json` | 项目配置 |
| 新增 | `vite.config.ts` | Vite 配置 |
| 新增 | `tailwind.config.js` | Tailwind 配置 |
| 新增 | `src/index.css` | 全局样式 |
| 新增 | `src/lib/supabase.ts` | Supabase 客户端 |
| 新增 | `src/types/index.ts` | TypeScript 类型 |
| 新增 | `supabase/migrations/001_init.sql` | 数据库表结构 |
| 新增 | `src/App.tsx` | 应用入口 |
| 新增 | `src/main.tsx` | 渲染入口 |

---

## 验证标准

- [x] `npm run dev` 启动成功
- [x] Supabase 连接成功（控制台无报错）
- [ ] 数据库表创建成功（在 Supabase Dashboard 可见）- 需用户手动执行 SQL

---

## Supabase 表结构 SQL

```sql
-- 人员表
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 支出记录表
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('水电费', '网费', '燃气费', '物业费', '其他')),
  description VARCHAR(200),
  payer_id UUID NOT NULL REFERENCES members(id),
  expense_date DATE NOT NULL,
  month VARCHAR(7) NOT NULL, -- 格式 YYYY-MM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 月度结算表
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) NOT NULL UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_settled BOOLEAN DEFAULT FALSE,
  settled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认成员
INSERT INTO members (name) VALUES ('室友1'), ('室友2'), ('室友3');

-- 创建索引
CREATE INDEX idx_expenses_month ON expenses(month);
CREATE INDEX idx_expenses_payer ON expenses(payer_id);
```

---

## 备注

需要在 Supabase Dashboard 创建项目并获取：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
