import { useState } from 'react'
import { format, subMonths, addMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useMonthlyBalance, useSettlement, useMarkSettled, generateTransferSuggestions } from '@/hooks/useSettlement'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import type { MemberBalance } from '@/types'

export function SettlementPage() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const { balances, total, isLoading } = useMonthlyBalance(selectedMonth)
  const { data: settlement } = useSettlement(selectedMonth)
  const markSettled = useMarkSettled()

  const memberCount = balances.length
  const perPerson = memberCount > 0 ? total / memberCount : 0

  const suggestions = generateTransferSuggestions(balances)

  const goToPrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const prevMonth = subMonths(new Date(year, month - 1), 1)
    setSelectedMonth(format(prevMonth, 'yyyy-MM'))
  }

  const goToNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const nextMonth = addMonths(new Date(year, month - 1), 1)
    setSelectedMonth(format(nextMonth, 'yyyy-MM'))
  }

  const handleMarkSettled = () => {
    markSettled.mutate(selectedMonth)
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      {/* 月份选择器 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold">{selectedMonth}</h2>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 月度汇总 */}
      <Card>
        <CardHeader>
          <CardTitle>月度汇总</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-4">加载中...</p>
          ) : (
            <div className="space-y-4">
              <div className="text-center pb-4 border-b">
                <p className="text-sm text-muted-foreground">本月总支出</p>
                <p className="text-3xl font-bold text-primary">¥{total.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  每人应付 ¥{perPerson.toFixed(2)}
                </p>
              </div>

              {/* 每人情况 */}
              <div className="space-y-3">
                {balances.map((b) => (
                  <MemberBalanceCard key={b.member.id} balance={b} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 转账建议 */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>💡 转账建议</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {s.from.avatar_url && <AvatarImage src={s.from.avatar_url} />}
                      <AvatarFallback>{s.from.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{s.from.name}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">¥{s.amount.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.to.name}</span>
                    <Avatar className="h-8 w-8">
                      {s.to.avatar_url && <AvatarImage src={s.to.avatar_url} />}
                      <AvatarFallback>{s.to.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 结算状态 */}
      <Card>
        <CardContent className="py-4">
          {settlement?.is_settled ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span className="font-medium">
                已于 {format(settlement.settled_at!, 'yyyy-MM-dd')} 结算完成
              </span>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={handleMarkSettled}
              disabled={markSettled.isPending || total === 0}
            >
              {markSettled.isPending ? '处理中...' : '标记为已结算'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MemberBalanceCard({ balance }: { balance: MemberBalance }) {
  const netColor = balance.net >= 0 ? 'text-green-600' : balance.net < 0 ? 'text-red-600' : 'text-gray-600'

  const netText = balance.net >= 0 ? '应收' : balance.net < 0 ? '应付' : '已平'

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        {balance.member.avatar_url && (
          <AvatarImage src={balance.member.avatar_url} />
        )}
        <AvatarFallback>{balance.member.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-medium">{balance.member.name}</p>
        <p className="text-sm text-muted-foreground">
          已付 ¥{balance.paid.toFixed(2)}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-lg font-bold ${netColor}`}>
          {balance.net >= 0 ? '+' : ''}{balance.net.toFixed(2)}
        </p>
        <p className={`text-sm ${netColor}`}>{netText}</p>
      </div>
    </div>
  )
}
