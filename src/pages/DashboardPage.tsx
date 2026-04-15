import { Link } from 'react-router-dom'
import { format, getDate } from 'date-fns'
import {
  ArrowUpRight,
  CreditCard,
  PieChart as PieChartIcon,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMembers } from '@/hooks/useMembers'
import { useExpenses } from '@/hooks/useExpenses'
import { useMonthlyBalance } from '@/hooks/useSettlement'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Expense, Member } from '@/types'

const CATEGORY_COLORS = ['#0f766e', '#f59e0b', '#2563eb', '#dc2626', '#7c3aed', '#4b5563']

function formatCurrency(value: number) {
  return `¥${value.toFixed(2)}`
}

function buildTrendData(expenses: Expense[]) {
  const dailyTotals = new Map<number, number>()

  for (const expense of expenses) {
    const day = getDate(new Date(expense.expense_date))
    dailyTotals.set(day, (dailyTotals.get(day) || 0) + Number(expense.amount))
  }

  return Array.from(dailyTotals.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([day, amount]) => ({
      day: `${day}日`,
      amount,
    }))
}

function buildCategoryData(expenses: Expense[]) {
  const categoryTotals = new Map<string, number>()

  for (const expense of expenses) {
    categoryTotals.set(
      expense.category,
      (categoryTotals.get(expense.category) || 0) + Number(expense.amount)
    )
  }

  return Array.from(categoryTotals.entries())
    .map(([name, value], index) => ({
      name,
      value,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
}

function buildMemberSpendingData(expenses: Expense[], members: Member[]) {
  const memberTotals = new Map<string, number>()

  for (const expense of expenses) {
    memberTotals.set(
      expense.payer_id,
      (memberTotals.get(expense.payer_id) || 0) + Number(expense.amount)
    )
  }

  return members
    .map((member) => ({
      id: member.id,
      name: member.name,
      amount: memberTotals.get(member.id) || 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function DashboardPage() {
  const currentMonth = format(new Date(), 'yyyy-MM')
  const { data: members } = useMembers()
  const { data: expenses, isLoading: expensesLoading } = useExpenses(currentMonth)
  const { balances, total, isLoading: balanceLoading } = useMonthlyBalance(currentMonth)

  const safeExpenses = expenses || []
  const safeMembers = members || []
  const recentExpenses = safeExpenses.slice(0, 5)
  const categoryData = buildCategoryData(safeExpenses)
  const trendData = buildTrendData(safeExpenses)
  const memberSpendingData = buildMemberSpendingData(safeExpenses, safeMembers)
  const topCategory = categoryData[0]
  const averageExpense = safeExpenses.length > 0 ? total / safeExpenses.length : 0
  const highestPayer = memberSpendingData[0]

  const getMember = (id: string): Member | undefined => {
    return safeMembers.find((m) => m.id === id)
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              本月总支出
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {balanceLoading ? '加载中...' : formatCurrency(total)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              共 {safeExpenses.length} 笔支出
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              笔均支出
              <CreditCard className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {balanceLoading ? '加载中...' : formatCurrency(averageExpense)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              用于判断日常开销是否偏高
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              支出最多分类
              <PieChartIcon className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="truncate text-2xl font-bold">
              {topCategory ? topCategory.name : '暂无数据'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {topCategory ? formatCurrency(topCategory.value) : '录入支出后显示'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              本月付款最多
              <Users className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="truncate text-2xl font-bold">
              {highestPayer && highestPayer.amount > 0 ? highestPayer.name : '暂无数据'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {highestPayer && highestPayer.amount > 0
                ? formatCurrency(highestPayer.amount)
                : '本月还没有有效付款'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>本月支出趋势</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <p className="py-24 text-center text-muted-foreground">加载中...</p>
            ) : trendData.length === 0 ? (
              <p className="py-24 text-center text-muted-foreground">本月暂无支出趋势数据</p>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `¥${value}`}
                    />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="#0f766e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>分类占比</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <p className="py-24 text-center text-muted-foreground">加载中...</p>
            ) : categoryData.length === 0 ? (
              <p className="py-24 text-center text-muted-foreground">本月暂无分类数据</p>
            ) : (
              <div className="space-y-4">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {categoryData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {categoryData.map((item) => {
                    const ratio = total > 0 ? (item.value / total) * 100 : 0
                    return (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {formatCurrency(item.value)} / {ratio.toFixed(0)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>成员付款排行</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {memberSpendingData.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">暂无成员付款数据</p>
            ) : (
              memberSpendingData.map((member, index) => {
                const share = total > 0 ? (member.amount / total) * 100 : 0
                return (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-muted-foreground">{index + 1}</span>
                        <span className="font-medium">{member.name}</span>
                      </div>
                      <span>{formatCurrency(member.amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${Math.max(share, member.amount > 0 ? 6 : 0)}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>成员结余</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {balances.map((b) => (
              <div
                key={b.member.id}
                className="rounded-xl border border-border/60 bg-background p-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {b.member.avatar_url && <AvatarImage src={b.member.avatar_url} />}
                    <AvatarFallback>{b.member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{b.member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      已付 {formatCurrency(b.paid)} / 应付 {formatCurrency(b.shouldPay)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">净额</span>
                  <span className={b.net >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {b.net >= 0 ? '+' : ''}
                    {formatCurrency(b.net)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>最近支出</CardTitle>
          <Link to="/expenses">
            <Button variant="ghost" size="sm">
              查看全部
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {expensesLoading ? (
            <p className="py-4 text-center text-muted-foreground">加载中...</p>
          ) : recentExpenses.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">暂无支出记录</p>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {expense.category} · {formatCurrency(Number(expense.amount))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getMember(expense.payer_id)?.name} · {expense.expense_date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link to="/expenses" className="flex-1">
          <Button className="w-full" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            记一笔
          </Button>
        </Link>
        <Link to="/settlement" className="flex-1">
          <Button variant="outline" className="w-full" size="lg">
            月度结算
          </Button>
        </Link>
      </div>
    </div>
  )
}
