# Todo4：概览仪表盘 + 月度结算

## 基本信息

- **对应 PRD 模块**：M2、M3
- **优先级**：P0
- **预估工作量**：10 个文件
- **依赖**：todo1、todo2、todo3 需先完成
- **状态**：✅ 已完成

---

## 目标描述

实现首页概览仪表盘，展示当前月份总支出、每人应付/已付金额、结算状态。实现月度结算功能，支持月份切换、查看月度明细、生成结算建议、标记已结算。

---

## 任务清单

### 概览仪表盘（首页）

- [ ] **创建首页**：`src/pages/DashboardPage.tsx`
- [ ] **创建统计卡片组件**：`src/components/StatCard.tsx`
- [ ] **创建结算状态组件**：`src/components/SettlementStatus.tsx`
- [ ] **创建最近支出组件**：`src/components/RecentExpenses.tsx`

### 月度结算

- [ ] **创建月度结算页面**：`src/pages/SettlementPage.tsx`
- [ ] **创建月份选择器**：`src/components/MonthPicker.tsx`
- [ ] **创建结算建议组件**：`src/components/SettlementSuggestion.tsx`

### 自定义 Hooks

- [ ] **创建结算 hooks**：`src/hooks/useSettlement.ts`
  - useMonthlySummary(month) - 获取月度汇总
  - useSettlement(month) - 获取/更新结算状态
  - useMarkSettled(month) - 标记已结算

### 计算逻辑

- [ ] **实现结算计算**：
  - 总支出 / 3 = 每人应付
  - 每人已付 - 每人应付 = 净额（正数=应收，负数=应付）
  - 生成转账建议：谁应该给谁多少钱

### 路由

- [ ] **注册路由**：`/` 首页，`/settlement` 结算页

---

## 涉及的文件

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新增 | `src/pages/DashboardPage.tsx` | 首页仪表盘 |
| 新增 | `src/pages/SettlementPage.tsx` | 月度结算页 |
| 新增 | `src/components/StatCard.tsx` | 统计卡片 |
| 新增 | `src/components/SettlementStatus.tsx` | 结算状态 |
| 新增 | `src/components/RecentExpenses.tsx` | 最近支出 |
| 新增 | `src/components/MonthPicker.tsx` | 月份选择器 |
| 新增 | `src/components/SettlementSuggestion.tsx` | 结算建议 |
| 新增 | `src/hooks/useSettlement.ts` | 结算 hooks |
| 修改 | `src/App.tsx` | 添加路由 |

---

## 验证标准

- [ ] 首页展示当前月份总支出
- [ ] 首页展示每人已付/应付金额
- [ ] 首页展示最近 5 笔支出
- [ ] 结算页可切换月份
- [ ] 结算页展示正确的转账建议
- [ ] 可以标记月度已结算

---

## 结算计算示例

假设：
- A 付了 600 元
- B 付了 300 元
- C 付了 0 元
- 总计 900 元，每人应付 300 元

结果：
- A 净额 = 600 - 300 = +300（应收 300）
- B 净额 = 300 - 300 = 0（已平）
- C 净额 = 0 - 300 = -300（应付 300）

转账建议：C → A 转账 300 元

---

## 备注

结算状态存储在 settlements 表，每月一条记录。
