import { useMembers } from '@/hooks/useMembers'
import { MemberCard } from '@/components/MemberCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MembersPage() {
  const { data: members, isLoading, error } = useMembers()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">加载失败，请检查 Supabase 配置</p>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👥 人员管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {members?.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-4">
        点击编辑按钮可修改姓名和头像
      </p>
    </div>
  )
}
