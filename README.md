# 合租记账本

三人合租房子的费用分摊记账应用。

## 功能

- 📊 概览仪表盘 - 查看本月总支出和每人应付金额
- 💰 支出记录 - 增删改查支出
- 🧮 月度结算 - 按月结算，自动生成转账建议
- 👥 成员管理 - 修改姓名和上传头像

- 📱 移动端友好 - 响应式设计

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase (PostgreSQL)
- React Query

- React Router
- Recharts

## 快速开始

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 配置 Supabase

1. 访问 [supabase.com](https://supabase.com) 创建项目
2. 获取 \`SUPABASE_URL\` 和 \`SUPABASE_ANON_KEY\`
3. 在 SQL Editor 中执行 \`supabase/migrations/001_init.sql\`
4. 创建 \`avatars\` 存储桶（用于头像上传)

5. 配置环境变量:

\`\`\`bash
cp .env.example .env
# 编辑 .env 填入你的 Supabase 配置
\`\`\`

### 3. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

### 4. 构建生产版本

\`\`\`bash
npm run build
\`\`\`

## 鷻加到 Supabase 的环境变量

在 \`.env\` 文件中添加:

\`\`\`env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
\`\`\`

## 鷻加到 Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 设置环境变量 \`VITE_SUPABASE_URL\` 和 \`VITE_SUPABASE_ANON_KEY\`
4. 鷻加到部署

## 项目结构

\`\`\`
src/
├── components/     # UI 组件
│   ├── ui/          # shadcn/ui 组件
│   ├── ExpenseForm.tsx
│   ├── ExpenseItem.tsx
│   └── MemberCard.tsx
├── pages/          # 页面
│   ├── DashboardPage.tsx
│   ├── ExpensesPage.tsx
│   ├── MembersPage.tsx
│   └── SettlementPage.tsx
├── hooks/          # React Query hooks
│   ├── useExpenses.ts
│   ├── useMembers.ts
│   └── useSettlement.ts
├── lib/            # 工具库
│   ├── supabase.ts
│   └── utils.ts
├── types/          # TypeScript 类型
│   └── index.ts
└── App.tsx         # 应用入口
\`\`\`
