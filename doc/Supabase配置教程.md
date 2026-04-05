# Supabase 配置教程

本教程将指导你从零开始创建 Supabase 项目并配置合租记账本应用。

---

## 第一步：注册 Supabase 账号

1. 打开浏览器，访问 [https://supabase.com](https://supabase.com)

2. 点击右上角 **Start your project** 按钮

3. 选择注册方式：
   - **GitHub**（推荐）- 点击 Continue with GitHub
   - 或使用邮箱注册

4. 如果用邮箱注册，填写邮箱和密码后，去邮箱点击验证链接

---

## 第二步：创建组织

首次登录需要创建组织：

1. 输入组织名称，如：`My Projects`
2. 点击 **Create organization**

---

## 第三步：创建项目

1. 点击 **New project** 按钮

2. 填写项目信息：
   - **Name**: `split-bill`（或任意名称）
   - **Database Password**: 输入你的密码（记住这个密码）
   - **Region**: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`（离中国最近）

3. 点击 **Create new project**

4. 等待约 2 分钟，项目创建完成

---

## 第四步：获取 API 密钥

1. 项目创建完成后，点击左侧菜单 **Settings**（齿轮图标）

2. 点击 **API** 选项

3. 找到以下两个值并复制：

   | 字段 | 位置 | 说明 |
   |------|------|------|
   | **Project URL** | Project URL 框 | `https://xxxxxx.supabase.co` |
   | **anon public key** | Project API keys → anon public | `eyJhbGciOiJIUz...` |

4. 复制后保存好，下一步需要用到

---

## 第五步：配置本地环境

1. 打开终端，进入项目目录

2. 编辑 `.env` 文件：
   ```bash
   cd /home/mengxi/codework/记账本
   nano .env
   ```

3. 替换为你的真实值：
   ```env
   VITE_SUPABASE_URL=https://你的项目ID.supabase.co
   VITE_SUPABASE_ANON_KEY=你的anon-key
   ```

4. 保存退出（nano: Ctrl+O 保存，Ctrl+X 退出）

---

## 第六步：创建数据库表

1. 回到 Supabase Dashboard

2. 点击左侧菜单 **SQL Editor**（数据库图标）

3. 点击 **New query**

4. 复制以下 SQL 并粘贴到编辑器：

```sql
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
  month VARCHAR(7) NOT NULL,
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

-- 插入默认成员
INSERT INTO members (name)
SELECT * FROM (VALUES ('室友1'), ('室友2'), ('室友3')) AS t(name)
WHERE NOT EXISTS (SELECT 1 FROM members);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_expenses_month ON expenses(month);
CREATE INDEX IF NOT EXISTS idx_expenses_payer ON expenses(payer_id);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS expenses_updated_at ON expenses;
CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

5. 点击右下角 **Run** 按钮执行

6. 看到 `Success. No rows returned` 表示执行成功

---

## 第七步：创建存储桶（用于头像上传）

1. 点击左侧菜单 **Storage**（文件夹图标）

2. 点击 **New bucket**

3. 填写：
   - **Name**: `avatars`
   - **Public bucket**: ✅ 勾选

4. 点击 **Create bucket**

5. 点击刚创建的 `avatars` 桶

6. 点击 **Policies** 标签

7. 点击 **New Policy**

8. 选择 **For full customization**

9. 配置：
   - **Policy name**: `Allow public access`
   - **Allowed operations**: 勾选 `SELECT` 和 `INSERT`
   - **Target roles**: 勾选 `anon`
   - **Using expression**: 留空（表示允许所有）

10. 点击 **Save policy**

---

## 第八步：验证配置

1. 回到终端，重启开发服务器：
   ```bash
   # 如果之前已运行，先停止（Ctrl+C）
   npm run dev
   ```

2. 打开浏览器访问 http://localhost:5173

3. 测试功能：
   - 点击 **成员** - 应该能看到 3 个默认成员
   - 点击 **支出** → **新增** - 添加一条记录
   - 点击 **概览** - 查看统计数据

---

## 常见问题

### Q: 显示 "加载失败，请检查 Supabase 配置"
A: 检查 `.env` 文件中的 URL 和 Key 是否正确，不要有多余的空格或引号

### Q: 添加支出时报错
A: 确保 SQL 脚本已正确执行，可以在 Supabase → Table Editor 查看是否有 `members`、`expenses`、`settlements` 三张表

### Q: 头像上传失败
A: 检查 Storage 中是否创建了 `avatars` 存储桶，并配置了公开访问策略

---

## 下一步：部署到 Vercel

配置完成后，可以将应用部署到 Vercel：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 添加环境变量（在 Vercel Dashboard 或命令行）
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

---

**完成！** 🎉 如果遇到问题，随时告诉我。
