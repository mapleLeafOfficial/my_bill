import { useMemo, useState } from 'react'
import { Check, ClipboardList, Pencil, Plus, ShoppingBasket, Undo2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ShoppingNoteFormDialog } from '@/components/ShoppingNoteForm'
import { useMembers } from '@/hooks/useMembers'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import {
  useAddShoppingNote,
  useDeleteShoppingNote,
  useSetShoppingNoteStatus,
  useShoppingNotes,
  useUpdateShoppingNote,
} from '@/hooks/useShoppingNotes'
import type { ShoppingNote, ShoppingNoteForm } from '@/types'

export function NotesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<ShoppingNote | null>(null)

  const { data: members } = useMembers()
  const { currentUserId } = useCurrentUser(members)
  const { data: notes, isLoading, error } = useShoppingNotes()
  const addNote = useAddShoppingNote()
  const updateNote = useUpdateShoppingNote()
  const deleteNote = useDeleteShoppingNote()
  const setStatus = useSetShoppingNoteStatus()

  const activeNotes = useMemo(
    () => (notes || []).filter((note) => note.status !== 'done'),
    [notes]
  )
  const completedNotes = useMemo(
    () => (notes || []).filter((note) => note.status === 'done'),
    [notes]
  )

  const handleAdd = () => {
    setEditingNote(null)
    setDialogOpen(true)
  }

  const handleEdit = (note: ShoppingNote) => {
    setEditingNote(note)
    setDialogOpen(true)
  }

  const handleSubmit = (data: ShoppingNoteForm) => {
    if (!currentUserId && !editingNote) {
      alert('请先切换当前用户，再添加提醒')
      return
    }

    if (editingNote) {
      updateNote.mutate(
        { id: editingNote.id, ...data },
        { onSuccess: () => setDialogOpen(false) }
      )
      return
    }

    addNote.mutate(
      { ...data, created_by: currentUserId! },
      { onSuccess: () => setDialogOpen(false) }
    )
  }

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这条待购提醒吗？')) return
    deleteNote.mutate(id, {
      onSuccess: () => setDialogOpen(false),
    })
  }

  const handleClaim = (note: ShoppingNote) => {
    if (!currentUserId) {
      alert('请先切换当前用户，再认领提醒')
      return
    }

    setStatus.mutate({
      id: note.id,
      status: 'claimed',
      claimer_id: currentUserId,
    })
  }

  const handleCancelClaim = (note: ShoppingNote) => {
    setStatus.mutate({
      id: note.id,
      status: 'open',
      claimer_id: null,
    })
  }

  const handleDone = (note: ShoppingNote) => {
    setStatus.mutate({
      id: note.id,
      status: 'done',
      claimer_id: note.claimer_id,
    })
  }

  const isSubmitting =
    addNote.isPending || updateNote.isPending || deleteNote.isPending || setStatus.isPending

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            待购提醒
          </CardTitle>
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            新增
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">待处理</p>
              <p className="text-2xl font-bold">{activeNotes.length}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">已买好</p>
              <p className="text-2xl font-bold">{completedNotes.length}</p>
            </div>
          </div>

          {isLoading && (
            <p className="py-8 text-center text-muted-foreground">加载中...</p>
          )}
          {error && (
            <p className="py-8 text-center text-destructive">待购提醒加载失败</p>
          )}
          {!isLoading && !error && activeNotes.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              现在没有待买的东西，可以点击右上角新增提醒
            </div>
          )}

          <div className="space-y-3">
            {activeNotes.map((note) => {
              const isClaimedByCurrentUser = !!currentUserId && note.claimer_id === currentUserId
              const canEdit = !!currentUserId && note.created_by === currentUserId

              return (
                <div
                  key={note.id}
                  className="rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {note.status === 'open' ? '待认领' : '已认领'}
                        </span>
                        <h3 className="truncate font-semibold">{note.item_name}</h3>
                      </div>
                      {note.message && (
                        <p className="mt-2 text-sm text-muted-foreground">{note.message}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            {note.creator?.avatar_url && <AvatarImage src={note.creator.avatar_url} />}
                            <AvatarFallback className="text-xs">
                              {note.creator?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span>发起人：{note.creator?.name || '未知成员'}</span>
                        </div>
                        {note.claimer && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              {note.claimer.avatar_url && <AvatarImage src={note.claimer.avatar_url} />}
                              <AvatarFallback className="text-xs">
                                {note.claimer.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>认领人：{note.claimer.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(note)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {note.status === 'open' && (
                      <Button
                        size="sm"
                        onClick={() => handleClaim(note)}
                        disabled={setStatus.isPending}
                      >
                        <ShoppingBasket className="mr-1 h-4 w-4" />
                        我去买
                      </Button>
                    )}

                    {note.status === 'claimed' && isClaimedByCurrentUser && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleDone(note)}
                          disabled={setStatus.isPending}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          已买好
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelClaim(note)}
                          disabled={setStatus.isPending}
                        >
                          <Undo2 className="mr-1 h-4 w-4" />
                          取消认领
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {completedNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>已完成</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedNotes.map((note) => (
              <div key={note.id} className="rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{note.item_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {note.claimer?.name || '有人'} 已买好
                    </p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    已完成
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-center text-sm text-muted-foreground">
        用来提醒室友还缺什么，谁方便谁就认领去买
      </p>

      <ShoppingNoteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        note={editingNote}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
