import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Member } from '@/types'

// 获取所有成员
export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as Member[]
    },
  })
}

// 更新成员信息
export function useUpdateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name, avatar_url }: Partial<Member> & { id: string }) => {
      const { data, error } = await supabase
        .from('members')
        .update({ name, avatar_url })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Member
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}

// 上传头像到 Supabase Storage
export async function uploadAvatar(file: File, memberId: string): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${memberId}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
  return data.publicUrl
}
