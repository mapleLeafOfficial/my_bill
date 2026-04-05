import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Plus, TrendingUp } from 'lucide-react'
import { useMembers } from '@/hooks/useMembers'
import { useExpenses } from '@/hooks/useExpenses'
import { useMonthlyBalance } from '@/hooks/useSettlement'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Member } from '@/types'

export function DashboardPage() {
  const currentMonth = format(new Date(), 'yyyy-MM')
  const { data: members } = useMembers()
  const { data: expenses, isLoading: expensesLoading } = useExpenses(currentMonth)
  const { balances, total, isLoading: balanceLoading } = useMonthlyBalance(currentMonth)

  const recentExpenses = expenses?.slice(0, 5)
  const paidByMember: Record<string, number> = {}

  for (const expense of expenses || []) {
    paidByMember[expense.payer_id] = (paidByMember[expense.payer_id] || 0) + Number(expense.amount)
  }

  const getMember = (id: string): Member | undefined => {
    return members?.find((m) => m.id === id)
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      {/* 总支出卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            本月总支出
          </CardTitle>
        </CardHeader>
        <CardContent>
          {balanceLoading ? (
            <p className="text-2xl font-bold">加载中...</p>
          ) : (
            <p className="text-3xl font-bold text-primary">¥{total.toFixed(2)}</p>
          )}
        </CardContent>
      </Card>

      {/* 每人情况卡片 */}
      <div className="grid grid-cols-3 gap-4">
        {balances.map((b) => (
          <Card key={b.member.id}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  {b.member.avatar_url && <AvatarImage src={b.member.avatar_url} />}
                  <AvatarFallback>{b.member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{b.member.name}</p>
                  <p className="text-sm text-muted-foreground">
                    已付 ¥{b.paid.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">应付</span>
                  <span>¥{b.shouldPay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">净额</span>
                  <span className={b.net >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {b.net >= 0 ? '+' : ''}{b.net.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 最近支出 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            最近支出
          </CardTitle>
          <Link to="/expenses">
            <Button variant="ghost" size="sm">查看全部</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {expensesLoading ? (
            <p className="text-center text-muted-foreground py-4">加载中...</p>
          ) : !recentExpenses || recentExpenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">暂无支出记录</p>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {expense.category} - ¥{Number(expense.amount).toFixed(2)}
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

      {/* 快捷操作 */}
      <div className="flex gap-2">
        <Link to="/expenses" className="flex-1">
          <Button className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" />
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
