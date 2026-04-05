# Todo3：支出记录 CRUD

## 基本信息

- **对应 PRD 模块**：M1
- **优先级**：P0
- **预估工作量**：12 个文件
- **依赖**：todo1、todo2 需先完成
- **状态**：✅ 已完成

---

## 目标描述

实现支出记录的完整增删改查功能，包括新增支出（必填：金额、类别、日期、付款人）、支出列表展示、编辑和删除。

---

## 任务清单

### 前端组件

- [ ] **创建支出列表页面**：`src/pages/ExpensesPage.tsx`
- [ ] **创建新增/编辑支出表单**：`src/components/ExpenseForm.tsx`
- [ ] **创建支出列表项组件**：`src/components/ExpenseItem.tsx`
- [ ] **创建类别选择器**：`src/components/CategorySelect.tsx`
- [ ] **创建付款人选择器**：`src/components/PayerSelect.tsx`

### 自定义 Hooks

- [ ] **创建支出数据 hooks**：`src/hooks/useExpenses.ts`
  - useExpenses(month?) - 获取支出列表
  - useAddExpense() - 新增支出
  - useUpdateExpense() - 更新支出
  - useDeleteExpense() - 删除支出

### 功能实现

- [ ] **新增支出弹窗**：点击按钮弹出表单
- [ ] **表单验证**：金额、类别、日期、付款人为必填
- [ ] **列表展示**：按日期倒序排列
- [ ] **编辑功能**：点击编辑按钮弹出表单，预填数据
- [ ] **删除功能**：点击删除按钮，确认后删除
- [ ] **月份筛选**：支持按月份筛选支出

### 路由

- [ ] **注册路由**：`/expenses` 支出列表页

---

## 涉及的文件

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新增 | `src/pages/ExpensesPage.tsx` | 支出列表页面 |
| 新增 | `src/components/ExpenseForm.tsx` | 支出表单组件 |
| 新增 | `src/components/ExpenseItem.tsx` | 支出列表项 |
| 新增 | `src/components/CategorySelect.tsx` | 类别选择器 |
| 新增 | `src/components/PayerSelect.tsx` | 付款人选择器 |
| 新增 | `src/hooks/useExpenses.ts` | 支出数据 hooks |
| 修改 | `src/App.tsx` | 添加路由 |

---

## 验证标准

- [ ] 可以新增支出记录，必填项验证正常
- [ ] 支出列表正确展示，按日期排序
- [ ] 可以编辑已有支出记录
- [ ] 可以删除支出记录（有确认提示）
- [ ] 月份筛选功能正常

---

## 备注

新增支出时自动计算 `month` 字段（从 expense_date 提取 YYYY-MM）。
