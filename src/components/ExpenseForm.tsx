import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Expense, ExpenseForm, ExpenseCategory, Member } from '@/types'

const CATEGORIES: ExpenseCategory[] = ['水电费', '网费', '燃气费', '物业费', '其他']

interface ExpenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Member[]
  expense?: Expense | null
  onSubmit: (data: ExpenseForm) => void
  onDelete?: (id: string) => void
  isSubmitting?: boolean
  defaultPayerId?: string // 当前登录用户，用于自动填充
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  members,
  expense,
  onSubmit,
  onDelete,
  isSubmitting = false,
  defaultPayerId,
}: ExpenseFormDialogProps) {
  const [formData, setFormData] = useState<ExpenseForm>({
    amount: 0,
    category: '其他',
    description: '',
    payer_id: '',
    expense_date: format(new Date(), 'yyyy-MM-dd'),
  })

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: Number(expense.amount),
        category: expense.category,
        description: expense.description || '',
        payer_id: expense.payer_id,
        expense_date: expense.expense_date,
      })
    } else {
      setFormData({
        amount: 0,
        category: '其他',
        description: '',
        payer_id: defaultPayerId || members[0]?.id || '',
        expense_date: format(new Date(), 'yyyy-MM-dd'),
      })
    }
  }, [expense, members, open, defaultPayerId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.payer_id || formData.amount <= 0) return
    onSubmit(formData)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? '编辑支出' : '新增支出'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">金额 *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="输入金额"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">类别 *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 当选择"其他"时，显示带建议的备注字段 */}
          {formData.category === '其他' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">具体描述</Label>
                <span className="text-xs text-muted-foreground">建议填写</span>
              </div>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="如：买菜、打车、日用品..."
                className="border-amber-200 focus:border-amber-400"
              />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                💡 选择"其他"类别时，建议填写具体用途方便后续查看
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="payer_id">付款人 *</Label>
            <select
              id="payer_id"
              value={formData.payer_id}
              onChange={(e) => setFormData({ ...formData, payer_id: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">选择付款人</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense_date">日期 *</Label>
            <Input
              id="expense_date"
              type="date"
              value={formData.expense_date}
              onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
              required
            />
          </div>

          {/* 非其他类别时显示普通备注 */}
          {formData.category !== '其他' && (
            <div className="space-y-2">
              <Label htmlFor="description">备注</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="可选备注"
              />
            </div>
          )}

          <div className="flex justify-between pt-4">
            {expense && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(expense.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                删除
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
