import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpenseFormDialog } from '@/components/ExpenseForm'
import { ExpenseItem } from '@/components/ExpenseItem'
import { useMembers } from '@/hooks/useMembers'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useExpenses, useAddExpense, useUpdateExpense, useDeleteExpense } from '@/hooks/useExpenses'
import type { Expense, ExpenseForm } from '@/types'

export function ExpensesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const { data: members } = useMembers()
  const { currentUserId } = useCurrentUser(members)
  const { data: expenses, isLoading, error } = useExpenses()
  const addExpense = useAddExpense()
  const updateExpense = useUpdateExpense()
  const deleteExpense = useDeleteExpense()

  const handleAdd = () => {
    setEditingExpense(null)
    setDialogOpen(true)
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setDialogOpen(true)
  }

  const handleSubmit = (data: ExpenseForm) => {
    if (editingExpense) {
      updateExpense.mutate({ id: editingExpense.id, ...data }, {
        onSuccess: () => setDialogOpen(false),
      })
    } else {
      addExpense.mutate(data, {
        onSuccess: () => setDialogOpen(false),
      })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条支出记录吗？')) {
      deleteExpense.mutate(id, {
        onSuccess: () => setDialogOpen(false),
      })
    }
  }

  const isSubmitting = addExpense.isPending || updateExpense.isPending

  // 按月份分组
  const groupedExpenses = expenses?.reduce((acc, expense) => {
    const month = expense.month
    if (!acc[month]) acc[month] = []
    acc[month].push(expense)
    return acc
  }, {} as Record<string, typeof expenses>)

  // 月份排序（最新在前）
  const sortedMonths = groupedExpenses ? Object.keys(groupedExpenses).sort().reverse() : []

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            💰 支出记录
          </CardTitle>
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            新增
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-center text-muted-foreground py-8">加载中...</p>
          )}
          {error && (
            <p className="text-center text-destructive py-8">加载失败</p>
          )}
          {expenses?.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              暂无支出记录，点击上方"新增"添加
            </p>
          )}
          <div className="space-y-6">
            {sortedMonths.map((month) => (
              <div key={month}>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2 sticky top-0 bg-background py-1">
                  {month}
                </h3>
                <div className="space-y-2">
                  {groupedExpenses![month].map((expense) => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        members={members || []}
        expense={editingExpense}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
        defaultPayerId={currentUserId || undefined}
      />
    </div>
  )
}
