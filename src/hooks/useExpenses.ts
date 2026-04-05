import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Expense, ExpenseForm, Member } from '@/types'
import { format } from 'date-fns'

// 获取支出列表（含付款人信息）
export function useExpenses(month?: string) {
  return useQuery({
    queryKey: ['expenses', month],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select('*, payer:members(*)')
        .order('expense_date', { ascending: false })

      if (month) {
        query = query.eq('month', month)
      }

      const { data, error } = await query
      if (error) throw error
      return data as (Expense & { payer: Member })[]
    },
  })
}

// 新增支出
export function useAddExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (form: ExpenseForm) => {
      const month = format(new Date(form.expense_date), 'yyyy-MM')
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...form,
          month,
        })
        .select()
        .single()

      if (error) throw error
      return data as Expense
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

// 更新支出
export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...form }: Partial<ExpenseForm> & { id: string }) => {
      let updateData: Record<string, unknown> = { ...form }
      if (form.expense_date) {
        updateData.month = format(new Date(form.expense_date), 'yyyy-MM')
      }

      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Expense
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

// 删除支出
export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

// 获取支出总额（按成员分组）
export function useExpensesByMember(month: string) {
  return useQuery({
    queryKey: ['expenses-by-member', month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('payer_id, amount')
        .eq('month', month)

      if (error) throw error

      const byMember: Record<string, number> = {}
      let total = 0
      for (const expense of data) {
        const amount = Number(expense.amount)
        total += amount
        byMember[expense.payer_id] = (byMember[expense.payer_id] || 0) + amount
      }

      return { byMember, total }
    },
  })
}
