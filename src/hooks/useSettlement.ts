import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Member, MemberBalance, TransferSuggestion, Settlement } from '@/types'

// 获取月度结算状态
export function useSettlement(month: string) {
  return useQuery({
    queryKey: ['settlement', month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settlements')
        .select('*')
        .eq('month', month)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data as Settlement | null
    },
  })
}

// 标记月度已结算
export function useMarkSettled() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (month: string) => {
      const { data, error } = await supabase
        .from('settlements')
        .upsert(
          {
            month,
            is_settled: true,
            settled_at: new Date().toISOString(),
          },
          { onConflict: 'month' }
        )
        .select()
        .single()

      if (error) throw error
      return data as Settlement
    },
    onSuccess: (_, month) => {
      queryClient.invalidateQueries({ queryKey: ['settlement', month] })
    },
  })
}

// 计算成员结算数据
export function useMonthlyBalance(month: string) {
  const { data: members } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase.from('members').select('*')
      if (error) throw error
      return data as Member[]
    },
  })

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('payer_id, amount')
        .eq('month', month)

      if (error) throw error
      return data
    },
  })

  if (isLoading || !members) {
    return { balances: [], total: 0, isLoading: true }
  }

  // 计算总支出
  const total = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0
  const perPerson = members.length > 0 ? total / members.length : 0

  // 计算每人数据
  const paidByMember: Record<string, number> = {}
  for (const expense of expenses || []) {
    paidByMember[expense.payer_id] = (paidByMember[expense.payer_id] || 0) + Number(expense.amount)
  }

  const balances: MemberBalance[] = members.map((member) => ({
    member,
    paid: paidByMember[member.id] || 0,
    shouldPay: perPerson,
    net: (paidByMember[member.id] || 0) - perPerson,
  }))

  return { balances, total, isLoading: false }
}

// 生成转账建议
export function generateTransferSuggestions(balances: MemberBalance[]): TransferSuggestion[] {
  const suggestions: TransferSuggestion[] = []

  // 复制 balances 避免修改原数组
  const balancesCopy = balances.map(b => ({ ...b, net: b.net }))

  // 分离应收和应付
  const receivers = balancesCopy.filter((b) => b.net > 0).sort((a, b) => b.net - a.net)
  const payers = balancesCopy.filter((b) => b.net < 0).sort((a, b) => a.net - b.net)

  let i = 0,
    j = 0
  while (i < payers.length && j < receivers.length) {
    const payer = payers[i]
    const receiver = receivers[j]
    const amount = Math.min(-payer.net, receiver.net)

    if (amount > 0.01) {
      suggestions.push({
        from: payer.member,
        to: receiver.member,
        amount: Math.round(amount * 100) / 100,
      })
    }

    payer.net += amount
    receiver.net -= amount

    if (Math.abs(payer.net) < 0.01) i++
    if (Math.abs(receiver.net) < 0.01) j++
  }

  return suggestions
}
