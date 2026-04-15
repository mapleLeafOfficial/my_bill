// 支出类别
export type ExpenseCategory = '水电费' | '网费' | '燃气费' | '物业费' | '其他'

// 人员
export interface Member {
  id: string
  name: string
  avatar_url: string | null
  created_at: string
}

// 支出记录
export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  description: string | null
  payer_id: string
  payer?: Member
  expense_date: string
  month: string // YYYY-MM 格式
  created_at: string
  updated_at: string
}

// 月度结算
export interface Settlement {
  id: string
  month: string
  total_amount: number
  is_settled: boolean
  settled_at: string | null
  created_at: string
}

// 新增支出表单
export interface ExpenseForm {
  amount: number
  category: ExpenseCategory
  description: string
  payer_id: string
  expense_date: string
}

// 成员净额（用于结算计算）
export interface MemberBalance {
  member: Member
  paid: number // 已付金额
  shouldPay: number // 应付金额（总额/3）
  net: number // 净额：paid - shouldPay，正数=应收，负数=应付
}

// 转账建议
export interface TransferSuggestion {
  from: Member
  to: Member
  amount: number
}

export type ShoppingNoteStatus = 'open' | 'claimed' | 'done'

export interface ShoppingNote {
  id: string
  item_name: string
  message: string | null
  created_by: string
  claimer_id: string | null
  status: ShoppingNoteStatus
  created_at: string
  updated_at: string
  creator?: Member
  claimer?: Member | null
}

export interface ShoppingNoteForm {
  item_name: string
  message: string
}
