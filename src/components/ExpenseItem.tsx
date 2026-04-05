import { format } from 'date-fns'
import { Pencil } from 'lucide-react'
import type { Expense, Member } from '@/types'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const CATEGORY_ICONS: Record<string, string> = {
  '水电费': '💡',
  '网费': '📶',
  '燃气费': '🔥',
  '物业费': '🏢',
  '其他': '📦',
}

interface ExpenseItemProps {
  expense: Expense & { payer: Member }
  onEdit: (expense: Expense) => void
}

export function ExpenseItem({ expense, onEdit }: ExpenseItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="text-2xl">
        {CATEGORY_ICONS[expense.category] || '📦'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{expense.category}</span>
          <span className="text-sm text-muted-foreground">
            {format(new Date(expense.expense_date), 'MM/dd')}
          </span>
        </div>
        {expense.description && (
          <p className="text-sm text-muted-foreground truncate">{expense.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          {expense.payer?.avatar_url ? (
            <AvatarImage src={expense.payer.avatar_url} />
          ) : null}
          <AvatarFallback className="text-xs">
            {expense.payer?.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-primary">
          ¥{Number(expense.amount).toFixed(2)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(expense)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
