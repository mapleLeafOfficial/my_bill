# 合租记账本 — 开发计划

## 项目概述

三人合租费用分摊记账 Web 应用

**技术栈**：React + Vite + TypeScript + Tailwind + shadcn/ui + Supabase

---

## 开发进度

| Todo | 模块 | 状态 | 说明 |
|------|------|------|------|
| [todo1](todo1.md) | 项目初始化 + Supabase 配置 | ✅ 已完成 | 创建项目、数据库表 |
| [todo2](todo2.md) | 人员管理 | ✅ 已完成 | 成员姓名、头像管理 |
| [todo3](todo3.md) | 支出记录 CRUD | ✅ 已完成 | 增删改查支出 |
| [todo4](todo4.md) | 概览仪表盘 + 月度结算 | ✅ 已完成 | 首页统计、结算计算 |
| [todo5](todo5.md) | 布局优化 + 部署 | ✅ 已完成 | 导航、图表、部署 |

---

## 依赖关系

```
todo1 (初始化)
  └─→ todo2 (人员管理)
        └─→ todo3 (支出记录)
              └─→ todo4 (概览+结算)
                    └─→ todo5 (优化+部署)
```

---

## 当前状态

**正在进行**：无

**下一步**：项目已完成，准备部署

---

## 快速开始（todo1 完成后）

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 Supabase 配置

# 启动开发服务器
npm run dev
```

---

## Supabase 配置

1. 访问 [supabase.com](https://supabase.com) 创建项目
2. 获取 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
3. 在 SQL Editor 中执行 `supabase/migrations/001_init.sql`
4. 创建 `avatars` 存储桶（用于头像上传）
