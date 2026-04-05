import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useUpdateMember, uploadAvatar } from '@/hooks/useMembers'
import type { Member } from '@/types'

interface MemberCardProps {
  member: Member
}

export function MemberCard({ member }: MemberCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState(member.name)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const updateMember = useUpdateMember()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    try {
      setUploading(true)
      let avatar_url = member.avatar_url

      if (avatarFile) {
        avatar_url = await uploadAvatar(avatarFile, member.id)
      }

      await updateMember.mutateAsync({
        id: member.id,
        name,
        avatar_url,
      })

      setEditOpen(false)
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (error) {
      console.error('更新失败:', error)
      alert('更新失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setEditOpen(open)
    if (!open) {
      setName(member.name)
      setAvatarFile(null)
      setAvatarPreview(null)
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-16 w-16">
            {member.avatar_url ? (
              <AvatarImage src={member.avatar_url} alt={member.name} />
            ) : null}
            <AvatarFallback className="text-lg">
              {member.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{member.name}</h3>
            <p className="text-sm text-muted-foreground">室友</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑成员</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                {avatarPreview || member.avatar_url ? (
                  <AvatarImage src={avatarPreview || member.avatar_url!} alt={name} />
                ) : null}
                <AvatarFallback className="text-2xl">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Label className="cursor-pointer">
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <span className="text-sm text-primary hover:underline">
                  更换头像
                </span>
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入姓名"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleSave} disabled={uploading || !name.trim()}>
                {uploading ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
