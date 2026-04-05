# Todo5：布局优化 + 导航 + 部署

## 基本信息

- **对应 PRD 模块**：M5（部分）、基础设施
- **优先级**：P1
- **预估工作量**：6 个文件
- **依赖**：todo1 ~ todo4 需先完成
- **状态**：✅ 已完成

---

## 目标描述

完善应用布局和导航，添加数据统计图表（可选），配置部署到 Vercel。

---

## 任务清单

### 布局和导航

- [ ] **创建布局组件**：`src/components/Layout.tsx`
- [ ] **创建导航栏组件**：`src/components/Navbar.tsx`
- [ ] **添加底部导航**（移动端友好）

### 数据统计（可选）

- [ ] **创建统计页面**：`src/pages/StatsPage.tsx`
- [ ] **添加类别占比饼图**
- [ ] **添加月度趋势折线图**

### 部署配置

- [ ] **配置 Vercel 部署**
- [ ] **设置环境变量**：SUPABASE_URL、SUPABASE_ANON_KEY
- [ ] **测试生产环境**

---

## 涉及的文件

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新增 | `src/components/Layout.tsx` | 布局组件 |
| 新增 | `src/components/Navbar.tsx` | 导航栏 |
| 新增 | `src/pages/StatsPage.tsx` | 统计页面（可选） |
| 新增 | `vercel.json` | Vercel 配置 |
| 修改 | `src/App.tsx` | 使用布局组件 |

---

## 验证标准

- [ ] 导航正常工作，页面切换流畅
- [ ] 移动端显示正常
- [ ] 部署成功，可通过公网访问

---

## 备注

使用 Recharts 实现图表，shadcn/ui 的 Sheet 组件实现移动端抽屉导航。
