import { useState, useEffect } from 'react'
import type { Member } from '@/types'

const STORAGE_KEY = 'current_user_id'

export function useCurrentUser(members: Member[] | undefined) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY)
  })

  // 当成员列表变化时，验证当前用户是否仍然有效
  useEffect(() => {
    if (members && currentUserId) {
      const exists = members.some(m => m.id === currentUserId)
      if (!exists) {
        // 用户已被删除，清除登录状态
        localStorage.removeItem(STORAGE_KEY)
        setCurrentUserId(null)
      }
    }
  }, [members, currentUserId])

  const currentUser = members?.find(m => m.id === currentUserId)

  const login = (userId: string) => {
    localStorage.setItem(STORAGE_KEY, userId)
    setCurrentUserId(userId)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setCurrentUserId(null)
  }

  return {
    currentUser,
    currentUserId,
    login,
    logout,
    isLoggedIn: !!currentUserId,
  }
}
