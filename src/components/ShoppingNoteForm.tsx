import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ShoppingNote, ShoppingNoteForm } from '@/types'

interface ShoppingNoteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: ShoppingNote | null
  onSubmit: (data: ShoppingNoteForm) => void
  onDelete?: (id: string) => void
  isSubmitting?: boolean
}

export function ShoppingNoteFormDialog({
  open,
  onOpenChange,
  note,
  onSubmit,
  onDelete,
  isSubmitting = false,
}: ShoppingNoteFormDialogProps) {
  const [formData, setFormData] = useState<ShoppingNoteForm>({
    item_name: '',
    message: '',
  })

  useEffect(() => {
    if (note) {
      setFormData({
        item_name: note.item_name,
        message: note.message || '',
      })
    } else {
      setFormData({
        item_name: '',
        message: '',
      })
    }
  }, [note, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.item_name.trim()) return
    onSubmit({
      item_name: formData.item_name.trim(),
      message: formData.message.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{note ? '编辑待购提醒' : '新增待购提醒'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item_name">缺少什么 *</Label>
            <Input
              id="item_name"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              placeholder="例如：纸巾、垃圾袋、洗衣液"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">补充备注</Label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="例如：快没了，谁方便顺手买一下"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex justify-between pt-4">
            {note && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(note.id)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                删除
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
